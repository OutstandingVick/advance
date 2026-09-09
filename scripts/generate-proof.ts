import 'dotenv/config';
import { proofProvider, blockProver } from '@gluwa/usc-sdk';
import { JsonRpcProvider } from 'ethers';
import { bytes32, safeInteger } from '../sdk/src/validation';
async function main() {
  const chainKey = safeInteger(process.env.SOURCE_CHAIN_KEY, 'SOURCE_CHAIN_KEY');
  const hash = bytes32(process.env.SOURCE_CHAIN_TX_HASH ?? '');
  const proofUrl = process.env.CREDITCOIN_PROOF_BUILDER_URL ?? 'https://prover.cc3-testnet.creditcoin.network';
  const provider = new JsonRpcProvider(process.env.CREDITCOIN_RPC_URL ?? 'https://rpc.cc3-testnet.creditcoin.network', 102031, {staticNetwork:true});
  try {
    const result = await new proofProvider.service.ProofBuilder(chainKey, proofUrl).getProof(hash);
    if (!result.success || !result.data) throw new Error(result.error ?? 'Proof unavailable.');
    const p = result.data;
    const valid = await new blockProver.PrecompileBlockProver(provider).verifySingle(p.chainKey,p.headerNumber,p.txBytes,p.merkleProof,p.continuityProof);
    if (!valid) throw new Error('Native verifier rejected the proof.');
    // stdout contains only the public proof bundle; redirect to a file for the UI.
    console.log(JSON.stringify(p,null,2));
  } finally { provider.destroy(); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
