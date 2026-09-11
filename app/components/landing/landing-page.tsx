const features = [
  {
    tag: '01',
    title: 'Verified repayment history',
    body: 'Repayment events are recorded as cryptographically verified evidence — not self-reported claims. Your history is yours, portable across every chain you operate on.',
    accent: false,
  },
  {
    tag: '02',
    title: 'Authorize independent lenders',
    body: 'Grant scoped, time-boxed permission to any lender. They read your current score and quote terms. No lender ever sees your full ledger.',
    accent: false,
  },
  {
    tag: '03',
    title: 'Revoke in one click',
    body: 'Cut access instantly. Revocation invalidates authorized sessions on-chain — lenders lose the thread the moment you pull it.',
    accent: true,
  },
];

const steps = [
  {
    step: 'Step 1',
    title: 'Build your score',
    body: 'Submit repayment evidence from any chain. Verified events raise your portable score out of 900.',
  },
  {
    step: 'Step 2',
    title: 'Grant permission',
    body: 'Authorize independent lenders to read your score for a fixed window. Scoped, auditable, revocable.',
  },
  {
    step: 'Step 3',
    title: 'Get quoted',
    body: 'Lenders compete on your verified history. Better terms, without handing over your data.',
  },
];

function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7M17 7H9M17 7v8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LandingPage() {
  return (
    <div className="lp">
      <div className="lp-frame">
        <header className="lp-header">
          <a className="lp-logo" href="/">
            <span className="lp-logo-mark" aria-hidden="true">A</span>
            ADVANCE
          </a>
          <nav className="lp-nav">
            <a href="#how">How it works</a>
            <a href="#features">Protocol</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a className="lp-cta-btn lp-header-cta" href="/demo">
            Launch app <Arrow className="lp-btn-arrow" />
          </a>
        </header>

        <main>
          <section className="lp-hero">
            <p className="lp-eyebrow">YOUR CREDIT, CONNECTED</p>
            <h1 className="lp-h1">
              One history.
              <br />
              <span className="lp-h1-accent">More possibilities.</span>
            </h1>
            <p className="lp-sub">
              Portable cross-chain credit attestations on Creditcoin. Verify
              repayment events, authorize independent lenders, revoke access —
              in one click.
            </p>
            <div className="lp-hero-actions">
              <a className="lp-cta-btn lp-btn-primary" href="/demo">
                Launch the app <Arrow className="lp-btn-arrow" />
              </a>
              <a className="lp-cta-btn lp-btn-outline" href="#how">See how it works</a>
            </div>

            <div className="lp-hero-visual" aria-hidden="true">
              <div className="lp-score-card">
                <p className="lp-eyebrow lp-eyebrow-light">PORTABLE PROFILE</p>
                <div className="lp-score">
                  685<span>/ 900</span>
                </div>
                <div className="lp-score-bar">
                  <span style={{ width: '76%' }} />
                </div>
                <p className="lp-score-note">On-chain score · Creditcoin</p>
              </div>
              <div className="lp-lender-chip lp-lender-a">
                <span className="lp-dot" />
                <div>
                  <strong>Northstar Credit</strong>
                  <small>12.0% APR · access granted</small>
                </div>
              </div>
              <div className="lp-lender-chip lp-lender-b">
                <span className="lp-dot lp-dot-muted" />
                <div>
                  <strong>Harbor Lending</strong>
                  <small>session revoked</small>
                </div>
              </div>
              <div className="lp-event-chip">
                <code>+25</code> repayment verified
              </div>
            </div>
          </section>

          <section className="lp-marquee" aria-hidden="true">
            <div className="lp-marquee-track">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i} className="lp-marquee-group">
                  {[
                    'Verified facts',
                    'Independent decisions',
                    'Portable across chains',
                    'Revocable access',
                    'Creditcoin',
                  ].map((t) => (
                    <span key={t} className="lp-marquee-item">
                      {t} <span className="lp-marquee-star">✦</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </section>

          <section id="features" className="lp-section">
            <p className="lp-eyebrow">THE PROTOCOL</p>
            <h2 className="lp-h2">
              Credit built on proof,
              <br /> not promises.
            </h2>
            <div className="lp-features">
              {features.map((f) => (
                <article
                  key={f.tag}
                  className={f.accent ? 'lp-feature lp-feature-accent' : 'lp-feature'}
                >
                  <span className="lp-feature-tag">{f.tag}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="how" className="lp-section">
            <p className="lp-eyebrow">HOW IT WORKS</p>
            <h2 className="lp-h2">Three moves. That's it.</h2>
            <ol className="lp-steps">
              {steps.map((s, i) => (
                <li key={s.step} className="lp-step">
                  <span className="lp-step-num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="lp-step-eyebrow">{s.step}</p>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="faq" className="lp-section">
            <p className="lp-eyebrow">FAQ</p>
            <h2 className="lp-h2">Straight answers.</h2>
            <div className="lp-faq">
              {[
                {
                  q: 'Is my score private?',
                  a: 'Your raw history stays with you. Lenders only read the score during an authorized, time-boxed session — and you can revoke it at any moment.',
                },
                {
                  q: 'Which chains are supported?',
                  a: 'Evidence is anchored on Creditcoin and attests to repayment events from any connected chain. The score travels with you.',
                },
                {
                  q: 'Can a lender keep my data after revocation?',
                  a: 'Revocation invalidates authorized sessions on-chain. Public chain history remains readable, but future access is cut off immediately.',
                },
                {
                  q: 'What does the score mean?',
                  a: 'It is a deterministic prototype score out of 900 driven by verified repayment evidence — a coordination primitive for lenders, not a creditworthiness guarantee.',
                },
              ].map((item) => (
                <details key={item.q} className="lp-faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="lp-cta">
            <h2 className="lp-cta-title">
              Take your credit
              <br />
              <span>everywhere.</span>
            </h2>
            <a className="lp-cta-btn lp-btn-primary lp-btn-dark" href="/demo">
              Launch the app <Arrow className="lp-btn-arrow" />
            </a>
          </section>
        </main>

        <footer className="lp-footer">
          <span>© {new Date().getFullYear()} Advance — verified facts, independent decisions.</span>
          <a href="https://github.com/OutstandingVick/advance" target="_blank" rel="noreferrer">
            Explore the protocol ↗
          </a>
        </footer>
      </div>
    </div>
  );
}
