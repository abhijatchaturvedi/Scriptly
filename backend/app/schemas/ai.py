from pydantic import BaseModel, Field


class WritingContext(BaseModel):
    platform: str
    editor_kind: str
    audience: str | None = None
    relationship: str | None = None
    mode: str | None = None
    surrounding_text: str | None = None


class AiTaskRequest(BaseModel):
    id: str
    task_type: str = Field(alias="taskType")
    text: str
    context: WritingContext
    mode: str | None = None
    stream: bool = False

    model_config = {"populate_by_name": True}


class Suggestion(BaseModel):
    id: str
    original: str
    replacement: str
    category: str
    confidence: float
    explanation: str | None = None


class ToneReport(BaseModel):
    professionalism: int
    politeness: int
    confidence: int
    empathy: int | None = None
    aggression: int | None = None
    emotional_intensity: int | None = None
    passive_aggressiveness: int | None = None
    risk_flags: list[str] = Field(default_factory=list)


class AiTaskResponse(BaseModel):
    id: str
    language_detected: str | None = None
    intent: str | None = None
    output: str | None = None
    explanation: str | None = None
    suggestions: list[Suggestion]
    tone: ToneReport | None = None
