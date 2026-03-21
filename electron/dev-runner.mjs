import { spawnPnpm } from "../scripts/pnpm-runner.mjs";

const LOG_PREFIX = "[dashboard-lab-electron]";
const APP_URL_PATTERN = /\[dashboard-lab\] app (http:\/\/[^\s]+)/;

let electronChild = null;
let runtimeReady = false;
let shuttingDown = false;

const devChild = spawnPnpm(["dev"], {
  env: { ...process.env },
  stdio: ["inherit", "pipe", "pipe"],
});

devChild.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  maybeLaunchElectron(text);
});

devChild.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  process.stderr.write(text);
  maybeLaunchElectron(text);
});

devChild.on("error", (error) => {
  console.error(`${LOG_PREFIX} dev runtime failed: ${error.message}`);
  process.exit(1);
});

devChild.on("exit", (code) => {
  if (!runtimeReady) {
    process.exit(code ?? 0);
    return;
  }

  if (electronChild && !electronChild.killed) {
    return;
  }

  process.exit(code ?? 0);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => shutdown(signal));
}

function maybeLaunchElectron(text) {
  if (electronChild) {
    return;
  }

  const match = text.match(APP_URL_PATTERN);
  if (!match) {
    return;
  }

  runtimeReady = true;
  const appUrl = match[1];
  console.log(`${LOG_PREFIX} launching Electron at ${appUrl}`);

  electronChild = spawnPnpm(["exec", "electron", "."], {
    env: {
      ...process.env,
      DASHBOARD_LAB_APP_URL: appUrl,
      DASHBOARD_LAB_ELECTRON_DEV: "1",
    },
    stdio: "inherit",
  });

  electronChild.on("exit", (code) => {
    electronChild = null;
    if (!shuttingDown) {
      shutdown("SIGTERM", code ?? 0);
    }
  });
}

function shutdown(signal, exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (electronChild && !electronChild.killed) {
    electronChild.kill(signal);
  }

  if (!devChild.killed) {
    devChild.kill(signal);
  }

  process.exit(exitCode);
}
