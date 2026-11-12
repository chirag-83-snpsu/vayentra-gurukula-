import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {db} from '../db/database.js';
import {authenticateToken,requireRole} from '../middleware/auth.js';
import {GRADE1_CURRICULUM} from '../data/grade1Curriculum.js';

export const grade1CurriculumRouter=Router();
grade1CurriculumRouter.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
grade1CurriculumRouter.use(authenticateToken);
const fail=(res,code,status=400,message='Unable to complete the Class 1 learning request.')=>
 res.status(status).json({code,message});
const boardValid=b=>b==='CBSE'||b==='STATE';
const evidenceOk=s=>typeof s==='string'&&s.trim().length>=8&&s.trim().length<=120&&!/[<>]/.test(s);
const byBoard=board=>GRADE1_CURRICULUM.official.find(b=>b.board===board);

function unitRows(board){
 return db.prepare(`
  SELECT u.*,c.title,ch.id AS chapter_id,ch.chapter_title,ch.chapter_number,
   ch.review_status AS chapter_status,ch.textbook_edition,
   s.id AS subject_id,s.subject_title,s.review_status AS subject_status,
   t.id AS track_id,t.board,t.grade,t.edition_year,t.catalogue_status AS track_status
  FROM one_foundation_units u
  JOIN one_concepts c ON c.id=u.concept_id
  JOIN one_chapters ch ON ch.id=c.chapter_id
  JOIN one_subjects s ON s.id=ch.subject_id
  JOIN one_curriculum_tracks t ON t.id=s.track_id
  WHERE u.board=? AND u.grade=1 AND t.grade=1 AND t.board=?
  ORDER BY s.subject_title,ch.chapter_number,u.id
 `).all(board,board);
}
const questions=id=>db.prepare(
 'SELECT id,position,question_text,choices_json,answer_index,explanation FROM one_foundation_questions WHERE unit_id=? ORDER BY position'
).all(id);
function published(row){
 return row?.status==='published'&&row.track_status==='verified'&&row.subject_status==='reviewed'&&row.chapter_status==='reviewed';
}
function validOwner(user,studentId){
 if(user.role==='student'){
  if(!user.studentId||user.studentId!==studentId)return false;
  return Boolean(db.prepare(
   'SELECT 1 FROM one_student_account_links WHERE user_id=? AND student_id=?'
  ).get(user.id,studentId));
 }
 if(user.role!=='parent'||!user.guardianId)return false;
 return Boolean(db.prepare(`
  SELECT 1 FROM one_memberships m JOIN students s ON s.id=m.student_id
  JOIN one_consent_reviews cr ON cr.student_id=s.id
  WHERE s.id=? AND s.guardian_id=? AND m.guardian_id=? AND cr.guardian_id=?
   AND m.membership_status='active'
 `).get(studentId,user.guardianId,user.guardianId,user.guardianId));
}
function context(req,res,selectedId,needAccess){
 const studentId=req.user.role==='student'?req.user.studentId:selectedId;
 if(!studentId||!validOwner(req.user,studentId)){
  fail(res,'LEARNER_OWNERSHIP_REQUIRED',403);return null;
 }
 const record=db.prepare(`
  SELECT s.id,s.grade,s.board,m.membership_status,m.entitlement_status
  FROM students s JOIN one_memberships m ON m.student_id=s.id WHERE s.id=?
 `).get(studentId);
 if(!record||record.grade!==1||!boardValid(record.board)||record.membership_status!=='active'||
    !db.prepare("SELECT 1 FROM one_academic_years WHERE student_id=? AND status='active' AND grade=1 AND board=?").get(studentId,record.board)||
    !db.prepare('SELECT 1 FROM one_consent_reviews WHERE student_id=?').get(studentId)){
  fail(res,'CLASS1_ENROLMENT_REQUIRED',403);return null;
 }
 const trial=Boolean(db.prepare(
  "SELECT 1 FROM one_foundation_pilot_grants WHERE student_id=? AND expires_at>datetime('now')"
 ).get(studentId));
 if(needAccess&&record.entitlement_status!=='enabled'&&!trial){
  fail(res,'LEARNING_ACCESS_PENDING',403,'An approved pilot grant or valid course entitlement is required.');return null;
 }
 return {...record,pilot:trial};
}
function courseMap(board,showDraft){
 const track=db.prepare(`
  SELECT * FROM one_curriculum_tracks
  WHERE board=? AND grade=1 AND edition_year=? AND medium='English'
 `).get(board,GRADE1_CURRICULUM.edition);
 if(!track)return {board,grade:1,subjects:[],status:'not_mapped'};
 const subjects=db.prepare(`
  SELECT id,subject_title,review_status FROM one_subjects WHERE track_id=?
  ORDER BY CASE WHEN subject_title LIKE 'Vayentra Original:%' THEN 1 ELSE 0 END,subject_title
 `).all(track.id);
 const chapters=db.prepare(`
  SELECT ch.id,ch.subject_id,ch.chapter_number,ch.chapter_title,ch.textbook_edition,ch.review_status
  FROM one_chapters ch JOIN one_subjects s ON s.id=ch.subject_id WHERE s.track_id=?
  ORDER BY ch.chapter_number
 `).all(track.id);
 const rows=unitRows(board);
 const catalogSubjects=subjects.map(subject=>{
  const original=subject.subject_title.startsWith('Vayentra Original:');
  const info=!original?byBoard(board)?.subjects.find(s=>s.name===subject.subject_title):null;
  const chapterList=chapters.filter(ch=>ch.subject_id===subject.id).map(ch=>{
   const unitList=rows.filter(u=>u.chapter_id===ch.id);
   const visible=showDraft?unitList:unitList.filter(published);
   return {id:ch.id,number:ch.chapter_number,title:ch.chapter_title,
    edition:ch.textbook_edition,reviewStatus:ch.review_status,
    lessonCount:visible.length,
    lessonAvailability:unitList.some(published)?'approved_lessons_available':'planned',
    units:visible.map(u=>({id:u.id,title:u.title,status:u.status}))
   };
  });
  return {id:subject.id,name:subject.subject_title,kind:original?'vayentra_original_enrichment':'school_curriculum',
   book:info?.book|| (original?'Vayentra original course':'School edition to be verified'),
   reference:info?.source||null,
   sourceStatus:info?.status||(original?'original_draft':'edition_pending'),
   reviewStatus:subject.review_status,
   chapters:chapterList,
   approvedLessons:rows.filter(u=>u.subject_id===subject.id&&published(u)).length,
   plannedChapters:chapterList.length};
 });
 return {board,grade:1,edition:GRADE1_CURRICULUM.edition,trackId:track.id,
  trackStatus:track.catalogue_status,subjects:catalogSubjects,
  note:'Textbook chapter titles are mapped for curriculum planning. Vayentra original enrichment is not an NCERT or KTBS mandated subject. Unapproved lessons are unavailable.'};
}
function cleanUnit(row){
 return {id:row.id,subject:row.subject_title,chapter:row.chapter_title,
  title:row.title,objective:row.objective,story:row.story,
  homeActivity:row.home_activity,expectedMinutes:row.expected_minutes,
  curriculumKind:row.curriculum_kind,questions:questions(row.id).map(q=>({
   id:q.id,position:q.position,prompt:q.question_text,options:JSON.parse(q.choices_json)
  }))};
}
function summary(studentId,board){
 const units=unitRows(board);
 const permitted=new Set(units.map(u=>u.id));
 const attempts=db.prepare(`
  SELECT unit_id,correct_count,total_count,created_at FROM one_foundation_attempts
  WHERE student_id=? ORDER BY created_at DESC,rowid DESC LIMIT 1000
 `).all(studentId).filter(x=>permitted.has(x.unit_id));
 const latest=new Map();
 for(const a of attempts)if(!latest.has(a.unit_id))latest.set(a.unit_id,a);
 return {checkedLessons:latest.size,attemptsRecorded:attempts.length,
  latestChecks:[...latest.values()].map(a=>({
   unitId:a.unit_id,correct:a.correct_count,total:a.total_count,checkedAt:a.created_at,
   guidance:a.correct_count===a.total_count?'This check was correct; explore a new example later.':'Revisit the story with a trusted adult.'
  })),
  note:'Formative practice evidence only. No official marks, scores of other students or automatic mastery claims.'};
}
function learnerCatalogue(req,res,selectedId){
 const owner=context(req,res,selectedId,false);if(!owner)return;
 try{
  const map=courseMap(owner.board,false);
  const authorised=owner.entitlement_status==='enabled'||owner.pilot;
  return res.json({learner:{grade:1,board:owner.board},catalogue:map,
   access:authorised?'pilot_or_entitled':'locked',
   progress:authorised?summary(owner.id,owner.board):null});
 }catch(err){console.error('[Grade1 catalogue]',err);return fail(res,'CLASS1_CATALOGUE_FAILED',500);}
}
function lesson(req,res,selectedId){
 const owner=context(req,res,selectedId,true);if(!owner)return;
 try{
  const row=unitRows(owner.board).find(u=>u.id===req.params.unitId);
  if(!published(row))return fail(res,'LESSON_NOT_PUBLISHED',404);
  return res.json({lesson:cleanUnit(row),progress:summary(owner.id,owner.board)});
 }catch(err){console.error('[Grade1 lesson]',err);return fail(res,'CLASS1_LESSON_FAILED',500);}
}
function gradeChoice(id,answers){
 const qs=questions(id);
 const feedback=qs.map((q,i)=>({questionId:q.id,chosenIndex:answers[i],
  correctIndex:q.answer_index,correct:answers[i]===q.answer_index,reason:q.explanation}));
 return {correct:feedback.filter(x=>x.correct).length,total:feedback.length,feedback};
}
function submit(req,res,selectedId){
 const owner=context(req,res,selectedId,true);if(!owner)return;
 const {unitId,idempotencyKey,answers}=req.body||{};
 if(typeof unitId!=='string'||typeof idempotencyKey!=='string'||
   !/^[a-zA-Z0-9_-]{12,100}$/.test(idempotencyKey))
  return fail(res,'INVALID_PRACTICE_REQUEST');
 try{
  const row=unitRows(owner.board).find(u=>u.id===unitId);
  if(!published(row))return fail(res,'LESSON_NOT_PUBLISHED',404);
  const qs=questions(row.id);
  if(qs.length<1||qs.length>8||!Array.isArray(answers)||answers.length!==qs.length||
    answers.some((v,i)=>!Number.isInteger(v)||v<0||v>=JSON.parse(qs[i].choices_json).length))
   return fail(res,'INVALID_PRACTICE_ANSWERS');
  const prev=db.prepare('SELECT * FROM one_foundation_attempts WHERE student_id=? AND idempotency_key=?')
   .get(owner.id,idempotencyKey);
  if(prev){
   if(prev.unit_id!==unitId||prev.answers_json!==JSON.stringify(answers))return fail(res,'IDEMPOTENCY_CONFLICT',409);
   return res.json({attemptId:prev.id,replayed:true,...gradeChoice(unitId,answers)});
  }
  const count=db.prepare(
   "SELECT COUNT(*) n FROM one_foundation_attempts WHERE student_id=? AND unit_id=? AND created_at>=datetime('now','-1 day')"
  ).get(owner.id,unitId).n;
  if(count>=8)return fail(res,'PRACTICE_LIMIT_REACHED',429,'Take a break and revisit with a trusted adult.');
  const scored=gradeChoice(unitId,answers),attemptId='one-g1-check-'+randomUUID();
  db.prepare(`
    INSERT INTO one_foundation_attempts
    (id,student_id,unit_id,attempted_by,idempotency_key,answers_json,correct_count,total_count)
    VALUES(?,?,?,?,?,?,?,?)
  `).run(attemptId,owner.id,unitId,req.user.id,idempotencyKey,
   JSON.stringify(answers),scored.correct,scored.total);
  return res.status(201).json({attemptId,replayed:false,...scored,
   note:'A check can be retried. Correct answers do not automatically prove mastered learning.'});
 }catch(err){
  if(String(err).includes('UNIQUE'))return fail(res,'DUPLICATE_ATTEMPT_RETRY',409);
  console.error('[Grade1 attempt]',err);return fail(res,'PRACTICE_SAVE_FAILED',500);
 }
}
grade1CurriculumRouter.get('/me/catalogue',requireRole('student'),(req,res)=>learnerCatalogue(req,res,null));
grade1CurriculumRouter.get('/me/units/:unitId',requireRole('student'),(req,res)=>lesson(req,res,null));
grade1CurriculumRouter.post('/me/attempts',requireRole('student'),(req,res)=>submit(req,res,null));
grade1CurriculumRouter.get('/guardian/:studentId/catalogue',requireRole('parent'),(req,res)=>learnerCatalogue(req,res,req.params.studentId));
grade1CurriculumRouter.get('/guardian/:studentId/units/:unitId',requireRole('parent'),(req,res)=>lesson(req,res,req.params.studentId));
grade1CurriculumRouter.post('/guardian/:studentId/attempts',requireRole('parent'),(req,res)=>submit(req,res,req.params.studentId));

