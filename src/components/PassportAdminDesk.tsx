import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AlertTriangle,ArrowRight,CheckCircle2,GraduationCap,RefreshCw,ShieldCheck} from 'lucide-react';
import {useApp} from '../context/AppContext';
import '../styles/passport-admin.css';

type Learner={studentId:string;learnerId:string;learnerNumber:string;name:string;grade:number;board:string;currentYearId:string|null;yearKey:string|null;yearStatus:string};
type Year={id:string;year_key:string;grade:number;board:string;status:string};
type Details={learnerId:string;learnerNumber:string;studentId:string;studentName:string;currentGrade:number;currentBoard:string;currentYear:Year|null;years:Year[];guardianRelationshipReviewRequired:boolean};
function nextYear(year:string){const m=/^(\d{4})-(\d{2})$/.exec(year);if(!m)return '';const y=Number(m[1])+1;return y+'-'+String((y+1)%100).padStart(2,'0');}

export const PassportAdminDesk:React.FC=()=>{
 const {authToken}=useApp();
 const [rows,setRows]=useState<Learner[]>([]);
 const [studentId,setStudentId]=useState('');
 const [details,setDetails]=useState<Details|null>(null);
 const [year,setYear]=useState('');
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const retryKey=useRef<{from:string;to:string;value:string}|null>(null);
 const request=useCallback(async(path:string,options:RequestInit={})=>{
  if(!authToken)throw new Error('Admin sign-in required.');
  const res=await fetch('/api/v1/passport'+path,{...options,headers:{'Content-Type':'application/json',Authorization:'Bearer '+authToken,...options.headers}});
  const body=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(body.message||body.code||'Passport service unavailable.');
  return body;
 },[authToken]);
 const loadRoster=useCallback(async()=>{
  setLoading(true);setError('');
  try{const data=await request('/admin/roster');setRows(data.learners||[]);}
  catch(e){setError(e instanceof Error?e.message:'Could not retrieve roster.');}
  finally{setLoading(false);}
 },[request]);
 useEffect(()=>{void loadRoster();},[loadRoster]);
 const loadDetails=useCallback(async(id:string)=>{
  if(!id){setDetails(null);return;}
  try{const record=await request('/students/'+encodeURIComponent(id)) as Details;
   setDetails(record);setYear(record.currentYear?.year_key||record.years.find(y=>y.status==='pending_review')?.year_key||'');
  }catch(e){setDetails(null);setError(e instanceof Error?e.message:'Could not load passport.');}
 },[request]);
 useEffect(()=>{void loadDetails(studentId);retryKey.current=null;},[studentId,loadDetails]);
 const selected=rows.find(r=>r.studentId===studentId);
 const pending=details?.years.find(y=>y.status==='pending_review');
 const current=details?.currentYear;
 async function verify(){
  if(!selected||!pending||busy)return;
  if(!window.confirm('Confirm class, board and academic year after checking the student school record?'))return;
  setBusy(true);setError('');setNotice('');
  try{await request('/admin/students/'+encodeURIComponent(studentId)+'/verify',{method:'POST',
    body:JSON.stringify({confirmed:true,grade:selected.grade,
      board:selected.board==='STATE_KARNATAKA'?'STATE':selected.board,yearKey:year})});
   setNotice('Academic year verified. Permanent Learner ID unchanged.');
   await loadDetails(studentId);await loadRoster();
  }catch(e){setError(e instanceof Error?e.message:'Year verification failed.');}
  finally{setBusy(false);}
 }
 async function promote(){
  if(!details||!current||busy||current.grade>=10)return;
  const next=nextYear(current.year_key);
  if(!next){setError('Year format invalid.');return;}
  const prompt='Promote '+details.studentName+' from Class '+current.grade+' to Class '+(current.grade+1)+'? Old batch allocations will be closed. Historical attendance and homework remain saved. You must assign new batches.';
  if(!window.confirm(prompt))return;
  if(!retryKey.current||retryKey.current.from!==current.id||retryKey.current.to!==next){
   retryKey.current={from:current.id,to:next,value:'promote-'+crypto.randomUUID()};
  }
  setBusy(true);setError('');setNotice('');
  try{const result=await request('/admin/students/'+encodeURIComponent(studentId)+'/promote',{
    method:'POST',body:JSON.stringify({confirmed:true,fromYearId:current.id,
      nextYearKey:next,idempotencyKey:retryKey.current.value})});
   setNotice(result.alreadyApplied?'Promotion was already saved.':'Promoted to Class '+result.grade+'. Assign a new class batch.');
   await loadDetails(studentId);await loadRoster();retryKey.current=null;
  }catch(e){setError(e instanceof Error?e.message:'Promotion failed. Review before retrying.');}
  finally{setBusy(false);}
 }
 return <section className="vgpd">
  <div className="vgpd-header"><div><span><ShieldCheck size={17}/> ADMINISTRATOR ONLY</span><h2>Learning Passport Operations</h2><p>One permanent identity, verified academic history, safe annual progression.</p></div>
   <button className="ghost" type="button" onClick={()=>void loadRoster()} disabled={busy||loading}><RefreshCw size={17}/> Refresh</button>
  </div>
  <div className="vgpd-warning"><AlertTriangle size={20}/><p>Legacy grade and year information require human verification. Promotion closes old batch allocations but never deletes earlier attendance, homework or student IDs.</p></div>
  <label htmlFor="vgpd-student">Choose a student</label>
  <select id="vgpd-student" value={studentId} disabled={busy} onChange={e=>setStudentId(e.target.value)}>
   <option value="">Select learner</option>
   {rows.map(r=><option key={r.learnerId} value={r.studentId}>{r.name} · Class {r.grade} · {r.learnerNumber}</option>)}
  </select>
  {loading&&<p role="status">Loading enrolled learners…</p>}
  {error&&<p role="alert" className="vgpd-error">{error}</p>}
  {notice&&<p role="status" className="vgpd-success">{notice}</p>}
  {selected&&details&&<div className="vgpd-content">
   <div className="vgpd-identity"><div><span>PERMANENT LEARNER NUMBER</span><h3>{details.learnerNumber}</h3><p>{details.studentName} · Class {details.currentGrade} · {details.currentBoard}</p></div><GraduationCap size={36}/></div>
   <h3 className="vgpd-section-heading">Academic-year history</h3>
   <div className="vgpd-years">{details.years.map(y=><div key={y.id}><strong>Class {y.grade} · {y.year_key}</strong><span className={'vgpd-status '+y.status}>{y.status.replace('_',' ')}</span></div>)}</div>
   {details.guardianRelationshipReviewRequired&&<p className="vgpd-muted">Guardian identity has not been separately verified. School-year approval does not certify guardian relationship.</p>}
   {pending&&<div className="vgpd-operation"><h4>Verify current school year</h4><p>Match the official class, board and year before approval.</p>
    <label htmlFor="vgpd-year">Academic year (YYYY-YY)</label><input id="vgpd-year" maxLength={7} value={year} onChange={e=>setYear(e.target.value)} disabled={busy}/>
    <button className="vgpd-primary" onClick={()=>void verify()} disabled={busy||!year}><CheckCircle2 size={17}/> Verify year</button>
   </div>}
   {current&&<div className="vgpd-operation"><h4>Annual promotion</h4><p>Current Class {current.grade}, {current.year_key}. {current.grade===10?'A separate graduation workflow is needed.':'Next: Class '+(current.grade+1)+', '+nextYear(current.year_key)}</p>
    {current.grade<10&&<button className="vgpd-primary" onClick={()=>void promote()} disabled={busy}>Promote to Class {current.grade+1}<ArrowRight size={17}/></button>}
   </div>}
  </div>}
  {!studentId&&!loading&&<p className="vgpd-muted">Select a learner to review their school-year records. No changes are made until you confirm.</p>}
 </section>;
};