"use client";

import { useEffect, useState } from "react";

import { useLocale } from "@/components/layout/LocaleProvider";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { AiSkillRecommendations } from "@/features/info-hub/components/AiSkillRecommendations";
import { FeedCardGrid } from "@/features/info-hub/components/FeedCardGrid";
import { InfoHubFilterBar } from "@/features/info-hub/components/InfoHubFilterBar";
import { InfoHubPagination } from "@/features/info-hub/components/InfoHubPagination";
import { InfoHubToolbar } from "@/features/info-hub/components/InfoHubToolbar";
import { PackageUpdates } from "@/features/info-hub/components/PackageUpdates";
import { SecurityAudit } from "@/features/info-hub/components/SecurityAudit";
import { TrendingSection } from "@/features/info-hub/components/TrendingSection";
import type { DashboardNavigationMode } from "@/components/layout/TabNav";
import { getInfoHubCopy } from "@/features/info-hub/copy";
import type {
  AiSkillRecommendationsResponse,
  FeedCategory,
  FeedCategoryId,
  FeedResponse,
  FeedSourcesResponse,
  PackageUpdatesResponse,
  SecurityAuditResponse,
  TrendingResponse,
} from "@/lib/types";

const INFO_HUB_CLIENT_TTL_MS = 24 * 60 * 60 * 1000;

type InfoHubSnapshot = {
  aiSkills: AiSkillRecommendationsResponse | null;
  feed: FeedResponse;
  trending: TrendingResponse | null;
  packages: PackageUpdatesResponse | null;
  security: SecurityAuditResponse | null;
  expiresAt: number;
};

let infoHubSourcesCache: FeedCategory[] | null = null;
const infoHubSnapshotCache = new Map<string, InfoHubSnapshot>();

interface InfoHubTabProps {
  mode?: DashboardNavigationMode;
}

