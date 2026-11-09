import React,{useEffect,useMemo,useState} from 'react';
import {BookOpen,ExternalLink,Film,GraduationCap,PlayCircle,ShieldCheck} from 'lucide-react';
import {useApp} from '../context/AppContext';

type SubjectSource={id:string;grade:number;subject:string;publisher:string;source_portal:string;source_status:string;curriculum_status:string;academic_year:string};
type LibraryTopic={
 id:string;grade:number;subject:string;chapterTitle:string;topicTitle:string;conceptDescription:string;
 academicYear:string;video:{status:'ready'|'not_available';url:string|null;mediaType:string|null;durationSeconds:number|null;provenance:string};
};
type Catalog={grades:number[];subjectsByGrade:Record<number,string[]>;subjects:SubjectSource[];disclaimer:string};
type TopicResult={grade:number;subject:string;topics:LibraryTopic[];contentStatus:string};
export const CbseNcertLibrary:React.FC=()=>{
 const {activeChild}=useApp();
 const [catalog,setCatalog]=useState<Catalog|null>(null);
 const [grade,setGrade]=useState(Math.max(1,Math.min(10,activeChild.grade||7)));
 const [subject,setSubject]=useState('Mathematics');
 const [topics,setTopics]=useState<LibraryTopic[]>([]);
 const [loading,setLoading]=useState(true);
 const [topicLoading,setTopicLoading]=useState(false);
 const [error,setError]=useState('');
 const [topicError,setTopicError]=useState('');
 const [search,setSearch]=useState('');
 const [activeTopic,setActiveTopic]=useState<string|null>(null);
 useEffect(()=>{
  const ctrl=new AbortController();setLoading(true);setError('');
  fetch('/api/v1/cbse/catalogue',{signal:ctrl.signal}).then(async resp=>{
   if(!resp.ok)throw new Error('CBSE catalogue unavailable ('+resp.status+')');
   return resp.json();
  }).then((data:Catalog)=>{if(!ctrl.signal.aborted)setCatalog(data);})
   .catch(e=>{if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:'Unable to load NCERT references.');})
   .finally(()=>{if(!ctrl.signal.aborted)setLoading(false);});
  return()=>ctrl.abort();
 },[]);
 const gradeSubjects=catalog?.subjectsByGrade?.[grade]||[];
 useEffect(()=>{
  if(gradeSubjects.length&& !gradeSubjects.includes(subject))setSubject(gradeSubjects[0]);
 },[gradeSubjects.join('|'),subject]);
 useEffect(()=>{
  if(!catalog||!gradeSubjects.includes(subject)){setTopics([]);return;}
  const ctrl=new AbortController();
  setTopicLoading(true);setTopicError('');
  const query=new URLSearchParams({grade:String(grade),subject});
  fetch('/api/v1/cbse/topics?'+query,{signal:ctrl.signal})
   .then(async response=>{if(!response.ok)throw new Error('Could not load topic list ('+response.status+')');return response.json();})
   .then((data:TopicResult)=>{if(!ctrl.signal.aborted){setTopics(data.topics||[]);setActiveTopic(null);}})
   .catch(e=>{if(!ctrl.signal.aborted){setTopicError(e instanceof Error?e.message:'Could not load topics.');setTopics([]);}})
   .finally(()=>{if(!ctrl.signal.aborted)setTopicLoading(false);});
  return()=>ctrl.abort();
 },[catalog,grade,subject,gradeSubjects.join('|')]);
 const source=catalog?.subjects.find(s=>s.grade===grade&&s.subject===subject);
 const filtered=useMemo(()=>topics.filter(t=>(t.chapterTitle+' '+t.topicTitle).toLowerCase().includes(search.toLowerCase())),[topics,search]);
 const selected=filtered.find(t=>t.id===activeTopic)||null;
 return <section className="vg-ncert-library" aria-labelledby="vg-ncert-title">
  <header className="b vg-ncert-hero">
   <div><div className="vg-ncert-eyebrow"><GraduationCap size={18}/> CBSE · CLASSES 1–10</div>
    <h2 id="vg-ncert-title">NCERT Reference & Video Learning Library</h2>
    <p>Explore subjects, teacher-reviewed topics and original Vayentra video lessons as they become available. NCERT textbooks remain on the publisher's official website.</p>
   </div>
   <div className="vg-ncert-hero-icon"><BookOpen size={44}/></div>
  </header>
  {loading&&<div className="b" role="status">Loading the CBSE class and subject catalogue…</div>}
  {error&&<div className="b" role="alert">{error}</div>}
  {catalog&&<>
   <div className="b vg-ncert-controls">
    <label>Choose class
     <select value={grade} onChange={e=>{setGrade(Number(e.target.value));setSearch('');}} aria-label="Choose CBSE class">
      {catalog.grades.map(g=><option value={g} key={g}>Class {g}</option>)}
     </select>
    </label>
    <label>Choose subject
     <select value={subject} onChange={e=>{setSubject(e.target.value);setSearch('');}} aria-label="Choose subject">
      {gradeSubjects.map(name=><option value={name} key={name}>{name}</option>)}
     </select>
    </label>
    <label>Find a chapter or topic
     <input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reviewed lessons"/>
    </label>
   </div>
   <div className="b vg-ncert-reference">
    <div className="vg-ncert-source-icon"><ShieldCheck size={22}/></div>
    <div>
     <strong>Official source reference: National Council of Educational Research and Training (NCERT)</strong>
     <p>Class {grade} · {subject} · Academic year {source?.academic_year||'2026–27'}</p>
     <p>Publisher catalogue: <strong>ncert.nic.in/textbook.php</strong> · Additional official educational resources: ePathshala and DIKSHA</p>
     <p className="t-tiny">Source reference only. Textbook/chapter mapping is pending academic verification. Direct textbook links will be enabled only after any necessary NCERT permission. Vayentra does not host NCERT books or claim NCERT endorsement.</p>
    </div>
   </div>
   <div className="vg-ncert-content">
    <div className="vg-ncert-topic-panel">
     <div className="vg-ncert-panel-title"><h3>Chapters & topics</h3><span className="chip chip-navy">{filtered.length} published</span></div>
     {topicLoading&&<p role="status">Loading verified topics…</p>}
     {topicError&&<p role="alert">{topicError}</p>}
     {!topicLoading&&!topicError&&filtered.length===0&&<div className="vg-ncert-empty">
      <Film size={28}/><strong>No teacher-published lessons for this selection yet</strong>
      <p>The class and subject NCERT reference is registered. Our faculty must verify the chapter list and publish original lesson videos before lessons are displayed here.</p>
     </div>}
     {filtered.map(t=><button className={'vg-ncert-topic'+(selected?.id===t.id?' is-active':'')}
      key={t.id} type="button" onClick={()=>setActiveTopic(t.id)}>
      <span><strong>{t.topicTitle}</strong><small>{t.chapterTitle}</small></span>
      <span className={t.video.status==='ready'?'vg-video-ready':'vg-video-pending'}>{t.video.status==='ready'?'Video ready':'In production'}</span>
     </button>)}
    </div>
    <div className="vg-ncert-video-panel">
     {selected?<><div className="vg-ncert-panel-title"><h3>{selected.topicTitle}</h3><span className="chip">{subject}</span></div>
      <p className="t-muted">{selected.conceptDescription||'Teacher-reviewed topic'}</p>
      {selected.video.status==='ready'&&selected.video.url
       ?<video controls playsInline preload="metadata" className="vg-ncert-player" src={selected.video.url} aria-label={'Video lesson: '+selected.topicTitle}>
         Your browser does not support this video playback.
        </video>
       :<div className="vg-ncert-no-video"><PlayCircle size={42}/><strong>Original AI-assisted video not published</strong><p>Teacher approval and a verified video asset are required. Continue learning through class teaching and the official textbook.</p></div>}
      <div className="t-tiny" style={{marginTop:12}}>Vayentra-created content, independently reviewed by faculty. NCERT is a reference publisher, not a video production partner.</div>
     </>:<div className="vg-ncert-no-video"><Film size={42}/><strong>Select a published topic</strong><p>Available video lessons appear here after teacher review and media approval.</p></div>}
    </div>
   </div>
   <div className="b vg-ncert-footer">
    <ExternalLink size={18}/><p><strong>How to consult NCERT books:</strong> Visit the official NCERT textbook portal directly, choose your class, subject and book, and locate the relevant chapter. Our institute will add verified chapter references once permission and academic mapping are complete.</p>
   </div>
  </>}
 </section>;
};