export type LocaleDecision =
  | { kind: "pass" }
  | { kind: "redirect"; to: string }
  | { kind: "notFound" };

const SUPPORTED = new Set(["en", "es"]);
const LOCALE_SHAPE = /^[a-z]{2}(-[a-z]{2})?$/i;

/** ADR-0004: a first segment shaped like a locale is a locale attempt. */
export function resolveLocale(pathname: string, search: string): LocaleDecision {
  const segments = pathname.split("/").filter((s) => s !== "");
  const first = segments[0];
  if (first !== undefined && LOCALE_SHAPE.test(first)) {
    const lower = first.toLowerCase();
    if (!SUPPORTED.has(first) && !(SUPPORTED.has(lower) && first !== lower)) {
      return { kind: "notFound" };
    }
    if (first !== lower) {
      return { kind: "redirect", to: `/${[lower, ...segments.slice(1)].join("/")}${search}` };
    }
    if (segments.length === 1) return { kind: "redirect", to: `/${first}/app${search}` };
    return { kind: "pass" };
  }
  if (segments.length === 0) return { kind: "redirect", to: `/en${search}` };
  return { kind: "redirect", to: `/en/${segments.join("/")}${search}` };
}
