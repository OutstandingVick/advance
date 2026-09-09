# Security Model

## Implemented controls

- Native Attestcoin V2 verification gates every profile mutation.
- Source chain and emitting contract are immutable deployment parameters.
- Only successful source transaction receipts are accepted.
- Exactly one matching credit event must exist in a proved transaction.
- Evidence identity is consumed once globally.
- Wallet grants are bound to one consumer and can be revoked only by the wallet.
- Selective event masks are rejected. This prevents selective authorization,
  but cannot force submission of missing negative history.
- Score sessions expire, are caller-bound, and are invalidated by grant
  revocation or any profile-version change.
- Scores are clamped; ratio multiplication uses bundled full-precision math.
  Cumulative totals and counts still revert on checked arithmetic overflow.

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

## Day 3 review and regression matrix

| Control | Regression suite | Evidence type |
|---|---|---|
| Owner-only grants and revocation | AdvanceGrantsTest | Local unit |
| Full event mask; lifetime cap | GrantPropertiesTest, ExpiryBoundaryTest | Unit + 256-run fuzz properties |
| Native failure; wrong chain/emitter; failed receipt; ambiguity; replay | AdvanceEvidenceTest | Mock-native unit |
| Decoder/action rollback; transaction-index separation | EvidenceAtomicityTest | Mock-native unit |
| Credit belongs to log wallet, not relayer | WalletAttributionTest | Mock-native unit |
| Session caller, version, expiry, revocation, consumer isolation | AdvanceSessionsTest, LenderSafetyTest | Local unit |
| Extreme repayment ratio cannot disable scoring | ScoreArithmeticTest | Regression + 256-run fuzz property |
| Source lender and facility input controls | SourceRegistryTest | Local unit |
| Proof types, malformed IDs, receipt parsing | sdk/test | Node unit |
| Rehearsal transitions | app/test | Node unit, not live wallet testing |
| Publication patterns and deployment record shape | scripts/release/*.test.mjs | Node unit, not chain verification |

43 Foundry tests, including three fuzz properties, cover the reviewed snapshot.
Run them again when code changes; captured output is in `docs/evidence/day3`.
Missing coverage remains: a live native proof, real wallet end-to-end behavior,
stateful multi-transaction invariants, and independent protocol audit.

### Fixed before freeze: ratio denial of service

`totalRepaid * 100` previously overflowed for sufficiently large accepted values,
making profile scoring/session creation revert even when the final ratio was
small. The fix caps fully repaid profiles before multiplication and uses the
existing Gluwa-bundled FullMath for smaller ratios. Two max-value regressions
and a fuzz property exercise this behavior. This is a P1 pre-freeze fix, not a
new scoring feature. Existing deployed registries, if any, would need redeployment
because there is no upgrade mechanism; none is recorded in this repository.

## Publication hygiene and reporting

Run `npm run security:scan` and `npm run security:history`. They report locations
and rule names without echoing suspected secrets. The scan covers tracked
content and reachable history, not ignored files, binary metadata, unreachable
objects, or credentials whose form the rules do not recognize. Review output
and screenshots before publication. No signer values are needed for local tests.

Do not put vulnerability payloads, keys or personal information in a public
issue. Contact the repository maintainer through an available private channel.
If a secret is exposed, stop publishing, revoke/rotate it first, and coordinate
history cleanup; deleting a file alone does not revoke its credential.

## Dependency and readiness caveats

The Day 2 audit found no app production advisories but retained the Sharp
image-decoder advisory through Cloudflare development tooling. Recheck against
current registries; this review does not waive it. Scaffold-wide lint also
remains non-clean and is not represented as a passing gate. No untrusted image
processing is needed for the demo. See [feature freeze](FEATURE-FREEZE.md) for
the remaining P0/P1 release blockers and deferred P2 work.
