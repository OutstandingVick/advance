'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserProvider, type Eip1193Provider } from 'ethers';
import { connectWallet } from '../../sdk/src/network';
type Injected = Eip1193Provider & {on?:(event:string,callback:()=>void)=>void;removeListener?:(event:string,callback:()=>void)=>void};
declare global {interface Window {ethereum?:Injected}}
export function useWallet() {
  const [provider,setProvider]=useState<BrowserProvider|null>(null);
  const [account,setAccount]=useState('');
  const generation=useRef(0);
  const disconnect=useCallback(()=>{generation.current++;setProvider(null);setAccount('');},[]);
  useEffect(()=>{
    const eth=window.ethereum;
    eth?.on?.('accountsChanged',disconnect);eth?.on?.('chainChanged',disconnect);
    return ()=>{eth?.removeListener?.('accountsChanged',disconnect);eth?.removeListener?.('chainChanged',disconnect);};
  },[disconnect]);
  const connect=async()=>{
    if(!window.ethereum)throw new Error('Install an Ethereum-compatible browser wallet to use testnet mode.');
    const connected=await connectWallet(window.ethereum);
    const account=await (await connected.getSigner()).getAddress();
    setProvider(connected);setAccount(account);
  };
  return {provider,account,connect,disconnect,generation};
}
