import { Button } from '@/components/ui/button';
export function LenderCard({index,name,granted,valid,busy,rate,expiry,onAction}:{index:number;name:string;granted:boolean;valid:boolean;busy:boolean;rate?:number;expiry?:number;onAction:(action:'grant'|'score'|'revoke')=>void}) {
 return <article className="lender-card"><div className="lender-heading"><span className="number">0{index+1}</span><h2>{name}</h2><span className={valid?'pill active':'pill'}>{valid?'Session active':granted?'Permission set':'Not shared'}</span></div>
 <div className="terms"><div><small>Illustrative annual rate</small><strong>{valid&&rate!==undefined?`${rate}%`:'—'}</strong></div><div><small>Access</small><strong>{valid?'Authorized':'Needs permission'}</strong></div></div>
 {valid&&expiry&&<p className="metadata">Session expires {new Date(expiry*1000).toLocaleTimeString()}</p>}
 <div className="actions"><Button disabled={busy} onClick={()=>onAction('grant')}>{granted?'Renew permission':'Grant permission'}</Button><Button disabled={busy||!granted} variant="outline" onClick={()=>onAction('score')}>Get terms</Button><Button disabled={busy||!granted} variant="ghost" onClick={()=>onAction('revoke')}>Revoke</Button></div></article>;
}
