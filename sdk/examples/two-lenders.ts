import 'dotenv/config';
import { JsonRpcProvider, Wallet } from 'ethers';
import { AdvanceClient, address } from '../src/index';
async function main() {
  const provider = new JsonRpcProvider(process.env.CREDITCOIN_RPC_URL,102031,{staticNetwork:true});
  try {
    if (!process.env.CREDITCOIN_PRIVATE_KEY) throw new Error('Configure a funded testnet signer locally.');
    if (Number(await provider.send('eth_chainId',[])) !== 102031) throw new Error('Testnet required.');
    const signer = new Wallet(process.env.CREDITCOIN_PRIVATE_KEY,provider);
    const client = new AdvanceClient(address(process.env.ADVANCE_REGISTRY_ADDRESS ?? ''),signer);
    const expiry = BigInt(Math.floor(Date.now()/1000)+86400);
    const a = address(process.env.LENDER_A_ADDRESS ?? '');
    const b = address(process.env.LENDER_B_ADDRESS ?? '');
    const ga = await client.createGrant(a,expiry);
    const gb = await client.createGrant(b,expiry);
    const sa = await client.requestScore(a,ga.id);
    const sb = await client.requestScore(b,gb.id);
    console.log('A', await client.getQuote(a,sa.id));
    console.log('B', await client.getQuote(b,sb.id));
    await client.revokeGrant(ga.id);
    if (await client.isScoreValid(sa.id,a)) throw new Error('Revoked A session is still valid.');
    if (!await client.isScoreValid(sb.id,b)) throw new Error('B session unexpectedly invalid.');
    console.log('PASS: A revoked; B retains independently authorized access.');
  } finally {provider.destroy();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
