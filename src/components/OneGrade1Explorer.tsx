import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,BookHeart,BookOpen,CheckCircle2,ChevronDown,GraduationCap,
 Lightbulb,LockKeyhole,RefreshCw,ShieldCheck,Sparkles,Target,WalletCards,Volume2,VolumeX} from 'lucide-react';
import {useApp} from '../context/AppContext';
import {OneGrade1MathsScene,type PictureScene} from './OneGrade1MathsScene';
import '../styles/one-grade1.css';

type Unit={id:string;title:string;status:string};
type Chapter={id:string;number:number;title:string;reviewStatus:string;lessonAvailability:string;lessonCount:number;units:Unit[]};
type Subject={id:string;name:string;kind:string;book:string;sourceStatus:string;reviewStatus:string;chapters:Chapter[];approvedLessons:number;plannedChapters:number};
type MapData={board:string;grade:number;edition:string;trackStatus:string;subjects:Subject[];note:string};
type Catalogue={learner:{grade:number;board:string};catalogue:MapData;access:'locked'|'pilot_or_entitled';progress:{checkedLessons:number;attemptsRecorded:number;latestChecks:Array<{unitId:string;correct:number;total:number;checkedAt:string}>}|null};
type Question={id:string;position:number;prompt:string;options:string[]};
type Lesson={id:string;subject:string;chapter:string;title:string;objective:string;story:string;homeActivity:string;questions:Question[];expectedMinutes:number;curriculumKind:string;pictureScene?:PictureScene|null;guidedSteps?:string[];guardianGuide?:string|null};
type Result={correct:number;total:number;feedback:Array<{questionId:string;chosenIndex:number;correctIndex:number;correct:boolean;reason:string}>;replayed:boolean};

