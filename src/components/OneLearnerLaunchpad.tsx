import React,{useEffect,useState} from 'react';
import {ArrowRight,BookOpen,GraduationCap,LockKeyhole,ShieldCheck,Sparkles} from 'lucide-react';
import {useApp} from '../context/AppContext';
import {OneConceptStudio} from './OneConceptStudio';
import '../styles/one-enrolment.css';
type Subject={id:string;name:string;approved_chapters:number;published_concepts:number};
type Learner={learnerId:string;learnerNumber:string;studentName:string;currentYear:{grade:number;board:string;academicYear:string;status:string};
 membershipStatus:string;entitlementStatus:string;catalogue:{status:string;editionYear:string|null};subjects:Subject[];notice:string};
export const OneLearnerLaunchpad:React.FC<{onExplore:()=>void;parentPreviewStudentId?:string}>=({onExplore,parentPreviewStudentId})=>{
 const {authToken}=useApp();
 const [learner,setLearner]=useState<Learner|null>(null);
 const [loading,setLoading]=useState(true);
 const [showStudio,setShowStudio]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError('');setLearner(null);
  if(!authToken){setLoading(false);setError('Please sign in with your linked learner account.');return ()=>controller.abort();}
  fetch(parentPreviewStudentId?'/api/v1/one-onboarding/guardian/learners/'+encodeURIComponent(parentPreviewStudentId)+'/home':'/api/v1/one-onboarding/learner/me',{signal:controller.signal,headers:{Authorization:'Bearer '+authToken}})
   .then(async r=>{const data=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(data.message||data.code||'Learning profile unavailable.');return data.learner as Learner;
   }).then(data=>{if(!controller.signal.aborted)setLearner(data);})
   .catch(err=>{if(!controller.signal.aborted)setError(err instanceof Error?err.message:'Unable to load your learning space.');})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[authToken,parentPreviewStudentId]);
 if(showStudio)return <div className="vg-one">
  <button type="button" className="vg-one-minibutton" style={{alignSelf:'flex-start'}} onClick={()=>setShowStudio(false)}>← Back to Learning Universe</button>
  <OneConceptStudio parentPreviewStudentId={parentPreviewStudentId}/>
 </div>;
 return <section className="vg-one">
  <div className="vg-one-hero vg-one-learner-hero">
   <div><span className="vg-one-kicker"><Sparkles size={17}/> {parentPreviewStudentId?"GUARDIAN-SUPERVISED LEARNING":"MY LEARNING UNIVERSE"}</span>
    <h2>{learner?<>Welcome, {learner.studentName.split(' ')[0]}.<br/><em>Learn the why.</em></>:<>Your learning,<br/><em>built around you.</em></>}</h2>
    <p>Concepts become clear when we build them from the beginning. Your verified school year and board guide the lessons available here.</p></div>
   <div className="vg-one-pass"><span>MY LEARNING PASSPORT</span><GraduationCap size={33}/><strong>{learner?'CLASS '+learner.currentYear.grade:'VAYENTRA ONE'}</strong><small>{learner?.learnerNumber||'PERMANENT LEARNER ID'}</small></div>
  </div>
  {loading&&<p role="status">Opening your learning journey…</p>}
  {error&&<div className="vg-one-card"><LockKeyhole size={24}/><h3>Learning journey not yet activated</h3><p role="alert">{error}</p><p>Your academic year and learner-account link must be approved by the academy. Do not try to select another student ID to gain access.</p></div>}
  {learner&&<div className="vg-one-learner-body">
   <div className="vg-one-learner-stats">
    <div><small>ACADEMIC YEAR</small><strong>{learner.currentYear.academicYear}</strong></div>
    <div><small>MY CLASS</small><strong>Class {learner.currentYear.grade}</strong></div>
    <div><small>SCHOOL BOARD</small><strong>{learner.currentYear.board==='STATE'?'Karnataka State':'CBSE'}</strong></div>
   </div>
   <article className="vg-one-card">
    <span className="vg-one-eyebrow"><BookOpen size={15}/> YOUR VERIFIED SUBJECT SPACES</span>
    <h3>Choose what you want to understand.</h3>
    {learner.subjects.length>0?<div className="vg-one-subject-grid">{learner.subjects.map(s=><div key={s.id} className="vg-one-subject"><BookOpen size={22}/><strong>{s.name}</strong><p>{s.approved_chapters} reviewed chapters · {s.published_concepts} published concepts</p></div>)}</div>:<div className="vg-one-empty"><BookOpen size={32}/><strong>Your curriculum is being reviewed</strong><p>{learner.notice}</p></div>}
    {learner.entitlementStatus!=='enabled'&&<div className="vg-one-warning"><ShieldCheck size={18}/><span>Your Learner ID is active, but paid learning access is not configured. No payment has been charged and unpublished lessons are not available.</span></div>}
    <button type="button" className="vg-one-primary" onClick={()=>setShowStudio(true)}><BookOpen size={17}/> Start Class 4 Concept Studio <ArrowRight size={17}/></button>
    <button type="button" className="vg-one-primary" onClick={onExplore}>{parentPreviewStudentId?'View academic journey':'Open existing Learning Hub'} <ArrowRight size={17}/></button>
    <div className="vg-one-caption"><ShieldCheck size={16}/> This dashboard reflects authenticated enrolment data. Older demonstration lessons in the existing Learning Hub may not represent your approved curriculum.</div>
   </article>
  </div>}
 </section>;
};