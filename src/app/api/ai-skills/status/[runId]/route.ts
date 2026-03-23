import { jsonError } from "@/lib/api/error-response";
import { getAiSkillApiError } from "@/lib/ai-skills/messages";
import { getSkillRun } from "@/lib/ai-skills/runner";
import { readLocaleFromHeaders } from "@/lib/locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ runId: string }> },
) {
  const locale = readLocaleFromHeaders(request.headers);
  const { runId } = await context.params;
  const run = getSkillRun(runId);

  if (!run) {
    return jsonError("AI_SKILL_NOT_FOUND", getAiSkillApiError(locale, "notFound"), 404);
  }

  return Response.json(run);
}