const subjectIcon=(name:string)=>name.includes('Money')?'money':name.includes('AI')?'ai':name.includes('Mathematics')?'math':'book';
export const OneGrade1Explorer:React.FC<{parentPreviewStudentId?:string}>=({parentPreviewStudentId})=>{
 const {authToken}=useApp();
 const [catalogue,setCatalogue]=useState<Catalogue|null>(null);
 const [activeSubject,setActiveSubject]=useState('');
 const [lesson,setLesson]=useState<Lesson|null>(null);
 const [answers,setAnswers]=useState<Record<string,number>>({});
 const [result,setResult]=useState<Result|null>(null);
 const [loading,setLoading]=useState(true);
 const [loadingLesson,setLoadingLesson]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [speaking,setSpeaking]=useState(false);
 const retryKey=useRef<string|null>(null);
 const base='/api/v1/grade1'+(parentPreviewStudentId?'/guardian/'+encodeURIComponent(parentPreviewStudentId):'/me');
 const api=useCallback(async(path:string,method:'GET'|'POST'='GET',body?:unknown,signal?:AbortSignal)=>{
  if(!authToken)throw Error('Guardian or learner sign-in required.');
  const res=await fetch(base+path,{method,signal,headers:{Authorization:'Bearer '+authToken,'Content-Type':'application/json'},
   body:body?JSON.stringify(body):undefined});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(data.message||data.code||'Class 1 lessons are not yet available.');
  return data;
 },[authToken,base]);
 const refresh=useCallback(async(signal?:AbortSignal)=>{
  setLoading(true);setError('');
  try{
   const data=await api('/catalogue','GET',undefined,signal) as Catalogue;
   if(signal?.aborted)return;
   setCatalogue(data);
   setActiveSubject(old=>data.catalogue.subjects.some(s=>s.id===old)?old:data.catalogue.subjects[0]?.id||'');
  }catch(e){if(!signal?.aborted)setError(e instanceof Error?e.message:'Unable to load Class 1 curriculum.');}
  finally{if(!signal?.aborted)setLoading(false);}
 },[api]);
 useEffect(()=>{const ctrl=new AbortController();setCatalogue(null);setLesson(null);void refresh(ctrl.signal);return()=>ctrl.abort();},[refresh]);
 useEffect(()=>{
  return ()=>{if(typeof window!=='undefined'&&'speechSynthesis' in window){window.speechSynthesis.cancel();}};
 },[lesson?.id]);
 function speakStory(){
  if(!lesson||typeof window==='undefined'||!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){
   setNotice('Read the story together with an adult; spoken playback is not supported in this browser.');return;
  }
  try{
   const speech=window.speechSynthesis;
   speech.cancel();
   const item=new SpeechSynthesisUtterance(lesson.story);
   item.lang=lesson.subject==='Hindi'?'hi-IN':lesson.subject==='Kannada'?'kn-IN':'en-IN';
   item.rate=0.88;item.pitch=1.05;
   item.onend=()=>setSpeaking(false);
   item.onerror=()=>setSpeaking(false);
   setSpeaking(true);speech.speak(item);
  }catch{
   setSpeaking(false);setNotice('Read the story together with an adult; the browser could not start speech playback.');
  }
 }
 function stopStory(){
  if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();
  setSpeaking(false);
 }
 function closeLesson(){stopStory();setLesson(null);setAnswers({});setResult(null);setNotice('');setError('');retryKey.current=null;}
 async function openLesson(id:string){
  setLoadingLesson(true);setError('');setNotice('');setResult(null);setAnswers({});retryKey.current=null;
  try{const data=await api('/units/'+encodeURIComponent(id));setLesson(data.lesson as Lesson);}
  catch(e){setError(e instanceof Error?e.message:'This lesson is not yet available.');}
  finally{setLoadingLesson(false);}
 }
 async function submit(){
  if(!lesson||busy||lesson.questions.some(q=>answers[q.id]===undefined))return;
  if(!retryKey.current)retryKey.current='grade1-practice-'+crypto.randomUUID();
  setBusy(true);setError('');setNotice('');
  try{
   const response=await api('/attempts','POST',{unitId:lesson.id,
    idempotencyKey:retryKey.current,answers:lesson.questions.map(q=>answers[q.id])}) as Result;
   setResult(response);setNotice('Your thinking is saved. Read the explanation for each question.');
   await refresh();
  }catch(e){setError(e instanceof Error?e.message:'Could not save your answers. You can safely retry.');}
  finally{setBusy(false);}
 }
 const subject=catalogue?.catalogue.subjects.find(s=>s.id===activeSubject);
 const canAccess=catalogue?.access==='pilot_or_entitled';
 return <section className="vg1">
  <header className="vg1-header">
   <div><span className="vg1-eyebrow"><Sparkles size={16}/> VAYENTRA ONE · FOUNDATION YEARS</span>
    <h2>Class 1. <em>Big beginnings.</em></h2>
    <p>Learn through stories, pictures, questions and play. Explore your school subjects alongside Vayentra's own AI Thinking and Money Skills.</p></div>
   <div className="vg1-grade-stamp"><GraduationCap size={27}/><strong>01</strong><small>CLASS ONE</small></div>
  </header>
  {loading&&<p role="status" className="vg1-system">Loading your Class 1 subjects…</p>}
  {error&&<p className="vg1-alert" role="alert">{error}</p>}
  {catalogue&&!loading&&<div className="vg1-meta"><span><ShieldCheck size={16}/> {catalogue.learner.board==='STATE'?'Karnataka State':'CBSE'} · {catalogue.catalogue.edition}</span><span>{catalogue.access==='locked'?'Content access pending':'Approved learning access'}</span></div>}
  {catalogue&&lesson?<article className="vg1-lesson">
    <button type="button" className="vg1-minibutton" onClick={closeLesson}><ArrowLeft size={16}/> Back to subjects</button>
    <div className="vg1-lesson-title"><span>{lesson.subject} · {lesson.chapter}</span><h3>{lesson.title}</h3><p><Target size={18}/>{lesson.objective}</p></div>
    {lesson.pictureScene&&<OneGrade1MathsScene scene={lesson.pictureScene} title={lesson.title}/>}
    {lesson.guidedSteps&&lesson.guidedSteps.length>0&&<section className="vg1m-guided" aria-label="Try these steps">
      <h4>Let's discover together</h4><ol>{lesson.guidedSteps.map((step,i)=><li key={i}><span>{i+1}</span>{step}</li>)}</ol>
    </section>}

    <div className="vg1-story"><div className="vg1m-story-head"><span><BookHeart size={20}/> ORIGINAL VAYENTRA STORY</span>
      {speaking?<button type="button" className="vg1-minibutton" onClick={stopStory}><VolumeX size={16}/> Stop narration</button>:
       <button type="button" className="vg1-minibutton" onClick={speakStory}><Volume2 size={16}/> Read aloud</button>}</div>
      <p>{lesson.story}</p><small>Optional device-generated narration; not a teacher-recorded lesson video. Listen with a trusted adult.</small></div>
    {lesson.guardianGuide&&<div className="vg1m-guardian-note"><ShieldCheck size={18}/><div><strong>Teacher / parent guide</strong><p>{lesson.guardianGuide}</p></div></div>}
    <div className="vg1-activity"><Lightbulb size={21}/><div><strong>Try it together, away from the screen</strong><p>{lesson.homeActivity}</p></div></div>
    <section className="vg1-practice" aria-label="Concept check">
     <div><span>SMALL THINKING CHECK</span><h4>What do you notice?</h4><p>Choose an answer. A mistake helps us learn.</p></div>
     {lesson.questions.map((q,i)=>{
      const answer=result?.feedback.find(a=>a.questionId===q.id);
      return <div className="vg1-question" key={q.id}><h5>{i+1}. {q.prompt}</h5>
       <div className="vg1-options">{q.options.map((choice,j)=><button type="button" key={j} disabled={busy||Boolean(result)}
        className={answers[q.id]===j?'selected':''} aria-pressed={answers[q.id]===j}
        onClick={()=>{setAnswers(prev=>({...prev,[q.id]:j}));retryKey.current=null;}}>
        <b>{String.fromCharCode(65+j)}</b>{choice}
       </button>)}</div>
       {answer&&<div className={'vg1-reason'+(answer.correct?' correct':' revisit')}><strong>{answer.correct?'Well noticed!':'Let's look again'}</strong><p>{answer.reason}</p></div>}
      </div>;
     })}
     {notice&&<p role="status" className="vg1-notice">{notice}</p>}
     {!result?<button type="button" className="vg1-primary" disabled={busy||lesson.questions.some(q=>answers[q.id]===undefined)} onClick={()=>void submit()}>
      {busy?'Saving…':'Check my thinking'} <ArrowRight size={17}/></button>:
      <div className="vg1-result"><strong>{result.correct} of {result.total} correct</strong><p>Every attempt is practice. Learning is more important than a score.</p>
       <button type="button" className="vg1-minibutton" onClick={()=>{setResult(null);setAnswers({});setNotice('');retryKey.current=null;}}>Try again with care</button></div>}
    </section>
   </article>:catalogue&&!loading&&<>
    <div className="vg1-intro">
     <h3>Choose a learning world</h3>
     <p>School textbook chapters are mapped for planning. Original Vayentra enrichment subjects are clearly labelled. Unreviewed lessons stay locked.</p>
    </div>
    <div className="vg1-subjects" aria-label="Class 1 subjects">
     {catalogue.catalogue.subjects.map(s=><button key={s.id} type="button" onClick={()=>setActiveSubject(s.id)}
       aria-pressed={activeSubject===s.id} className={'vg1-subject'+(activeSubject===s.id?' active':'')}>
      <span className="vg1-subject-icon">{subjectIcon(s.name)==='money'?<WalletCards size={23}/>:subjectIcon(s.name)==='ai'?<Sparkles size={23}/>:subjectIcon(s.name)==='math'?<Target size={23}/>:<BookOpen size={23}/>}</span>
      <strong>{s.name.replace('Vayentra Original: ','')}</strong>
      <small>{s.kind==='vayentra_original_enrichment'?'Vayentra original enrichment':s.book}</small>
      <span className="vg1-count">{s.approvedLessons} published · {s.plannedChapters} mapped</span>
     </button>)}
    </div>
    {subject&&<article className="vg1-chapters">
     <header><div><span>{subject.kind==='vayentra_original_enrichment'?'VAYENTRA ORIGINAL PROGRAMME':'BOARD CURRICULUM'}</span>
       <h3>{subject.name.replace('Vayentra Original: ','')}</h3><p>{subject.book}</p></div>
       <span className="vg1-verified">{subject.reviewStatus==='reviewed'?'Reviewed':'Mapping in progress'}</span></header>
     {subject.chapters.length?subject.chapters.map(ch=><div className="vg1-chapter" key={ch.id}>
      <div className="vg1-chapter-title"><span>{String(ch.number).padStart(2,'0')}</span>
       <div><strong>{ch.title}</strong><small>{ch.lessonAvailability==='approved_lessons_available'?'Approved lessons available':'Original lessons being prepared or reviewed'}</small></div></div>
      {ch.units.length?ch.units.map(unit=><button key={unit.id} type="button" className="vg1-open"
       onClick={()=>void openLesson(unit.id)} disabled={!canAccess||loadingLesson}>
       {canAccess?'Open learning activity':'Access pending'} <ChevronDown size={16}/>
      </button>):<span className="vg1-lock"><LockKeyhole size={14}/> Planned</span>}
     </div>):<div className="vg1-pending"><LockKeyhole size={25}/><p>Chapter titles for this school's Karnataka textbook edition need academic verification. No fabricated chapters will be shown.</p></div>}
    </article>}
    <p className="vg1-footer"><ShieldCheck size={17}/> For young children, please learn with a trusted adult. AI lessons do not include open chatbots, personal-data collection or financial transactions.</p>
   </>}
 </section>;
};