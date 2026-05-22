from dataclasses import dataclass


@dataclass(frozen=True)
class ProviderRoute:
    provider_id: str
    model: str
    temperature: float


DEFAULT_ROUTES: dict[str, list[ProviderRoute]] = {
    "grammar_correction": [
        ProviderRoute("groq", "llama-3.1-8b-instant", 0.1),
        ProviderRoute("openai", "gpt-4o-mini", 0.1),
    ],
    "rewrite": [
        ProviderRoute("openai", "gpt-4o", 0.4),
        ProviderRoute("anthropic", "claude-3-5-sonnet-latest", 0.4),
    ],
    "tone_analysis": [
        ProviderRoute("anthropic", "claude-3-5-sonnet-latest", 0.2),
        ProviderRoute("openai", "gpt-4o-mini", 0.2),
    ],
    "hinglish_transform": [
        ProviderRoute("openai", "gpt-4o", 0.35),
        ProviderRoute("gemini", "gemini-1.5-pro", 0.35),
    ],
}


def resolve_routes(task_type: str) -> list[ProviderRoute]:
    return DEFAULT_ROUTES.get(task_type, DEFAULT_ROUTES["rewrite"])

