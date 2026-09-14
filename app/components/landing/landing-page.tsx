const githubUrl = 'https://github.com/OutstandingVick/advance';

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10h11M11 6l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Check() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="m4 9.5 3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const stages = [
  ['01', 'Repayment', 'A supported credit event occurs on a source chain.'],
  [
    '02',
    'Verification',
    'Creditcoin verifies the source transaction and expected event.',
  ],
  [
    '03',
    'Profile',
    'Accepted evidence updates a versioned profile and deterministic score.',
  ],
  [
    '04',
    'Permission',
    'The borrower grants each lender scoped, expiring access.',
  ],
];
const safeguards = [
  [
    '01',
    'Scoped grants',
    'Authorization is bound to one lender contract—not every application.',
  ],
  [
    '02',
    'Time-boxed sessions',
    'Every score session expires automatically at a defined boundary.',
  ],
  [
    '03',
    'Independent revocation',
    'Remove one lender without interrupting another valid permission.',
  ],
  [
    '04',
    'Replay + stale-session protection',
    'Evidence counts once. Old score snapshots fail after profile updates.',
  ],
];
const capabilities = [
  'Ethereum Sepolia repayment evidence',
  'Creditcoin Testnet verification',
  'Onchain Advance Score',
  'Two independent lender contracts',
  'Grant and session creation',
  'Independent lender revocation',
  'Duplicate evidence rejection',
  'Stale-session invalidation',
  'Transaction and activity trail',
  'Rehearsal and Live Testnet modes',
];

