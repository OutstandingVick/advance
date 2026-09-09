# Advance client

Import `AdvanceReader` or `AdvanceClient` from `sdk/src/index.ts`. Both accept
a registry address and an ethers v6 provider or signer. All amounts and chain
timestamps use bigint. Writes return the actual emitted identifier and receipt.

```ts
const client = new AdvanceClient(registryAddress, signer);
const { id: grantId } = await client.createGrant(lender, expiresAt);
const { id: sessionId } = await client.requestScore(lender, grantId);
const quote = await client.getQuote(lender, sessionId);
await client.revokeGrant(grantId);
```

Call `validateDeployment` before enabling actions. Use `isScoreValid` before
acting on a cached session; a successful historical quote is not authorization
to draw a loan later. The current reference consumer only quotes terms.

Public profile getters are not privacy controls. Grants govern compliant
consumers; anyone can read public chain history.
