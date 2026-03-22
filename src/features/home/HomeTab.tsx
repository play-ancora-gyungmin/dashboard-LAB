"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { AgentGrid } from "@/features/home/components/AgentGrid";
import { CommandPalette } from "@/features/home/components/CommandPalette";
import { McpPanel } from "@/features/home/components/McpPanel";
import { PinnedBar } from "@/features/home/components/PinnedBar";
import { SkillList } from "@/features/home/components/SkillList";
import { TeamGrid } from "@/features/home/components/TeamGrid";
import { ToolCard } from "@/features/home/components/ToolCard";
import type { DashboardNavigationMode } from "@/components/layout/TabNav";
import { CLIENT_STORAGE_KEYS } from "@/lib/client-keys";
import type { OverviewResponse } from "@/lib/types";

const HOME_SECTION_KEY = CLIENT_STORAGE_KEYS.homeSections;

interface HomeTabProps {
  data: OverviewResponse | null;
  loading?: boolean;
  error?: string | null;
  mode?: DashboardNavigationMode;
}

const ADVANCED_HOME_SECTIONS = new Set(["agents", "teams", "commands", "mcp", "summary"]);

export function HomeTab({
  data,
  loading = false,
  error = null,
  mode = "advanced",
}: HomeTabProps) {
  const safeData = data ?? createEmptyOverviewData();
  const [openSections, setOpenSections] = useState<string[]>(defaultHomeSections(mode));
  const combinedClaudeItems = [...safeData.skills, ...safeData.commands];
  const quickCommands = [
    ...safeData.commands.slice(0, 4).map((command) => ({
      label: command.name,
      value: command.command,
      description: command.description,
    })),
    {
      label: "Codex 실행",
      value: 'codex exec -o /tmp/codex-output.txt "..."',
      description: "Codex CLI 출력을 파일로 저장하는 빠른 실행 템플릿",
    },
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HOME_SECTION_KEY);
      setOpenSections(raw ? (JSON.parse(raw) as string[]) : defaultHomeSections(mode));
    } catch {
      setOpenSections(defaultHomeSections(mode));
    }
  }, [mode]);

  const isAdvancedMode = mode === "advanced";
  const quickStartTracks = isAdvancedMode
    ? [
        {
          label: "프로젝트 기준선",
          title: "Projects와 Doc Hub로 현재 상태를 먼저 파악",
          description: "내 프로젝트 목록, 핵심 문서, 변경 흐름을 먼저 보고 작업 기준선을 맞춥니다.",
        },
        {
          label: "실행 보조",
          title: "CS Helper, AI Skills, Call → PRD로 초안을 만든 뒤 다듬기",
          description: "응답 초안, 반복 작업, 회의/이슈 문서화를 같은 워크스페이스 안에서 이어서 처리합니다.",
        },
        {
          label: "운영/확장",
          title: "필요할 때만 고급 도구 열기",
          description: "에이전트, MCP, 빠른 명령어, 시스템 도구는 익숙해진 뒤 전체 모드에서 사용하는 흐름이 자연스럽습니다.",
        },
      ]
    : [
        {
          label: "1단계",
          title: "Projects로 내 작업 대상부터 확인",
          description: "지금 다루는 프로젝트와 문서가 무엇인지 먼저 파악합니다.",
        },
        {
          label: "2단계",
          title: "CS Helper 또는 Doc Hub로 초안과 문맥 정리",
          description: "고객 응답, 내부 공유, 문서 확인처럼 바로 써먹는 작업부터 시작합니다.",
        },
        {
          label: "3단계",
          title: "Info Hub와 Call → PRD는 필요할 때 추가",
          description: "매일 업데이트와 긴 문서화 작업은 핵심 흐름이 잡힌 뒤에 붙이면 됩니다.",
        },
      ];

  return (
    <div className="flex flex-col gap-8">
      <PinnedBar />
      {loading || error ? (
        <section className="rounded-2xl border border-white/8 bg-[#1e1e1e] p-4 text-sm">
          <p className="font-medium text-white">
            {loading ? "홈 요약 데이터를 불러오는 중입니다." : "홈 요약 데이터를 불러오지 못했습니다."}
          </p>
          {error ? <p className="mt-2 text-[var(--color-muted)]">{error}</p> : null}
        </section>
      ) : null}
      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard label="에이전트" value={safeData.stats.totalAgents} accent="purple" />
        <StatCard label="팀" value={safeData.stats.totalTeams} accent="purple" />
        <StatCard label="Claude 스킬" value={safeData.stats.totalSkills} accent="purple" />
        <StatCard label="Codex 스킬" value={safeData.stats.totalCodexSkills} accent="emerald" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ToolCard tool={safeData.tools.claude} accent="#c084fc" />
        <ToolCard tool={safeData.tools.codex} accent="#34d399" />
        <ToolCard tool={safeData.tools.gemini} accent="#60a5fa" />
      </section>

      <section className="rounded-3xl border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.1),_transparent_42%),linear-gradient(180deg,_rgba(20,20,20,0.94),_rgba(14,14,14,0.98))] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">Workspace Flow</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">이 워크스페이스에서 자주 하는 흐름</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-soft)]">
          이 앱은 녹음 도구 하나를 위한 프로젝트가 아니라, 로컬 AI CLI를 통해 프로젝트 문맥을 읽고 문서 초안, 고객 대응,
          뉴스 확인, 후속 작업 정리까지 이어서 처리하는 개인 워크스페이스입니다.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {quickStartTracks.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/8 bg-black/15 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/70">{item.label}</p>
              <p className="mt-2 text-sm font-medium text-white">{item.title}</p>
              <p className="mt-2 text-xs leading-6 text-[var(--color-text-soft)]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {!isAdvancedMode ? (
        <section className="rounded-2xl border border-cyan-400/15 bg-cyan-950/10 px-4 py-4 text-sm text-cyan-100">
          간단 모드에서는 오늘 작업과 핵심 스킬만 먼저 보여줍니다. 에이전트, 팀, 빠른 명령어, MCP, 정책 요약은 전체 모드에서 확인할 수 있습니다.
        </section>
      ) : null}

      <HomeSection
        id="today-work"
        eyebrow="Today"
        title="오늘 작업"
        openSections={openSections}
        setOpenSections={setOpenSections}
      >
        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">최신 작업 10건</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                오늘 진행한 `Call → PRD`, `CS Helper`, `AI Skills` 작업을 최신순으로 보여줍니다.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/70">
              {safeData.todayWork.length}건
            </span>
          </div>

          {safeData.todayWork.length > 0 ? (
            <div className="mt-4 space-y-3">
              {safeData.todayWork.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/8 bg-black/15 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] ${getTodayWorkBadgeClass(item.source)}`}>
                          {item.badge}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] ${getTodayWorkStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 truncate text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-xs leading-6 text-[var(--color-text-soft)]">{item.summary}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--color-muted)]">{formatWorkTime(item.createdAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/8 px-4 py-4 text-sm text-[var(--color-muted)]">
              오늘 기록된 작업이 없습니다.
            </div>
          )}
        </section>
      </HomeSection>

      {isAdvancedMode ? (
        <>
          <HomeSection
            id="agents"
            eyebrow="Claude 에이전트"
            title="전문 에이전트 목록"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            <AgentGrid agents={safeData.agents} />
          </HomeSection>

          <HomeSection
            id="teams"
            eyebrow="Claude 팀"
            title="팀 커맨드 프리셋"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            <TeamGrid teams={safeData.teams} />
          </HomeSection>

          <HomeSection
            id="commands"
            eyebrow="빠른 명령어"
            title="바로 복사할 수 있는 바로가기"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            <CommandPalette commands={quickCommands} />
          </HomeSection>
        </>
      ) : null}

      <HomeSection
        id="skills"
        eyebrow="스킬"
        title="Claude / Codex 스킬"
        openSections={openSections}
        setOpenSections={setOpenSections}
      >
        <section className="grid gap-4 xl:grid-cols-2">
          <SkillList
            items={combinedClaudeItems}
            title="Claude 스킬 + 커맨드"
            placeholder="Claude 스킬이나 커맨드 검색"
          />
          <SkillList
            items={[...safeData.codex.skills, ...safeData.codex.promptSkills]}
            title="Codex 스킬"
            placeholder="Codex 스킬 검색"
          />
        </section>
      </HomeSection>

      {isAdvancedMode ? (
        <>
          <HomeSection
            id="mcp"
            eyebrow="MCP 서버"
            title="연결된 연동 정보"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            <McpPanel servers={safeData.mcpServers} />
          </HomeSection>

          <HomeSection
            id="summary"
            eyebrow="요약 문서"
            title="Codex / Gemini 정책"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
              <SummaryPanel title="Codex Role 요약" body={safeData.codex.roleSummary || "ROLE.md가 없습니다"} />
              <SummaryPanel title="Gemini 정책" body={safeData.gemini.policySummary || "GEMINI.md가 없습니다"} />
            </section>
          </HomeSection>
        </>
      ) : null}
    </div>
  );
}

function createEmptyOverviewData(): OverviewResponse {
  return {
    timestamp: "",
    tools: {
      claude: { name: "Claude Code", version: "unknown", configPath: "", exists: false },
      codex: { name: "Codex CLI", version: "unknown", configPath: "", exists: false },
      gemini: { name: "Gemini CLI", version: "unknown", configPath: "", exists: false },
    },
    agents: [],
    teams: [],
    skills: [],
    commands: [],
    mcpServers: [],
    codex: {
      version: "unknown",
      skills: [],
      promptSkills: [],
      hasRoleFile: false,
      roleSummary: "",
      roleFilePath: "",
    },
    gemini: {
      version: "unknown",
      authType: "unknown",
      policySummary: "",
      settings: {},
      settingsPath: "",
      policyPath: "",
    },
    stats: {
      totalAgents: 0,
      totalTeams: 0,
      totalSkills: 0,
      totalCommands: 0,
      totalMcpServers: 0,
      totalCodexSkills: 0,
    },
    todayWork: [],
  };
}

function HomeSection({
  id,
  eyebrow,
  title,
  openSections,
  setOpenSections,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  openSections: string[];
  setOpenSections: React.Dispatch<React.SetStateAction<string[]>>;
  children: React.ReactNode;
}) {
  const isOpen = openSections.includes(id);

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={() => toggleHomeSection(id, setOpenSections)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-[#1e1e1e] px-5 py-4 text-left transition-all duration-[150ms] hover:border-white/[.14] hover:bg-[#242424]"
      >
        <SectionHeader eyebrow={eyebrow} title={title} />
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-[150ms] ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen ? children : null}
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-gray-600">
        {eyebrow}
      </p>
      <h2 className="text-lg font-semibold text-[#f0f0f0]">{title}</h2>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  const accentMap: Record<string, string> = {
    purple: "border-purple-500/25 bg-purple-950/20 text-purple-400",
    emerald: "border-emerald-500/25 bg-emerald-950/20 text-emerald-400",
    blue: "border-blue-500/25 bg-blue-950/20 text-blue-400",
  };
  return (
    <div className={`rounded-2xl border p-5 transition-all duration-[150ms] hover:-translate-y-0.5 ${accentMap[accent] ?? accentMap.purple}`}>
      <p className="text-[10px] uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-[#f0f0f0]">{value}</p>
    </div>
  );
}

function SummaryPanel({ title, body }: { title: string; body: string }) {
  return (
    <article className="panel p-6">
      <p className="text-sm text-[var(--color-muted)]">{title}</p>
      <p className="mt-4 text-sm leading-7 text-[var(--color-text-soft)]">{body}</p>
    </article>
  );
}

function toggleHomeSection(
  sectionId: string,
  setOpenSections: React.Dispatch<React.SetStateAction<string[]>>,
) {
  setOpenSections((current) => {
    const next = current.includes(sectionId)
      ? current.filter((item) => item !== sectionId)
      : [...current, sectionId];
    localStorage.setItem(HOME_SECTION_KEY, JSON.stringify(next));
    return next;
  });
}

function defaultHomeSections(mode: DashboardNavigationMode) {
  const sections = ["today-work", "agents", "teams", "commands", "skills", "mcp", "summary"];
  return mode === "advanced"
    ? sections
    : sections.filter((section) => !ADVANCED_HOME_SECTIONS.has(section));
}

function formatWorkTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function getTodayWorkBadgeClass(source: OverviewResponse["todayWork"][number]["source"]) {
  return {
    "call-to-prd": "border border-purple-500/20 bg-purple-900/30 text-purple-200",
    "cs-helper": "border border-cyan-500/20 bg-cyan-900/30 text-cyan-200",
    "ai-skill": "border border-emerald-500/20 bg-emerald-900/30 text-emerald-200",
  }[source];
}

function getTodayWorkStatusClass(status: string) {
  if (status === "completed") {
    return "border border-emerald-500/20 bg-emerald-900/20 text-emerald-300";
  }

  if (status === "failed") {
    return "border border-rose-500/20 bg-rose-900/20 text-rose-300";
  }

  return "border border-amber-500/20 bg-amber-900/20 text-amber-200";
}
