import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { TryIt } from "../../../components/TryIt";
import { compareQueues } from "../../../engine/compare";
import { processLog, runQueue } from "../../../engine/engine";
import { parseDisposable, parseLog } from "../../../engine/io";
import { RULES } from "../../../engine/rules";
import { scoreCases } from "../../../engine/score";
import type { CliResult } from "../../../engine/types";
import { dictionaries, isLang, type Lang } from "../../../i18n/dictionary";

const root = process.cwd();
const fx = (p: string) => readFileSync(join(root, "fixtures", p), "utf8");

function loadScore() {
  const dis = parseDisposable(fx("disposable-domains.txt"));
  const names = readdirSync(join(root, "fixtures", "cases"))
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => f.slice(0, -6))
    .sort();
  return scoreCases(
    names.map((n) => ({
      expected: JSON.parse(fx(`cases/${n}.expected.json`)) as CliResult,
      actual: processLog(parseLog(fx(`cases/${n}.jsonl`)), dis),
    })),
  );
}

export default async function AppPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const l: Lang = lang;
  const d = dictionaries[l];
  const log = parseLog(fx("signups.jsonl"));
  const disposable = [...parseDisposable(fx("disposable-domains.txt"))];
  const cmp = compareQueues(runQueue(log, new Set(disposable)));
  const score = loadScore();
  const c = d.compare;

  return (
    <main className="wrap">
      <header className="top">
        <a href={`https://portafolio-mdea.vercel.app/${l}/projects`}>{d.allProjects}</a>
        <nav className="lang" aria-label={d.language}>
          <a href={`/en/app`} hrefLang="en" lang="en" aria-current={l === "en"}>
            EN
          </a>
          <a href={`/es/app`} hrefLang="es" lang="es" aria-current={l === "es"}>
            ES
          </a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="h-hero">
        <p className="wordmark" aria-hidden="true">
          line<b>jump</b>
        </p>
        <h1 id="h-hero">{d.meta.title}</h1>
        <p className="lead">{d.meta.oneLiner}</p>
        <ul className="chips">
          {d.hero.chips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="h-analogy">
        <h2 id="h-analogy">{d.analogy.title}</h2>
        <p className="lead">{d.analogy.body}</p>
        <h3>{d.analogy.glossaryTitle}</h3>
        <dl className="card">
          {d.analogy.terms.map((t) => (
            <div key={t.term}>
              <dt>{t.term}</dt>
              <dd>{t.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="h-try">
        <h2 id="h-try">{d.tryIt.title}</h2>
        <p>{d.tryIt.intro}</p>
        <TryIt lang={l} log={log} disposable={disposable} />
      </section>

      <section aria-labelledby="h-compare">
        <h2 id="h-compare">{c.title}</h2>
        <p>{c.intro}</p>
        <div className="grid two">
          <div className="card">
            <h3>{c.naive}</h3>
            <p>{cmp.biggestJump > 0 ? c.jump(cmp.biggestJump) : c.jumpNone}</p>
          </div>
          <div className="card">
            <h3>{c.linejump}</h3>
            <dl>
              <dt>{c.signups}</dt>
              <dd className="num">{cmp.accepted}</dd>
              <dt>{c.duplicates}</dt>
              <dd className="num">{cmp.duplicates}</dd>
              <dt>{c.flagged}</dt>
              <dd className="num">{cmp.notCounted}</dd>
              <dt>{c.byType}</dt>
              <dd>
                {(["unknown_ref", "disposable", "same_ip", "burst"] as const).map((f) => (
                  <span key={f} className="tag">
                    {d.flagName[f]}: {cmp.byFlag[f]}
                  </span>
                ))}
              </dd>
              <dt>{c.evalScore}</dt>
              <dd className="num">
                {score.score} / 100
                <div className="muted">
                  {c.evalDetail(
                    score.cases,
                    score.flag_f1.toFixed(4),
                    score.position_exact.toFixed(4),
                  )}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="h-fits">
        <h2 id="h-fits">{d.fits.title}</h2>
        <div className="grid two">
          <div className="card">
            <h3>{d.fits.worth}</h3>
            <ul>
              {d.fits.worthItems.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3>{d.fits.notNeeded}</h3>
            <ul>
              {d.fits.notNeededItems.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="h-proves">
        <h2 id="h-proves">{d.proves.title}</h2>
        <p className="lead">{d.proves.body}</p>
      </section>

      <details>
        <summary>{d.engineers.summary}</summary>
        <h3>{d.engineers.mechanism}</h3>
        <ul>
          {d.engineers
            .mechanismItems({
              bonus: RULES.referralBonus,
              ipHours: RULES.sameIpWindowMs / 3_600_000,
              burstMin: RULES.burstWindowMs / 60_000,
              burstCount: RULES.burstThreshold,
              code: RULES.codeLength,
            })
            .map((i) => (
              <li key={i}>{i}</li>
            ))}
        </ul>
        <h3>{d.engineers.testing}</h3>
        <ul>
          {d.engineers.testingItems.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <p className="mono">{d.engineers.stack}</p>
        <p>
          <a href="https://github.com/mdeasis27/linejump">{d.engineers.repo}</a>
        </p>
      </details>
    </main>
  );
}
