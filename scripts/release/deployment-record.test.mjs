import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectDeployment } from './deployment-record.mjs';
const addr=n=>`0x${n.repeat(40)}`,hash=`0x${'ab'.repeat(32)}`;
const empty=()=>({destination:{chainId:102031},source:{chainKey:null,chainId:null,registryAddress:null,deploymentTx:null},advance:{registryAddress:null,lenderAAddress:null,lenderBAddress:null,deploymentTx:null},proofEvidence:[]});
const complete=()=>({destination:{chainId:102031},source:{chainKey:1,chainId:11155111,registryAddress:addr('1'),deploymentTx:hash},advance:{registryAddress:addr('2'),lenderAAddress:addr('3'),lenderBAddress:addr('4'),deploymentTx:hash},proofEvidence:[{sourceTransactionHash:hash,destinationTransactionHash:hash,evidenceId:hash,receiptStatus:1,destinationBlock:10}]});
test('null deployment template is incomplete, never verified',()=>{
  const r=inspectDeployment(empty());
  assert.equal(r.status,'incomplete');assert.ok(r.blockers.length>0);assert.deepEqual(r.errors,[]);
});
test('complete record still requires independent on-chain verification',()=>assert.equal(inspectDeployment(complete()).status,'record-complete-unverified'));
test('rejects wrong destination chain',()=>{
  const r=complete();r.destination.chainId=1;assert.equal(inspectDeployment(r).status,'invalid');
});
test('rejects duplicated lenders and zero addresses',()=>{
  const r=complete();r.advance.lenderBAddress=r.advance.lenderAAddress;r.source.registryAddress=addr('0');
  assert.equal(inspectDeployment(r).errors.length,2);
});
test('rejects failed proof receipts',()=>{
  const r=complete();r.proofEvidence[0].receiptStatus=0;assert.equal(inspectDeployment(r).status,'invalid');
});
test('malformed proof entry is reported instead of crashing',()=>{
  const r=complete();r.proofEvidence=[null];assert.equal(inspectDeployment(r).status,'invalid');
});
