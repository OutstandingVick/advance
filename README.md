# Advance

Advance turns verified cross-chain credit events into permissioned, reusable
credit signals on Creditcoin. A wallet proves its history through the
Attestcoin Protocol, then authorizes independent lenders to consume fresh score
sessions without relying on self-reported data.

## The demo

The same verified wallet profile produces terms from two unrelated reference
lenders. The wallet can revoke either lender independently, while expired
scores and replayed evidence fail closed.

**Release status:** feature scope is frozen, but live testnet proof/deployment
evidence is still missing. The [hosted rehearsal](https://advance-credit-demo.outstandingvick.chatgpt.site)
is owner-private, not a publicly usable submission. No production-readiness,
complete debt history, or confidential-data guarantee is claimed.

[Reproduce checks](docs/REPRODUCING.md) · [Live testnet runbook](docs/LIVE-DEPLOYMENT.md) ·
[Screenshots](docs/SCREENSHOTS.md) · [Security review](docs/SECURITY.md) ·
[Freeze blockers](docs/FEATURE-FREEZE.md)

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

## Quick start

```bash
npm install
forge install
npm run check
CREDITCOIN_RPC_URL=https://rpc.cc3-testnet.creditcoin.network npm run chains
```

Copy `.env.example` to `.env` before deployment. See
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the runbook and
[`docs/LIVE-DEPLOYMENT.md`](docs/LIVE-DEPLOYMENT.md) for the encrypted-keystore commands, and
[`docs/ATTESTCOIN-INTEGRATION.md`](docs/ATTESTCOIN-INTEGRATION.md) for the exact
proof path.

## Day 2 app and SDK

```bash
npm ci
npm ci --prefix app
npm --prefix app run dev
```

Open the displayed localhost URL. Rehearsal needs no wallet. Live mode requires
four deployment addresses, a browser wallet, and testnet gas; nothing is deployed
automatically. See [Day 2 status](docs/DAY-2.md), [demo steps](docs/DEMO.md), and
[SDK documentation](sdk/README.md).

`npm run check` checks contracts, scripts, SDK tests and rehearsal-state tests.
`npm --prefix app run build` builds the app. `npm run preflight` checks external
dependencies without signing. `npm run example:two-lenders` signs testnet
transactions only when explicitly run with a configured funded signer.

## Verification status

- Contracts and deployment scripts compile.
- Day 3 adds a ratio-overflow fix and security regressions: 43 Foundry tests,
  15 SDK/rehearsal tests, and 11 release-tool tests (69 total).
- TypeScript proof tooling passes strict type checking.
- The live Creditcoin RPC, proof-builder health endpoint, and ChainInfo
  precompile have been checked.
- Sepolia is currently advertised as source chain key `1`.
- Funded-wallet deployment and a real source proof remain operational steps;
  no keys are stored in this repository.
- On September 9, the proof service reported degraded with its Creditcoin RPC
  disconnected, then recovered during the final evidence capture. A September 10
  health recheck passed. No live proof success or end-to-end testnet completion
  is claimed.

## Deployment evidence

| Component | Network | Address/evidence |
|---|---|---|
| Source fixture | Sepolia, EVM 11155111 / protocol key 1 | Not recorded |
| Advance registry | Creditcoin Testnet, EVM 102031 | Not recorded |
| Reference lenders A/B | Creditcoin Testnet | Not recorded |
| Native verifier | Creditcoin Testnet | `0x0000000000000000000000000000000000000FD2` (protocol precompile, not an Advance deployment) |
| Accepted live source proof | Sepolia → Creditcoin | Not recorded |

[Deployment record](deployments/testnet.json) is the source of truth; null means
missing, never a zero-address deployment. Network explorers:
[Creditcoin Testnet](https://creditcoin-testnet.blockscout.com/) and
[Sepolia](https://sepolia.etherscan.io/). Specific contract/transaction links
will be added only after real deployments and receipt checks.

## License

MIT
