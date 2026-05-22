# Scriptly Backend

Optional FastAPI backend for provider proxying, team policy, prompt registry, analytics metadata, and future sync.

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment

Copy `.env.example` to `.env` and set provider keys as needed.

The extension can run without this backend when users add BYOK credentials locally.

