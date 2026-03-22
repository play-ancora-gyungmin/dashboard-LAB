# dashboard-LAB

[English](README.md) | 한국어

`dashboard-LAB`은 내가 가진 AI CLI 도구를 활용해 프로젝트, 문서, 컴퓨터 작업 흐름을 하나의 대시보드에서 다루게 해주는 로컬 퍼스트 AI 워크스페이스입니다.

`claude`, `codex` 같은 로컬 도구를 터미널 중심이 아니라 더 다루기 쉬운 워크스페이스 형태로 쓰게 해주는 도구라고 보면 됩니다.

## 왜 이 프로젝트를 쓰는가

- 로컬 AI CLI를 터미널 명령어 나열 없이 더 실용적인 UI로 활용할 수 있습니다.
- 비개발자도 프로젝트 문맥, 시스템 상태, 반복 작업 도구를 기반으로 개발자처럼 일할 수 있게 돕습니다.
- 프로젝트 관리, 문서 작업, 고객 응대, 파일 정리, 시스템 액션을 한곳에서 다룰 수 있습니다.
- 뉴스, 트렌드, 의존성 업데이트, 보안 이슈를 매일 갱신된 흐름으로 확인할 수 있습니다.
- 녹음과 전사는 필요할 때 쓰는 부가 기능이지, 제품의 핵심 정체성은 아닙니다.

## 누가 쓰기 좋은가

- 로컬 AI 도구를 더 실무적으로 쓰고 싶은 창업자, 운영자, PM, 비개발자
- 프로젝트 스캔, 문서 열람, AI 스킬, 시스템 도구를 한 화면에서 다루고 싶은 개발자
- `claude`, `codex` 같은 로컬 도구를 이미 쓰고 있지만 더 사용하기 쉬운 인터페이스를 원하는 사용자

## 무엇을 할 수 있나

