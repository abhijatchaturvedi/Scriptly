# Contributing to Scriptly

Thanks for helping improve Scriptly.

## How to Contribute

1. Fork the repository.
2. Create a focused branch.
3. Make a small, reviewable change.
4. Run the relevant checks.
5. Open a pull request with a clear summary.

## Local Checks

```bash
npm --prefix extension run check
npm --prefix extension run build
```

## Good Contribution Areas

- Site adapters for Gmail, LinkedIn, WhatsApp Web, Slack, Notion, Google Docs, Twitter/X, and ChatGPT.
- Prompt improvements for Indian English, Hindi, and Hinglish.
- Provider adapters and model defaults.
- Accessibility and keyboard UX.
- Security hardening.
- Tests and evaluation examples.

## Pull Request Guidelines

- Keep changes scoped.
- Do not commit API keys, tokens, personal text, or private prompts.
- Include screenshots for UI changes.
- Explain provider-specific behavior when adding or changing AI integrations.
- Update docs when behavior changes.

## Security

If you find a security issue, do not open a public issue with exploit details. Open a minimal report first and avoid including secrets or private user content.

