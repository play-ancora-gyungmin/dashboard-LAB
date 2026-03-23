import "server-only";

import { randomUUID } from "node:crypto";

import { hasOpenAiApiFallback, generateOpenAiText } from "@/lib/ai/openai-responses";
import { buildSignalCoverImageUrl, buildSignalVisualStrategy } from "@/lib/signal-writer/visuals";
import type {
  SignalWriterDraft,
  SignalWriterSignal,
} from "@/lib/types";
import type { AppLocale } from "@/lib/locale";

export async function generateSignalWriterDraft(
  signal: SignalWriterSignal,
  locale: AppLocale,
): Promise<SignalWriterDraft> {
  const generatedAt = new Date().toISOString();

  if (hasOpenAiApiFallback()) {
    try {
      const raw = await generateOpenAiText(buildPrompt(signal, locale), {
        model: "gpt-5-mini",
        reasoningEffort: "low",
      });
      const parsed = parseDraftPayload(raw);
      if (parsed) {
        return normalizeDraft(signal, locale, parsed, generatedAt, "openai");
      }
    } catch {
      /* fall back to template */
    }
  }

  return normalizeDraft(signal, locale, buildTemplateDraft(signal, locale), generatedAt, "template");
}

function buildPrompt(signal: SignalWriterSignal, locale: AppLocale) {
  if (locale === "en") {
    return [
      "You are writing a Threads post draft for a solo builder account.",
      "Write in practical, direct English. Avoid hype, clickbait, and fake certainty.",
      "Return strict JSON only with this shape:",
      '{"hook":"string","shortPost":"string","threadPosts":["string"],"hashtags":["string"],"whyNow":"string","postingTips":["string"]}',
      "",
      `Title: ${signal.title}`,
      `Summary: ${signal.summary}`,
      `Source: ${signal.sourceName}`,
      `Category: ${signal.categoryLabel}`,
      `Why it matters: ${signal.whyItMatters}`,
      `Tags: ${signal.tags.join(", ") || "none"}`,
      "",
      "Rules:",
      "- The hook should feel timely and concrete.",
      "- The short post should be one publishable Threads post.",
      "- threadPosts should contain 3 to 5 posts.",
      "- hashtags should contain 3 to 5 items without # symbols.",
      "- postingTips should contain 2 to 3 short tips.",
    ].join("\n");
  }

  return [
    "당신은 빌더 계정을 위한 Threads 초안을 작성합니다.",
    "과장 없이, 실무적으로, 짧고 읽히는 한국어로 씁니다.",
    "반드시 아래 JSON만 반환하세요:",
    '{"hook":"string","shortPost":"string","threadPosts":["string"],"hashtags":["string"],"whyNow":"string","postingTips":["string"]}',
    "",
    `제목: ${signal.title}`,
    `요약: ${signal.summary}`,
    `출처: ${signal.sourceName}`,
    `카테고리: ${signal.categoryLabel}`,
    `왜 중요한가: ${signal.whyItMatters}`,
    `태그: ${signal.tags.join(", ") || "없음"}`,
    "",
    "규칙:",
    "- hook은 타이밍감이 느껴지게.",
    "- shortPost는 바로 올릴 수 있는 한 개의 글.",
    "- threadPosts는 3~5개.",
    "- hashtags는 # 없이 3~5개.",
    "- postingTips는 2~3개 짧게.",
  ].join("\n");
}

function parseDraftPayload(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Partial<SignalWriterDraft>;
    if (
      typeof parsed.hook !== "string" ||
      typeof parsed.shortPost !== "string" ||
      !Array.isArray(parsed.threadPosts)
    ) {
      return null;
    }

    return {
      hook: parsed.hook,
      shortPost: parsed.shortPost,
      threadPosts: parsed.threadPosts.filter((item): item is string => typeof item === "string"),
      hashtags: Array.isArray(parsed.hashtags)
        ? parsed.hashtags.filter((item): item is string => typeof item === "string")
        : [],
      whyNow: typeof parsed.whyNow === "string" ? parsed.whyNow : "",
      postingTips: Array.isArray(parsed.postingTips)
        ? parsed.postingTips.filter((item): item is string => typeof item === "string")
        : [],
    };
  } catch {
    return null;
  }
}

