import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {db} from '../db/database.js';
import {authenticateToken,requireRole,requireChildOwnership} from '../middleware/auth.js';

export const oneContentRouter=Router();
oneContentRouter.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
oneContentRouter.use(authenticateToken);
const fail=(res,code,status=400,message='Request could not be completed.')=>
 res.status(status).json({code,message});
const str=(value,max=120)=>typeof value==='string'?value.trim().slice(0,max+1):'';
const check=(value,max,min=2)=>value.length>=min&&value.length<=max&&!/[<>]/.test(value);
const id=prefix=>prefix+'-'+randomUUID();
function editorialLog(req,type,item,ref,rights=false,decision='approved'){
 db.prepare("INSERT INTO one_content_review_logs(id,item_type,item_id,reviewer_id,editorial_reference,rights_attested,decision) VALUES(?,?,?,?,?,?,?)")
  .run(id('onereview'),type,item,req.user.id,ref,rights?1:0,decision);
}

function audit(req,studentId,action,detail){
 if(studentId)db.prepare('INSERT INTO one_journey_audit(id,actor_user_id,student_id,action,detail_code) VALUES(?,?,?,?,?)')
   .run(id('oneaudit'),req.user.id,studentId,action,detail);
}
// PRIVATE learning outline; a parent's link to their child alone is insufficient without active membership/entitlement.
oneContentRouter.get('/students/:studentId/outline',requireRole(['parent','admin']),requireChildOwnership,(req,res)=>{
 const studentId=req.params.studentId;
 try{
  const student=db.prepare('SELECT id,grade,board FROM students WHERE id=?').get(studentId);
  if(!student)return fail(res,'STUDENT_NOT_FOUND',404);
  const membership=db.prepare('SELECT membership_status,entitlement_status FROM one_memberships WHERE student_id=?').get(studentId);
  if(req.user.role!=='admin'&&(!membership||membership.membership_status!=='active'||membership.entitlement_status!=='enabled'))
   return fail(res,'MEMBERSHIP_ACCESS_PENDING',403,'Learning access is not enabled for this student.');
  const tracks=db.prepare(`
   SELECT * FROM one_curriculum_tracks WHERE board=? AND grade=?
   AND catalogue_status='verified' ORDER BY edition_year DESC
  `).all(student.board,student.grade);
  const track=tracks[0];
  if(!track)return res.json({grade:student.grade,board:student.board,subjects:[],message:'No verified Vayentra ONE curriculum content is published for this class and board yet.'});
  const rows=db.prepare(`
    SELECT s.id AS subject_id,s.subject_title,ch.id AS chapter_id,ch.chapter_number,ch.chapter_title,
      c.id AS concept_id,c.position,c.title,c.explanation_original,c.misconception_tip
    FROM one_subjects s
    JOIN one_chapters ch ON ch.subject_id=s.id AND ch.review_status='reviewed'
    JOIN one_concepts c ON c.chapter_id=ch.id AND c.content_status='published'
    WHERE s.track_id=? AND s.review_status='reviewed'
    ORDER BY s.subject_title,ch.chapter_number,c.position
  `).all(track.id);
  const subjects=new Map();
  for(const row of rows){
   if(!subjects.has(row.subject_id))subjects.set(row.subject_id,{id:row.subject_id,title:row.subject_title,chapters:[]});
   const subject=subjects.get(row.subject_id);
   let chapter=subject.chapters.find(ch=>ch.id===row.chapter_id);
   if(!chapter){
    chapter={id:row.chapter_id,number:row.chapter_number,title:row.chapter_title,concepts:[]};
    subject.chapters.push(chapter);
   }
   chapter.concepts.push({id:row.concept_id,position:row.position,title:row.title,
    explanation:row.explanation_original,misconceptionTip:row.misconception_tip});
  }
  return res.json({grade:student.grade,board:student.board,editionYear:track.edition_year,
   subjects:[...subjects.values()]});
 }catch(err){console.error('[ONE content private outline]',err);return fail(res,'CONTENT_LOAD_FAILED',500);}
});

/**
 * UNIFIED LEARNING PROGRESS ENGINE (Classes 1–10)
 * Stores and retrieves persistent lesson attempts and concept mastery by canonical learner ID.
 */
