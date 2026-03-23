"use client";

import { useMemo, useState } from "react";

import { useLocale } from "@/components/layout/LocaleProvider";
import { getInfoHubCategoryLabel, getInfoHubCopy } from "@/features/info-hub/copy";
import { FEED_CATEGORIES, FEED_SOURCES } from "@/lib/info-hub/categories";
import { markAsRead, readBookmarks, toggleBookmark } from "@/lib/info-hub/local-state";
import type { FeedItem } from "@/lib/types";

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  const { locale } = useLocale();
  const copy = getInfoHubCopy(locale);
  const [bookmarks, setBookmarks] = useState(() => readBookmarks());
  const bookmarked = useMemo(() => Boolean(bookmarks[item.id]), [bookmarks, item.id]);
  const category = FEED_CATEGORIES.find((entry) => entry.id === item.categoryId);
  const source = FEED_SOURCES.find((entry) => entry.id === item.sourceId);
  const sourceType = formatSourceType(source?.type, locale, copy);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {category ? (
              <span className={categoryBadgeClass(category.color)}>
                {getInfoHubCategoryLabel(category, locale)}
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/65">
              {sourceType}
            </span>
            <span className="text-xs text-white/40">{item.sourceName}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-white">{locale === "en" ? item.title : item.titleKo || item.title}</h3>
          {locale !== "en" && item.titleKo ? <p className="mt-2 text-xs text-white/45">{item.title}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => setBookmarks(toggleBookmark(item))}
          className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70"
        >
          {bookmarked ? copy.bookmarked : copy.bookmark}
        </button>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/70">{locale === "en" ? item.summary : item.summaryKo || item.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/60">
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs text-white/35">
        {new Date(item.publishedAt).toLocaleString(locale === "en" ? "en-US" : "ko-KR")}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          onClick={() => markAsRead(item.id)}
          className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200"
        >
          {copy.openOriginal}
        </a>
        <a
          href={item.googleTranslateUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/75"
        >
          {copy.translateLink}
        </a>
      </div>
    </article>
  );
}

function formatSourceType(
  type: string | undefined,
  locale: "ko" | "en",
  copy: ReturnType<typeof getInfoHubCopy>,
) {
  if (type === "rss") return "RSS";
  if (type === "scrape") return copy.scrape;
  if (type === "npm-api") return "npm API";
  if (type === "github-api") return "GitHub API";
  return copy.source;
}

function categoryBadgeClass(color: string) {
  const map: Record<string, string> = {
    purple: "border-purple-500/30 bg-purple-500/15 text-purple-200",
    cyan: "border-cyan-500/30 bg-cyan-500/15 text-cyan-200",
    emerald: "border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
    red: "border-red-500/30 bg-red-500/15 text-red-200",
    amber: "border-amber-500/30 bg-amber-500/15 text-amber-200",
    blue: "border-blue-500/30 bg-blue-500/15 text-blue-200",
    teal: "border-teal-500/30 bg-teal-500/15 text-teal-200",
    rose: "border-rose-500/30 bg-rose-500/15 text-rose-200",
    indigo: "border-indigo-500/30 bg-indigo-500/15 text-indigo-200",
  };

  return [
    "rounded-full border px-2.5 py-1 text-xs font-medium",
    map[color] ?? "border-white/10 bg-white/10 text-white/80",
  ].join(" ");
}
