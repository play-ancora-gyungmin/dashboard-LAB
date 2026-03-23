"use client";

import { useLocale } from "@/components/layout/LocaleProvider";
import { getInfoHubCopy } from "@/features/info-hub/copy";
import type { AiSkillRecommendationsResponse } from "@/lib/types";

export function AiSkillRecommendations({ data }: { data: AiSkillRecommendationsResponse | null }) {
  const { locale } = useLocale();
  const copy = getInfoHubCopy(locale);

  if (!data || data.sections.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{copy.aiSkillsTitle}</p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            {copy.aiSkillsDescription}
          </p>
        </div>
        {data.projectSignals.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.projectSignals.map((signal) => (
              <span key={signal} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200">
                {copy.currentProject}: {signal}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.sections.map((section) => (
          <article key={section.model} className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-white">{section.model}</h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/55">
                {copy.recommendationsCount(section.items.length)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/55">{section.summary}</p>

            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200">
                      {item.extra?.skillType === "npm-package" ? "npm" : "GitHub"}
                    </span>
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-white/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-white">{locale === "en" ? item.title : item.titleKo || item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-white/65">{item.summary}</p>
                  {item.extra?.recommendationReason ? (
                    <div className="mt-3 rounded-xl border border-amber-500/15 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-100">
                      {copy.recommendationReason}: {item.extra.recommendationReason}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-200"
                    >
                      {copy.openNow}
                    </a>
                    {typeof item.extra?.stars === "number" ? (
                      <span className="text-xs text-white/45">Stars {item.extra.stars.toLocaleString(locale === "en" ? "en-US" : "ko-KR")}</span>
                    ) : null}
                    {typeof item.extra?.weeklyDownloads === "number" ? (
                      <span className="text-xs text-white/45">Score {item.extra.weeklyDownloads.toLocaleString(locale === "en" ? "en-US" : "ko-KR")}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
