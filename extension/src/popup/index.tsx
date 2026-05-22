import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { getSettings, saveProviderSecret, saveSettings } from "../lib/secure-storage";
import { providerLabels, testProviderConnection } from "../lib/providers";
import type { ProviderConfig, ScriptlySettings } from "../lib/types";

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
      providers: settings.providers.map((item) => (item.providerId === provider.providerId ? { ...item, ...patch } : item))
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
            <div>
              <strong>{providerLabels[provider.providerId]}</strong>
              <label className="switch small">
                <input
                  type="checkbox"
                  checked={provider.enabled}
                  onChange={(event) => updateProvider(provider, { enabled: event.target.checked })}
                />
                Use
              </label>
            </div>
            <input
              value={provider.model}
              onChange={(event) => updateProvider(provider, { model: event.target.value })}
              aria-label={`${provider.providerId} model`}
            />
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
