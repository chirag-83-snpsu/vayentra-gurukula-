import React,{useCallback,useEffect,useState} from 'react';
import {BookOpen,Check,ClipboardCheck,RefreshCcw,ShieldCheck} from 'lucide-react';
import {useApp} from '../context/AppContext';

type Track={id:string;board:string;grade:number;editionYear:string;status:string;publisherReference:string};
type Concept={id:string;position:number;title:string;status:string;hasExplanation:boolean};
type Chapter={id:string;number:number;title:string;edition:string;status:string;concepts:Concept[]};
type Subject={id:string;title:string;status:string;chapters:Chapter[]};
type Tree={track:Track;subjects:Subject[]};

export const OneCurriculumStudio:React.FC=()=>{
 const {authToken}=useApp();
 const [grade,setGrade]=useState(7);
 const [board,setBoard]=useState<'CBSE'|'STATE'>('CBSE');
 const [tracks,setTracks]=useState<Track[]>([]);
 const [trackId,setTrackId]=useState('');
 const [tree,setTree]=useState<Tree|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [reviewRef,setReviewRef]=useState('');
 const [subjectTitle,setSubjectTitle]=useState('');
 const [subjectId,setSubjectId]=useState('');
 const [chapterTitle,setChapterTitle]=useState('');
 const [chapterNumber,setChapterNumber]=useState('1');
 const [edition,setEdition]=useState('2026-27');
 const [chapterId,setChapterId]=useState('');
 const [conceptTitle,setConceptTitle]=useState('');
 const [conceptPosition,setConceptPosition]=useState('1');
 const [explanation,setExplanation]=useState('');
 const [misconception,setMisconception]=useState('');
 const [rights,setRights]=useState(false);
 async function api(url:string,method:'GET'|'POST'='GET',data?:unknown){
  if(!authToken)throw Error('Administrator login required.');
  const resp=await fetch(url,{method,headers:{Authorization:'Bearer '+authToken,'Content-Type':'application/json'},
   body:data?JSON.stringify(data):undefined});
  const body=await resp.json().catch(()=>({}));
  if(!resp.ok)throw Error(body.message||body.code||'Curriculum request failed.');
  return body;
 }
 const loadTracks=useCallback(async()=>{
  const data=await api('/api/v1/journey/catalogue?board='+board+'&grade='+grade);
  setTracks(data.tracks||[]);
  const chosen=(data.tracks||[])[0];
  setTrackId(chosen?.id||'');setTree(null);
 },[board,grade,authToken]);
 useEffect(()=>{
  setError('');void loadTracks().catch(e=>setError(String(e.message||e)));
 },[loadTracks]);
 const refresh=useCallback(async()=>{
  if(!trackId){setTree(null);return;}
  setBusy(true);setError('');
  try{setTree(await api('/api/v1/one-content/admin/tracks/'+encodeURIComponent(trackId)+'/map'));}
  catch(e){setError(e instanceof Error?e.message:'Could not load curriculum.');}
  finally{setBusy(false);}
 },[trackId,authToken]);
 useEffect(()=>{void refresh();},[refresh]);
 const action=async(url:string,data:unknown,success:string)=>{
  setError('');setNotice('');setBusy(true);
  try{await api('/api/v1/one-content/admin'+url,'POST',data);setNotice(success);
   setTree(await api('/api/v1/one-content/admin/tracks/'+encodeURIComponent(trackId)+'/map'));
  }catch(e){setError(e instanceof Error?e.message:'Action failed.');}
  finally{setBusy(false);}
 };
 const reviewData={academicReviewReference:reviewRef};
 return <section className="b" style={{display:'flex',flexDirection:'column',gap:17}}>
  <div><h2 className="h2"><BookOpen size={23}/> Vayentra ONE — Curriculum Studio</h2>
   <p className="t-muted">Create genuine class-wise curriculum maps. Every subject, chapter and original concept must be reviewed before publication.</p></div>
  <div className="b" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
   <div><label htmlFor="one-c-board">School board</label><select id="one-c-board" value={board} onChange={e=>setBoard(e.target.value as 'CBSE'|'STATE')}><option value="CBSE">CBSE</option><option value="STATE">Karnataka State Board</option></select></div>
   <div><label htmlFor="one-c-grade">Class</label><select id="one-c-grade" value={grade} onChange={e=>setGrade(Number(e.target.value))}>{Array.from({length:10},(_,i)=>i+1).map(g=><option key={g} value={g}>Class {g}</option>)}</select></div>
   <div><label htmlFor="one-c-edition">Curriculum edition</label><select id="one-c-edition" value={trackId} onChange={e=>{setTrackId(e.target.value);setTree(null)}}>{tracks.map(t=><option key={t.id} value={t.id}>{t.editionYear} · {t.status}</option>)}</select></div>
  </div>
  {error&&<div role="alert" style={{color:'var(--color-error)'}}>{error}</div>}
  {notice&&<div role="status">{notice}</div>}
  {tree&&<div className="b" style={{background:'var(--color-paper-subtle)',display:'grid',gap:13}}>
   <strong>{tree.track.publisherReference}</strong>
   <span className="t-muted">Edition {tree.track.editionYear} · Status: {tree.track.status} · {tree.subjects.length} mapped subject(s)</span>
   <label htmlFor="one-c-review">Academic review / source verification ticket (no private identity numbers)</label>
   <input id="one-c-review" value={reviewRef} maxLength={120} onChange={e=>setReviewRef(e.target.value)} placeholder="CURRICULUM-REVIEW-2026-..."/>
   {tree.track.status!=='verified'&&<button type="button" className="btn btn-teal" disabled={busy||reviewRef.length<6}
    onClick={()=>void action('/tracks/'+trackId+'/verify',{editorialReference:reviewRef},'Official source comparison recorded.')}>
    <ShieldCheck size={16}/> Verify source/edition after actual review</button>}
  </div>}
  {tree&&<div className="b" style={{display:'grid',gap:10}}>
   <h3 className="h3">1. Map subjects</h3>
   <div style={{display:'flex',flexWrap:'wrap',gap:9,alignItems:'end'}}>
    <div style={{flex:'1 1 200px'}}><label htmlFor="one-c-subject">Subject name</label><input id="one-c-subject" value={subjectTitle} onChange={e=>setSubjectTitle(e.target.value)} placeholder="Mathematics"/></div>
    <button className="btn btn-teal" disabled={busy||subjectTitle.length<2} onClick={()=>void action('/tracks/'+trackId+'/subjects',{title:subjectTitle},'Draft subject created.')}>Add draft subject</button>
   </div>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{tree.subjects.map(s=><button key={s.id} type="button" className={subjectId===s.id?'btn btn-teal':'ghost'} onClick={()=>{setSubjectId(s.id);setChapterId('')}}>{s.title} · {s.status}</button>)}</div>
   {tree.subjects.find(s=>s.id===subjectId)?.status==='draft'&&<button type="button" className="ghost" disabled={busy||reviewRef.length<6} onClick={()=>void action('/subjects/'+subjectId+'/approve',reviewData,'Subject academic review recorded.')}>Approve selected subject <Check size={15}/></button>}
  </div>}
  {tree&&subjectId&&<div className="b" style={{display:'grid',gap:10}}>
   <h3 className="h3">2. Map textbook chapters</h3>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:9}}>
    <div><label htmlFor="one-ch-num">Chapter number</label><input id="one-ch-num" type="number" min={1} max={200} value={chapterNumber} onChange={e=>setChapterNumber(e.target.value)}/></div>
    <div><label htmlFor="one-ch-title">Exact chapter title</label><input id="one-ch-title" value={chapterTitle} onChange={e=>setChapterTitle(e.target.value)}/></div>
    <div><label htmlFor="one-ch-edition">Textbook edition</label><input id="one-ch-edition" value={edition} onChange={e=>setEdition(e.target.value)}/></div>
   </div>
   <button type="button" className="btn btn-teal" disabled={busy||chapterTitle.length<2} onClick={()=>void action('/subjects/'+subjectId+'/chapters',{number:Number(chapterNumber),title:chapterTitle,textbookEdition:edition},'Draft chapter added.')}>Add chapter as draft</button>
   {(tree.subjects.find(s=>s.id===subjectId)?.chapters||[]).map(ch=><div key={ch.id} style={{display:'flex',gap:9,flexWrap:'wrap',alignItems:'center'}}>
    <button className={chapterId===ch.id?'btn btn-teal':'ghost'} type="button" onClick={()=>setChapterId(ch.id)}>Chapter {ch.number}: {ch.title} · {ch.status}</button>
    {ch.status==='draft'&&<button type="button" className="ghost" disabled={busy||reviewRef.length<6} onClick={()=>void action('/chapters/'+ch.id+'/approve',reviewData,'Chapter academic review recorded.')}>Approve</button>}
   </div>)}
  </div>}
  {tree&&chapterId&&<div className="b" style={{display:'grid',gap:10}}>
   <h3 className="h3">3. Build original concept explanations</h3>
   <label htmlFor="one-co-title">Concept title</label><input id="one-co-title" value={conceptTitle} onChange={e=>setConceptTitle(e.target.value)}/>
   <label htmlFor="one-co-order">Concept sequence in chapter</label><input id="one-co-order" type="number" min={1} max={200} value={conceptPosition} onChange={e=>setConceptPosition(e.target.value)}/>
   <label htmlFor="one-co-explain">Original explanation from first principles</label><textarea id="one-co-explain" rows={6} value={explanation} onChange={e=>setExplanation(e.target.value)} maxLength={10000} placeholder="What it is, why it works, an example and a misconception."/>
   <label htmlFor="one-co-mistake">Common misconception</label><textarea id="one-co-mistake" rows={2} value={misconception} onChange={e=>setMisconception(e.target.value)} maxLength={1000}/>
   <button type="button" className="btn btn-teal" disabled={busy||conceptTitle.length<2||explanation.length<120}
    onClick={()=>void action('/chapters/'+chapterId+'/concepts',{title:conceptTitle,position:Number(conceptPosition),explanation,misconceptionTip:misconception},'Concept saved as a private draft.')}>Save original concept draft</button>
   {tree.subjects.flatMap(s=>s.chapters).find(ch=>ch.id===chapterId)?.concepts.map(c=><div key={c.id} className="b" style={{display:'grid',gap:8}}>
    <strong>{c.position}. {c.title}</strong><p className="t-muted">Status: {c.status} · Original explanation: {c.hasExplanation?'present':'missing'}</p>
    {c.status==='draft'&&<button className="ghost" disabled={busy||!c.hasExplanation} onClick={()=>void action('/concepts/'+c.id+'/request-review',{},'Sent for academic review.')}>Request teacher review</button>}
    {c.status==='teacher_review'&&<div style={{display:'grid',gap:8}}>
     <label style={{display:'flex',gap:8,alignItems:'start'}}><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/> I confirm this lesson is original or fully licensed, with the academic reviewer approval recorded.</label>
     <button type="button" className="btn btn-teal" disabled={busy||!rights||reviewRef.length<6}
      onClick={()=>void action('/concepts/'+c.id+'/publish',{academicReviewReference:reviewRef,originalContentRightsConfirmed:true},'Teacher-reviewed original concept published.')}><ClipboardCheck size={15}/> Publish reviewed concept</button>
    </div>}
   </div>)}
  </div>}
  <p className="t-tiny">Use official sources only for edition mapping; do not copy and host NCERT textbooks. All unpublished content remains invisible to student curriculum outlines.</p>
 </section>;
};