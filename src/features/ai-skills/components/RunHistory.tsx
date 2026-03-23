"use client";

import { useEffect, useState } from "react";

import { useLocale } from "@/components/layout/LocaleProvider";
import { Pagination } from "@/components/common/Pagination";
import { formatAiSkillDate, getAiSkillsCopy } from "@/features/ai-skills/copy";
import type { SkillRun } from "@/lib/types";

interface RunHistoryProps {
  runs: SkillRun[];
  onView: (run: SkillRun) => void;
  onCancel: (runId: string) => void;
}

export function RunHistory({ runs, onView, onCancel }: RunHistoryProps) {
  const { locale } = useLocale();
  const copy = getAiSkillsCopy(locale);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "status">("latest");
  const pageSize = 6;
  const sortedRuns = sortRuns(runs, sortBy);
  const pagedRuns = sortedRuns.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [runs.length, sortBy]);

  return (
    <section className="panel p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-white">{copy.historyTitle}</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/60">
            {copy.resultsCount(runs.length)}
          </span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as "latest" | "oldest" | "status")}
            className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-xs text-white"
          >
            <option value="latest">{copy.sortLatest}</option>
            <option value="oldest">{copy.sortOldest}</option>
            <option value="status">{copy.sortStatus}</option>
          </select>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {runs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-[var(--color-text-soft)]">
            {copy.noHistory}
          </div>
        ) : null}
        {pagedRuns.map((run) => (
          <article key={run.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{run.skillName}</p>
                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  {copy.startedAt} {formatAiSkillDate(locale, run.startedAt)}
                </p>
              </div>
              <span className={statusClassName(run.status)}>{copy.status[run.status]}</span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-soft)]">
              {run.prompt}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onView(run)}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
              >
                {copy.viewResult}
              </button>
              {run.status === "queued" || run.status === "running" ? (
                <button
                  type="button"
                  onClick={() => onCancel(run.id)}
                  className="rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-400/15"
                >
                  {copy.cancel}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <Pagination
        page={page}
        totalItems={sortedRuns.length}
        pageSize={pageSize}
        onChange={setPage}
      />
    </section>
  );
}

function sortRuns(runs: SkillRun[], sortBy: "latest" | "oldest" | "status") {
  const statusRank: Record<SkillRun["status"], number> = {
    running: 0,
    queued: 1,
    failed: 2,
    completed: 3,
  };

  return [...runs].sort((left, right) => {
    if (sortBy === "oldest") {
      return left.startedAt.localeCompare(right.startedAt);
    }

    if (sortBy === "status") {
      return statusRank[left.status] - statusRank[right.status];
    }

    return right.startedAt.localeCompare(left.startedAt);
  });
}

function statusClassName(status: SkillRun["status"]) {
  return [
    "rounded-full border px-3 py-1 text-xs",
    status === "completed"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
      : status === "failed"
        ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
        : "border-amber-300/20 bg-amber-300/10 text-amber-100",
  ].join(" ");
}
