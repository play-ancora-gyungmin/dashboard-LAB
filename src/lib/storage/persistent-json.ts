import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import { readRuntimeSettings } from "@/lib/runtime/settings";

export function readPersistentJson<T>(fileName: string, fallback: T): T {
  try {
    for (const filePath of getCandidateStateFilePaths(fileName)) {
      mkdirSync(path.dirname(filePath), { recursive: true });
      try {
        const raw = readFileSync(filePath, "utf-8");
        return JSON.parse(raw) as T;
      } catch {
        continue;
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export function persistJson(fileName: string, data: unknown): void {
  const filePath = getPrimaryStateFilePath(fileName);
  const tempPath = `${filePath}.tmp`;
  const serialized = JSON.stringify(data, null, 2);

  try {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(tempPath, serialized, "utf-8");
    renameSync(tempPath, filePath);
  } catch (error) {
    console.error(`Failed to persist state: ${fileName}`, error);
  }
}

function getPrimaryStateFilePath(fileName: string) {
  return path.join(getPrimaryStateDir(), fileName);
}

function getCandidateStateFilePaths(fileName: string) {
  const primary = getPrimaryStateFilePath(fileName);
  const legacy = path.join(getLegacyStateDir(), fileName);

  return primary === legacy ? [primary] : [primary, legacy];
}

function getPrimaryStateDir() {
  const envDataRoot = readEnvPath("DASHBOARD_LAB_DATA_ROOT");
  if (envDataRoot) {
    return path.join(envDataRoot, "state");
  }

  const configuredDataRoot = readRuntimeSettings().paths.dataRoot;
  if (configuredDataRoot) {
    return path.join(configuredDataRoot, "dashboard-lab-docs", "state");
  }

  return getLegacyStateDir();
}

function getLegacyStateDir() {
  return path.join(process.cwd(), "data", "state");
}

function readEnvPath(name: string) {
  const value = process.env[name]?.trim();
  return value ? path.resolve(value) : null;
}
