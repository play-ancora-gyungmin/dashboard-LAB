import { getSkillHistory } from "@/lib/ai-skills/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(getSkillHistory());
}
