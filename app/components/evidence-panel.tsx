import {
  formatBlockNumber,
  formatVerifiedAt,
  verifiedEvidence,
} from '@/lib/evidence';

export function EvidencePanel() {
  const evidence = verifiedEvidence;

  return (
    <details className="evidence-panel" id="credit-history">
      <summary>
        <span className="evidence-summary-icon" aria-hidden="true">✓</span>
        <span className="evidence-summary-copy">
          <strong>Verified onchain</strong>
          <small>Attestcoin proof · Ethereum Sepolia → Creditcoin Testnet</small>
        </span>
        <span className="evidence-summary-time">{formatVerifiedAt(evidence.verifiedAt)}</span>
        <span className="disclosure-chevron" aria-hidden="true">⌄</span>
      </summary>

      <div className="evidence-details">
        <div className="evidence-details-heading">
          <div>
            <p className="eyebrow">Verification record</p>
            <h2>Attestcoin proof details</h2>
          </div>
          <span className="verified-badge"><i aria-hidden="true" />verify() returned true</span>
        </div>
        <dl className="evidence-grid">
          <div><dt>Source chain</dt><dd>{evidence.sourceChain}</dd></div>
          <div><dt>Source block</dt><dd><code>#{formatBlockNumber(evidence.sourceBlock)}</code></dd></div>
          <div className="evidence-wide"><dt>Source transaction</dt><dd><code><bdi>{evidence.sourceTransactionHash}</bdi></code></dd></div>
          <div><dt>Verified on Creditcoin</dt><dd><time dateTime={evidence.verifiedAt}>{formatVerifiedAt(evidence.verifiedAt)}</time></dd></div>
          <div><dt>Destination block</dt><dd><code>#{formatBlockNumber(evidence.destinationBlock)}</code></dd></div>
          <div className="evidence-wide"><dt>Verification transaction</dt><dd><code><bdi>{evidence.destinationTransactionHash}</bdi></code></dd></div>
        </dl>
        <div className="evidence-footer">
          <span>Cryptographically verified across two networks.</span>
          <a href={`https://creditcoin-testnet.blockscout.com/tx/${evidence.destinationTransactionHash}`} target="_blank" rel="noreferrer">Inspect verification ↗</a>
        </div>
      </div>
    </details>
  );
}
