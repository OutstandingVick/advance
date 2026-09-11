import { JsonRpcProvider, formatEther } from "ethers";
import { liveConfig, NETWORKS } from "./config.mjs";

async function inspect(label, rpcUrl, chainId, deployer) {
  const provider = new JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
  try {
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== chainId) throw new Error(`${label}: wrong chain`);
    const balance = await provider.getBalance(deployer);
    return { label, chainId, balance: formatEther(balance), funded: balance > 0n };
  } finally {
    provider.destroy();
  }
}

const config = liveConfig();
const results = await Promise.all([
  inspect("Sepolia", config.sourceRpc, NETWORKS.source.chainId, config.deployer),
  inspect("Creditcoin Testnet", config.destinationRpc, NETWORKS.destination.chainId, config.deployer),
]);
console.log(JSON.stringify({ deployer: config.deployer, networks: results }, null, 2));
if (results.some(({ funded }) => !funded)) process.exitCode = 1;
