import 'dotenv/config';

import { chainInfo } from '@gluwa/usc-sdk';
import { JsonRpcProvider } from 'ethers';

async function main(): Promise<void> {
  const rpcUrl = required('CREDITCOIN_RPC_URL');
  const provider = new JsonRpcProvider(rpcUrl);
  const info = new chainInfo.PrecompileChainInfoProvider(provider);
  const chains = await info.getSupportedChains();

  console.table(
    chains.map((chain) => ({
      chainKey: chain.chainKey,
      chainId: chain.chainId,
      name: chain.chainName,
      encoding: chain.chainEncoding,
    })),
  );
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

