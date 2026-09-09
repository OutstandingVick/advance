import { getAddress, isHexString, ZeroAddress } from 'ethers';
import type { Address, Hex, ProofBundle } from './types';

export function address(value: string): Address {
  const result = getAddress(value);
  if (result === ZeroAddress) throw new Error('A non-zero contract address is required.');
  return result as Address;
}
export function bytes32(value: string): Hex {
  if (!isHexString(value, 32)) throw new Error('Expected a 32-byte identifier.');
  return value as Hex;
}
export function safeInteger(value: unknown, name: string): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0 || !['number','string'].includes(typeof value) || (typeof value==='string'&&!/^\d+$/.test(value))) {
    throw new Error(`${name} must be a non-negative safe integer.`);
  }
  return number;
}
export function parseProof(value: unknown): ProofBundle {
  if (!value || typeof value !== 'object') throw new Error('Expected a proof object.');
  const p = value as ProofBundle;
  const chainKey = safeInteger(p.chainKey, 'chainKey');
  const headerNumber = safeInteger(p.headerNumber, 'headerNumber');
  if (!isHexString(p.txBytes) || p.txBytes.length < 4 || p.txBytes.length % 2 !== 0) throw new Error('Missing or malformed encoded transaction.');
  if (!p.merkleProof || !Array.isArray(p.merkleProof.siblings) || !p.continuityProof || !Array.isArray(p.continuityProof.roots)) {
    throw new Error('Incomplete inclusion or continuity proof.');
  }
  return { chainKey, headerNumber, txBytes: p.txBytes,
    merkleProof: { root: bytes32(p.merkleProof.root), siblings: p.merkleProof.siblings.map(s => {
      if (typeof s.isLeft !== 'boolean') throw new Error('Invalid Merkle direction.');
      return { hash: bytes32(s.hash), isLeft: s.isLeft };
    }) },
    continuityProof: { lowerEndpointDigest: bytes32(p.continuityProof.lowerEndpointDigest), roots: p.continuityProof.roots.map(bytes32) },
  };
}
