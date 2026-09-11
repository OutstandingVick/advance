import "dotenv/config";
import { proofProvider } from "@gluwa/usc-sdk";
import { JsonRpcProvider } from "ethers";
import { bytes32, parseProof } from "../sdk/src/index";

async function main() {
  const destination = new JsonRpcProvider(required("CREDITCOIN_RPC_URL"));
  const source = new JsonRpcProvider(required("SOURCE_CHAIN_RPC_URL"));
  try {
    if (Number(await destination.send("eth_chainId", [])) !== 102031)
      throw new Error("Expected Creditcoin Testnet.");
    const chainKey = Number(required("SOURCE_CHAIN_KEY"));
    const hash = bytes32(required("SOURCE_CHAIN_TX_HASH"));
    const action = Number(process.env.CREDIT_EVENT_ACTION ?? "1");
    if (!Number.isSafeInteger(chainKey) || chainKey < 0 || ![0, 1, 2].includes(action))
      throw new Error("Invalid chain key or event action.");
    const receipt = await source.waitForTransaction(hash, 1, 120_000);
    if (!receipt || receipt.status !== 1)
      throw new Error("Source transaction not confirmed successfully.");
    const builder = new proofProvider.service.ProofBuilder(
      chainKey,
      required("CREDITCOIN_PROOF_BUILDER_URL"),
    );
    console.log(`Waiting for attestation of source block ${receipt.blockNumber}`);
    await builder.waitUntilHeightAttested(chainKey, receipt.blockNumber, 15_000, 1_200_000);
    const result = await builder.getProof(hash);
    if (!result.success || !result.data)
      throw new Error(`Proof generation failed: ${result.error ?? "unknown error"}`);
    const proof = parseProof(result.data);
    if (proof.chainKey !== chainKey || proof.headerNumber !== receipt.blockNumber)
      throw new Error("Proof does not match requested source block.");
    console.log(JSON.stringify({ ...proof, action }, null, 2));
  } finally {
    destination.destroy();
    source.destroy();
  }
}
function required(key: string) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key}`);
  return value;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
