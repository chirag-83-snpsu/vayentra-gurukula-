import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db/database.js';
import { authenticateToken,requireRole,requireChildOwnership } from '../middleware/auth.js';

export const journeyRouter=Router();
journeyRouter.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
const YEAR=/^(\d{4})-(\d{2})$/;
function validYear(value){
 if(typeof value!=='string')return false;
 const m=value.match(YEAR);
 return Boolean(m)&&((Number(m[1])+1)%100===Number(m[2]));
}
function nextYear(prev){
 if(!validYear(prev))return null;
 const first=Number(prev.slice(0,4))+1;
 return first+'-'+String((first+1)%100).padStart(2,'0');
}
function fail(res,code,status=400,message='The request could not be completed.'){
 return res.status(status).json({code,message});
}
function audit(actor,student,action,detail){
 db.prepare('INSERT INTO one_journey_audit (id,actor_user_id,student_id,action,detail_code) VALUES(?,?,?,?,?)')
   .run('oneaudit-'+randomUUID(),actor,student,action,detail);
}
function membership(studentId){
 return db.prepare('SELECT * FROM one_memberships WHERE student_id=?').get(studentId);
}
function ownerStudent(studentId){
 return db.prepare('SELECT id,name,grade,board,enrollment_number,guardian_id FROM students WHERE id=?').get(studentId);
}
function atomic(fn){
 db.exec('BEGIN IMMEDIATE');
 try{const value=fn();db.exec('COMMIT');return value;}
 catch(err){db.exec('ROLLBACK');throw err;}
}
// Public catalogue returns only verified/published source metadata. No pricing or child data.
journeyRouter.get('/catalogue',(req,res)=>{
 const grade=req.query.grade===undefined?null:Number(req.query.grade);
 const board=req.query.board||null;
 if(grade!==null&&(!Number.isInteger(grade)||grade<1||grade>10))
  return fail(res,'INVALID_GRADE');
 if(board!==null&&!['CBSE','STATE'].includes(board))return fail(res,'INVALID_BOARD');
 try{
  const records=db.prepare(`
    SELECT t.id,t.board,t.grade,t.edition_year,t.publisher_reference,t.catalogue_status,
      (SELECT COUNT(*) FROM one_subjects s WHERE s.track_id=t.id AND s.review_status='reviewed') AS reviewed_subjects,
      (SELECT COUNT(*) FROM one_concepts c JOIN one_chapters ch ON ch.id=c.chapter_id
        JOIN one_subjects s ON s.id=ch.subject_id
        WHERE s.track_id=t.id AND c.content_status='published') AS published_concepts
    FROM one_curriculum_tracks t
    WHERE (? IS NULL OR t.grade=?) AND (? IS NULL OR t.board=?)
    ORDER BY t.board,t.grade
  `).all(grade,grade,board,board);
  return res.json({tracks:records.map(x=>({
   id:x.id,board:x.board,grade:x.grade,editionYear:x.edition_year,
   publisherReference:x.publisher_reference,status:x.catalogue_status,
   reviewedSubjects:x.reviewed_subjects,publishedConcepts:x.published_concepts
  }))});
 }catch(err){console.error('[ONE catalogue]',err);return fail(res,'CATALOGUE_FAILED',500);}
});
journeyRouter.use(authenticateToken);

// Only guardians of their linked learner, or administrators, can read private year/mark history.
journeyRouter.get('/students/:studentId',requireRole(['parent','admin']),requireChildOwnership,(req,res)=>{
 try{
  const student=ownerStudent(req.params.studentId);
  if(!student)return fail(res,'STUDENT_NOT_FOUND',404);
  const member=membership(student.id);
  const years=db.prepare(`
    SELECT id,academic_year,grade,board,status,started_at,completed_at
    FROM one_academic_years WHERE student_id=? ORDER BY academic_year ASC
  `).all(student.id);
  const marks=db.prepare(`
    SELECT m.id,m.academic_year_id,m.exam_label,m.subject,m.marks_obtained,m.marks_maximum,
       m.evidence_status,m.created_at
    FROM one_mark_entries m WHERE m.student_id=? ORDER BY m.created_at DESC
  `).all(student.id);
  const documents=db.prepare(`
    SELECT id,academic_year_id,document_kind,original_name,review_status,created_at
    FROM one_document_metadata WHERE student_id=? ORDER BY created_at DESC
  `).all(student.id);
  return res.json({
   student:{id:student.id,name:student.name,grade:student.grade,board:student.board,
     enrollmentNumber:student.enrollment_number},
   membership:member?{
    initialGrade:member.initial_grade,initialYear:member.initial_year,targetGrade:member.target_grade,
    status:member.membership_status,entitlement:member.entitlement_status,
    joinedAt:member.created_at
   }:null,
   academicYears:years.map(y=>({id:y.id,year:y.academic_year,grade:y.grade,
    board:y.board,status:y.status,startedAt:y.started_at,completedAt:y.completed_at})),
   marks:marks.map(m=>({id:m.id,academicYearId:m.academic_year_id,exam:m.exam_label,subject:m.subject,
    obtained:m.marks_obtained,maximum:m.marks_maximum,
    evidenceStatus:m.evidence_status,createdAt:m.created_at})),
   documents:documents.map(d=>({id:d.id,academicYearId:d.academic_year_id,kind:d.document_kind,
    fileName:d.original_name,reviewStatus:d.review_status,createdAt:d.created_at})),
   uploadAvailable:false,
   academicPolicy:'Self-reported marks are not verified school results. Document uploads require a secure private vault.'
  });
 }catch(err){console.error('[ONE student timeline]',err);return fail(res,'JOURNEY_LOAD_FAILED',500);}
});

