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
  return (
    <main className="workspace demo-shell">
      <header className="topbar">
        <Link className="wordmark" href="/" aria-label="Advance home">
          <span className="wordmark-mark" aria-hidden="true">A</span>
          advance
        </Link>
        <span className="network-badge"><i aria-hidden="true" />Creditcoin · Testnet</span>
      </header>
      <section className="intro">
        <p className="eyebrow">Your credit, connected</p>
        <h1>
          One history.
          <br />
          More possibilities.
        </h1>
        <p>
          Verify repayment events. Authorize independent lenders to use a
          current score.
        </p>
      </section>
      <fieldset className="mode-switch">
        <legend className="sr-only">Demo environment</legend>
        <Button
          disabled={busy}
          variant={!live ? 'default' : 'outline'}
          aria-pressed={!live}
          onClick={() => {
            setLive(false);
            setError('');
          }}
        >
          Rehearsal
        </Button>
        <Button
          disabled={busy}
          variant={live ? 'default' : 'outline'}
          aria-pressed={live}
          onClick={() => {
            setLive(true);
            setError('');
          }}
        >
          Live testnet
        </Button>
      </fieldset>
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
        <>
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
        </>
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
      <div className="workspace-grid">
        <section className="panel profile">
          <p className="eyebrow">Portable profile</p>
          <div className="score">
            {score ?? '—'}
            <span>/ 900</span>
          </div>
          <h2>{live ? 'On-chain score' : 'Rehearsal score'}</h2>
          <p>
            {live
              ? `Profile version: ${advance.profile?.version.toString() ?? 'not loaded'}`
              : 'A sample payment adds 25 points. This is a deterministic prototype, not a creditworthiness assessment.'}
          </p>
          {!live ? (
            <div className="actions">
              <Button onClick={() => rehearse({ type: 'evidence' })}>
                {demo.hasEvidence
                  ? 'Try evidence replay'
                  : 'Add sample payment'}
              </Button>
              <Button
                variant="secondary"
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
        </section>
        <section className="lenders">
          <div className="comparison-heading">
            <p className="eyebrow">Two lenders · One portable score</p>
            <h2>Independent access, compared live</h2>
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
                {!live && (
                  <Button
                    className="simulate-expiry"
                    variant="ghost"
                    onClick={() => rehearse({ type: 'expire', lender: index })}
                  >
                    Simulate expiry
                  </Button>
                )}
              </div>
            );
          })}
          </div>
        </section>
      </div>
      <section className="panel activity">
        <div className="activity-heading"><h2>Activity</h2><span>Session audit log</span></div>
        <ol aria-live="polite">
          {(live ? events : demo.events).map((e, i) => (
            <li key={`${i}-${e}`}>{e}</li>
          ))}
        </ol>
        {!(live ? events : demo.events).length && (
          <p>
            No actions yet. Grant permission to each lender, then request terms.
          </p>
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
