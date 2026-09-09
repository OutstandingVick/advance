# Threat model

Assets: integrity of per-wallet profiles, grant ownership, current consumer
sessions, replay markers, and operator credentials. No assets are held by the
reference lenders or the source fixture.

| Boundary | Untrusted input | Required control | Residual trust |
|---|---|---|---|
| Submitter → adapter | Chain key, receipt bytes, inclusion/continuity proof | Immutable chain key; native verifier; global transaction consumption | Native precompile and attestors |
| Verified receipt → profile | Log emitter, topics, action, amount, timestamp | Successful receipt; one matching signature; configured emitter; exact log shape and action | Source fixture's assertions and arithmetic |
| Wallet → grant | Consumer, expiry, event mask | Owner is msg.sender; nonzero consumer; future expiry; full event mask | Wallet key security |
| Consumer → session | Grant ID, duration | Active grant; bound consumer; bounded duration | Consumer must validate before decisions |
| Session → quote | Cached session ID | Consumer binding, expiry, grant revocation, profile version | RPC reads are snapshots, not final authorization |
| Repository → public | Source, logs, screenshots, artifacts | Tracked-file/history scans; no keys or local paths in evidence | Pattern scanners can miss secrets |

Anyone can relay evidence. The credited wallet comes from the verified log,
not the transaction sender. There is no caller-supplied expected wallet.
Rejecting a valid event merely because the relayer differs would break this
design, rather than improve authorization.

Anyone can read public profiles and invoke a reference lender on behalf of its
grant. Grants authorize a consumer contract, not confidential data access.
Two deployments of the same reference code are independent consumers, not two
independently developed protocols or pricing models.

Attestation is not proof of repayment economics: the demo fixture's lender can
record arbitrary payments. Omitted evidence, payment splitting, multiple
wallets and incomplete debt coverage can bias the score. No adverse-selection,
Sybil, custom reorganization, or privacy guarantee is implemented.
