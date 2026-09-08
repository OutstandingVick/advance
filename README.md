# Advance

Advance turns verified cross-chain credit events into permissioned, reusable
credit signals on Creditcoin. A wallet proves its history through the
Attestcoin Protocol, then authorizes independent lenders to consume fresh score
sessions without relying on self-reported data.

## The demo

The same verified wallet profile produces terms from two unrelated reference
lenders. The wallet can revoke either lender independently, while expired
scores and replayed evidence fail closed.

## Day 1 scope

- Credit-event fixture for an Attestcoin-supported EVM source chain
- Native Attestcoin V2 proof verification on Creditcoin USC Testnet
- Consumer-scoped grants and independent revocation
- Versioned wallet profiles and expiring score sessions
- Two thin reference lender deployments
- Adversarial Foundry tests
- Proof-generation and deployment scripts

Advance is infrastructure, not a lending market. The reference lenders exist
only to demonstrate that multiple applications can consume the same portable
signal.

## Status

Day 1 implementation is in progress. Network addresses and verified explorer
transactions will be recorded under `deployments/` after testnet execution.

## License

MIT

