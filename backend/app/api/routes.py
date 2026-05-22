from fastapi import APIRouter

from app.ai.providers import run_provider
from app.ai.router import resolve_routes
from app.schemas.ai import AiTaskRequest, AiTaskResponse, Suggestion

router = APIRouter()


@router.post("/ai/tasks", response_model=AiTaskResponse)
async def run_ai_task(request: AiTaskRequest) -> AiTaskResponse:
    errors: list[str] = []

    for route in resolve_routes(request.task_type):
        try:
            return await run_provider(request, route)
        except Exception as exc:  # noqa: BLE001 - normalized failover response
            errors.append(f"{route.provider_id}: {exc}")

    return local_fallback(request, errors)


@router.get("/ai/routes")
def list_routes() -> dict[str, list[dict[str, str | float]]]:
    return {
        task: [route.__dict__ for route in routes]
        for task, routes in resolve_all_routes().items()
    }


def resolve_all_routes():
    from app.ai.router import DEFAULT_ROUTES

    return DEFAULT_ROUTES


def local_fallback(request: AiTaskRequest, errors: list[str]) -> AiTaskResponse:
    replacement = (
        request.text.replace("revert back", "respond")
        .replace("didn't got", "didn't get")
        .replace("I am having one doubt", "I have a question")
        .replace("do the needful", "take the required action")
    )

    return AiTaskResponse(
        id=request.id,
        language_detected="auto",
        intent=request.task_type,
        output=replacement,
        explanation="No configured provider succeeded. " + "; ".join(errors),
        suggestions=[
            Suggestion(
                id="placeholder",
                original=request.text,
                replacement=replacement,
                category="rewrite",
                confidence=0.35,
                explanation="Local fallback applied.",
            )
        ],
    )
