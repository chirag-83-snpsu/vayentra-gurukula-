import React,{useCallback,useEffect,useState} from 'react';
import {BookOpenCheck,Clapperboard,Copy,PlusCircle,Video} from 'lucide-react';
import {useApp} from '../context/AppContext';
import {CbseLessonQuestionReview} from './CbseLessonQuestionReview';
type Source={id:string;grade:number;subject:string;academic_year:string};
type Catalogue={grades:number[];subjectsByGrade:Record<number,string[]>;subjects:Source[]};
type Item={id:string;topicTitle:string;chapterTitle:string;status:string;productionStatus:string;scriptOutline:string;video:{status:string}};
const videoPrompt=(grade:number,subject:string,chapter:string,topic:string)=>
 'Create an ORIGINAL educational video storyboard for Vayentra Gurukula, Class '+grade+' CBSE '+subject+
 ', chapter "'+chapter+'", topic "'+topic+'". 3–5 minutes, English voiceover and captions. '+
 'Use five scenes: curiosity hook, concrete intuition, worked example, common misconception, and practice challenge. '+
 'Do not copy NCERT textbook prose, images, illustrations, figures, or videos. Do not imply NCERT sponsorship. '+
 'Include an original teacher-readable script and age-appropriate visual scene directions. '+
 'Flag every factual claim for faculty review. Do not publish before a qualified subject teacher verifies it.';
