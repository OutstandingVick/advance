import 'dotenv/config';

import { proofProvider } from '@gluwa/usc-sdk';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';

const ADVANCE_ABI = [
  'function submitAttestedEvent(uint8 action,uint64 chainKey,uint64 blockHeight,bytes encodedTransaction,bytes32 merkleRoot,(bytes32 hash,bool isLeft)[] siblings,bytes32 lowerEndpointDigest,bytes32[] continuityRoots) returns (bytes32 evidenceId)',
] as const;

async function main(): Promise<void> {
  const creditcoinProvider = new JsonRpcProvider(required('CREDITCOIN_RPC_URL'));
  const sourceProvider = new JsonRpcProvider(required('SOURCE_CHAIN_RPC_URL'));
  const signer = new Wallet(required('CREDITCOIN_PRIVATE_KEY'), creditcoinProvider);
  const chainKey = Number(required('SOURCE_CHAIN_KEY'));
  const transactionHash = required('SOURCE_CHAIN_TX_HASH');
  const action = Number(process.env.CREDIT_EVENT_ACTION ?? '1');

  const receipt = await sourceProvider.waitForTransaction(transactionHash, 1, 120_000);
  if (!receipt) throw new Error(`Source transaction was not mined: ${transactionHash}`);

  const proofBuilder = new proofProvider.service.ProofBuilder(
    chainKey,
    required('CREDITCOIN_PROOF_BUILDER_URL'),
  );
  console.log(`Waiting for source block ${receipt.blockNumber} to be attested...`);
  await proofBuilder.waitUntilHeightAttested(chainKey, receipt.blockNumber, 15_000, 1_200_000);

  const result = await proofBuilder.getProof(transactionHash);
  if (!result.success || !result.data) {
    throw new Error(`Proof generation failed: ${result.error ?? 'unknown error'}`);
  }

  const proof = result.data;
  const advance = new Contract(required('ADVANCE_REGISTRY_ADDRESS'), ADVANCE_ABI, signer);
  const transaction = await advance.submitAttestedEvent(
    action,
    proof.chainKey,
    proof.headerNumber,
    proof.txBytes,
    proof.merkleProof.root,
    proof.merkleProof.siblings,
    proof.continuityProof.lowerEndpointDigest,
    proof.continuityProof.roots,
  );
  console.log(`Submitted Attestcoin proof: ${transaction.hash}`);
  const destinationReceipt = await transaction.wait();
  console.log(`Confirmed in Creditcoin block ${destinationReceipt?.blockNumber}`);
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

