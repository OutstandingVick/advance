import { verifiedEvidence, shortHash } from '@/lib/evidence';

export function EvidencePanel() {
  const evidence = verifiedEvidence;
  return (
    <section className="evidence-panel" aria-labelledby="evidence-title">
      <div className="evidence-heading">
        <div>
          <p className="eyebrow">ATTESTCOIN PROOF</p>
          <h2 id="evidence-title">Verified evidence</h2>
        </div>
        <span className="verified-badge">verify() returned true</span>
      </div>
      <dl className="evidence-grid">
        <div><dt>Source chain</dt><dd>{evidence.sourceChain}</dd></div>
        <div><dt>Source transaction</dt><dd><code title={evidence.sourceTransactionHash}>{shortHash(evidence.sourceTransactionHash)}</code></dd></div>
        <div><dt>Source block</dt><dd>{evidence.sourceBlock.toLocaleString()}</dd></div>
        <div><dt>Verified on Creditcoin</dt><dd><time dateTime={evidence.verifiedAt}>{new Date(evidence.verifiedAt).toLocaleString()}</time></dd></div>
      </dl>
      <a href={`https://creditcoin-testnet.blockscout.com/tx/${evidence.destinationTransactionHash}`} target="_blank" rel="noreferrer">
        Inspect native verification ↗
      </a>
    </section>
  );
}
