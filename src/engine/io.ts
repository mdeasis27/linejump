import type { Signup } from "./types";

export function parseLog(text: string): Signup[] {
  const out: Signup[] = [];
  text.split(/\r?\n/).forEach((line, n) => {
    if (line.trim() === "") return;
    let v: unknown;
    try {
      v = JSON.parse(line);
    } catch {
      throw new Error(`line ${n + 1}: invalid JSON`);
    }
    if (typeof v !== "object" || v === null) throw new Error(`line ${n + 1}: not an object`);
    const o = v as Record<string, unknown>;
    if (typeof o.ts !== "string" || typeof o.email !== "string" || typeof o.ip !== "string") {
      throw new Error(`line ${n + 1}: needs string ts, email and ip`);
    }
    if (Number.isNaN(Date.parse(o.ts))) throw new Error(`line ${n + 1}: bad ts`);
    out.push({ ts: o.ts, email: o.email, ip: o.ip, ref: typeof o.ref === "string" ? o.ref : null });
  });
  return out;
}

export function parseDisposable(text: string): Set<string> {
  const set = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().toLowerCase();
    if (line === "" || line.startsWith("#")) continue;
    set.add(line);
  }
  return set;
}
