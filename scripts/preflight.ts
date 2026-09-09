import "dotenv/config";
import { JsonRpcProvider } from "ethers";
import { chainInfo } from "@gluwa/usc-sdk";
const rpc = process.env.CREDITCOIN_RPC_URL ?? "https://rpc.cc3-testnet.creditcoin.network";
const prover =
  process.env.CREDITCOIN_PROOF_BUILDER_URL ?? "https://prover.cc3-testnet.creditcoin.network";
async function main() {
  const provider = new JsonRpcProvider(rpc, 102031, { staticNetwork: true });
  try {
    const chain = await provider.send("eth_chainId", []);
    if (Number(chain) !== 102031) throw new Error("Incorrect destination chain.");
    const chains = await new chainInfo.PrecompileChainInfoProvider(provider).getSupportedChains();
    const response = await fetch(`${prover}/api/v1/health`, { signal: AbortSignal.timeout(15000) });
    const health = (await response.json()) as { status: string; cc3_rpc_connected: boolean };
    console.log(
      JSON.stringify(
        { chainId: Number(chain), supportedChains: chains, proofService: health },
        null,
        2,
      ),
    );
    if (!response.ok || health.status === "degraded" || health.cc3_rpc_connected === false) {
      throw new Error("Proof service is degraded. Live verification gate remains pending.");
    }
  } finally {
    provider.destroy();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
