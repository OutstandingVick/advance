import {
  formatBlockNumber,
  formatVerifiedAt,
  verifiedEvidence,
} from '@/lib/evidence';

export function EvidencePanel() {
  const evidence = verifiedEvidence;
  return (
    <section className="evidence-panel" aria-labelledby="evidence-title">
      <div className="evidence-heading">
        <div>
          <p className="eyebrow">Attestcoin proof</p>
          <h2 id="evidence-title">Verified evidence</h2>
          <p className="evidence-subtitle">On-chain attestation record</p>
        </div>
        <span className="verified-badge"><i aria-hidden="true" />verify() returned true</span>
      </div>
      <dl className="evidence-grid">
        <div><dt>Source chain</dt><dd><span className="evidence-network-dot" aria-hidden="true" />{evidence.sourceChain}</dd></div>
        <div><dt>Source transaction</dt><dd><code><bdi>{evidence.sourceTransactionHash}</bdi></code></dd></div>
        <div><dt>Source block</dt><dd><code>#{formatBlockNumber(evidence.sourceBlock)}</code></dd></div>
        <div><dt>Verified on Creditcoin</dt><dd><time dateTime={evidence.verifiedAt}>{formatVerifiedAt(evidence.verifiedAt)}</time></dd></div>
      </dl>
      <div className="evidence-footer">
        <span>Verification tx <code><bdi>{evidence.destinationTransactionHash}</bdi></code></span>
        <a href={`https://creditcoin-testnet.blockscout.com/tx/${evidence.destinationTransactionHash}`} target="_blank" rel="noreferrer">
          Inspect native verification ↗
        </a>
      </div>
    </section>
  );
}
