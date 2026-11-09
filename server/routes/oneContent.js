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

oneContentRouter.use('/admin',requireRole('admin'));
oneContentRouter.post('/admin/tracks/:trackId/verify',(req,res)=>{
 const ticket=str(req.body?.editorialReference,120);
 if(!check(ticket,120,6))return fail(res,'EDITORIAL_REFERENCE_REQUIRED');
 try{
  const track=db.prepare('SELECT * FROM one_curriculum_tracks WHERE id=?').get(req.params.trackId);
  if(!track)return fail(res,'TRACK_NOT_FOUND',404);
  db.prepare("UPDATE one_curriculum_tracks SET catalogue_status='verified',verified_at=datetime('now') WHERE id=?").run(track.id);
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
  return res.json({published:true,message:'Original Vayentra explanation is now available to appropriately entitled learners.'});
 }catch(err){console.error('[ONE concept publish]',err);return fail(res,'PUBLISH_FAILED',500);}
});
