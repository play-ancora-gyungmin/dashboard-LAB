import { mkdir } from "node:fs/promises";
import path from "node:path";

import { runPnpm } from "./pnpm-runner.mjs";

const buildEnv = await createBuildEnv();

await runPnpm(["exec", "next", "build"], { env: buildEnv });

async function createBuildEnv() {
  if (process.platform !== "win32") {
    return process.env;
  }

  const fakeHome = path.join(process.cwd(), ".dashboard-lab-build-home");
  const localAppData = path.join(fakeHome, "AppData", "Local");
  const roamingAppData = path.join(fakeHome, "AppData", "Roaming");
  const driveRoot = path.parse(fakeHome).root;
  const homeDrive = driveRoot.replace(/[\\/]+$/, "") || process.env.HOMEDRIVE || "C:";
  const relativeHome = path.relative(driveRoot, fakeHome).replaceAll("/", "\\");
  const homePath = `\\${relativeHome}`;

  await Promise.all([
    mkdir(path.join(fakeHome, "Desktop"), { recursive: true }),
    mkdir(path.join(fakeHome, "Downloads"), { recursive: true }),
    mkdir(path.join(fakeHome, "Documents"), { recursive: true }),
    mkdir(localAppData, { recursive: true }),
    mkdir(roamingAppData, { recursive: true }),
  ]);

  return {
    ...process.env,
    HOME: fakeHome,
    USERPROFILE: fakeHome,
    HOMEDRIVE: homeDrive,
    HOMEPATH: homePath,
    APPDATA: roamingAppData,
    LOCALAPPDATA: localAppData,
    NEXT_TELEMETRY_DISABLED: "1",
  };
}
