import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const requiredPaths = [
  "docs/INTEGRATING.md",
  "contracts/src/interfaces/IAdvance.sol",
  "contracts/src/AdvanceTypes.sol",
  "contracts/src/examples/AdvanceScoreConsumer.sol",
  "sdk/package.json",
  "sdk/README.md",
];

export function auditIntegration(root = ".") {
  const errors = [];
  for (const path of requiredPaths)
    if (!existsSync(`${root}/${path}`)) errors.push(`Missing ${path}`);
  if (errors.length) return errors;

  const corpus = ["README.md", "docs/INTEGRATING.md", "sdk/README.md"]
    .map((path) => readFileSync(`${root}/${path}`, "utf8"))
    .join("\n")
    .toLowerCase();
  for (const pillar of ["permissions", "sessions", "revocation", "attack prevention"])
    if (!corpus.includes(pillar)) errors.push(`Missing pillar: ${pillar}`);
  if (/creditpass/i.test(corpus)) errors.push("Stale CreditPass name in public integration docs");

  const guide = readFileSync(`${root}/docs/INTEGRATING.md`, "utf8");
  for (const required of ["isScoreValid", "createGrant", "requestScore", "revokeGrant"])
    if (!guide.includes(required)) errors.push(`Guide omits ${required}`);
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = auditIntegration();
  console.log(JSON.stringify({ status: errors.length ? "failed" : "passed", errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
