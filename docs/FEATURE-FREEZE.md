# Feature freeze — Day 3 part 2

Status: **feature scope frozen; release readiness blocked**.
Effective at the final Day 3 parts 1–2 evidence commit. The freeze does not
assert Gate A/C success, authorize broadcasting transactions, change demo
audience, or submit the project to DoraHacks.

## Allowed after freeze

- P0: build/deployment failure, unusable real verification/demo, exposed secret.
- P1: wrong authorization, replay bypass, stale/revoked session accepted,
  scoring denial of service, or broken required submission link/access.
- Evidence collection, regression tests, and accurate documentation needed to
  validate those fixes. No new product functionality.

P2 visual polish, optional metrics/events, new chains, pricing changes, AI,
privacy layers and redesigns are deferred. Deck/video/submission preparation
belongs to later Day 3 sections, outside this request.

## Blocking register

| ID | Priority | Current evidence | Closure requirement |
|---|---|---|---|
| LIVE-01 | P0 | No source/Advance/lender deployment addresses or accepted proof receipts recorded | Funded signer configured securely; real contracts and full native proof path verified; record hashes |
| ACCESS-01 | P1 | Hosted demo remains owner-private | Explicit audience approval and successful unauthenticated access check |
| WALLET-01 | P1 | Screenshots cover rehearsal only | Fresh-wallet public-testnet run through both lenders, independent revocation and replay rejection |

These are release blockers, not reasons to invent deployment metadata or
replace the deployed native verifier with a mock. Funding/approval belongs to
the project owner; external service health belongs to the provider. An agent
may prepare a reproduction but must not message organizers without permission.

LIVE-02 (service availability) recovered during the September 9 evidence run;
the September 10 read-only recheck also reported healthy with both RPC
connections true. The service-health blocker is closed as observed, not a
guarantee of future availability. Real proof verification remains LIVE-01.

## Known non-gating review debt

Scaffold-wide lint findings and a transitive Sharp advisory in development
tooling remain documented; neither is silently labeled passed. No untrusted
image processing or public dev server is part of the demo. Reclassify a finding
to P0/P1 if exposure is demonstrated. Production audit output is captured
separately. Pattern scans are not a substitute for independent security review.

## Exception procedure

1. Name a P0/P1 issue and give a minimal reproduction against the frozen SHA.
2. State why the fix is necessary, its affected contract/UI boundary, and risks.
3. Add a failing regression, implement the smallest fix, then run the full gates.
4. Capture fresh evidence and review the exact diff for unrelated feature work.
5. Commit the fix with its issue ID; update this register and deployment record.
6. For immutable contract changes, redeploy and prove the new addresses before
   replacing published links. Do not claim old deployments contain the fix.

Never rewrite the frozen history or mark releaseReady true just to meet a
deadline. Test failures stop publication of a new candidate. An unavailable
external gate remains blocked rather than being treated as a passing local test.