function buildTemplateDraft(signal: SignalWriterSignal, locale: AppLocale) {
  const tags = normalizeTags(signal.tags, locale);

  if (locale === "en") {
    const hook = `Worth watching today: ${signal.title}`;
    return {
      hook,
      shortPost: [
        hook,
        "",
        `${signal.summary}`,
        "",
        `Why it matters: ${signal.whyItMatters}`,
        "",
        `Source: ${signal.sourceName}`,
      ].join("\n"),
      threadPosts: [
        `1/ ${hook}`,
        `2/ ${signal.summary}`,
        `3/ What matters here is simple: ${signal.whyItMatters}`,
        `4/ If this trend keeps moving, it is worth watching before it becomes old news.`,
      ],
      hashtags: tags,
      whyNow: "The signal is recent enough to turn into a timely, useful post today.",
      postingTips: [
        "Lead with the hook, not the article title.",
        "Keep one clear opinion in the second half.",
        "Link the original source in the reply if needed.",
      ],
    };
  }

  const hook = `오늘 눈에 띈 건 이겁니다: ${signal.title}`;
  return {
    hook,
    shortPost: [
      hook,
      "",
      signal.summary,
      "",
      `왜 중요한가: ${signal.whyItMatters}`,
      "",
      `출처: ${signal.sourceName}`,
    ].join("\n"),
    threadPosts: [
      `1/ ${hook}`,
      `2/ ${signal.summary}`,
      `3/ 핵심은 이 변화가 실제 작업 방식에 연결될 수 있다는 점입니다. ${signal.whyItMatters}`,
      "4/ 하루 지나면 그냥 뉴스가 되기 쉬워서, 지금 짧게 관점을 남겨두는 쪽이 낫습니다.",
    ],
    hashtags: tags,
    whyNow: "타이밍이 살아 있을 때 짧은 관점 글로 전환하기 좋은 신호입니다.",
    postingTips: [
      "첫 줄은 기사 제목보다 네 관점을 먼저 보여주세요.",
      "본문은 3문단 안으로 짧게 가져가세요.",
      "출처 링크는 본문보다 댓글/답글에 두는 쪽이 자연스럽습니다.",
    ],
  };
}

function normalizeDraft(
  signal: SignalWriterSignal,
  locale: AppLocale,
  payload: {
    hook: string;
    shortPost: string;
    threadPosts: string[];
    hashtags: string[];
    whyNow: string;
    postingTips: string[];
  },
  generatedAt: string,
  sourceModel: "openai" | "template",
): SignalWriterDraft {
  const visualStrategy = buildSignalVisualStrategy(signal, locale, {
    hook: payload.hook.trim(),
    whyNow: payload.whyNow.trim(),
  });

  return {
    id: randomUUID(),
    signalId: signal.id,
    title: signal.title,
    hook: payload.hook.trim(),
    shortPost: payload.shortPost.trim(),
    threadPosts: payload.threadPosts.map((item) => item.trim()).filter(Boolean).slice(0, 5),
    hashtags: normalizeHashtags(payload.hashtags).slice(0, 5),
    whyNow: payload.whyNow.trim(),
    postingTips: payload.postingTips.map((item) => item.trim()).filter(Boolean).slice(0, 3),
    generatedAt,
    sourceModel,
    visualStrategy,
    coverImageUrl: buildSignalCoverImageUrl(visualStrategy, signal),
    markdownPath: null,
    jsonPath: null,
  };
}

function normalizeHashtags(values: string[]) {
  return [...new Set(values.map((item) => item.replace(/^#+/, "").trim()).filter(Boolean))];
}

function normalizeTags(values: string[], locale: AppLocale) {
  const base = normalizeHashtags(values);
  if (base.length >= 3) {
    return base.slice(0, 5);
  }

  return locale === "en"
    ? normalizeHashtags([...base, "AI", "DevTools", "Builders"])
    : normalizeHashtags([...base, "AI", "개발도구", "빌더"]);
}
