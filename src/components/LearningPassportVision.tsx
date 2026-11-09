import React,{useMemo,useState} from 'react';
import {
 ArrowRight,BookOpen,BrainCircuit,CheckCircle2,ChevronRight,ClipboardCheck,
 FileText,GraduationCap,LockKeyhole,Milestone,ShieldCheck,Sparkles,Target
} from 'lucide-react';
import '../styles/learning-passport-vision.css';

type Board='CBSE'|'STATE';
type Tab='learn'|'passport'|'vault';
type Subject='Mathematics'|'Science'|'English'|'Social Science';
const subjectExamples:Record<Subject,{title:string;intro:string;concepts:string[]}>={
 Mathematics:{title:'Reasoning with Numbers',intro:'Build a clear explanation, then solve a practical problem.',concepts:['Understand the question','Learn the basic idea','See the worked example','Try an original practice check']},
 Science:{title:'Observe, Explain, Experiment',intro:'Move from everyday observation to scientific understanding.',concepts:['What do you notice?','Explore why it happens','Watch a diagram-led example','Test the concept']},
 English:{title:'Read, Think, Express',intro:'Learn language by interpreting meaning and using it with confidence.',concepts:['Read with purpose','Understand vocabulary','Build a clear response','Practise expression']},
 'Social Science':{title:'Stories Behind Society',intro:'Connect history, geography and citizenship to the real world.',concepts:['Start with the context','Explore the big idea','Connect causes and effects','Explain in your own words']}
};
const gradeFocus=(grade:number)=>grade<=2?'Foundational Discoveries':grade<=5?'Curiosity & Confidence':grade<=8?'Deep Concept Building':'Board Readiness & Application';

/**
 * A synthetic ADMIN-ONLY EXPERIENCE PREVIEW. It never reads learner data,
 * does not record marks, and does not imply curriculum/video availability.
 */
