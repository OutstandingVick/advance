import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Interface, ZeroAddress } from 'ethers';
import { address, bytes32, parseProof, safeInteger } from '../src/validation';
import { registryAbi } from '../src/abi';
import { explainError } from '../src/errors';
const hash = '0x' + '12'.repeat(32);
const proof = { chainKey: 1, headerNumber: 10, txBytes: '0xab', merkleProof: { root: hash, siblings: [{hash, isLeft: true}] }, continuityProof: {lowerEndpointDigest: hash, roots: [hash]} };
test('reject zero addresses', () => assert.throws(() => address(ZeroAddress)));
test('reject truncated identifiers', () => assert.throws(() => bytes32('0x1234')));
test('reject imprecise block heights', () => assert.throws(() => safeInteger(Number.MAX_SAFE_INTEGER + 1, 'height')));
test('validate complete proof', () => assert.equal(parseProof(proof).headerNumber, 10));
test('reject missing continuity', () => assert.throws(() => parseProof({...proof, continuityProof: null})));
test('reject non-boolean proof direction', () => assert.throws(() => parseProof({...proof, merkleProof: {...proof.merkleProof, siblings: [{hash, isLeft: 'true'}]}})));
test('grant receipt exposes actual generated id', () => {
  const iface = new Interface(registryAbi);
  const encoded = iface.encodeEventLog(iface.getEvent('GrantCreated')!, [hash, '0x'+'11'.repeat(20), '0x'+'22'.repeat(20), 7, 1234]);
  assert.equal(iface.parseLog(encoded)?.args.grantId, hash);
});
test('wallet rejection gives actionable feedback', () => assert.match(explainError({code:4001}), /cancelled/));
test('reject coerced booleans arrays and whitespace as block heights',()=>{
  for(const value of [true,false,[],[1],' ','1.5','-1'])assert.throws(()=>safeInteger(value,'height'));
});
test('reject odd-length transaction hex',()=>assert.throws(()=>parseProof({...proof,txBytes:'0xabc'})));
