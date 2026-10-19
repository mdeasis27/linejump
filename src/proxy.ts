import { type NextRequest, NextResponse } from "next/server";
import { resolveLocale } from "./i18n/locale";

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const decision = resolveLocale(pathname, search);
  if (decision.kind === "notFound") return new NextResponse(null, { status: 404 });
  if (decision.kind === "redirect") {
    const url = req.nextUrl.clone();
    const [path = "/", query = ""] = decision.to.split("?");
    url.pathname = path;
    url.search = query ? `?${query}` : "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
