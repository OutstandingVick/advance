'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
export default function Home() {
  const [started, setStarted] = useState(false);
  return <main className="workspace">
    <header className="topbar"><a className="wordmark" href="/">advance<span>↗</span></a><span>Creditcoin · Testnet</span></header>
    <section className="intro"><p className="eyebrow">YOUR CREDIT, CONNECTED</p><h1>One history.<br/>More possibilities.</h1><p>Carry verified repayment history between lenders. Decide who can use it, and for how long.</p></section>
    <div className="notice">Interactive rehearsal · Sample data, no blockchain transactions.</div>
    <div className="workspace-grid"><section className="panel profile"><p className="eyebrow">PORTABLE PROFILE</p><div className="score">{started ? '675' : '—'}<span>/ 900</span></div><h2>{started ? 'Repayment history added' : 'Start with your history'}</h2><p>Verify a payment, compare two lenders, then revoke access to one.</p><Button onClick={()=>setStarted(true)}>Start rehearsal ↗</Button></section>
    <section className="panel"><p className="eyebrow">YOUR LENDERS</p>{['Northstar Credit', 'Harbor Lending'].map((name,i)=><div className="lender" key={name}><span className="number">0{i+1}</span><div><h2>{name}</h2><p>{started ? 'Ready for your permission' : 'No history shared'}</p></div><span>↗</span></div>)}</section></div>
    <footer>Verified facts. Independent decisions.<a href="https://github.com/OutstandingVick/advance">Explore the protocol ↗</a></footer>
  </main>;
}
