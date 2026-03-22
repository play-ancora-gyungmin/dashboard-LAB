#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "[dashboard-lab] macOS bootstrap starting"
echo "[dashboard-lab] First run may take several minutes."
echo "[dashboard-lab] Core tools will be installed automatically when possible."
echo "[dashboard-lab] Audio transcription tools can be added later from onboarding if needed."

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "[dashboard-lab] This bootstrap currently targets macOS only."
  exit 1
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "[dashboard-lab] Homebrew is required before dashboard-LAB can finish setup."
  echo "[dashboard-lab] Install Homebrew first: https://brew.sh"
  echo "[dashboard-lab] Then run Run-Dashboard-LAB.command again."
  exit 1
fi

ensure_formula() {
  local formula="$1"
  if brew list --formula "$formula" >/dev/null 2>&1; then
    echo "[dashboard-lab] $formula already installed"
  else
    echo "[dashboard-lab] installing $formula (this can take a few minutes)"
    brew install "$formula"
  fi
}

ensure_formula node

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[dashboard-lab] preparing pnpm"
  if command -v corepack >/dev/null 2>&1; then
    corepack enable
    corepack prepare pnpm@10.17.1 --activate
  else
    ensure_formula pnpm
  fi
fi

echo "[dashboard-lab] installing node dependencies"
pnpm install

echo "[dashboard-lab] bootstrap complete"
echo "[dashboard-lab] Core setup is complete."
echo "[dashboard-lab] If you want voice transcription later, install ffmpeg / whisper from the app onboarding or manually."
