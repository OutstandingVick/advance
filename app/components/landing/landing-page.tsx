const features = [
  {
    asset: '/images/features/verified-evidence.png',
    alt: 'A verified repayment receipt stored in a digital wallet',
    title: 'Verified repayment evidence.',
  },
  {
    asset: '/images/features/portable-score.png',
    alt: 'A verified credit passport moving between blockchain networks',
    title: 'One score across every supported chain.',
  },
  {
    asset: '/images/features/timed-session.png',
    alt: 'A secure key and lender gate controlled by an hourglass',
    title: 'Scoped, time-boxed lender access.',
  },
  {
    asset: '/images/features/independent-revocation.png',
    alt: 'A wallet keeping one lender connected while revoking another',
    title: 'Independent revocation keeps you in control.',
  },
  {
    asset: '/images/features/replay-protection.png',
    alt: 'A shield accepting one proof and rejecting its duplicate',
    title: 'Replay-protected by design.',
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
                  className="lp-protocol-card"
                >
                  <img src={f.asset} alt={f.alt} loading="lazy" />
                  <h3>{f.title}</h3>
                </article>
              ))}
            </div>
          </section>

          <section id="how" className="lp-access" aria-labelledby="access-title">
            <figure className="lp-access-art">
              <img
                src="/images/advance-lender-access.png"
                alt="A wallet owner granting a lender temporary access to verified credit history"
                loading="lazy"
              />
            </figure>
            <div className="lp-access-copy">
              <h2 id="access-title">Your history,<br />your lenders</h2>
              <p className="lp-access-lead">Shared in just 2 steps.</p>
            </div>
          </section>

          <section id="roadmap" className="lp-roadmap" aria-labelledby="roadmap-title">
            <div className="lp-roadmap-copy">
              <h2 id="roadmap-title">One protocol.<br />Any credit market.</h2>
              <ul>
                <li><strong>Portable credit:</strong> Carry one verified repayment history across supported chains and applications.</li>
                <li><strong>Permissioned access:</strong> Give each lender a scoped, time-boxed session without exposing raw wallet activity.</li>
                <li><strong>Independent decisions:</strong> Let many lenders read the same evidence while setting their own terms.</li>
                <li><strong>User control:</strong> Revoke one lender instantly without disrupting every other active grant.</li>
              </ul>
            </div>

            <div className="lp-roadmap-visual" aria-label="Advance roadmap from verified evidence to portable scores and open credit markets">
              <svg className="lp-roadmap-lines" viewBox="0 0 760 600" aria-hidden="true">
                <path d="M175 150V238H380V300" />
                <path d="M380 410V470H600V390" />
              </svg>

              <article className="lp-phase lp-phase-one">
                <span className="lp-phase-number">01</span>
                <div className="lp-phase-icon" aria-hidden="true">✓</div>
                <p>Phase 1</p>
                <h3>Verified Evidence</h3>
              </article>

              <article className="lp-phase lp-phase-two">
                <span className="lp-phase-number">02</span>
                <div className="lp-phase-icon" aria-hidden="true">525</div>
                <p>Phase 2</p>
                <h3>Portable Score</h3>
              </article>

              <article className="lp-phase lp-phase-three">
                <span className="lp-phase-number">03</span>
                <div className="lp-phase-icon" aria-hidden="true">A</div>
                <p>Phase 3</p>
                <h3>Open Credit Markets</h3>
              </article>
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
