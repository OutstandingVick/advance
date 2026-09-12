import { Button } from '@/components/ui/button';
export function LenderCard({
  index,
  name,
  granted,
  valid,
  busy,
  rate,
  score,
  expiry,
  now,
  onAction,
}: {
  index: number;
  name: string;
  granted: boolean;
  valid: boolean;
  busy: boolean;
  rate?: number;
  score?: number;
  expiry?: number;
  now: number;
  onAction: (action: 'grant' | 'score' | 'revoke') => void;
}) {
  return (
    <article className="lender-card">
      <div className="lender-heading">
        <span className="lender-avatar" aria-hidden="true">{name.slice(0, 1)}</span>
        <span className="lender-identity">
          <h2>{name}</h2>
          <small>Consumer 0{index + 1} · Creditcoin Testnet</small>
        </span>
        <span className={valid ? 'pill active' : 'pill'}>
          <i aria-hidden="true" />{valid ? 'Session active' : granted ? 'Permission set' : 'Not shared'}
        </span>
      </div>
      <div className="terms">
        <div>
          <small>Shared Advance score</small>
          <strong>{valid && score !== undefined ? score : '—'}</strong>
        </div>
        <div>
          <small>Illustrative annual rate</small>
          <strong>{valid && rate !== undefined ? `${rate}%` : '—'}</strong>
        </div>
        <div>
          <small>Access</small>
          <strong>{valid ? 'Authorized' : 'Needs permission'}</strong>
        </div>
      </div>
      {valid && expiry && (
        <p className="metadata">
          Time-boxed session · {Math.max(0, Math.ceil((expiry - now) / 60))} min remaining
        </p>
      )}
      <div className="actions">
        <Button disabled={busy} onClick={() => onAction('grant')}>
          {granted ? 'Renew permission' : 'Grant permission'}
        </Button>
        <Button
          disabled={busy || !granted}
          variant="outline"
          onClick={() => onAction('score')}
        >
          Get terms
        </Button>
        <Button
          disabled={busy || !granted}
          variant="ghost"
          onClick={() => onAction('revoke')}
        >
          Revoke
        </Button>
      </div>
    </article>
  );
}
