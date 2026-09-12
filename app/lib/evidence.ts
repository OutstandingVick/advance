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

export const formatBlockNumber = (block: number) =>
  new Intl.NumberFormat('en-US', { useGrouping: true }).format(block);

export const formatVerifiedAt = (timestamp: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(new Date(timestamp));
