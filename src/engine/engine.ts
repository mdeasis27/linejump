import { normalizeEmail, referralCode } from "./normalize";
import { RULES } from "./rules";
import type { CliResult, Entry, Flag, Signup } from "./types";

/** Pure projection of the whole signup log into the queue (ADR-0001). */
export function runQueue(signups: readonly Signup[], disposable: ReadonlySet<string>): Entry[] {
  const entries: Entry[] = [];
  const seen = new Map<string, number>();
  const owner = new Map<string, number>();
  const accepted: number[] = [];
  const times = signups.map((s) => Date.parse(s.ts));
  const refOf = (s: Signup) => (s.ref ? s.ref : null);

  signups.forEach((s, i) => {
    const { normalized, domain } = normalizeEmail(s.email);
    const ref = refOf(s);
    const base = { index: i, email: s.email, normalized, validReferrals: 0, ref };
    const dup = seen.get(normalized);
    if (dup !== undefined) {
      entries.push({
        ...base,
        code: null,
        flags: ["duplicate"],
        position: null,
        joinIndex: null,
        rank: null,
        evidence: { duplicateOf: dup },
      });
      return;
    }
    seen.set(normalized, i);
    const code = referralCode(normalized);
    const entry: Entry = {
      ...base,
      code,
      flags: [],
      position: null,
      joinIndex: accepted.length,
      rank: null,
      evidence: {},
    };
    accepted.push(i);
    entries.push(entry);

    // Look the referrer up before registering this signup's own code, so a
    // signup can never refer to itself.
    const referrerIdx = ref === null ? undefined : owner.get(ref);
    if (!owner.has(code)) owner.set(code, i);
    if (ref === null) return;
    if (referrerIdx === undefined) {
      entry.flags.push("unknown_ref");
      return;
    }
    const ts = times[i] ?? 0;
    const referrerTs = times[referrerIdx] ?? 0;
    const flags: Flag[] = [];
    entry.evidence.referrer = referrerIdx;
    entry.evidence.domain = domain;
    entry.evidence.hoursSinceReferrer = (ts - referrerTs) / 3_600_000;
    if (domain !== "" && disposable.has(domain)) flags.push("disposable");
    if (s.ip === signups[referrerIdx]?.ip && ts - referrerTs < RULES.sameIpWindowMs) {
      flags.push("same_ip");
    }
    let burst = 0;
    for (const j of accepted) {
      const other = signups[j];
      const t = times[j] ?? 0;
      if (other && refOf(other) === ref && t > ts - RULES.burstWindowMs && t <= ts) burst++;
    }
    entry.evidence.burstCount = burst;
    if (burst >= RULES.burstThreshold) flags.push("burst");
    entry.flags = flags;
    if (flags.length === 0) {
      const r = entries[referrerIdx];
      if (r) r.validReferrals++;
    }
  });

  const queue = accepted.map((i) => entries[i]).filter((e): e is Entry => e !== undefined);
  for (const e of queue) e.rank = (e.joinIndex ?? 0) - RULES.referralBonus * e.validReferrals;
  queue.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0) || (a.joinIndex ?? 0) - (b.joinIndex ?? 0));
  queue.forEach((e, p) => {
    e.position = p + 1;
  });
  return entries;
}

export function toCliResult(entries: readonly Entry[]): CliResult {
  return {
    signups: entries.map((e) => ({
      email: e.email,
      code: e.code,
      flags: e.flags,
      position: e.position,
    })),
  };
}

export function processLog(signups: readonly Signup[], disposable: ReadonlySet<string>): CliResult {
  return toCliResult(runQueue(signups, disposable));
}
