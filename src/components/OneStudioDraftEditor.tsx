import React,{useEffect,useState} from 'react';
import {BookOpen,CheckCircle2,FilePenLine} from 'lucide-react';
import {useApp} from '../context/AppContext';
import '../styles/one-concept-studio.css';
type DraftQuestion={id:string;prompt:string;options:string[];correctIndex:number;rationale:string;misconceptionTag:string};
type DraftUnit={id:string;title:string;objective:string;bridge:string;explanation:string;
 steps:string[];workedExample:string;misconception:string;activity:string;visual:string;revisionNo:number;
 questions:DraftQuestion[]};
export const OneStudioDraftEditor:React.FC<{unit:DraftUnit;onSaved:()=>Promise<void>}>=({unit,onSaved})=>{
 const {authToken}=useApp();
 const [title,setTitle]=useState(unit.title);
 const [objective,setObjective]=useState(unit.objective);
 const [bridge,setBridge]=useState(unit.bridge);
 const [explanation,setExplanation]=useState(unit.explanation);
 const [steps,setSteps]=useState(unit.steps.join('\n'));
 const [example,setExample]=useState(unit.workedExample);
 const [misconception,setMisconception]=useState(unit.misconception);
 const [activity,setActivity]=useState(unit.activity);
 const [visual,setVisual]=useState(unit.visual);
 const [qId,setQId]=useState(unit.questions[0]?.id||'');
 const [prompt,setPrompt]=useState('');
 const [options,setOptions]=useState<string[]>(['','','','']);
 const [right,setRight]=useState(0);
 const [rationale,setRationale]=useState('');
 const [tag,setTag]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 useEffect(()=>{
  setTitle(unit.title);setObjective(unit.objective);setBridge(unit.bridge);
  setExplanation(unit.explanation);setSteps(unit.steps.join('\n'));
  setExample(unit.workedExample);setMisconception(unit.misconception);
  setActivity(unit.activity);setVisual(unit.visual);setMessage('');setError('');
  setQId(old=>unit.questions.some(q=>q.id===old)?old:(unit.questions[0]?.id||''));
 },[unit.id,unit.revisionNo]);
 const q=unit.questions.find(q=>q.id===qId);
 useEffect(()=>{
  if(!q)return;
  setPrompt(q.prompt);setOptions([...q.options]);setRight(q.correctIndex);
  setRationale(q.rationale);setTag(q.misconceptionTag);
 },[qId,unit.revisionNo]);
 async function patch(path:string,payload:unknown,label:string){
  if(!authToken)return;
  setBusy(true);setMessage('');setError('');
  try{
   const response=await fetch('/api/v1/one-studio'+path,{method:'PATCH',headers:{
    Authorization:'Bearer '+authToken,'Content-Type':'application/json'
   },body:JSON.stringify(payload)});
   const json=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(json.message||json.code||'The draft was not saved.');
   setMessage(label+' saved. A separate reviewer must approve the revision.');
   await onSaved();
  }catch(e){setError(e instanceof Error?e.message:'Unable to save draft.');}
  finally{setBusy(false);}
 }
 return <div className="vgs-editor-unit">
  <h4><FilePenLine size={18}/> Edit original content — revision {unit.revisionNo}</h4>
  <p>Editing is available only before first publication. Once published, a new content version must be created rather than silently changing historic question keys.</p>
  <div className="vgs-editor-fields">
   <label>Concept title<input value={title} maxLength={140} onChange={e=>setTitle(e.target.value)}/></label>
   <label>Learning objective<textarea rows={2} value={objective} onChange={e=>setObjective(e.target.value)}/></label>
   <label>Prior-knowledge bridge<textarea rows={2} value={bridge} onChange={e=>setBridge(e.target.value)}/></label>
   <label>Original explanation<textarea rows={8} value={explanation} onChange={e=>setExplanation(e.target.value)}/></label>
   <label>Explanation steps, one per line<textarea rows={5} value={steps} onChange={e=>setSteps(e.target.value)}/></label>
   <label>Worked example<textarea rows={2} value={example} onChange={e=>setExample(e.target.value)}/></label>
   <label>Common misconception<textarea rows={2} value={misconception} onChange={e=>setMisconception(e.target.value)}/></label>
   <label>Offline or family activity<textarea rows={2} value={activity} onChange={e=>setActivity(e.target.value)}/></label>
   <label>Diagram type<select value={visual} onChange={e=>setVisual(e.target.value)}>{['solids','cube','families','net','angles','circle'].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
  </div>
  <button type="button" className="vgs-primary" disabled={busy||explanation.trim().length<120}
   onClick={()=>void patch('/editor/units/'+unit.id,{
    expectedRevisionNo:unit.revisionNo,title,objective,bridge,explanation,
    steps:steps.split('\n').map(s=>s.trim()).filter(Boolean),
    workedExample:example,misconception,activity,visual
   },'Original lesson')}><BookOpen size={17}/> Save draft lesson</button>
  <div className="vgs-editor-fields">
   <h4>Repair a question before teacher review</h4>
   <label>Select question<select value={qId} onChange={e=>setQId(e.target.value)}>{unit.questions.map(q=><option key={q.id} value={q.id}>{q.prompt}</option>)}</select></label>
   <label>Question prompt<textarea rows={2} value={prompt} onChange={e=>setPrompt(e.target.value)}/></label>
   {options.map((option,i)=><label key={i}>Choice {String.fromCharCode(65+i)}<input value={option} onChange={e=>setOptions(prev=>prev.map((v,j)=>j===i?e.target.value:v))}/></label>)}
   <label>Correct choice<select value={right} onChange={e=>setRight(Number(e.target.value))}>{options.map((_,i)=><option key={i} value={i}>{String.fromCharCode(65+i)}</option>)}</select></label>
   <label>Why this is correct<textarea rows={3} value={rationale} onChange={e=>setRationale(e.target.value)}/></label>
   <label>Misconception tag<input value={tag} onChange={e=>setTag(e.target.value)}/></label>
  </div>
  <button type="button" className="vgs-primary" disabled={busy||!qId||rationale.trim().length<20}
   onClick={()=>void patch('/editor/questions/'+qId,{
    prompt,options,correctIndex:right,rationale,misconceptionTag:tag
   },'Original question')}><CheckCircle2 size={17}/> Save revised question</button>
  {error&&<p role="alert" className="vgs-alert">{error}</p>}
  {message&&<p role="status" className="vgs-notice">{message}</p>}
 </div>;
};