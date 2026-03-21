# dashboard-LAB Electron Desktop

`dashboard-LAB` is now structured to run as a local desktop app with Electron.

## Runtime Shape

- `electron/main.mjs`: Electron main process
- `electron/preload.mjs`: safe browser bridge
- `electron/dev-runner.mjs`: developer launcher for Electron + local Next runtime
- `server/run-local.mjs`: boots the Next app server and terminal WebSocket server
- `server/terminal-server.mjs`: terminal WebSocket runtime for desktop and local web modes

## Modes

### Development

```bash
pnpm desktop:dev
```

This does two things:

- starts the local Next/terminal runtime
- opens Electron against the detected local app URL

### Desktop Build Output

```bash
pnpm desktop:build
```

This builds Next.js and creates an unpacked Electron app in `release/`.

### macOS Distribution

```bash
pnpm desktop:dist:mac
```

This builds Next.js and creates macOS desktop artifacts without auto-signing.

## Packaging Notes

- The packaged app starts its own internal local runtime when it launches.
- The Electron shell keeps Node integration off and uses `preload` only.
- The packaged desktop baseline currently disables the embedded terminal server.
- Local web mode can still use terminal features through `node-pty`.
- The desktop app remains local-first; it does not turn the project into a hosted SaaS.
