import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {db} from '../db/database.js';
import {authenticateToken,requireRole} from '../middleware/auth.js';
import {GRADE2_CURRICULUM} from '../data/grade2Curriculum.js';
import {checkStudentEntitlement} from '../services/subscriptionService.js';

export const grade2CurriculumRouter = Router();
grade2CurriculumRouter.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
grade2CurriculumRouter.use(authenticateToken);

const fail = (res,code,status=400,message='Unable to complete the Class 2 learning request.') =>
 res.status(status).json({code,message});
const canonicalBoard = b => (b === 'STATE_KARNATAKA' || b === 'STATE') ? 'STATE' : b;
const boardValid = b => canonicalBoard(b) === 'CBSE' || canonicalBoard(b) === 'STATE';
const evidenceOk = s => typeof s==='string'&&s.trim().length>=8&&s.trim().length<=120&&!/[<>]/.test(s);
const byBoard = board => GRADE2_CURRICULUM.official.find(b=>b.board===canonicalBoard(board));

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
  WHERE u.board=? AND u.grade=2 AND t.grade=2 AND t.board=?
  ORDER BY s.subject_title,ch.chapter_number,u.id
 `).all(board,board);
}

const questions = id => db.prepare(
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
 const cBoard = record ? canonicalBoard(record.board) : null;
 if(!record||record.grade!==2||!boardValid(record.board)||record.membership_status!=='active'||
    !db.prepare("SELECT 1 FROM one_academic_years WHERE student_id=? AND status='active' AND grade=2 AND board=?").get(studentId,cBoard)||
    !db.prepare('SELECT 1 FROM one_consent_reviews WHERE student_id=?').get(studentId)){
  fail(res,'CLASS2_ENROLMENT_REQUIRED',403);return null;
 }
 const trial=Boolean(db.prepare(
  "SELECT 1 FROM one_foundation_pilot_grants WHERE student_id=? AND expires_at>datetime('now')"
 ).get(studentId));
 const ent = checkStudentEntitlement(studentId);
 const effectiveStatus = ent.active ? 'enabled' : (ent.status === 'expired' ? 'expired' : record.entitlement_status);
 if(needAccess&&effectiveStatus!=='enabled'&&!trial){
  fail(res,'LEARNING_ACCESS_PENDING',403,ent.needsRenewal?'Your annual subscription has expired. Please renew to continue learning.':'An approved pilot grant or valid course entitlement is required.');return null;
 }
 return {...record,board:cBoard,entitlement_status:effectiveStatus,pilot:trial,needsRenewal:Boolean(ent.needsRenewal)};
}

function courseMap(board,showDraft){
 const track=db.prepare(`
  SELECT * FROM one_curriculum_tracks
  WHERE board=? AND grade=2 AND edition_year=? AND medium='English'
 `).get(board,GRADE2_CURRICULUM.edition);
 if(!track)return {board,grade:2,subjects:[],status:'not_mapped'};
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
   book:info?.book||(original?'Vayentra original course':'School edition to be verified'),
   reference:info?.source||null,
   sourceStatus:info?.status||(original?'original_draft':'edition_pending'),
   reviewStatus:subject.review_status,
   chapters:chapterList,
   approvedLessons:rows.filter(u=>u.subject_id===subject.id&&published(u)).length,
   plannedChapters:chapterList.length};
 });
 return {board,grade:2,edition:GRADE2_CURRICULUM.edition,trackId:track.id,
  trackStatus:track.catalogue_status,subjects:catalogSubjects,
  note:'Class 2 textbook chapter titles are mapped for curriculum planning. Vayentra original enrichment builds foundational AI & Financial literacy. Unapproved lessons stay locked.'};
}

function cleanUnit(row){
 const scene=db.prepare(
  'SELECT scene_json,step_text_json,teacher_prompt FROM one_foundation_picture_scenes WHERE unit_id=?'
 ).get(row.id);
 return {id:row.id,subject:row.subject_title,chapter:row.chapter_title,
  title:row.title,objective:row.objective,story:row.story,
  homeActivity:row.home_activity,expectedMinutes:row.expected_minutes,
  curriculumKind:row.curriculum_kind,
  pictureScene:(scene&&scene.scene_json&&scene.scene_json.trim()!==''&&scene.scene_json.trim()!=='{}')?JSON.parse(scene.scene_json):null,
  guidedSteps:scene?JSON.parse(scene.step_text_json):[],
  guardianGuide:scene?.teacher_prompt||null,
  questions:questions(row.id).map(q=>({
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
  return res.json({learner:{grade:2,board:owner.board},catalogue:map,
   access:authorised?'pilot_or_entitled':'locked',
   progress:authorised?summary(owner.id,owner.board):null});
 }catch(err){console.error('[Grade2 catalogue]',err);return fail(res,'CLASS2_CATALOGUE_FAILED',500);}
}

function lesson(req,res,selectedId){
 const owner=context(req,res,selectedId,true);if(!owner)return;
 try{
  const row=unitRows(owner.board).find(u=>u.id===req.params.unitId);
  if(!published(row))return fail(res,'LESSON_NOT_PUBLISHED',404);
  return res.json({lesson:cleanUnit(row),progress:summary(owner.id,owner.board)});
 }catch(err){console.error('[Grade2 lesson]',err);return fail(res,'CLASS2_LESSON_FAILED',500);}
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
  const scored=gradeChoice(unitId,answers),attemptId='one-g2-check-'+randomUUID();
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
  console.error('[Grade2 attempt]',err);return fail(res,'PRACTICE_SAVE_FAILED',500);
 }
}

grade2CurriculumRouter.get('/me/catalogue',requireRole('student'),(req,res)=>learnerCatalogue(req,res,null));
grade2CurriculumRouter.get('/me/units/:unitId',requireRole('student'),(req,res)=>lesson(req,res,null));
grade2CurriculumRouter.post('/me/attempts',requireRole('student'),(req,res)=>submit(req,res,null));
grade2CurriculumRouter.get('/guardian/:studentId/catalogue',requireRole('parent'),(req,res)=>learnerCatalogue(req,res,req.params.studentId));
grade2CurriculumRouter.get('/guardian/:studentId/units/:unitId',requireRole('parent'),(req,res)=>lesson(req,res,req.params.studentId));
grade2CurriculumRouter.post('/guardian/:studentId/attempts',requireRole('parent'),(req,res)=>submit(req,res,req.params.studentId));

// Privileged editorial access
grade2CurriculumRouter.get('/editor/map',requireRole(['admin','teacher','reviewer']),(req,res)=>{
 const board=req.query.board||'CBSE';if(!boardValid(board))return fail(res,'INVALID_BOARD');
 try{
  const map=courseMap(board,true);
  const units=unitRows(board).map(u=>({...cleanUnit(u),status:u.status,
   unitKey:u.unit_key,reviewerId:u.reviewer_id,reviewReference:u.review_reference,
   chapterReview:u.chapter_status,subjectReview:u.subject_status,trackStatus:u.track_status,
   questions:questions(u.id).map(q=>({...cleanUnit(u).questions.find(z=>z.id===q.id),
    correctIndex:q.answer_index,reason:q.explanation}))}));
  return res.json({curriculum:map,units,reviewRequired:true,
   guidance:'Class 2 curriculum architecture covers English, Mathematics, Hindi/Kannada, EVS, AI & Digital Literacy, and Financial Literacy.'});
 }catch(err){console.error('[Grade2 editorial map]',err);return fail(res,'EDITORIAL_MAP_FAILED',500);}
});

grade2CurriculumRouter.post('/editor/units/:unitId/request-review',requireRole(['teacher','admin']),(req,res)=>{
 const ticket=req.body?.editorialReference;
 if(!evidenceOk(ticket))return fail(res,'EDITORIAL_REFERENCE_REQUIRED');
 try{
  const u=db.prepare('SELECT * FROM one_foundation_units WHERE id=? AND grade=2').get(req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_FOUND',404);
  if(u.status!=='draft')return fail(res,'NOT_A_DRAFT',409);
  if(questions(u.id).length<1)return fail(res,'LESSON_INCOMPLETE',409);
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare("UPDATE one_foundation_units SET status='teacher_review' WHERE id=? AND status='draft'").run(u.id);
   db.prepare("INSERT INTO one_foundation_reviews(id,unit_id,actor_user_id,decision,evidence_reference) VALUES(?,?,?,'submitted',?)")
    .run('one-g2-review-'+randomUUID(),u.id,req.user.id,ticket.trim());
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({unitId:u.id,status:'teacher_review',message:'Submitted for independent editorial review.'});
 }catch(err){console.error('[Grade2 request review]',err);return fail(res,'REQUEST_REVIEW_FAILED',500);}
});

grade2CurriculumRouter.post('/editor/units/:unitId/review',requireRole('reviewer'),(req,res)=>{
 const {decision,evidenceReference}=req.body||{};
 if(!evidenceOk(evidenceReference))return fail(res,'EVIDENCE_REFERENCE_REQUIRED');
 if(!['approved','changes_requested'].includes(decision))return fail(res,'INVALID_DECISION');
 try{
  const u=db.prepare('SELECT * FROM one_foundation_units WHERE id=? AND grade=2').get(req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_FOUND',404);
  if(u.status!=='teacher_review')return fail(res,'NOT_IN_REVIEW',409);
  const nextStatus=decision==='approved'?'reviewed':'draft';
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare(`
    UPDATE one_foundation_units
    SET status=?,reviewer_id=?,review_reference=?,reviewed_at=datetime('now')
    WHERE id=?
   `).run(nextStatus,req.user.id,evidenceReference.trim(),u.id);
   db.prepare(`
    INSERT INTO one_foundation_reviews(id,unit_id,actor_user_id,decision,evidence_reference)
    VALUES(?,?,?,?,?)
   `).run('one-g2-review-'+randomUUID(),u.id,req.user.id,decision,evidenceReference.trim());
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({unitId:u.id,status:nextStatus,decision});
 }catch(err){console.error('[Grade2 review]',err);return fail(res,'REVIEW_DECISION_FAILED',500);}
});

grade2CurriculumRouter.post('/editor/units/:unitId/publish',requireRole('admin'),(req,res)=>{
 const ticket=req.body?.evidenceReference;
 if(!evidenceOk(ticket))return fail(res,'EVIDENCE_REFERENCE_REQUIRED');
 try{
  const u=db.prepare(`
   SELECT u.*,c.chapter_id,ch.subject_id,s.track_id FROM one_foundation_units u
   JOIN one_concepts c ON c.id=u.concept_id
   JOIN one_chapters ch ON ch.id=c.chapter_id
   JOIN one_subjects s ON s.id=ch.subject_id
   WHERE u.id=? AND u.grade=2
  `).get(req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_FOUND',404);
  if(u.status!=='reviewed')return fail(res,'REQUIRES_ACADEMIC_REVIEW',409);
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare(`
    UPDATE one_foundation_units
    SET status='published',publisher_id=?,published_at=datetime('now')
    WHERE id=?
   `).run(req.user.id,u.id);
   db.prepare(`
    INSERT INTO one_foundation_reviews(id,unit_id,actor_user_id,decision,evidence_reference)
    VALUES(?,?,?,'published',?)
   `).run('one-g2-review-'+randomUUID(),u.id,req.user.id,ticket.trim());
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({unitId:u.id,status:'published'});
 }catch(err){console.error('[Grade2 publish]',err);return fail(res,'PUBLICATION_FAILED',500);}
});

grade2CurriculumRouter.post('/editor/units/:unitId/withdraw',requireRole('admin'),(req,res)=>{
 const ticket=req.body?.evidenceReference;
 if(!evidenceOk(ticket))return fail(res,'EVIDENCE_REFERENCE_REQUIRED');
 try{
  const u=db.prepare('SELECT * FROM one_foundation_units WHERE id=? AND grade=2').get(req.params.unitId);
  if(!u)return fail(res,'UNIT_NOT_FOUND',404);
  if(u.status!=='published')return fail(res,'NOT_PUBLISHED',409);
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare("UPDATE one_foundation_units SET status='draft' WHERE id=?").run(u.id);
   db.prepare(`
    INSERT INTO one_foundation_reviews(id,unit_id,actor_user_id,decision,evidence_reference)
    VALUES(?,?,?,'withdrawn',?)
   `).run('one-g2-review-'+randomUUID(),u.id,req.user.id,ticket.trim());
   db.exec('COMMIT');
  }catch(err){db.exec('ROLLBACK');throw err;}
  return res.json({unitId:u.id,status:'draft',message:'Unit withdrawn to draft.'});
 }catch(err){console.error('[Grade2 withdraw]',err);return fail(res,'WITHDRAW_FAILED',500);}
});

grade2CurriculumRouter.post('/admin/pilot-grants',requireRole('admin'),(req,res)=>{
 const {studentId,expiresInDays,justification}=req.body||{};
 if(!studentId||typeof justification!=='string'||justification.trim().length<8)
  return fail(res,'PILOT_GRANT_INVALID');
 const student=db.prepare('SELECT id,grade FROM students WHERE id=?').get(studentId);
 if(!student||student.grade!==2)return fail(res,'CLASS2_STUDENT_REQUIRED',404);
 const days=Number.isInteger(expiresInDays)&&expiresInDays>=1&&expiresInDays<=60?expiresInDays:14;
 try{
  db.prepare(`
   INSERT OR REPLACE INTO one_foundation_pilot_grants(student_id,approved_by,justification,expires_at)
   VALUES(?,?,?,datetime('now','+'||?||' days'))
  `).run(studentId,req.user.id,justification.trim(),days);
  return res.status(201).json({studentId,expiresInDays:days,granted:true});
 }catch(err){console.error('[Grade2 pilot grant]',err);return fail(res,'PILOT_GRANT_FAILED',500);}
});

// Teacher Mastery & Progress Tracking
grade2CurriculumRouter.get('/teacher/mastery/:studentId',requireRole(['teacher','admin','reviewer']),(req,res)=>{
 const s=db.prepare('SELECT id,name,grade,board FROM students WHERE id=?').get(req.params.studentId);
 if(!s||s.grade!==2)return fail(res,'CLASS2_STUDENT_REQUIRED',404);
 const mastery=db.prepare(`
  SELECT m.concept_id,c.title,m.mastery,m.updated_at,u.name AS teacher_name
  FROM one_concept_mastery m
  JOIN one_concepts c ON c.id=m.concept_id
  LEFT JOIN users u ON u.id=m.teacher_id
  WHERE m.student_id=?
 `).all(s.id);
 const attempts=db.prepare(`
  SELECT a.unit_id,u.objective,a.correct_count,a.total_count,a.created_at
  FROM one_foundation_attempts a
  JOIN one_foundation_units u ON u.id=a.unit_id
  WHERE a.student_id=? ORDER BY a.created_at DESC LIMIT 50
 `).all(s.id);
 return res.json({student:s,mastery,recentAttempts:attempts});
});

grade2CurriculumRouter.post('/teacher/mastery',requireRole(['teacher','admin']),(req,res)=>{
 const {studentId,conceptId,mastery}=req.body||{};
 if(!studentId||!conceptId||!['not_started','practising','needs_help','teacher_confirmed'].includes(mastery)){
  return fail(res,'INVALID_MASTERY_PAYLOAD');
 }
 const s=db.prepare('SELECT id,grade FROM students WHERE id=?').get(studentId);
 if(!s||s.grade!==2)return fail(res,'CLASS2_STUDENT_REQUIRED',404);
 try{
  db.prepare(`
   INSERT OR REPLACE INTO one_concept_mastery(student_id,concept_id,mastery,teacher_id,updated_at)
   VALUES(?,?,?,?,datetime('now'))
  `).run(studentId,conceptId,mastery,req.user.id);
  return res.json({studentId,conceptId,mastery,updatedBy:req.user.name});
 }catch(err){console.error('[Grade2 mastery post]',err);return fail(res,'MASTERY_UPDATE_FAILED',500);}
});
