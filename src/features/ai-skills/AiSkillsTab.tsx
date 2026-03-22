"use client";

import { useEffect, useMemo, useState } from "react";

import { ErrorCard } from "@/components/ui/ErrorCard";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import type { DashboardNavigationMode } from "@/components/layout/TabNav";
import { RunHistory } from "@/features/ai-skills/components/RunHistory";
import { RunResultViewer } from "@/features/ai-skills/components/RunResultViewer";
import { SkillCard } from "@/features/ai-skills/components/SkillCard";
import { SkillForm } from "@/features/ai-skills/components/SkillForm";
import type { SkillHistoryResponse, SkillRun, SkillRunResponse, SkillTemplate } from "@/lib/types";

interface AiSkillsTabProps {
  mode?: DashboardNavigationMode;
}

export function AiSkillsTab({ mode = "advanced" }: AiSkillsTabProps) {
  const [templates, setTemplates] = useState<SkillTemplate[]>([]);
  const [history, setHistory] = useState<SkillRun[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillTemplate | null>(null);
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [viewerRun, setViewerRun] = useState<SkillRun | null>(null);
  const [error, setError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    void Promise.all([loadTemplates(setTemplates, setSelectedSkill), loadHistory(setHistory)]);
  }, []);

  useEffect(() => {
    if (!history.some((run) => run.status === "queued" || run.status === "running")) {
      return;
    }

    const timer = window.setInterval(() => void loadHistory(setHistory), 2500);
    return () => window.clearInterval(timer);
  }, [history]);

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
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">반복 작업을 템플릿처럼 실행하는 탭</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-soft)]">
          프로젝트 조사, 문서 초안, 리뷰 보조처럼 자주 반복되는 작업을 한 번의 입력 폼으로 실행합니다. 처음에는 스킬 하나를
          선택하고 필요한 값만 채운 뒤 실행하면 충분합니다.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              label: "프로젝트 조사",
              title: "현재 코드베이스나 폴더를 빠르게 훑기",
              description: "구조 파악, 체크리스트 생성, 리팩터 준비 같은 탐색성 작업에 적합합니다.",
            },
            {
              label: "문서 초안",
              title: "PRD, 요약, 제안서 초안 만들기",
              description: "반복되는 입력 양식을 저장해두고 문서 초안을 일정한 형식으로 뽑을 수 있습니다.",
            },
            {
              label: "리뷰 보조",
              title: "코드 리뷰나 QA 메모 정리하기",
              description: "검토 포인트를 빠르게 재사용하고 실행 히스토리까지 이어서 볼 수 있습니다.",
            },
          ].map((item) => (
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
          title="간단 모드 안내"
          message="간단 모드에서는 먼저 템플릿 하나를 골라 실행하는 흐름만 생각하면 됩니다. 고급 자동화보다 반복되는 조사, 초안 작성, 리뷰 보조 작업부터 시작하는 편이 안정적입니다."
        />
      ) : null}
      {feedbackMessage ? (
        <NoticeBanner
          title="반영되었습니다"
          message={feedbackMessage}
        />
      ) : null}
      {error ? <ErrorCard title="AI Skills" message={error} actionLabel="다시 불러오기" onAction={() => void loadHistory(setHistory)} /> : null}
      <SkillForm
        skill={selectedSkill}
        values={values}
        runningRun={runningRun}
            onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
        onSubmit={() => void runSkill(selectedSkill, values, setHistory, setError, setFeedbackMessage)}
        onCancel={(runId) => void cancelRun(runId, setHistory, setFeedbackMessage)}
      />
      <section className="panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-muted)]">
              스킬 탐색
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-soft)]">
              이름, 설명, runner 기준으로 빠르게 찾을 수 있습니다.
            </p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: youtube, notion, codex review"
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
            검색 결과가 없습니다.
          </p>
        ) : null}
      </section>
      {history.length === 0 ? (
        <EmptyStateCard
          title="아직 실행된 스킬이 없습니다."
          message="위에서 스킬을 고르고 입력값을 채운 뒤 실행하면, 여기서 실행 히스토리와 결과를 계속 이어서 확인할 수 있습니다."
        />
      ) : null}
      <RunHistory
        runs={history}
        onView={setViewerRun}
        onCancel={(runId) => void cancelRun(runId, setHistory, setFeedbackMessage)}
      />
      <RunResultViewer run={viewerRun} onClose={() => setViewerRun(null)} />
    </div>
  );
}

async function loadTemplates(
  setTemplates: (value: SkillTemplate[]) => void,
  setSelectedSkill: (value: SkillTemplate | null) => void,
) {
  const response = await fetch("/api/ai-skills/templates", { cache: "no-store" });
  const payload = (await response.json()) as { templates: SkillTemplate[] };
  setTemplates(payload.templates);
  setSelectedSkill(payload.templates[0] ?? null);
}

async function loadHistory(setHistory: (value: SkillRun[]) => void) {
  const response = await fetch("/api/ai-skills/history", { cache: "no-store" });
  const payload = (await response.json()) as SkillHistoryResponse;
  setHistory(payload.runs);
}

async function runSkill(
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skillId: skill.id, inputs: values }),
  });
  const payload = (await response.json()) as SkillRunResponse | { error?: { message: string } };

  if (!response.ok) {
    setError("error" in payload ? payload.error?.message ?? "실행 요청에 실패했습니다." : "실행 요청에 실패했습니다.");
    return;
  }

  setError("");
  await loadHistory(setHistory);
  setFeedbackMessage(`${skill.name} 실행을 작업 큐에 추가했습니다.`);
}

async function cancelRun(
  runId: string,
  setHistory: (value: SkillRun[]) => void,
  setFeedbackMessage: (value: string) => void,
) {
  await fetch(`/api/ai-skills/cancel/${runId}`, { method: "POST" });
  await loadHistory(setHistory);
  setFeedbackMessage("선택한 스킬 실행을 취소했습니다.");
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
