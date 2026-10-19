import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { processLog, runQueue } from "../src/engine/engine";
import { parseDisposable, parseLog } from "../src/engine/io";
import { normalizeEmail, referralCode } from "../src/engine/normalize";
import { scoreCases } from "../src/engine/score";
import type { CliResult, Signup } from "../src/engine/types";

const fx = (p: string) => readFileSync(join(import.meta.dir, "..", "fixtures", p), "utf8");
const dis = parseDisposable(fx("disposable-domains.txt"));
const run = (log: Signup[], d: Set<string> = dis) => processLog(log, d).signups;

const s = (n: number, email: string, ref?: string, ip = `9.9.9.${n}`, ts?: string): Signup => ({
  ts: ts ?? new Date(Date.UTC(2026, 2, 2, 9, 0, 0) + n * 1000).toISOString(),
  email,
  ip,
  ref: ref ?? null,
});

describe("fixture cases", () => {
  const names = readdirSync(join(import.meta.dir, "..", "fixtures", "cases"))
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => f.slice(0, -6));
  for (const name of names) {
    test(name, () => {
      const expected = JSON.parse(fx(`cases/${name}.expected.json`)) as CliResult;
      expect(processLog(parseLog(fx(`cases/${name}.jsonl`)), dis)).toEqual(expected);
    });
  }
});

describe("normalization and code", () => {
  test("gmail, plus and case rules", () => {
    expect(normalizeEmail(" B.o.B+x@GoogleMail.com ").normalized).toBe("bob@gmail.com");
    expect(normalizeEmail("a.b+c@example.com").normalized).toBe("a.b@example.com");
    expect(normalizeEmail("noat").domain).toBe("");
  });
  test("code matches node:crypto", () => {
    for (const e of ["a@b.com", "zed@gmail.com", "ünï@example.com"]) {
      expect(referralCode(e)).toBe(createHash("sha256").update(e).digest("hex").slice(0, 8));
    }
  });
});

describe("rules beyond the fixtures", () => {
  const root = s(0, "root@ex.com");
  const code = referralCode("root@ex.com");

  test("self referral is unknown_ref", () => {
    const me = referralCode("me@ex.com");
    expect(run([s(0, "me@ex.com", me)])[0]?.flags).toEqual(["unknown_ref"]);
  });
  test("empty ref means no ref", () => {
    expect(run([root, s(1, "a@ex.com", "")])[1]?.flags).toEqual([]);
  });
  test("ref is case sensitive", () => {
    expect(run([root, s(1, "a@ex.com", code.toUpperCase())])[1]?.flags).toEqual(["unknown_ref"]);
  });
  test("disposable is exact domain", () => {
    const out = run([root, s(1, "a@sub.mailinator.com", code), s(2, "b@mailinator.com", code)]);
    expect(out[1]?.flags).toEqual([]);
    expect(out[2]?.flags).toEqual(["disposable"]);
  });
  test("same_ip at 0 and exactly 24h", () => {
    const base = "2026-03-02T09:00:00.000Z";
    const out = run([
      s(0, "root@ex.com", undefined, "1.1.1.1", base),
      s(1, "a@ex.com", code, "1.1.1.1", base),
      s(2, "b@ex.com", code, "1.1.1.1", "2026-03-03T09:00:00.000Z"),
      s(3, "c@ex.com", code, "1.1.1.1", "2026-03-03T08:59:59.999Z"),
    ]);
    expect(out[1]?.flags).toEqual(["same_ip"]);
    expect(out[2]?.flags).toEqual([]);
    expect(out[3]?.flags).toEqual(["same_ip"]);
  });
  test("burst window excludes exactly 10 minutes ago", () => {
    const t = (min: number) => new Date(Date.UTC(2026, 2, 2, 9, 0) + min * 60_000).toISOString();
    const log = [
      s(0, "root@ex.com", undefined, "5.5.5.5", t(-60)),
      ...[0, 2, 4, 6, 8].map((m, i) => s(i + 1, `u${i}@ex.com`, code, `7.7.7.${i}`, t(m))),
      s(9, "x@ex.com", code, "8.8.8.8", t(10)),
    ];
    // window (0, 10]: minutes 2,4,6,8,10 = 5 signups, the one at 0 is out
    expect(run(log)[6]?.flags).toEqual([]);
    log.push(s(10, "y@ex.com", code, "8.8.8.9", t(10)));
    expect(run(log)[7]?.flags).toEqual(["burst"]);
  });
  test("unknown_ref signups count toward a later burst", () => {
    const ghost = "deadbeef";
    const log = [root, ...Array.from({ length: 6 }, (_, i) => s(i + 1, `g${i}@ex.com`, ghost))];
    // all are unknown_ref and none is a referral to a real code, so no burst flag
    expect(run(log).every((e) => !e.flags.includes("burst"))).toBe(true);
  });
  test("duplicate ignores its ref and is not a burst member", () => {
    const out = run([root, s(1, "ROOT+x@ex.com", code)]);
    expect(out[1]).toEqual({
      email: "ROOT+x@ex.com",
      code: null,
      flags: ["duplicate"],
      position: null,
    });
  });
  test("valid referral moves the referrer up by five ranks", () => {
    const log = [...Array.from({ length: 6 }, (_, i) => s(i, `p${i}@ex.com`)), s(6, "root@ex.com")];
    expect(run(log)[6]?.position).toBe(7);
    log.push(s(7, "ref@ex.com", code, "4.4.4.4"));
    expect(run(log)[6]?.position).toBe(3);
  });
  test("entries expose evidence", () => {
    const e = runQueue([root, s(1, "a@mailinator.com", code)], dis)[1];
    expect(e?.evidence.referrer).toBe(0);
    expect(e?.flags).toEqual(["disposable"]);
  });
});

describe("log parsing", () => {
  test("blank lines are skipped, bad lines throw", () => {
    expect(parseLog('\n{"ts":"2026-03-02T09:00:00Z","email":"a@b.c","ip":"1"}\n\n')).toHaveLength(
      1,
    );
    expect(() => parseLog("{nope")).toThrow("line 1");
  });
  test("disposable list parsing", () => {
    expect([...parseDisposable("# c\n\n Foo.COM \n")]).toEqual(["foo.com"]);
  });
});

describe("scoring", () => {
  const mk = (flags: string[][], pos: (number | null)[]): CliResult => ({
    signups: flags.map((f, i) => ({
      email: String(i),
      code: null,
      flags: f as CliResult["signups"][number]["flags"],
      position: pos[i] ?? null,
    })),
  });
  test("perfect and empty", () => {
    const a = mk([["burst"], []], [1, null]);
    expect(scoreCases([{ expected: a, actual: a }]).score).toBe(100);
    const e = mk([[]], [1]);
    expect(scoreCases([{ expected: e, actual: e }]).flag_f1).toBe(1);
  });
  test("partial", () => {
    const exp = mk([["burst"], ["same_ip"]], [1, 2]);
    const act = mk([["burst"], []], [1, 3]);
    // tp1 fp0 fn1 -> f1 = 2/3 ; positions 1/2
    expect(scoreCases([{ expected: exp, actual: act }])).toEqual({
      cases: 1,
      flag_f1: 0.6667,
      position_exact: 0.5,
      score: 58.33,
    });
  });
  test("missing actual signups count as wrong", () => {
    const exp = mk([[], []], [1, 2]);
    const act = mk([[]], [1]);
    expect(scoreCases([{ expected: exp, actual: act }]).position_exact).toBe(0.5);
  });
});
