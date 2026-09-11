const features = [
  {
    asset: '/images/features/verified-evidence.png',
    alt: 'A verified repayment receipt stored in a digital wallet',
    title: 'Verified repayment evidence.',
    accent: false,
  },
  {
    asset: '/images/features/portable-score.png',
    alt: 'A verified credit passport moving between blockchain networks',
    title: 'One score across every supported chain.',
    accent: true,
  },
  {
    asset: '/images/features/timed-session.png',
    alt: 'A secure key and lender gate controlled by an hourglass',
    title: 'Scoped, time-boxed lender access.',
    accent: false,
  },
  {
    asset: '/images/features/independent-revocation.png',
    alt: 'A wallet keeping one lender connected while revoking another',
    title: 'Independent revocation keeps you in control.',
    accent: false,
  },
  {
    asset: '/images/features/replay-protection.png',
    alt: 'A shield accepting one proof and rejecting its duplicate',
    title: 'Replay-protected by design.',
    accent: false,
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
            <img src="/advance-logo.svg" alt="" width={34} height={34} />
            ADVANCE
          </a>
          <a className="lp-menu" href="#features" aria-label="Explore Advance">
            <span />
            <span />
            <span />
          </a>
        </header>

        <main>
          <section className="lp-hero">
            <div className="lp-hero-copy">
              <h1 className="lp-h1">
                One History.
                <br />
                All Possibilities.
              </h1>
              <p className="lp-sub">
                VERIFIED CROSS-CHAIN CREDIT FOR ANY WALLET, LENDER, OR MARKET
              </p>
              <div className="lp-hero-actions">
                <a className="lp-cta-btn lp-btn-primary" href="/demo">
                  Use Advance now!
                </a>
              </div>
            </div>

            <img
              className="lp-hero-visual"
              src="/images/advance-credit-vault.png"
              alt="An isometric vault securing verified credit evidence between two lenders"
            />
          </section>

          <section className="lp-solution" aria-labelledby="solution-title">
            <div className="lp-solution-intro">
              <h2 id="solution-title">
                Advance has solved the fragmented credit challenge
              </h2>
              <p>
                ONE VERIFIED HISTORY FOR EVERY CHAIN, LENDER, AND MARKET.
              </p>
            </div>

            <div className="lp-keyhole" aria-hidden="true">
              <span className="lp-keyhole-ring" />
              <span className="lp-keyhole-core" />
              <span className="lp-keyhole-stem" />
            </div>

            <div className="lp-solution-copy">
              <h3>Build your history once</h3>
              <p>Verify repayments and let every approved lender read the same score.</p>
              <h3>No repeated applications, no locked-in profile,</h3>
              <p>just the credit you earned.<br />Now portable.</p>
            </div>
          </section>

          <section id="features" className="lp-protocol" aria-labelledby="protocol-title">
            <h2 id="protocol-title" className="lp-protocol-title">
              <span>Credit wasn&apos;t portable.</span>
              <strong><b>›››</b> Until now.</strong>
            </h2>
            <div className="lp-protocol-grid">
              {features.map((f) => (
                <article
                  key={f.title}
                  className={f.accent ? 'lp-protocol-card is-accent' : 'lp-protocol-card'}
                >
                  <img src={f.asset} alt={f.alt} loading="lazy" />
                  <h3>{f.title}</h3>
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
