# Contributing

Thanks for contributing to `dashboard-LAB`.

## Local Setup

```bash
pnpm install
pnpm lint
pnpm type-check
pnpm build
```

For desktop work:

```bash
node scripts/generate-app-icon.mjs
pnpm rebuild electron node-pty
pnpm desktop:dev
```

## Pull Request Guidelines

- Keep changes scoped and reversible.
- Update docs when setup, packaging, or user-facing behavior changes.
- Run `pnpm lint` and `pnpm type-check` before opening a PR.
- If you touch desktop packaging, also run `pnpm desktop:build` on macOS.

## What To Avoid

- Do not commit recordings, transcripts, generated customer docs, or local state files.
- Do not hardcode personal filesystem paths into runtime code.
- Do not add destructive file operations without explicit safety checks.
