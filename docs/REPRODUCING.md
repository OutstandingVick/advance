# Reproduce the reviewed candidate

Prerequisites: Git, Node.js 22.13+ (CI uses Node 22), npm, and Foundry with
Solidity 0.8.30 support. No wallet or secret is needed for the local checks.

```bash
git clone --recurse-submodules https://github.com/OutstandingVick/advance.git
cd advance
npm ci
npm ci --prefix app
npm run check
npm run check:app
npm run security:scan
npm run security:history
npm run deployment:check
```

`deployment:check` accepts an honestly incomplete record but reports every
missing field. `node scripts/release/deployment-record.mjs --require-complete`
must fail until real deployment evidence is recorded. Schema completeness is
not verification of blockchain transactions.

`npm run release:evidence` captures fixed local checks and metadata under
`docs/evidence/day3`. This writes generated evidence files; inspect the diff
before committing. `npm run release:evidence -- --online` additionally checks
the public RPC/proof-service and package registries. It does not sign or deploy.
The snapshot records the checked source commit, not a claim about later edits.

## App

```bash
npm --prefix app run dev
```

Open the displayed localhost URL and use Rehearsal. Follow [DEMO.md](DEMO.md).
The existing [hosted preview](https://advance-credit-demo.outstandingvick.chatgpt.site)
is private to its owner and is **not** a publicly usable submission demo yet.

## Live path

Follow [DEPLOYMENT.md](DEPLOYMENT.md) after obtaining testnet gas and securely
configuring a signer. Re-run preflight first. Keep secrets only in ignored
local configuration; never put them in browser deployment fields, screenshots,
Git history or captured logs. Read-only commands and rehearsal cannot prove the
live path. Record actual receipts before filling the null deployment fields.

Reference entry points: [architecture](ARCHITECTURE.md),
[native ABI](ATTESTCOIN-INTEGRATION.md), [security matrix](SECURITY.md),
[screenshots](SCREENSHOTS.md), [freeze policy](FEATURE-FREEZE.md).
