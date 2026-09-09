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

## Exact ABI and event interpretation

The external entry point is inherited from
[`AttestcoinVerifierAdapter`](../contracts/src/AttestcoinVerifierAdapter.sol):

```solidity
submitAttestedEvent(
    uint8 action, uint64 chainKey, uint64 blockHeight,
    bytes encodedTransaction, bytes32 merkleRoot,
    INativeQueryVerifier.MerkleProofEntry[] siblings,
    bytes32 lowerEndpointDigest, bytes32[] continuityRoots
) returns (bytes32 evidenceId)
```

Each sibling is `(bytes32 hash, bool isLeft)`. The adapter builds the native
MerkleProof and ContinuityProof structs without substituting the reconstructed
generic `usc.verify` signature in the original handoff.

```solidity
uint256 transactionIndex = VERIFIER.calculateTxIndex(merkleProof);
evidenceId = keccak256(abi.encode(chainKey, blockHeight, transactionIndex));
bool verified = VERIFIER.verifyAndEmit(
    chainKey, blockHeight, encodedTransaction, merkleProof, continuityProof
);
if (!verified) revert ProofVerificationFailed();
```

The replay marker is global to this registry and consumes a whole transaction
identity, not an individual log or score session. Exactly one matching
`CreditEvent(address,bytes32,uint8,uint256,uint64)` signature is required across
the decoded receipt; even an extra matching event from another emitter causes
ambiguity rejection. There is no caller-selectable log index.

The first indexed topic supplies the wallet; the second supplies the facility.
The payload supplies event type, amount, and occurrence time. Action 0 is loan
opened, 1 payment, 2 default. The action argument must match the event. On any
decode or semantic failure the entire destination transaction reverts,
including the consumed marker and native events. See `EvidenceAtomicityTest`.

## What is and is not proved

Attestcoin verifies inclusion and continuity according to the deployed native
protocol. Advance does not add a maximum evidence age or custom reorg oracle.
Source timestamps are accepted as emitted; ingestion order need not be time
order. Historical evidence remains eligible, but every accepted event changes
the profile version and invalidates old sessions.

The configured fixture records lender assertions; it does not transfer assets
or verify a real loan payment. A native proof establishes the occurrence of
that source event, not the completeness or economic truth of the credit file.
Full event masks do not force all adverse events to be submitted.

`proof:generate` obtains a bundle and uses native `verifySingle` as a read-only
check. `proof:submit` sends the registry transaction and waits for its successful
receipt. The former cannot replace the latter in the demo evidence record.

## Day 3 observed status

September 9, 2026: public RPC again returned chain ID 102031 and ChainInfo
advertised Sepolia key 1 / EVM ID 11155111. The proof service returned
`status: degraded`, `cc3_rpc_connected: false`, `eth_rpc_connected: true`.
The preflight exited nonzero. HTTP 200 alone is not a passing health check.

Gate A/C remain unproven. `deployments/testnet.json` intentionally contains null
addresses and no proof evidence. The native verifier is mocked in contract
unit tests; those tests cannot establish a successful live proof. After funding
and deployment, record `sourceTransactionHash`, `destinationTransactionHash`,
`evidenceId`, `receiptStatus: 1`, and `destinationBlock` per proof. The record
validator checks shape only; independently inspect receipts and emitted fields.

## Primary references

- <https://docs.creditcoin.org/usc>
- <https://docs.creditcoin.org/usc/migration-guide>
- <https://github.com/gluwa/cc-next-query-builder>
- <https://github.com/gluwa/usc-testnet-bridge-examples>
