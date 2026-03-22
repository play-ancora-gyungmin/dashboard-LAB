#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

pause_and_exit() {
  local exit_code="${1:-0}"
  echo
  read -r -p "Press Enter to close this window..." _
  exit "$exit_code"
}

handle_error() {
  local exit_code=$?
  echo
  echo "dashboard-LAB could not start."
  echo "Read the messages above for the exact step that failed."
  echo "If this is your first run, make sure Homebrew is installed: https://brew.sh"
  echo "Then run Run-Dashboard-LAB.command again."
  pause_and_exit "$exit_code"
}

trap handle_error ERR

cd "$REPO_ROOT"

echo "dashboard-LAB startup"
echo "This may install missing tools on the first run."
echo "Keep this window open while the app is starting."
echo

bash "$REPO_ROOT/scripts/bootstrap-macos.sh"

echo
echo "dashboard-LAB setup finished."
echo "Opening the local app in your browser..."
echo

node "$REPO_ROOT/scripts/launch-local.mjs"
