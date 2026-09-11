import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Interface } from 'ethers';
import { deploymentTransaction, sourcePayment, verifiedTransactions } from './receipts.mjs';
const a=`0x${'11'.repeat(20)}`,b=`0x${'22'.repeat(20)}`,hash=`0x${'ab'.repeat(32)}`;
test('rejects missing or ambiguous deployments',()=>{
  assert.throws(()=>deploymentTransaction([],'AdvanceRegistry'));
  assert.throws(()=>deploymentTransaction([{name:'A',contractAddress:a},{name:'A',contractAddress:b}],'A'));
});
test('refuses unsigned journals rather than deploying again',async()=>{
  await assert.rejects(()=>verifiedTransactions({}, {transactions:[{hash:null}]},a),/unsigned or pending/);
});
test('does not trust successful receipts embedded in a local journal',async()=>{
  const provider={getTransactionReceipt:async()=>({status:0})};
  await assert.rejects(()=>verifiedTransactions(provider,{transactions:[{hash}],receipts:[{status:1}]},a),/not confirmed/);
});
test('rejects canonical receipt from another signer',async()=>{
  const provider={getTransactionReceipt:async()=>({status:1}),getTransaction:async()=>({from:b})};
  await assert.rejects(()=>verifiedTransactions(provider,{transactions:[{hash}]},a),/sender mismatch/);
});
test('selects only the intended payment wallet',()=>{
  const iface=new Interface(['event CreditEvent(address indexed wallet,bytes32 indexed facilityId,uint8 eventType,uint256 amount,uint64 occurredAt)']);
  const log=iface.encodeEventLog(iface.getEvent('CreditEvent'),[a,hash,1,100,1]);
  const tx={hash,logs:[{address:b,...log}]};
  assert.equal(sourcePayment([tx],b,a,iface).hash,hash);
  assert.throws(()=>sourcePayment([tx],b,b,iface),/wrong-wallet/);
  assert.throws(()=>sourcePayment([tx,tx],b,a,iface),/exactly one/);
});