export const LearningPassportVision:React.FC=()=>{
 const [grade,setGrade]=useState(4);
 const [board,setBoard]=useState<Board>('CBSE');
 const [tab,setTab]=useState<Tab>('learn');
 const [subject,setSubject]=useState<Subject>('Mathematics');
 const [selectedConcept,setSelectedConcept]=useState(1);
 const [pastYears,setPastYears]=useState(false);
 const example=subjectExamples[subject];
 const years=useMemo(()=>Array.from({length:10},(_,i)=>i+1),[]);
 return <section className="vg-vision">
  <div className="vg-vision-notice"><ShieldCheck size={18}/>
   <span><strong>Internal founder experience prototype.</strong> This is a synthetic interface preview, not a live child account, verified textbook catalogue, payments module or production enrolment system.</span>
  </div>
  <div className="vg-vision-hero">
   <div className="vg-vision-hero-left">
    <span className="vg-vision-eyebrow"><Sparkles size={15}/> ONE ENROLMENT · A TEN-GRADE JOURNEY</span>
    <h2>Every year,<br/><em>a stronger learner.</em></h2>
    <p>Imagine one permanent Learning Passport, carrying a student's concepts, goals, achievements and school records all the way to Class 10.</p>
    <div className="vg-vision-proof"><span><CheckCircle2 size={16}/> One Learner ID</span><span><CheckCircle2 size={16}/> Year-by-year history</span><span><CheckCircle2 size={16}/> Family controlled</span></div>
   </div>
   <div className="vg-vision-passport-card">
    <div className="vg-vision-passport-top"><span>VAYENTRA / LEARNING PASSPORT</span><GraduationCap size={29}/></div>
    <div className="vg-vision-passport-name">MY LEARNING<br/>JOURNEY</div>
    <div className="vg-vision-passport-identity">PREVIEW ID <b>VG-LEARNER-000</b></div>
    <div className="vg-vision-passport-footer"><span>CLASSES 01—10</span><span>★</span><span>GROW WITH UNDERSTANDING</span></div>
   </div>
  </div>
  <div className="vg-vision-surface">
   <header className="vg-vision-header">
    <div><span>LEARNING UNIVERSE</span><h3>Let's build your next breakthrough.</h3><p>Explore how the platform adapts across ten grades.</p></div>
    <div className="vg-vision-filter"><label htmlFor="vg-passport-board">Board</label><select id="vg-passport-board" value={board} onChange={e=>setBoard(e.target.value as Board)}><option value="CBSE">CBSE</option><option value="STATE">Karnataka State Board</option></select></div>
   </header>
   <div className="vg-vision-years-head"><span>YOUR ACADEMIC PATH</span><span>Choose any grade to preview</span></div>
   <div className="vg-vision-years" role="group" aria-label="Preview class across the learning passport">
    {years.map(n=><button type="button" key={n} aria-pressed={n===grade} onClick={()=>{setGrade(n);setTab('learn');setPastYears(false);setSelectedConcept(1)}}>
     <span>{String(n).padStart(2,'0')}</span><small>CLASS</small>{n===grade&&<b>◆</b>}
    </button>)}
   </div>
   <div className="vg-vision-current"><div><span>CLASS {grade.toString().padStart(2,'0')} · {board==='CBSE'?'CBSE':'KARNATAKA STATE'}</span><h4>{gradeFocus(grade)}</h4></div><span>Concept-first learning · illustrative journey</span></div>
   <div className="vg-vision-tabs" role="tablist" aria-label="Learning Passport prototype areas">
    <button role="tab" aria-selected={tab==='learn'} onClick={()=>setTab('learn')}><BookOpen size={18}/> My Learning</button>
    <button role="tab" aria-selected={tab==='passport'} onClick={()=>setTab('passport')}><Milestone size={18}/> Yearly Passport</button>
    <button role="tab" aria-selected={tab==='vault'} onClick={()=>setTab('vault')}><LockKeyhole size={18}/> Academic Vault</button>
   </div>
   {tab==='learn'&&<div className="vg-vision-learn">
    <aside className="vg-vision-subjects"><span>YOUR SUBJECT SPACES</span>
     {(Object.keys(subjectExamples) as Subject[]).map(s=><button type="button" key={s} className={subject===s?'active':''} aria-pressed={subject===s} onClick={()=>{setSubject(s);setSelectedConcept(1)}}>
      <BookOpen size={17}/>{s}<ChevronRight size={16}/></button>)}
    </aside>
    <article className="vg-vision-lesson">
     <div className="vg-vision-lesson-top"><span><BrainCircuit size={17}/> CONCEPT STUDIO</span><span>ORIGINAL LESSON PREVIEW</span></div>
     <h4>{example.title}</h4><p>{example.intro}</p>
     <div className="vg-vision-concept-list">
      {example.concepts.map((c,i)=><button type="button" key={c} className={selectedConcept===i?'active':''} onClick={()=>setSelectedConcept(i)}><span>{String(i+1).padStart(2,'0')}</span><strong>{c}</strong><ArrowRight size={17}/></button>)}
     </div>
     <div className="vg-vision-lesson-tip"><Target size={18}/><span>Selected step: <strong>{example.concepts[selectedConcept]}</strong>. Every real topic will require teacher-reviewed content, formative feedback and curriculum provenance before publication.</span></div>
    </article>
   </div>}
   {tab==='passport'&&<div className="vg-vision-panel">
    <span className="vg-vision-kicker">ONE ID. MULTIPLE SCHOOL YEARS.</span><h4>What stays with the learner?</h4>
    <div className="vg-vision-tiles">
     <div><Milestone size={23}/><strong>Grade timeline</strong><p>Every promotion adds a new year; previous learning remains preserved.</p></div>
     <div><BrainCircuit size={23}/><strong>Concept growth</strong><p>Misconceptions, rechecks and teacher feedback form an evidence trail.</p></div>
     <div><ClipboardCheck size={23}/><strong>Academic progress</strong><p>Verified performance is compared across time, without promising marks.</p></div>
    </div>
    <button className="vg-vision-text-action" onClick={()=>setPastYears(!pastYears)}>{pastYears?'Hide sample grade timeline':'Show sample grade timeline'} <ArrowRight size={17}/></button>
    {pastYears&&<p className="vg-vision-timeline-example">Illustration only: Class {Math.max(1,grade-1)} academic-year record → Class {grade} current record → Class {Math.min(10,grade+1)} next-year proposal. Historical documents are never overwritten by promotion.</p>}
   </div>}
   {tab==='vault'&&<div className="vg-vision-panel">
    <span className="vg-vision-kicker">PRIVATE FAMILY SPACE</span><h4>One secure academic archive.</h4>
    <div className="vg-vision-tiles">
     <div><FileText size={23}/><strong>Mark cards</strong><p>Parent-submitted school records, labelled as unverified until appropriately checked.</p></div>
     <div><ShieldCheck size={23}/><strong>Guardian controls</strong><p>Consent, access, exports and removal requests built around the family.</p></div>
     <div><GraduationCap size={23}/><strong>Class 10 portfolio</strong><p>A personal Vayentra learning report, not an official school certificate.</p></div>
    </div>
    <p className="vg-vision-timeline-example">Uploads are intentionally disabled in this prototype. Real documents require private storage, verified ownership, file scanning and retention controls.</p>
   </div>}
   <footer className="vg-vision-footer"><span><ShieldCheck size={15}/> Internal prototype · No student data or payment handled</span><span>Vayentra Gurukula / Future Learning Platform</span></footer>
  </div>
 </section>;
};