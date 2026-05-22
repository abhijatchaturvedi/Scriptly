import { sendAiTask } from "../lib/messages";
import type { AiTaskType, PlatformId, Suggestion, WritingContext } from "../lib/types";

const EDITOR_SELECTOR = [
  "textarea",
  "input[type='text']",
  "input[type='search']",
  "[contenteditable='true']",
  "[role='textbox']"
].join(",");

let activeEditor: HTMLElement | null = null;
let toolbar: HTMLDivElement | null = null;

injectStyles();

document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.matches(EDITOR_SELECTOR)) {
    return;
  }

  activeEditor = target;
  attachEditorSession(target);
  showToolbar(target);
});

document.addEventListener("selectionchange", () => {
  if (activeEditor) {
    positionToolbar(activeEditor);
  }
});

function attachEditorSession(editor: HTMLElement): void {
  if (editor.dataset.scriptlyAttached === "true") {
    return;
  }

  editor.dataset.scriptlyAttached = "true";
  editor.addEventListener("keydown", async (event) => {
    if (!(event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "s")) {
      return;
    }

    event.preventDefault();
    await runTask(editor, "rewrite", "polite_indian_corporate");
  });
}

function showToolbar(editor: HTMLElement): void {
  toolbar?.remove();
  toolbar = document.createElement("div");
  toolbar.className = "scriptly-toolbar";
  toolbar.innerHTML = `
    <button data-task="grammar_correction" title="Fix grammar">Fix</button>
    <button data-task="rewrite" data-mode="polite_indian_corporate" title="Rewrite professionally">Rewrite</button>
    <button data-task="hinglish_transform" title="Hinglish intelligence">Hinglish</button>
    <button data-task="tone_analysis" title="Analyze tone">Tone</button>
    <button data-task="humanize" title="Humanize AI text">Humanize</button>
    <button data-task="smart_reply" title="Generate smart reply">Reply</button>
    <button data-task="prompt_enhance" title="Improve prompt">Prompt</button>
  `;

  toolbar.addEventListener("mousedown", (event) => event.preventDefault());
  toolbar.addEventListener("click", async (event) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button || !activeEditor) return;

    await runTask(activeEditor, button.dataset.task as AiTaskType, button.dataset.mode);
  });

  document.documentElement.append(toolbar);
  positionToolbar(editor);
}

function positionToolbar(editor: HTMLElement): void {
  if (!toolbar) return;

  const rect = editor.getBoundingClientRect();
  toolbar.style.top = `${Math.max(8, rect.top + window.scrollY - 42)}px`;
  toolbar.style.left = `${Math.max(8, rect.left + window.scrollX)}px`;
}

async function runTask(editor: HTMLElement, taskType: AiTaskType, mode?: string): Promise<void> {
  const text = readSelectedOrEditorText(editor);
  if (!text.trim()) return;

  setToolbarBusy(true);
  const response = await sendAiTask({
    id: crypto.randomUUID(),
    taskType,
    text,
    mode,
    outputLanguage: taskType === "hinglish_transform" ? "english" : "auto",
    context: getWritingContext(editor)
  });

  setToolbarBusy(false);
  renderSuggestion(editor, response.suggestions[0], response.output, response.explanation);
}

function readSelectedOrEditorText(editor: HTMLElement): string {
  const selected = window.getSelection()?.toString();
  if (selected?.trim()) return selected;

  if (editor instanceof HTMLInputElement || editor instanceof HTMLTextAreaElement) {
    return editor.value;
  }

  return editor.innerText;
}

function applyText(editor: HTMLElement, suggestion: Suggestion): void {
  const selected = window.getSelection()?.toString();

  if (selected && !editor.matches("input, textarea")) {
    document.execCommand("insertText", false, suggestion.replacement);
    return;
  }

  if (editor instanceof HTMLInputElement || editor instanceof HTMLTextAreaElement) {
    const value = editor.value;
    const start = editor.selectionStart ?? 0;
    const end = editor.selectionEnd ?? value.length;
    const hasSelection = start !== end;
    editor.value = hasSelection
      ? `${value.slice(0, start)}${suggestion.replacement}${value.slice(end)}`
      : suggestion.replacement;
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }

  editor.innerText = suggestion.replacement;
  editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
}

