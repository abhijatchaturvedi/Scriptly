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
  const replacement = heuristicRewrite(request.text, request.taskType);

  return {
    id: request.id,
    languageDetected: detectLanguage(request.text),
    intent: request.taskType,
    output: replacement,
    explanation: `No enabled provider succeeded. ${errors.join("; ")}`,
    suggestions: [
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

  return value;
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
