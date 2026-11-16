import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ArrowRight,BookOpen,CheckCircle2,ChevronRight,Compass,HelpCircle,
 Layers3,LockKeyhole,RotateCcw,ShieldCheck,Sparkles,Target,TriangleAlert} from 'lucide-react';
import {useApp} from '../context/AppContext';
import {ShapesScene} from './OneShapesScene';
import '../styles/one-concept-studio.css';
type Summary={id:string;order:number;title:string;objective:string;visual:string;questionCount:number};
type Progress={completedChecks:number;attemptCount:number;latestAttempts:Array<{unitId:string;correct:number;total:number;checkedAt:string;guidance:string}>};
type Course={course:{title:string;book:string;grade:number;board:string;academicYear:string};units:Summary[];progress:Progress};
type Question={id:string;position:number;prompt:string;options:string[]};
type Lesson={id:string;order:number;title:string;objective:string;bridge:string;explanation:string;steps:string[];
 workedExample:string;misconception:string;activity:string;visual:string;questionCount:number};
type Feedback={attemptId:string;correct:number;total:number;replayed:boolean;notice?:string;
 feedback:Array<{questionId:string;chosenIndex:number;correctIndex:number;correct:boolean;rationale:string;misconceptionTag:string|null}>};

export const OneConceptStudio:React.FC<{parentPreviewStudentId?:string}>=({parentPreviewStudentId})=>{
 const {authToken}=useApp();
 const [course,setCourse]=useState<Course|null>(null);
 const [unitId,setUnitId]=useState('');
 const [lesson,setLesson]=useState<Lesson|null>(null);
 const [questions,setQuestions]=useState<Question[]>([]);
 const [answers,setAnswers]=useState<Record<string,number>>({});
 const [feedback,setFeedback]=useState<Feedback|null>(null);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [loadingLesson,setLoadingLesson]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const keyRef=useRef<string|null>(null);
 const base='/api/v1/one-studio'+(parentPreviewStudentId?'/guardian/'+encodeURIComponent(parentPreviewStudentId):'/me');
 const request=useCallback(async(path:string,method:'GET'|'POST'='GET',body?:unknown,signal?:AbortSignal)=>{
  if(!authToken)throw Error('A verified student or guardian login is required.');
  const response=await fetch(base+path,{signal,method,headers:{
   Authorization:'Bearer '+authToken,'Content-Type':'application/json'
  },body:body?JSON.stringify(body):undefined});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.message||data.code||'Could not access this learning activity.');
  return data;
 },[authToken,base]);
 const refresh=useCallback(async(signal?:AbortSignal)=>{
  setLoading(true);setError('');
  try{
   const data=await request('/course','GET',undefined,signal) as Course;
   if(!signal?.aborted){setCourse(data);setUnitId(prev=>data.units.some(u=>u.id===prev)?prev:(data.units[0]?.id||''));}
  }catch(e){if(!signal?.aborted)setError(e instanceof Error?e.message:'Course unavailable.');}
  finally{if(!signal?.aborted)setLoading(false);}
 },[request]);
 useEffect(()=>{const ctrl=new AbortController();setCourse(null);setLesson(null);setUnitId('');void refresh(ctrl.signal);return()=>ctrl.abort();},[refresh]);
 useEffect(()=>{
  const ctrl=new AbortController();setLesson(null);setQuestions([]);setAnswers({});setFeedback(null);
  setNotice('');keyRef.current=null;
  if(!unitId)return ()=>ctrl.abort();
  setLoadingLesson(true);setError('');
  void request('/units/'+encodeURIComponent(unitId),'GET',undefined,ctrl.signal).then(data=>{
    if(!ctrl.signal.aborted){setLesson(data.lesson as Lesson);setQuestions(data.questions as Question[]);}
   }).catch(e=>{if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:'Could not open this lesson.');})
    .finally(()=>{if(!ctrl.signal.aborted)setLoadingLesson(false);});
  return()=>ctrl.abort();
 },[unitId,request]);
 async function submit(){
  if(!lesson||busy||questions.some(q=>answers[q.id]===undefined))return;
  if(!keyRef.current)keyRef.current='studio-attempt-'+crypto.randomUUID();
  setBusy(true);setError('');setNotice('');
  try{
   const result=await request('/attempts','POST',{unitId:lesson.id,idempotencyKey:keyRef.current,
     answers:questions.map(q=>answers[q.id])}) as Feedback;
   setFeedback(result);
   setNotice('Saved. Use the explanations below to review each answer.');
   await refresh();
  }catch(e){setError(e instanceof Error?e.message:'Unable to save your work. Retry without changing the answers.');}
  finally{setBusy(false);}
 }
 const canSubmit=questions.length>0&&questions.every(q=>answers[q.id]!==undefined);
 return <section className="vgs">
  <header className="vgs-top">
   <div><span className="vgs-eyebrow"><Sparkles size={15}/> VAYENTRA ONE · CONCEPT STUDIO</span>
    <h2>Shapes become <em>understanding.</em></h2>
    <p>Class 4 · CBSE · Maths Mela · Chapter 1 · Original Vayentra teaching</p></div>
   <div className="vgs-chapter-mark"><strong>01</strong><span>CHAPTER</span></div>
  </header>
  {loading&&<p className="vgs-state" role="status">Opening teacher-approved lessons…</p>}
  {error&&<div role="alert" className="vgs-alert"><TriangleAlert size={20}/><span>{error}</span></div>}
  {!loading&&course&&<div className="vgs-shell">
   <nav className="vgs-sidebar" aria-label="Concept pathway">
    <div className="vgs-sidebar-heading"><small>CONCEPT PATHWAY</small><strong>{course.units.length} approved lesson{course.units.length===1?'':'s'}</strong></div>
    {course.units.map((unit,i)=>{
     const previous=course.progress.latestAttempts.find(a=>a.unitId===unit.id);
     return <button type="button" key={unit.id} aria-current={unitId===unit.id?'step':undefined}
      className={'vgs-sidebar-button'+(unitId===unit.id?' active':'')} onClick={()=>setUnitId(unit.id)}>
      <span className="vgs-number">{String(i+1).padStart(2,'0')}</span>
      <span><strong>{unit.title}</strong><small>{previous?(previous.correct+'/'+previous.total+' on latest check'):'Ready to explore'}</small></span>
      {previous?<CheckCircle2 size={16}/>:<ChevronRight size={16}/>}
     </button>;
    })}
    <div className="vgs-sidebar-footer"><Target size={17}/><span>{course.progress.completedChecks} checked concepts. These are practice results, not official school marks.</span></div>
   </nav>
   <main className="vgs-main">
    {course.units.length===0?<div className="vgs-empty"><LockKeyhole size={34}/><h3>Teacher review in progress</h3><p>Original lessons are prepared as drafts. They will appear here only after independent academic review and publication.</p></div>:
     loadingLesson?<p role="status" className="vgs-state">Opening selected concept…</p>:lesson&&<>
      <header className="vgs-lesson-intro"><span>CONCEPT {String(lesson.order).padStart(2,'0')} · {course.course.title}</span><h3>{lesson.title}</h3><p><Target size={17}/>{lesson.objective}</p></header>
      <ShapesScene visual={lesson.visual}/>
      <article className="vgs-teach"><h4><Compass size={17}/> Begin with what you know</h4><p>{lesson.bridge}</p></article>
      <article className="vgs-teach"><h4><BookOpen size={17}/> Understand the idea</h4><p>{lesson.explanation}</p></article>
      <article className="vgs-teach vgs-steps"><h4><Layers3 size={17}/> Think step by step</h4><ol>{lesson.steps.map((step,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{step}</li>)}</ol></article>
      <div className="vgs-paired"><article><h4><CheckCircle2 size={17}/> Worked example</h4><p>{lesson.workedExample}</p></article><article><h4><HelpCircle size={17}/> Common mistake</h4><p>{lesson.misconception}</p></article></div>
      <div className="vgs-away"><Sparkles size={21}/><div><strong>Try it away from the screen</strong><p>{lesson.activity}</p></div></div>
      <section className="vgs-practice" aria-labelledby="vgs-test-title">
       <header><div><span>QUICK CONCEPT CHECK</span><h4 id="vgs-test-title">Can you explain it?</h4></div><small>{questions.length} questions</small></header>
       {questions.map((q,i)=>{
        const result=feedback?.feedback.find(r=>r.questionId===q.id);
        return <div className="vgs-question" key={q.id}><h5><span>Q{i+1}</span> {q.prompt}</h5><div className="vgs-answers">
          {q.options.map((o,j)=><button type="button" key={j} aria-pressed={answers[q.id]===j}
           disabled={Boolean(feedback)||busy} className={answers[q.id]===j?'selected':''}
           onClick={()=>{setAnswers(a=>({...a,[q.id]:j}));keyRef.current=null;}}>
           <b>{String.fromCharCode(65+j)}</b>{o}</button>)}
         </div>
         {result&&<div className={'vgs-explanation'+(result.correct?' correct':' incorrect')}><strong>{result.correct?'Correct reasoning':'An idea to revisit'}</strong><p>{result.rationale}</p>{!result.correct&&<small>Correct choice: {String.fromCharCode(65+result.correctIndex)}</small>}</div>}
        </div>;
       })}
       {notice&&<p className="vgs-notice" role="status">{notice}</p>}
       {!feedback?<button type="button" className="vgs-primary" disabled={!canSubmit||busy} onClick={()=>void submit()}>{busy?'Saving answers…':'Check my understanding'} <ArrowRight size={17}/></button>:
        <div className="vgs-results"><strong>{feedback.correct}/{feedback.total} correct</strong><p>This check creates practice evidence, not a teacher-confirmed mastery certificate.</p><button type="button" onClick={()=>{setFeedback(null);setAnswers({});setNotice('');keyRef.current=null;}}><RotateCcw size={16}/> Practise again</button></div>}
      </section>
      <footer className="vgs-footer"><ShieldCheck size={16}/> Only academically published lessons are shown to authorised learners.</footer>
     </>}
   </main>
  </div>}
 </section>;
};