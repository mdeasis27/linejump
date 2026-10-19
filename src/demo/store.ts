import { runQueue } from "../engine/engine";
import type { Entry, Signup } from "../engine/types";

export type Moved = { index: number; email: string; code: string; from: number; to: number };

export function clampCursor(cursor: number, total: number): number {
  return Math.max(0, Math.min(total, cursor));
}

/** Engine view of the first `cursor` signups of the log. */
export function queueAt(log: readonly Signup[], cursor: number, disposable: ReadonlySet<string>) {
  return runQueue(log.slice(0, clampCursor(cursor, log.length)), disposable);
}

/**
 * People whose position improved because the newest signup was a valid
 * referral for them (grilling Q23). Flagged referrals move nobody.
 */
export function movedUp(before: readonly Entry[], after: readonly Entry[]): Moved[] {
  const added = after[after.length - 1];
  if (!added || added.flags.length > 0 || added.evidence.referrer === undefined) return [];
  const prev = before[added.evidence.referrer];
  const next = after[added.evidence.referrer];
  if (!prev || !next || prev.position === null || next.position === null || !next.code) return [];
  if (next.position >= prev.position) return [];
  return [
    {
      index: next.index,
      email: next.email,
      code: next.code,
      from: prev.position,
      to: next.position,
    },
  ];
}

export function nextTs(log: readonly Signup[]): string {
  const last = log[log.length - 1];
  const base = last ? Date.parse(last.ts) : Date.parse("2026-03-01T09:00:00.000Z");
  return new Date(base + 60_000).toISOString();
}

export function freshIp(log: readonly Signup[]): string {
  return `203.0.113.${(log.length % 250) + 1}`;
}

/** Six referrals to one code inside 10 minutes, ten seconds apart. */
export function burstSignups(log: readonly Signup[], code: string): Signup[] {
  const start = Date.parse(nextTs(log));
  const stamp = log.length;
  return Array.from({ length: 6 }, (_, i) => ({
    ts: new Date(start + i * 10_000).toISOString(),
    email: `burst${stamp}x${i}@example.net`,
    ip: `198.18.${stamp % 250}.${i + 1}`,
    ref: code,
  }));
}
