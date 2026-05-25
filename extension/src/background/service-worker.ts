import type { AiTaskRequest, AiTaskResponse } from "../lib/types";
import { callProvider, testProviderConnection } from "../lib/providers";
import { resolveProviderRoute } from "../lib/router";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scriptly-rewrite",
    title: "Rewrite with Scriptly",
    contexts: ["selection", "editable"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "scriptly-rewrite" || !tab?.id) {
    return;
  }

  chrome.sidePanel.open({ tabId: tab.id }).catch(() => undefined);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "SCRIPTLY_PROVIDER_HEALTH_CHECK") {
    testConfiguredProvider(message.providerId)
      .then(sendResponse)
      .catch((error: unknown) => {
        sendResponse({ status: "degraded", errorCode: error instanceof Error ? error.message : "unknown_error" });
      });

    return true;
  }

  if (message?.type !== "SCRIPTLY_AI_TASK") {
    return false;
  }

  handleAiTask(message.payload)
    .then(sendResponse)
    .catch((error: unknown) => {
      sendResponse({
        id: message.payload.id,
        suggestions: [],
        tone: undefined,
        error: error instanceof Error ? error.message : "Unknown Scriptly error"
      });
    });

  return true;
});

async function handleAiTask(request: AiTaskRequest): Promise<AiTaskResponse> {
  const routes = await resolveProviderRoute(request);
  const errors: string[] = [];

  for (const config of routes) {
    try {
      return await callProvider(request, config);
    } catch (error) {
      errors.push(`${config.providerId}: ${error instanceof Error ? error.message : "unknown_error"}`);
    }
  }

  return localFallback(request, errors);
}

async function testConfiguredProvider(providerId: string) {
  const routes = await resolveProviderRoute({
    id: crypto.randomUUID(),
    taskType: "grammar_correction",
    text: "I am having one doubt.",
    context: { platform: "generic", editorKind: "textarea" }
  });
  const config = routes.find((route) => route.providerId === providerId) ?? routes[0];
  if (!config) throw new Error("provider_not_enabled");
  return testProviderConnection(config);
}

function localFallback(request: AiTaskRequest, errors: string[]): AiTaskResponse {
  const suggestions = buildLocalSuggestions(request.text, request.taskType);
  const replacement = suggestions.length > 0
    ? applyLocalSuggestions(request.text, suggestions)
    : heuristicRewrite(request.text, request.taskType);

  return {
    id: request.id,
    languageDetected: detectLanguage(request.text),
    intent: request.taskType,
    output: replacement,
    explanation: `No enabled provider succeeded. ${errors.join("; ")}`,
    suggestions: suggestions.length > 0 ? suggestions : [
      {
        id: crypto.randomUUID(),
        original: request.text,
        replacement,
        category: request.taskType === "grammar_correction" ? "grammar" : "rewrite",
        confidence: 0.35,
        explanation: "Local fallback applied. Add an API key for higher-quality AI suggestions."
      }
    ],
    tone: request.taskType === "tone_analysis" ? scoreTone(request.text) : undefined
  };
}

