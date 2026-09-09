import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const address=/^0x[0-9a-fA-F]{40}$/,hash=/^0x[0-9a-fA-F]{64}$/;
export function inspectDeployment(record) {
  const blockers=[],errors=[];
  const requireValue=(value,name,pattern)=>{
    if(value==null||value===''){blockers.push(`${name}: missing`);return;}
    if(typeof value!=='string'||!pattern.test(value)||/^0x0+$/.test(value))errors.push(`${name}: invalid`);
  };
  if(record?.destination?.chainId!==102031)errors.push('destination.chainId: expected 102031');
  for(const [name,value,expected] of [
    ['source.chainId',record?.source?.chainId,11155111],
    ['source.chainKey',record?.source?.chainKey,1],
  ]){
    if(value==null)blockers.push(`${name}: missing`);else if(value!==expected)errors.push(`${name}: unexpected network`);
  }
  requireValue(record?.source?.registryAddress,'source.registryAddress',address);
  requireValue(record?.source?.deploymentTx,'source.deploymentTx',hash);
  for(const name of ['registryAddress','lenderAAddress','lenderBAddress'])requireValue(record?.advance?.[name],`advance.${name}`,address);
  requireValue(record?.advance?.deploymentTx,'advance.deploymentTx',hash);
  const a=record?.advance?.lenderAAddress,b=record?.advance?.lenderBAddress;
  if(a&&b&&String(a).toLowerCase()===String(b).toLowerCase())errors.push('lenders: must be distinct');
  if(!Array.isArray(record?.proofEvidence))errors.push('proofEvidence: expected array');
  else if(!record.proofEvidence.length)blockers.push('proofEvidence: no live proof recorded');
  else for(const [i,proof] of record.proofEvidence.entries()){
    for(const name of ['sourceTransactionHash','destinationTransactionHash','evidenceId'])requireValue(proof?.[name],`proofEvidence[${i}].${name}`,hash);
    if(proof?.receiptStatus!==1)errors.push(`proofEvidence[${i}].receiptStatus: expected success`);
    if(!Number.isSafeInteger(proof?.destinationBlock)||proof.destinationBlock<1)errors.push(`proofEvidence[${i}].destinationBlock: invalid`);
  }
  return {status:errors.length?'invalid':blockers.length?'incomplete':'record-complete-unverified',errors,blockers,
    limitation:'Schema checks do not verify deployments, receipts, native proofs or two-consumer behavior on chain.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const result=inspectDeployment(JSON.parse(readFileSync('deployments/testnet.json','utf8')));
  console.log(JSON.stringify(result,null,2));
  if(result.errors.length||(process.argv.includes('--require-complete')&&result.blockers.length))process.exitCode=1;
}
