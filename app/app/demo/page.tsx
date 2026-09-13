'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LenderCard } from '@/components/lender-card';
import { DeploymentForm } from '@/components/deployment-form';
import { EvidencePanel } from '@/components/evidence-panel';
import { PillarLegend } from '@/components/pillar-legend';
import {
  newRehearsal,
  transition,
  validSession,
  type Action,
} from '@/lib/rehearsal';
import { explorer, testnetConfig } from '@/lib/config';
import { useWallet } from '@/hooks/use-wallet';
import { useAdvance } from '@/hooks/use-advance';
import { parseProof, explainError as friendlyError } from '../../../sdk/src/index';
import { formatVerifiedAt, verifiedEvidence } from '@/lib/evidence';

export default function Home() {
  const [live, setLive] = useState(false),
    [demo, setDemo] = useState(newRehearsal);
  const [config, setConfig] = useState(testnetConfig),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState(''),
    [events, setEvents] = useState<string[]>([]);
  const [hash, setHash] = useState(''),
    [proof, setProof] = useState(''),
    [action, setAction] = useState(1);
  const locked = useRef(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);
  const wallet = useWallet();
  const advance = useAdvance(
    wallet.provider,
    wallet.account,
    config,
    (phase, tx) => {
      setEvents((e) => [phase, ...e].slice(0, 20));
      if (tx) setHash(tx);
    },
  );
  async function run(work: () => Promise<unknown>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      await work();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  function rehearse(a: Action) {
    setError('');
    try {
      setDemo(transition(demo, a, Math.floor(Date.now() / 1000)));
    } catch (e) {
      setError(friendlyError(e));
    }
  }
  const score = live ? advance.score : demo.hasEvidence ? 525 : 500;
  const activeSessionCount = live
    ? advance.access.filter((item) => item.valid && !item.revoked).length
    : demo.lenders.filter((_, index) => validSession(demo, index as 0 | 1, now)).length;
  return (
    <main className="workspace demo-shell">
      <header className="topbar">
        <Link className="wordmark" href="/" aria-label="Advance home">
          {/* oxlint-disable-next-line next/no-img-element */}
          <img src="/advance-logo.svg" alt="" width="42" height="42" />
          <span>advance</span>
        </Link>
        <div className="topbar-actions">
          <fieldset className="mode-switch">
            <legend className="sr-only">Demo environment</legend>
            <Button disabled={busy} variant={!live ? 'default' : 'outline'} aria-pressed={!live} onClick={() => { setLive(false); setError(''); }}>Rehearsal</Button>
            <Button disabled={busy} variant={live ? 'default' : 'outline'} aria-pressed={live} onClick={() => { setLive(true); setError(''); }}>Live testnet</Button>
          </fieldset>
          <span className="network-badge"><i aria-hidden="true" />Creditcoin · Testnet</span>
        </div>
      </header>

      <nav className="section-nav" aria-label="Demo sections">
        <a href="#overview">Overview</a><a href="#credit-history">Credit history</a><a href="#lenders">Lenders</a><a href="#permissions">Permissions</a><a href="#activity">Activity</a>
      </nav>

      <section className="score-hero" id="overview" aria-labelledby="page-title">
        <div className="score-hero-copy">
          <p className="eyebrow">Portable credit profile</p>
          <h1 id="page-title">One history. More possibilities.</h1>
          <p>Verify repayment history once, then share a current score with independent lenders on your terms.</p>
          <div className="hero-actions">
            <a className="primary-link" href="#lenders">Share with lender</a>
            {!live && <Button variant="outline" onClick={() => rehearse({ type: 'evidence' })}>{demo.hasEvidence ? 'Test replay protection' : 'Add sample payment'}</Button>}
          </div>
        </div>
        <div className="score-summary">
          <div className="score-label-row"><span>Advance Score</span><span className="verified-status"><i aria-hidden="true" />Verified</span></div>
          <div className="score-value">{score ?? '—'}<span>/ 900</span></div>
          <dl className="score-meta">
            <div><dt>Source</dt><dd>Ethereum Sepolia</dd></div>
            <div><dt>Verified on</dt><dd>Creditcoin Testnet</dd></div>
            <div><dt>Last verified</dt><dd><time dateTime={verifiedEvidence.verifiedAt}>{formatVerifiedAt(verifiedEvidence.verifiedAt)}</time></dd></div>
          </dl>
        </div>
      </section>
      <div className={`notice ${live ? 'notice-live' : 'notice-rehearsal'}`}>
        {live
          ? 'Verified deployments are preloaded. Connect a wallet with Creditcoin testnet gas to begin.'
          : 'Interactive rehearsal · Sample data only. No wallet or blockchain transactions.'}{' '}
        Public chain history remains readable; revocation invalidates authorized
        sessions, not historical data.
      </div>
      <EvidencePanel />
      <PillarLegend />
      {live && (
        <section className="connection-panel" aria-label="Testnet connection">
          <DeploymentForm value={config} onChange={setConfig} disabled={busy} />
          <div className="actions">
            <Button disabled={busy} onClick={() => run(wallet.connect)}>
              {wallet.account
                ? `${wallet.account.slice(0, 6)}…${wallet.account.slice(-4)}`
                : 'Connect wallet'}
            </Button>
            <Button
              variant="outline"
              disabled={busy || !wallet.account}
              onClick={() => run(advance.refresh)}
            >
              Refresh chain state
            </Button>
            <Button
              variant="ghost"
              disabled={busy || !wallet.account}
              onClick={wallet.disconnect}
            >
              Disconnect
            </Button>
          </div>
        </section>
      )}
      {error && (
        <div className="error" role="alert">
          <strong>{error}</strong>
          {error.toLowerCase().includes('replay') && (
            <p>
              Why this matters: this exact evidence cannot be reused to inflate
              the borrower&apos;s score twice.
            </p>
          )}
        </div>
      )}
      <output className={busy ? 'working-status' : 'sr-only'} aria-live="polite" aria-atomic="true">
        {busy ? 'Working… check your wallet if approval is requested. Do not resubmit.' : ''}
      </output>
      {hash && live && (
        <p>
          <a href={explorer(hash)} target="_blank" rel="noreferrer">
            View latest transaction ↗
          </a>
        </p>
      )}
      <div className="content-grid">
        <section className="history-panel" aria-labelledby="history-title">
          <div className="section-heading"><div><p className="eyebrow">Step 1 · Credit history</p><h2 id="history-title">Build verified history</h2></div><span className="section-state">{live ? 'Live' : 'Rehearsal'}</span></div>
          <div className="history-score" aria-label={`Current Advance Score: ${score ?? 'not loaded'} out of 900`}>
            <span>Current score</span>
            <strong>{score ?? '—'}<small>/ 900</small></strong>
            <em>{!live && demo.hasEvidence ? '+25 from verified payment' : 'Ready for verified evidence'}</em>
          </div>
          <p>
            {live
              ? `Profile version: ${advance.profile?.version.toString() ?? 'not loaded'}`
              : 'A sample payment adds 25 points. This is a deterministic prototype, not a creditworthiness assessment.'}
          </p>
          {!live ? (
            <div className="history-actions">
              <Button onClick={() => rehearse({ type: 'evidence' })}>
                {demo.hasEvidence
                  ? 'Try evidence replay'
                  : 'Add sample payment'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDemo(newRehearsal());
                  setError('');
                }}
              >
                Reset
              </Button>
            </div>
          ) : (
            <div className="proof-form">
              <label htmlFor="event-action">Evidence action</label>
              <select
                id="event-action"
                disabled={busy}
                value={action}
                onChange={(e) => setAction(Number(e.target.value))}
              >
                <option value={0}>Loan opened</option>
                <option value={1}>Payment recorded</option>
                <option value={2}>Default recorded</option>
              </select>
              <label htmlFor="proof">Proof bundle JSON</label>
              <textarea
                id="proof"
                disabled={busy}
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="Generate with npm run proof:generate"
              />
              <Button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    if (!wallet.account) {
                      throw new Error('Connect your wallet before submitting evidence.');
                    }
                    if (!proof.trim()) {
                      throw new Error('Paste a proof bundle before submitting evidence. Generate one with npm run proof:generate.');
                    }
                    const parsed = parseProof(JSON.parse(proof));
                    const { api } = await advance.client();
                    await api.submitEvidence(action, parsed, (phase, tx) => {
                      setEvents((e) => [phase, ...e]);
                      if (tx) setHash(tx);
                    });
                    await advance.refresh();
                  })
                }
              >
                Submit evidence
              </Button>
            </div>
          )}
          <p className="history-bridge">
            <span aria-hidden="true">→</span>
            One verified profile can be shared with either lender independently.
          </p>
        </section>
        <section className="lenders" id="lenders" aria-labelledby="lenders-title">
          <div className="section-heading">
            <div><p className="eyebrow">Step 2 · Connected lenders</p><h2 id="lenders-title">Choose who can access your score</h2><p className="section-description">Each lender receives a separate, time-boxed permission. Sharing with one never grants access to the other.</p></div>
            <span className="lender-count">{activeSessionCount} of 2 active</span>
          </div>
          <div className="lender-grid">
          {['Northstar Credit', 'Harbor Lending'].map((name, i) => {
            const index = i as 0 | 1,
              l = demo.lenders[index],
              a = advance.access[index];
            return (
              <div key={name}>
                <LenderCard
                  index={i}
                  name={name}
                  granted={
                    live ? !!a.grantId && !a.revoked : l.grant && !l.revoked
                  }
                  valid={
                    live
                      ? a.valid && (a.expiresAt ?? 0) > now
                      : validSession(demo, index, now)
                  }
                  revoked={live ? a.revoked : l.revoked}
                  busy={busy || (live && !wallet.account)}
                  rate={
                    live
                      ? a.quote
                        ? Number(a.quote.annualRateBps) / 100
                        : undefined
                      : demo.hasEvidence
                        ? 12
                        : 18
                  }
                  score={score ?? undefined}
                  expiry={live ? a.expiresAt : l.expiresAt}
                  now={now}
                  onAction={(type) =>
                    live
                      ? void run(() => advance.act(type, index))
                      : rehearse({ type, lender: index })
                  }
                />
                {!live && l.grant && !l.revoked && (
                  <Button
                    className="simulate-expiry"
                    variant="ghost"
                    onClick={() => rehearse({ type: 'expire', lender: index })}
                  >
                    Test session expiry
                  </Button>
                )}
              </div>
            );
          })}
          </div>
        </section>
      </div>
      <section className="activity" id="activity" aria-labelledby="activity-title">
        <div className="activity-heading"><div><p className="eyebrow">Recent events</p><h2 id="activity-title">Activity</h2></div><span>Session audit log</span></div>
        <ol className="activity-feed" aria-live="polite">
          {(live ? events : demo.events).map((e, i) => (
            <li key={`${i}-${e}`}><span className="activity-icon" aria-hidden="true">✓</span><span>{e}</span><time>Just now</time></li>
          ))}
        </ol>
        {!(live ? events : demo.events).length && (
          <div className="activity-empty"><span aria-hidden="true">◎</span><div><strong>No activity yet</strong><p>Grant a lender permission or add repayment evidence to begin the audit trail.</p></div></div>
        )}
      </section>
      <footer>
        Verified facts. Independent decisions.
        <a href="https://github.com/OutstandingVick/advance">
          Explore the protocol ↗
        </a>
      </footer>
    </main>
  );
}
