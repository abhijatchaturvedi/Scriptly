# Project Status

Scriptly now has a working browser-extension prototype and optional backend proxy scaffold.

## Completed

- Manifest V3 extension.
- React popup for provider/key/model management.
- React side panel for grammar, rewrite, tone, Hinglish, humanize, smart reply, resume optimization, and prompt enhancement.
- Content-script toolbar for editable fields.
- Gmail, LinkedIn, WhatsApp Web, Slack, Google Docs, Notion, Twitter/X, ChatGPT, and generic editable-field matching.
- AI task schemas and shared prompt builder.
- Multi-provider routing and fallback.
- Provider clients for OpenAI-compatible APIs, Anthropic, and Gemini.
- Support for OpenAI, Groq, OpenRouter, DeepSeek, Together AI, Ollama-compatible, and custom OpenAI-compatible endpoints through the OpenAI-compatible path.
- AES-GCM local API key encryption.
- Optional FastAPI provider proxy.
- Product, extension, provider, security, database, prompt, and status documentation.

## Verified

- `npm run check` passes in `extension`.
- `npm run build` passes in `extension`.

## Not Verified Locally

- Backend runtime execution, because this machine exposes only the Windows Store Python stub at `python.exe`.
- Live provider calls, because real API keys are required.
- Browser UX across every target site, because that requires manual extension loading and site-level testing.

## Remaining Production Hardening

- Add Playwright browser-extension tests.
- Add site-specific editor adapters for deep Google Docs behavior.
- Add provider usage metering and better streaming UI.
- Add server-side auth, PostgreSQL migrations, Redis rate limiting, and Qdrant-backed personalization.
- Add Chrome Web Store packaging and privacy policy.
