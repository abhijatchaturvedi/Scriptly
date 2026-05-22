# Browser Extension Architecture

## Technology Stack

- Manifest V3.
- React.
- TypeScript.
- TailwindCSS.
- Chrome extension APIs.
- Web Crypto API.
- IndexedDB and `chrome.storage.local`.

## Extension Components

### Background Service Worker

Responsibilities:

- Receive writing tasks from content scripts.
- Resolve provider and model through the AI router.
- Read encrypted API key material through secure storage helpers.
- Execute provider calls directly or through a secure backend proxy.
- Stream partial responses to content scripts.
- Maintain provider health state.
- Enforce local rate limits.
- Sanitize logs and errors.

### Content Scripts

Responsibilities:

- Detect editable surfaces.
- Extract text selections and surrounding context.
- Inject floating toolbar.
- Render inline suggestion cards.
- Apply accepted corrections.
- Track editor mutations without excessive CPU usage.
- Handle platform-specific adapters.

### Popup UI

Responsibilities:

- Fast access to enable/disable Scriptly on current site.
- Provider status.
- Selected writing mode.
- Current default route profile.

### Side Panel

Responsibilities:

- Long-form assistant.
- Rewrite comparison.
- Tone and emotion report.
- Writing coach explanations.
- Provider/model settings.
- Site-specific preferences.

## Manifest V3 Design

Required permissions should stay minimal:

- `storage`: local settings and encrypted key envelopes.
- `activeTab`: user-triggered page interactions.
- `scripting`: controlled injection.
- `contextMenus`: right-click rewrite actions.
- `sidePanel`: full assistant panel.

Host permissions should be explicit for Phase 1:

- `https://mail.google.com/*`
- `https://www.linkedin.com/*`
- `https://web.whatsapp.com/*`

Generic all-site support should be opt-in.

## Content Script Strategy

### Editor Detection

Detect:

- `textarea`
- `input[type=text]`
- `contenteditable=true`
- ARIA text boxes.
- Shadow DOM editors.
- Known platform-specific editor roots.

Each editor gets an `EditorSession`:

```ts
type EditorSession = {
  id: string;
  platform: PlatformId;
  elementRef: WeakRef<Element>;
  editorKind: "textarea" | "input" | "contenteditable" | "shadow" | "iframe" | "canvas";
  context: WritingContext;
  lastTextHash: string;
};
```

### Text Extraction

Extraction should preserve:

- Plain text.
- Selection range.
- Paragraph boundaries.
- Nearby thread context when allowed.
- Host app metadata.

Avoid sending the entire page. Only send the active editor content and minimal context needed for the feature.

### Suggestion Rendering

Inline suggestions should be anchored to ranges:

```ts
type Suggestion = {
  id: string;
  range: TextRange;
  original: string;
  replacement: string;
  category: "grammar" | "tone" | "clarity" | "hinglish" | "rewrite";
  confidence: number;
  explanation?: string;
};
```

For simple textareas, use overlay mirroring. For rich editors, use DOM range overlays. For Google Docs, use a companion overlay and sidebar-first UX.

### Mutation Handling

Use:

- `MutationObserver` for editor root changes.
- `selectionchange` for active cursor.
- Debounced input events.
- Idle callbacks for low-priority scans.

Default debounce:

- Short text: 350 ms.
- Medium text: 700 ms.
- Long text: manual or paragraph-level scanning.

## Google Docs Integration Strategy

Google Docs is difficult because much of the document rendering is canvas-backed and internally virtualized.

Phase 1 approach:

- Support selected text rewrite through context menu and side panel.
- Use clipboard-safe replacement only after explicit user action.
- Offer sidebar suggestions instead of full inline underlines.

Phase 2 approach:

- Detect Google Docs editor containers and selection state.
- Use accessible text layers where available.
- Provide paragraph-level suggestions in the side panel.
- Apply replacements through browser selection commands only after user confirmation.

Phase 3 approach:

- Optional Google Drive/Docs API integration for document-level operations.
- User-authorized document read/write for full-document coaching.

Google Docs should not block the MVP because Gmail, LinkedIn, and WhatsApp Web provide higher-confidence extension surfaces.

## Platform Adapters

Each adapter implements:

```ts
interface PlatformAdapter {
  id: PlatformId;
  detect(): boolean;
  findEditors(): Element[];
  extractContext(editor: Element): Promise<WritingContext>;
  applySuggestion(editor: Element, suggestion: Suggestion): Promise<void>;
}
```

Phase 1 adapters:

- Gmail.
- LinkedIn.
- WhatsApp Web.
- Generic editable fields.

Phase 2 adapters:

- Slack.
- Notion.
- Twitter/X.
- ChatGPT.

## Realtime Correction Flow

```text
User types
  -> content script debounces editor text
  -> language/context classifier runs locally
  -> correction task sent to background
  -> AI router selects provider/model
  -> provider call streams result
  -> background normalizes suggestions
  -> content script renders inline cards
  -> user accepts, rejects, or asks for explanation
  -> local preference model records non-sensitive action metadata
```

## UI Wireframes

### Floating Toolbar

```text
[S] [Fix] [Rewrite] [Tone] [Hinglish] [...]
```

Behavior:

- Appears near selected text or active editor.
- Collapses to a small Scriptly button while typing.
- Uses icons for common actions with tooltips.

### Inline Suggestion Card

```text
Original:  I didn't got the mail
Suggested: I didn't get the email

[Accept] [Dismiss] [Explain]
```

### Side Panel

```text
Scriptly

Context: Gmail -> Client email
Audience: Client
Mode: Polite Indian corporate

[Rewrite] [Tone] [Humanize] [Prompt]

Input
--------------------------------
...

Output
--------------------------------
...

Tone
Professional  86
Polite        91
Confident     72
Risk: phrase may sound demanding
```

### Provider Settings

```text
Providers

OpenAI       Connected   Default for rewrite
Anthropic    Connected   Default for tone
Groq         Connected   Default for fast correction
Gemini       Not set

Task Routing

Grammar      Groq / fast
Rewrite      OpenAI / quality
Tone         Anthropic / quality
Summarize    Gemini / balanced
```

## Performance Optimization Plan

- Debounce typing events.
- Cache corrections by text hash, mode, and context.
- Run cheap language/context classification locally.
- Stream long rewrites.
- Limit correction scope to active paragraph for realtime mode.
- Avoid DOM scans on every keystroke.
- Use site adapters instead of universal deep traversal.
- Cap concurrent provider calls per tab.
- Cancel stale requests when text changes.
- Use background service worker as the only AI request coordinator.

