import { processLog } from "../engine/engine";
import { parseDisposable, parseLog } from "../engine/io";
import { defaultDisposable, fail, read } from "./shared";

const args = process.argv.slice(2);
let file: string | undefined;
let disposablePath = defaultDisposable;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--disposable") {
    const v = args[++i];
    if (!v) fail("--disposable needs a file");
    disposablePath = v;
  } else if (a && !file) file = a;
}
if (!file) fail("usage: process <log.jsonl> [--disposable <file>]");

try {
  const out = processLog(parseLog(read(file)), parseDisposable(read(disposablePath)));
  process.stdout.write(`${JSON.stringify(out)}\n`);
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
}
