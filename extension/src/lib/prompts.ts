import type { AiTaskRequest } from "./types";

type Prompt = {
  system: string;
  user: string;
};

const schema = `Return only JSON:
{
  "languageDetected": "indian_english|hindi|hinglish|english|mixed",
  "intent": "short intent label",
  "output": "best final text when applicable",
  "explanation": "short optional explanation",
  "suggestions": [
    {
      "id": "stable id",
      "original": "original phrase",
      "replacement": "replacement phrase",
      "category": "grammar|tone|clarity|hinglish|rewrite",
      "confidence": 0.0,
      "explanation": "brief reason"
    }
  ],
  "tone": {
    "professionalism": 0,
    "politeness": 0,
    "confidence": 0,
    "empathy": 0,
    "aggression": 0,
    "emotionalIntensity": 0,
    "passiveAggressiveness": 0,
    "riskFlags": []
  }
}`;

export function buildPrompt(request: AiTaskRequest): Prompt {
  const system = [
    "You are Scriptly, an AI writing assistant for Indian English, Hindi, and Hinglish.",
    "You understand Indian corporate phrasing, transliterated Hindi, code-switching, audience, relationship, and platform context.",
    "Preserve meaning and emotional intent. Do not invent facts.",
    "Avoid making Indian users sound artificially Western or overly formal unless requested.",
    "Return valid JSON only."
  ].join(" ");

  const task = taskInstruction(request);
  const context = JSON.stringify(
    {
      taskType: request.taskType,
      mode: request.mode,
      audience: request.audience ?? request.context.audience,
      outputLanguage: request.outputLanguage ?? "auto",
      platform: request.context.platform,
      relationship: request.context.relationship,
      surroundingText: request.context.surroundingText
    },
    null,
    2
  );

  return {
    system,
    user: `${task}

Context:
${context}

Text:
${request.text}

${schema}`
  };
}

function taskInstruction(request: AiTaskRequest): string {
  switch (request.taskType) {
    case "grammar_correction":
      return "Correct grammar, spelling, punctuation, awkward phrasing, and Indian English issues. Keep changes minimal unless clarity requires more.";
    case "rewrite":
      return `Rewrite for ${request.mode ?? "professional"} tone. Improve clarity, impact, and context-fit.`;
    case "tone_analysis":
      return "Analyze emotional tone, professionalism, confidence, politeness, aggression, empathy, emotional intensity, and passive-aggressiveness. Suggest safer alternatives for risky phrases.";
    case "hinglish_transform":
      return "Handle Hindi-English code-switching. Convert between Hinglish, Hindi, and English according to outputLanguage and mode while preserving warmth and cultural nuance.";
    case "humanize":
      return "Make the text sound naturally human. Reduce AI-sounding repetition, generic transitions, and robotic sentence rhythm.";
    case "smart_reply":
      return "Generate a context-aware reply in the requested mode. Keep it practical and suitable for the platform.";
    case "resume_optimize":
      return "Improve resume or LinkedIn wording. Use stronger action verbs, quantify impact where supported, and avoid inventing metrics.";
    case "prompt_enhance":
      return "Improve this AI prompt for clarity, context, constraints, output format, and success criteria. Do not answer the prompt.";
    case "summarize":
      return "Summarize clearly and preserve action items, decisions, dates, and names.";
    default:
      return "Improve the text while preserving meaning.";
  }
}
