'use client';
import { useEffect, useState } from 'react';
import type { BrowserProvider } from 'ethers';
import { AdvanceClient, validateDeployment, type Hex, type Profile, type Quote } from '../../sdk/src/index';
import { deploymentFrom, type ConfigInput } from '@/lib/config';
export interface Access {grantId?:Hex;sessionId?:Hex;valid:boolean;revoked?:boolean;quote?:Quote;expiresAt?:number}
export function useAdvance(provider:BrowserProvider|null,account:string,config:ConfigInput,onTx:(phase:string,hash?:string)=>void) {
  const [profile,setProfile]=useState<Profile|null>(null);
  const [score,setScore]=useState<number|null>(null);
  const [access,setAccess]=useState<[Access,Access]>([{valid:false},{valid:false}]);
  useEffect(()=>{setProfile(null);setScore(null);setAccess([{valid:false},{valid:false}]);},[account,provider,config.registry,config.sourceRegistry,config.lenderA,config.lenderB]);
  async function client() {
    if(!provider||!account)throw new Error('Connect your wallet first.');
    const deployment=deploymentFrom(config);
    await validateDeployment(provider,deployment);
    return {api:new AdvanceClient(deployment.registry,await provider.getSigner()),deployment};
  }
  async function refresh() {
    const {api}=await client();
    setProfile(await api.getProfile(account));setScore(Number(await api.computeScore(account)));
    const d=deploymentFrom(config);
    const updated=await Promise.all(access.map(async(a,i)=>({...a,valid:a.sessionId?await api.isScoreValid(a.sessionId,d.lenders[i]):false})));
    setAccess(updated as [Access,Access]);
  }
  async function act(type:'grant'|'score'|'revoke',index:0|1) {
    const {api,deployment}=await client();
    const current=access[index];let result:Access;
    if(type==='grant') {
      const block=await provider!.getBlock('latest');
      if(!block)throw new Error('Cannot read chain clock.');
      const {id}=await api.createGrant(deployment.lenders[index],BigInt(block.timestamp+86400),onTx);
      result={grantId:id,valid:false};
    }else{
      if(!current.grantId)throw new Error('Create a grant first.');
      if(type==='score'){
        const {id}=await api.requestScore(deployment.lenders[index],current.grantId,onTx);
        const session=await api.getScoreSession(id);
        result={...current,sessionId:id,valid:true,quote:await api.getQuote(deployment.lenders[index],id),expiresAt:Number(session.expiresAt)};
      }else{await api.revokeGrant(current.grantId,onTx);result={...current,valid:false,revoked:true};}
    }
    setAccess(previous=>{const next=[...previous] as [Access,Access];next[index]=result;return next;});
  }
  return {profile,score,access,refresh,act,client,setAccess};
}
