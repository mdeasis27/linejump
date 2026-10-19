import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { processLog } from "../src/engine/engine";
import { parseDisposable, parseLog } from "../src/engine/io";

const root = join(import.meta.dir, "..");
const cli = (name: string, ...args: string[]) =>
  Bun.spawnSync(["bun", "run", join(root, "src", "cli", `${name}.ts`), ...args], {
    cwd: tmpdir(),
  });
const text = (b: Uint8Array) => new TextDecoder().decode(b);

describe("process", () => {
  test("matches the engine on the committed log", () => {
    const file = join(root, "fixtures", "signups.jsonl");
    const r = cli("process", file);
    expect(r.exitCode).toBe(0);
    const dis = parseDisposable(
      readFileSync(join(root, "fixtures", "disposable-domains.txt"), "utf8"),
    );
    expect(JSON.parse(text(r.stdout))).toEqual(
      processLog(parseLog(readFileSync(file, "utf8")), dis),
    );
  });
  test("--disposable overrides the list", () => {
    const dir = mkdtempSync(join(tmpdir(), "lj-"));
    const list = join(dir, "d.txt");
    const log = join(dir, "l.jsonl");
    writeFileSync(list, "example.com\n");
    writeFileSync(
      log,
      [
        '{"ts":"2026-03-02T09:00:00.000Z","email":"a@x.org","ip":"1"}',
        '{"ts":"2026-03-02T09:01:00.000Z","email":"b@example.com","ip":"2","ref":"__CODE__"}',
      ].join("\n"),
    );
    const code = JSON.parse(text(cli("process", log).stdout)).signups[0].code as string;
    writeFileSync(log, readFileSync(log, "utf8").replace("__CODE__", code));
    const out = JSON.parse(text(cli("process", log, "--disposable", list).stdout));
    expect(out.signups[1].flags).toEqual(["disposable"]);
  });
  test("a malformed log exits 1 with empty stdout", () => {
    const dir = mkdtempSync(join(tmpdir(), "lj-"));
    const log = join(dir, "bad.jsonl");
    writeFileSync(log, "{oops\n");
    const r = cli("process", log);
    expect(r.exitCode).toBe(1);
    expect(text(r.stdout)).toBe("");
  });
});

describe("eval", () => {
  test("scores the committed cases at 100 with only JSON on stdout", () => {
    const r = cli("eval");
    expect(r.exitCode).toBe(0);
    const out = JSON.parse(text(r.stdout));
    expect(Object.keys(out).sort()).toEqual(["cases", "flag_f1", "position_exact", "score"]);
    expect(out.score).toBe(100);
    expect(out.cases).toBe(7);
  });
});