function buildLocalSuggestions(text: string, taskType: AiTaskRequest["taskType"]): AiTaskResponse["suggestions"] {
  const rules: Array<{
    pattern: RegExp;
    replacement: string;
    category: "grammar" | "tone" | "clarity" | "hinglish" | "rewrite";
    explanation: string;
  }> = [
    {
      pattern: /\bI am having one doubt\b/gi,
      replacement: "I have a question",
      category: "clarity",
      explanation: "This sounds more natural and professional."
    },
    {
      pattern: /\bdidn't got\b/gi,
      replacement: "didn't get",
      category: "grammar",
      explanation: "Use the base verb after 'did'."
    },
    {
      pattern: /\brevert back\b/gi,
      replacement: "respond",
      category: "clarity",
      explanation: "'Revert back' is redundant. 'Respond' is clearer."
    },
    {
      pattern: /\bdo the needful\b/gi,
      replacement: "take the required action",
      category: "clarity",
      explanation: "A specific action request is clearer."
    },
    {
      pattern: /\bprepone\b/gi,
      replacement: "move earlier",
      category: "clarity",
      explanation: "Use 'move earlier' for broader professional clarity."
    },
    {
      pattern: /\bSend me this ASAP\b/gi,
      replacement: "Could you please send this at the earliest?",
      category: "tone",
      explanation: "This keeps urgency while sounding more polite."
    },
    {
      pattern: /\bi need leave for two days\b/gi,
      replacement: "I need to take leave for two days",
      category: "grammar",
      explanation: "Adds the missing infinitive phrase and capitalizes the sentence naturally."
    },
    {
      pattern: /\bi need leave\b/gi,
      replacement: "I need to take leave",
      category: "grammar",
      explanation: "Use 'need to take leave' for natural professional English."
    },
    {
      pattern: /\bdear sir,\s*i need to take leave for two days\b/gi,
      replacement: "Dear Sir,\nI need to take leave for two days.",
      category: "rewrite",
      explanation: "Capitalizes the greeting and turns the request into a complete sentence."
    },
    {
      pattern: /\bdear sir,\s*i need leave for two days\b/gi,
      replacement: "Dear Sir,\nI need to take leave for two days.",
      category: "rewrite",
      explanation: "Makes the leave request grammatically correct and professional."
    }
  ];

  if (taskType === "hinglish_transform" || /\b(kal|bhai|ye|hai|kar|karna|thoda|PPT)\b/i.test(text)) {
    rules.push(
      {
        pattern: /\bKal client call hai\b/gi,
        replacement: "There is a client call tomorrow",
        category: "hinglish",
        explanation: "Converts natural Hinglish into professional English."
      },
      {
        pattern: /\bye mail thoda professional bana do\b/gi,
        replacement: "Please make this email more professional",
        category: "hinglish",
        explanation: "Converts Hinglish intent into clear English."
      },
      {
        pattern: /\bbhai please check kar lena\b/gi,
        replacement: "Please check this when you get a chance",
        category: "hinglish",
        explanation: "Preserves the request while making it workplace-friendly."
      }
    );
  }

  const suggestions: AiTaskResponse["suggestions"] = [];

  for (const rule of rules) {
    const matches = text.match(rule.pattern);
    if (!matches) continue;

    for (const original of matches) {
      suggestions.push({
        id: crypto.randomUUID(),
        original,
        replacement: original.replace(rule.pattern, rule.replacement),
        category: rule.category,
        confidence: 0.78,
        explanation: rule.explanation
      });
    }
  }

  if (taskType === "rewrite" && suggestions.length > 0) {
    const polished = polishLocalRewrite(applyLocalSuggestions(text, suggestions));
    return [
      {
        id: crypto.randomUUID(),
        original: text,
        replacement: polished,
        category: "rewrite",
        confidence: 0.72,
        explanation: "Local rewrite using Scriptly's Indian English and Hinglish rules."
      },
      ...suggestions
    ];
  }

  return suggestions;
}

function applyLocalSuggestions(text: string, suggestions: AiTaskResponse["suggestions"]): string {
  return suggestions.reduce((value, suggestion) => {
    if (suggestion.original === text) return suggestion.replacement;
    return value.replace(suggestion.original, suggestion.replacement);
  }, text);
}

function heuristicRewrite(text: string, taskType: AiTaskRequest["taskType"]): string {
  let value = text
    .replace(/\brevert back\b/gi, "respond")
    .replace(/\bdidn't got\b/gi, "didn't get")
    .replace(/\bI am having one doubt\b/gi, "I have a question")
    .replace(/\bdo the needful\b/gi, "take the required action")
    .replace(/\bprepone\b/gi, "move earlier");

  if (taskType === "hinglish_transform") {
    value = value
      .replace(/\bkal\b/gi, "tomorrow")
      .replace(/\bye\b/gi, "this")
      .replace(/\bthoda\b/gi, "a little")
      .replace(/\bbhai\b/gi, "hey");
  }

  if (taskType === "rewrite" && value === text) {
    value = polishLocalRewrite(text.replace(/\basap\b/gi, "at the earliest"));
  }

  return value;
}

function polishLocalRewrite(text: string): string {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const polished = lines.map((line) => {
    let value = line
      .replace(/^dear sir,?$/i, "Dear Sir,")
      .replace(/^dear madam,?$/i, "Dear Madam,")
      .replace(/^i\b/, "I")
      .replace(/\bi need leave\b/gi, "I need to take leave");

    if (!/[,.!?]$/.test(value) && !value.endsWith(",")) {
      value += ".";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  });

  return polished.join("\n");
}

function detectLanguage(text: string): string {
  if (/[अ-ह]/.test(text)) return "hindi";
  if (/\b(kal|bhai|ye|hai|kar|karna|thoda|matlab)\b/i.test(text)) return "hinglish";
  return "indian_english";
}

function scoreTone(text: string): AiTaskResponse["tone"] {
  const demanding = /\basap|immediately|urgent|send me\b/i.test(text);
  const polite = /\bplease|could you|kindly|thanks\b/i.test(text);

  return {
    professionalism: demanding ? 62 : 82,
    politeness: polite ? 84 : 58,
    confidence: 72,
    empathy: polite ? 78 : 52,
    aggression: demanding ? 42 : 12,
    emotionalIntensity: demanding ? 64 : 30,
    passiveAggressiveness: /\bas per my last|as already told\b/i.test(text) ? 70 : 10,
    riskFlags: demanding ? ["Message may sound too direct for a professional context."] : []
  };
}
