import { RULES } from "./rules";
import type { Entry, Flag } from "./types";

export type Comparison = {
  accepted: number;
  duplicates: number;
  notCounted: number;
  byFlag: Record<Flag, number>;
  /** most places any person gains when every referral is counted */
  biggestJump: number;
};

/** Naive queue: every referral with a known referrer counts, flags ignored. */
export function compareQueues(entries: readonly Entry[]): Comparison {
  const accepted = entries.filter((e) => e.joinIndex !== null);
  const naiveRefs = new Map<number, number>();
  const byFlag: Record<Flag, number> = {
    duplicate: 0,
    unknown_ref: 0,
    disposable: 0,
    same_ip: 0,
    burst: 0,
  };
  let notCounted = 0;
  for (const e of entries) {
    for (const f of e.flags) byFlag[f]++;
    if (e.evidence.referrer !== undefined) {
      naiveRefs.set(e.evidence.referrer, (naiveRefs.get(e.evidence.referrer) ?? 0) + 1);
      if (e.flags.length > 0) notCounted++;
    } else if (e.flags.includes("unknown_ref")) notCounted++;
  }
  const naive = accepted
    .map((e) => ({
      index: e.index,
      join: e.joinIndex ?? 0,
      rank: (e.joinIndex ?? 0) - RULES.referralBonus * (naiveRefs.get(e.index) ?? 0),
    }))
    .sort((a, b) => a.rank - b.rank || a.join - b.join);
  const naivePos = new Map(naive.map((n, i) => [n.index, i + 1]));
  let biggestJump = 0;
  for (const e of accepted) {
    const np = naivePos.get(e.index);
    if (np !== undefined && e.position !== null)
      biggestJump = Math.max(biggestJump, e.position - np);
  }
  return {
    accepted: accepted.length,
    duplicates: byFlag.duplicate,
    notCounted,
    byFlag,
    biggestJump,
  };
}
