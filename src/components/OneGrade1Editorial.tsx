import React,{useCallback,useEffect,useState} from 'react';
import {BookOpen,CheckCircle2,ClipboardCheck,GraduationCap,RefreshCw,ShieldCheck,Sparkles} from 'lucide-react';
import {useApp} from '../context/AppContext';
import '../styles/one-grade1.css';
type BriefUnit={id:string;title:string;status:string};
type Chapter={id:string;number:number;title:string;reviewStatus:string;units:BriefUnit[]};
type Subject={id:string;name:string;kind:string;book:string;sourceStatus:string;reviewStatus:string;chapters:Chapter[];approvedLessons:number};
type Curriculum={board:string;grade:number;edition:string;trackStatus:string;trackId:string;subjects:Subject[]};
type OriginalUnit={id:string;title:string;subject:string;chapter:string;objective:string;story:string;homeActivity:string;
 questions:Array<{id:string;position:number;prompt:string;options:string[];correctIndex:number;reason:string}>;
 status:string;reviewerId:string|null;reviewReference:string|null;chapterReview:string;subjectReview:string;trackStatus:string};
export const OneGrade1Editorial:React.FC=()=>{
 const {authToken,currentUser}=useApp();
 const [board,setBoard]=useState<'CBSE'|'STATE'>('CBSE');
 const [curriculum,setCurriculum]=useState<Curriculum|null>(null);
 const [units,setUnits]=useState<OriginalUnit[]>([]);
 const [selectedId,setSelectedId]=useState('');
 const [reviewRef,setReviewRef]=useState('');
 const [rightsRef,setRightsRef]=useState('');
 const [decision,setDecision]=useState<'approved'|'changes_requested'>('approved');
 const [confirmed,setConfirmed]=useState(false);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const role=currentUser?.role||'';
 const api=useCallback(async(path:string,method:'GET'|'POST'='GET',body?:unknown)=>{
  if(!authToken)throw Error('Staff login required.');
  const response=await fetch('/api/v1/grade1'+path,{method,headers:{
   Authorization:'Bearer '+authToken,'Content-Type':'application/json'
  },body:body?JSON.stringify(body):undefined});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.message||data.code||'Could not complete the review.');
  return data;
 },[authToken]);
 const load=useCallback(async()=>{
  setLoading(true);setError('');
  try{const data=await api('/editor/map?board='+board);
   setCurriculum(data.curriculum);setUnits(data.units||[]);
   setSelectedId(id=>(data.units||[]).some((u:OriginalUnit)=>u.id===id)?id:(data.units?.[0]?.id||''));
  }catch(e){setError(e instanceof Error?e.message:'Unable to load the Class 1 curriculum map.');}
  finally{setLoading(false);}
 },[api,board]);
 useEffect(()=>{void load();},[load]);
 async function action(path:string,body:unknown,success:string){
  setBusy(true);setError('');setNotice('');
  try{await api(path,'POST',body);setNotice(success);await load();}
  catch(e){setError(e instanceof Error?e.message:'The operation could not be saved.');}
  finally{setBusy(false);}
 }
 const unit=units.find(u=>u.id===selectedId);
 return <section className="vg1">
  <header className="vg1-header"><div><span className="vg1-eyebrow"><Sparkles size={16}/> VAYENTRA ONE · CURRICULUM FACTORY</span>
   <h2>Start at <em>Class 1.</em></h2><p>Board-accurate school mapping, original AI & Money Skills enrichment, and human-reviewed micro-lessons. Build Class 1 fully before opening Class 2.</p></div>
   <div className="vg1-grade-stamp"><GraduationCap size={25}/><strong>01</strong><small>ACADEMIC ROADMAP</small></div></header>
  <div className="vg1-editor">
   <div className="vg1-editor-toolbar"><label htmlFor="vg1-editor-board">Curriculum board</label><select id="vg1-editor-board" value={board} onChange={e=>{setBoard(e.target.value as 'CBSE'|'STATE');setSelectedId('');}}>
     <option value="CBSE">CBSE / NCERT</option><option value="STATE">Karnataka State Board</option></select>
    <button className="vg1-minibutton" type="button" disabled={loading||busy} onClick={()=>void load()}><RefreshCw size={16}/> Refresh</button></div>
   {error&&<p role="alert" className="vg1-alert">{error}</p>}
   {notice&&<p role="status" className="vg1-notice">{notice}</p>}
   {loading&&<p role="status">Loading verified chapter-title map and draft lesson index…</p>}
   {curriculum&&!loading&&<>
    <div className="vg1-meta"><span><ShieldCheck size={15}/> {curriculum.board} · {curriculum.edition}</span><span>Track: {curriculum.trackStatus} · Official titles are maps, not published teaching</span></div>
    <div className="vg1-subjects">
     {curriculum.subjects.map(s=><article key={s.id} className="vg1-subject" style={{cursor:'default'}}>
      <span className="vg1-subject-icon"><BookOpen size={22}/></span><strong>{s.name.replace('Vayentra Original: ','')}</strong>
      <small>{s.kind==='vayentra_original_enrichment'?'Original Vayentra enrichment':s.book}</small>
      <span className="vg1-count">{s.chapters.length} mapped chapters · {s.approvedLessons} published</span>
      <small>Academic status: {s.reviewStatus}</small>
     </article>)}
    </div>
    <div className="vg1-editor-unit"><h3>Original lesson review queue</h3>
     <p>There are {units.length} original teaching drafts across {curriculum.subjects.length} subjects in this board. Source chapter titles are not reproduced textbook content. Karnataka chapter lists are intentionally awaiting a medium-specific edition check.</p>
     <label htmlFor="vg1-unit">Select original micro-lesson</label><select id="vg1-unit" value={selectedId} onChange={e=>{setSelectedId(e.target.value);setReviewRef('');setRightsRef('');setConfirmed(false);}}>
      {units.map(u=><option key={u.id} value={u.id}>{u.subject.replace('Vayentra Original: ','')} · {u.title} · {u.status}</option>)}</select>
    </div>
   </>}
   {unit&&<article className="vg1-editor-unit">
    <span className="vg1-status">STATUS: {unit.status} | Track: {unit.trackStatus} | Subject: {unit.subjectReview} | Chapter: {unit.chapterReview}</span>
    <h4>{unit.title}</h4>
    <p><strong>Subject:</strong> {unit.subject} · <strong>Chapter:</strong> {unit.chapter}</p>
    <p><strong>Objective:</strong> {unit.objective}</p>
    <p><strong>Original story:</strong> {unit.story}</p>
    <p><strong>Guardian activity:</strong> {unit.homeActivity}</p>
    {unit.questions.map((q,i)=><div className="vg1-editor-question" key={q.id}><p><strong>Q{i+1}:</strong> {q.prompt}</p>
     <p><strong>Correct answer:</strong> {q.options[q.correctIndex]} — {q.reason}</p>
    </div>)}
    {['teacher','admin'].includes(role)&&unit.status==='draft'&&<div className="vg1-editor-review-actions">
     <label htmlFor="vg1-review-request">Internal original-work / teacher-review case reference</label>
     <input id="vg1-review-request" value={reviewRef} onChange={e=>setReviewRef(e.target.value)} placeholder="TEACHER-REVIEW-CASE-..." maxLength={120}/>
     <button type="button" disabled={busy||reviewRef.trim().length<8} onClick={()=>void action('/editor/units/'+unit.id+'/request-review',{editorialReference:reviewRef},'Sent to independent academic review.')}>
      <ClipboardCheck size={16}/> Submit original lesson for review
     </button>
    </div>}
    {role==='reviewer'&&unit.status==='teacher_review'&&<div className="vg1-editor-review-actions">
     <label htmlFor="vg1-decision">Independent academic decision</label><select id="vg1-decision" value={decision} onChange={e=>setDecision(e.target.value as 'approved'|'changes_requested')}>
      <option value="approved">Approve after reviewing source, language and questions</option><option value="changes_requested">Return for changes</option></select>
     <label htmlFor="vg1-review-ref">Review evidence reference</label>
     <input id="vg1-review-ref" value={reviewRef} onChange={e=>setReviewRef(e.target.value)} placeholder="CLASS1-REVIEW-CASE-..." maxLength={120}/>
     <button type="button" disabled={busy||reviewRef.trim().length<8} onClick={()=>void action('/editor/units/'+unit.id+'/review',{decision,academicReviewReference:reviewRef},'Independent review decision recorded.')}>
      <CheckCircle2 size={16}/> Record academic decision
     </button>
    </div>}
    {role==='admin'&&unit.status==='reviewed'&&<div className="vg1-editor-review-actions">
     <p>Publication also requires verification of the correct 2026–27 board track, subject and chapter through ONE Curriculum Studio. An independent reviewer must have signed off.</p>
     <label htmlFor="vg1-rights">Original-content rights record</label><input id="vg1-rights" value={rightsRef} onChange={e=>setRightsRef(e.target.value)} placeholder="ORIGINAL-CONTENT-REVIEW-..." maxLength={120}/>
     <label style={{display:'flex',alignItems:'flex-start',gap:9}}><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I verified the source edition, instructional correctness and original material rights.</label>
     <button type="button" disabled={busy||!confirmed||rightsRef.trim().length<8} onClick={()=>void action('/editor/units/'+unit.id+'/publish',{rightsVerified:true,originalWorkReference:rightsRef},'Approved lesson published to entitled Class 1 learners.')}>
      <ShieldCheck size={16}/> Publish approved lesson
     </button>
    </div>}
    {role==='admin'&&unit.status==='published'&&<div className="vg1-editor-review-actions">
     <label htmlFor="vg1-withdraw">Reason for withdrawal (audited)</label><input id="vg1-withdraw" value={rightsRef} onChange={e=>setRightsRef(e.target.value)} placeholder="Editorial correction required because…" maxLength={120}/>
     <button type="button" disabled={busy||rightsRef.trim().length<8} onClick={()=>{if(window.confirm('Withdraw this lesson from student access?'))void action('/editor/units/'+unit.id+'/withdraw',{reason:rightsRef},'Lesson withdrawn; earlier attempts retained.');}}>Withdraw lesson</button>
    </div>}
   </article>}
   <p className="vg1-footer"><ShieldCheck size={16}/> No fake completion badges, unpublished material, personal chatbot access or financial transactions for Class 1. Teacher verification and guardian supervision are mandatory.</p>
  </div>
 </section>;
};