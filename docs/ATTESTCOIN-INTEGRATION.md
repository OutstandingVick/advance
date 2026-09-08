# Attestcoin Integration

Advance targets the current Attestcoin/USC V2 readability architecture. The
integration was checked against `@gluwa/usc-sdk@0.18.0`,
`@gluwa/asc-contracts@0.2.1`, the official Gluwa examples, and the live
Creditcoin testnet on September 8, 2026.

## Verified network surface

| Component | Value |
|---|---|
| Creditcoin testnet RPC | `https://rpc.cc3-testnet.creditcoin.network` |
| EVM chain ID | `102031` (`0x18e8f`) |
| Proof builder | `https://prover.cc3-testnet.creditcoin.network` |
| BlockProver precompile | `0x0000000000000000000000000000000000000FD2` |
| ChainInfo precompile | `0x0000000000000000000000000000000000000FD3` |
| Supported source used by the demo | Sepolia, chain key `1`, EVM chain ID `11155111` |

The live ChainInfo query also reported Ethereum mainnet as chain key `3`. A
chain key is a Creditcoin protocol identifier and must not be replaced with an
EVM chain ID.

## Exact call flow

1. `SourceLoanRegistry` emits a `CreditEvent` on Sepolia.
2. `scripts/prove-and-submit.ts` waits for the source transaction and its
   Creditcoin attestation.
3. `@gluwa/usc-sdk` requests the transaction and continuity proof from the
   proof-builder service.
4. The script calls `AdvanceRegistry.submitAttestedEvent(...)` on Creditcoin.
5. `AttestcoinVerifierAdapter` rejects a source-chain-key mismatch and derives
   the transaction index using `BlockProver.calculateTxIndex`.
6. It rejects an already-consumed `(chainKey, blockHeight, transactionIndex)`.
7. It calls the native V2 precompile's state-changing function:

```solidity
VERIFIER.verifyAndEmit(
    chainKey,
    blockHeight,
    encodedTransaction,
    merkleProof,
    continuityProof
);
```

8. Only after successful verification does `AdvanceRegistry` decode the proved
   receipt, require a successful source transaction, require exactly one
   matching log from the configured source contract, and update the wallet
   profile.

Removing the Attestcoin verification makes the only profile-update path
unusable; the integration is therefore a core dependency rather than a badge
or optional lookup.

## Live check versus deployment

The public RPC returned chain ID `102031`, the proof-builder health endpoint
returned HTTP 200, and the ChainInfo precompile returned supported chains. A
real proof submission additionally requires:

- a funded Sepolia source signer;
- a funded Creditcoin testnet signer;
- deployment of `SourceLoanRegistry` on Sepolia;
- a confirmed source event and enough time for its block to be attested.

Those wallet-dependent transactions are deliberately not fabricated. Their
addresses and explorer links belong in `deployments/testnet.json` immediately
after execution.

## Primary references

- <https://docs.creditcoin.org/usc>
- <https://docs.creditcoin.org/usc/migration-guide>
- <https://github.com/gluwa/cc-next-query-builder>
- <https://github.com/gluwa/usc-testnet-bridge-examples>

