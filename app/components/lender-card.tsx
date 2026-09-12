'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  const [revokeOpen, setRevokeOpen] = useState(false);

  return (
    <article className="lender-card">
      <div className="lender-heading">
        <span className="lender-avatar" aria-hidden="true">{name.slice(0, 1)}</span>
        <span className="lender-identity">
          <h3>{name}</h3>
          <small>Consumer 0{index + 1} · Creditcoin Testnet</small>
        </span>
        <span className={valid ? 'pill active' : 'pill'}>
          <i aria-hidden="true" />{valid ? 'Session active' : granted ? 'Permission set' : 'Not shared'}
        </span>
      </div>
      <dl className="terms">
        <div>
          <dt>Shared Advance score</dt>
          <dd>{valid && score !== undefined ? score : '—'}</dd>
        </div>
        <div>
          <dt>Illustrative annual rate</dt>
          <dd>{valid && rate !== undefined ? `${rate}%` : '—'}</dd>
        </div>
        <div>
          <dt>Access</dt>
          <dd>{valid ? 'Authorized' : 'Needs permission'}</dd>
        </div>
      </dl>
      {valid && expiry && (
        <p className="metadata session-expiry">
          <span><i aria-hidden="true" />Time-boxed session</span>
          <strong>{Math.max(0, Math.ceil((expiry - now) / 60))} min remaining</strong>
        </p>
      )}
      <div className="actions lender-actions">
        <Button className="grant-action" disabled={busy} onClick={() => onAction('grant')}>
          {granted ? 'Renew permission' : 'Grant permission'}
        </Button>
        <Button
          disabled={busy || !granted}
          variant="outline" className="terms-action"
          onClick={() => onAction('score')}
        >
          Get terms
        </Button>
        <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
          <AlertDialogTrigger
            disabled={busy || !granted}
            render={<Button variant="ghost" className="revoke-action" />}
          >
            Revoke
          </AlertDialogTrigger>
          <AlertDialogContent className="demo-revoke-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke {name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This ends only this lender&apos;s session. Other active lender
                permissions stay unchanged.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep session</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  setRevokeOpen(false);
                  onAction('revoke');
                }}
              >
                Revoke access
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
