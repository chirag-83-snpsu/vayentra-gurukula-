import React,{useCallback,useEffect,useState} from 'react';
import {Archive,BookOpen,CheckCircle2,ClipboardCheck,GraduationCap,LockKeyhole,RefreshCcw,ShieldCheck} from 'lucide-react';
import {useApp} from '../context/AppContext';
import '../styles/one-journey.css';

type Year={id:string;year:string;grade:number;board:string;status:'pending'|'active'|'completed'|'withdrawn'};
type Mark={id:string;academicYearId:string;exam:string;subject:string;obtained:number;maximum:number;evidenceStatus:'self_reported'|'school_verified';createdAt:string};
type Journey={
 student:{id:string;name:string;grade:number;board:string;enrollmentNumber:string};
 membership:null|{initialGrade:number;initialYear:string;targetGrade:number;status:string;entitlement:string;joinedAt:string};
 academicYears:Year[];
 marks:Mark[];
 documents:Array<{id:string;academicYearId?:string;kind:string;fileName:string;reviewStatus:string}>;
 uploadAvailable:boolean;
 academicPolicy:string;
};
export const OneJourneyPanel:React.FC=()=>{
 const {activeChild,authToken}=useApp();
 const [data,setData]=useState<Journey|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const [yearId,setYearId]=useState('');
 const [subject,setSubject]=useState('');
 const [exam,setExam]=useState('');
 const [score,setScore]=useState('');
 const [maximum,setMaximum]=useState('100');
 const fetchJourney=useCallback(async(signal?:AbortSignal)=>{
  if(!activeChild?.id||!authToken){setData(null);setLoading(false);return;}
  const r=await fetch('/api/v1/journey/students/'+encodeURIComponent(activeChild.id),{
   headers:{Authorization:'Bearer '+authToken},signal});
  const json=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(json.message||json.code||'Unable to load the learning journey.');
  if(!signal?.aborted){setData(json);setYearId(prev=>json.academicYears.some((y:Year)=>y.id===prev)?prev:(json.academicYears.find((y:Year)=>y.status==='active')?.id||''));}
 },[activeChild?.id,authToken]);
 useEffect(()=>{
  const ctrl=new AbortController();
  setLoading(true);setError('');setData(null);setNotice('');setYearId('');
  fetchJourney(ctrl.signal).catch(e=>{if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:'Unable to load records.');}).finally(()=>{
   if(!ctrl.signal.aborted)setLoading(false);
  });
  return()=>ctrl.abort();
 },[fetchJourney]);
 const reload=async()=>{
  setError('');setNotice('');setLoading(true);
  try{await fetchJourney();}catch(e){setError(e instanceof Error?e.message:'Unable to refresh records.');}
  finally{setLoading(false);}
 };
 async function saveMark(event:React.FormEvent){
  event.preventDefault();
  if(!data?.membership||data.membership.status!=='active'||!authToken||!yearId)return;
  setBusy(true);setError('');setNotice('');
  try{
   const response=await fetch('/api/v1/journey/students/'+encodeURIComponent(data.student.id)+'/marks',{
    method:'POST',headers:{Authorization:'Bearer '+authToken,'Content-Type':'application/json'},
    body:JSON.stringify({academicYearId:yearId,subject,exam,obtained:Number(score),maximum:Number(maximum)})
   });
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(result.message||result.code||'Could not save marks.');
   setNotice('Saved as parent-reported marks, pending school verification.');setSubject('');setExam('');setScore('');
   await fetchJourney();
  }catch(e){setError(e instanceof Error?e.message:'Could not save marks.');}
  finally{setBusy(false);}
 }
 const membership=data?.membership;
 const years=data?.academicYears||[];
 const yearFor=(grade:number)=>years.find(y=>y.grade===grade);
 return <section className="vgo" aria-labelledby="vgo-heading">
  <header className="vgo-header"><div><span className="vgo-kicker">YOUR CLASS 1–10 LEARNING STORY</span><h2 id="vgo-heading">My Vayentra Journey<span>✦</span></h2>
   <p>One learner identity. Every academic year kept together.</p></div>
   <button type="button" className="vgo-refresh" onClick={()=>void reload()} disabled={loading}><RefreshCcw size={16}/> Refresh records</button>
  </header>
  {loading&&<p role="status">Loading your student's academic history…</p>}
  {error&&<p className="vgo-error" role="alert">{error}</p>}
  {notice&&<p className="vgo-notice" role="status">{notice}</p>}
  {!loading&&data&&<div className="vgo-content">
   <div className="vgo-identity">
    <span className="vgo-identity-mark"><GraduationCap size={25}/></span>
    <div><strong>{data.student.name}</strong><small>{data.student.enrollmentNumber||'Student ID: '+data.student.id} · Current Class {data.student.grade} · {data.student.board}</small></div>
    <span className={'vgo-membership-status'+(membership?.status==='active'?' active':'')}>{membership?.status==='active'?'Journey active':membership?.status==='pending_consent'?'Awaiting guardian review':'Enrolment setup pending'}</span>
   </div>
   <div className="vgo-track" aria-label="Class-by-class academic timeline">
    {Array.from({length:10},(_,i)=>i+1).map(grade=>{
     const yr=yearFor(grade);
     return <div key={grade} className={'vgo-grade'+(yr?.status==='active'?' active':yr?.status==='completed'?' completed':'')}>
      <span className="vgo-grade-number">{String(grade).padStart(2,'0')}</span>
      <strong>Class {grade}</strong>
      <small>{yr?yr.year:grade<data.student.grade?'Record not yet imported':'Not yet started'}</small>
      {yr&&<span className="vgo-grade-status">{yr.status==='completed'?'Completed':yr.status==='active'?'In progress':'Pending'}</span>}
     </div>;
    })}
   </div>
   {!membership&&<div className="vgo-callout">
    <ShieldCheck size={24}/><div><strong>Your Vayentra ONE identity has not been activated yet.</strong><p>Existing student details remain unchanged. An authorised administrator must link the permanent learning journey after an appropriate guardian verification and consent review.</p></div>
   </div>}
   {membership?.status==='pending_consent'&&<div className="vgo-callout">
    <LockKeyhole size={24}/><div><strong>Guardian review pending</strong><p>Your permanent learner identity is reserved. School marks and historic documents can be added after your enrolment is activated.</p></div>
   </div>}
   <div className="vgo-panels">
    <article className="vgo-panel">
     <div className="vgo-panel-heading"><ClipboardCheck size={20}/><h3>Academic records</h3></div>
     <p>Parent-reported marks stay clearly marked until confirmed against school-issued results. Scores are never guaranteed.</p>
     {data.marks.length===0?<div className="vgo-empty">No academic mark entries recorded in this journey yet.</div>:
      <div className="vgo-marks-list">{data.marks.map(m=><div key={m.id} className="vgo-mark">
       <div><strong>{m.subject}</strong><small>{m.exam}</small></div>
       <div><strong>{m.obtained} / {m.maximum}</strong><small>{m.evidenceStatus==='school_verified'?'School verified':'Parent reported — unverified'}</small></div>
      </div>)}</div>}
     {membership?.status==='active'&&<form className="vgo-marks-form" onSubmit={saveMark}>
      <h4>Add marks from a school report</h4>
      <p>Transcribe the numbers only; uploading mark card files will be introduced through the protected document vault.</p>
      <label htmlFor="vgo-year">Academic year</label>
      <select id="vgo-year" required value={yearId} onChange={e=>setYearId(e.target.value)}>
       <option value="">Select academic year</option>
       {years.filter(y=>['active','completed'].includes(y.status)).map(y=><option key={y.id} value={y.id}>Class {y.grade} · {y.year}</option>)}
      </select>
      <div className="vgo-form-row"><div><label htmlFor="vgo-subject">Subject</label><input required id="vgo-subject" minLength={2} maxLength={80} value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Mathematics"/></div>
       <div><label htmlFor="vgo-exam">Exam / term</label><input required id="vgo-exam" minLength={2} maxLength={80} value={exam} onChange={e=>setExam(e.target.value)} placeholder="Term 1"/></div></div>
      <div className="vgo-form-row"><div><label htmlFor="vgo-score">Marks obtained</label><input id="vgo-score" type="number" min="0" step="0.01" required value={score} onChange={e=>setScore(e.target.value)}/></div>
       <div><label htmlFor="vgo-maximum">Maximum marks</label><input id="vgo-maximum" type="number" min="0.01" max="1000" step="0.01" required value={maximum} onChange={e=>setMaximum(e.target.value)}/></div></div>
      <button disabled={busy||!yearId} type="submit">{busy?'Saving…':'Save parent-reported marks'} <CheckCircle2 size={16}/></button>
     </form>}
    </article>
    <article className="vgo-panel">
     <div className="vgo-panel-heading"><Archive size={20}/><h3>My document vault</h3></div>
     <p>Our long-term plan is a private place for mark cards, year-end reports and academic credentials.</p>
     <div className="vgo-empty"><LockKeyhole size={22}/><strong>Protected upload not available yet</strong><span>We will enable it only after encrypted storage, malware scanning, guardian verification and access logging are ready.</span></div>
     <div className="vgo-note"><BookOpen size={18}/><span>Textbooks, chapter explanations and concept videos will be released gradually after teacher review. Draft chapters will never be described as completed lessons.</span></div>
    </article>
   </div>
  </div>}
 </section>;
};
