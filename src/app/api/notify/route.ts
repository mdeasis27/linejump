import { NextResponse } from "next/server";

type Body = { to?: string; subject?: string; text?: string };

/** Live mail, only when RESEND_API_KEY is set. Demo mode never calls this. */
export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ live: false }, { status: 503 });
  const body = (await req.json()) as Body;
  if (!body.to || !body.subject || !body.text) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const from = process.env.MAIL_FROM ?? "Linejump <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: body.to, subject: body.subject, text: body.text }),
  });
  return NextResponse.json({ live: true, ok: res.ok }, { status: res.ok ? 200 : 502 });
}

export function GET() {
  return NextResponse.json({ live: Boolean(process.env.RESEND_API_KEY) });
}
