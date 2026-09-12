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

export const testnetConfig: ConfigInput = {
  registry: '0x3b52607c3718874f45eF249fB1A92D43f8B3D613',
  sourceRegistry: '0x3b52607c3718874f45eF249fB1A92D43f8B3D613',
  lenderA: '0xA760E5f08c62159B6096b0a561D6328439f120E7',
  lenderB: '0x2304C8cd29e4a9c34539B0E7eE309a39A3658EaC',
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
