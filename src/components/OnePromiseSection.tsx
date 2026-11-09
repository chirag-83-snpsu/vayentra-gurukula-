import React,{useState} from 'react';
import {ArrowUpRight,BookOpen,GraduationCap,LockKeyhole,ShieldCheck,Sparkles} from 'lucide-react';
import '../styles/one-promise.css';

type Props={onAdmissions:()=>void};
export const OnePromiseSection:React.FC<Props>=({onAdmissions})=>{
 const [joiningGrade,setJoiningGrade]=useState(4);
 const futureYears=11-joiningGrade;
 return <section className="vgone" id="vayentra-one" aria-labelledby="vgone-title">
  <div className="vgp-container vgone-inner">
   <div className="vgone-copy">
    <div className="vgone-kicker"><Sparkles size={16}/> INTRODUCING THE VAYENTRA ONE VISION</div>
    <h2 id="vgone-title">One learner.<br/>One identity.<br/><em>Every year of growth.</em></h2>
    <p>A child's learning journey doesn't begin again every April. Our goal is to give every student a continuous place to understand concepts, build confidence and look back on each year's progress — all the way to Class 10.</p>
    <div className="vgone-features">
     <span><GraduationCap size={19}/> A permanent student identity</span>
     <span><BookOpen size={19}/> Grade-by-grade concept learning</span>
     <span><ShieldCheck size={19}/> Parent-managed academic history</span>
    </div>
    <button type="button" onClick={onAdmissions} className="vgone-cta">Explore joining Vayentra <ArrowUpRight size={19}/></button>
    <small>Learning resources and annual records will be released in stages after academic and privacy review. No exam result is guaranteed.</small>
   </div>
   <div className="vgone-path">
    <div className="vgone-path-head"><span>THE LONG-TERM LEARNING PATH</span><span>CLASS 01 — 10</span></div>
    <div className="vgone-path-intro"><strong>What if a student joins in Class {joiningGrade}?</strong><p>They keep the same identity as they progress, instead of starting a new account each year.</p></div>
    <label htmlFor="vgone-join-grade">Explore starting class</label>
    <select id="vgone-join-grade" value={joiningGrade} onChange={e=>setJoiningGrade(Number(e.target.value))}>
     {Array.from({length:10},(_,i)=>i+1).map(g=><option key={g} value={g}>Class {g}</option>)}
    </select>
    <div className="vgone-years" aria-label="Class 1 to Class 10 progression">
     {Array.from({length:10},(_,i)=>i+1).map(g=><div key={g} className={'vgone-year'+(g===joiningGrade?' joining':g>joiningGrade?' future':' earlier')}>
      <b>{String(g).padStart(2,'0')}</b>
      <small>{g===joiningGrade?'Join':g>joiningGrade?'Next':'Earlier'}</small>
     </div>)}
    </div>
    <div className="vgone-outcome"><span><LockKeyhole size={19}/></span><div><strong>One continuous learning record</strong><p>{futureYears} class{futureYears===1?'':'es'} in the journey from Class {joiningGrade} through Class 10. Each year has its own curriculum, assessments and progress history.</p></div></div>
    <div className="vgone-disclaimer">Interactive vision preview. Access and historic data availability depend on actual enrolment, authorised records and phased release.</div>
   </div>
  </div>
 </section>;
};