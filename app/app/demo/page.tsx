'use client';
import { useEffect, useRef, useState } from 'react';
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
import { emptyConfig, explorer } from '@/lib/config';
import { useWallet } from '@/hooks/use-wallet';
import { useAdvance } from '@/hooks/use-advance';
import { parseProof, explainError as friendlyError } from '../../../sdk/src/index';

export default function Home() {
  const [live, setLive] = useState(false),
    [demo, setDemo] = useState(newRehearsal);
  const [config, setConfig] = useState(emptyConfig),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState(''),
    [events, setEvents] = useState<string[]>([]);
  const [hash, setHash] = useState(''),
    [proof, setProof] = useState(''),
    [action, setAction] = useState(1);
  const locked = useRef(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
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
    <main className="workspace">
      <header className="topbar">
        <a className="wordmark" href="/">
          advance<span>↗</span>
        </a>
        <span>Creditcoin · Testnet</span>
      </header>
      <section className="intro">
        <p className="eyebrow">YOUR CREDIT, CONNECTED</p>
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
      <div className="mode-switch">
        <Button
          disabled={busy}
          variant={!live ? 'default' : 'outline'}
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
          onClick={() => {
            setLive(true);
            setError('');
          }}
        >
          Live testnet
        </Button>
      </div>
      <div className="notice">
        {live
          ? 'Live mode requires real deployments and testnet gas. No contracts are preconfigured.'
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
      {busy && (
        <p role="status">
          Working… check your wallet if approval is requested. Do not resubmit.
        </p>
      )}
      {hash && live && (
        <p>
          <a href={explorer(hash)} target="_blank" rel="noreferrer">
            View latest transaction ↗
          </a>
        </p>
      )}
      <div className="workspace-grid">
        <section className="panel profile">
          <p className="eyebrow">PORTABLE PROFILE</p>
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
                disabled={busy || !wallet.account || !proof.trim()}
                onClick={() =>
                  run(async () => {
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
            <p className="eyebrow">TWO LENDERS · ONE PORTABLE SCORE</p>
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
        <h2>Activity</h2>
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
