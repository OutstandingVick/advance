import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRehearsal, transition, validSession } from '../lib/rehearsal';
import { deploymentFrom, emptyConfig, explorer } from '../lib/config';

test('independent consumers and immediate revocation',()=>{
  let state=newRehearsal();
  for(const lender of [0,1] as const){state=transition(state,{type:'grant',lender},100);state=transition(state,{type:'score',lender},100);}
  assert.ok(validSession(state,0,101));assert.ok(validSession(state,1,101));
  state=transition(state,{type:'revoke',lender:0},102);
  assert.equal(validSession(state,0,102),false);assert.ok(validSession(state,1,102));
});
test('fresh evidence invalidates both snapshots and replay is rejected',()=>{
  let state=newRehearsal();
  for(const lender of [0,1] as const){state=transition(state,{type:'grant',lender},100);state=transition(state,{type:'score',lender},100);}
  const before=state;
  state=transition(state,{type:'evidence'},101);
  assert.equal(validSession(state,0,101),false);assert.equal(validSession(state,1,101),false);
  assert.equal(before.hasEvidence,false);
  assert.throws(()=>transition(state,{type:'evidence'},102),/Replay rejected/);
});
test('expiry is invalid at the exact boundary',()=>{
  let s=transition(newRehearsal(),{type:'grant',lender:0},100);
  s=transition(s,{type:'score',lender:0},100);
  assert.ok(validSession(s,0,3699));assert.equal(validSession(s,0,3700),false);
  assert.throws(()=>transition(s,{type:'score',lender:0},3700),/active grant/);
});
test('missing and duplicate deployments cannot enable live actions',()=>{
  assert.throws(()=>deploymentFrom(emptyConfig));
  const a='0x1111111111111111111111111111111111111111';
  assert.throws(()=>deploymentFrom({registry:a,sourceRegistry:a,lenderA:a,lenderB:a}),/different/);
});
test('explorer links reject injected URLs',()=>{
  assert.throws(()=>explorer('javascript:alert(1)'));
  assert.match(explorer(`0x${'ab'.repeat(32)}`),/^https:\/\/creditcoin-testnet.blockscout.com\/tx\/0x/);
});
