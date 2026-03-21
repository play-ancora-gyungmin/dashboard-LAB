import { spawn } from "node:child_process";

export function spawnPnpm(args, options = {}) {
  const resolved = resolvePnpmInvocation();
  return spawn(resolved.command, [...resolved.args, ...args], {
    ...options,
  });
}

export function runPnpm(args, options = {}) {
  const resolved = resolvePnpmInvocation();
  const commandArgs = [...resolved.args, ...args];

  return new Promise((resolve, reject) => {
    const child = spawn(resolved.command, commandArgs, {
      stdio: "inherit",
      ...options,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${resolved.command} ${commandArgs.join(" ")} exited with code ${code ?? "unknown"}`,
        ),
      );
    });
  });
}

function resolvePnpmInvocation() {
  const npmExecPath = process.env.npm_execpath;

  if (npmExecPath && npmExecPath.toLowerCase().includes("pnpm")) {
    return {
      command: process.execPath,
      args: [npmExecPath],
    };
  }

  return {
    command: process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    args: [],
  };
}
