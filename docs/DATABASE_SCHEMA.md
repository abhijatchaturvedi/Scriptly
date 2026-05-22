# Database Schema

The backend is optional for personal BYOK use. It becomes important for sync, teams, policy, usage analytics, provider proxying, and shared prompt/template management.

Recommended database: PostgreSQL.

## Tables

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  locale TEXT DEFAULT 'en-IN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### user_profiles

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'auto',
  default_tone TEXT DEFAULT 'professional',
  indian_english_level TEXT DEFAULT 'balanced',
  hinglish_mode TEXT DEFAULT 'auto',
  personalization_json JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### provider_accounts

For backend-proxied provider keys only. Extension-local BYOK keys are not stored here.

```sql
CREATE TABLE provider_accounts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  label TEXT,
  encrypted_secret_ref TEXT NOT NULL,
  base_url TEXT,
  status TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### route_profiles

```sql
CREATE TABLE route_profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  routing_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### writing_events

Metadata only. Raw text is excluded by default.

```sql
CREATE TABLE writing_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  site TEXT,
  task_type TEXT NOT NULL,
  provider_id TEXT,
  model_id TEXT,
  latency_ms INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER,
  accepted BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### prompt_templates

```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY,
  task_type TEXT NOT NULL,
  version TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en-IN',
  template TEXT NOT NULL,
  output_schema JSONB,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_type, version, locale)
);
```

### provider_health

```sql
CREATE TABLE provider_health (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  model_id TEXT,
  status TEXT NOT NULL,
  latency_ms INTEGER,
  error_code TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### team_policies

```sql
CREATE TABLE team_policies (
  id UUID PRIMARY KEY,
  team_id UUID NOT NULL,
  policy_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Redis Usage

Use Redis for:

- Rate limits.
- Provider cooldowns.
- Request deduplication.
- Short-lived response cache.
- Streaming session state.

## Qdrant Usage

Qdrant is optional and should only be used after consent for:

- Personal writing memory.
- Reusable style preferences.
- Organization writing guidelines.
- Frequently used snippets.

