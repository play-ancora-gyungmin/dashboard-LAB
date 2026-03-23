import type { AppLocale } from "@/lib/locale";
import type { SignalWriterAiRunner, SignalWriterDraftMode, SignalWriterSignal } from "@/lib/types";

export type SignalWriterRunnerAvailability = Record<SignalWriterAiRunner, boolean>;

export interface SignalWriterRecommendation {
  mode: SignalWriterDraftMode;
  runner: SignalWriterAiRunner;
  reason: string;
  criteria: string[];
}

export function getDefaultSignalWriterRunnerAvailability(): SignalWriterRunnerAvailability {
  return {
    auto: true,
    claude: false,
    codex: false,
    gemini: false,
    openai: false,
    template: true,
  };
}

export function recommendSignalWriterSetup(
  signal: SignalWriterSignal,
  locale: AppLocale,
  availability: SignalWriterRunnerAvailability,
): SignalWriterRecommendation {
  const haystack = [
    signal.title,
    signal.summary,
    signal.whyItMatters,
    signal.categoryLabel,
    signal.sourceName,
    signal.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  const isSecurity = hasOneOf(haystack, [
    "security",
    "breach",
    "vulnerability",
    "cve",
    "policy",
    "compliance",
    "보안",
    "취약점",
    "정책",
  ]);
  const isOpinionHeavy = hasOneOf(haystack, [
    "opinion",
    "debate",
    "why",
    "future",
    "controvers",
    "take",
    "관점",
    "왜",
    "미래",
    "논쟁",
  ]);
  const isReleaseLike = hasOneOf(haystack, [
    "launch",
    "release",
    "update",
    "preview",
    "beta",
    "announc",
    "shipped",
    "introduc",
    "출시",
    "업데이트",
    "공개",
    "베타",
  ]);
  const isPracticalTool = hasOneOf(haystack, [
    "cli",
    "sdk",
    "tool",
    "agent",
    "api",
    "workflow",
    "automation",
    "npm",
    "open source",
    "개발",
    "도구",
    "워크플로",
    "자동화",
  ]);

  const mode = pickMode({
    isOpinionHeavy,
    isSecurity,
    isReleaseLike,
    isPracticalTool,
    score: signal.score,
  });
  const runner = pickRunner(mode, availability);

  return {
    mode,
    runner,
    reason: buildReason(locale, mode, runner),
    criteria: buildCriteria(locale, {
      isOpinionHeavy,
      isSecurity,
      isReleaseLike,
      isPracticalTool,
      signal,
      runner,
    }),
  };
}

function pickMode(input: {
  isOpinionHeavy: boolean;
  isSecurity: boolean;
  isReleaseLike: boolean;
  isPracticalTool: boolean;
  score: number;
}): SignalWriterDraftMode {
  if (input.isOpinionHeavy) {
    return "opinion";
  }

  if (input.isSecurity) {
    return "insight";
  }

  if (input.isPracticalTool && input.score >= 75) {
    return "viral";
  }

  if (input.isReleaseLike) {
    return "news-brief";
  }

  if (input.isPracticalTool) {
    return "insight";
  }

  return "viral";
}

function pickRunner(
  mode: SignalWriterDraftMode,
  availability: SignalWriterRunnerAvailability,
): SignalWriterAiRunner {
  const priorities: Record<SignalWriterDraftMode, SignalWriterAiRunner[]> = {
    "news-brief": ["gemini", "claude", "codex", "openai", "template"],
    insight: ["codex", "claude", "gemini", "openai", "template"],
    opinion: ["claude", "gemini", "codex", "openai", "template"],
    viral: ["claude", "gemini", "codex", "openai", "template"],
  };

  return priorities[mode].find((runner) => availability[runner]) ?? "template";
}

function buildReason(
  locale: AppLocale,
  mode: SignalWriterDraftMode,
  runner: SignalWriterAiRunner,
) {
  if (locale === "en") {
    if (runner === "template") {
      return "No AI runner is ready right now, so use the recommended mode as a structure guide first.";
    }

    const modeLabel = {
      "news-brief": "news brief",
      insight: "insight",
      opinion: "opinion",
      viral: "viral",
    }[mode];

    return `Recommended: ${modeLabel} mode with ${runner} for the cleanest first draft on this signal.`;
  }

  if (runner === "template") {
    return "지금 바로 쓸 수 있는 AI 러너가 없어서, 추천 모드를 기준으로 템플릿 초안을 먼저 잡는 쪽이 맞습니다.";
  }

  const modeLabel = {
    "news-brief": "뉴스 요약형",
    insight: "인사이트형",
    opinion: "의견형",
    viral: "바이럴형",
  }[mode];

  return `추천: ${modeLabel} + ${formatRunnerLabel(locale, runner)} 조합이 이 시그널의 첫 초안에 가장 잘 맞습니다.`;
}

function buildCriteria(
  locale: AppLocale,
  input: {
    isOpinionHeavy: boolean;
    isSecurity: boolean;
    isReleaseLike: boolean;
    isPracticalTool: boolean;
    signal: SignalWriterSignal;
    runner: SignalWriterAiRunner;
  },
) {
  const criteria: string[] = [];

  if (input.isOpinionHeavy) {
    criteria.push(
      locale === "en"
        ? "The signal already invites a take, so a point-of-view post will feel stronger than a summary."
        : "이 신호는 해석이 붙을수록 힘이 생겨서, 단순 요약보다 관점형 글이 더 잘 맞습니다.",
    );
  }

  if (input.isSecurity) {
    criteria.push(
      locale === "en"
        ? "Security and policy stories usually perform better when translated into operational impact."
        : "보안·정책 이슈는 헤드라인보다 실무 영향으로 번역했을 때 반응이 더 좋습니다.",
    );
  }

  if (input.isReleaseLike) {
    criteria.push(
      locale === "en"
        ? "It reads like a fresh release/update, so speed and clarity matter more than long commentary."
        : "지금 막 나온 릴리즈/업데이트 성격이 강해서, 길게 말하기보다 빠르고 선명하게 정리하는 편이 좋습니다.",
    );
  }

  if (input.isPracticalTool) {
    criteria.push(
      locale === "en"
        ? "Builder-facing tools tend to travel further when you frame them as workflow change, not product news."
        : "빌더용 툴은 제품 소개보다 워크플로 변화로 풀었을 때 저장/공유가 더 잘 일어납니다.",
    );
  }

  criteria.push(
    locale === "en"
      ? `Signal score ${Math.round(input.signal.score)} suggests this is worth a sharper post, not just a headline relay.`
      : `시그널 점수 ${Math.round(input.signal.score)}점 수준이면 단순 전달보다 한 단계 더 날카로운 글이 어울립니다.`,
  );

  criteria.push(
    locale === "en"
      ? `Best available runner now: ${formatRunnerLabel(locale, input.runner)}.`
      : `현재 사용 가능한 최적 러너: ${formatRunnerLabel(locale, input.runner)}.`,
  );

  return criteria.slice(0, 4);
}

function formatRunnerLabel(locale: AppLocale, runner: SignalWriterAiRunner) {
  const labels = {
    ko: {
      auto: "자동 선택",
      claude: "Claude",
      codex: "Codex",
      gemini: "Gemini",
      openai: "OpenAI",
      template: "템플릿",
    },
    en: {
      auto: "Auto",
      claude: "Claude",
      codex: "Codex",
      gemini: "Gemini",
      openai: "OpenAI",
      template: "Template",
    },
  };

  return labels[locale][runner];
}

function hasOneOf(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}
