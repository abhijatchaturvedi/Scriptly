# Scriptly Product Architecture

## Product Thesis

Scriptly is not a grammar checker. It is an AI communication co-pilot for Indian internet users. The assistant should understand intent, audience, relationship, language mix, emotional tone, and the platform where the user is writing.

The primary design goal is to become the default AI writing layer for Indian internet users across browser-based workflows.

## Target Users

- Indian professionals.
- Students.
- Developers.
- Startup founders.
- Recruiters.
- Freelancers.
- Customer support agents.
- Corporate employees.

## Primary Surfaces

- Gmail.
- LinkedIn.
- WhatsApp Web.
- Slack.
- Google Docs.
- Notion.
- Twitter/X.
- ChatGPT.
- Generic textareas and `contenteditable` editors.

## Core Product Modules

### 1. Real-Time Correction

Capabilities:

- Spelling correction.
- Punctuation correction.
- Grammar correction.
- Indian English phrasing detection.
- Hindi and Hinglish correction.
- Readability improvements.
- Inline suggestion cards.
- One-click fixes.
- Ghost text suggestions.
- Streaming corrections for longer text.

Examples:

- "I didn't got the mail" -> "I didn't get the email."
- "Please revert back" -> "Please respond."
- "Kal meeting hai please prepare PPT" -> "There is a meeting tomorrow. Please prepare the PPT."

### 2. Hinglish Intelligence Engine

Responsibilities:

- Detect Hindi written in English script.
- Detect mixed Hindi-English structure.
- Preserve relationship and emotional tone.
- Convert Hinglish to professional English.
- Convert English to casual, professional, or team-chat Hinglish.

Modes:

- Casual Hinglish.
- Professional Hinglish.
- Startup/team-chat Hinglish.

### 3. Rewrite Engine

Rewrite dimensions:

- Tone.
- Audience.
- Intent.
- Platform context.
- Relationship.
- Urgency.
- Cultural nuance.

Modes:

- Professional.
- Casual.
- Friendly.
- Confident.
- Persuasive.
- Concise.
- Corporate.
- Startup.
- Gen-Z.
- Technical.
- Humanized.
- Polite Indian corporate tone.

### 4. Humanization Engine

Purpose:

- Convert robotic AI-generated writing into natural human writing.
- Reduce repetitive phrasing.
- Vary sentence rhythm.
- Add natural transitions.
- Remove obvious AI patterns.

Primary inputs:

- ChatGPT outputs.
- LinkedIn posts.
- Emails.
- Assignments.
- Resume summaries.

### 5. Tone and Emotion Analysis

Signals:

- Professionalism.
- Confidence.
- Politeness.
- Aggression.
- Empathy.
- Emotional intensity.
- Passive-aggressiveness.

Output:

- Tone labels.
- Score from 0 to 100.
- Sentence-level risk flags.
- Suggested safer alternatives.

### 6. Smart Context Awareness

Context sources:

- Host app: Gmail, LinkedIn, WhatsApp Web, Slack, Notion, etc.
- Editor type: subject, body, comment, chat, post, document.
- Conversation metadata when safely available.
- User-selected audience: boss, recruiter, client, colleague, friend.
- Local writing profile preferences.

Example:

"Send me this ASAP." in a client email should become:

"Could you please share this by today, if possible?"

The same text in a team chat can become:

"Can you send this today? It is a bit urgent."

### 7. Writing Coach

The coach explains:

- Why a correction is suggested.
- Why a tone may sound rude, defensive, or weak.
- How to make the message clearer.
- How to improve vocabulary without sounding artificial.

The coach should be optional and concise by default.

### 8. Resume and LinkedIn Optimization

Capabilities:

- ATS-oriented bullet improvement.
- Quantification prompts.
- Recruiter-friendly wording.
- LinkedIn headline and about-section rewrites.
- Skill keyword suggestions.

### 9. Prompt Enhancement

Scriptly should detect prompt-like text in ChatGPT and other AI tools, then improve:

- Goal clarity.
- Context.
- Constraints.
- Output format.
- Examples.
- Evaluation criteria.

### 10. Smart Replies

Reply modes:

- Professional.
- Friendly.
- Concise.
- Negotiation.
- Follow-up.
- Apology.
- Escalation.

## System-Level Architecture

```text
Browser Extension
  Content Scripts
    Editor detection
    Text extraction
    Suggestion overlays
    DOM patch application
    Platform adapters
  Background Service Worker
    AI task orchestration
    Provider routing
    Secure key access
    Caching
    Rate-limit handling
  Popup UI
    Quick settings
    Provider status
    Current-site controls
  Side Panel
    Full assistant
    Rewrite workflows
    Tone reports
    Writing coach

Backend API
  Optional account sync
  Team policy
  Usage analytics
  Provider proxy
  Prompt template delivery
  Abuse/rate protection

AI Layer
  Provider abstraction
  Prompt orchestration
  Task router
  Streaming interface
  Quality and cost policy
  Failover policy
```

## Browser-Extension-First Principle

The extension must work without forcing a server dependency for personal BYOK use. The backend is for optional sync, provider proxying, teams, analytics, and policy management. The core writing assistant should run as an extension-first product.

## Non-Goals

- Desktop app.
- Mobile app.
- Local inference as a core product.
- VS Code extension.
- Keyboard app.
- Monetization planning.

