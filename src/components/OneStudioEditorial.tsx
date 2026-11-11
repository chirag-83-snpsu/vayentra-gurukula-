import React,{useCallback,useEffect,useState} from 'react';
import {BookOpen,CheckCircle2,ClipboardCheck,Eye,RefreshCw,ShieldCheck} from 'lucide-react';
import {useApp} from '../context/AppContext';
import {ShapesScene} from './OneShapesScene';
import '../styles/one-concept-studio.css';
type StaffUnit={id:string;title:string;order:number;objective:string;bridge:string;explanation:string;steps:string[];
 workedExample:string;misconception:string;activity:string;visual:string;status:string;reviewReference?:string|null;
 trackStatus:string;subjectStatus:string;chapterStatus:string;publisherReference:string;
 questions:Array<{id:string;prompt:string;options:string[];correctIndex:number;rationale:string;misconceptionTag:string}>};
export const OneStudioEditorial:React.FC=()=>{
 const {authToken,currentUser}=useApp();
 const [units,setUnits]=useState<StaffUnit[]>([]);
 const [selected,setSelected]=useState('');
 const [reviewRef,setReviewRef]=useState('');
 const [rightsRef,setRightsRef]=useState('');
 const [rights,setRights]=useState(false);
 const [decision,setDecision]=useState<'approved'|'changes_requested'>('approved');
 const [studentId,setStudentId]=useState('');
 const [pilotReason,setPilotReason]=useState('');
 const [expires,setExpires]=useState('');
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const role=currentUser?.role||'';
 const api=useCallback(async(path:string,method:'GET'|'POST'='GET',payload?:unknown)=>{
  if(!authToken)throw Error('Staff login required.');
  const r=await fetch('/api/v1/one-studio'+path,{method,headers:{
   Authorization:'Bearer '+authToken,'Content-Type':'application/json'
  },body:payload?JSON.stringify(payload):undefined});
  const json=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(json.message||json.code||'Academic review failed.');
  return json;
 },[authToken]);
 const load=useCallback(async()=>{
  setLoading(true);setError('');
  try{
   const data=await api('/editor/preview');
   setUnits(data.units||[]);
   setSelected(old=>(data.units||[]).some((u:StaffUnit)=>u.id===old)?old:(data.units?.[0]?.id||''));
  }catch(e){setError(e instanceof Error?e.message:'Unable to load draft materials.');}
  finally{setLoading(false);}
 },[api]);
 useEffect(()=>{void load();},[load]);
 async function action(url:string,payload:unknown,success:string){
  setBusy(true);setError('');setNotice('');
  try{await api(url,'POST',payload);setNotice(success);await load();}
  catch(e){setError(e instanceof Error?e.message:'The operation failed.');}
  finally{setBusy(false);}
 }
 const unit=units.find(u=>u.id===selected);
 return <section className="vgs vgs-editor">
  <header className="vgs-top"><div><span className="vgs-eyebrow"><ClipboardCheck size={17}/> ACADEMIC EDITORIAL STUDIO</span>
   <h2>Original lessons.<br/><em>Human-reviewed quality.</em></h2><p>Class 4 · CBSE Maths Mela · Shapes Around Us · 6 draft units, 24 original concept questions</p></div>
   <BookOpen size={38}/></header>
  <div className="vgs-editor-note"><ShieldCheck size={17}/> These are original instructional drafts, not approved NCERT textbook reproductions or finished videos. Review the official book and each question before publication. The publisher-rights and reviewer reference must represent a real review, not an invented ticket.</div>
  <div className="vgs-editor-controls"><button type="button" onClick={()=>void load()} disabled={loading||busy}><RefreshCw size={16}/> Refresh editorial queue</button>
   {units.length>0&&<select aria-label="Choose concept for review" value={selected} onChange={e=>{setSelected(e.target.value);setNotice('');}}>{units.map(u=><option key={u.id} value={u.id}>{u.order}. {u.title} · {u.status}</option>)}</select>}
  </div>
  {loading&&<p role="status">Loading lesson drafts…</p>}
  {error&&<p role="alert" className="vgs-alert">{error}</p>}
  {notice&&<p role="status" className="vgs-notice">{notice}</p>}
  {unit&&<div className="vgs-editor-review">
   <div className="vgs-editor-unit">
    <span className="vgs-editor-status">STATUS: {unit.status} · Source: {unit.trackStatus} · Subject: {unit.subjectStatus} · Chapter: {unit.chapterStatus}</span>
    <h3>{unit.order}. {unit.title}</h3><p><strong>Learning objective:</strong> {unit.objective}</p>
    <ShapesScene visual={unit.visual}/>
    <p><strong>Prerequisite:</strong> {unit.bridge}</p><p><strong>Original explanation:</strong> {unit.explanation}</p>
    <ol>{unit.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>
    <p><strong>Worked example:</strong> {unit.workedExample}</p>
    <p><strong>Misconception:</strong> {unit.misconception}</p>
    <p><strong>Offline activity:</strong> {unit.activity}</p>
    {unit.questions.map((q,i)=><div key={q.id} className="vgs-editor-unit"><strong>{i+1}. {q.prompt}</strong>
     <p>Answer: {q.options[q.correctIndex]} · {q.rationale}</p><small>Misconception tag: {q.misconceptionTag}</small>
    </div>)}
   </div>
   {['teacher','admin'].includes(role)&&unit.status==='draft'&&<button type="button" className="vgs-primary" disabled={busy} onClick={()=>void action('/editor/units/'+unit.id+'/request-review',{},'Sent for independent academic review.')}><Eye size={17}/> Send complete lesson for reviewer sign-off</button>}
   {role==='reviewer'&&unit.status==='teacher_review'&&<div className="vgs-editor-unit">
    <h3>Independent subject review</h3><p>Verify conceptual accuracy, question options, misconceptions, age suitability, accessibility and alignment with the current textbook edition.</p>
    <label htmlFor="vgs-review-result">Academic decision</label><select id="vgs-review-result" value={decision} onChange={e=>setDecision(e.target.value as 'approved'|'changes_requested')}><option value="approved">Approve after actual review</option><option value="changes_requested">Return for revision</option></select>
    <label htmlFor="vgs-review-ref">Internal academic review evidence reference</label><input id="vgs-review-ref" value={reviewRef} onChange={e=>setReviewRef(e.target.value)} maxLength={120} placeholder="SUBJECT-REVIEW-CASE-..."/>
    <button type="button" className="vgs-primary" disabled={busy||reviewRef.trim().length<8} onClick={()=>void action('/editor/units/'+unit.id+'/review',{decision,academicReviewReference:reviewRef},'Independent review recorded.')}><CheckCircle2 size={16}/> Record reviewer decision</button>
   </div>}
   {role==='admin'&&unit.status==='reviewed'&&<div className="vgs-editor-unit">
    <h3>Administrator publication gate</h3><p>Publication requires the Class 4 track verified, the Mathematics subject reviewed, Chapter 1 reviewed, and independent reviewer approval. These approvals are maintained in ONE Curriculum Studio.</p>
    <label htmlFor="vgs-rights">Original-content rights evidence reference</label>
    <input id="vgs-rights" value={rightsRef} onChange={e=>setRightsRef(e.target.value)} maxLength={120} placeholder="ORIGINAL-WORK-REVIEW-..."/>
    <label className="vgs-editor-check"><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/> I personally confirmed each lesson, diagram and question is original or licensed, and the academic-review evidence is valid.</label>
    <button type="button" className="vgs-primary" disabled={busy||!rights||rightsRef.trim().length<8} onClick={()=>void action('/editor/units/'+unit.id+'/publish',{originalContentRightsConfirmed:true,rightsEvidenceReference:rightsRef},'The approved lesson was published for authorised learners.')}><ShieldCheck size={16}/> Publish reviewed concept</button>
   </div>}
   {role==='admin'&&unit.status==='published'&&<div className="vgs-editor-unit"><h3>Withdraw published lesson</h3><p>Unpublishing prevents new learner access but retains earlier formative attempts.</p><button type="button" className="vgs-primary" disabled={busy} onClick={()=>{if(window.confirm('Withdraw this published lesson?'))void action('/editor/units/'+unit.id+'/unpublish',{reason:'Administrator withdrew published content for editorial re-evaluation.'},'Lesson withdrawn for editorial review.');}}>Withdraw from student view</button></div>}
  </div>}
  {role==='admin'&&<section className="vgs-editor-unit">
   <h3>Controlled non-paying pilot</h3>
   <p>Only an already activated and consent-reviewed Class 4 CBSE learner can receive time-limited pilot access. This does not alter paid entitlements.</p>
   <label htmlFor="vgs-pilot-student">Existing learner database ID</label>
   <input id="vgs-pilot-student" value={studentId} onChange={e=>setStudentId(e.target.value)} placeholder="Select a verified student ID from student management"/>
   <label htmlFor="vgs-pilot-date">Pilot expiration</label><input id="vgs-pilot-date" type="date" value={expires} onChange={e=>setExpires(e.target.value)}/>
   <label htmlFor="vgs-pilot-reason">Internal academic pilot purpose</label><input id="vgs-pilot-reason" value={pilotReason} onChange={e=>setPilotReason(e.target.value)} placeholder="Pilot cohort and reviewer reference"/>
   <button type="button" className="vgs-primary" disabled={busy||!expires||pilotReason.trim().length<12||studentId.trim().length<4} onClick={()=>void action('/admin/pilot-grants',{studentId:studentId.trim(),reason:pilotReason.trim(),expiresAt:expires+'T23:59:59+05:30'},'Limited educational pilot access granted.')}><ShieldCheck size={17}/> Grant time-limited pilot access</button>
  </section>}
 </section>;
};