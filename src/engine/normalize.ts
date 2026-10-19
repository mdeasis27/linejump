import { sha256 } from "@noble/hashes/sha2.js";
import { RULES } from "./rules";

const GMAIL = new Set(["gmail.com", "googlemail.com"]);

export type NormalizedEmail = { normalized: string; domain: string };

export function normalizeEmail(raw: string): NormalizedEmail {
  const email = raw.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 0) return { normalized: email, domain: "" };
  let local = email.slice(0, at);
  let domain = email.slice(at + 1);
  const plus = local.indexOf("+");
  if (plus >= 0) local = local.slice(0, plus);
  if (GMAIL.has(domain)) {
    local = local.replaceAll(".", "");
    domain = "gmail.com";
  }
  return { normalized: `${local}@${domain}`, domain };
}

export function referralCode(normalized: string): string {
  const bytes = sha256(new TextEncoder().encode(normalized));
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex.slice(0, RULES.codeLength);
}
