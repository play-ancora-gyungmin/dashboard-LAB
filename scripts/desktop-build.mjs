import { runPnpm } from "./pnpm-runner.mjs";

const mode = process.argv[2] ?? "dir";
const targetArgs = resolveTargetArgs(mode);

await runPnpm(["build"]);
await runPnpm(
  [
    "exec",
    "electron-builder",
    ...targetArgs,
    "--publish",
    "never",
  ],
  {
    env: {
      ...process.env,
      CSC_IDENTITY_AUTO_DISCOVERY: "false",
    },
  },
);

function resolveTargetArgs(mode) {
  if (mode === "dir") {
    return ["--dir"];
  }

  if (mode === "dist") {
    return [];
  }

  if (mode === "dist:mac") {
    return ["--mac"];
  }

  if (mode === "dist:win") {
    return ["--win"];
  }

  if (mode === "dist:linux") {
    return ["--linux"];
  }

  throw new Error(
    `Unsupported desktop build mode: ${mode}. Expected one of dir, dist, dist:mac, dist:win, dist:linux.`,
  );
}