journeyRouter.post('/students/:studentId/marks',requireRole('parent'),requireChildOwnership,(req,res)=>{
 const studentId=req.params.studentId;const body=req.body||{};
 const yearId=typeof body.academicYearId==='string'?body.academicYearId:'';
 const subject=typeof body.subject==='string'?body.subject.trim():'';
 const exam=typeof body.exam==='string'?body.exam.trim():'';
 const obtained=Number(body.obtained),max=Number(body.maximum);
 if(!yearId||subject.length<2||subject.length>80||exam.length<2||exam.length>80||
    /[<>]/.test(subject+exam)||!Number.isFinite(obtained)||!Number.isFinite(max)||
    obtained<0||max<=0||max>1000||obtained>max||
    !Number.isInteger(Math.round(obtained*100))||!Number.isInteger(Math.round(max*100)))
  return fail(res,'INVALID_MARK_ENTRY',400,'Enter a subject, exam, and marks between 0 and the maximum.');
 try{
  const member=membership(studentId);
  if(!member||member.membership_status!=='active')
   return fail(res,'ACTIVE_JOURNEY_REQUIRED',403,'A verified, active Vayentra ONE enrolment is required.');
  const year=db.prepare('SELECT * FROM one_academic_years WHERE id=? AND student_id=?').get(yearId,studentId);
  if(!year||!['active','completed'].includes(year.status))return fail(res,'YEAR_NOT_FOUND',404);
  const id='onemark-'+randomUUID();
  atomic(()=>{
   db.prepare(`
    INSERT INTO one_mark_entries
    (id,student_id,academic_year_id,subject,exam_label,marks_obtained,marks_maximum,created_by)
    VALUES(?,?,?,?,?,?,?,?)
   `).run(id,studentId,yearId,subject,exam,obtained,max,req.user.id);
   audit(req.user.id,studentId,'MARK_ENTRY_CREATED','SELF_REPORTED');
  });
  return res.status(201).json({saved:true,id,evidenceStatus:'self_reported',
   message:'Saved as parent-reported marks. These are not verified school results.'});
 }catch(err){console.error('[ONE mark save]',err);return fail(res,'MARK_SAVE_FAILED',500);}
});

// Staff administration routes deliberately require authenticated administrator role.
journeyRouter.use('/admin',requireRole('admin'));

journeyRouter.post('/admin/students/:studentId/enrol',(req,res)=>{
 const id=req.params.studentId,year=req.body?.academicYear;
 if(!validYear(year))return fail(res,'INVALID_ACADEMIC_YEAR');
 try{
  const student=ownerStudent(id);
  if(!student)return fail(res,'STUDENT_NOT_FOUND',404);
  if(!['CBSE','STATE'].includes(student.board)||student.grade<1||student.grade>10)
   return fail(res,'BOARD_OR_GRADE_UNSUPPORTED');
  if(membership(id))return fail(res,'ALREADY_ENROLLED',409,'This student already has a Vayentra ONE identity.');
  const recordId='oneyear-'+randomUUID();
  atomic(()=>{
   db.prepare(`
    INSERT INTO one_memberships(student_id,guardian_id,initial_grade,initial_year)
    VALUES(?,?,?,?)
   `).run(id,student.guardian_id,student.grade,year);
   db.prepare(`
    INSERT INTO one_academic_years(id,student_id,academic_year,grade,board,status)
    VALUES(?,?,?,?,?,'pending')
   `).run(recordId,id,year,student.grade,student.board);
   audit(req.user.id,id,'JOURNEY_CREATED','PENDING_VERIFIED_GUARDIAN_CONSENT');
  });
  return res.status(201).json({studentId:id,status:'pending_consent',
   message:'Student identity reserved. Guardian verification and explicit consent review are required before activation.'});
 }catch(err){console.error('[ONE enrol]',err);return fail(res,'ENROLMENT_FAILED',500);}
});

