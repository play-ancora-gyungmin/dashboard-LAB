"use client";

import { useEffect, useState } from "react";

import { AiSkillRecommendations } from "@/features/info-hub/components/AiSkillRecommendations";
import { FeedCardGrid } from "@/features/info-hub/components/FeedCardGrid";
import { InfoHubFilterBar } from "@/features/info-hub/components/InfoHubFilterBar";
import { InfoHubPagination } from "@/features/info-hub/components/InfoHubPagination";
import { InfoHubToolbar } from "@/features/info-hub/components/InfoHubToolbar";
import { PackageUpdates } from "@/features/info-hub/components/PackageUpdates";
import { SecurityAudit } from "@/features/info-hub/components/SecurityAudit";
import { TrendingSection } from "@/features/info-hub/components/TrendingSection";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import type { DashboardNavigationMode } from "@/components/layout/TabNav";
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
    void loadStaticSources(setCategories);
  }, []);

  useEffect(() => {
    const cacheKey = buildInfoHubSnapshotKey(category, page, query);
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
      setAiSkills,
      setFeed,
      setTrending,
      setPackages,
      setSecurity,
      setLoading,
      setError,
      { cacheKey },
    );
  }, [category, page, query]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_42%),linear-gradient(180deg,_rgba(20,20,20,0.94),_rgba(14,14,14,0.98))] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">Info Hub</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">매일 확인할 뉴스, 패키지 변화, 보안 이슈를 모아보는 탭</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-soft)]">
          AI 트렌드, 기술 뉴스, 패키지 업데이트, 보안 점검 결과를 한 화면에서 확인합니다. 일을 시작하기 전에 오늘 어떤 변화가 있었는지
          빠르게 훑어보는 용도로 쓰는 탭입니다.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              label: "오늘 이슈",
              title: "기술 뉴스와 트렌드 먼저 파악",
              description: "카테고리별 피드를 보면서 오늘 확인할 만한 이슈를 빠르게 추립니다.",
            },
            {
              label: "내 환경 변화",
              title: "패키지와 보안 상태 확인",
              description: "내 프로젝트에 영향을 줄 수 있는 업데이트와 감사 결과를 함께 봅니다.",
            },
            {
              label: "후속 연결",
              title: "필요하면 AI Skills나 Projects로 이어가기",
              description: "발견한 이슈를 바로 조사하거나 프로젝트 작업으로 넘길 때 기준점이 됩니다.",
            },
          ].map((item) => (
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
          title="간단 모드 안내"
          message="처음에는 전체 카테고리로 두고 트렌드와 기사 목록만 훑어보면 됩니다. 패키지 업데이트와 보안 항목은 익숙해진 뒤 필요한 때만 자세히 보면 충분합니다."
        />
      ) : null}
      <InfoHubToolbar
        loading={loading}
        onRefresh={() =>
          void loadInfoHub(
            category,
            page,
            query,
            setAiSkills,
            setFeed,
            setTrending,
            setPackages,
            setSecurity,
            setLoading,
            setError,
            {
              cacheKey: buildInfoHubSnapshotKey(category, page, query),
              forceRefresh: true,
            },
          )
        }
      />
      <InfoHubFilterBar
        categories={categories}
        category={category}
        query={query}
        onChange={(value) => { setCategory(value); setPage(1); }}
        onQueryChange={(value) => { setQuery(value); setPage(1); }}
      />
      {error ? <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{error}</p> : null}
      {(category === "all" || category === "ai-skill-trends") ? <AiSkillRecommendations data={aiSkills} /> : null}
      <TrendingSection data={trending} />
      <PackageUpdates data={packages} />
      <SecurityAudit data={security} />
      {feed ? <FeedCardGrid items={feed.items} /> : null}
      {loading && !feed ? <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/65">기사와 패키지 정보를 불러오는 중입니다.</p> : null}
      {!loading && feed && feed.items.length === 0 ? <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/65">현재 표시할 기사가 없습니다. 다른 카테고리를 선택하거나 잠시 후 새로고침해 보세요.</p> : null}
      {feed ? <InfoHubPagination page={feed.page} totalItems={feed.totalItems} pageSize={feed.limit} onChange={setPage} /> : null}
    </div>
  );
}

async function loadStaticSources(setCategories: (value: FeedCategory[]) => void) {
  if (infoHubSourcesCache) {
    setCategories(infoHubSourcesCache);
    return;
  }

  const response = await fetch("/api/info-hub/sources", { cache: "no-store" });
  const payload = (await response.json()) as FeedSourcesResponse;
  infoHubSourcesCache = payload.categories;
  setCategories(payload.categories);
}

async function loadInfoHub(
  category: FeedCategoryId | "all",
  page: number,
  query: string,
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
      loadJson<AiSkillRecommendationsResponse>(`/api/info-hub/ai-skills?refresh=${options?.forceRefresh ? "1" : "0"}`),
      loadJson<FeedResponse>(`/api/info-hub?category=${category}&page=${page}&limit=20&q=${encodeURIComponent(query)}${refreshSuffix}`),
      loadJson<TrendingResponse>(`/api/info-hub/trending?refresh=${options?.forceRefresh ? "1" : "0"}`),
      loadJson<PackageUpdatesResponse>(`/api/info-hub/my-packages?refresh=${options?.forceRefresh ? "1" : "0"}`),
      loadJson<SecurityAuditResponse>(`/api/info-hub/security?refresh=${options?.forceRefresh ? "1" : "0"}`),
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
      setError("기사 목록을 불러오지 못했습니다.");
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

async function loadJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function buildInfoHubSnapshotKey(category: FeedCategoryId | "all", page: number, query: string) {
  return `${category}:${page}:${query.trim().toLowerCase()}`;
}
