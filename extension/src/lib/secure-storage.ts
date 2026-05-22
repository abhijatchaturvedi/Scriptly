import type { ScriptlySettings } from "./types";

const SECRET_PREFIX = "scriptly.secret.";
const SETTINGS_KEY = "scriptly.settings";
const KEY_MATERIAL = "scriptly.localKeyMaterial";

export type SecretRecord = {
  id: string;
  providerId: string;
  encryptedValue: string;
  iv: string;
  createdAt: string;
  updatedAt: string;
};

export async function saveProviderSecret(providerId: string, value: string): Promise<SecretRecord> {
  const now = new Date().toISOString();
  const encrypted = await encrypt(value);
  const record: SecretRecord = {
    id: crypto.randomUUID(),
    providerId,
    encryptedValue: encrypted.ciphertext,
    iv: encrypted.iv,
    createdAt: now,
    updatedAt: now
  };

  await chrome.storage.local.set({ [SECRET_PREFIX + providerId]: record });
  return record;
}

export async function getProviderSecret(providerId: string): Promise<SecretRecord | undefined> {
  const result = await chrome.storage.local.get(SECRET_PREFIX + providerId);
  const record = result[SECRET_PREFIX + providerId] as SecretRecord | undefined;
  if (!record) return undefined;

  return {
    ...record,
    encryptedValue: await decrypt(record.encryptedValue, record.iv)
  };
}

export async function getSettings(): Promise<ScriptlySettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return {
    ...defaultSettings(),
    ...(result[SETTINGS_KEY] as Partial<ScriptlySettings> | undefined)
  };
}

export async function saveSettings(settings: ScriptlySettings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export function defaultSettings(): ScriptlySettings {
  return {
    enabled: true,
    defaultTone: "polite_indian_corporate",
    defaultOutputLanguage: "auto",
    disabledHosts: [],
    privacyMode: "manual",
    providers: [
      { providerId: "openai", model: "gpt-4o", enabled: false, temperature: 0.3 },
      { providerId: "anthropic", model: "claude-3-5-sonnet-latest", enabled: false, temperature: 0.3 },
      { providerId: "gemini", model: "gemini-1.5-pro", enabled: false, temperature: 0.3 },
      { providerId: "groq", model: "llama-3.1-8b-instant", enabled: false, temperature: 0.1 },
      { providerId: "openrouter", model: "openai/gpt-4o-mini", enabled: false, temperature: 0.3 },
      { providerId: "deepseek", model: "deepseek-chat", enabled: false, temperature: 0.2 },
      { providerId: "together", model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", enabled: false, temperature: 0.2 },
      { providerId: "ollama_compatible", model: "llama3.1", baseUrl: "http://localhost:11434/v1", enabled: false, temperature: 0.2 },
      { providerId: "openai_compatible", model: "gpt-4o-mini", enabled: false, temperature: 0.2 }
    ],
    routes: [
      {
        taskType: "grammar_correction",
        mode: "fast",
        providerId: "groq",
        model: "llama-3.1-8b-instant",
        fallbackProviderIds: ["openai", "gemini", "openrouter"],
        temperature: 0.1
      },
      {
        taskType: "rewrite",
        mode: "quality",
        providerId: "openai",
        model: "gpt-4o",
        fallbackProviderIds: ["anthropic", "gemini", "openrouter"],
        temperature: 0.35
      },
      {
        taskType: "tone_analysis",
        mode: "quality",
        providerId: "anthropic",
        model: "claude-3-5-sonnet-latest",
        fallbackProviderIds: ["openai", "gemini"],
        temperature: 0.2
      },
      {
        taskType: "hinglish_transform",
        mode: "balanced",
        providerId: "openai",
        model: "gpt-4o",
        fallbackProviderIds: ["gemini", "groq"],
        temperature: 0.35
      }
    ]
  };
}

async function encrypt(plaintext: string): Promise<{ ciphertext: string; iv: string }> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, encoded);

  return {
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv)
  };
}

async function decrypt(ciphertext: string, iv: string): Promise<string> {
  const key = await getEncryptionKey();
  const decoded = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(base64ToBytes(iv)) },
    key,
    toArrayBuffer(base64ToBytes(ciphertext))
  );

  return new TextDecoder().decode(decoded);
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const existing = await chrome.storage.local.get(KEY_MATERIAL);
  let material = existing[KEY_MATERIAL] as string | undefined;

  if (!material) {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    material = bytesToBase64(bytes);
    await chrome.storage.local.set({ [KEY_MATERIAL]: material });
  }

  return crypto.subtle.importKey("raw", toArrayBuffer(base64ToBytes(material)), "AES-GCM", false, [
    "encrypt",
    "decrypt"
  ]);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
