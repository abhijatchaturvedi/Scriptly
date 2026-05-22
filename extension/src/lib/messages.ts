import type { AiTaskRequest, AiTaskResponse } from "./types";

export type ScriptlyMessage =
  | { type: "SCRIPTLY_AI_TASK"; payload: AiTaskRequest }
  | { type: "SCRIPTLY_AI_TASK_RESULT"; payload: AiTaskResponse }
  | { type: "SCRIPTLY_PROVIDER_HEALTH_CHECK"; providerId: string };

export function sendAiTask(request: AiTaskRequest): Promise<AiTaskResponse> {
  return chrome.runtime.sendMessage({
    type: "SCRIPTLY_AI_TASK",
    payload: request
  } satisfies ScriptlyMessage);
}