const url='/api/v1/cbse';
export const CbseVideoStudio:React.FC=()=>{
 const {authToken}=useApp();const token=authToken||'';
 const [catalogue,setCatalogue]=useState<Catalogue|null>(null);
 const [grade,setGrade]=useState(7);const [subject,setSubject]=useState('Mathematics');
 const [topics,setTopics]=useState<Item[]>([]);const [selected,setSelected]=useState('');
 const [chapter,setChapter]=useState('');const [topicName,setTopicName]=useState('');const [description,setDescription]=useState('');
 const [script,setScript]=useState('');const [asset,setAsset]=useState('');const [duration,setDuration]=useState('180');
 const [message,setMessage]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const current=catalogue?.subjects.find(s=>s.grade===grade&&s.subject===subject);
 const choices=catalogue?.subjectsByGrade?.[grade]||[];
 const api=useCallback(async(path:string,options:RequestInit={})=>{
  const res=await fetch(url+path,{...options,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,...options.headers}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.message||data.code||('Request failed ('+res.status+')'));
  return data;
 },[token]);
 useEffect(()=>{
  if(!token){setError('Teacher or administrator login is required.');return;}
  let ignore=false;
  api('/catalogue').then((data:Catalogue)=>{if(!ignore)setCatalogue(data);})
   .catch(e=>{if(!ignore)setError(e.message||'Catalogue unavailable.');});
  return()=>{ignore=true};
 },[api,token]);
 useEffect(()=>{
  if(choices.length&&!choices.includes(subject))setSubject(choices[0]);
 },[choices.join('|'),subject]);
 const reload=useCallback(async()=>{
  if(!current){setTopics([]);return;}
  const q=new URLSearchParams({grade:String(grade),subject});
  const data=await api('/teacher/topics?'+q);
  setTopics(data.topics||[]);
 },[api,grade,subject,current?.id]);
 useEffect(()=>{let live=true;reload().catch(e=>{if(live){setTopics([]);setError(e.message||'Assigned teacher access required.');}});return()=>{live=false}},[reload]);
 const selectedTopic=topics.find(t=>t.id===selected);
 useEffect(()=>{setScript(selectedTopic?.scriptOutline||'');setMessage('');},[selected,selectedTopic?.scriptOutline]);
 async function run(fn:()=>Promise<void>){
  setBusy(true);setError('');setMessage('');
  try{await fn();await reload();}catch(e){setError(e instanceof Error?e.message:'Action failed.');}finally{setBusy(false);}
 }
 async function create(){
  if(!current)return;
  await run(async()=>{
   const data=await api('/teacher/topics',{method:'POST',body:JSON.stringify({
    sourceId:current.id,chapterTitle:chapter,topicTitle:topicName,conceptDescription:description
   })});
   setMessage('Draft topic saved. Next, prepare and review an original AI video storyboard.');
   setSelected(data.id);setChapter('');setTopicName('');setDescription('');
  });
 }
 async function copyPrompt(){
  const t=selectedTopic;const chapterTitle=t?.chapterTitle||chapter;const topicTitle=t?.topicTitle||topicName;
  const prompt=videoPrompt(grade,subject,chapterTitle,topicTitle);
  try{await navigator.clipboard.writeText(prompt);setMessage('Original video production brief copied for your video creation tool.');}
  catch{setError('Clipboard unavailable. Select and copy the prompt manually.');}
 }
 return <section className="vg-video-studio">
  <div className="b vg-video-studio-heading">
   <div><h2 className="h2"><Clapperboard size={22} style={{verticalAlign:'middle',marginRight:9}}/>CBSE NCERT References & AI Video Studio</h2>
    <p className="t-muted">Manage original topic lessons for Classes 1–10. No video is published without a real asset and educator approval.</p></div>
   <span className="chip chip-navy">Faculty review required</span>
  </div>
  {error&&<div className="b" role="alert" style={{color:'var(--color-error)'}}>{error}</div>}
  {message&&<div className="b" role="status">{message}</div>}
  {catalogue&&<div className="b vg-video-studio-controls">
   <label>CBSE class<select value={grade} onChange={e=>{setGrade(Number(e.target.value));setSelected('');setError('');}}>
    {catalogue.grades.map(g=><option key={g} value={g}>Class {g}</option>)}
   </select></label>
   <label>Subject<select value={subject} onChange={e=>{setSubject(e.target.value);setSelected('');setError('');}}>
    {choices.map(s=><option key={s} value={s}>{s}</option>)}
   </select></label>
  </div>}
  <div className="vg-video-studio-grid">
   <div className="b">
    <h3>Topic authoring</h3>
    <p className="t-muted" style={{margin:'8px 0 15px'}}>Add current textbook topics only after verifying grade, subject, edition, and chapter. Do not paste NCERT copyrighted pages.</p>
    <label>Chapter name<input className="in" value={chapter} onChange={e=>setChapter(e.target.value)} placeholder="Teacher-verified chapter title"/></label>
    <label>Concept or topic<input className="in" value={topicName} onChange={e=>setTopicName(e.target.value)} placeholder="Single teachable concept"/></label>
    <label>Original learning objective<textarea className="in" rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Write the concept in your own words"/></label>
    <button type="button" className="btn btn-teal" disabled={busy||!current||chapter.trim().length<4||topicName.trim().length<4||description.trim().length<10} onClick={()=>void create()}><PlusCircle size={16}/> Save topic draft</button>
    <h3 style={{marginTop:20}}>Topic drafts and published videos</h3>
    {topics.length===0?<p className="t-muted" style={{marginTop:8}}>No teacher-accessible topics found for this class and subject.</p>:
     <div className="vg-video-topic-list">{topics.map(t=><button key={t.id} type="button" className={selected===t.id?'vg-video-selected':''} onClick={()=>setSelected(t.id)}>
      <strong>{t.topicTitle}</strong><small>{t.chapterTitle} · {t.productionStatus==='ready'?'Video ready':t.status}</small>
     </button>)}</div>}
   </div>
   <div className="b">
    <h3><Video size={19} style={{verticalAlign:'middle',marginRight:8}}/>Original AI Video Production</h3>
    {!selectedTopic?<p className="t-muted" style={{marginTop:12}}>Select a topic to prepare its video script and upload its approved original video.</p>:<>
     <p className="t-muted" style={{margin:'10px 0'}}>Selected: <strong>{selectedTopic.topicTitle}</strong> · {selectedTopic.productionStatus}</p>
     <button type="button" className="ghost" onClick={()=>void copyPrompt()}><Copy size={16}/> Copy AI storyboard brief</button>
     <label>Original script and storyboard
      <textarea className="in" rows={9} value={script} onChange={e=>setScript(e.target.value)} placeholder="Write or paste an original, teacher-reviewed video script with learning objective, examples and practice question."/>
     </label>
     <button type="button" className="btn btn-teal" disabled={busy||script.trim().length<60}
      onClick={()=>void run(async()=>{await api('/teacher/topics/'+selectedTopic.id+'/script',{
       method:'PUT',body:JSON.stringify({scriptOutline:script})
      });setMessage('Original video script saved for teacher review.');})}>
      <BookOpenCheck size={16}/> Save script for review
     </button>
     <CbseLessonQuestionReview topicId={selectedTopic.id} token={token}/>
     <hr style={{border:0,borderTop:'1px solid var(--color-border-subtle)',margin:'20px 0'}}/>
     <h3>Publish reviewed video asset</h3>
     <p className="t-muted">Create the video externally using your selected AI video production service. Upload the original file to an approved host, then publish only after playback and accuracy checks.</p>
     <label>Approved MP4/WebM URL<input className="in" value={asset} onChange={e=>setAsset(e.target.value)}
      placeholder="/media/lessons/class7-concept.mp4"/></label>
     <label>Video duration (seconds)<input className="in" type="number" min="10" max="3600" value={duration} onChange={e=>setDuration(e.target.value)}/></label>
     <button type="button" className="btn btn-teal" disabled={busy||!asset||!selectedTopic.scriptOutline||!Number.isInteger(Number(duration))}
      onClick={()=>void run(async()=>{
       if(!window.confirm('Confirm the video is original, fact-checked, curriculum-reviewed, child-appropriate and fully playable?'))return;
       await api('/teacher/topics/'+selectedTopic.id+'/publish',{method:'POST',body:JSON.stringify({
        mediaUrl:asset,mediaType:asset.toLowerCase().split('?')[0].endsWith('.webm')?'webm':'mp4',
        durationSeconds:Number(duration),teacherReviewed:true,originalContentConfirmed:true,sourceChecked:true
       })});setMessage('Original lesson video approved and published to students.');
      })}>
      Publish verified lesson
     </button>
    </>}
   </div>
  </div>
  <div className="b"><p className="t-muted"><strong>Source licensing:</strong> The NCERT portal is listed as a reference, not hosted or directly linked to textbook chapters while permission is pending. Original video files must not contain copied NCERT diagrams or textbook pages without appropriate rights.</p></div>
 </section>;
};