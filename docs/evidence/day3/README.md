# Day 3 security review evidence

Captured September 9, 2026 against source commit
`6b0b19f22ab68340b816bddbfd08dbb33e2a534a`. The following commit only adds
these evidence files and updates documentation/release status; runtime source
is unchanged. See [summary.json](summary.json) for exact commands, exit codes,
source tree, timestamp and local runtime (Node 25.8.1; CI targets Node 22).

| Check | Observed result |
|---|---|
| Contracts | 43 passed, including 3 fuzz properties × 256 runs |
| SDK | 10 passed |
| Rehearsal state | 5 passed |
| Release tooling | 11 passed |
| App typecheck and production build | Passed |
| Tracked-content and reachable-history pattern scans | No findings at checked source |
| Deployment record shape | Valid but incomplete; strict completeness failed as expected |
| Testnet preflight | Healthy; native proof not attempted |
| Root and app production dependency audits | Zero reported advisories at capture time |
| Full app dependency audit | Four high entries through development image tooling |
| App lint | Failed; recorded without presenting it as a passing gate |

69 named tests passed. Fuzz runs are not counted as extra named tests. The
contract tests use a native verifier double and are not real Attestcoin proof
evidence. Screenshot evidence is separately labeled [rehearsal](../../SCREENSHOTS.md).

Local machine paths were redacted by the capture script. Scans are heuristic;
they do not cover binary metadata, ignored files or unreachable Git objects.
Review changes before rerunning or publishing evidence. A final tracked-content
scan includes these newly staged logs before the evidence commit is pushed.

The proof service was initially degraded but recovered during this run; a
September 10 read-only recheck also passed. Missing deployment receipts and
live consumer/wallet tests remain blockers. Healthy infrastructure does not
prove a successful application integration. See [freeze register](../../FEATURE-FREEZE.md).

Reproduce with `npm run release:evidence -- --online` from the repository root.
This overwrites generated evidence, not application source. Online observations
are time-specific and must be rechecked before the actual submission.
