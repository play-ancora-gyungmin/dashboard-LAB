import { getAiSkillRecommendations } from "@/lib/info-hub/feed-service";
import { readLocaleFromHeaders } from "@/lib/locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "1";
  const locale = readLocaleFromHeaders(request.headers);
  return Response.json(await getAiSkillRecommendations({ forceRefresh, locale }));
}
