import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { auditIntegration } from "./check-integration-docs.mjs";

test("the repository exposes a complete integration surface", () => {
  assert.deepEqual(auditIntegration(), []);
});

test("the audit reports missing vendor files", () => {
  const root = mkdtempSync(join(tmpdir(), "advance-integration-"));
  mkdirSync(join(root, "docs"));
  writeFileSync(join(root, "docs/INTEGRATING.md"), "");
  assert.ok(auditIntegration(root).some((error) => error.includes("IAdvance.sol")));
});
