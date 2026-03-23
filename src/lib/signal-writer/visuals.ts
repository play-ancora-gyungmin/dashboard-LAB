import type { AppLocale } from "@/lib/locale";
import type {
  SignalWriterDraft,
  SignalWriterSignal,
  SignalWriterVisualAccent,
  SignalWriterVisualMode,
  SignalWriterVisualStrategy,
} from "@/lib/types";

const CATEGORY_ACCENTS: Record<string, SignalWriterVisualAccent> = {
  "ai-cli-updates": "amber",
  "mcp-ecosystem": "cyan",
  "ai-skill-trends": "violet",
  "github-trending": "emerald",
  "npm-trends": "rose",
  "my-stack-news": "amber",
  "webdev-news": "cyan",
  "korean-dev-news": "rose",
};

export function buildSignalVisualStrategy(
  signal: SignalWriterSignal,
  locale: AppLocale,
  draft?: Pick<SignalWriterDraft, "hook" | "whyNow"> | null,
): SignalWriterVisualStrategy {
  const mode = inferVisualMode(signal, draft);
  const accent = CATEGORY_ACCENTS[signal.categoryId] ?? "amber";

  if (locale === "en") {
    return {
      mode,
      accent,
      badge: buildBadge(signal, mode, locale),
      headline: clampLine(draft?.hook || signal.title, 66),
      subline: clampLine(signal.whyItMatters, 110),
      footer: buildFooter(signal, locale),
    };
  }

  return {
    mode,
    accent,
    badge: buildBadge(signal, mode, locale),
    headline: clampLine(draft?.hook || signal.title, 34),
    subline: clampLine(signal.whyItMatters, 58),
    footer: buildFooter(signal, locale),
  };
}

export function buildSignalCoverImageUrl(
  strategy: SignalWriterVisualStrategy,
  signal: SignalWriterSignal,
) {
  const params = new URLSearchParams({
    title: strategy.headline,
    subtitle: strategy.subline,
    badge: strategy.badge,
    footer: strategy.footer,
    accent: strategy.accent,
    mode: strategy.mode,
    source: signal.sourceName,
  });

  return `/api/signal-writer/cover?${params.toString()}`;
}

function inferVisualMode(
  signal: SignalWriterSignal,
  draft?: Pick<SignalWriterDraft, "hook" | "whyNow"> | null,
): SignalWriterVisualMode {
  const source = `${signal.title} ${signal.summary} ${draft?.hook ?? ""} ${draft?.whyNow ?? ""}`.toLowerCase();

  if (signal.categoryId === "github-trending" || source.includes("stars") || source.includes("트렌드")) {
    return "trend-brief";
  }

  if (
    signal.categoryId === "ai-cli-updates" ||
    signal.categoryId === "my-stack-news" ||
    source.includes("release") ||
    source.includes("launch") ||
    source.includes("update")
  ) {
    return "tool-spotlight";
  }

  if (source.includes("why") || source.includes("matters") || source.includes("관점")) {
    return "opinion-angle";
  }

  return "news-flash";
}

function buildBadge(signal: SignalWriterSignal, mode: SignalWriterVisualMode, locale: AppLocale) {
  if (locale === "en") {
    switch (mode) {
      case "tool-spotlight":
        return "Tool Shift";
      case "trend-brief":
        return "Trend Brief";
      case "opinion-angle":
        return "Perspective";
      default:
        return signal.categoryLabel;
    }
  }

  switch (mode) {
    case "tool-spotlight":
      return "툴 변화";
    case "trend-brief":
      return "트렌드 브리프";
    case "opinion-angle":
      return "관점 요약";
    default:
      return signal.categoryLabel;
  }
}

function buildFooter(signal: SignalWriterSignal, locale: AppLocale) {
  if (locale === "en") {
    return `${signal.sourceName} · ${signal.categoryLabel}`;
  }

  return `${signal.sourceName} · ${signal.categoryLabel}`;
}

function clampLine(value: string, max: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}
