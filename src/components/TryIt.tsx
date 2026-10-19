"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { burstSignups, clampCursor, freshIp, movedUp, nextTs, queueAt } from "../demo/store";
import type { Entry, Flag, Signup } from "../engine/types";
import { dictionaries, type Lang } from "../i18n/dictionary";

type Props = { lang: Lang; log: Signup[]; disposable: string[] };
type Message = { id: number; to: string; from: number; toPos: number; sent: boolean };

const STORE = "linejump.mine.v1";
const SPEEDS = [1200, 600, 200] as const;

export function TryIt({ lang, log, disposable }: Props) {
  const d = dictionaries[lang];
  const t = d.tryIt;
  const dis = useMemo(() => new Set(disposable), [disposable]);
  const [mine, setMine] = useState<Signup[]>([]);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [tab, setTab] = useState<"queue" | "admin" | "outbox">("queue");
  const [selected, setSelected] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [live, setLive] = useState(false);
  const [email, setEmail] = useState("");
  const [ref, setRef] = useState("");
  const [ip, setIp] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState("");
  const msgId = useRef(0);
  const stepRef = useRef<(delta: number) => void>(() => undefined);

  const full = useMemo(() => [...log, ...mine], [log, mine]);
  const total = full.length;
  const entries = useMemo(() => queueAt(full, cursor, dis), [full, cursor, dis]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("ref");
    if (q) setRef(q);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const saved = JSON.parse(raw) as Signup[];
        setMine(saved);
        setCursor(log.length + saved.length);
      }
    } catch {
      /* ignore broken storage */
    }
    fetch("/api/notify")
      .then((r) => r.json() as Promise<{ live: boolean }>)
      .then((j) => setLive(j.live))
      .catch(() => setLive(false));
  }, [log.length]);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= total) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => stepRef.current(1), SPEEDS[speed] ?? 600);
    return () => clearTimeout(id);
  }, [playing, cursor, total, speed]);

  function emit(before: Entry[], after: Entry[]) {
    for (const m of movedUp(before, after)) {
      const id = ++msgId.current;
      const msg: Message = { id, to: m.email, from: m.from, toPos: m.to, sent: false };
      setMessages((all) => [...all, msg]);
      setAnnounce(`${m.email}: ${t.movedUp(m.from, m.to)}`);
      if (live) {
        fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: m.email,
            subject: t.outboxSubject,
            text: t.movedUp(m.from, m.to),
          }),
        })
          .then((r) => {
            if (r.ok)
              setMessages((all) => all.map((x) => (x.id === id ? { ...x, sent: true } : x)));
          })
          .catch(() => undefined);
      }
    }
  }

  function step(delta: number) {
    const next = clampCursor(cursor + delta, total);
    if (delta > 0) emit(queueAt(full, cursor, dis), queueAt(full, next, dis));
    setCursor(next);
  }

  stepRef.current = step;

  function save(next: Signup[]) {
    setMine(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function addAll(extra: Signup[]) {
    const nextFull = [...full, ...extra];
    const before = queueAt(full, full.length, dis);
    let prev = before;
    extra.forEach((_, k) => {
      const cur = queueAt(nextFull, full.length + k + 1, dis);
      emit(prev, cur);
      prev = cur;
    });
    save([...mine, ...extra]);
    setCursor(nextFull.length);
    setPlaying(false);
  }

  function onAdd(ev: React.FormEvent) {
    ev.preventDefault();
    if (!email.trim()) {
      setError(t.errEmail);
      return;
    }
    setError("");
    addAll([
      {
        ts: nextTs(full),
        email: email.trim(),
        ip: ip.trim() || freshIp(full),
        ref: ref.trim() || null,
      },
    ]);
    setEmail("");
  }

  function onBurst() {
    const target = selectedEntry?.code ?? entries.find((e) => e.code)?.code;
    if (target) addAll(burstSignups(full, target));
  }

  const queue = entries
    .filter((e) => e.position !== null)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const selectedEntry = entries.find((e) => e.index === selected) ?? null;
  const link = selectedEntry?.code
    ? `${typeof window === "undefined" ? "" : window.location.origin}/${lang}/app?ref=${selectedEntry.code}`
    : "";

  const why = (e: Entry, f: Flag) =>
    d.flagWhy[f]({
      hours: e.evidence.hoursSinceReferrer ?? 0,
      count: e.evidence.burstCount ?? 0,
      domain: e.evidence.domain ?? "",
      other: entries[e.evidence.duplicateOf ?? -1]?.email ?? "",
    });

  const tags = (e: Entry) =>
    e.flags.length === 0 ? (
      <span className="muted">{t.none}</span>
    ) : (
      e.flags.map((f) => (
        <span key={f} className={f === "duplicate" ? "tag dup" : "tag"}>
          {d.flagName[f]}
        </span>
      ))
    );

  return (
    <div className="grid two">
      <div className="card">
        <h3>{t.replay}</h3>
        <div className="row">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            disabled={cursor >= total && !playing}
          >
            {playing ? t.pause : t.play}
          </button>
          <button type="button" className="ghost" onClick={() => step(-1)} disabled={cursor === 0}>
            {t.stepBack}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => step(1)}
            disabled={cursor >= total}
          >
            {t.stepForward}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setPlaying(false);
              setCursor(0);
              setMessages([]);
            }}
          >
            {t.reset}
          </button>
          <button
            type="button"
            className="ghost"
            aria-label={`${t.speed}: ${speed + 1}`}
            onClick={() => setSpeed((s) => (s + 1) % SPEEDS.length)}
          >
            {t.speed} ×{speed + 1}
          </button>
        </div>
        <p className="muted">{t.progress(cursor, total)}</p>
        <div className="sr" aria-live="polite">
          {announce}
        </div>

        <h3>{t.addTitle}</h3>
        <form onSubmit={onAdd} noValidate>
          <div className="field">
            <label htmlFor="f-email">{t.email}</label>
            <input
              id="f-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "f-err" : undefined}
              autoComplete="off"
            />
            {error ? (
              <p id="f-err" className="err" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="f-ref">{t.refCode}</label>
            <input
              id="f-ref"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label htmlFor="f-ip">{t.ip}</label>
            <input
              id="f-ip"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder={freshIp(full)}
            />
          </div>
          <div className="row">
            <button type="submit">{t.add}</button>
            <button type="button" className="ghost" onClick={onBurst}>
              {t.burst}
            </button>
            <button
              type="button"
              className="ghost"
              disabled={mine.length === 0}
              onClick={() => {
                save([]);
                setCursor(Math.min(cursor, log.length));
              }}
            >
              {t.clearMine}
            </button>
          </div>
        </form>

        <h3>{t.link}</h3>
        {selectedEntry?.code ? (
          <div>
            <p>
              {selectedEntry.email}: <span className="mono">{selectedEntry.code}</span>
            </p>
            <p className="mono">{link}</p>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(link)
                  .then(() => setCopied(true))
                  .catch(() => undefined);
              }}
            >
              {copied ? t.copied : t.copy}
            </button>
            <p>
              <strong>
                {selectedEntry.position ? t.yourPosition(selectedEntry.position) : t.noPosition}
              </strong>
            </p>
          </div>
        ) : (
          <p className="muted">{selectedEntry ? t.noPosition : t.selectPerson}</p>
        )}
      </div>

      <div className="card">
        <div className="row" role="tablist" aria-label={t.queue}>
          {(["queue", "admin", "outbox"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              id={`tab-${k}`}
              aria-selected={tab === k}
              aria-controls="panel"
              onClick={() => setTab(k)}
            >
              {k === "queue"
                ? t.tabQueue
                : k === "admin"
                  ? t.tabAdmin
                  : `${t.tabOutbox} (${messages.length})`}
            </button>
          ))}
        </div>
        <div id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {tab === "queue" ? (
            <div className="tablewrap">
              <table>
                <caption className="sr">{t.queue}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.position}</th>
                    <th scope="col">{t.person}</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((e) => (
                    <tr key={e.index} className={e.index === selected ? "sel" : undefined}>
                      <td className="num">{e.position}</td>
                      <td>
                        <button
                          type="button"
                          className="rowbtn"
                          aria-pressed={e.index === selected}
                          onClick={() => {
                            setSelected(e.index);
                            setCopied(false);
                          }}
                        >
                          {e.email}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {tab === "admin" ? (
            <div className="tablewrap">
              <table>
                <caption className="sr">{t.log}</caption>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">{t.person}</th>
                    <th scope="col">{t.position}</th>
                    <th scope="col">{t.validRefs}</th>
                    <th scope="col">{t.rank}</th>
                    <th scope="col">{t.flags}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.index}>
                      <td className="num">{e.index + 1}</td>
                      <td>
                        {e.email}
                        <div className="mono muted">{e.code ?? "-"}</div>
                      </td>
                      <td className="num">{e.position ?? "-"}</td>
                      <td className="num">{e.validReferrals}</td>
                      <td className="num">{e.rank ?? "-"}</td>
                      <td>
                        {tags(e)}
                        {e.flags.map((f) => (
                          <div key={f} className="muted">
                            {why(e, f)}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {tab === "outbox" ? (
            <div>
              {live ? null : <p className="muted">{t.outboxDemo}</p>}
              {messages.length === 0 ? <p>{t.outboxEmpty}</p> : null}
              {messages.map((m) => (
                <p key={m.id} className="up">
                  <strong>{m.to}</strong>: {t.outboxSubject}. {t.movedUp(m.from, m.toPos)}
                  {m.sent ? ` (${t.liveSent})` : ""}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