export function LandingPage() {
  return (
    <div className="site">
      <header className="site-header">
        <a className="site-brand" href="/" aria-label="Advance home">
          <img src="/advance-logo.svg" alt="" width="36" height="36" />
          <span>advance</span>
        </a>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#security">Security</a>
          <a href="#developers">Developers</a>
          <a href="/docs">Docs</a>
          <a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <a className="button button-primary header-action" href="/demo">
          Launch app <Arrow />
        </a>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="site-eyebrow">
              Cross-chain credit attestation oracle
            </p>
            <h1 id="hero-title">
              Repay once.
              <br />
              <span>Prove it anywhere.</span>
            </h1>
            <p className="hero-lead">
              Advance turns verified onchain repayment activity into a portable
              credit profile while letting borrowers control exactly which
              lenders can use it and for how long.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="/demo">
                Launch Advance <Arrow />
              </a>
              <a className="text-link" href="#how-it-works">
                Explore the protocol <Arrow />
              </a>
            </div>
          </div>
          <div
            className="hero-system"
            aria-label="Ethereum repayment evidence is verified on Creditcoin and shared with authorized lenders"
          >
            <div className="system-topline">
              <span>Advance verification rail</span>
              <b>
                <i /> Testnet live
              </b>
            </div>
            <div className="system-flow">
              <article className="system-node">
                <small>Source</small>
                <strong>Ethereum</strong>
                <span>Repayment event</span>
              </article>
              <span className="flow-arrow">→</span>
              <article className="system-node">
                <small>Attestation</small>
                <strong>✓ Verified</strong>
                <span>Proof accepted</span>
              </article>
              <span className="flow-arrow">→</span>
              <article className="system-node profile-node">
                <small>Creditcoin profile</small>
                <strong>
                  525 <em>/ 900</em>
                </strong>
                <span>Profile version 2</span>
              </article>
            </div>
            <div className="lender-branches">
              <article>
                <span>N</span>
                <div>
                  <small>Northstar Credit</small>
                  <strong>Active · 45 min</strong>
                </div>
              </article>
              <article>
                <span>H</span>
                <div>
                  <small>Harbor Lending</small>
                  <strong>Active · 90 min</strong>
                </div>
              </article>
            </div>
            <p className="system-caption">
              One verified profile. Two independently authorized consumers.
            </p>
          </div>
        </section>

        <section className="problem" aria-labelledby="problem-title">
          <p className="section-index">The problem / 01</p>
          <div className="problem-grid">
            <h2 id="problem-title">
              Your repayment history shouldn&apos;t end where the chain does.
            </h2>
            <div>
              <p>
                Onchain reputation is fragmented between networks and protocols.
                Borrowers repeatedly rebuild trust. Lenders repeatedly rebuild
                verification infrastructure.
              </p>
              <p>
                Advance creates a shared verification layer: credit events can
                travel, while control over who reads the resulting score stays
                with the borrower.
              </p>
            </div>
          </div>
          <div className="fragment-map" aria-label="Fragmented histories converge into a borrower-controlled Advance profile">
            <div>
              <span>Ethereum</span>
              <span>Other EVM chains</span>
              <span>Lending protocols</span>
            </div>
            <strong>→</strong>
            <article>
              <img src="/advance-logo.svg" alt="" />
              <b>Advance</b>
              <small>Shared verified credit layer</small>
            </article>
            <strong>→</strong>
            <div>
              <span>Portable profile</span>
              <span>Borrower-controlled access</span>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="architecture"
          aria-labelledby="architecture-title"
        >
          <div className="section-heading">
            <p className="section-index">Architecture / 02</p>
            <h2 id="architecture-title">
              One verified history.
              <br />
              <span>Many independent lenders.</span>
            </h2>
            <p>
              Advance turns a source-chain event into a current, reusable signal
              through a four-stage verification and permission flow.
            </p>
          </div>
          <div className="stage-grid">
            {stages.map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="security"
          className="security"
          aria-labelledby="security-title"
        >
          <div>
            <p className="section-index">Permission model / 03</p>
            <h2 id="security-title">
              Portable reputation without public permission.
            </h2>
            <p>
              Advance separates proof of reputation from permission to use it.
              Lenders receive only a current score session—never custody or
              control of borrower funds.
            </p>
          </div>
          <div className="safeguard-list">
            {safeguards.map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="isolation" aria-labelledby="isolation-title">
          <div className="section-heading">
            <p className="section-index">Lender isolation / 04</p>
            <h2 id="isolation-title">
              One reputation.
              <br />
              <span>Independent permissions.</span>
            </h2>
          </div>
          <div className="isolation-demo" aria-label="Northstar is revoked while Harbor remains independently authorized">
            <div className="borrower-card">
              <small>Portable profile</small>
              <strong>Advance Score</strong>
              <b>
                525 <em>/ 900</em>
              </b>
              <span>✓ Verified on Creditcoin</span>
            </div>
            <div className="lender-states">
              <article className="revoked">
                <h3>
                  <i>N</i> Northstar Credit
                </h3>
                <b>Revoked</b>
                <p>Its previous score session is no longer valid.</p>
              </article>
              <article className="active">
                <h3>
                  <i>H</i> Harbor Lending
                </h3>
                <b>Still valid</b>
                <p>Its independent grant remains active.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="provenance" aria-labelledby="provenance-title">
          <div>
            <p className="section-index">Verification / 05</p>
            <h2 id="provenance-title">
              Don&apos;t trust the score.
              <br />
              <span>Verify its provenance.</span>
            </h2>
            <p>
              Advance binds every accepted event to the facts required to verify
              where it came from.
            </p>
          </div>
          <article className="attestation-record">
            <header>
              <div>
                <small>Attestcoin proof</small>
                <h3>Verified evidence</h3>
              </div>
              <span>✓ verify() returned true</span>
            </header>
            <dl>
              <div>
                <dt>Source chain</dt>
                <dd>Ethereum Sepolia</dd>
              </div>
              <div>
                <dt>Originating contract</dt>
                <dd>
                  <code>0x3b52…D613</code>
                </dd>
              </div>
              <div>
                <dt>Transaction</dt>
                <dd>
                  <code>0xc459…1fb0</code>
                </dd>
              </div>
              <div>
                <dt>Event position</dt>
                <dd>Receipt log 0</dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>Creditcoin Testnet</dd>
              </div>
              <div>
                <dt>Profile version</dt>
                <dd>Version 2</dd>
              </div>
            </dl>
            <footer>
              <a href="https://sepolia.etherscan.io/tx/0xc459eaa208582a5768f0a46487053cc0398aafec1057d7c39aa28175b7ad1fb0" target="_blank" rel="noreferrer">View source transaction ↗</a>
              <strong>Replay protected</strong>
            </footer>
          </article>
        </section>

        <section
          id="developers"
          className="developers"
          aria-labelledby="developers-title"
        >
          <div>
            <p className="section-index">For developers / 06</p>
            <h2 id="developers-title">
              Credit infrastructure you can plug into.
            </h2>
            <p>
              Lending protocols can import the Advance interface, request a
              score session, and validate it immediately before making a credit
              decision.
            </p>
            <ul>
              <li>Solidity consumer interface</li>
              <li>Typed TypeScript SDK</li>
              <li>Reference lender contracts</li>
              <li>Deployment and proof tooling</li>
            </ul>
            <div className="developer-actions">
              <a className="button button-light" href="/docs">
                Read the docs <Arrow />
              </a>
              <a className="text-link light-link" href={githubUrl} target="_blank" rel="noreferrer">
                View GitHub <Arrow />
              </a>
            </div>
          </div>
          <pre>
            <code>{`import {IAdvance} from "./IAdvance.sol";

function useScore(bytes32 sessionId)
    external view returns (uint16 score)
{
    require(
      ADVANCE.isScoreValid(sessionId, address(this)),
      "invalid session"
    );
    return ADVANCE.getScoreSession(sessionId).score;
}`}</code>
          </pre>
          <a className="source-link" href={`${githubUrl}/blob/main/contracts/src/interfaces/IAdvance.sol`} target="_blank" rel="noreferrer">Open the complete interface <Arrow /></a>
        </section>

        <section className="prototype" aria-labelledby="prototype-title">
          <div className="section-heading">
            <p className="section-index">Working prototype / 07</p>
            <h2 id="prototype-title">
              Not a concept.
              <br />
              <span>A working credit rail.</span>
            </h2>
            <p>
              Deployed contracts, recorded cross-chain proof evidence, tested
              authorization boundaries, and an interactive product flow.
            </p>
          </div>
          <div className="capability-grid">
            {capabilities.map((c, i) => (
              <div key={c}>
                <span>
                  <Check />
                </span>
                <p>{c}</p>
                <small>{String(i + 1).padStart(2, '0')}</small>
              </div>
            ))}
          </div>
          <p className="prototype-note">
            <strong>Transparent by design.</strong> Rehearsal uses deterministic
            sample data. Live Testnet mode connects to deployed Creditcoin
            contracts and requires testnet gas.
          </p>
        </section>

        <section className="final-cta" aria-labelledby="final-title">
          <p className="site-eyebrow">
            Portable reputation. Borrower-controlled access.
          </p>
          <h2 id="final-title">
            Credit should travel.
            <br />
            <span>Control should stay with the borrower.</span>
          </h2>
          <p>
            Verify repayment history once, then carry the reputation you earned
            into every compatible credit market.
          </p>
          <div>
            <a className="button button-primary" href="/demo">
              Launch Advance <Arrow />
            </a>
            <a className="text-link" href="/docs">
              Explore the protocol <Arrow />
            </a>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a className="site-brand" href="/">
          <img src="/advance-logo.svg" alt="" width="32" height="32" />
          <span>advance</span>
        </a>
        <p>Cross-chain credit attestation infrastructure.</p>
        <nav>
          <a href="#how-it-works">How it works</a>
          <a href="#security">Security</a>
          <a href="/docs">Docs</a>
          <a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <small>
          © {new Date().getFullYear()} Advance. Infrastructure, not a lender.
        </small>
      </footer>
    </div>
  );
}
