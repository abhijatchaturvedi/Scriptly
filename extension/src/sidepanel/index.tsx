import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { sendAiTask } from "../lib/messages";
import type { AiTaskResponse, AiTaskType } from "../lib/types";
import "./styles.css";

const tasks: Array<{ label: string; value: AiTaskType; mode?: string }> = [
  { label: "Grammar", value: "grammar_correction" },
  { label: "Rewrite", value: "rewrite", mode: "polite_indian_corporate" },
  { label: "Tone", value: "tone_analysis" },
  { label: "Hinglish", value: "hinglish_transform" },
  { label: "Humanize", value: "humanize" },
  { label: "Smart Reply", value: "smart_reply", mode: "professional" },
  { label: "Resume", value: "resume_optimize" },
  { label: "Prompt", value: "prompt_enhance" }
];

function SidePanel() {
  const [text, setText] = useState("");
  const [task, setTask] = useState(tasks[1]);
  const [response, setResponse] = useState<AiTaskResponse | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!text.trim()) return;

    setBusy(true);
    setResponse(null);
    const result = await sendAiTask({
      id: crypto.randomUUID(),
      taskType: task.value,
      mode: task.mode,
      text,
      outputLanguage: task.value === "hinglish_transform" ? "auto" : "english",
      context: {
        platform: "generic",
        editorKind: "textarea",
        audience: "unknown",
        relationship: "unknown"
      }
    });
    setBusy(false);
    setResponse(result);
  }

  return (
    <main className="panel">
      <header>
        <h1>Scriptly Assistant</h1>
      </header>

      <nav>
        {tasks.map((item) => (
          <button
            type="button"
            key={item.value}
            className={task.value === item.value ? "active" : ""}
            onClick={() => setTask(item)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Paste or write text here..."
      />

      <button className="run" type="button" disabled={busy || !text.trim()} onClick={run}>
        {busy ? "Working..." : "Run Scriptly"}
      </button>

      {response && (
        <section className="result">
          <h2>Output</h2>
          <div className="output">{response.output ?? response.suggestions[0]?.replacement ?? "No output."}</div>

          {response.tone && (
            <div className="tone">
              <h2>Tone</h2>
              <Metric label="Professional" value={response.tone.professionalism} />
              <Metric label="Polite" value={response.tone.politeness} />
              <Metric label="Confident" value={response.tone.confidence} />
              <Metric label="Empathy" value={response.tone.empathy ?? 0} />
              <Metric label="Aggression" value={response.tone.aggression ?? 0} />
              {response.tone.riskFlags.length > 0 && <p className="risk">{response.tone.riskFlags.join(" ")}</p>}
            </div>
          )}

          {response.explanation && <p className="explanation">{response.explanation}</p>}
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <label className="metric">
      <span>
        {label} <b>{value}</b>
      </span>
      <progress value={value} max={100} />
    </label>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<SidePanel />);

