import type { AppLocale } from "@/lib/locale";
import { DEFAULT_LOCALE, pickLocale } from "@/lib/locale";

export function getAiSkillApiError(
  locale: AppLocale = DEFAULT_LOCALE,
  code:
    | "invalidBody"
    | "runFailed"
    | "notFound"
    | "missingTemplate"
    | "missingInput"
    | "invalidUrl"
    | "invalidPath"
    | "queuedCanceled"
    | "runningCanceled"
    | "outputLimit"
    | "outputLimitHard"
    | "abnormalExit",
  inputLabel?: string,
) {
  const label = inputLabel ?? pickLocale(locale, {
    ko: "입력값",
    en: "Input",
  });

  return pickLocale(locale, {
    ko: {
      invalidBody: "요청 본문 JSON 형식이 올바르지 않습니다.",
      runFailed: "실행 요청을 처리하지 못했습니다.",
      notFound: "실행 이력을 찾을 수 없습니다.",
      missingTemplate: "선택한 스킬 템플릿을 찾을 수 없습니다.",
      missingInput: `${label} 입력이 필요합니다.`,
      invalidUrl: `${label} 형식이 올바르지 않습니다.`,
      invalidPath: "허용된 실행 경로는 홈 디렉터리 또는 연결된 작업 루트 하위만 가능합니다.",
      queuedCanceled: "사용자가 대기 중 작업을 취소했습니다.",
      runningCanceled: "사용자가 실행 중 작업을 취소했습니다.",
      outputLimit: "출력 크기 제한을 초과했습니다.",
      outputLimitHard: "출력 크기 제한(1MB)을 초과했습니다.",
      abnormalExit: "실행이 비정상 종료되었습니다.",
    },
    en: {
      invalidBody: "The request body is not valid JSON.",
      runFailed: "Failed to process the skill run request.",
      notFound: "Could not find the requested skill run.",
      missingTemplate: "Could not find the selected skill template.",
      missingInput: `${label} is required.`,
      invalidUrl: `${label} must be a valid URL.`,
      invalidPath: "Runs are only allowed inside your home directory or configured workspace roots.",
      queuedCanceled: "The queued run was canceled by the user.",
      runningCanceled: "The running task was canceled by the user.",
      outputLimit: "The output exceeded the size limit.",
      outputLimitHard: "The output exceeded the 1MB size limit.",
      abnormalExit: "The process exited unexpectedly.",
    },
  })[code];
}
