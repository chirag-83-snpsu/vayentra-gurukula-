import React,{useEffect,useState} from 'react';
import {BookOpen,GraduationCap,LockKeyhole,ShieldCheck} from 'lucide-react';
import {useApp} from '../context/AppContext';
import '../styles/passport-journey.css';
type Year={id:string;year_key:string;grade:number;board:string;status:string;verified_at:string|null};
type Passport={learnerId:string;learnerNumber:string;studentId:string;studentName:string;currentGrade:number;currentBoard:string;years:Year[];currentYear:Year|null;guardianRelationshipReviewRequired:boolean;historicRecordsRetained:boolean};
type Payload={passports:Passport[]};

export const LearnerPassportJourney:React.FC=()=>{
 const {authToken,activeChild}=useApp();
 const [passports,setPassports]=useState<Passport[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{
  const ctrl=new AbortController();setLoading(true);setError('');setPassports([]);
  if(!authToken){setLoading(false);setError('Sign in to view your Learning Passport.');return()=>ctrl.abort();}
  fetch('/api/v1/passport/me',{signal:ctrl.signal,headers:{Authorization:'Bearer '+authToken}})
   .then(async response=>{const body=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(body.message||body.code||'Learning Passport unavailable.');
    return body as Payload;
   }).then(data=>{if(!ctrl.signal.aborted)setPassports(data.passports||[]);})
   .catch(err=>{if(!ctrl.signal.aborted)setError(err instanceof Error?err.message:'Could not load academic history.');})
   .finally(()=>{if(!ctrl.signal.aborted)setLoading(false);});
  return()=>ctrl.abort();
 },[authToken,activeChild?.id]);
 const passport=passports.find(p=>p.studentId===activeChild?.id);
 return <section className="vglp">
  <div className="vglp-banner"><div><span><GraduationCap size={18}/> VAYENTRA LEARNING PASSPORT</span><h2>One identity. Every academic year.</h2><p>Your Vayentra learning journey stays connected as you move from one class to the next.</p></div><BookOpen size={42}/></div>
  {loading&&<p role="status">Loading your personal academic-year history…</p>}
  {error&&<p role="alert" className="vglp-error">{error}</p>}
  {!loading&&!error&&!passport&&<p className="vglp-empty">No authorised Passport was found for the currently selected student. Ask the centre to check the enrolment and guardian link.</p>}
  {passport&&<div className="vglp-main">
   <div className="vglp-profile"><div><span>PERMANENT VAYENTRA LEARNER NUMBER</span><strong>{passport.learnerNumber}</strong><small>{passport.studentName} · Class {passport.currentGrade} · {passport.currentBoard==='STATE'?'Karnataka State Board':passport.currentBoard}</small></div><ShieldCheck size={30}/></div>
   <h3>My academic timeline</h3>
   <div className="vglp-year-list">{passport.years.map(y=><div className="vglp-year" key={y.id}>
    <span className="vglp-year-icon"><GraduationCap size={18}/></span>
    <div><strong>Class {y.grade}</strong><small>{y.year_key} · {y.board==='STATE'?'Karnataka State Board':y.board}</small></div>
    <span className={'vglp-tag '+y.status}>{y.status==='pending_review'?'Needs verification':y.status==='active'?'Current year':y.status==='completed'?'Completed':'Closed'}</span>
   </div>)}</div>
   {passport.guardianRelationshipReviewRequired&&<p className="vglp-reminder"><ShieldCheck size={17}/> Guardian-to-student relationship still needs independent verification. This view does not certify identity or school-issued marks.</p>}
   <div className="vglp-footer"><LockKeyhole size={17}/><p>Historical attendance, assessments and mark cards are preserved in their existing modules. A private document vault and official mark-card uploads are planned but are not active here.</p></div>
  </div>}
 </section>;
};