"use client";

import { useLocale } from "@/components/layout/LocaleProvider";
import { getAiSkillsCopy } from "@/features/ai-skills/copy";
import type { SkillTemplate } from "@/lib/types";

interface SkillCardProps {
  skill: SkillTemplate;
  selected: boolean;
  onSelect: (skill: SkillTemplate) => void;
}

export function SkillCard({ skill, selected, onSelect }: SkillCardProps) {
  const { locale } = useLocale();
  const copy = getAiSkillsCopy(locale);

  return (
    <button
      type="button"
      onClick={() => onSelect(skill)}
      className={[
        "rounded-3xl border p-5 text-left transition",
        selected
          ? "border-cyan-400/35 bg-cyan-400/10"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
          {skill.runner}
        </span>
        <span className="text-xs text-[var(--color-muted)]">
          {skill.builtin ? copy.builtin : copy.custom}
        </span>
      </div>
      <p className="mt-4 text-lg font-semibold text-white">{skill.name}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-soft)]">
          {skill.description}
      </p>
    </button>
  );
}