function renderSuggestion(
  editor: HTMLElement,
  suggestion: Suggestion | undefined,
  output?: string,
  explanation?: string
): void {
  document.querySelector(".scriptly-card")?.remove();
  if (!suggestion && !output) return;

  const finalSuggestion: Suggestion = suggestion ?? {
    id: crypto.randomUUID(),
    original: readSelectedOrEditorText(editor),
    replacement: output ?? "",
    category: "rewrite",
    confidence: 0.5,
    explanation
  };

  const card = document.createElement("div");
  card.className = "scriptly-card";
  card.innerHTML = `
    <div class="scriptly-card-title">Scriptly suggestion</div>
    <div class="scriptly-card-output"></div>
    ${finalSuggestion.explanation ? `<div class="scriptly-card-note"></div>` : ""}
    <div class="scriptly-card-actions">
      <button data-action="accept">Accept</button>
      <button data-action="dismiss">Dismiss</button>
    </div>
  `;
  card.querySelector(".scriptly-card-output")!.textContent = finalSuggestion.replacement;
  const note = card.querySelector(".scriptly-card-note");
  if (note) note.textContent = finalSuggestion.explanation ?? "";

  card.addEventListener("click", (event) => {
    const action = (event.target as HTMLElement).closest("button")?.dataset.action;
    if (action === "accept") {
      applyText(editor, finalSuggestion);
      card.remove();
    }
    if (action === "dismiss") {
      card.remove();
    }
  });

  const rect = editor.getBoundingClientRect();
  card.style.top = `${rect.bottom + window.scrollY + 8}px`;
  card.style.left = `${Math.max(8, rect.left + window.scrollX)}px`;
  document.documentElement.append(card);
}

function setToolbarBusy(isBusy: boolean): void {
  if (!toolbar) return;
  toolbar.dataset.busy = String(isBusy);
}

function getWritingContext(editor: HTMLElement): WritingContext {
  return {
    platform: detectPlatform(),
    editorKind: editor.isContentEditable ? "contenteditable" : "textarea",
    audience: inferAudience(),
    relationship: "unknown",
    pageTitle: document.title,
    url: location.origin + location.pathname,
    surroundingText: document.title
  };
}

function detectPlatform(): PlatformId {
  const host = window.location.hostname;

  if (host.includes("mail.google.com")) return "gmail";
  if (host.includes("linkedin.com")) return "linkedin";
  if (host.includes("web.whatsapp.com")) return "whatsapp";
  if (host.includes("slack.com")) return "slack";
  if (host.includes("docs.google.com")) return "google_docs";
  if (host.includes("notion.so")) return "notion";
  if (host.includes("x.com") || host.includes("twitter.com")) return "twitter";
  if (host.includes("chatgpt.com")) return "chatgpt";

  return "generic";
}

function inferAudience(): WritingContext["audience"] {
  const host = window.location.hostname;
  if (host.includes("linkedin.com")) return "recruiter";
  if (host.includes("web.whatsapp.com")) return "friend";
  return "unknown";
}

function injectStyles(): void {
  const style = document.createElement("style");
  style.textContent = `
    .scriptly-toolbar {
      position: absolute;
      z-index: 2147483647;
      display: flex;
      gap: 4px;
      padding: 6px;
      background: #101827;
      border: 1px solid #263244;
      border-radius: 8px;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
      font: 12px system-ui, sans-serif;
    }
    .scriptly-toolbar[data-busy="true"] { opacity: 0.7; pointer-events: none; }
    .scriptly-toolbar button,
    .scriptly-card button {
      border: 0;
      border-radius: 6px;
      padding: 6px 8px;
      background: #eef2ff;
      color: #111827;
      cursor: pointer;
      font: 12px system-ui, sans-serif;
    }
    .scriptly-card {
      position: absolute;
      z-index: 2147483647;
      width: min(420px, calc(100vw - 24px));
      padding: 12px;
      background: #ffffff;
      color: #111827;
      border: 1px solid #d8dee9;
      border-radius: 8px;
      box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
      font: 13px/1.45 system-ui, sans-serif;
    }
    .scriptly-card-title { font-weight: 700; margin-bottom: 8px; }
    .scriptly-card-output { white-space: pre-wrap; }
    .scriptly-card-note { color: #475569; margin-top: 8px; font-size: 12px; }
    .scriptly-card-actions { display: flex; gap: 8px; margin-top: 12px; }
  `;
  document.documentElement.append(style);
}
