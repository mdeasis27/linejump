import { readdirSync } from "node:fs";
import { join } from "node:path";
import { processLog } from "../engine/engine";
import { parseDisposable, parseLog } from "../engine/io";
import { type CaseScore, scoreCases } from "../engine/score";
import type { CliResult } from "../engine/types";
import { casesDir, defaultDisposable, fail, read } from "./shared";

try {
  const verbose = process.argv.includes("--verbose");
  const disposable = parseDisposable(read(defaultDisposable));
  const names = readdirSync(casesDir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => f.slice(0, -".jsonl".length))
    .sort();
  const cases: CaseScore[] = names.map((name) => ({
    expected: JSON.parse(read(join(casesDir, `${name}.expected.json`))) as CliResult,
    actual: processLog(parseLog(read(join(casesDir, `${name}.jsonl`))), disposable),
  }));
  if (verbose) {
    names.forEach((n, i) => {
      const c = cases[i];
      if (c) process.stderr.write(`${n}: ${JSON.stringify(scoreCases([c]))}\n`);
    });
  }
  process.stdout.write(`${JSON.stringify(scoreCases(cases))}\n`);
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
}
