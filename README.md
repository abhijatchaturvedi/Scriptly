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

## Install and Use

### 1. Download the Project

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/Scriptly.git
cd Scriptly
```

Or download it as a ZIP from GitHub:

1. Click `Code`.
2. Click `Download ZIP`.
3. Extract the ZIP.
4. Open the extracted `Scriptly` folder in a terminal.

### 2. Install Dependencies

```bash
npm --prefix extension install
```

### 3. Build the Extension

```bash
npm --prefix extension run build
```

### 4. Load as an Unpacked Extension

1. Open Chrome, Edge, Brave, or another Chromium browser.
2. Go to `chrome://extensions`.
3. Turn on `Developer mode`.
4. Click `Load unpacked`.
5. Select the `Scriptly/extension` folder.
6. Pin Scriptly from the browser extensions menu.

### 5. Add Your AI Provider Key

1. Click the Scriptly extension icon.
2. Choose a provider such as OpenAI, Anthropic, Gemini, Groq, OpenRouter, DeepSeek, Together AI, Ollama-compatible, or a custom OpenAI-compatible endpoint.
3. Paste your API key.
4. Set the model name.
5. Enable the provider.
6. Click `Test` to verify the connection.

Your API key is stored locally in the browser using encrypted extension storage.

### 6. Use Scriptly

- Open Gmail, LinkedIn, WhatsApp Web, Slack, Notion, Twitter/X, ChatGPT, or any page with an editable text field.
- Click inside a text box.
- Use the floating Scriptly toolbar for grammar correction, rewrite, Hinglish conversion, tone analysis, humanization, smart replies, and prompt enhancement.
- Use `Ctrl+Shift+S` inside an editor to run a quick professional rewrite.
- Open the side panel for longer text, resumes, LinkedIn content, prompt enhancement, and tone reports.

### Optional Backend

The extension works without the backend when you add provider keys in the extension. The backend is optional for proxying, team features, and future sync.

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

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
