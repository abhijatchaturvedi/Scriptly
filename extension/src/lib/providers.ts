import { buildPrompt } from "./prompts";
import { getProviderSecret } from "./secure-storage";
import type { AiTaskRequest, AiTaskResponse, ProviderConfig, ProviderHealth, ProviderId } from "./types";

export interface AiProvider {
  id: ProviderId;
  displayName: string;
  testConnection(config: ProviderConfig): Promise<ProviderHealth>;
  complete(request: AiTaskRequest, config: ProviderConfig): Promise<AiTaskResponse>;
}

export const providerLabels: Record<ProviderId, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Google Gemini",
  groq: "Groq",
  openrouter: "OpenRouter",
  deepseek: "DeepSeek",
  together: "Together AI",
  ollama_compatible: "Ollama-compatible",
  openai_compatible: "Custom OpenAI-compatible"
};

export async function callProvider(request: AiTaskRequest, config: ProviderConfig): Promise<AiTaskResponse> {
  const apiKey = await readApiKey(config);

  if (config.providerId === "anthropic") {
    return callAnthropic(request, config, apiKey);
  }

  if (config.providerId === "gemini") {
    return callGemini(request, config, apiKey);
  }

  return callOpenAiCompatible(request, config, apiKey);
}

export async function testProviderConnection(config: ProviderConfig): Promise<ProviderHealth> {
  const started = performance.now();

  try {
    await callProvider(
      {
        id: crypto.randomUUID(),
        taskType: "grammar_correction",
        text: "I am having one doubt.",
        context: { platform: "generic", editorKind: "textarea" }
      },
      { ...config, temperature: 0 }
    );

    return {
      providerId: config.providerId,
      status: "healthy",
      latencyMs: Math.round(performance.now() - started),
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      providerId: config.providerId,
      status: isAuthError(error) ? "auth_failed" : "degraded",
      latencyMs: Math.round(performance.now() - started),
      checkedAt: new Date().toISOString(),
      errorCode: error instanceof Error ? error.message : "unknown_error"
    };
  }
}

async function readApiKey(config: ProviderConfig): Promise<string> {
  const secret = await getProviderSecret(config.providerId);
  if (!secret?.encryptedValue && config.providerId !== "ollama_compatible") {
    throw new Error(`Missing API key for ${providerLabels[config.providerId]}`);
  }

  return secret?.encryptedValue ?? "";
}

async function callOpenAiCompatible(
  request: AiTaskRequest,
  config: ProviderConfig,
  apiKey: string
): Promise<AiTaskResponse> {
  const endpoint = `${baseUrlFor(config).replace(/\/$/, "")}/chat/completions`;
  const prompt = buildPrompt(request);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      model: config.model,
      temperature: config.temperature ?? 0.2,
      response_format: config.providerId === "openai" ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`${config.providerId}_http_${response.status}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content ?? "";
  return parseAiJson(request.id, content, config);
}

async function callAnthropic(
  request: AiTaskRequest,
  config: ProviderConfig,
  apiKey: string
): Promise<AiTaskResponse> {
  const prompt = buildPrompt(request);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1800,
      temperature: config.temperature ?? 0.2,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }]
    })
  });

  if (!response.ok) {
    throw new Error(`anthropic_http_${response.status}`);
  }

  const json = await response.json();
  const content = json.content?.map((part: { text?: string }) => part.text ?? "").join("") ?? "";
  return parseAiJson(request.id, content, config);
}

async function callGemini(
  request: AiTaskRequest,
  config: ProviderConfig,
  apiKey: string
): Promise<AiTaskResponse> {
  const prompt = buildPrompt(request);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    config.model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      generationConfig: {
        temperature: config.temperature ?? 0.2,
        responseMimeType: "application/json"
      },
      contents: [{ role: "user", parts: [{ text: `${prompt.system}\n\n${prompt.user}` }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`gemini_http_${response.status}`);
  }

  const json = await response.json();
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return parseAiJson(request.id, content, config);
}

function baseUrlFor(config: ProviderConfig): string {
  if (config.baseUrl) return config.baseUrl;

  switch (config.providerId) {
    case "openai":
      return "https://api.openai.com/v1";
    case "groq":
      return "https://api.groq.com/openai/v1";
    case "openrouter":
      return "https://openrouter.ai/api/v1";
    case "deepseek":
      return "https://api.deepseek.com/v1";
    case "together":
      return "https://api.together.xyz/v1";
    case "ollama_compatible":
      return "http://localhost:11434/v1";
    default:
      return "https://api.openai.com/v1";
  }
}

function parseAiJson(requestId: string, content: string, config: ProviderConfig): AiTaskResponse {
  const cleaned = content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as AiTaskResponse;

  return {
    ...parsed,
    id: requestId,
    suggestions: parsed.suggestions ?? [],
    usage: {
      ...parsed.usage,
      providerId: config.providerId,
      model: config.model
    }
  };
}

function isAuthError(error: unknown): boolean {
  return error instanceof Error && /401|403|auth|key/i.test(error.message);
}
