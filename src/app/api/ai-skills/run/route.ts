import {
  getErrorMessage,
  isJsonParseError,
  jsonError,
} from "@/lib/api/error-response";
import { getAiSkillApiError } from "@/lib/ai-skills/messages";
import { queueSkillRun } from "@/lib/ai-skills/runner";
import { readLocaleFromHeaders } from "@/lib/locale";
import type { SkillRunRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const locale = readLocaleFromHeaders(request.headers);

  try {
    const payload = (await request.json()) as SkillRunRequest;
    return Response.json(await queueSkillRun(payload, locale));
  } catch (error) {
    if (isJsonParseError(error)) {
      return jsonError("INVALID_BODY", getAiSkillApiError(locale, "invalidBody"), 400);
    }

    if (error instanceof Error && error.name === "SkillRunnerInputError") {
      return jsonError("INVALID_INPUT", error.message, 400);
    }

    return jsonError(
      "AI_SKILL_RUN_FAILED",
      getErrorMessage(error, getAiSkillApiError(locale, "runFailed")),
      500,
    );
  }
}
