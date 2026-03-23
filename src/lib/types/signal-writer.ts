import type { FeedCategoryId } from "@/lib/types/info-hub";

export type SignalWriterVisualMode =
  | "news-flash"
  | "tool-spotlight"
  | "trend-brief"
  | "opinion-angle";

export type SignalWriterVisualAccent =
  | "amber"
  | "cyan"
  | "emerald"
  | "violet"
  | "rose";

export interface SignalWriterVisualStrategy {
  mode: SignalWriterVisualMode;
  accent: SignalWriterVisualAccent;
  badge: string;
  headline: string;
  subline: string;
  footer: string;
}

export interface SignalWriterSignal {
  id: string;
  categoryId: FeedCategoryId;
  categoryLabel: string;
  title: string;
  summary: string;
  sourceName: string;
  link: string;
  publishedAt: string;
  tags: string[];
  thumbnailUrl?: string;
  whyItMatters: string;
  score: number;
}

export interface SignalWriterSignalsResponse {
  items: SignalWriterSignal[];
  generatedAt: string;
  nextRefreshAt: string;
}

export interface SignalWriterDraft {
  id: string;
  signalId: string;
  title: string;
  hook: string;
  shortPost: string;
  threadPosts: string[];
  hashtags: string[];
  whyNow: string;
  postingTips: string[];
  generatedAt: string;
  sourceModel: "openai" | "template";
  visualStrategy: SignalWriterVisualStrategy;
  coverImageUrl: string | null;
  markdownPath: string | null;
  jsonPath: string | null;
}

export interface SignalWriterGenerateRequest {
  signal: SignalWriterSignal;
}

export interface SignalWriterGenerateResponse {
  draft: SignalWriterDraft;
}
