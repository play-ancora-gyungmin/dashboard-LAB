import { readLocaleFromHeaders } from "@/lib/locale";
import { getSkillTemplates } from "@/lib/ai-skills/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const locale = readLocaleFromHeaders(request.headers);
  return Response.json({ templates: await getSkillTemplates(locale) });
}