export function InfoHubTab({ mode = "advanced" }: InfoHubTabProps) {
  const { locale } = useLocale();
  const copy = getInfoHubCopy(locale);
  const [category, setCategory] = useState<FeedCategoryId | "all">("all");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [aiSkills, setAiSkills] = useState<AiSkillRecommendationsResponse | null>(null);
  const [trending, setTrending] = useState<TrendingResponse | null>(null);
  const [packages, setPackages] = useState<PackageUpdatesResponse | null>(null);
  const [security, setSecurity] = useState<SecurityAuditResponse | null>(null);
  const isCoreMode = mode === "core";

  useEffect(() => {
    void loadStaticSources(setCategories, locale);
  }, [locale]);

  useEffect(() => {
    const cacheKey = buildInfoHubSnapshotKey(category, page, query, locale);
    const cached = infoHubSnapshotCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      setAiSkills(cached.aiSkills);
      setFeed(cached.feed);
      setTrending(cached.trending);
      setPackages(cached.packages);
      setSecurity(cached.security);
      setLoading(false);
      setError("");
      return;
    }

    void loadInfoHub(
      category,
      page,
      query,
      locale,
      setAiSkills,
      setFeed,
      setTrending,
      setPackages,
      setSecurity,
      setLoading,
      setError,
      { cacheKey },
    );
  }, [category, page, query, locale]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_42%),linear-gradient(180deg,_rgba(20,20,20,0.94),_rgba(14,14,14,0.98))] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">Info Hub</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">{copy.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-soft)]">
          {copy.description}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {copy.cards.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/8 bg-black/15 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-200/70">{item.label}</p>
              <p className="mt-2 text-sm font-medium text-white">{item.title}</p>
              <p className="mt-2 text-xs leading-6 text-[var(--color-text-soft)]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
      {isCoreMode ? (
        <NoticeBanner
          tone="info"
          title={copy.coreModeTitle}
          message={copy.coreModeMessage}
        />
      ) : null}
      <InfoHubToolbar
        loading={loading}
        copy={copy}
        onRefresh={() =>
          void loadInfoHub(
            category,
            page,
            query,
            locale,
            setAiSkills,
            setFeed,
            setTrending,
            setPackages,
            setSecurity,
            setLoading,
            setError,
            {
              cacheKey: buildInfoHubSnapshotKey(category, page, query, locale),
              forceRefresh: true,
            },
          )
        }
      />
      <InfoHubFilterBar
        categories={categories}
        category={category}
        query={query}
        locale={locale}
        copy={copy}
        onChange={(value) => { setCategory(value); setPage(1); }}
        onQueryChange={(value) => { setQuery(value); setPage(1); }}
      />
      {error ? <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{error}</p> : null}
      {(category === "all" || category === "ai-skill-trends") ? <AiSkillRecommendations data={aiSkills} /> : null}
      <TrendingSection data={trending} />
      <PackageUpdates data={packages} />
      <SecurityAudit data={security} />
      {feed ? <FeedCardGrid items={feed.items} /> : null}
      {loading && !feed ? <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/65">{copy.loadingFeed}</p> : null}
      {!loading && feed && feed.items.length === 0 ? <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/65">{copy.emptyFeed}</p> : null}
      {feed ? <InfoHubPagination page={feed.page} totalItems={feed.totalItems} pageSize={feed.limit} onChange={setPage} /> : null}
    </div>
  );
}

async function loadStaticSources(setCategories: (value: FeedCategory[]) => void, locale: "ko" | "en") {
  if (infoHubSourcesCache) {
    setCategories(infoHubSourcesCache);
    return;
  }

  const response = await fetch("/api/info-hub/sources", {
    cache: "no-store",
    headers: { "x-dashboard-locale": locale },
  });
  const payload = (await response.json()) as FeedSourcesResponse;
  infoHubSourcesCache = payload.categories;
  setCategories(payload.categories);
}

async function loadInfoHub(
  category: FeedCategoryId | "all",
  page: number,
  query: string,
  locale: "ko" | "en",
  setAiSkills: (value: AiSkillRecommendationsResponse | null) => void,
  setFeed: (value: FeedResponse) => void,
  setTrending: (value: TrendingResponse | null) => void,
  setPackages: (value: PackageUpdatesResponse | null) => void,
  setSecurity: (value: SecurityAuditResponse | null) => void,
  setLoading: (value: boolean) => void,
  setError: (value: string) => void,
  options?: {
    cacheKey?: string;
    forceRefresh?: boolean;
  },
) {
  setLoading(true);
  setError("");

  try {
    const refreshSuffix = options?.forceRefresh ? "&refresh=1" : "";
    const [aiSkillsResult, feedResult, trendingResult, packageResult, securityResult] = await Promise.allSettled([
      loadJson<AiSkillRecommendationsResponse>(`/api/info-hub/ai-skills?refresh=${options?.forceRefresh ? "1" : "0"}`, locale),
      loadJson<FeedResponse>(`/api/info-hub?category=${category}&page=${page}&limit=20&q=${encodeURIComponent(query)}${refreshSuffix}`, locale),
      loadJson<TrendingResponse>(`/api/info-hub/trending?refresh=${options?.forceRefresh ? "1" : "0"}`, locale),
      loadJson<PackageUpdatesResponse>(`/api/info-hub/my-packages?refresh=${options?.forceRefresh ? "1" : "0"}`, locale),
      loadJson<SecurityAuditResponse>(`/api/info-hub/security?refresh=${options?.forceRefresh ? "1" : "0"}`, locale),
    ]);

    const nextAiSkills = aiSkillsResult.status === "fulfilled" ? aiSkillsResult.value : null;
    const nextFeed = feedResult.status === "fulfilled" ? feedResult.value : null;
    const nextTrending = trendingResult.status === "fulfilled" ? trendingResult.value : null;
    const nextPackages = packageResult.status === "fulfilled" ? packageResult.value : null;
    const nextSecurity = securityResult.status === "fulfilled" ? securityResult.value : null;

    setAiSkills(nextAiSkills);

    if (nextFeed) {
      setFeed(nextFeed);
    } else {
      setError(getInfoHubCopy(locale).feedLoadFailed);
    }

    setTrending(nextTrending);
    setPackages(nextPackages);
    setSecurity(nextSecurity);

    if (options?.cacheKey && nextFeed) {
      infoHubSnapshotCache.set(options.cacheKey, {
        aiSkills: nextAiSkills,
        feed: nextFeed,
        trending: nextTrending,
        packages: nextPackages,
        security: nextSecurity,
        expiresAt: Date.now() + INFO_HUB_CLIENT_TTL_MS,
      });
    }
  } finally {
    setLoading(false);
  }
}

async function loadJson<T>(url: string, locale: "ko" | "en"): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "x-dashboard-locale": locale },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function buildInfoHubSnapshotKey(category: FeedCategoryId | "all", page: number, query: string, locale: "ko" | "en") {
  return `${locale}:${category}:${page}:${query.trim().toLowerCase()}`;
}
