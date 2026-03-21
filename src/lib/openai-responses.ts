import "server-only";

import { getOpenAiApiKey } from "@/lib/runtime-settings";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = process.env.DASHBOARD_LAB_OPENAI_MODEL || "gpt-5-mini";
const OPENAI_TIMEOUT_MS = 90_000;

type ReasoningEffort = "low" | "medium" | "high" | "xhigh";

interface OpenAiResponsePayload {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
}

export function hasOpenAiApiFallback() {
  return Boolean(getOpenAiApiKey());
}

export async function generateOpenAiText(
  prompt: string,
  options?: { model?: string; reasoningEffort?: ReasoningEffort },
) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("OpenAI API 키가 설정되어 있지 않습니다.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model ?? DEFAULT_OPENAI_MODEL,
        input: prompt,
        text: {
          verbosity: "medium",
        },
        reasoning: {
          effort: mapReasoningEffort(options?.reasoningEffort),
        },
      }),
      signal: controller.signal,
    });

    const payload = (await response.json()) as OpenAiResponsePayload;

    if (!response.ok) {
      throw new Error(
        payload.error?.message ?? "OpenAI 응답 생성에 실패했습니다.",
      );
    }

    const text = extractOutputText(payload);
    if (!text) {
      throw new Error("OpenAI 응답이 비어 있습니다.");
    }

    return text;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("OpenAI 응답 생성 타임아웃");
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function extractOutputText(payload: OpenAiResponsePayload) {
  if (payload.output_text?.trim()) {
    return payload.output_text.trim();
  }

  const segments =
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text?.trim() ?? "")
      .filter(Boolean) ?? [];

  return segments.join("\n\n").trim();
}

function mapReasoningEffort(value: ReasoningEffort | undefined) {
  if (value === "xhigh") {
    return "high";
  }

  return value ?? "medium";
}
