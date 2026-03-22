import { getSkillTemplates } from "@/lib/ai-skills/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ templates: await getSkillTemplates() });
}
