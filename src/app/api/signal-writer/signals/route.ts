import { getSignalWriterSignals } from "@/lib/signal-writer/ranker";
import { readLocaleFromHeaders } from "@/lib/locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const locale = readLocaleFromHeaders(request.headers);

  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "1";
    return Response.json(await getSignalWriterSignals(locale, { forceRefresh }));
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && error.message
            ? error.message
            : locale === "en"
              ? "Failed to load the signal list."
              : "시그널 목록을 불러오지 못했습니다.",
      },
      { status: 500 },
    );
  }
}
