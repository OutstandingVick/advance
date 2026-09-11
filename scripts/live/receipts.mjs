import { getAddress, isHexString } from 'ethers';

export function deploymentTransaction(transactions, name) {
  const matches=transactions.filter(t=>t.name===name&&t.contractAddress);
  if(matches.length!==1)throw new Error(`Expected exactly one confirmed ${name} deployment.`);
  return matches[0];
}
export async function verifiedTransactions(provider, bundle, sender) {
  if(!Array.isArray(bundle.transactions)||!bundle.transactions.length)throw new Error('No broadcast transactions found.');
  const result=[];
  for(const entry of bundle.transactions){
    if(!isHexString(entry.hash,32))throw new Error('A transaction is unsigned or pending. Do not redeploy; inspect the broadcast journal.');
    const receipt=await provider.getTransactionReceipt(entry.hash);
    if(!receipt||receipt.status!==1)throw new Error(`Transaction not confirmed successfully: ${entry.hash}`);
    const transaction=await provider.getTransaction(entry.hash);
    if(!transaction||getAddress(transaction.from)!==getAddress(sender))throw new Error('Broadcast sender mismatch.');
    const block=await provider.getBlock(receipt.blockNumber);
    if(!block||block.hash!==receipt.blockHash)throw new Error('Receipt block is no longer canonical.');
    if(receipt.contractAddress&&(await provider.getCode(receipt.contractAddress))==='0x')throw new Error('Deployed contract has no code.');
    result.push({name:entry.contractName,contractAddress:receipt.contractAddress,
      hash:receipt.hash,block:receipt.blockNumber,logs:receipt.logs,to:transaction.to});
  }
  return result;
}

export function sourcePayment(transactions, source, wallet, iface) {
  const matches=[];
  for(const tx of transactions){
    const decoded=tx.logs.filter(l=>getAddress(l.address)===getAddress(source)).map(l=>iface.parseLog(l)).filter(Boolean);
    const payments=decoded.filter(e=>e.name==='CreditEvent'&&e.args.eventType===1n);
    if(payments.length){
      if(decoded.length!==1||payments.length!==1||getAddress(payments[0].args.wallet)!==getAddress(wallet))throw new Error('Ambiguous or wrong-wallet payment receipt.');
      matches.push(tx);
    }
  }
  if(matches.length!==1)throw new Error('Expected exactly one confirmed payment transaction.');
  return matches[0];
}