oneContentRouter.get('/progress', requireRole(['student', 'parent', 'admin']), (req, res) => {
  try {
    let studentId = req.user.studentId;
    if (req.user.role === 'parent' || req.user.role === 'admin') {
      const targetId = req.query.studentId;
      if (targetId) {
        if (req.user.role === 'parent') {
          const student = db.prepare('SELECT id, guardian_id FROM students WHERE id = ?').get(targetId);
          if (!student || student.guardian_id !== req.user.guardianId) {
            return fail(res, 'STUDENT_ACCESS_DENIED', 403, 'You can only view progress for your linked children.');
          }
        }
        studentId = targetId;
      }
    }

    if (!studentId) {
      return fail(res, 'STUDENT_ID_REQUIRED', 400, 'Student profile identifier is required.');
    }

    const masteryRows = db.prepare(`
      SELECT concept_id, mastery, updated_at
      FROM one_concept_mastery
      WHERE student_id = ?
    `).all(studentId);

    const foundationAttempts = db.prepare(`
      SELECT id, unit_id, correct_count, total_count, created_at
      FROM one_foundation_attempts
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(studentId);

    const testAttempts = db.prepare(`
      SELECT id, test_id as unit_id, score_percent, correct_count, total_questions as total_count, submitted_at as created_at
      FROM test_attempts
      WHERE student_id = ?
      ORDER BY submitted_at DESC
      LIMIT 100
    `).all(studentId);

    const completedLessonIds = Array.from(new Set([
      ...masteryRows.map(m => m.concept_id),
      ...foundationAttempts.map(a => a.unit_id),
      ...testAttempts.map(t => t.unit_id)
    ]));

    return res.json({
      success: true,
      studentId,
      completedLessonIds,
      mastery: masteryRows,
      recentAttempts: [...testAttempts, ...foundationAttempts].slice(0, 100)
    });
  } catch (err) {
    console.error('[Unified Progress GET Error]:', err);
    return fail(res, 'PROGRESS_FETCH_FAILED', 500);
  }
});

oneContentRouter.post('/progress', requireRole(['student', 'parent', 'admin']), (req, res) => {
  try {
    const { lessonId, score, totalQuestions, answers, idempotencyKey } = req.body;
    let studentId = req.user.studentId;

    if (req.user.role === 'parent' || req.user.role === 'admin') {
      if (req.body.studentId) {
        if (req.user.role === 'parent') {
          const student = db.prepare('SELECT id, guardian_id FROM students WHERE id = ?').get(req.body.studentId);
          if (!student || student.guardian_id !== req.user.guardianId) {
            return fail(res, 'STUDENT_ACCESS_DENIED', 403, 'You can only record progress for your linked children.');
          }
        }
        studentId = req.body.studentId;
      }
    }

    if (!studentId) {
      return fail(res, 'STUDENT_ID_REQUIRED', 400, 'Student account link required.');
    }

    if (!lessonId) {
      return fail(res, 'LESSON_ID_REQUIRED', 400, 'Lesson identifier is required.');
    }

    // Verify student entitlement status
    const membership = db.prepare('SELECT entitlement_status FROM one_memberships WHERE student_id = ?').get(studentId);
    const subscription = db.prepare(`
      SELECT status, expires_at FROM student_subscriptions
      WHERE student_id = ? AND expires_at > datetime('now')
    `).get(studentId);

    const isEntitled = req.user.role === 'admin' ||
      (membership && membership.entitlement_status === 'enabled') ||
      (subscription && subscription.status === 'active');

    if (!isEntitled) {
      return fail(res, 'ENTITLEMENT_REQUIRED', 403, 'An active ₹599 annual learning entitlement is required to save persistent progress.');
    }

    const key = idempotencyKey || ('att-' + randomUUID());
    const existing = db.prepare('SELECT id FROM one_foundation_attempts WHERE student_id = ? AND idempotency_key = ?').get(studentId, key);
    if (existing) {
      return res.json({ success: true, idempotent: true, attemptId: existing.id });
    }

    const total = Number.isInteger(totalQuestions) && totalQuestions > 0 ? totalQuestions : 1;
    const computedScore = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 100;
    const correctCount = Math.round((computedScore / 100) * total);
    const attemptId = 'one-att-' + randomUUID();

    db.exec('BEGIN IMMEDIATE;');
    try {
      // 1. Universally persist attempt to test_attempts (compatible with all Classes 1–10)
      db.prepare(`
        INSERT INTO test_attempts (
          id, student_id, test_id, title, score_percent,
          correct_count, total_questions, answers_json, passed, duration_secs, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 60, datetime('now'))
      `).run(
        attemptId,
        studentId,
        lessonId,
        req.body.lessonTitle || lessonId,
        computedScore,
        correctCount,
        total,
        JSON.stringify(answers || {}),
        computedScore >= 60 ? 1 : 0
      );

      // 2. If unit exists in one_foundation_units, also record in one_foundation_attempts
      const fUnit = db.prepare('SELECT id FROM one_foundation_units WHERE id = ?').get(lessonId);
      if (fUnit) {
        db.prepare(`
          INSERT INTO one_foundation_attempts (
            id, student_id, unit_id, attempted_by, idempotency_key,
            answers_json, correct_count, total_count, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(attemptId, studentId, lessonId, req.user.id, key, JSON.stringify(answers || []), correctCount, total);
      }

      // 3. If concept exists in one_concepts, record mastery
      const cConcept = db.prepare('SELECT id FROM one_concepts WHERE id = ?').get(lessonId);
      if (cConcept) {
        const masteryLevel = computedScore >= 60 ? 'practising' : 'needs_help';
        db.prepare(`
          INSERT INTO one_concept_mastery (student_id, concept_id, mastery, updated_at)
          VALUES (?, ?, ?, datetime('now'))
          ON CONFLICT(student_id, concept_id) DO UPDATE SET
            mastery = excluded.mastery,
            updated_at = datetime('now')
        `).run(studentId, lessonId, masteryLevel);
      }

      db.exec('COMMIT;');

      return res.json({
        success: true,
        attemptId,
        studentId,
        lessonId,
        score: computedScore,
        mastery: computedScore >= 60 ? 'mastered' : 'practicing',
        message: 'Progress securely saved to learner profile.'
      });
    } catch (saveErr) {
      db.exec('ROLLBACK;');
      throw saveErr;
    }
  } catch (err) {
    console.error('[Unified Progress POST Error]:', err);
    return fail(res, 'PROGRESS_SAVE_FAILED', 500);
  }
});

