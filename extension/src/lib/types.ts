export type PlatformId =
  | "gmail"
  | "linkedin"
  | "whatsapp"
  | "slack"
  | "google_docs"
  | "notion"
  | "twitter"
  | "chatgpt"
  | "generic";

export type ProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "groq"
  | "openrouter"
  | "deepseek"
  | "together"
  | "ollama_compatible"
  | "openai_compatible";

export type AiTaskType =
  | "grammar_correction"
  | "rewrite"
  | "tone_analysis"
  | "hinglish_transform"
  | "humanize"
  | "smart_reply"
  | "resume_optimize"
  | "prompt_enhance"
  | "summarize";

export type RewriteMode =
  | "professional"
  | "casual"
  | "friendly"
  | "confident"
  | "persuasive"
  | "concise"
  | "corporate"
  | "startup"
  | "gen_z"
  | "technical"
  | "humanized"
  | "polite_indian_corporate";

export type WritingContext = {
  platform: PlatformId;
  editorKind: "textarea" | "input" | "contenteditable" | "shadow" | "iframe" | "canvas";
  audience?: "boss" | "recruiter" | "client" | "colleague" | "friend" | "unknown";
  relationship?: "internal" | "external" | "personal" | "unknown";
  mode?: string;
  surroundingText?: string;
  pageTitle?: string;
  url?: string;
};

export type TextRange = {
  start: number;
  end: number;
};

export type Suggestion = {
  id: string;
  range?: TextRange;
  original: string;
  replacement: string;
  category: "grammar" | "tone" | "clarity" | "hinglish" | "rewrite";
  confidence: number;
  explanation?: string;
};

export type AiTaskRequest = {
  id: string;
  taskType: AiTaskType;
  text: string;
  context: WritingContext;
  mode?: string;
  audience?: WritingContext["audience"];
  outputLanguage?: "auto" | "english" | "hindi" | "hinglish";
  stream?: boolean;
};

export type AiTaskResponse = {
  id: string;
  languageDetected?: string;
  intent?: string;
  suggestions: Suggestion[];
  output?: string;
  explanation?: string;
  tone?: {
    professionalism: number;
    politeness: number;
    confidence: number;
    empathy?: number;
    aggression?: number;
    emotionalIntensity?: number;
    passiveAggressiveness?: number;
    riskFlags: string[];
  };
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    providerId?: string;
    model?: string;
  };
};

export type ProviderHealthStatus =
  | "healthy"
  | "degraded"
  | "rate_limited"
  | "auth_failed"
  | "offline";

export type ProviderHealth = {
  providerId: string;
  status: ProviderHealthStatus;
  latencyMs?: number;
  checkedAt: string;
  errorCode?: string;
};

export type ProviderConfig = {
  providerId: ProviderId;
  label?: string;
  model: string;
  baseUrl?: string;
  apiKeyRef?: string;
  temperature?: number;
  enabled: boolean;
};

export type TaskRoute = {
  taskType: AiTaskType;
  mode: "fast" | "balanced" | "quality";
  providerId: ProviderId;
  model: string;
  fallbackProviderIds: ProviderId[];
  temperature: number;
};

export type ScriptlySettings = {
  enabled: boolean;
  defaultTone: RewriteMode;
  defaultOutputLanguage: "auto" | "english" | "hindi" | "hinglish";
  providers: ProviderConfig[];
  routes: TaskRoute[];
  disabledHosts: string[];
  privacyMode: "manual" | "assisted" | "realtime";
};
