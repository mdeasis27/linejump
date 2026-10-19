import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { burstSignups, movedUp, nextTs, queueAt } from "../src/demo/store";
import { compareQueues } from "../src/engine/compare";
import { runQueue } from "../src/engine/engine";
import { parseDisposable, parseLog } from "../src/engine/io";
import { referralCode } from "../src/engine/normalize";
import { dictionaries, en, es } from "../src/i18n/dictionary";
import { resolveLocale } from "../src/i18n/locale";

const root = join(import.meta.dir, "..");

describe("locale routing", () => {
  test("no locale redirects to /en keeping the query", () => {
    expect(resolveLocale("/", "")).toEqual({ kind: "redirect", to: "/en" });
    expect(resolveLocale("/app", "?ref=x")).toEqual({ kind: "redirect", to: "/en/app?ref=x" });
  });
  test("bare locale goes to /app", () => {
    expect(resolveLocale("/es", "?a=1")).toEqual({ kind: "redirect", to: "/es/app?a=1" });
  });
  test("known locale passes, unknown is 404", () => {
    expect(resolveLocale("/en/app", "")).toEqual({ kind: "pass" });
    expect(resolveLocale("/fr/app", "")).toEqual({ kind: "notFound" });
    expect(resolveLocale("/fr", "")).toEqual({ kind: "notFound" });
  });
  test("uppercase locale is normalized", () => {
    expect(resolveLocale("/EN/app", "")).toEqual({ kind: "redirect", to: "/en/app" });
  });
});

describe("copy", () => {
  test("both locales have identical shape", () => {
    const keys = (o: unknown): string[] =>
      typeof o === "object" && o !== null
        ? Object.entries(o).flatMap(([k, v]) => [k, ...keys(v).map((x) => `${k}.${x}`)])
        : [];
    expect(keys(es).sort()).toEqual(keys(en).sort());
  });
  test("no em dashes in copy", () => {
    const dump = JSON.stringify(dictionaries, (_, v) => (typeof v === "function" ? String(v) : v));
    expect(dump.includes("—")).toBe(false);
  });
});

describe("demo store", () => {
  const log = parseLog(readFileSync(join(root, "fixtures", "signups.jsonl"), "utf8"));
  const dis = parseDisposable(
    readFileSync(join(root, "fixtures", "disposable-domains.txt"), "utf8"),
  );

  test("a valid referral that improves position yields a message", () => {
    let found = 0;
    for (let i = 1; i <= log.length; i++) {
      found += movedUp(queueAt(log, i - 1, dis), queueAt(log, i, dis)).length;
    }
    expect(found).toBeGreaterThan(0);
  });
  test("flagged referral sends nothing", () => {
    const a = { ts: "2026-03-02T09:00:00.000Z", email: "r@ex.com", ip: "1.1.1.1", ref: null };
    const b = {
      ts: "2026-03-02T09:01:00.000Z",
      email: "x@mailinator.com",
      ip: "2.2.2.2",
      ref: referralCode("r@ex.com"),
    };
    expect(movedUp(runQueue([a], dis), runQueue([a, b], dis))).toEqual([]);
  });
  test("simulated burst flags exactly the sixth", () => {
    const a = { ts: "2026-03-02T09:00:00.000Z", email: "r@ex.com", ip: "1.1.1.1", ref: null };
    const code = referralCode("r@ex.com");
    const all = [a, ...burstSignups([a], code)];
    const flags = runQueue(all, dis).map((e) => e.flags);
    expect(flags.filter((f) => f.includes("burst"))).toHaveLength(1);
    expect(nextTs([a])).toBe("2026-03-02T09:01:00.000Z");
  });
});

describe("compare", () => {
  test("derived from the engine on the committed log", () => {
    const log = parseLog(readFileSync(join(root, "fixtures", "signups.jsonl"), "utf8"));
    const dis = parseDisposable(
      readFileSync(join(root, "fixtures", "disposable-domains.txt"), "utf8"),
    );
    const entries = runQueue(log, dis);
    const c = compareQueues(entries);
    expect(c.accepted + c.duplicates).toBe(log.length);
    expect(c.biggestJump).toBeGreaterThanOrEqual(0);
  });
});
