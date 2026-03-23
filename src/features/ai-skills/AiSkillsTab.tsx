"use client";

import { useEffect, useMemo, useState } from "react";

import { useLocale } from "@/components/layout/LocaleProvider";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import type { DashboardNavigationMode } from "@/components/layout/TabNav";
import { getAiSkillsCopy } from "@/features/ai-skills/copy";
import { RunHistory } from "@/features/ai-skills/components/RunHistory";
import { RunResultViewer } from "@/features/ai-skills/components/RunResultViewer";
import type { AppLocale } from "@/lib/locale";
import { SkillCard } from "@/features/ai-skills/components/SkillCard";
import { SkillForm } from "@/features/ai-skills/components/SkillForm";
import type { SkillHistoryResponse, SkillRun, SkillRunResponse, SkillTemplate } from "@/lib/types";

interface AiSkillsTabProps {
  mode?: DashboardNavigationMode;
}

export function AiSkillsTab({ mode = "advanced" }: AiSkillsTabProps) {
  const { locale } = useLocale();
  const copy = getAiSkillsCopy(locale);
  const [templates, setTemplates] = useState<SkillTemplate[]>([]);
  const [history, setHistory] = useState<SkillRun[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillTemplate | null>(null);
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [viewerRun, setViewerRun] = useState<SkillRun | null>(null);
  const [error, setError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    void Promise.all([loadTemplates(locale, setTemplates, setSelectedSkill), loadHistory(locale, setHistory)]);
  }, [locale]);

  useEffect(() => {
    if (!history.some((run) => run.status === "queued" || run.status === "running")) {
      return;
    }

    const timer = window.setInterval(() => void loadHistory(locale, setHistory), 2500);
    return () => window.clearInterval(timer);
  }, [history, locale]);

  useEffect(() => {
    if (!feedbackMessage) {
      return;
    }

    const timer = window.setTimeout(() => setFeedbackMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [feedbackMessage]);

  const runningRun = useMemo(
    () => history.find((run) => run.skillId === selectedSkill?.id && (run.status === "queued" || run.status === "running")) ?? null,
    [history, selectedSkill?.id],
  );
  const filteredTemplates = useMemo(
    () => filterTemplates(templates, query),
    [templates, query],
  );
  const isCoreMode = mode === "core";

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_45%),linear-gradient(180deg,_rgba(20,20,20,0.94),_rgba(14,14,14,0.98))] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">AI Skills</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">{copy.heroTitle}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-soft)]">
          {copy.heroDescription}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {copy.tracks.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/8 bg-black/15 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">{item.label}</p>
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
      {feedbackMessage ? (
        <NoticeBanner
          title={copy.feedbackTitle}
          message={feedbackMessage}
        />
      ) : null}
      {error ? <ErrorCard title="AI Skills" message={error} actionLabel={copy.reload} onAction={() => void loadHistory(locale, setHistory)} /> : null}
      <SkillForm
        skill={selectedSkill}
        values={values}
        runningRun={runningRun}
            onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
        onSubmit={() => void runSkill(locale, copy, selectedSkill, values, setHistory, setError, setFeedbackMessage)}
        onCancel={(runId) => void cancelRun(locale, copy, runId, setHistory, setFeedbackMessage)}
      />
      <section className="panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-muted)]">
              {copy.searchTitle}
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-soft)]">
              {copy.searchDescription}
            </p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-3xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-300/40 lg:max-w-md"
          />
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {filteredTemplates.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              selected={selectedSkill?.id === skill.id}
              onSelect={(nextSkill) => {
                setSelectedSkill(nextSkill);
                setValues({});
              }}
            />
          ))}
        </div>
        {filteredTemplates.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-[var(--color-text-soft)]">
            {copy.noResults}
          </p>
        ) : null}
      </section>
      {history.length === 0 ? (
        <EmptyStateCard
          title={copy.emptyTitle}
          message={copy.emptyMessage}
        />
      ) : null}
      <RunHistory
        runs={history}
        onView={setViewerRun}
        onCancel={(runId) => void cancelRun(locale, copy, runId, setHistory, setFeedbackMessage)}
      />
      <RunResultViewer run={viewerRun} onClose={() => setViewerRun(null)} />
    </div>
  );
}

async function loadTemplates(
  locale: AppLocale,
  setTemplates: (value: SkillTemplate[]) => void,
  setSelectedSkill: (value: SkillTemplate | null) => void,
) {
  const response = await fetch("/api/ai-skills/templates", {
    cache: "no-store",
    headers: { "x-dashboard-locale": locale },
  });
  const payload = (await response.json()) as { templates: SkillTemplate[] };
  setTemplates(payload.templates);
  setSelectedSkill(payload.templates[0] ?? null);
}

async function loadHistory(
  locale: AppLocale,
  setHistory: (value: SkillRun[]) => void,
) {
  const response = await fetch("/api/ai-skills/history", {
    cache: "no-store",
    headers: { "x-dashboard-locale": locale },
  });
  const payload = (await response.json()) as SkillHistoryResponse;
  setHistory(payload.runs);
}

async function runSkill(
  locale: AppLocale,
  copy: ReturnType<typeof getAiSkillsCopy>,
  skill: SkillTemplate | null,
  values: Record<string, string>,
  setHistory: (value: SkillRun[]) => void,
  setError: (value: string) => void,
  setFeedbackMessage: (value: string) => void,
) {
  if (!skill) {
    return;
  }

  const response = await fetch("/api/ai-skills/run", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-dashboard-locale": locale },
    body: JSON.stringify({ skillId: skill.id, inputs: values }),
  });
  const payload = (await response.json()) as SkillRunResponse | { error?: { message: string } };

  if (!response.ok) {
    setError("error" in payload ? payload.error?.message ?? copy.runRequestFailed : copy.runRequestFailed);
    return;
  }

  setError("");
  await loadHistory(locale, setHistory);
  setFeedbackMessage(copy.queueAdded(skill.name));
}

async function cancelRun(
  locale: AppLocale,
  copy: ReturnType<typeof getAiSkillsCopy>,
  runId: string,
  setHistory: (value: SkillRun[]) => void,
  setFeedbackMessage: (value: string) => void,
) {
  await fetch(`/api/ai-skills/cancel/${runId}`, {
    method: "POST",
    headers: { "x-dashboard-locale": locale },
  });
  await loadHistory(locale, setHistory);
  setFeedbackMessage(copy.cancelSuccess);
}

function filterTemplates(templates: SkillTemplate[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return templates;
  }

  return templates.filter((template) =>
    [template.name, template.description, template.runner]
      .some((value) => value.toLowerCase().includes(normalized)),
  );
}
