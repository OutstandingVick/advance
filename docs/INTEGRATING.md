# Integrate Advance into your application

Advance exposes a small Solidity interface and an ethers-based TypeScript SDK.
Use the Solidity interface when another contract needs to consume a score; use
the SDK for wallets, relayers, dashboards, and integration tests.

## Creditcoin Testnet deployment

| Component | Address |
| --- | --- |
| Advance registry | `0x3b52607c3718874f45eF249fB1A92D43f8B3D613` |
| Northstar reference lender | `0xA760E5f08c62159B6096b0a561D6328439f120E7` |
| Harbor reference lender | `0x2304C8cd29e4a9c34539B0E7eE309a39A3658EaC` |

- Chain ID: `102031`
- RPC: `https://rpc.cc3-testnet.creditcoin.network`
- Explorer: `https://creditcoin-testnet.blockscout.com/`
- Source: Sepolia chain key `1`, registry
  `0x3b52607c3718874f45eF249fB1A92D43f8B3D613`

The equal source and destination registry addresses are coincidental: the same
deployer used nonce zero on two different networks.

## Choose an integration

- **Your contract consumes scores:** import `IAdvance.sol` and call
  `requestScore`, `isScoreValid`, and `getScoreSession`.
- **Your application reads or writes Advance:** use `AdvanceReader` or
  `AdvanceClient` from the TypeScript SDK.
- **You want a worked pricing example:** inspect `ReferenceLender.sol`. It is a
  demonstration consumer, not part of the generic interface.

The canonical deployment data is in `deployments/testnet.json`.

## Solidity files and imports

Vendor these two files without changing their relative layout:

```text
contracts/src/AdvanceTypes.sol
contracts/src/interfaces/IAdvance.sol
```

Then import the interface from your consumer:

```solidity
import {IAdvance} from "./interfaces/IAdvance.sol";
```

`IAdvance.sol` imports `../AdvanceTypes.sol`. Keeping the two-file dependency is
intentional: the registry and consumers use the same named struct definitions,
which prevents documentation copies from drifting away from the deployed ABI.
If you vendor them elsewhere, update only that relative import.

## Minimal contract consumer

`contracts/src/examples/AdvanceScoreConsumer.sol` is the copyable example. The
essential pattern is:

```solidity
contract MyConsumer {
    IAdvance public immutable ADVANCE;

    constructor(IAdvance advance) { ADVANCE = advance; }

    function request(bytes32 grantId) external returns (bytes32) {
        return ADVANCE.requestScore(grantId, 1 hours);
    }

    function score(bytes32 sessionId) external view returns (uint16) {
        require(ADVANCE.isScoreValid(sessionId, address(this)), "invalid session");
        return ADVANCE.getScoreSession(sessionId).score;
    }
}
```

Before `request` can succeed, the wallet must call `createGrant` with
`consumer = address(MyConsumer)`. The consumer contract—not its operator or
frontend—is the identity bound into the grant and score session.

## Security requirements for consumers

1. Call `isScoreValid(sessionId, address(this))` immediately before every action
   that trusts a score. Never rely on a previously successful quote.
2. Treat validity as the authoritative active-grant check. It fails when the
   grant is revoked or expired, the session expires, the consumer differs, or
   newer evidence changes the wallet profile version.
3. Read the session only after the validity check and require its `consumer` to
   be your contract. Do not accept a session created for another integration.
4. Do not let a caller supply an arbitrary consumer address to the validity
   check; use `address(this)`.
5. Choose the shortest practical `validitySeconds`. The registry also enforces
   its protocol minimum, maximum, and grant-expiry ceiling.
6. Keep authorization separate from economic execution. A score permits a
   decision; it must not implicitly authorize moving the wallet's funds.
7. Public profiles are public chain data. Grants restrict protocol-recognized
   score sessions, not who can read historical storage.

Fail closed: if a call fails, a session is invalid, or chain state cannot be
read, do not use a cached score for a consequential decision.

## Test your integration

Run the repository's copyable consumer tests:

```bash
forge test --match-contract AdvanceScoreConsumerTest -vv
```

Your own consumer suite should cover at least:

- an active grant can create a session for your contract;
- another consumer cannot use that session;
- revocation immediately makes it unusable;
- expiry is invalid at the exact boundary;
- a profile update invalidates the cached session;
- an unknown session fails closed.

Then run all protocol and SDK gates:

```bash
npm run check
npm run sdk:build
```

For a testnet smoke test, bind only to the registry address listed above, verify
chain ID `102031`, create a grant for your deployed consumer, request a session,
and call `isScoreValid` again immediately before using the score.

## TypeScript integration

Build the local package and import its stable entry point:

```bash
npm run sdk:build
```

```ts
import { AdvanceReader, AdvanceClient } from "@advance-credit/sdk";
```

Use `AdvanceReader` with a provider for public profile, grant and session reads.
Use `AdvanceClient` with a signer for wallet-owned grants, revocation, or proof
submission. The package's `requestScore(lender, ...)` and `getQuote(...)`
conveniences are explicitly ReferenceLender-specific; generic on-chain consumers
call `IAdvance.requestScore` from their own contract.

See `sdk/README.md` for separate generic and reference-lender examples.
