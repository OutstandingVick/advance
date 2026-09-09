export type LenderState = {
  grant: boolean;
  revoked: boolean;
  expiresAt: number;
  sessionVersion: number | null;
};
export type Rehearsal = {
  version: number;
  hasEvidence: boolean;
  lenders: [LenderState, LenderState];
  events: string[];
};
export const newRehearsal = (): Rehearsal => ({
  version: 0,
  hasEvidence: false,
  lenders: [empty(), empty()],
  events: [],
});
const empty = (): LenderState => ({
  grant: false,
  revoked: false,
  expiresAt: 0,
  sessionVersion: null,
});
export type Action =
  | { type: 'evidence' }
  | { type: 'grant' | 'score' | 'revoke' | 'expire'; lender: 0 | 1 };
export function validSession(state: Rehearsal, i: 0 | 1, now: number): boolean {
  const l = state.lenders[i];
  return (
    l.grant &&
    !l.revoked &&
    l.expiresAt > now &&
    l.sessionVersion === state.version
  );
}
export function transition(
  state: Rehearsal,
  action: Action,
  now: number,
): Rehearsal {
  const next: Rehearsal = {
    ...state,
    lenders: state.lenders.map((l) => ({ ...l })) as Rehearsal['lenders'],
    events: [...state.events],
  };
  if (action.type === 'evidence') {
    if (state.hasEvidence)
      throw new Error(
        'Replay rejected: this sample evidence has already been consumed.',
      );
    next.hasEvidence = true;
    next.version++;
    next.events.unshift(
      'Sample payment accepted; existing sessions invalidated.',
    );
  } else {
    const l = next.lenders[action.lender],
      name = action.lender === 0 ? 'Northstar' : 'Harbor';
    if (action.type === 'grant') {
      l.grant = true;
      l.revoked = false;
      l.sessionVersion = null;
      l.expiresAt = now + 3600;
    }
    if (action.type === 'score') {
      if (!l.grant || l.revoked || l.expiresAt <= now)
        throw new Error('An active grant is required.');
      l.sessionVersion = state.version;
    }
    if (action.type === 'revoke') {
      if (!l.grant) throw new Error('No grant to revoke.');
      l.revoked = true;
    }
    if (action.type === 'expire') l.expiresAt = now;
    next.events.unshift(`${name}: ${action.type} completed in rehearsal.`);
  }
  return next;
}
