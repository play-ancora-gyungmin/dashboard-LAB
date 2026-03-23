import type { AppLocale } from "@/lib/locale";
import { pickLocale } from "@/lib/locale";
import type { DocType } from "@/lib/types";

export function getDocHubCopy(locale: AppLocale) {
  return pickLocale(locale, {
    ko: {
      searchPlaceholder: "문서 검색...",
      matchFilename: "파일명",
      matchContent: "본문",
      sortLatest: "최신순",
      sortOldest: "오래된순",
      sortName: "이름순",
      documentCount: (count: number) => `${count}개 문서`,
      close: "닫기",
      selectDocFailed: "문서를 불러오지 못했습니다.",
      filterAll: "전체",
    },
    en: {
      searchPlaceholder: "Search documents...",
      matchFilename: "Filename",
      matchContent: "Content",
      sortLatest: "Latest",
      sortOldest: "Oldest",
      sortName: "Name",
      documentCount: (count: number) => `${count} docs`,
      close: "Close",
      selectDocFailed: "Failed to load the document.",
      filterAll: "All",
    },
  });
}

export function getDocTypeLabel(type: DocType) {
  return ({
    claude: "Claude",
    codex: "Codex",
    gemini: "Gemini",
    general: "General",
  } satisfies Record<DocType, string>)[type];
}

export function formatDocHubDate(locale: AppLocale, value: string) {
  return new Date(value).toLocaleString(locale === "en" ? "en-US" : "ko-KR");
}
