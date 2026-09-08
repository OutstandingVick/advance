# Security Model

## Implemented controls

- Native Attestcoin V2 verification gates every profile mutation.
- Source chain and emitting contract are immutable deployment parameters.
- Only successful source transaction receipts are accepted.
- Exactly one matching credit event must exist in a proved transaction.
- Evidence identity is consumed once globally.
- Wallet grants are bound to one consumer and can be revoked only by the wallet.
- Selective event masks are rejected in the MVP to prevent hiding negative
  history while presenting a favorable score.
- Score sessions expire, are caller-bound, and are invalidated by grant
  revocation or any profile-version change.
- Scores and arithmetic are bounded.

## Honest limitations

- This is hackathon testnet software and has not been audited.
- The source fixture is not a production lending protocol.
- The score only summarizes events proved to Advance; it is not a complete
  account of a person's debts or creditworthiness.
- Granting score access does not make public blockchain history private.
- Reorganization handling relies on Attestcoin's attestation and continuity
  rules; Advance does not claim a separate reorg oracle.
- A single configured source contract is supported in the MVP.

## Test coverage

The Foundry suite contains 20 tests covering grants, authorization, proof
failure, chain and emitter binding, receipt status, missing/ambiguous logs,
replay, session lifetime, profile versioning, and independent lenders.

