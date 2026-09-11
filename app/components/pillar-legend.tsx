const pillars = [
  ['Scoped Grant', 'Permission belongs to one lender.'],
  ['Time-Boxed Session', 'Every score has an expiry.'],
  ['Independent Revocation', 'One lender can be removed alone.'],
  ['Replay-Protected', 'Evidence can update a profile once.'],
] as const;

export function PillarLegend() {
  return (
    <section className="pillar-legend" aria-label="Advance protocol guarantees">
      {pillars.map(([name, detail]) => (
        <div key={name}>
          <strong>{name}</strong>
          <span>{detail}</span>
        </div>
      ))}
    </section>
  );
}
