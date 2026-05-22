# AI Provider Abstraction and Routing

## Supported Providers

- OpenAI.
- Anthropic.
- Google Gemini.
- Groq.
- OpenRouter.
- DeepSeek.
- Together AI.
- Ollama-compatible APIs.
- Custom OpenAI-compatible endpoints.

## Provider Interface

```ts
interface AiProvider {
  id: ProviderId;
  displayName: string;
  capabilities: ProviderCapability[];
  listModels(config: ProviderConfig): Promise<ModelInfo[]>;
  testConnection(config: ProviderConfig): Promise<ProviderHealth>;
  complete(request: AiRequest): Promise<AiResponse>;
  stream(request: AiRequest): AsyncIterable<AiStreamEvent>;
}
```

## Task Types

```ts
type AiTaskType =
  | "grammar_correction"
  | "rewrite"
  | "tone_analysis"
  | "hinglish_transform"
  | "humanize"
  | "smart_reply"
  | "resume_optimize"
  | "prompt_enhance"
  | "summarize";
```

## Routing Policy

Routing is based on:

- Task type.
- User preference.
- Site context.
- Latency target.
- Quality target.
- Cost target.
- Provider health.
- Rate-limit state.
- Privacy mode.

Example defaults:

```json
{
  "grammar_correction": {
    "mode": "fast",
    "preferredProvider": "groq",
    "fallbackProviders": ["openai", "gemini", "openrouter"]
  },
  "rewrite": {
    "mode": "quality",
    "preferredProvider": "openai",
    "fallbackProviders": ["anthropic", "gemini", "openrouter"]
  },
  "tone_analysis": {
    "mode": "quality",
    "preferredProvider": "anthropic",
    "fallbackProviders": ["openai", "gemini"]
  }
}
```

## Router Algorithm

1. Normalize task request.
2. Load user route profile.
3. Filter providers by required capability.
4. Remove unhealthy or rate-limited providers.
5. Score candidates by quality, latency, price, and user priority.
6. Select model.
7. Execute request.
8. Retry on transient failures.
9. Fail over to next candidate.
10. Return normalized output.

## Multi-Provider Failover

Failure classes:

- Authentication failure: do not retry; ask user to update key.
- Rate limit: pause provider route temporarily and fail over.
- Timeout: retry once with shorter context or fallback.
- Safety refusal: surface provider reason and offer a different rewrite style.
- Malformed output: repair with schema parser or retry once.

Health state:

```ts
type ProviderHealth = {
  providerId: ProviderId;
  status: "healthy" | "degraded" | "rate_limited" | "auth_failed" | "offline";
  latencyMs?: number;
  checkedAt: string;
  errorCode?: string;
};
```

## Streaming Design

All providers are normalized into:

```ts
type AiStreamEvent =
  | { type: "start"; requestId: string }
  | { type: "delta"; text: string }
  | { type: "suggestion"; suggestion: Suggestion }
  | { type: "usage"; inputTokens: number; outputTokens: number }
  | { type: "done" }
  | { type: "error"; code: string; message: string };
```

## Caching

Cache key:

```text
sha256(taskType + normalizedText + contextHash + mode + promptVersion + model)
```

Cache policy:

- Realtime grammar: 10 minutes.
- Tone analysis: 30 minutes.
- Rewrite: user-session only.
- Resume and sensitive docs: no cache unless user enables it.

## Provider Assignment UX

Users can assign:

- Provider per feature.
- Model per feature.
- Temperature per feature.
- Fast vs quality mode.
- Fallback providers.

Advanced users can add:

- Base URL.
- Headers.
- OpenAI-compatible model ID.
- Context window.
- Max output tokens.