- `Home`: CLI 도구 상태, 에이전트, 스킬, MCP 연결, 빠른 명령어 확인
- `AI Skills`: 재사용 가능한 AI 워크플로를 실행하고 결과 이력을 관리
- `CS Helper`: 프로젝트 문맥과 고객 메시지를 바탕으로 답변 초안, 내부 메모, 응대용 문안을 생성
- `Projects`: 로컬 프로젝트, git 상태, 포트, env 힌트, 정리 포인트를 확인
- `Doc Hub`: `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `docs/*.md` 같은 프로젝트 문서를 열람
- `File Manager`: Desktop과 Downloads 정리 후보를 검토
- `System`: 시스템 정보, 프로세스, 런타임 상태, 앱 실행 기능 확인
- `Info Hub`: 매일 갱신되는 뉴스, 트렌드, 패키지 업데이트, 보안 체크 확인
- `Call to PRD`: 메모, 전사본, 회의 문맥을 PRD와 실무 문서로 변환

기본 화면은 간단 모드로 시작하며, 시스템 관리나 파일 정리 같은 운영성 탭은 전체 모드에서만 보이게 했습니다.

## CS Helper 용도

`CS Helper`는 단순 텍스트 생성기가 아니라 고객 응대 실무를 빠르게 처리하기 위한 기능입니다.

프로젝트를 고르고 관련 문맥을 불러온 다음, 고객 메시지나 이슈 요약을 넣으면 다음과 같은 결과를 만들 수 있습니다.

- 고객 답변 초안
- 내부 분석 메모
- 프로젝트 문맥이 반영된 응대 옵션
- 톤이나 표현을 바꾼 재생성 버전

매번 프로젝트 배경을 다시 설명하지 않고도, 맥락이 반영된 고객 응답을 빠르게 만들고 싶을 때 유용합니다.

## 핵심 강점

- 내가 가진 로컬 AI CLI를 중심으로 한 워크스페이스
- 내 컴퓨터 안의 프로젝트와 문서를 함께 보는 운영 시야
- 실제 프로젝트 문맥을 활용한 PRD 및 실무 문서 생성
- 뉴스, 트렌드, 의존성 업데이트, 보안 이슈를 매일 확인하는 정보 허브
- 비개발자도 따라가기 쉬운 UI 기반 로컬 워크플로

## 기술 스택

- Next.js 15
- React 19
- Electron 35
- 로컬 `ffmpeg`
- 로컬 `whisper` 또는 `whisper-cli`
- 로컬 `claude` 및/또는 `codex` CLI
- `CS Helper`, `Call to PRD`용 OpenAI API fallback 선택 가능

## 포지셔닝

`dashboard-LAB`의 중심은 로컬 AI 워크스페이스와 운영 대시보드입니다.

녹음 앱이 메인이 아닙니다.

핵심 가치는 로컬 AI, 프로젝트 문맥, 시스템 가시성, 일일 정보 흐름을 한 환경에서 함께 쓰게 해주는 데 있습니다.

오디오 전사와 `Call to PRD`는 여러 기능 중 하나이며, 프로젝트 스캔, 문서 열람, AI 스킬, 파일 정리, 시스템 도구, 일일 업데이트와 함께 들어 있는 부가 워크플로입니다.

## 빠른 시작

### macOS

1. Homebrew를 한 번 설치합니다: <https://brew.sh>
2. `Run-Dashboard-LAB.command`를 더블클릭합니다.

CLI로 실행하려면:

```bash
pnpm setup:mac
pnpm doctor
pnpm launch
```

### Windows / Linux

Windows와 Linux 데스크톱 타깃은 아직 experimental 상태입니다.

```bash
pnpm install
pnpm doctor
pnpm launch
```

## 비개발자용 빠른 시작

macOS에서 바로 써보려면:

1. Homebrew를 한 번 설치합니다.
2. `Run-Dashboard-LAB.command`를 더블클릭합니다.
3. 런처가 필요한 도구를 설치하고 브라우저에서 앱을 열 때까지 기다립니다.

알아둘 점:

- 첫 실행은 몇 분 걸릴 수 있습니다.
- 앱이 실행되는 동안 터미널 창은 열어 두는 편이 안전합니다.
- 중간에 멈추면 터미널 창에 실패한 단계와 다음 조치가 표시됩니다.
- 음성 전사 도구는 선택 사항이므로, 필요할 때 나중에 설치해도 됩니다.

## 요구 사항

핵심 사용 기준:

- Node.js 22+
- `pnpm`
- 로컬 생성용 `claude` CLI 또는 `codex` CLI
- fallback 생성을 위한 OpenAI API key 선택 가능

오디오 워크플로가 필요할 때만:

- `ffmpeg`
- `whisper` 또는 `whisper-cli`
- `models/ggml-base.bin`

## 데스크톱 빌드

개발 모드:

```bash
pnpm assets:icon
pnpm desktop:dev
```

로컬 패키징 빌드:

```bash
pnpm assets:icon
pnpm desktop:build
```

플랫폼별 배포 산출물:

```bash
pnpm assets:icon
pnpm desktop:dist:mac
pnpm desktop:dist:win
pnpm desktop:dist:linux
```

## 개발 명령

```bash
pnpm dev
pnpm lint
pnpm type-check
pnpm build
```

`pnpm install` 중 네이티브 빌드 스크립트가 차단되면 다음을 실행합니다.

```bash
pnpm approve-builds
pnpm rebuild electron node-pty
```

## 문제 해결

- `Homebrew is required`가 보이면 <https://brew.sh> 에서 Homebrew를 설치한 뒤 다시 실행합니다.
- `ffmpeg`가 없으면 음성 변환 기능만 제한됩니다. voice 워크플로가 필요할 때 macOS에서 `brew install ffmpeg`를 실행합니다.
- `whisper` 또는 `whisper-cli`가 없으면 음성 전사 기능만 제한됩니다. voice 워크플로가 필요할 때 macOS에서 `brew install whisper-cpp`를 실행합니다.
- 브라우저가 자동으로 안 열리면 `pnpm launch`를 실행하고 터미널에 표시된 로컬 주소를 직접 엽니다.
- PRD 생성이 안 되면 `claude` 또는 `codex` CLI를 설치하거나, 온보딩에서 OpenAI API 키를 저장합니다.

## 공개 파일

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [LICENSE](LICENSE)

## 현재 배포 상태

- macOS: 공개 테스트용으로 가장 적합
- Windows: experimental
- Linux: experimental
- 모든 의존성을 완전 무설정으로 처리하는 온보딩: 아직 미완료

## 프라이버시

고객 녹음, 전사본, 비공개 생성 문서, 로컬 상태 파일, API 키는 커밋하지 마세요.

## 라이선스

MIT
