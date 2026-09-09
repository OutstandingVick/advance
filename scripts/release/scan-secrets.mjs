import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Deliberately report rule names only: never echo a suspected credential.
export function findings(path, text) {
  const result=[];
  if (/(^|\/)\.env($|\.)/.test(path) && !/\.env\.(example|sample)$/.test(path)) result.push('environment-file');
  if (/\.(p12|pfx|key|pem)$/.test(path)) result.push('credential-file');
  const patterns={
    'private-key-block':/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    'github-token':/\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/,
    'aws-access-key':/\bAKIA[A-Z0-9]{16}\b/,
    'assigned-wallet-key':/\b(?:[A-Z_]*PRIVATE_KEY|privateKey)\s*[:=]\s*["']?(?:0x)?[a-fA-F0-9]{64}\b/,
    'credential-url':/https?:\/\/[^\s/@:]+:[^\s/@]+@/,
    'local-home-path':/\/(?:Users|home)\/[A-Za-z0-9_.-]+\//,
  };
  for(const [name,pattern] of Object.entries(patterns))if(pattern.test(text))result.push(name);
  return result;
}

export function scan(history=false) {
  const git=(...args)=>execFileSync('git',args,{maxBuffer:64*1024*1024});
  const reports=[];let inspected=0;
  if(history){
    const commits=git('rev-list','--all').toString().trim().split('\n').filter(Boolean);
    const seen=new Set();
    for(const commit of commits){
      for(const entry of git('ls-tree','-rz',commit).toString().split('\0').filter(Boolean)){
        const match=/^\d+ blob ([0-9a-f]+)\t([\s\S]+)$/.exec(entry);if(!match)continue;
        const [,blob,path]=match,key=`${blob}:${path}`;if(seen.has(key))continue;seen.add(key);
        const data=git('cat-file','blob',blob);inspected++;
        const rules=findings(path,data.includes(0)?'':data.toString());
        if(rules.length)reports.push({path,blob,rules});
      }
    }
  }else{
    for(const path of git('ls-files','-z').toString().split('\0').filter(Boolean)){
      // gitlinks are directories, not tracked file content.
      let data;try{data=readFileSync(path);}catch(error){if(error.code==='EISDIR')continue;throw error;}
      inspected++;const rules=findings(path,data.includes(0)?'':data.toString());
      if(rules.length)reports.push({path,rules});
    }
  }
  return {mode:history?'reachable-history':'tracked-worktree',inspected,findings:reports,
    limitations:'Pattern scan only; excludes ignored files, binary metadata, unreachable Git objects, and remote-only history.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const result=scan(process.argv.includes('--history'));
  console.log(JSON.stringify(result,null,2));if(result.findings.length)process.exitCode=1;
}
