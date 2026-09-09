import { BrowserProvider, Contract, type Eip1193Provider, type Provider } from 'ethers';
import { registryAbi, lenderAbi } from './abi';
import { address } from './validation';
import type { Deployment } from './types';

export const creditcoin = {
  chainId: 102031, chainName: 'Creditcoin Testnet',
  nativeCurrency: { name: 'Test CTC', symbol: 'tCTC', decimals: 18 },
  rpcUrls: ['https://rpc.cc3-testnet.creditcoin.network'],
  blockExplorerUrls: ['https://creditcoin-testnet.blockscout.com'],
};
export async function connectWallet(ethereum: Eip1193Provider): Promise<BrowserProvider> {
  await ethereum.request({ method: 'eth_requestAccounts' });
  const target = `0x${creditcoin.chainId.toString(16)}`;
  try { await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: target }] }); }
  catch (error) {
    if ((error as {code?: number}).code !== 4902) throw error;
    await ethereum.request({ method: 'wallet_addEthereumChain', params: [{ ...creditcoin, chainId: target }] });
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: target }] });
  }
  const provider = new BrowserProvider(ethereum);
  if ((await provider.getNetwork()).chainId !== BigInt(creditcoin.chainId)) throw new Error('Switch to Creditcoin Testnet.');
  return provider;
}
export async function validateDeployment(provider: Provider, deployment: Deployment): Promise<void> {
  if ((await provider.getNetwork()).chainId !== BigInt(deployment.chainId)) throw new Error('Wrong deployment network.');
  for (const a of [deployment.registry, ...deployment.lenders]) {
    if ((await provider.getCode(address(a))) === '0x') throw new Error(`No contract deployed at ${a}.`);
  }
  const registry = new Contract(deployment.registry, registryAbi, provider);
  if (await registry.SOURCE_CHAIN_KEY() !== BigInt(deployment.sourceChainKey) ||
      address(await registry.SOURCE_CONTRACT()) !== address(deployment.sourceRegistry)) throw new Error('Source configuration mismatch.');
  for (const a of deployment.lenders) {
    const lender = new Contract(a, lenderAbi, provider);
    if (address(await lender.ADVANCE()) !== address(deployment.registry)) throw new Error('Lender registry mismatch.');
  }
}
