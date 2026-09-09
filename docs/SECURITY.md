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
- Scores are clamped; Solidity checked arithmetic reverts on overflow.

## Honest limitations

- This is hackathon testnet software and has not been audited.
- The source fixture is not a production lending protocol.
- The score only summarizes events proved to Advance; it is not a complete
  account of a person's debts or creditworthiness.
- Granting score access does not make public blockchain history private.
- Reorganization handling relies on Attestcoin's attestation and continuity
  rules; Advance does not claim a separate reorg oracle.
- A single configured source contract is supported in the MVP.
- Source fixture events are lender assertions, not proof of asset transfers.
  Small repeated payments can inflate the count-based score. Do not use this
  formula to allocate real credit or capital.
- Public getters expose scores and profiles without grants. Grants constrain
  protocol-recognized score sessions, not third-party reading or copying.
- Browser session IDs are in memory and are cleared on reload, account change,
  or deployment edits. Refresh chain state before relying on displayed quotes;
  other clients can invalidate sessions between refreshes. No automated retry
  submits a second transaction after an uncertain confirmation.

## Test coverage

The Foundry suite contains 25 tests covering grants, authorization, proof
failure, chain and emitter binding, receipt status, missing/ambiguous logs,
replay, session lifetime, profile versioning, and independent lenders.
