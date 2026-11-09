import React,{useCallback,useEffect,useState} from 'react';
import {useApp} from '../context/AppContext';

type Q={id:string;stem:string;options:string[];position:number;conceptId:string};
type DForm={id:string;title:string;status?:string;questions:Q[]};
type Result={id:string;student_name:string;correct_count:number;question_count:number;approved:boolean;concepts:{conceptId:string;correct:number;total:number;misconceptions:Record<string,number>}[]};
const pilotId='vg-lc-7-cbse-math-v1';
async function call(url:string,token:string,options:RequestInit={}){
 const res=await fetch(url,{...options,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,...options.headers}});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(data.message||data.code||'Request failed');
 return data;
}
export const LearningCompass:React.FC<{mode:'student'|'teacher'}>=({mode})=>{
 const {authToken,activeChild}=useApp();
 const token=authToken||'';
 const [form,setForm]=useState<DForm|null>(null);
 const [answers,setAnswers]=useState<Record<string,number>>({});
 const [attempts,setAttempts]=useState<Result[]>([]);
 const [myAttempts,setMyAttempts]=useState<any[]>([]);
 const [notes,setNotes]=useState<Record<string,string>>({});
 const [focus,setFocus]=useState<Record<string,string[]>>({});
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const load=useCallback(async()=>{
  setLoading(true);setError('');
  if(!token){setError('Sign in to use Learning Compass.');setLoading(false);return;}
  try{
   const all=await call('/api/v1/diagnostics/forms',token);
   if(!(all.forms||[]).some((f:any)=>f.id===pilotId)){setForm(null);return;}
   const detail=await call('/api/v1/diagnostics/forms/'+pilotId,token);
   setForm(detail.form);
   if(mode==='teacher'){
    const data=await call('/api/v1/diagnostics/forms/'+pilotId+'/attempts',token);
    setAttempts(data.attempts||[]);
   }else{
    const data=await call('/api/v1/diagnostics/student/'+activeChild.id+'/attempts',token);
    setMyAttempts(data.attempts||[]);
   }
  }catch(e){setError(e instanceof Error?e.message:'Failed to load diagnostic.');}
  finally{setLoading(false);}
 },[token,mode,activeChild.id]);
 useEffect(()=>{void load();},[load]);
 async function action(run:()=>Promise<void>){
  setBusy(true);setError('');setMessage('');
  try{await run();await load();}catch(e){setError(e instanceof Error?e.message:'Action failed.');}
  finally{setBusy(false);}
 }
 return <div style={{display:'flex',flexDirection:'column',gap:16}}>
  <div className="b" style={{background:'var(--color-navy-light)'}}>
   <div className="h2">Vayentra Learning Compass</div>
   <p className="t-muted">Diagnose understanding. Identify misconceptions. Let the teacher guide the next learning step.</p>
   <span className="chip chip-navy">Teacher-led pilot · Class 7 CBSE Mathematics</span>
  </div>
  {loading&&<div className="b" role="status">Loading diagnostic…</div>}
  {error&&<div className="b" role="alert" style={{color:'var(--color-error)'}}>{error} <button type="button" className="ghost" onClick={()=>void load()}>Retry</button></div>}
  {message&&<div className="b" role="status">{message}</div>}
  {!loading&&!form&&<div className="b">No diagnostic is currently available to this account. An administrator must assign the relevant batch.</div>}
  {!loading&&form&&mode==='teacher'&&<>
   <div className="b">
    <div className="h3">Teacher question-bank review</div>
    <p className="t-muted">Status: {form.status}. Before publishing, review grade alignment, distractor meaning, answer key and explanations in the API's answerKey. Do not send an unchecked test to students.</p>
    {form.questions.map(q=><div key={q.id} style={{padding:10,borderBottom:'1px solid var(--color-border-subtle)'}}>
     <strong>{q.position}. {q.stem}</strong><p className="t-muted">{q.options.join(' | ')}</p>
    </div>)}
    {form.status==='draft'&&<button className="btn btn-teal" type="button" disabled={busy} onClick={()=>void action(async()=>{
     if(!window.confirm('Confirm you have checked the question set and answer key?'))return;
     await call('/api/v1/diagnostics/forms/'+form.id+'/publish',token,{method:'POST',body:JSON.stringify({confirmedReviewed:true})});
     setMessage('Published to eligible students.');
    })}>Confirm teacher review & publish</button>}
   </div>
   <div className="b">
    <div className="h3">Submitted diagnostics & learning prescriptions</div>
    {attempts.length===0?<p className="t-muted">No responses submitted yet.</p>:attempts.map(a=><div key={a.id} style={{padding:12,borderBottom:'1px solid var(--color-border-subtle)'}}>
     <strong>{a.student_name} · {a.correct_count}/{a.question_count} correct</strong>
     <p className="t-muted">{a.approved?'Plan approved':'Needs teacher review'}</p>
     {a.concepts.map(c=><label key={c.conceptId} style={{display:'flex',alignItems:'center',gap:8,padding:6}}>
      <input style={{width:'auto'}} type="checkbox" checked={(focus[a.id]||[]).includes(c.conceptId)}
       onChange={e=>setFocus(p=>({...p,[a.id]:e.target.checked?[...(p[a.id]||[]),c.conceptId]:(p[a.id]||[]).filter(x=>x!==c.conceptId)}))}/>
      <span>{c.conceptId.replaceAll('-',' ')}: {c.correct}/{c.total} correct · Signals: {Object.entries(c.misconceptions).map(([k,v])=>k+' ('+v+')').join(', ')||'none'}</span>
     </label>)}
     <label style={{fontWeight:600,display:'block',marginTop:10}}>Teacher remediation notes</label>
     <textarea className="in" rows={3} value={notes[a.id]||''} placeholder="Describe one concept explanation, one activity and five targeted practice questions."
      onChange={e=>setNotes(p=>({...p,[a.id]:e.target.value}))}/>
     <button type="button" className="btn btn-teal" disabled={busy||(notes[a.id]||'').trim().length<5} onClick={()=>void action(async()=>{
      await call('/api/v1/diagnostics/attempts/'+a.id+'/approve-plan',token,{method:'POST',body:JSON.stringify({focusConcepts:focus[a.id]||[],notes:notes[a.id]})});
      setMessage('Teacher-approved learning path saved.');
     })}>Approve personalized plan</button>
    </div>)}
   </div>
  </>}
  {!loading&&form&&mode==='student'&&<>
   {!myAttempts.some(a=>a.formId===form.id)&&<div className="b">
    <div className="h3">Concept baseline check</div>
    <p className="t-muted">Mistakes are useful learning signals, not grades. Answer each question independently.</p>
    {form.questions.map(q=><fieldset key={q.id} style={{padding:14,margin:'12px 0',border:'1px solid var(--color-border-subtle)',borderRadius:10}}>
      <legend style={{fontWeight:700}}>{q.position}. {q.stem}</legend>
      {q.options.map((opt,i)=><label key={i} style={{display:'flex',alignItems:'center',gap:8,padding:6}}>
       <input type="radio" style={{width:'auto'}} name={q.id} checked={answers[q.id]===i} onChange={()=>setAnswers(p=>({...p,[q.id]:i}))}/>{opt}
      </label>)}
     </fieldset>)}
    <button type="button" className="btn btn-teal" disabled={busy||form.questions.some(q=>answers[q.id]===undefined)} onClick={()=>void action(async()=>{
     if(!window.confirm('Submit your baseline? Only one submission is permitted in this pilot.'))return;
     const responses=form.questions.map(q=>({itemId:q.id,selectedIndex:answers[q.id]}));
     const result=await call('/api/v1/diagnostics/forms/'+form.id+'/submit',token,{method:'POST',body:JSON.stringify({responses})});
     setMessage('Saved '+result.score.correct+'/'+result.score.total+'. Your teacher will review next steps.');
    })}>Submit concept check</button>
   </div>}
   <div className="b">
    <div className="h3">My learning pathways</div>
    {myAttempts.length===0?<p className="t-muted">No completed diagnostics yet.</p>:myAttempts.map(a=><div key={a.id} style={{padding:12,borderBottom:'1px solid var(--color-border-subtle)'}}>
     <strong>Baseline · {a.correct}/{a.total} correct</strong>
     <p>{a.status==='teacher_approved'?'Teacher-approved plan':'Awaiting teacher review'}</p>
     {a.learningPlan&&<><strong>Focus: {a.learningPlan.focusConcepts.join(', ')||'Enrichment'}</strong><p>{a.learningPlan.notes}</p></>}
    </div>)}
   </div>
  </>}
  <p className="t-tiny">Pilot: rule-based misconception patterns; no automated claims about student intelligence. All learning prescriptions require teacher approval.</p>
 </div>;
};
