const pillars = [
  ['Scoped Grant', 'Permission belongs to one lender.', 'SG'],
  ['Time-Boxed Session', 'Every score has an expiry.', 'TS'],
  ['Independent Revocation', 'One lender can be removed alone.', 'IR'],
  ['Replay-Protected', 'Evidence can update a profile once.', 'RP'],
] as const;

export function PillarLegend() {
  return (
    <section className="pillar-legend" aria-label="Advance protocol guarantees">
      {pillars.map(([name, detail, initials]) => (
        <article key={name}>
          <span className="pillar-icon" aria-hidden="true">{initials}</span>
          <span className="pillar-copy"><strong>{name}</strong><small>{detail}</small></span>
          <span className="pillar-state"><i aria-hidden="true" />Enforced</span>
        </article>
      ))}
    </section>
  );
}
