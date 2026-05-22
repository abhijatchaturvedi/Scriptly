import { getSettings } from "./secure-storage";
import type { AiTaskRequest, ProviderConfig, ProviderId, TaskRoute } from "./types";

const defaultRoutes: Record<string, Omit<TaskRoute, "taskType">> = {
  grammar_correction: {
    mode: "fast",
    providerId: "groq",
    model: "llama-3.1-8b-instant",
    fallbackProviderIds: ["openai", "gemini", "openrouter"],
    temperature: 0.1
  },
  rewrite: {
    mode: "quality",
    providerId: "openai",
    model: "gpt-4o",
    fallbackProviderIds: ["anthropic", "gemini", "openrouter"],
    temperature: 0.4
  },
  tone_analysis: {
    mode: "quality",
    providerId: "anthropic",
    model: "claude-3-5-sonnet-latest",
    fallbackProviderIds: ["openai", "gemini"],
    temperature: 0.2
  },
  hinglish_transform: {
    mode: "balanced",
    providerId: "openai",
    model: "gpt-4o",
    fallbackProviderIds: ["gemini", "groq", "openrouter"],
    temperature: 0.35
  }
};

export async function resolveProviderRoute(request: AiTaskRequest): Promise<ProviderConfig[]> {
  const settings = await getSettings();
  const route = settings.routes.find((item) => item.taskType === request.taskType) ?? {
    taskType: request.taskType,
    ...(defaultRoutes[request.taskType] ?? defaultRoutes.rewrite)
  };

  const providers = [route.providerId, ...route.fallbackProviderIds];

  const configs: ProviderConfig[] = [];

  for (const providerId of providers) {
      const provider = settings.providers.find((item) => item.providerId === providerId);
      if (!provider?.enabled) continue;

      configs.push({
        ...provider,
        model: providerId === route.providerId ? route.model : provider.model,
        temperature: route.temperature ?? provider.temperature
      });
  }

  return configs;
}

export function defaultModelFor(providerId: ProviderId, mode: TaskRoute["mode"]): string {
  if (providerId === "groq") return mode === "fast" ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";
  if (providerId === "anthropic") return "claude-3-5-sonnet-latest";
  if (providerId === "gemini") return "gemini-1.5-pro";
  if (providerId === "openrouter") return "openai/gpt-4o-mini";
  return mode === "fast" ? "gpt-4o-mini" : "gpt-4o";
}
