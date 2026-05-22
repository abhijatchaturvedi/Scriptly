import json
import os
from typing import Any

import httpx

from app.ai.prompts import build_messages
from app.ai.router import ProviderRoute
from app.schemas.ai import AiTaskRequest, AiTaskResponse


async def run_provider(request: AiTaskRequest, route: ProviderRoute) -> AiTaskResponse:
    key = os.getenv(f"{route.provider_id.upper()}_API_KEY")

    if route.provider_id == "anthropic":
        return await run_anthropic(request, route, key)
    if route.provider_id == "gemini":
        return await run_gemini(request, route, key)

    return await run_openai_compatible(request, route, key)


async def run_openai_compatible(
    request: AiTaskRequest,
    route: ProviderRoute,
    key: str | None,
) -> AiTaskResponse:
    if not key and route.provider_id != "ollama_compatible":
        raise RuntimeError(f"missing_{route.provider_id}_api_key")

    base_url = base_url_for(route.provider_id)
    system, user = build_messages(request)

    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            f"{base_url.rstrip('/')}/chat/completions",
            headers={
                "Content-Type": "application/json",
                **({"Authorization": f"Bearer {key}"} if key else {}),
            },
            json={
                "model": route.model,
                "temperature": route.temperature,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            },
        )
        response.raise_for_status()
        payload = response.json()
        content = payload["choices"][0]["message"]["content"]
        return parse_response(request.id, content)


async def run_anthropic(request: AiTaskRequest, route: ProviderRoute, key: str | None) -> AiTaskResponse:
    if not key:
        raise RuntimeError("missing_anthropic_api_key")

    system, user = build_messages(request)
    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "Content-Type": "application/json",
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
            },
            json={
                "model": route.model,
                "max_tokens": 1800,
                "temperature": route.temperature,
                "system": system,
                "messages": [{"role": "user", "content": user}],
            },
        )
        response.raise_for_status()
        payload = response.json()
        content = "".join(part.get("text", "") for part in payload.get("content", []))
        return parse_response(request.id, content)


async def run_gemini(request: AiTaskRequest, route: ProviderRoute, key: str | None) -> AiTaskResponse:
    if not key:
        raise RuntimeError("missing_gemini_api_key")

    system, user = build_messages(request)
    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{route.model}:generateContent",
            params={"key": key},
            json={
                "generationConfig": {"temperature": route.temperature, "responseMimeType": "application/json"},
                "contents": [{"role": "user", "parts": [{"text": f"{system}\n\n{user}"}]}],
            },
        )
        response.raise_for_status()
        payload = response.json()
        content = payload["candidates"][0]["content"]["parts"][0]["text"]
        return parse_response(request.id, content)


def base_url_for(provider_id: str) -> str:
    urls = {
        "openai": "https://api.openai.com/v1",
        "groq": "https://api.groq.com/openai/v1",
        "openrouter": "https://openrouter.ai/api/v1",
        "deepseek": "https://api.deepseek.com/v1",
        "together": "https://api.together.xyz/v1",
        "ollama_compatible": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
    }
    return urls.get(provider_id, os.getenv("OPENAI_COMPATIBLE_BASE_URL", "https://api.openai.com/v1"))


def parse_response(request_id: str, content: str) -> AiTaskResponse:
    cleaned = content.strip().removeprefix("```json").removesuffix("```").strip()
    data: dict[str, Any] = json.loads(cleaned)
    data["id"] = request_id
    data.setdefault("suggestions", [])
    return AiTaskResponse.model_validate(data)

