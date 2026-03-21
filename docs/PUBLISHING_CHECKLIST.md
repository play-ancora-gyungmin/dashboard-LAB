# dashboard-LAB Publishing Checklist

This project is structurally ready for GitHub publication and macOS desktop packaging.

## Ready

- standalone repository in `dashboard-LAB`
- Electron desktop shell
- macOS unpacked desktop build
- CI workflow for lint, type-check, web build, and desktop smoke build
- open-source support docs:
  - `README.md`
  - `CONTRIBUTING.md`
  - `SECURITY.md`
  - `CODE_OF_CONDUCT.md`

## Remaining Blocker

- Add a `LICENSE` file.

This is intentionally not auto-generated because license choice is a project/legal decision.

## Release Commands

```bash
pnpm assets:icon
pnpm lint
pnpm type-check
pnpm desktop:build
pnpm desktop:dist:mac
```

## Pre-Publish Notes

- `release/` is a generated artifact directory and should not be committed.
- The packaged desktop baseline disables the embedded terminal server.
- macOS code signing and notarization are still optional follow-up work.
- `asar` is currently disabled and can be hardened in a later release pass.
