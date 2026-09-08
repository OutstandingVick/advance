# Day 1 Demo Runbook

1. Run `npm run chains` and show Sepolia as supported chain key `1`.
2. Deploy `SourceLoanRegistry` to Sepolia.
3. Open a facility and record a payment, saving the transaction hash.
4. Run `npm run proof:submit` and show the confirmed Creditcoin transaction.
5. Create separate grants for the two deployed reference lenders.
6. Ask both lenders for sessions and quotes from the same profile.
7. Revoke Lender A's grant.
8. Show Lender A's old session fail while Lender B remains valid.
9. Re-submit the same evidence and show replay rejection.
10. Run `forge test` and show all 20 adversarial tests passing.

Never call a locally mocked verifier a live Attestcoin demonstration. The test
double exists only to make rejection branches deterministic in unit tests.

