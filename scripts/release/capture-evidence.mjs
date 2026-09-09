import { spawnSync, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { findings } from './scan-secrets.mjs';

const directory='docs/evidence/day3';
mkdirSync(directory,{recursive:true});
const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>!/(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|MNEMONIC)/i.test(key)));
env.NO_COLOR='1';env.FORGE_COLOR='never';
const redact=text=>text.replace(/\x1b\[[0-9;?]*[A-Za-z]/g,'').replaceAll(process.cwd(),'<repo>').replace(/\/(Users|home)\/[^/\s]+\//g,'<user-dir>/');
const steps=[
  ['contracts-sdk-rehearsal-release','npm',['run','check'],true],
  ['app-typecheck-build','npm',['run','check:app'],true],
  ['tracked-secret-scan','node',['scripts/release/scan-secrets.mjs'],true],
  ['history-secret-scan','node',['scripts/release/scan-secrets.mjs','--history'],true],
  ['deployment-record','node',['scripts/release/deployment-record.mjs'],true],
  ['deployment-completeness','node',['scripts/release/deployment-record.mjs','--require-complete'],false],
  ['app-lint','npm',['--prefix','app','run','lint'],false],
];
if(process.argv.includes('--online'))steps.push(
  ['testnet-preflight','node',['--import','tsx','scripts/preflight.ts'],false],
  ['root-production-audit','npm',['audit','--omit=dev','--json'],false],
  ['app-production-audit','npm',['--prefix','app','audit','--omit=dev','--json'],false],
  ['app-development-audit','npm',['--prefix','app','audit','--json'],false],
);
const report={capturedAt:new Date().toISOString(),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  sourceTree:execFileSync('git',['rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim(),
  nodeVersion:process.version,platform:process.platform,
  note:'Local evidence only. Non-gating operational checks may be blocked; this does not assert live release readiness.',results:[]};
for(const [name,command,args,required] of steps){
  const result=spawnSync(command,args,{env,encoding:'utf8',timeout:180_000,maxBuffer:32*1024*1024});
  const output=redact(`${result.stdout??''}${result.stderr??''}${result.error?`\n${result.error.message}`:''}`);
  const unsafe=findings(`${name}.log`,output);
  const log=`${directory}/${name}.log`;
  // Fail closed instead of persisting a suspected credential into the evidence tree.
  if(unsafe.length)throw new Error(`Refused unsafe output for ${name}: ${unsafe.join(', ')}`);
  writeFileSync(log,output);
  report.results.push({name,command:[command,...args].join(' '),exitCode:result.status,signal:result.signal,required,log});
  console.log(`${name}: ${result.status===0?'PASS':'FAILED/BLOCKED'}${required?' (local gate)':''}`);
}
report.localGatesPassed=report.results.filter(r=>r.required).every(r=>r.exitCode===0);
writeFileSync(`${directory}/summary.json`,JSON.stringify(report,null,2)+'\n');
if(!report.localGatesPassed)process.exitCode=1;