journeyRouter.post('/admin/students/:studentId/record-consent-review',(req,res)=>{
 const id=req.params.studentId,body=req.body||{};
 const method=body.verificationMethod,ref=typeof body.evidenceReference==='string'?body.evidenceReference.trim():'',
  notice=typeof body.noticeVersion==='string'?body.noticeVersion.trim():'';
 if(!['verified_in_person','verified_parent_records','verified_digilocker'].includes(method)||
    ref.length<4||ref.length>100||notice.length<3||notice.length>50)
   return fail(res,'CONSENT_REVIEW_INVALID',400,
    'Record an actual verified guardian consent process and internal evidence reference, never an identity number.');
 try{
  const member=membership(id);
  if(!member||member.membership_status!=='pending_consent')return fail(res,'PENDING_MEMBER_REQUIRED',409);
  if(db.prepare('SELECT student_id FROM one_consent_reviews WHERE student_id=?').get(id))
   return fail(res,'CONSENT_REVIEW_EXISTS',409);
  atomic(()=>{
   db.prepare(`
    INSERT INTO one_consent_reviews
     (student_id,guardian_id,notice_version,verification_method,evidence_reference,verified_by)
    VALUES(?,?,?,?,?,?)
   `).run(id,member.guardian_id,notice,method,ref,req.user.id);
   audit(req.user.id,id,'GUARDIAN_REVIEW_RECORDED','MANUAL_REVIEW_ATTESTED');
  });
  return res.json({recorded:true,warning:'This review record is an administrative attestation, not automatic legal verification.'});
 }catch(err){console.error('[ONE consent review]',err);return fail(res,'CONSENT_REVIEW_FAILED',500);}
});

journeyRouter.post('/admin/students/:studentId/activate',(req,res)=>{
 const id=req.params.studentId;
 try{
  const member=membership(id);
  if(!member||member.membership_status!=='pending_consent')
   return fail(res,'PENDING_MEMBER_REQUIRED',409);
  if(!db.prepare('SELECT student_id FROM one_consent_reviews WHERE student_id=?').get(id))
   return fail(res,'GUARDIAN_CONSENT_REVIEW_REQUIRED',403);
  atomic(()=>{
   const yr=db.prepare("SELECT id FROM one_academic_years WHERE student_id=? AND status='pending'").get(id);
   if(!yr)throw new Error('PENDING_ACADEMIC_YEAR_REQUIRED');
   db.prepare("UPDATE one_memberships SET membership_status='active',updated_at=datetime('now') WHERE student_id=?").run(id);
   db.prepare("UPDATE one_academic_years SET status='active',started_at=datetime('now') WHERE id=?").run(yr.id);
   audit(req.user.id,id,'JOURNEY_ACTIVATED','VERIFIED_CONSENT_REVIEW_RECORDED');
  });
  return res.json({activated:true,entitlementStatus:'not_configured',
   message:'Journey activated. Paid access remains unconfigured and is not charged automatically.'});
 }catch(err){console.error('[ONE activate]',err);return fail(res,'ACTIVATION_FAILED',500);}
});

journeyRouter.post('/admin/students/:studentId/advance-year',(req,res)=>{
 const id=req.params.studentId,year=req.body?.nextAcademicYear;
 if(!validYear(year))return fail(res,'INVALID_ACADEMIC_YEAR');
 try{
  const member=membership(id);
  if(!member||member.membership_status!=='active')return fail(res,'ACTIVE_MEMBER_REQUIRED',409);
  const current=db.prepare("SELECT * FROM one_academic_years WHERE student_id=? AND status='active'").get(id);
  if(!current)return fail(res,'ACTIVE_YEAR_NOT_FOUND',409);
  if(current.grade>=10)return fail(res,'GRADUATION_REVIEW_REQUIRED',409,'Class 10 requires a separate verified outcome and graduation process.');
  if(year!==nextYear(current.academic_year))return fail(res,'YEAR_NOT_SEQUENTIAL',409);
  const student=ownerStudent(id);
  if(!student||student.grade!==current.grade||student.board!==current.board)
   return fail(res,'ACADEMIC_RECORD_MISMATCH',409,'Resolve student profile and annual record mismatch first.');
  const newRecordId='oneyear-'+randomUUID();
  atomic(()=>{
   db.prepare("UPDATE one_academic_years SET status='completed',completed_at=datetime('now') WHERE id=?").run(current.id);
   db.prepare(`
    INSERT INTO one_academic_years(id,student_id,academic_year,grade,board,status,started_at)
    VALUES(?,?,?,?,?,'active',datetime('now'))
   `).run(newRecordId,id,year,current.grade+1,current.board);
   db.prepare('UPDATE students SET grade=? WHERE id=?').run(current.grade+1,id);
   db.prepare("UPDATE one_memberships SET updated_at=datetime('now') WHERE student_id=?").run(id);
   audit(req.user.id,id,'ANNUAL_ADVANCEMENT','GRADE_PLUS_ONE');
  });
  return res.json({advanced:true,grade:current.grade+1,academicYear:year,
   message:'Previous academic year preserved; current grade advanced by one.'});
 }catch(err){console.error('[ONE yearly advancement]',err);return fail(res,'ADVANCEMENT_FAILED',500);}
});
