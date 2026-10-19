import type { CliResult } from "./types";

export type CaseScore = { expected: CliResult; actual: CliResult };
export type Score = { cases: number; flag_f1: number; position_exact: number; score: number };

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/** Pooled (micro) scoring across cases. */
export function scoreCases(cases: readonly CaseScore[]): Score {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let exact = 0;
  let total = 0;
  for (const { expected, actual } of cases) {
    const n = Math.max(expected.signups.length, actual.signups.length);
    for (let i = 0; i < n; i++) {
      const e = expected.signups[i];
      const a = actual.signups[i];
      const ef = new Set(e?.flags ?? []);
      const af = new Set(a?.flags ?? []);
      for (const f of af) {
        if (ef.has(f)) tp++;
        else fp++;
      }
      for (const f of ef) if (!af.has(f)) fn++;
      if (e) {
        total++;
        if (a && a.position === e.position) exact++;
      }
    }
  }
  const denom = 2 * tp + fp + fn;
  const f1 = denom === 0 ? 1 : (2 * tp) / denom;
  const pos = total === 0 ? 1 : exact / total;
  return {
    cases: cases.length,
    flag_f1: round(f1, 4),
    position_exact: round(pos, 4),
    score: round(((f1 + pos) / 2) * 100, 2),
  };
}
