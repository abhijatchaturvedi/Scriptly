# Security Architecture

## Security Principles

- Minimize permissions.
- Process only active editor text.
- Never log API keys.
- Never log full user text by default.
- Keep BYOK keys local unless the user explicitly chooses backend proxying.
- Make sensitive actions explicit.
- Prefer local encryption using Web Crypto.

## API Key Storage

Browser extension storage cannot guarantee perfect secrecy from a compromised browser profile, but Scriptly should still protect keys against accidental leakage and casual inspection.

Design:

- Store encrypted key envelopes in `chrome.storage.local` or IndexedDB.
- Generate a local non-extractable AES-GCM `CryptoKey` using Web Crypto.
- Optionally derive encryption material from a user passphrase for stronger local protection.
- Keep decrypted keys only in memory in the background service worker while needed.
- Never expose decrypted keys to content scripts.

Encrypted envelope:

```ts
type EncryptedSecretEnvelope = {
  id: string;
  providerId: string;
  algorithm: "AES-GCM";
  iv: string;
  ciphertext: string;
  createdAt: string;
  updatedAt: string;
};
```

## Request Isolation

Content scripts cannot call AI providers directly. Flow:

```text
content script -> background service worker -> provider client/backend proxy
```

This prevents API keys from entering the page execution context.

## Backend Proxy Security

When backend proxying is enabled:

- Use HTTPS only.
- Authenticate extension sessions.
- Encrypt secrets at rest with KMS or equivalent.
- Maintain per-user and per-provider rate limits.
- Redact prompts in logs by default.
- Store only metadata required for health, abuse prevention, or explicit analytics.

## CSP Hardening

Manifest:

- Restrict script sources.
- Avoid remote code execution.
- Do not inject arbitrary remote scripts.
- Use bundled extension assets.

## Permission Minimization

Phase 1 host permissions:

- Gmail.
- LinkedIn.
- WhatsApp Web.

All-sites mode should be an explicit user opt-in.

## Privacy Controls

User settings:

- Disable Scriptly on a site.
- Disable automatic correction.
- Require manual action before AI calls.
- Do not use backend proxy.
- Clear local cache.
- Clear provider keys.
- Export/delete profile.

## Sensitive Context Handling

Classify content as sensitive when it appears to include:

- Passwords.
- OTPs.
- Payment details.
- Government IDs.
- Medical details.
- Legal documents.
- Confidential business data.

For sensitive content:

- Pause automatic analysis.
- Ask for explicit confirmation.
- Use stricter cache policy.
- Prefer local BYOK direct provider calls if enabled.

## Logging Policy

Allowed by default:

- Event type.
- Provider ID.
- Model ID.
- Latency.
- Token counts.
- Error code.

Not allowed by default:

- Raw text.
- API keys.
- Full prompts.
- Full AI responses.
- Page URLs containing private path/query data.

