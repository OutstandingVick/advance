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
