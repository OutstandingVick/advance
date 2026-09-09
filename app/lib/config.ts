import { address } from '../../sdk/src/validation';
import type { Deployment } from '../../sdk/src/types';
export interface ConfigInput {
  registry: string;
  sourceRegistry: string;
  lenderA: string;
  lenderB: string;
}
export const emptyConfig: ConfigInput = {
  registry: '',
  sourceRegistry: '',
  lenderA: '',
  lenderB: '',
};
export function deploymentFrom(input: ConfigInput): Deployment {
  const lenders = [address(input.lenderA), address(input.lenderB)] as const;
  if (lenders[0] === lenders[1])
    throw new Error('Use two different lender contracts.');
  return {
    chainId: 102031,
    sourceChainKey: 1,
    registry: address(input.registry),
    sourceRegistry: address(input.sourceRegistry),
    lenders,
  };
}
export function explorer(hash: string): string {
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash))
    throw new Error('Invalid transaction hash.');
  return `https://creditcoin-testnet.blockscout.com/tx/${hash}`;
}
