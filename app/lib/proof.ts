import { isHexString } from 'ethers';

type Hex = `0x${string}`;

export type ProofBundle = {
  chainKey: number;
  headerNumber: number;
  txBytes: Hex;
  merkleProof: {
    root: Hex;
    siblings: Array<{ hash: Hex; isLeft: boolean }>;
  };
  continuityProof: {
    lowerEndpointDigest: Hex;
    roots: Hex[];
  };
};

function safeInteger(value: unknown, name: string): number {
  const number = Number(value);
  if (
    !Number.isSafeInteger(number) ||
    number < 0 ||
    !['number', 'string'].includes(typeof value) ||
    (typeof value === 'string' && !/^\d+$/.test(value))
  ) {
    throw new Error(`${name} must be a non-negative safe integer.`);
  }
  return number;
}

function bytes32(value: string): Hex {
  if (!isHexString(value, 32)) throw new Error('Expected a 32-byte identifier.');
  return value as Hex;
}

export function parseProof(value: unknown): ProofBundle {
  if (!value || typeof value !== 'object') throw new Error('Expected a proof object.');
  const proof = value as ProofBundle;
  if (!isHexString(proof.txBytes) || proof.txBytes.length < 4 || proof.txBytes.length % 2 !== 0) {
    throw new Error('Missing or malformed encoded transaction.');
  }
  if (!Array.isArray(proof.merkleProof?.siblings) || !Array.isArray(proof.continuityProof?.roots)) {
    throw new Error('Incomplete inclusion or continuity proof.');
  }
  return {
    chainKey: safeInteger(proof.chainKey, 'chainKey'),
    headerNumber: safeInteger(proof.headerNumber, 'headerNumber'),
    txBytes: proof.txBytes,
    merkleProof: {
      root: bytes32(proof.merkleProof.root),
      siblings: proof.merkleProof.siblings.map((sibling) => {
        if (typeof sibling.isLeft !== 'boolean') throw new Error('Invalid Merkle direction.');
        return { hash: bytes32(sibling.hash), isLeft: sibling.isLeft };
      }),
    },
    continuityProof: {
      lowerEndpointDigest: bytes32(proof.continuityProof.lowerEndpointDigest),
      roots: proof.continuityProof.roots.map(bytes32),
    },
  };
}

export function explainError(error: unknown): string {
  const value = error as {
    code?: string | number;
    shortMessage?: string;
    message?: string;
    reason?: string;
  };
  if (value?.code === 4001 || value?.code === 'ACTION_REJECTED') {
    return 'Wallet request cancelled. Nothing was submitted.';
  }
  if (value?.code === 'INSUFFICIENT_FUNDS') return 'Add test CTC to this wallet before submitting.';
  if (value?.code === 'NETWORK_ERROR') return 'The network changed or could not be reached. Reconnect your wallet.';
  if (value?.code === 'TIMEOUT') return 'Confirmation timed out. Check the transaction before retrying.';
  return value?.reason ?? value?.shortMessage ?? value?.message ?? 'The request failed. Please retry after checking your connection.';
}