// Privileged editorial access. Draft answers never leave these staff endpoints.
grade1CurriculumRouter.get('/editor/map',requireRole(['admin','teacher','reviewer']),(req,res)=>{
 const board=req.query.board||'CBSE';if(!boardValid(board))return fail(res,'INVALID_BOARD');
 try{
  const map=courseMap(board,true);
  const units=unitRows(board).map(u=>({...cleanUnit(u),status:u.status,
   unitKey:u.unit_key,reviewerId:u.reviewer_id,reviewReference:u.review_reference,
   chapterReview:u.chapter_status,subjectReview:u.subject_status,trackStatus:u.track_status,
   questions:questions(u.id).map(q=>({...cleanUnit(u).questions.find(z=>z.id===q.id),
    correctIndex:q.answer_index,reason:q.explanation}))}));
  return res.json({curriculum:map,units,reviewRequired:true,
   guidance:'Class 1 AI and Money are original enrichment. CBSE Class 1 official chapter names are mapped as draft; Karnataka chapter titles require teacher edition confirmation.'});
 }catch(err){console.error('[Grade1 editorial map]',err);return fail(res,'EDITORIAL_MAP_FAILED',500);}
});
grade1CurriculumRouter.post('/editor/units/:unitId/request-review',requireRole(['teacher','admin']),(req,res)=>{
 const ticket=req.body?.editorialReference;
 if(!evidenceOk(ticket))return fail(res,'EDITORIAL_REFERENCE_REQUIRED');
 try{
  const u=db.prepare('SELECT * FROM one_foundation_units WHERE id=?').get(req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_FOUND',404);
  if(u.status!=='draft')return fail(res,'NOT_A_DRAFT',409);
  if(questions(u.id).length<1)return fail(res,'LESSON_INCOMPLETE',409);
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare("UPDATE one_foundation_units SET status='teacher_review' WHERE id=? AND status='draft'").run(u.id);
   db.prepare("INSERT INTO one_foundation_reviews(id,unit_id,actor_user_id,decision,evidence_reference) VALUES(?,?,?,'submitted',?)")
    .run('one-g1-review-'+randomUUID(),u.id,req.user.id,ticket.trim());
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({submitted:true});
 }catch(err){console.error('[Grade1 submit review]',err);return fail(res,'SUBMIT_REVIEW_FAILED',500);}
});
grade1CurriculumRouter.post('/editor/units/:unitId/review',requireRole('reviewer'),(req,res)=>{
 const {decision,academicReviewReference}=req.body||{};
 if(!['approved','changes_requested'].includes(decision)||!evidenceOk(academicReviewReference))
  return fail(res,'ACADEMIC_REVIEW_REQUIRED');
 try{
  const u=db.prepare('SELECT * FROM one_foundation_units WHERE id=?').get(req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_FOUND',404);
  if(u.status!=='teacher_review')return fail(res,'NOT_WAITING_FOR_REVIEW',409);
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare(`
    UPDATE one_foundation_units SET status=?,reviewer_id=?,review_reference=?,reviewed_at=datetime('now')
    WHERE id=? AND status='teacher_review'
   `).run(decision==='approved'?'reviewed':'draft',req.user.id,academicReviewReference.trim(),u.id);
   db.prepare('INSERT INTO one_foundation_reviews(id,unit_id,actor_user_id,decision,evidence_reference) VALUES(?,?,?,?,?)')
    .run('one-g1-review-'+randomUUID(),u.id,req.user.id,decision,academicReviewReference.trim());
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({reviewed:true,status:decision==='approved'?'reviewed':'draft'});
 }catch(err){console.error('[Grade1 review]',err);return fail(res,'REVIEW_SAVE_FAILED',500);}
});
grade1CurriculumRouter.post('/editor/units/:unitId/publish',requireRole('admin'),(req,res)=>{
 const reference=req.body?.originalWorkReference;
 if(req.body?.rightsVerified!==true||!evidenceOk(reference))return fail(res,'CONTENT_RIGHTS_REVIEW_REQUIRED');
 try{
  const u=db.prepare('SELECT * FROM one_foundation_units WHERE id=?').get(req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_FOUND',404);
  const row=unitRows(u.board).find(x=>x.id===u.id);
  if(!row||u.status!=='reviewed'||!u.reviewer_id||u.reviewer_id===req.user.id||
     row.track_status!=='verified'||row.subject_status!=='reviewed'||row.chapter_status!=='reviewed')
   return fail(res,'PUBLICATION_GATES_NOT_MET',409,'Verify edition, source curriculum and independent academic review.');
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare("UPDATE one_foundation_units SET status='published',publisher_id=?,published_at=datetime('now') WHERE id=? AND status='reviewed'").run(req.user.id,u.id);
   db.prepare("UPDATE one_concepts SET content_status='published',reviewer_id=?,reviewed_at=datetime('now') WHERE id=?")
    .run(u.reviewer_id,u.concept_id);
   db.prepare("INSERT INTO one_foundation_reviews(id,unit_id,actor_user_id,decision,evidence_reference) VALUES(?,?,?,'published',?)")
    .run('one-g1-review-'+randomUUID(),u.id,req.user.id,reference.trim());
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({published:true,unitId:u.id});
 }catch(err){console.error('[Grade1 publish]',err);return fail(res,'PUBLISH_FAILED',500);}
});
grade1CurriculumRouter.post('/editor/units/:unitId/withdraw',requireRole('admin'),(req,res)=>{
 if(!evidenceOk(req.body?.reason))return fail(res,'WITHDRAWAL_REASON_REQUIRED');
 try{
  const u=db.prepare("SELECT * FROM one_foundation_units WHERE id=? AND status='published'").get(req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_PUBLISHED',409);
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare("UPDATE one_foundation_units SET status='reviewed',published_at=NULL,publisher_id=NULL WHERE id=?")
    .run(u.id);
   db.prepare("UPDATE one_concepts SET content_status='teacher_review' WHERE id=?").run(u.concept_id);
   db.prepare("INSERT INTO one_foundation_reviews(id,unit_id,actor_user_id,decision,evidence_reference) VALUES(?,?,?,'withdrawn',?)")
    .run('one-g1-review-'+randomUUID(),u.id,req.user.id,req.body.reason.trim());
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({withdrawn:true,attemptsPreserved:true});
 }catch(err){console.error('[Grade1 withdraw]',err);return fail(res,'WITHDRAWAL_FAILED',500);}
});
grade1CurriculumRouter.post('/admin/pilot-grants',requireRole('admin'),(req,res)=>{
 const {studentId,reason,expiresAt}=req.body||{};
 const when=typeof expiresAt==='string'?Date.parse(expiresAt):NaN;
 if(typeof studentId!=='string'||!evidenceOk(reason)||!Number.isFinite(when)||
    when<Date.now()||when>Date.now()+90*86400000)return fail(res,'INVALID_PILOT_GRANT');
 const owner=db.prepare('SELECT s.id,s.grade,s.board,m.membership_status FROM students s JOIN one_memberships m ON m.student_id=s.id WHERE s.id=?').get(studentId);
 if(!owner||owner.grade!==1||owner.membership_status!=='active'||
    !db.prepare("SELECT 1 FROM one_academic_years WHERE student_id=? AND grade=1 AND status='active'").get(studentId)||
    !db.prepare('SELECT 1 FROM one_consent_reviews WHERE student_id=?').get(studentId))
  return fail(res,'VERIFIED_CLASS1_STUDENT_REQUIRED',403);
 const date=new Date(when).toISOString().slice(0,19).replace('T',' ');
 try{
  db.prepare(`
    INSERT INTO one_foundation_pilot_grants(student_id,approved_by,justification,expires_at)
    VALUES(?,?,?,?)
    ON CONFLICT(student_id) DO UPDATE SET approved_by=excluded.approved_by,
      justification=excluded.justification,expires_at=excluded.expires_at
  `).run(studentId,req.user.id,reason.trim(),date);
  return res.json({granted:true,expiresAt:new Date(when).toISOString(),paidAccessChanged:false});
 }catch(err){console.error('[Grade1 pilot grant]',err);return fail(res,'PILOT_GRANT_FAILED',500);}
});
