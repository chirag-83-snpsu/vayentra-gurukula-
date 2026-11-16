import React,{useCallback,useEffect,useState} from 'react';
import {CheckCircle2,ClipboardCheck,RefreshCw,ShieldCheck,XCircle} from 'lucide-react';
import {useApp} from '../context/AppContext';
import '../styles/one-enrolment.css';
type App={id:string;childName:string;grade:number;board:string;academicYear:string;status:'submitted'|'approved'|'rejected';learnerNumber?:string|null;guardianName:string;guardianEmail:string;createdAt:string};
type Verification='verified_in_person'|'verified_parent_records'|'verified_digilocker';
export const OneAdmissionReview:React.FC=()=>{
 const {authToken}=useApp();
 const [list,setList]=useState<App[]>([]);
 const [filter,setFilter]=useState<'submitted'|'approved'|'rejected'|'all'>('submitted');
 const [selected,setSelected]=useState('');
 const [method,setMethod]=useState<Verification>('verified_in_person');
 const [evidence,setEvidence]=useState('');
 const [rejectReason,setRejectReason]=useState('');
 const [confirmed,setConfirmed]=useState(false);
 const [loading,setLoading]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const request=useCallback(async(path:string,options:RequestInit={})=>{
  if(!authToken)throw new Error('Administrator sign-in is required.');
  const response=await fetch('/api/v1/one-onboarding'+path,{...options,headers:{'Content-Type':'application/json',Authorization:'Bearer '+authToken,...options.headers}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.message||body.code||'Could not complete review.');
  return body;
 },[authToken]);
 const load=useCallback(async()=>{
  setLoading(true);setError('');
  try{const data=await request('/admin/applications?status='+filter);setList(data.applications||[]);}
  catch(e){setError(e instanceof Error?e.message:'Unable to fetch applications.');}
  finally{setLoading(false);}
 },[filter,request]);
 useEffect(()=>{void load();},[load]);
 function open(id:string){setSelected(id);setMethod('verified_in_person');setEvidence('');setConfirmed(false);setRejectReason('');setError('');setNotice('');}
 async function approve(id:string){
  if(!confirmed||evidence.trim().length<4)return;
  if(!window.confirm('Have you independently verified guardian authority and consent evidence? This will permanently create a learner profile and academic-year identity.'))return;
  setBusy(true);setError('');setNotice('');
  try{const data=await request('/admin/applications/'+encodeURIComponent(id)+'/approve',{method:'POST',body:JSON.stringify({confirmed:true,verificationMethod:method,evidenceReference:evidence.trim()})});
   setNotice('Approved. Learner Number: '+(data.learnerNumber||'already created')+'. No payment was collected.');
   setSelected('');await load();
  }catch(e){setError(e instanceof Error?e.message:'Approval failed.');}
  finally{setBusy(false);}
 }
 async function reject(id:string){
  if(rejectReason.trim().length<8)return;
  if(!window.confirm('Reject this application? The guardian will be able to see the reason.'))return;
  setBusy(true);setError('');setNotice('');
  try{await request('/admin/applications/'+encodeURIComponent(id)+'/reject',{method:'POST',body:JSON.stringify({confirmed:true,reason:rejectReason.trim()})});
   setNotice('Application rejected without creating any learner account.');setSelected('');await load();
  }catch(e){setError(e instanceof Error?e.message:'Rejection failed.');}
  finally{setBusy(false);}
 }
 return <section className="vg-one">
  <div className="vg-one-ops"><div><span className="vg-one-eyebrow"><ShieldCheck size={15}/> ADMINISTRATOR · MANUAL VERIFICATION</span><h2>ONE Admissions Review</h2><p>Approval creates a learner identity only after reviewing authentic guardian authority and consent evidence. Never enter Aadhaar or other identity numbers into the evidence reference.</p></div><button type="button" className="vg-one-minibutton" onClick={()=>void load()} disabled={loading||busy}><RefreshCw size={16}/> Refresh</button></div>
  <div className="vg-one-filters" role="group" aria-label="Filter applications">{(['submitted','approved','rejected','all'] as const).map(f=><button type="button" key={f} aria-pressed={filter===f} className={filter===f?'active':''} onClick={()=>{setFilter(f);setSelected('');}}>{f==='submitted'?'Pending review':f[0].toUpperCase()+f.slice(1)}</button>)}</div>
  {loading&&<p role="status">Loading admissions…</p>}
  {error&&<p role="alert" className="vg-one-error">{error}</p>}
  {notice&&<p role="status" className="vg-one-success">{notice}</p>}
  {!loading&&!error&&list.length===0&&<div className="vg-one-empty"><ClipboardCheck size={28}/><strong>Nothing in this queue</strong><p>Guardian applications will appear here once submitted.</p></div>}
  <div className="vg-one-review-list">{list.map(a=><article key={a.id} className="vg-one-card">
   <div className="vg-one-review-head"><div><span className="vg-one-eyebrow">{a.guardianName} · {a.guardianEmail}</span><h3>{a.childName}</h3><p>Class {a.grade} · {a.board==='STATE'?'Karnataka State Board':'CBSE'} · {a.academicYear}</p></div><span className={'vg-one-status '+a.status}>{a.status==='submitted'?'Pending':a.status}</span></div>
   {a.status==='approved'&&a.learnerNumber&&<p className="vg-one-learner-no"><GraduationBadge/> {a.learnerNumber}</p>}
   {a.status==='submitted'&&<><button className="vg-one-minibutton" type="button" onClick={()=>open(selected===a.id?'':a.id)}>{selected===a.id?'Close review':'Review guardian evidence'}</button>
    {selected===a.id&&<div className="vg-one-review-form">
     <div className="vg-one-warning"><ShieldCheck size={18}/><span>Before approval, verify that the applicant has authority over this child, the family received the correct notice, and consent was evidenced through an approved process. This form records staff attestation, not automatic identity verification.</span></div>
     <label htmlFor={'verify-method-'+a.id}>Verification process</label>
     <select id={'verify-method-'+a.id} value={method} onChange={e=>setMethod(e.target.value as Verification)}><option value="verified_in_person">Verified in person</option><option value="verified_parent_records">Reviewed parent/guardian records</option><option value="verified_digilocker">Verified through approved DigiLocker process</option></select>
     <label htmlFor={'verify-reference-'+a.id}>Internal evidence reference *</label>
     <input id={'verify-reference-'+a.id} value={evidence} maxLength={100} onChange={e=>setEvidence(e.target.value)} placeholder="Internal verification case reference only"/>
     <label className="vg-one-ack"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>I personally reviewed guardian authority and consent evidence and confirm the correct child, board, year and grade.</span></label>
     <button type="button" className="vg-one-primary" disabled={busy||!confirmed||evidence.trim().length<4} onClick={()=>void approve(a.id)}><CheckCircle2 size={17}/> Approve & create Learner ID</button>
     <label htmlFor={'reject-'+a.id}>Or reject with explanation</label>
     <textarea id={'reject-'+a.id} rows={2} maxLength={200} value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="Reason visible to the parent"/>
     <button type="button" className="vg-one-reject" disabled={busy||rejectReason.trim().length<8} onClick={()=>void reject(a.id)}><XCircle size={17}/> Reject application</button>
    </div>}
   </>}
  </article>)}</div>
 </section>;
};
const GraduationBadge=()=> <ShieldCheck size={17}/>;
