import React,{useCallback,useEffect,useState} from 'react';
import {ClipboardList,RefreshCw,Trash2} from 'lucide-react';
import {useApp} from '../context/AppContext';

type Enquiry={id:string;guardianName:string;contactPhone:string;email:string|null;grade:number;board:string;message:string|null;status:'new'|'contacted'|'closed';createdAt:string};
type Status='all'|'new'|'contacted'|'closed';
export const AdmissionsInbox:React.FC=()=>{
 const {authToken}=useApp();
 const [items,setItems]=useState<Enquiry[]>([]);
 const [filter,setFilter]=useState<Status>('new');
 const [loading,setLoading]=useState(false);
 const [busy,setBusy]=useState<string|null>(null);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const request=useCallback(async(path:string,options:RequestInit={})=>{
  if(!authToken)throw new Error('Please sign in as an authorised administrator.');
  const res=await fetch('/api/v1/admissions/admin'+path,{...options,
   headers:{'Content-Type':'application/json',Authorization:'Bearer '+authToken,...options.headers}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.message||data.code||'The admissions service is unavailable.');
  return data;
 },[authToken]);
 const load=useCallback(async()=>{
  setLoading(true);setError('');
  try{const data=await request('/enquiries?status='+filter+'&limit=50');setItems(data.enquiries||[]);}
  catch(e){setError(e instanceof Error?e.message:'Could not load enquiries.');}
  finally{setLoading(false);}
 },[filter,request]);
 useEffect(()=>{void load();},[load]);
 async function changeStatus(item:Enquiry,status:Enquiry['status']){
  setBusy(item.id);setError('');setNotice('');
  try{await request('/enquiries/'+encodeURIComponent(item.id),{
   method:'PATCH',body:JSON.stringify({status})
  });setNotice('Admissions enquiry updated.');await load();}
  catch(e){setError(e instanceof Error?e.message:'Could not update enquiry.');}
  finally{setBusy(null);}
 }
 async function remove(item:Enquiry){
  if(!window.confirm('Delete this guardian contact enquiry permanently? This action cannot be undone.'))return;
  setBusy(item.id);setError('');setNotice('');
  try{await request('/enquiries/'+encodeURIComponent(item.id),{method:'DELETE'});
   setNotice('Enquiry and contact details deleted.');await load();}
  catch(e){setError(e instanceof Error?e.message:'Deletion failed.');}
  finally{setBusy(null);}
 }
 return <section className="b" style={{display:'flex',flexDirection:'column',gap:16}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
   <div><h2 className="h2"><ClipboardList size={21} style={{verticalAlign:'middle',marginRight:8}}/>Admissions Enquiry Inbox</h2>
    <p className="t-muted">Private guardian enquiries submitted through the public website. Showing the latest 50 records.</p></div>
   <button type="button" className="ghost" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/> Refresh</button>
  </div>
  <div style={{display:'flex',gap:7,flexWrap:'wrap'}} role="group" aria-label="Filter admissions enquiries">
   {(['new','contacted','closed','all'] as const).map(status=><button key={status} type="button" className={filter===status?'btn btn-teal':'ghost'} onClick={()=>setFilter(status)}>{status==='all'?'All enquiries':status[0].toUpperCase()+status.slice(1)}</button>)}
  </div>
  {loading&&<p role="status">Loading private enquiries…</p>}
  {error&&<p role="alert" style={{color:'var(--color-error)'}}>{error}</p>}
  {notice&&<p role="status">{notice}</p>}
  {!loading&&!error&&items.length===0&&<p className="t-muted">No enquiries match the selected status.</p>}
  <div style={{display:'grid',gap:12}}>
   {items.map(item=><article key={item.id} className="b" style={{display:'flex',flexDirection:'column',gap:10,border:'1px solid var(--color-border-subtle)',background:'var(--color-paper-card)'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
     <strong>{item.guardianName}</strong><span className="chip chip-navy">Class {item.grade} · {item.board==='STATE'?'Karnataka State':item.board}</span>
    </div>
    <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:13}}>
     <span>Phone: <strong>{item.contactPhone}</strong></span>
     {item.email&&<span>Email: <strong>{item.email}</strong></span>}
     <span className="t-muted">Submitted: {item.createdAt}</span>
    </div>
    {item.message&&<p style={{fontSize:13,lineHeight:1.6,overflowWrap:'anywhere'}}>{item.message}</p>}
    <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
     <label htmlFor={'enquiry-status-'+item.id} style={{fontSize:13,fontWeight:700}}>Status</label>
     <select id={'enquiry-status-'+item.id} value={item.status} disabled={busy===item.id} onChange={e=>void changeStatus(item,e.target.value as Enquiry['status'])} style={{minHeight:40,borderRadius:8,padding:8}}>
      <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
     </select>
     <button type="button" className="ghost" disabled={busy===item.id} onClick={()=>void remove(item)} style={{marginLeft:'auto',color:'var(--color-error)'}}><Trash2 size={15}/> Delete private record</button>
    </div>
   </article>)}
  </div>
  <p className="t-tiny">Only administrators can read, update or delete this information. Review retention and privacy procedures before production launch.</p>
 </section>;
};