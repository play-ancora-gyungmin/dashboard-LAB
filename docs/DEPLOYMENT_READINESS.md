# dashboard-LAB Deployment Readiness

## Release Scope

- ship `dashboard-LAB` as a local-first Electron desktop app
- support packaged releases for macOS, Windows, and Linux
- allow non-developer users to finish onboarding and run core workflows
- keep local CLI usage optional when OpenAI fallback is configured

## Pre-Release Checks

Confirmed in repository and CI:
- `pnpm lint`
- `pnpm type-check`
- `pnpm build`
- `pnpm desktop:build`
- multi-platform tagged release workflow
- packaged artifacts published for macOS, Windows, and Linux

Confirmed in product behavior:
- onboarding can save project root, PRD output directory, and CS context directory
- onboarding can save an OpenAI API key for fallback usage
- missing audio tooling is surfaced in onboarding with install guidance and partial install automation

## Blockers

Hard blockers for calling this "ready for every user":
- clean-machine installer smoke tests have not been completed for macOS, Windows, and Linux
- Windows and Linux are still marked experimental in product docs
- zero-config onboarding is not complete for every dependency path
- macOS code signing and notarization are not done

Soft blockers for broad public rollout:
- some flows still work best with preinstalled local AI CLI tools
- Windows/Linux install automation is weaker than macOS
- embedded terminal remains a packaged-build follow-up decision

## Smoke Tests

Minimum real-user smoke path per platform:

1. install the packaged app
2. launch and finish onboarding
3. confirm project root is reflected in `Projects`
4. confirm docs appear in `Doc Hub`
5. generate one `CS Helper` response
6. generate one text-based `Call to PRD` document
7. relaunch and confirm settings persist

Additional audio path:

1. install or repair `ffmpeg` and Whisper tooling from onboarding
2. upload an audio file
3. confirm transcription succeeds
4. confirm generated output is saved to the configured PRD directory

## Rollback Plan

- keep `v0.1.4` as the last known-good public release
- if a new release regresses packaging, delete the tag and GitHub Release entry
- revert the release candidate commit on `main`
- republish from the last known-good tag if needed

## Follow-Up After Deploy

Priority 1:
- run clean-machine smoke tests on macOS, Windows, and Linux
- record exact failures and tighten onboarding messages

Priority 2:
- add macOS code signing
- add macOS notarization
- decide whether Windows code signing is needed for broader public rollout

Priority 3:
- improve Windows/Linux install helpers
- expand API fallback coverage where local CLI assumptions still exist
- decide whether packaged builds should restore the embedded terminal

## Go / No-Go Summary

Current decision:
- go for macOS-focused public testing
- conditional go for Windows/Linux technical users
- no-go for claiming "any user can install and use it perfectly right away"
