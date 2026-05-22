# Scriptly

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)
![React](https://img.shields.io/badge/React-UI-61DAFB.svg)
![AI Providers](https://img.shields.io/badge/AI-BYOK%20Multi--Provider-111827.svg)

Scriptly is a browser-extension-first AI writing assistant for Indian English, Hindi, and Hinglish. It is designed as a communication layer across Gmail, LinkedIn, WhatsApp Web, Slack, Google Docs, Notion, Twitter/X, ChatGPT, and generic editable fields.

Scriptly helps Indian internet users write clearer, warmer, sharper, and more context-aware messages across everyday browser workflows.

## Highlights

- Real-time grammar and language correction for Indian English, Hindi, and Hinglish.
- Context-aware rewriting for email, chat, professional, recruiter, client, and team communication.
- Hinglish intelligence: transliterated Hindi, code-switching, and tone preservation.
- Humanization of AI-generated writing.
- Tone and emotion analysis.
- Bring-your-own-provider AI routing across OpenAI, Anthropic, Gemini, Groq, OpenRouter, DeepSeek, Together AI, Ollama-compatible APIs, and custom OpenAI-compatible endpoints.

## What You Can Do

- Fix Indian English phrasing like "I am having one doubt", "Please revert back", and "I didn't got the mail".
- Rewrite text for professional, friendly, confident, concise, startup, technical, Gen-Z, or polite Indian corporate tone.
- Convert Hinglish into polished English, or English into natural Hinglish.
- Humanize AI-generated emails, posts, assignments, and prompts.
- Analyze tone for professionalism, politeness, confidence, empathy, aggression, and passive-aggressiveness.
- Generate smart replies for email, LinkedIn, Slack, and WhatsApp Web.
- Improve resumes, LinkedIn sections, and AI prompts.
- Route each feature to a different AI provider and model.

## Project Status

The extension prototype builds successfully and includes the completed product surface across all planned phases:

- Provider settings popup.
- Floating editor toolbar.
- Side panel assistant.
- Multi-provider AI routing and fallback.
- Optional FastAPI backend proxy.
- Security-first local API key storage.

See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) for verification notes.

## Quick Start

```bash
npm --prefix extension install
npm --prefix extension run build
```

Then open Chrome or another Chromium browser and load the `extension` folder as an unpacked extension.

## Repository

```text
Scriptly/
  docs/
    PRODUCT_ARCHITECTURE.md
    EXTENSION_ARCHITECTURE.md
    AI_PROVIDER_ROUTING.md
    SECURITY.md
    DATABASE_SCHEMA.md
    PROMPTS.md
    PROJECT_STATUS.md
  extension/
    manifest.json
    package.json
    tsconfig.json
    src/
      background/
      content/
      popup/
      sidepanel/
      lib/
  backend/
    app/
      api/
      ai/
      core/
      models/
      schemas/
```

## Contributing

Contributions are welcome. Good first areas:

- Site-specific editor adapters.
- Better Google Docs handling.
- Provider integrations.
- Prompt evaluation sets for Indian English, Hindi, and Hinglish.
- UI polish and accessibility.
- Tests for extension flows.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Scriptly is released under the [MIT License](LICENSE).
