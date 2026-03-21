import { spawn } from "node:child_process";

const mode = process.argv[2] === "dist:mac" ? "dist:mac" : "dir";

await runCommand("pnpm", ["build"]);
await runCommand(
  "pnpm",
  [
    "exec",
    "electron-builder",
    ...(mode === "dist:mac" ? ["--mac"] : ["--dir"]),
  ],
  {
    env: {
      ...process.env,
      CSC_IDENTITY_AUTO_DISCOVERY: "false",
    },
  },
);

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: options.env ?? process.env,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}`));
    });
  });
}
