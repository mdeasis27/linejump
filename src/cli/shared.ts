import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const defaultDisposable = join(repoRoot, "fixtures", "disposable-domains.txt");
export const casesDir = join(repoRoot, "fixtures", "cases");

export const read = (p: string) => readFileSync(p, "utf8");

export function fail(msg: string): never {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}
