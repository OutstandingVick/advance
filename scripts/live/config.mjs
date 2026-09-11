import { getAddress } from "ethers";

export const NETWORKS = Object.freeze({
  source: { chainId: 11155111, rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com" },
  destination: { chainId: 102031, rpcUrl: "https://rpc.cc3-testnet.creditcoin.network" },
});

export function liveConfig(env = process.env) {
  return {
    deployer: getAddress(required(env, "DEPLOYER_ADDRESS")),
    account: env.FOUNDRY_ACCOUNT || "advance-testnet-v2",
    sourceRpc: env.SOURCE_CHAIN_RPC_URL || NETWORKS.source.rpcUrl,
    destinationRpc: env.CREDITCOIN_RPC_URL || NETWORKS.destination.rpcUrl,
  };
}

function required(env, key) {
  const value = env[key]?.trim();
  if (!value) throw new Error(`Missing ${key}`);
  return value;
}
