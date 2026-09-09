# Day 2 demo runbook

## Rehearsal (no chain claims)

1. Start the app and leave Rehearsal selected. The initial score is 500.
2. Grant permission and get terms for both lenders.
3. Add the sample payment. The score becomes 525 and both snapshots expire
   through profile-version invalidation. Request terms again.
4. Revoke Northstar. Harbor's snapshot remains valid.
5. Simulate Harbor expiry. Its terms are hidden at the exact expiry boundary.
6. Try the sample payment again to demonstrate replay rejection, then reset.

Rehearsal rates are illustrative and are not a replica of deployed lender
pricing. Local state is not blockchain evidence.

## Live testnet (requires operational gates)

1. Follow DEPLOYMENT.md to fund and deploy the Sepolia fixture and Creditcoin
   registry plus two lenders. Never paste private keys into the UI.
2. Run `npm run preflight`. Stop if RPC/proof-service health is degraded.
3. Open a fixture loan and record a repayment on Sepolia. Save its hash.
4. Set SOURCE_CHAIN_TX_HASH and SOURCE_CHAIN_KEY in the ignored `.env`.
   Run `npm run proof:generate` and copy only the output proof JSON.
5. Choose Live testnet, enter the four addresses, connect, and refresh.
6. Paste the proof, choose the matching action, and submit. Wait for a confirmed
   explorer receipt. A simulated or submitted transaction is not confirmation.
7. Create a grant and request terms for each lender. Revoke one, refresh, and
   verify only its session is invalidated. Repeat submission to check replay.
8. Record addresses and source/destination transaction hashes in a deployment
   record. This record is required before claiming Gate C passed.

If a confirmation is uncertain, inspect the transaction link before retrying.
If the wallet network/account changes, reconnect and refresh. Reloading clears
in-memory grants and sessions; use contract events or the SDK to recover IDs.

The native verifier is mocked only in unit tests. A green local suite or
working rehearsal never substitutes for a real Attestcoin proof.
