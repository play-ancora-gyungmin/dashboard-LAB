import { NextResponse } from "next/server";

import { getCallToPrdApiError } from "@/lib/call-to-prd/messages";
import { readLocaleFromHeaders } from "@/lib/locale";
import { deleteSavedBundle, loadSavedBundle } from "@/lib/call-to-prd/saved-bundles";

export async function GET(request: Request, { params }: { params: Promise<{ fileName: string }> }) {
  const locale = readLocaleFromHeaders(request.headers);
  const { fileName } = await params;
  const decoded = decodeURIComponent(fileName);

  try {
    const bundle = await loadSavedBundle(decoded);
    if (!bundle) {
      return NextResponse.json({ error: getCallToPrdApiError(locale, "NOT_FOUND", locale === "en" ? "Saved bundle not found." : "파일 없음") }, { status: 404 });
    }

    return NextResponse.json(bundle);
  } catch {
    return NextResponse.json({ error: getCallToPrdApiError(locale, "NOT_FOUND", locale === "en" ? "Saved bundle not found." : "파일 없음") }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ fileName: string }> }) {
  const locale = readLocaleFromHeaders(request.headers);
  const { fileName } = await params;
  const decoded = decodeURIComponent(fileName);

  try {
    const deleted = await deleteSavedBundle(decoded);

    if (!deleted) {
      return NextResponse.json({ error: getCallToPrdApiError(locale, "NOT_FOUND", locale === "en" ? "Saved bundle not found." : "파일 없음") }, { status: 404 });
    }

    return NextResponse.json({ deleted: true, entryName: decoded });
  } catch {
    return NextResponse.json({ error: getCallToPrdApiError(locale, "DELETE_FAILED") }, { status: 500 });
  }
}
