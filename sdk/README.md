# Advance TypeScript SDK

The package name is `@advance-credit/sdk`. It is built locally for this
hackathon repository and has not been published to npm.

```bash
npm --prefix sdk run build
```

From this consumers can install the repository package directly while it
remains unpublished:

```bash
npm install ../advance/sdk
```

Import `AdvanceReader` or `AdvanceClient` from `@advance-credit/sdk`. Both
accept a registry address and an ethers v6 provider or signer. Amounts and chain
timestamps use bigint. Writes return the emitted identifier and receipt.

## Generic: consume Advance directly

This block uses only the Advance registry and works with any integration:

```ts
const reader = new AdvanceReader(registryAddress, provider);
const profile = await reader.getProfile(walletAddress);
const score = await reader.computeScore(walletAddress);
const grant = await reader.getGrant(grantId);

if (grant.revoked || grant.expiresAt <= BigInt(Math.floor(Date.now() / 1000)))
  throw new Error("Grant is not active");
if (!(await reader.isScoreValid(sessionId, yourConsumerAddress)))
  throw new Error("Score session is not valid for this consumer");

const session = await reader.getScoreSession(sessionId);
console.log({ profile, score, session });
```

The on-chain consumer creates sessions by calling `IAdvance.requestScore`; the
wallet creates and revokes its grant with `AdvanceClient.createGrant` and
`AdvanceClient.revokeGrant`.

## ReferenceLender-specific demo

The following helpers intentionally target the repository's demonstration
`ReferenceLender` ABI. They are not required by a generic Advance consumer:

```ts
const client = new AdvanceClient(registryAddress, signer);
const { id: grantId } = await client.createGrant(referenceLender, expiresAt);
const { id: sessionId } = await client.requestScore(referenceLender, grantId);
const illustrativeTerms = await client.getQuote(referenceLender, sessionId);
await client.revokeGrant(grantId);
```

`requestScore(lender, grantId)` calls `ReferenceLender.requestBorrowerScore`;
`getQuote` calls its illustrative pricing function. A third-party contract
should define its own business logic around `IAdvance` instead.

Call `validateDeployment` before enabling actions. Use `isScoreValid` before
acting on a cached session; a successful historical quote is not authorization
to draw a loan later. The current reference consumer only quotes terms.

Public profile getters are not privacy controls. Grants govern compliant
consumers; anyone can read public chain history.
