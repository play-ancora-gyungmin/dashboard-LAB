"use client";

import { getInfoHubCategoryLabel, getInfoHubCopy } from "@/features/info-hub/copy";
import type { FeedCategory, FeedCategoryId } from "@/lib/types";
import type { AppLocale } from "@/lib/locale";

interface InfoHubFilterBarProps {
  categories: FeedCategory[];
  category: FeedCategoryId | "all";
  query: string;
  locale: AppLocale;
  copy?: ReturnType<typeof getInfoHubCopy>;
  onChange: (value: FeedCategoryId | "all") => void;
  onQueryChange: (value: string) => void;
}

export function InfoHubFilterBar({ categories, category, query, locale, copy: providedCopy, onChange, onQueryChange }: InfoHubFilterBarProps) {
  const copy = providedCopy ?? getInfoHubCopy(locale);
  return (
    <div className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={copy.filterPlaceholder}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/40"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={chipClass(category === "all")}
        >
          {copy.all}
        </button>
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={chipClass(category === item.id)}
          >
            {getInfoHubCategoryLabel(item, locale)}
          </button>
        ))}
      </div>
    </div>
  );
}

function chipClass(active: boolean) {
  return [
    "rounded-full border px-3 py-2 text-sm transition",
    active
      ? "border-blue-500/40 bg-blue-500/15 text-blue-200"
      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
  ].join(" ");
}
