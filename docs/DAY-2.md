# Day 2 execution

Baseline: `e127651`, 20 Day 1 commits. Day 2 adds 30 commits.

Deliverables: typed ethers SDK, runnable two-consumer example, source/proof
tooling, guided wallet UI, reproducible verification and release instructions.

Live deployment is an explicit gate: RPC discovery is not a verified proof.
No funded signer or deployed addresses were supplied at the start of Day 2.
Record real transactions before claiming the testnet gate has passed.

Contract changes required by integration must ship with regression tests.
The UI must distinguish rehearsal data from public testnet data and require
network and deployment checks before enabling wallet transactions.

## Delivered on September 9, 2026

- Typed ethers reader/writer SDK, receipt event IDs, wallet chain switching,
  deployment binding checks, proof validation and explanatory errors.
- Two-lender transaction example, read-only dependency preflight and separate
  proof generation/submission commands.
- Guided rehearsal and live-wallet application, independent grants, quotes,
  revocation, exact expiry, evidence replay and version invalidation.
- Contract expiry fix and five additional Foundry regression tests.
- CI covers contracts, SDK, demo state, app type checking and production build.

## Verification

- `npm run check`: 25 Foundry + 10 SDK + 5 rehearsal tests pass.
- `npm run check:app`: TypeScript and production build pass.
- HTTP preview responds 200. No browser automation or live wallet end-to-end
  test was performed; state tests are not browser tests.
- App production dependency audit: zero known advisories at this checkpoint.
  Full dependency audit retains four high entries from the same transitive
  Sharp image-decoder advisory in Cloudflare development tooling. No image
  upload/processing feature is exposed by this demo. Do not process untrusted
  images with the affected local tooling; recheck upstream before production.
- Scaffold-wide app lint is not clean: generated shadcn accessibility findings,
  React compiler checks, and test promise-style findings remain. Lint is not
  included in the passing CI gate. The build/type/test results above do not
  imply a clean lint result or a security audit.

## Day 3 operational gate (still open)

No funded signer or deployment addresses were supplied. On September 9 the
Creditcoin RPC answered chain ID 102031, but proof-service health was degraded
with `cc3_rpc_connected: false`. Run preflight again before deployment.

Gate C is **not passed** until a real source repayment proof is accepted on
Creditcoin and two independent live consumers return terms, followed by
revocation and replay rejection. Record real hashes; do not substitute the
rehearsal. Day 3 also needs browser/wallet acceptance testing, public demo
audience approval, final video and hackathon submission materials.

The Sites preview is owner-private by default. Source is a monorepo: `app/`
uses `sdk/`; publish the full related repository source and package the app's
Worker output, not the source tree. No wallet secrets belong in Sites.
