const sections = [
  ['overview', 'Overview'],
  ['quickstart', 'Quickstart'],
  ['architecture', 'Architecture'],
  ['usc', 'USC verification'],
  ['integration', 'Contract integration'],
  ['permissions', 'Permissions & sessions'],
  ['security', 'Security requirements'],
  ['deployments', 'Testnet deployments'],
] as const;

const deployments = [
  ['Source fixture', 'Ethereum Sepolia', '0x3b52607c3718874f45eF249fB1A92D43f8B3D613'],
  ['Advance registry', 'Creditcoin Testnet', '0x3b52607c3718874f45eF249fB1A92D43f8B3D613'],
  ['Northstar Credit', 'Creditcoin Testnet', '0xA760E5f08c62159B6096b0a561D6328439f120E7'],
  ['Harbor Lending', 'Creditcoin Testnet', '0x2304C8cd29e4a9c34539B0E7eE309a39A3658EaC'],
  ['Native verifier', 'Creditcoin Testnet', '0x0000000000000000000000000000000000000FD2'],
] as const;

function Code({ children }: { children: string }) {
  return (
    <pre className="docs-code" tabIndex={0}>
      <code>{children}</code>
    </pre>
  );
}

function ExternalIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function DocsPage() {
  return (
    <div className="docs-shell">
      <header className="docs-topbar">
        <a className="docs-brand" href="/" aria-label="Advance home">
          <img src="/advance-logo.svg" alt="" width="30" height="30" />
          <span>ADVANCE</span>
          <b>DOCS</b>
        </a>
        <nav className="docs-header-links" aria-label="Product links">
          <a href="/demo">Demo</a>
          <a href="https://github.com/OutstandingVick/advance" target="_blank" rel="noreferrer">
            GitHub <ExternalIcon />
          </a>
        </nav>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <div className="docs-sidebar-inner">
            <p className="docs-nav-label">Documentation</p>
            <nav aria-label="Documentation sections">
              {sections.map(([id, label]) => (
                <a key={id} href={`#${id}`}>{label}</a>
              ))}
            </nav>
            <div className="docs-sidebar-meta">
              <span className="docs-status"><i /> Testnet live</span>
              <p>Creditcoin EVM 102031</p>
              <p>Sepolia source key 1</p>
            </div>
          </div>
        </aside>

        <main className="docs-content">
          <section id="overview" className="docs-hero">
            <p className="docs-kicker">Advance protocol</p>
            <h1>Portable credit, built from verified facts.</h1>
            <p className="docs-lead">
              Advance turns cross-chain repayment events into reusable credit scores on Creditcoin.
              Wallets decide which lenders can consume a score, for how long, and when access ends.
            </p>
            <div className="docs-hero-actions">
              <a className="docs-primary" href="#quickstart">Start integrating</a>
              <a className="docs-secondary" href="/demo">Open live demo</a>
            </div>
            <div className="docs-pillar-row" aria-label="Protocol guarantees">
              <span>Scoped grants</span>
              <span>Time-boxed sessions</span>
              <span>Independent revocation</span>
              <span>Replay-protected</span>
            </div>
          </section>

          <section className="docs-section docs-summary" aria-labelledby="what-title">
            <div>
              <p className="docs-kicker">What Advance is</p>
              <h2 id="what-title">A credit-signal registry, not a lending market.</h2>
            </div>
            <p>
              Advance verifies source-chain credit events, updates a versioned wallet profile, and
              issues lender-specific score sessions. It does not custody funds, issue debt, approve
              loans, or force lenders to use the same underwriting policy.
            </p>
          </section>

          <section id="quickstart" className="docs-section">
            <p className="docs-kicker">Quickstart</p>
            <h2>Run the app and protocol checks</h2>
            <p>Clone the repository, install the workspace dependencies, and run the complete check suite.</p>
            <Code>{`git clone https://github.com/OutstandingVick/advance.git
cd advance
npm install
npm ci --prefix app
npm run check
npm --prefix app run dev`}</Code>
            <div className="docs-callout">
              <strong>Two modes, one interface.</strong>
              <p>Rehearsal mode needs no wallet. Live mode requires a browser wallet on Creditcoin Testnet and testnet gas.</p>
            </div>
          </section>

          <section id="architecture" className="docs-section">
            <p className="docs-kicker">Architecture</p>
            <h2>Evidence and permission are separate layers</h2>
            <div className="docs-flow" aria-label="Advance architecture flow">
              <article><b>01</b><span>Sepolia</span><strong>Credit event</strong><p>A source registry emits a typed repayment event.</p></article>
              <i aria-hidden="true">→</i>
              <article><b>02</b><span>Attestcoin</span><strong>Native proof</strong><p>USC proves transaction inclusion and continuity.</p></article>
              <i aria-hidden="true">→</i>
              <article><b>03</b><span>Advance</span><strong>Profile update</strong><p>The verified event updates score inputs atomically.</p></article>
              <i aria-hidden="true">→</i>
              <article><b>04</b><span>Lenders</span><strong>Score sessions</strong><p>Each approved consumer receives an isolated snapshot.</p></article>
            </div>
          </section>

          <section id="usc" className="docs-section">
            <p className="docs-kicker">USC verification</p>
            <h2>How a source transaction becomes trusted input</h2>
            <ol className="docs-steps">
              <li><b>Observe.</b> <span><code>SourceLoanRegistry</code> emits a <code>CreditEvent</code> on Sepolia.</span></li>
              <li><b>Prove.</b> <span>The proof builder returns transaction inclusion and continuity proof data after attestation.</span></li>
              <li><b>Verify.</b> <span>The Creditcoin BlockProver precompile calculates the transaction index and <code>verifyAndEmit</code> must return true.</span></li>
              <li><b>Decode.</b> <span>Advance requires a successful receipt, the configured emitter, one matching event, and matching action semantics.</span></li>
              <li><b>Commit.</b> <span>The replay marker and profile update succeed together or the entire destination transaction reverts.</span></li>
            </ol>
            <Code>{`bool verified = VERIFIER.verifyAndEmit(
    chainKey,
    blockHeight,
    encodedTransaction,
    merkleProof,
    continuityProof
);
if (!verified) revert ProofVerificationFailed();`}</Code>
          </section>

          <section id="integration" className="docs-section">
            <p className="docs-kicker">Contract integration</p>
            <h2>Consume Advance directly</h2>
            <p>
              Vendor <code>contracts/src/interfaces/IAdvance.sol</code> together with
              <code> contracts/src/AdvanceTypes.sol</code>. Your consumer contract requests a score,
              stores the returned session ID, and checks validity before every consequential action.
            </p>
            <Code>{`import {IAdvance} from "./interfaces/IAdvance.sol";
import {AdvanceTypes} from "./AdvanceTypes.sol";

contract AdvanceConsumer {
    IAdvance public immutable ADVANCE;

    constructor(address registry) {
        ADVANCE = IAdvance(registry);
    }

    function useScore(bytes32 sessionId) external view returns (uint16 score) {
        require(
            ADVANCE.isScoreValid(sessionId, address(this)),
            "invalid score session"
        );
        AdvanceTypes.ScoreSession memory session = ADVANCE.getScoreSession(sessionId);
        return session.score;
    }
}`}</Code>
            <div className="docs-link-grid">
              <a href="https://github.com/OutstandingVick/advance/blob/main/docs/INTEGRATING.md" target="_blank" rel="noreferrer">
                <span>Integration guide</span><strong>Exact imports, calls, and tests</strong><ExternalIcon />
              </a>
              <a href="https://github.com/OutstandingVick/advance/blob/main/contracts/src/interfaces/IAdvance.sol" target="_blank" rel="noreferrer">
                <span>Solidity interface</span><strong>IAdvance.sol</strong><ExternalIcon />
              </a>
              <a href="https://github.com/OutstandingVick/advance/tree/main/sdk" target="_blank" rel="noreferrer">
                <span>TypeScript package</span><strong>@advance-credit/sdk</strong><ExternalIcon />
              </a>
            </div>
          </section>

          <section id="permissions" className="docs-section">
            <p className="docs-kicker">Permissions and sessions</p>
            <h2>One profile, independent lender access</h2>
            <div className="docs-permission-grid">
              <article><span>Grant</span><h3>Consumer-scoped</h3><p>A grant belongs to one wallet and one consumer contract. The consumer cannot substitute another address.</p></article>
              <article><span>Session</span><h3>Version-bound</h3><p>A snapshot is bound to the current wallet profile version. New verified evidence invalidates older sessions.</p></article>
              <article><span>Expiry</span><h3>Strictly time-boxed</h3><p>Session expiry is capped by the grant expiry. At the exact boundary, the score is no longer valid.</p></article>
              <article><span>Revocation</span><h3>Isolated by lender</h3><p>Revoking Northstar invalidates its session immediately while Harbor can remain active.</p></article>
            </div>
          </section>

          <section id="security" className="docs-section">
            <p className="docs-kicker">Security requirements</p>
            <h2>Fail closed before trusting a score</h2>
            <div className="docs-rule">
              <b>Required</b>
              <div><strong>Call <code>isScoreValid(sessionId, address(this))</code> immediately before use.</strong><p>Do not trust a cached result or allow the caller to supply an arbitrary consumer address.</p></div>
            </div>
            <ul className="docs-checklist">
              <li>Require an active, unexpired grant for this consumer.</li>
              <li>Reject expired sessions and stale profile versions.</li>
              <li>Bind the configured source chain key and event emitter.</li>
              <li>Reject failed receipts, ambiguous logs, and action mismatches.</li>
              <li>Treat a consumed evidence ID as globally unavailable for replay.</li>
            </ul>
            <a className="docs-inline-link" href="https://github.com/OutstandingVick/advance/blob/main/docs/SECURITY.md" target="_blank" rel="noreferrer">
              Read the full security review <ExternalIcon />
            </a>
          </section>

          <section id="deployments" className="docs-section">
            <p className="docs-kicker">Testnet deployments</p>
            <div className="docs-section-heading">
              <h2>Verified deployment surface</h2>
              <span className="docs-status"><i /> Creditcoin Testnet</span>
            </div>
            <div className="docs-table-wrap">
              <table>
                <thead><tr><th>Component</th><th>Network</th><th>Address</th></tr></thead>
                <tbody>
                  {deployments.map(([component, network, address]) => (
                    <tr key={component}><td>{component}</td><td>{network}</td><td><code>{address}</code></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="docs-caption">
              The identical source-fixture and registry addresses are coincidental. The native verifier is a Creditcoin protocol precompile, not an Advance deployment.
            </p>
          </section>

          <section className="docs-section docs-next">
            <div><p className="docs-kicker">Next step</p><h2>See the permission model live.</h2></div>
            <a className="docs-primary" href="/demo">Launch Advance demo</a>
          </section>
        </main>

        <aside className="docs-toc" aria-label="On this page">
          <p>On this page</p>
          {sections.slice(2).map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </aside>
      </div>
    </div>
  );
}
