export type Address = `0x${string}`;
export type Hex = `0x${string}`;
export interface Deployment {
  chainId: number;
  registry: Address;
  sourceRegistry: Address;
  sourceChainKey: number;
  lenders: readonly [Address, Address];
}
export interface Profile {
  loansOpened: bigint; paymentsRecorded: bigint; defaultsRecorded: bigint;
  lastActivityAt: bigint; version: bigint;
  totalBorrowed: bigint; totalRepaid: bigint; totalDefaulted: bigint;
}
export interface Grant {
  wallet: Address; consumer: Address; sourceChainKey: bigint;
  sourceContract: Address; eventMask: bigint; expiresAt: bigint; revoked: boolean;
}
export interface ScoreSession {
  grantId: Hex; wallet: Address; consumer: Address; score: bigint;
  profileVersion: bigint; issuedAt: bigint; expiresAt: bigint;
}
export interface Quote { annualRateBps: bigint; collateralBps: bigint; maxPrincipal: bigint }
export interface ProofBundle {
  chainKey: number; headerNumber: number; txBytes: Hex;
  merkleProof: { root: Hex; siblings: { hash: Hex; isLeft: boolean }[] };
  continuityProof: { lowerEndpointDigest: Hex; roots: Hex[] };
}
export type TransactionPhase = 'awaiting-wallet' | 'submitted' | 'confirmed';
export type OnTransaction = (phase: TransactionPhase, hash?: string) => void;
