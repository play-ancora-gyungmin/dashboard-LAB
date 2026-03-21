import { spawn } from "node:child_process";

export async function checkCommandAvailable(command: string): Promise<boolean> {
  if (!command.trim()) {
    return false;
  }

  const resolver = process.platform === "win32" ? "where" : "which";

  return new Promise((resolve) => {
    const proc = spawn(resolver, [command], {
      stdio: "ignore",
    });

    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}
