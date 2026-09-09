import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findings } from './scan-secrets.mjs';

test('flags real-looking assigned wallet keys without returning the key',()=>{
  const value='ab'.repeat(32),result=findings('config.ts',`privateKey = "0x${value}"`);
  assert.deepEqual(result,['assigned-wallet-key']);assert.ok(!JSON.stringify(result).includes(value));
});
test('allows blank environment examples but rejects environment secrets files',()=>{
  assert.deepEqual(findings('.env.example','CREDITCOIN_PRIVATE_KEY='),[]);
  assert.deepEqual(findings('app/.env.local',''),['environment-file']);
});
test('transaction hashes are not treated as wallet keys',()=>{
  assert.deepEqual(findings('receipt.json',JSON.stringify({transactionHash:`0x${'12'.repeat(32)}`})),[]);
});
test('flags credential URLs and key blocks',()=>{
  assert.ok(findings('config','https:'+'//user:password@example.org').includes('credential-url'));
  assert.ok(findings('config','-----BEGIN '+'PRIVATE KEY-----').includes('private-key-block'));
});
test('flags personal filesystem paths',()=>{
  assert.ok(findings('log','/'+'Users'+'/example/project/').includes('local-home-path'));
});
