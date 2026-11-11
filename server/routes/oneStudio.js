import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {db} from '../db/database.js';
import {authenticateToken,requireRole} from '../middleware/auth.js';

export const oneStudioRouter=Router();
oneStudioRouter.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
oneStudioRouter.use(authenticateToken);
const fail=(res,code,status=400,message='Unable to complete your request.')=>res.status(status).json({code,message});
const STUDIO_COURSE_KEY='vg-c4-cbse-shapes-2026';
const readQuestions=unitId=>db.prepare(
 'SELECT id,position,stem,options_json,correct_index,rationale,misconception_tag FROM one_studio_questions WHERE unit_id=? ORDER BY position'
).all(unitId);
const queryUnits=()=>db.prepare(`
 SELECT u.*,c.title,ch.chapter_title,ch.chapter_number,ch.review_status AS chapter_status,
 s.subject_title,s.review_status AS subject_status,t.grade,t.board,t.edition_year,
 t.catalogue_status,t.publisher_reference
 FROM one_studio_units u JOIN one_concepts c ON c.id=u.concept_id
 JOIN one_chapters ch ON ch.id=c.chapter_id
 JOIN one_subjects s ON s.id=ch.subject_id
 JOIN one_curriculum_tracks t ON t.id=s.track_id
 WHERE u.unit_key LIKE ? ORDER BY u.lesson_order
`).all(STUDIO_COURSE_KEY+'-%');
function available(u){
 return u?.status==='published'&&u.catalogue_status==='verified'&&
 u.subject_status==='reviewed'&&u.chapter_status==='reviewed';
}
function ownStudent(req,studentId){
 if(req.user.role==='student')return req.user.studentId===studentId;
 if(req.user.role!=='parent'||!req.user.guardianId)return false;
 return Boolean(db.prepare(`
 SELECT 1 FROM students s JOIN one_memberships m ON m.student_id=s.id
 JOIN one_consent_reviews c ON c.student_id=s.id
 WHERE s.id=? AND s.guardian_id=? AND m.guardian_id=?
 AND c.guardian_id=? AND m.membership_status='active'
`).get(studentId,req.user.guardianId,req.user.guardianId,req.user.guardianId));
}
function studentAccess(studentId){
 const student=db.prepare('SELECT id,grade,board FROM students WHERE id=?').get(studentId);
 if(!student||student.grade!==4||student.board!=='CBSE')return {code:'COURSE_NOT_IN_ENROLLED_GRADE'};
 const year=db.prepare(`
  SELECT id FROM one_academic_years WHERE student_id=? AND status='active' AND grade=4 AND board='CBSE'
 `).get(studentId);
 const member=db.prepare('SELECT membership_status,entitlement_status FROM one_memberships WHERE student_id=?').get(studentId);
 if(!year||member?.membership_status!=='active')return {code:'ACTIVE_ENROLMENT_REQUIRED'};
 if(!db.prepare('SELECT 1 FROM one_consent_reviews WHERE student_id=?').get(studentId))
   return {code:'CONSENT_REVIEW_REQUIRED'};
 const grant=db.prepare(
  "SELECT 1 FROM one_studio_pilot_grants WHERE student_id=? AND expires_at > datetime('now')"
 ).get(studentId);
 if(member.entitlement_status!=='enabled'&&!grant)return {code:'LEARNING_ENTITLEMENT_REQUIRED'};
 return {allowed:true};
}
function context(req,res,providedId){
 const studentId=req.user.role==='student'?req.user.studentId:providedId;
 if(!studentId||!ownStudent(req,studentId)){
  fail(res,'LEARNER_OWNERSHIP_REQUIRED',403);return null;
 }
 const allowed=studentAccess(studentId);
 if(!allowed.allowed){fail(res,allowed.code,403,'This course is not yet enabled for your verified learner.');return null;}
 return studentId;
}
function attemptCount(studentId,unitId){
 return db.prepare(`
  SELECT COUNT(*) AS n FROM one_studio_attempts
  WHERE student_id=? AND unit_id=? AND created_at >= datetime('now','-1 day')
 `).get(studentId,unitId).n;
}
function gradesFor(unitId,chosen){
 const bank=readQuestions(unitId);
 const data=bank.map((q,i)=>{
  const choice=chosen[i];
  return {questionId:q.id,chosenIndex:choice,correctIndex:q.correct_index,correct:choice===q.correct_index,
   rationale:q.rationale,misconceptionTag:choice===q.correct_index?null:q.misconception_tag};
 });
 return {correct:data.filter(q=>q.correct).length,total:data.length,feedback:data};
}
function summary(studentId){
 const list=db.prepare(`
  SELECT a.unit_id,a.correct_count,a.total_questions,a.created_at
  FROM one_studio_attempts a WHERE a.student_id=?
  ORDER BY a.created_at DESC,a.rowid DESC
 `).all(studentId);
 const latest=new Map();
 for(const a of list)if(!latest.has(a.unit_id))latest.set(a.unit_id,a);
 return {completedChecks:latest.size,attemptCount:list.length,
  latestAttempts:[...latest.values()].map(a=>({
   unitId:a.unit_id,correct:a.correct_count,total:a.total_questions,checkedAt:a.created_at,
   guidance:a.correct_count===a.total_questions?'All answers correct in latest check':'Review explanations and try again'
  }))};
}
function getOutline(req,res,studentId){
 const id=context(req,res,studentId);
 if(!id)return;
 try{
  const unitList=queryUnits().filter(available);
  return res.json({course:{id:STUDIO_COURSE_KEY,title:'Shapes Around Us',book:'Maths Mela',
    publisher:'NCERT',grade:4,board:'CBSE',academicYear:'2026-27',contentStatus:'teacher_approved_only',
    note:'Original Vayentra instructional material. Only published lessons appear.'},
    units:unitList.map(u=>({id:u.id,order:u.lesson_order,title:u.title,
       objective:u.objective,visual:u.visual_key,questionCount:readQuestions(u.id).length})),
    progress:summary(id)});
 }catch(err){console.error('[ONE studio outline]',err);return fail(res,'COURSE_LOAD_FAILED',500);}
}
function getUnit(req,res,studentId){
 const id=context(req,res,studentId);if(!id)return;
 try{
  const unit=queryUnits().find(u=>u.id===req.params.unitId);
  if(!available(unit))return fail(res,'LESSON_NOT_PUBLISHED',404);
  const questions=readQuestions(unit.id).map(q=>({
   id:q.id,position:q.position,prompt:q.stem,options:JSON.parse(q.options_json)
  }));
  return res.json({lesson:{id:unit.id,title:unit.title,order:unit.lesson_order,
   objective:unit.objective,bridge:unit.bridge,explanation:unit.explanation,
   steps:JSON.parse(unit.steps_json),workedExample:unit.worked_example,
   misconception:unit.misconception,activity:unit.offline_activity,visual:unit.visual_key,
   questionCount:questions.length},questions,progress:summary(id)});
 }catch(err){console.error('[ONE studio unit]',err);return fail(res,'LESSON_LOAD_FAILED',500);}
}
function submit(req,res,studentId){
 const id=context(req,res,studentId);if(!id)return;
 const body=req.body||{},unitId=body.unitId,key=body.idempotencyKey;
 if(typeof unitId!=='string'||typeof key!=='string'||!/^[a-zA-Z0-9_-]{12,100}$/.test(key))
  return fail(res,'INVALID_ATTEMPT_REQUEST');
 try{
  const u=queryUnits().find(x=>x.id===unitId);
  if(!available(u))return fail(res,'LESSON_NOT_PUBLISHED',404);
  const bank=readQuestions(unitId);
  if(bank.length<3||bank.length>15)return fail(res,'QUESTION_BANK_UNAVAILABLE',409);
  const answers=body.answers;
  if(!Array.isArray(answers)||answers.length!==bank.length||answers.some((v,i)=>!Number.isInteger(v)||v<0||v>=JSON.parse(bank[i].options_json).length))
   return fail(res,'INCOMPLETE_OR_INVALID_ANSWERS',400);
  const existing=db.prepare('SELECT * FROM one_studio_attempts WHERE student_id=? AND client_attempt_key=?').get(id,key);
  if(existing){
   if(existing.unit_id!==unitId||JSON.stringify(answers)!==existing.response_json)
    return fail(res,'IDEMPOTENCY_CONFLICT',409);
   return res.json({attemptId:existing.id,replayed:true,...gradesFor(unitId,answers)});
  }
  if(attemptCount(id,unitId)>=8)return fail(res,'PRACTICE_LIMIT_REACHED',429,'Try more examples tomorrow or ask a teacher.');
  const grade=gradesFor(unitId,answers);
  db.exec('BEGIN IMMEDIATE');
  try{
   // Recheck idempotency inside the transaction: no duplicate practice evidence.
   const replay=db.prepare('SELECT id FROM one_studio_attempts WHERE student_id=? AND client_attempt_key=?').get(id,key);
   if(replay)throw Error('DUPLICATE_ATTEMPT_RACE');
   const attemptId='one-check-'+randomUUID();
   db.prepare(`
    INSERT INTO one_studio_attempts
      (id,student_id,unit_id,attempted_by,client_attempt_key,response_json,correct_count,total_questions)
    VALUES(?,?,?,?,?,?,?,?)
   `).run(attemptId,id,unitId,req.user.id,key,JSON.stringify(answers),grade.correct,grade.total);
   // These are practice evidence states, NOT independently verified mastery.
   db.prepare(`
    INSERT INTO one_concept_mastery(student_id,concept_id,mastery,updated_at)
    VALUES(?,?,?,datetime('now'))
    ON CONFLICT(student_id,concept_id) DO UPDATE SET
       mastery=CASE WHEN one_concept_mastery.mastery='teacher_confirmed' THEN 'teacher_confirmed'
        ELSE excluded.mastery END,
       updated_at=datetime('now')
   `).run(id,u.concept_id,grade.correct<Math.ceil(grade.total/2)?'needs_help':'practising');
   db.prepare(`
    INSERT INTO one_journey_audit(id,actor_user_id,student_id,action,detail_code)
    VALUES(?,?,?,'CONCEPT_CHECK_COMPLETED','EVIDENCE_NOT_TEACHER_CONFIRMED')
   `).run('one-audit-'+randomUUID(),req.user.id,id);
   db.exec('COMMIT');
   return res.status(201).json({attemptId,replayed:false,...grade,
    notice:'This is a formative check. Correct answers alone do not establish teacher-confirmed mastery.'});
  }catch(err){db.exec('ROLLBACK');throw err;}
 }catch(err){
  if(String(err.message).includes('UNIQUE')||String(err.message).includes('DUPLICATE_ATTEMPT_RACE'))
   return fail(res,'DUPLICATE_ATTEMPT_RETRY',409);
  console.error('[ONE studio attempt]',err);return fail(res,'PRACTICE_SAVE_FAILED',500);
 }
}
// Authenticated student experience: backend owns the learner identity.
oneStudioRouter.get('/me/course',requireRole('student'),(req,res)=>getOutline(req,res,null));
oneStudioRouter.get('/me/units/:unitId',requireRole('student'),(req,res)=>getUnit(req,res,null));
oneStudioRouter.post('/me/attempts',requireRole('student'),(req,res)=>submit(req,res,null));
// Parent-supervised learning: requires actual guardian relationship and consent review.
oneStudioRouter.get('/guardian/:studentId/course',requireRole('parent'),(req,res)=>getOutline(req,res,req.params.studentId));
oneStudioRouter.get('/guardian/:studentId/units/:unitId',requireRole('parent'),(req,res)=>getUnit(req,res,req.params.studentId));
oneStudioRouter.post('/guardian/:studentId/attempts',requireRole('parent'),(req,res)=>submit(req,res,req.params.studentId));
oneStudioRouter.get('/guardian/:studentId/progress',requireRole('parent'),(req,res)=>{
 const id=context(req,res,req.params.studentId);if(!id)return;
 return res.json({progress:summary(id),note:'Practice evidence is not an official school mark or teacher-confirmed mastery.'});
});
// Restricted content studio. Teacher/reviewer can inspect drafts, but only reviewers approve.
oneStudioRouter.get('/editor/preview',requireRole(['teacher','reviewer','admin']),(req,res)=>{
 try{
  const rows=queryUnits();
  return res.json({course:STUDIO_COURSE_KEY,status:'editorial',
   units:rows.map(u=>({id:u.id,title:u.title,order:u.lesson_order,objective:u.objective,
    explanation:u.explanation,bridge:u.bridge,steps:JSON.parse(u.steps_json),
    workedExample:u.worked_example,misconception:u.misconception,activity:u.offline_activity,
    visual:u.visual_key,status:u.status,reviewReference:u.review_reference,
    questions:readQuestions(u.id).map(q=>({id:q.id,prompt:q.stem,options:JSON.parse(q.options_json),
      correctIndex:q.correct_index,rationale:q.rationale,misconceptionTag:q.misconception_tag})),
    publisherReference:u.publisher_reference,trackStatus:u.catalogue_status,
    subjectStatus:u.subject_status,chapterStatus:u.chapter_status
   }))});
 }catch(err){console.error('[ONE studio editor]',err);return fail(res,'EDITOR_LOAD_FAILED',500);}
});
oneStudioRouter.post('/editor/units/:unitId/request-review',requireRole(['teacher','admin']),(req,res)=>{
 try{
  const u=queryUnits().find(x=>x.id===req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_FOUND',404);
  if(u.status!=='draft')return fail(res,'UNIT_NOT_DRAFT',409);
  if(readQuestions(u.id).length<3||u.explanation.length<120)return fail(res,'LESSON_INCOMPLETE',409);
  db.prepare("UPDATE one_studio_units SET status='teacher_review' WHERE id=? AND status='draft'").run(u.id);
  return res.json({requested:true});
 }catch(err){console.error('[ONE studio request-review]',err);return fail(res,'REVIEW_REQUEST_FAILED',500);}
});
oneStudioRouter.post('/editor/units/:unitId/review',requireRole('reviewer'),(req,res)=>{
 const decision=req.body?.decision,reference=req.body?.academicReviewReference;
 if(!['approved','changes_requested'].includes(decision)||typeof reference!=='string'||
    reference.trim().length<8||reference.trim().length>120||/[<>]/.test(reference))
  return fail(res,'ACADEMIC_REVIEW_EVIDENCE_REQUIRED');
 try{
  const u=queryUnits().find(x=>x.id===req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_FOUND',404);
  if(u.status!=='teacher_review')return fail(res,'UNIT_NOT_AWAITING_REVIEW',409);
  const questions=readQuestions(u.id);
  if(questions.length<3)return fail(res,'QUESTION_BANK_INCOMPLETE',409);
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare(`
    UPDATE one_studio_units SET status=?,reviewer_id=?,review_reference=?,reviewed_at=datetime('now')
    WHERE id=? AND status='teacher_review'
   `).run(decision==='approved'?'reviewed':'draft',
    req.user.id,reference.trim(),u.id);
   db.prepare(`
    INSERT INTO one_studio_reviews(id,unit_id,reviewer_id,review_reference,decision)
    VALUES(?,?,?,?,?)
   `).run('one-rev-'+randomUUID(),u.id,req.user.id,reference.trim(),decision);
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({reviewed:true,decision,status:decision==='approved'?'reviewed':'draft'});
 }catch(err){console.error('[ONE studio review]',err);return fail(res,'REVIEW_SAVE_FAILED',500);}
});
oneStudioRouter.post('/editor/units/:unitId/publish',requireRole('admin'),(req,res)=>{
 const reference=req.body?.rightsEvidenceReference;
 if(req.body?.originalContentRightsConfirmed!==true||typeof reference!=='string'||
    reference.trim().length<8||reference.trim().length>120||/[<>]/.test(reference))
  return fail(res,'RIGHTS_EVIDENCE_REQUIRED');
 try{
  const u=queryUnits().find(x=>x.id===req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_FOUND',404);
  if(u.status!=='reviewed'||!u.reviewer_id||u.reviewer_id===req.user.id||
     u.catalogue_status!=='verified'||u.subject_status!=='reviewed'||u.chapter_status!=='reviewed'||
     readQuestions(u.id).length<3)return fail(res,'EDITORIAL_GATES_NOT_MET',409,
     'An independent review and verified board/subject/chapter map are required.');
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare(`
    UPDATE one_studio_units SET status='published',published_at=datetime('now'),publisher_id=?
    WHERE id=? AND status='reviewed'
   `).run(req.user.id,u.id);
   db.prepare(`
    UPDATE one_concepts SET content_status='published',reviewer_id=?,reviewed_at=datetime('now')
    WHERE id=?
   `).run(u.reviewer_id,u.concept_id);
   db.prepare(`
    INSERT INTO one_content_review_logs(id,item_type,item_id,reviewer_id,editorial_reference,rights_attested,decision)
    VALUES(?, 'concept', ?, ?, ?, 1, 'published')
   `).run('one-review-'+randomUUID(),u.concept_id,req.user.id,reference.trim());
   db.prepare("INSERT INTO one_studio_publication_events(id,unit_id,actor_user_id,action,evidence_reference) VALUES(?,?,?,'published',?)")
    .run('one-pub-'+randomUUID(),u.id,req.user.id,reference.trim());
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({published:true,unitId:u.id,notice:'Unit is now available only to entitled or explicitly pilot-granted verified learners.'});
 }catch(err){console.error('[ONE studio publishing]',err);return fail(res,'PUBLISH_FAILED',500);}
});
oneStudioRouter.post('/editor/units/:unitId/unpublish',requireRole('admin'),(req,res)=>{
 const reason=req.body?.reason;
 if(typeof reason!=='string'||reason.trim().length<10||reason.trim().length>200)
  return fail(res,'REASON_REQUIRED');
 try{
  const u=queryUnits().find(x=>x.id===req.params.unitId);
  if(!u||u.status!=='published')return fail(res,'UNIT_NOT_PUBLISHED',409);
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare("UPDATE one_studio_units SET status='reviewed',published_at=NULL,publisher_id=NULL WHERE id=?")
    .run(u.id);
   db.prepare("UPDATE one_concepts SET content_status='teacher_review' WHERE id=?")
    .run(u.concept_id);
   db.prepare("INSERT INTO one_studio_publication_events(id,unit_id,actor_user_id,action,evidence_reference) VALUES(?,?,?,'withdrawn',?)")
    .run('one-pub-'+randomUUID(),u.id,req.user.id,reason.trim());
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({unpublished:true,reasonStored:true,note:'Prior attempts are kept, course content is no longer served.'});
 }catch(err){console.error('[ONE studio unpublish]',err);return fail(res,'UNPUBLISH_FAILED',500);}
});
oneStudioRouter.post('/admin/pilot-grants',requireRole('admin'),(req,res)=>{
 const {studentId,expiresAt,reason}=req.body||{};
 const expires=typeof expiresAt==='string'?Date.parse(expiresAt):NaN;
 const now=Date.now();
 if(typeof studentId!=='string'||typeof reason!=='string'||reason.trim().length<12||
    reason.trim().length>200||!Number.isFinite(expires)||expires<=now||expires-now>90*86400000)
  return fail(res,'INVALID_PILOT_GRANT',400,'Specify a learner, a private pilot purpose, and a grant expiring within 90 days.');
 try{
  const membership=db.prepare('SELECT membership_status FROM one_memberships WHERE student_id=?').get(studentId);
  const enrolled=db.prepare("SELECT 1 FROM one_academic_years WHERE student_id=? AND status='active' AND grade=4 AND board='CBSE'")
   .get(studentId);
  const verified=db.prepare('SELECT 1 FROM one_consent_reviews WHERE student_id=?').get(studentId);
  if(membership?.membership_status!=='active'||!enrolled||!verified)
   return fail(res,'ACTIVE_CLASS4_CONSENT_REQUIRED',403);
  const iso=new Date(expires).toISOString().slice(0,19).replace('T',' ');
  db.prepare(`
   INSERT INTO one_studio_pilot_grants(student_id,approved_by,reason,expires_at)
   VALUES(?,?,?,?)
   ON CONFLICT(student_id) DO UPDATE SET approved_by=excluded.approved_by,
    reason=excluded.reason,expires_at=excluded.expires_at
  `).run(studentId,req.user.id,reason.trim(),iso);
  db.prepare(`
   INSERT INTO one_journey_audit(id,actor_user_id,student_id,action,detail_code)
   VALUES(?,?,?,'STUDIO_PILOT_GRANTED','LIMITED_TIME_NONPAID')
  `).run('one-audit-'+randomUUID(),req.user.id,studentId);
  return res.json({pilotGranted:true,expiresAt:new Date(expires).toISOString(),
   notice:'This is a limited academic pilot, NOT a subscription payment or unrestricted access.'});
 }catch(err){console.error('[ONE studio pilot grant]',err);return fail(res,'PILOT_GRANT_FAILED',500);}
});
oneStudioRouter.get('/admin/students/:studentId/progress',requireRole('admin'),(req,res)=>{
 try{
  if(!db.prepare('SELECT id FROM students WHERE id=?').get(req.params.studentId))
   return fail(res,'STUDENT_NOT_FOUND',404);
  return res.json({progress:summary(req.params.studentId)});
 }catch(err){console.error('[ONE studio admin progress]',err);return fail(res,'PROGRESS_LOAD_FAILED',500);}
});
