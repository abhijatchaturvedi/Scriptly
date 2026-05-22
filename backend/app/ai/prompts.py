from app.schemas.ai import AiTaskRequest


def build_messages(request: AiTaskRequest) -> tuple[str, str]:
    system = (
        "You are Scriptly, an AI writing assistant for Indian English, Hindi, and Hinglish. "
        "You understand Indian corporate phrasing, transliterated Hindi, code-switching, audience, "
        "relationship, and platform context. Preserve meaning and emotional intent. Do not invent facts. "
        "Return valid JSON only."
    )

    user = f"""{task_instruction(request)}

Context:
{request.context.model_dump_json(indent=2)}

Text:
{request.text}

Return only JSON:
{{
  "language_detected": "indian_english|hindi|hinglish|english|mixed",
  "intent": "short intent label",
  "output": "best final text when applicable",
  "explanation": "short optional explanation",
  "suggestions": [
    {{
      "id": "stable id",
      "original": "original phrase",
      "replacement": "replacement phrase",
      "category": "grammar|tone|clarity|hinglish|rewrite",
      "confidence": 0.0,
      "explanation": "brief reason"
    }}
  ],
  "tone": {{
    "professionalism": 0,
    "politeness": 0,
    "confidence": 0,
    "empathy": 0,
    "aggression": 0,
    "emotional_intensity": 0,
    "passive_aggressiveness": 0,
    "risk_flags": []
  }}
}}"""

    return system, user


def task_instruction(request: AiTaskRequest) -> str:
    match request.task_type:
        case "grammar_correction":
            return "Correct grammar, spelling, punctuation, awkward phrasing, and Indian English issues."
        case "rewrite":
            return f"Rewrite for {request.mode or 'professional'} tone. Improve clarity, impact, and context-fit."
        case "tone_analysis":
            return "Analyze emotional tone and flag wording that may sound rude, defensive, weak, or unclear."
        case "hinglish_transform":
            return "Handle Hindi-English code-switching and preserve cultural nuance."
        case "humanize":
            return "Make the text sound naturally human and reduce robotic AI cadence."
        case "smart_reply":
            return "Generate a context-aware reply in the requested mode."
        case "resume_optimize":
            return "Improve resume or LinkedIn wording using action verbs and supported impact."
        case "prompt_enhance":
            return "Improve this AI prompt. Do not answer the prompt."
        case _:
            return "Improve the text while preserving meaning."

