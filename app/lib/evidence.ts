export type VerifiedEvidence = {
  sourceChain: string;
  sourceTransactionHash: `0x${string}`;
  sourceBlock: number;
  verifiedAt: string;
  destinationTransactionHash: `0x${string}`;
  destinationBlock: number;
};

export const verifiedEvidence: VerifiedEvidence = {
  sourceChain: 'Ethereum Sepolia',
  sourceTransactionHash:
    '0xc459eaa208582a5768f0a46487053cc0398aafec1057d7c39aa28175b7ad1fb0',
  sourceBlock: 11681232,
  verifiedAt: '2026-09-11T10:42:15Z',
  destinationTransactionHash:
    '0x65630e2ae419d95a136def9755e6a40067b19d983e37f523b9894eb0b633067a',
  destinationBlock: 5468830,
};

export const shortHash = (hash: string) =>
  `${hash.slice(0, 10)}…${hash.slice(-8)}`;
