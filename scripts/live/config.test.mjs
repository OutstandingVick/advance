import assert from "node:assert/strict";
import test from "node:test";
import { liveConfig, NETWORKS } from "./config.mjs";

const DEPLOYER = "0xb29E6cbdEB955AdC2246Aac7b703276ec045560F";

test("uses fixed testnet defaults", () => {
  assert.deepEqual(liveConfig({ DEPLOYER_ADDRESS: DEPLOYER }), {
    deployer: DEPLOYER,
    account: "advance-testnet-v2",
    sourceRpc: NETWORKS.source.rpcUrl,
    destinationRpc: NETWORKS.destination.rpcUrl,
  });
});

test("accepts explicit account and RPC overrides", () => {
  const config = liveConfig({
    DEPLOYER_ADDRESS: DEPLOYER,
    FOUNDRY_ACCOUNT: "release-key",
    SOURCE_CHAIN_RPC_URL: "https://source.invalid",
    CREDITCOIN_RPC_URL: "https://destination.invalid",
  });
  assert.equal(config.account, "release-key");
  assert.equal(config.sourceRpc, "https://source.invalid");
  assert.equal(config.destinationRpc, "https://destination.invalid");
});

test("rejects a missing or malformed deployer", () => {
  assert.throws(() => liveConfig({}), /Missing DEPLOYER_ADDRESS/);
  assert.throws(() => liveConfig({ DEPLOYER_ADDRESS: "not-an-address" }));
});