oneContentRouter.use('/admin',requireRole('admin'));
// Authoring state, visible only to the institutional administrator.
oneContentRouter.get('/admin/tracks/:trackId/map',(req,res)=>{
 try{
  const track=db.prepare('SELECT * FROM one_curriculum_tracks WHERE id=?').get(req.params.trackId);
  if(!track)return fail(res,'TRACK_NOT_FOUND',404);
  const subjects=db.prepare('SELECT * FROM one_subjects WHERE track_id=? ORDER BY subject_title').all(track.id);
  const chapters=db.prepare(`
    SELECT ch.* FROM one_chapters ch JOIN one_subjects s ON s.id=ch.subject_id
    WHERE s.track_id=? ORDER BY s.subject_title,ch.chapter_number
  `).all(track.id);
  const concepts=db.prepare(`
    SELECT c.* FROM one_concepts c JOIN one_chapters ch ON ch.id=c.chapter_id
    JOIN one_subjects s ON s.id=ch.subject_id WHERE s.track_id=?
    ORDER BY ch.chapter_number,c.position
  `).all(track.id);
  return res.json({
   track:{id:track.id,grade:track.grade,board:track.board,editionYear:track.edition_year,
    publisherReference:track.publisher_reference,status:track.catalogue_status},
   subjects:subjects.map(subject=>({
    id:subject.id,title:subject.subject_title,status:subject.review_status,
    chapters:chapters.filter(ch=>ch.subject_id===subject.id).map(ch=>({
     id:ch.id,number:ch.chapter_number,title:ch.chapter_title,edition:ch.textbook_edition,status:ch.review_status,
     concepts:concepts.filter(c=>c.chapter_id===ch.id).map(c=>({
      id:c.id,position:c.position,title:c.title,status:c.content_status,
      hasExplanation:Boolean(c.explanation_original),reviewedAt:c.reviewed_at
     }))
    }))
   }))
  });
 }catch(err){console.error('[ONE curriculum map]',err);return fail(res,'MAP_LOAD_FAILED',500);}
});
oneContentRouter.post('/admin/tracks/:trackId/verify',(req,res)=>{
 const ticket=str(req.body?.editorialReference,120);
 if(!check(ticket,120,6))return fail(res,'EDITORIAL_REFERENCE_REQUIRED');
 try{
  const track=db.prepare('SELECT * FROM one_curriculum_tracks WHERE id=?').get(req.params.trackId);
  if(!track)return fail(res,'TRACK_NOT_FOUND',404);
  db.prepare("UPDATE one_curriculum_tracks SET catalogue_status='verified',verified_at=datetime('now') WHERE id=?").run(track.id);
  editorialLog(req,'track',track.id,ticket);
  return res.json({verified:true,warning:'Only verify after comparing the current edition against the official publisher curriculum and recording the external review evidence.'});
 }catch(err){console.error('[ONE track verify]',err);return fail(res,'UPDATE_FAILED',500);}
});
oneContentRouter.post('/admin/tracks/:trackId/subjects',(req,res)=>{
 const title=str(req.body?.title,100);
 if(!check(title,100))return fail(res,'INVALID_SUBJECT');
 try{
  if(!db.prepare('SELECT id FROM one_curriculum_tracks WHERE id=?').get(req.params.trackId))
   return fail(res,'TRACK_NOT_FOUND',404);
  const subjectId=id('onesub');
  db.prepare("INSERT INTO one_subjects(id,track_id,subject_title) VALUES(?,?,?)")
    .run(subjectId,req.params.trackId,title);
  return res.status(201).json({id:subjectId,status:'draft'});
 }catch(err){if(String(err.message).includes('UNIQUE'))return fail(res,'SUBJECT_EXISTS',409);
  console.error('[ONE subject draft]',err);return fail(res,'SAVE_FAILED',500);}
});
oneContentRouter.post('/admin/subjects/:subjectId/approve',(req,res)=>{
 const evidence=str(req.body?.academicReviewReference,120);
 if(!check(evidence,120,6))return fail(res,'REVIEW_REFERENCE_REQUIRED');
 try{
  const subject=db.prepare('SELECT s.*,t.catalogue_status FROM one_subjects s JOIN one_curriculum_tracks t ON t.id=s.track_id WHERE s.id=?').get(req.params.subjectId);
  if(!subject)return fail(res,'SUBJECT_NOT_FOUND',404);
  if(subject.catalogue_status!=='verified')return fail(res,'TRACK_NOT_VERIFIED',409);
  db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(subject.id);
  editorialLog(req,'subject',subject.id,evidence);
  return res.json({approved:true});
 }catch(err){console.error('[ONE subject review]',err);return fail(res,'UPDATE_FAILED',500);}
});
oneContentRouter.post('/admin/subjects/:subjectId/chapters',(req,res)=>{
 const title=str(req.body?.title,150),edition=str(req.body?.textbookEdition,80),num=Number(req.body?.number);
 if(!check(title,150)||!check(edition,80)||!Number.isInteger(num)||num<1||num>200)
  return fail(res,'INVALID_CHAPTER');
 try{
  if(!db.prepare('SELECT id FROM one_subjects WHERE id=?').get(req.params.subjectId))
   return fail(res,'SUBJECT_NOT_FOUND',404);
  const chapterId=id('onechapter');
  db.prepare(`
   INSERT INTO one_chapters(id,subject_id,chapter_number,chapter_title,textbook_edition)
   VALUES(?,?,?,?,?)
  `).run(chapterId,req.params.subjectId,num,title,edition);
  return res.status(201).json({id:chapterId,status:'draft'});
 }catch(err){if(String(err.message).includes('UNIQUE'))return fail(res,'CHAPTER_EXISTS',409);
  console.error('[ONE chapter draft]',err);return fail(res,'SAVE_FAILED',500);}
});
oneContentRouter.post('/admin/chapters/:chapterId/approve',(req,res)=>{
 const evidence=str(req.body?.academicReviewReference,120);
 if(!check(evidence,120,6))return fail(res,'REVIEW_REFERENCE_REQUIRED');
 try{
  const row=db.prepare(`
   SELECT ch.id,s.review_status AS subject_review FROM one_chapters ch
   JOIN one_subjects s ON s.id=ch.subject_id WHERE ch.id=?
  `).get(req.params.chapterId);
  if(!row)return fail(res,'CHAPTER_NOT_FOUND',404);
  if(row.subject_review!=='reviewed')return fail(res,'SUBJECT_NOT_REVIEWED',409);
  db.prepare("UPDATE one_chapters SET review_status='reviewed' WHERE id=?").run(row.id);
  editorialLog(req,'chapter',row.id,evidence);
  return res.json({approved:true});
 }catch(err){console.error('[ONE chapter review]',err);return fail(res,'UPDATE_FAILED',500);}
});
oneContentRouter.post('/admin/chapters/:chapterId/concepts',(req,res)=>{
 const title=str(req.body?.title,150),explanation=str(req.body?.explanation,10000),
  misconceptionTip=str(req.body?.misconceptionTip,1000),
  position=Number(req.body?.position);
 if(!check(title,150)||!Number.isInteger(position)||position<1||position>200||
    explanation.length>10000||misconceptionTip.length>1000)
  return fail(res,'INVALID_CONCEPT');
 try{
  if(!db.prepare('SELECT id FROM one_chapters WHERE id=?').get(req.params.chapterId))
   return fail(res,'CHAPTER_NOT_FOUND',404);
  const conceptId=id('oneconcept');
  db.prepare(`
   INSERT INTO one_concepts(id,chapter_id,position,title,explanation_original,misconception_tip)
   VALUES(?,?,?,?,?,?)
  `).run(conceptId,req.params.chapterId,position,title,explanation||null,misconceptionTip||null);
  return res.status(201).json({id:conceptId,status:'draft'});
 }catch(err){if(String(err.message).includes('UNIQUE'))return fail(res,'CONCEPT_POSITION_EXISTS',409);
  console.error('[ONE concept draft]',err);return fail(res,'SAVE_FAILED',500);}
});
oneContentRouter.post('/admin/concepts/:conceptId/request-review',(req,res)=>{
 try{
  const row=db.prepare('SELECT id,explanation_original FROM one_concepts WHERE id=?').get(req.params.conceptId);
  if(!row)return fail(res,'CONCEPT_NOT_FOUND',404);
  if(!row.explanation_original||row.explanation_original.length<120)return fail(res,'LESSON_NOT_COMPLETE',409);
  db.prepare("UPDATE one_concepts SET content_status='teacher_review' WHERE id=? AND content_status='draft'").run(row.id);
  return res.json({reviewRequested:true});
 }catch(err){console.error('[ONE concept submit]',err);return fail(res,'UPDATE_FAILED',500);}
});
oneContentRouter.post('/admin/concepts/:conceptId/publish',(req,res)=>{
 const reviewRef=str(req.body?.academicReviewReference,120);
 const rightsConfirmed=req.body?.originalContentRightsConfirmed===true;
 if(!check(reviewRef,120,6)||!rightsConfirmed)return fail(res,'ACADEMIC_AND_RIGHTS_REVIEW_REQUIRED');
 try{
  const row=db.prepare(`
   SELECT c.id,c.content_status,c.explanation_original,ch.review_status AS chapter_review,
    s.review_status AS subject_review,t.catalogue_status AS track_review
   FROM one_concepts c JOIN one_chapters ch ON ch.id=c.chapter_id
   JOIN one_subjects s ON s.id=ch.subject_id
   JOIN one_curriculum_tracks t ON t.id=s.track_id WHERE c.id=?
  `).get(req.params.conceptId);
  if(!row)return fail(res,'CONCEPT_NOT_FOUND',404);
  if(row.content_status!=='teacher_review'||!row.explanation_original||
    row.explanation_original.length<120||row.chapter_review!=='reviewed'||
    row.subject_review!=='reviewed'||row.track_review!=='verified')
   return fail(res,'CONTENT_STILL_UNREVIEWED',409);
  db.prepare(`
   UPDATE one_concepts SET content_status='published',reviewer_id=?,reviewed_at=datetime('now')
   WHERE id=?
  `).run(req.user.id,row.id);
  editorialLog(req,'concept',row.id,reviewRef,true,'published');
  return res.json({published:true,message:'Original Vayentra explanation is now available to appropriately entitled learners.'});
 }catch(err){console.error('[ONE concept publish]',err);return fail(res,'PUBLISH_FAILED',500);}
});
