import React,{useEffect,useState} from 'react';
import {useApp} from '../context/AppContext';
export const ParentLearningCompass:React.FC=()=>{
 const {authToken,activeChild}=useApp();
 const [attempts,setAttempts]=useState<any[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{
  const controller=new AbortController();
  setLoading(true);setError('');setAttempts([]);
  if(!authToken){setError('Sign in to see your child’s diagnostic reports.');setLoading(false);return()=>controller.abort();}
  fetch('/api/v1/diagnostics/student/'+activeChild.id+'/attempts',{
   signal:controller.signal,headers:{Authorization:'Bearer '+authToken}
  }).then(async r=>{
   const body=await r.json();
   if(!r.ok)throw new Error(body.message||'Could not load reports.');
   setAttempts(body.attempts||[]);
  }).catch(e=>{if(e.name!=='AbortError')setError(e.message||'Could not load reports.');})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[authToken,activeChild.id]);
 return <div className="b" style={{display:'flex',flexDirection:'column',gap:12}}>
  <div className="h2">Learning Compass · Concept Diagnostics</div>
  <p className="t-muted">Your child’s diagnostic and teacher-approved learning pathway. Results identify topics for support, not intelligence or rank.</p>
  {loading&&<p role="status">Loading learning reports…</p>}
  {error&&<p role="alert" style={{color:'var(--color-error)'}}>{error}</p>}
  {!loading&&!error&&attempts.length===0&&<p>No completed diagnostic has been recorded for this student yet.</p>}
  {attempts.map(a=><div key={a.id} style={{background:'var(--color-paper-subtle)',padding:14,borderRadius:8}}>
   <strong>Baseline: {a.correct}/{a.total} questions correct</strong>
   <p className="t-muted">Teacher review: {a.status==='teacher_approved'?'Completed':'Pending'}</p>
   {a.learningPlan&&<>
    <p><strong>Focus concepts:</strong> {a.learningPlan.focusConcepts.join(', ')||'Enrichment pathway'}</p>
    <p><strong>Teacher’s guidance:</strong> {a.learningPlan.notes}</p>
   </>}
  </div>)}
 </div>;
};