const pillars = [
  ['Scoped Grant', 'One lender'],
  ['Time-Boxed Session', 'Automatic expiry'],
  ['Independent Revocation', 'Isolated access'],
  ['Replay-Protected', 'Evidence used once'],
] as const;

export function PillarLegend() {
  return (
    <section className="trust-strip" id="permissions" aria-labelledby="trust-title">
      <div className="trust-heading">
        <span className="trust-mark" aria-hidden="true">✓</span>
        <span><strong id="trust-title">Protocol safeguards</strong><small>Enforced by Advance</small></span>
      </div>
      <div className="trust-items">
        {pillars.map(([name, detail]) => (
          <span className="trust-item" key={name}>
            <i aria-hidden="true" />
            <span><strong>{name}</strong><small>{detail}</small></span>
          </span>
        ))}
      </div>
    </section>
  );
}
