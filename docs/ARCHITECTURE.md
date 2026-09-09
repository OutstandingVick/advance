# Architecture and call ownership

Advance is a registry plus reusable client interfaces, not a lending market.
Two instances of one reference consumer demonstrate independent authorization
over one shared profile. They currently use identical pricing logic.

```text
Sepolia source fixture: openLoan / recordPayment / recordDefault
  -> CreditEvent(wallet, facilityId, eventType, amount, occurredAt)
  -> source block attested by protocol infrastructure
  -> off-chain ProofBuilder obtains inclusion + continuity proof
Creditcoin AdvanceRegistry.submitAttestedEvent (any relayer)
  -> immutable chain key check
  -> 0x0FD2.calculateTxIndex -> global evidence identity -> replay check
  -> 0x0FD2.verifyAndEmit -> false/revert aborts transaction
  -> decode successful receipt; one matching event; correct emitter/action
  -> consumedEvidence + per-wallet aggregate/version committed atomically
Wallet.createGrant(A)                         Wallet.createGrant(B)
  -> Lender A.requestBorrowerScore              -> Lender B.requestBorrowerScore
  -> Advance.requestScore                      -> Advance.requestScore
  -> independent, version-bound sessions over the same wallet profile
  -> lender.quote rechecks isScoreValid before returning illustrative terms
Wallet.revokeGrant(A) -> A invalid immediately; B unaffected
New wallet evidence -> both old snapshots invalid, regardless of grant
```

## Storage and authority

| State | Who changes it | Bound to |
|---|---|---|
| consumedEvidence | Adapter after native verification, in same transaction as decode | chainKey, source block height, transaction index |
| Profile | Registry's internal verified-event hook only | Wallet encoded in proved event |
| Grant | Creator wallet; only creator may revoke | One consumer, immutable source scope, full event mask |
| ScoreSession | Authorized consumer through requestScore | Grant, wallet, consumer, profile version, lifetime |

Anyone may relay a source event; no grant is required to ingest evidence. There
is no admin setter, upgrade proxy, token custody, cash transfer or debt issuance.
Native calls are a trusted dependency, not a replaceable verifier configured by
the operator. Unit tests alone replace native code using `vm.etch`.

## Validity is not confidentiality

`isScoreValid(sessionId, consumer)` is a public read with an explicit consumer
argument, not a check that the reader's msg.sender is that consumer. The lender
supplies `address(this)` before returning terms. Public profile, grant, score
and session getters remain readable after revocation.

A session is valid only while its grant is active, its consumer matches, its
expiry is strictly later than now, and its captured profile version still
matches. Expiry is min(grant expiry, issued time + requested duration). The
requested duration is 5 minutes–24 hours; a nearly expired grant can shorten it.

## Exact score

Base 500 + min(loans × 10, 50) + min(payments × 25, 250) + repayment ratio points
− min(default count × 150, 400), clamped above at 900 with a defensive floor.
Ratio points are zero without borrowed evidence; otherwise they equal
min(floor(totalRepaid × 100 / totalBorrowed), 100). Full-precision multiplication
prevents an intermediate overflow. Aggregate counters/totals still use checked
arithmetic and reject values that would overflow storage.

Recency is **not** part of this formula. `lastActivityAt` records the latest
ingested event's timestamp, which need not be the maximum chronological time.
The source fixture and missing/selected evidence can bias this signal; see
[threat model](THREAT-MODEL.md) and [security limitations](SECURITY.md).

## UI and SDK boundary

The app uses the local TypeScript SDK for public reads and injected-wallet
writes. It validates chain ID and contract bindings. Rehearsal is a separate
in-memory reducer with illustrative rates, not a cached live proof. Reloading
or changing wallet/deployment context clears session handles. Displayed live
quotes are snapshots; recheck on chain before any consequential action.
