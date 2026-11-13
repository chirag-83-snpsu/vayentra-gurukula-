import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ArrowRight,BookOpen,CheckCircle2,GraduationCap,LockKeyhole,RefreshCw,ShieldCheck} from 'lucide-react';
import {useApp} from '../context/AppContext';
import '../styles/one-enrolment.css';
type Status='submitted'|'approved'|'rejected';
type Application={id:string;childName:string;grade:number;board:'CBSE'|'STATE';academicYear:string;status:Status;learnerNumber?:string|null;createdAt:string;reviewNote?:string|null};
type Board='CBSE'|'STATE';
function currentYear(){
 const date=new Date(),start=date.getMonth()>=3?date.getFullYear():date.getFullYear()-1;
 return start+'-'+String((start+1)%100).padStart(2,'0');
}
export const OneGuardianAdmission:React.FC=()=>{
 const {authToken}=useApp();
 const [records,setRecords]=useState<Application[]>([]);
 const [childName,setChildName]=useState('');
 const [grade,setGrade]=useState('4');
 const [board,setBoard]=useState<Board>('CBSE');
 const [year,setYear]=useState(currentYear());
 const [ack,setAck]=useState(false);
 const [sending,setSending]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const retryKey=useRef<string|null>(null);
 const request=useCallback(async(path:string,options:RequestInit={})=>{
  if(!authToken)throw new Error('Please sign in with your parent or guardian account.');
  const response=await fetch('/api/v1/one-onboarding'+path,{...options,headers:{
   'Content-Type':'application/json',Authorization:'Bearer '+authToken,...options.headers}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.message||data.code||'The admissions service is unavailable.');
  return data;
 },[authToken]);
 const refresh=useCallback(async()=>{
  setLoading(true);setError('');
  try{const result=await request('/guardian/applications');setRecords(result.applications||[]);}
  catch(e){setError(e instanceof Error?e.message:'Unable to load your applications.');}
  finally{setLoading(false);}
 },[request]);
 useEffect(()=>{void refresh();},[refresh]);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(sending)return;
  setSending(true);setError('');setSuccess('');
  if(!retryKey.current)retryKey.current='guardian-app-'+crypto.randomUUID();
  try{
   await request('/guardian/applications',{method:'POST',body:JSON.stringify({
    childName,grade:Number(grade),board,academicYear:year,idempotencyKey:retryKey.current,
    guardianAcknowledgement:ack
   })});
   setSuccess('Application recorded for review. No seat has been confirmed and no payment has been collected.');
   setChildName('');setAck(false);retryKey.current=null;
   await refresh();
  }catch(err){setError(err instanceof Error?err.message:'Could not send application.');}
  finally{setSending(false);}
 }
 return <section className="vg-one">
  <header className="vg-one-hero">
   <div><span className="vg-one-kicker"><GraduationCap size={16}/> VAYENTRA ONE · FAMILY ONBOARDING</span>
    <h2>One beginning.<br/><em>A continuous learning journey.</em></h2>
    <p>Apply once for a learner identity that can follow your child from their joining class through Class 10. Admissions are reviewed by the academy before activation.</p></div>
   <div className="vg-one-pass"><span>FAMILY ENTRY</span><GraduationCap size={33}/><strong>LEARNING<br/>PASSPORT</strong><small>CLASSES 01—10</small></div>
  </header>
  <div className="vg-one-columns">
   <article className="vg-one-card">
    <span className="vg-one-eyebrow">NEW LEARNER APPLICATION</span>
    <h3>Begin the admission process.</h3>
    <p>For an existing signed-in parent/guardian. Only minimal details are collected at this stage; do not upload mark cards or identity documents here.</p>
    <form onSubmit={submit} className="vg-one-form">
     <label htmlFor="one-child-name">Learner's name *</label>
     <input id="one-child-name" required minLength={2} maxLength={80} autoComplete="off" value={childName} onChange={e=>{setChildName(e.target.value);retryKey.current=null;}} placeholder="Name as used for the academy application"/>
     <div className="vg-one-form-grid">
      <div><label htmlFor="one-grade">Current class *</label><select id="one-grade" value={grade} onChange={e=>{setGrade(e.target.value);retryKey.current=null;}}>{Array.from({length:10},(_,i)=><option value={i+1} key={i+1}>Class {i+1}</option>)}</select></div>
      <div><label htmlFor="one-board">School board *</label><select id="one-board" value={board} onChange={e=>{setBoard(e.target.value as Board);retryKey.current=null;}}><option value="CBSE">CBSE</option><option value="STATE">Karnataka State Board</option></select></div>
     </div>
     <label htmlFor="one-year">Academic year *</label>
     <input id="one-year" value={year} onChange={e=>{setYear(e.target.value);retryKey.current=null;}} pattern="[0-9]{4}-[0-9]{2}" maxLength={7} placeholder="2026-27" required/>
     <label className="vg-one-ack"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)} required/><span>I am submitting this application as the child's parent or guardian. I understand Vayentra will use these details for admission review, and that separate verified guardian relationship and consent evidence are required before enrolment is activated.</span></label>
     {error&&<p role="alert" className="vg-one-error">{error}</p>}
     {success&&<p role="status" className="vg-one-success">{success}</p>}
     <button className="vg-one-primary" type="submit" disabled={!ack||sending||!childName.trim()}>{sending?'Submitting…':'Submit for academic review'} <ArrowRight size={17}/></button>
     <div className="vg-one-caption"><ShieldCheck size={16}/> No subscription payment or child account credentials are requested on this page.</div>
    </form>
   </article>
   <aside className="vg-one-card">
    <div className="vg-one-card-head"><div><span className="vg-one-eyebrow">MY FAMILY APPLICATIONS</span><h3>Your admission journey</h3></div><button type="button" className="vg-one-minibutton" onClick={()=>void refresh()}><RefreshCw size={16}/> Refresh</button></div>
    {loading?<p role="status">Loading family applications…</p>:records.length===0?<div className="vg-one-empty"><BookOpen size={29}/><strong>No applications yet</strong><p>Applications submitted using this guardian account appear here.</p></div>:<div className="vg-one-apps">
     {records.map(r=><div className="vg-one-application" key={r.id}><div className="vg-one-app-top"><strong>{r.childName}</strong><span className={'vg-one-status '+r.status}>{r.status==='submitted'?'Under review':r.status==='approved'?'Approved':'Needs attention'}</span></div><p>Class {r.grade} · {r.board==='STATE'?'Karnataka State Board':'CBSE'} · {r.academicYear}</p>
       {r.status==='approved'&&r.learnerNumber&&<div className="vg-one-learner-no"><LockKeyhole size={15}/> Permanent Learner Number <b>{r.learnerNumber}</b></div>}
       {r.status==='rejected'&&r.reviewNote&&<p className="vg-one-app-reason">{r.reviewNote}</p>}
      </div>)}
    </div>}
    <div className="vg-one-info"><CheckCircle2 size={19}/><p>After approval, your child receives a permanent institutional learner number. Learning content remains subject to academic publication and membership access rules.</p></div>
    <div className="vg-one-caption">Already approved? Refresh your Family Portal to load the newly linked child profile.</div>
   </aside>
  </div>
 </section>;
};