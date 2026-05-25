import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { getSettings, saveProviderSecret, saveSettings } from "../lib/secure-storage";
import { providerLabels, testProviderConnection } from "../lib/providers";
import type { ProviderConfig, ProviderId, ScriptlySettings } from "../lib/types";

type ModelOption = {
  label: string;
  value: string;
  badge?: string;
};

const customModelValue = "__custom__";

const modelOptions: Record<ProviderId, ModelOption[]> = {
  openai: [
    { label: "GPT-4o", value: "gpt-4o", badge: "Quality" },
    { label: "GPT-4o Mini", value: "gpt-4o-mini", badge: "Fast" },
    { label: "GPT-4.1", value: "gpt-4.1", badge: "Advanced" },
    { label: "GPT-4.1 Mini", value: "gpt-4.1-mini", badge: "Balanced" }
  ],
  anthropic: [
    { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-latest", badge: "Quality" },
    { label: "Claude 3.5 Haiku", value: "claude-3-5-haiku-latest", badge: "Fast" },
    { label: "Claude 3 Opus", value: "claude-3-opus-latest", badge: "Deep" }
  ],
  gemini: [
    { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro", badge: "Quality" },
    { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash", badge: "Fast" },
    { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash", badge: "Fast" }
  ],
  groq: [
    { label: "Llama 3.1 8B Instant", value: "llama-3.1-8b-instant", badge: "Fast" },
    { label: "Llama 3.3 70B Versatile", value: "llama-3.3-70b-versatile", badge: "Quality" },
    { label: "Mixtral 8x7B", value: "mixtral-8x7b-32768", badge: "Classic" }
  ],
  openrouter: [
    { label: "OpenAI GPT-4o Mini", value: "openai/gpt-4o-mini", badge: "Fast" },
    { label: "Anthropic Claude 3.5 Sonnet", value: "anthropic/claude-3.5-sonnet", badge: "Quality" },
    { label: "Google Gemini Flash", value: "google/gemini-flash-1.5", badge: "Fast" },
    { label: "Meta Llama 3.1 70B", value: "meta-llama/llama-3.1-70b-instruct", badge: "Open" }
  ],
  deepseek: [
    { label: "DeepSeek Chat", value: "deepseek-chat", badge: "Balanced" },
    { label: "DeepSeek Reasoner", value: "deepseek-reasoner", badge: "Reasoning" }
  ],
  together: [
    { label: "Llama 3.1 70B Turbo", value: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", badge: "Quality" },
    { label: "Llama 3.1 8B Turbo", value: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", badge: "Fast" },
    { label: "Mixtral 8x7B", value: "mistralai/Mixtral-8x7B-Instruct-v0.1", badge: "Classic" }
  ],
  ollama_compatible: [
    { label: "Llama 3.1", value: "llama3.1", badge: "Local" },
    { label: "Llama 3.2", value: "llama3.2", badge: "Local" },
    { label: "Mistral", value: "mistral", badge: "Local" },
    { label: "Qwen 2.5", value: "qwen2.5", badge: "Local" }
  ],
  openai_compatible: [
    { label: "GPT-4o Mini", value: "gpt-4o-mini", badge: "Default" },
    { label: "Llama 3.1 8B", value: "llama-3.1-8b-instant", badge: "Fast" },
    { label: "Llama 3.1 70B", value: "llama-3.1-70b-versatile", badge: "Quality" }
  ]
};

function Popup() {
  const [settings, setSettings] = useState<ScriptlySettings | null>(null);
  const [keyDrafts, setKeyDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  if (!settings) {
    return <main className="popup">Loading Scriptly...</main>;
  }

  async function updateProvider(provider: ProviderConfig, patch: Partial<ProviderConfig>) {
    if (!settings) return;
    const next = {
      ...settings,
      providers: settings.providers.map((item) => (item.providerId === provider.providerId ? { ...item, ...patch } : item)),
      routes: patch.model
        ? settings.routes.map((route) =>
            route.providerId === provider.providerId ? { ...route, model: patch.model ?? route.model } : route
          )
        : settings.routes
    };
    setSettings(next);
    await saveSettings(next);
  }

  async function saveKey(provider: ProviderConfig) {
    const value = keyDrafts[provider.providerId]?.trim();
    if (!value) return;

    await saveProviderSecret(provider.providerId, value);
    await updateProvider(provider, { enabled: true });
    setKeyDrafts((current) => ({ ...current, [provider.providerId]: "" }));
    setStatus(`${providerLabels[provider.providerId]} key saved locally.`);
  }

  async function testProvider(provider: ProviderConfig) {
    setStatus(`Testing ${providerLabels[provider.providerId]}...`);
    const result = await testProviderConnection(provider);
    setStatus(`${providerLabels[provider.providerId]}: ${result.status}${result.latencyMs ? ` in ${result.latencyMs} ms` : ""}`);
  }

  return (
    <main className="popup">
      <header>
        <h1>Scriptly</h1>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={async (event) => {
              const next = { ...settings, enabled: event.target.checked };
              setSettings(next);
              await saveSettings(next);
            }}
          />
          Enabled
        </label>
      </header>

      <section>
        <h2>Defaults</h2>
        <label>
          Tone
          <select
            value={settings.defaultTone}
            onChange={async (event) => {
              const next = { ...settings, defaultTone: event.target.value as ScriptlySettings["defaultTone"] };
              setSettings(next);
              await saveSettings(next);
            }}
          >
            <option value="polite_indian_corporate">Polite Indian corporate</option>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="confident">Confident</option>
            <option value="startup">Startup</option>
            <option value="humanized">Humanized</option>
          </select>
        </label>
      </section>

      <section>
        <h2>Providers</h2>
        {settings.providers.map((provider) => (
          <article className="provider" key={provider.providerId}>
            <div className="provider-head">
              <div>
                <strong>{providerLabels[provider.providerId]}</strong>
                <span>{provider.enabled ? "Connected route enabled" : "Add a key and enable when ready"}</span>
              </div>
              <label className="switch small">
                <input
                  type="checkbox"
                  checked={provider.enabled}
                  onChange={(event) => updateProvider(provider, { enabled: event.target.checked })}
                />
                Use
              </label>
            </div>
            <ModelPicker provider={provider} onChange={(model) => updateProvider(provider, { model })} />
            {(provider.providerId === "openai_compatible" || provider.providerId === "ollama_compatible") && (
              <input
                value={provider.baseUrl ?? ""}
                placeholder="Base URL"
                onChange={(event) => updateProvider(provider, { baseUrl: event.target.value })}
              />
            )}
            <div className="row">
              <input
                type="password"
                placeholder={provider.providerId === "ollama_compatible" ? "API key optional" : "API key"}
                value={keyDrafts[provider.providerId] ?? ""}
                onChange={(event) => setKeyDrafts((current) => ({ ...current, [provider.providerId]: event.target.value }))}
              />
              <button type="button" onClick={() => saveKey(provider)}>
                Save
              </button>
              <button type="button" onClick={() => testProvider(provider)}>
                Test
              </button>
            </div>
          </article>
        ))}
      </section>

      <p className="status">{status}</p>
    </main>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Popup />);

function ModelPicker({ provider, onChange }: { provider: ProviderConfig; onChange: (model: string) => void }) {
  const options = modelOptions[provider.providerId];
  const selectedValue = options.some((option) => option.value === provider.model) ? provider.model : customModelValue;
  const selected = options.find((option) => option.value === provider.model);

  return (
    <div className="model-picker">
      <label>
        Model
        <select
          value={selectedValue}
          onChange={(event) => {
            const value = event.target.value;
            if (value !== customModelValue) onChange(value);
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}{option.badge ? ` - ${option.badge}` : ""}
            </option>
          ))}
          <option value={customModelValue}>Custom model...</option>
        </select>
      </label>

      {selected && <span className="model-chip">{selected.badge}</span>}

      {selectedValue === customModelValue && (
        <label className="custom-model">
          Custom model ID
          <input
            value={provider.model}
            placeholder="Enter model ID"
            onChange={(event) => onChange(event.target.value)}
            aria-label={`${provider.providerId} custom model`}
          />
        </label>
      )}
    </div>
  );
}
