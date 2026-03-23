import path from "node:path";
import matter from "gray-matter";

import type { AppLocale } from "@/lib/locale";
import { DEFAULT_LOCALE, pickLocale } from "@/lib/locale";
import type { SkillTemplate } from "@/lib/types";
import {
  CLAUDE_COMMANDS_DIR,
  CLAUDE_SKILLS_DIR,
  basenameWithoutExtension,
  getFirstMeaningfulLine,
  listDirectories,
  listFiles,
  readUtf8,
} from "@/lib/parsers/shared";

function getBuiltinTemplates(locale: AppLocale): SkillTemplate[] {
  return [
    {
      id: "youtube",
      name: "/youtube",
      description: pickLocale(locale, {
        ko: "유튜브 영상 자막 추출 후 요약과 정리를 수행합니다.",
        en: "Extracts subtitles from a YouTube video and organizes a summary.",
      }),
      runner: "claude",
      promptTemplate: "/youtube {{url}}",
      inputs: [{ name: "url", label: "YouTube URL", type: "url", placeholder: "https://youtube.com/watch?v=...", required: true }],
      icon: "play-circle",
      category: "content",
      builtin: true,
    },
    {
      id: "naver-blog",
      name: "/naver-blog",
      description: pickLocale(locale, {
        ko: "주제를 바탕으로 블로그 초안과 마케팅 문구를 생성합니다.",
        en: "Generates a blog draft and marketing copy from a topic.",
      }),
      runner: "claude",
      promptTemplate: "/naver-blog {{topic}}",
      inputs: [{
        name: "topic",
        label: pickLocale(locale, { ko: "주제", en: "Topic" }),
        type: "text",
        placeholder: pickLocale(locale, { ko: "예: MCP 활용법", en: "e.g. Using MCP in production" }),
        required: true,
      }],
      icon: "pen-tool",
      category: "content",
      builtin: true,
    },
    {
      id: "web-to-markdown",
      name: "/web-to-markdown",
      description: pickLocale(locale, {
        ko: "웹페이지를 마크다운으로 변환하고 정리합니다.",
        en: "Converts a webpage to Markdown and cleans it up.",
      }),
      runner: "claude",
      promptTemplate: "/web-to-markdown {{url}}",
      inputs: [{
        name: "url",
        label: pickLocale(locale, { ko: "웹페이지 URL", en: "Webpage URL" }),
        type: "url",
        placeholder: "https://...",
        required: true,
      }],
      icon: "file-down",
      category: "research",
      builtin: true,
    },
    {
      id: "codex-review",
      name: "codex review",
      description: pickLocale(locale, {
        ko: "지정한 프로젝트에서 변경분을 읽고 코드 리뷰를 수행합니다.",
        en: "Reviews the current changes in a selected project.",
      }),
      runner: "codex",
      promptTemplate:
        "Review the current git diff in {{directory}}. Focus on bugs, regressions, edge cases, and missing tests.",
      inputs: [{
        name: "directory",
        label: pickLocale(locale, { ko: "프로젝트 경로", en: "Project path" }),
        type: "text",
        placeholder: "~/Desktop/my-project",
        required: true,
      }],
      icon: "git-pull-request",
      category: "automation",
      builtin: true,
    },
    {
      id: "custom",
      name: pickLocale(locale, {
        ko: "커스텀 프롬프트",
        en: "Custom prompt",
      }),
      description: pickLocale(locale, {
        ko: "Claude에 자유 프롬프트를 전달합니다.",
        en: "Sends a free-form prompt to Claude.",
      }),
      runner: "claude",
      promptTemplate: "{{prompt}}",
      inputs: [{
        name: "prompt",
        label: pickLocale(locale, { ko: "프롬프트", en: "Prompt" }),
        type: "textarea",
        placeholder: pickLocale(locale, { ko: "실행할 프롬프트를 입력하세요.", en: "Enter the prompt to run." }),
        required: true,
      }],
      icon: "sparkles",
      category: "custom",
      builtin: true,
    },
  ];
}

export async function getSkillTemplates(locale: AppLocale = DEFAULT_LOCALE) {
  const builtinTemplates = getBuiltinTemplates(locale);
  const [commandTemplates, discoveredSkills] = await Promise.all([
    loadCommandTemplates(locale),
    loadSkillFolderTemplates(locale),
  ]);

  return dedupeTemplates([...commandTemplates, ...discoveredSkills, ...builtinTemplates]);
}

async function loadCommandTemplates(locale: AppLocale) {
  const files = await listFiles(CLAUDE_COMMANDS_DIR, (name) => name.endsWith(".md"));
  const templates = await Promise.all(files.map((filePath) => buildDiscoveredTemplate(filePath, "command", locale)));
  return templates.filter((template): template is SkillTemplate => template !== null);
}

async function loadSkillFolderTemplates(locale: AppLocale) {
  const directories = await listDirectories(CLAUDE_SKILLS_DIR);
  const templates = await Promise.all(
    directories.map(async (directoryPath) => {
      const promptPath = path.join(directoryPath, "prompt.md");
      const skillPath = path.join(directoryPath, "skill.md");
      const existingPath = (await readUtf8(promptPath)) ? promptPath : skillPath;
      return buildDiscoveredTemplate(existingPath, "skill", locale);
    }),
  );

  return templates.filter((template): template is SkillTemplate => template !== null);
}

async function buildDiscoveredTemplate(filePath: string, kind: "command" | "skill", locale: AppLocale) {
  const source = await readUtf8(filePath);

  if (!source) {
    return null;
  }

  const parsed = matter(source);
  const rawName = kind === "command" ? basenameWithoutExtension(filePath) : path.basename(path.dirname(filePath));
  const configuredName = typeof parsed.data.name === "string" ? parsed.data.name.trim() : rawName;
  const skillName = configuredName.startsWith("/") ? configuredName : `/${configuredName}`;
  const description = getDescription(parsed.content, parsed.data.description, skillName, locale);
  const builtinTemplate = getBuiltinTemplates(locale).find((template) => template.id === normalizeTemplateId(rawName));

  const template: SkillTemplate = {
    id: normalizeTemplateId(rawName),
    name: skillName,
    description,
    runner: "claude",
    promptTemplate: builtinTemplate?.promptTemplate ?? `${skillName} {{arguments}}`,
    inputs: builtinTemplate?.inputs ?? [{
      name: "arguments",
      label: pickLocale(locale, { ko: "추가 입력", en: "Additional input" }),
      type: "textarea",
      placeholder: pickLocale(locale, {
        ko: "필요한 URL, 키워드, 지시사항을 입력하세요.",
        en: "Enter any URLs, keywords, or instructions you need.",
      }),
      required: false,
    }],
    icon: builtinTemplate?.icon ?? "sparkles",
    category: builtinTemplate?.category ?? "custom",
    builtin: false,
  };

  return template;
}

function dedupeTemplates(templates: SkillTemplate[]) {
  const map = new Map<string, SkillTemplate>();
  templates.forEach((template) => {
    if (!map.has(template.id)) {
      map.set(template.id, template);
    }
  });
  return [...map.values()];
}

function normalizeTemplateId(rawName: string) {
  return rawName.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

function getDescription(
  content: string,
  frontmatterDescription: unknown,
  skillName: string,
  locale: AppLocale,
) {
  if (typeof frontmatterDescription === "string" && frontmatterDescription.trim()) {
    return frontmatterDescription.trim();
  }

  return getFirstMeaningfulLine(content) || pickLocale(locale, {
    ko: `${skillName} 사용자 정의 스킬`,
    en: `${skillName} custom skill`,
  });
}
