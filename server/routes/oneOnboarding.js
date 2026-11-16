import {Router} from 'express';
import {randomBytes,randomUUID} from 'node:crypto';
import {db} from '../db/database.js';
import {authenticateToken,requireRole} from '../middleware/auth.js';

export const oneOnboardingRouter=Router();
oneOnboardingRouter.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
oneOnboardingRouter.use(authenticateToken);
const YEAR=/^([2-9]\d{3})-(\d{2})$/;
function yearValid(value){
 const m=typeof value==='string'?YEAR.exec(value):null;
 return Boolean(m)&&((Number(m[1])+1)%100)===Number(m[2])&&Number(m[1])<=2100;
}
function problem(res,code,status=400,message='We could not complete this request.'){
 return res.status(status).json({code,message});
}
function atomic(work){
 db.exec('BEGIN IMMEDIATE');
 try{const result=work();db.exec('COMMIT');return result;}
 catch(err){db.exec('ROLLBACK');throw err;}
}
function guardianIdFor(user){
 return user.role==='parent'&&typeof user.guardianId==='string'?user.guardianId:null;
}
function appDTO(app){
 return {id:app.id,childName:app.child_name,grade:app.grade,board:app.board,
  academicYear:app.academic_year,status:app.status,
  learnerNumber:app.enrollment_number||null,createdAt:app.created_at,
  reviewedAt:app.reviewed_at||null,
  reviewNote:app.status==='rejected'?app.rejection_reason||null:null};
}
function validateApplication(body){
 if(!body||typeof body!=='object')return {error:'INVALID_APPLICATION'};
 const name=typeof body.childName==='string'?body.childName.trim().replace(/\s+/g,' '):'';
 const grade=body.grade;
 const board=body.board;
 const year=body.academicYear;
 const key=typeof body.idempotencyKey==='string'?body.idempotencyKey:'';
 if(name.length<2||name.length>80||/[<>]/.test(name))return {error:'INVALID_CHILD_NAME'};
 if(!Number.isInteger(grade)||grade<1||grade>10)return {error:'INVALID_GRADE'};
 if(!['CBSE','STATE'].includes(board))return {error:'INVALID_BOARD'};
 if(!yearValid(year))return {error:'INVALID_ACADEMIC_YEAR'};
 if(!/^[a-zA-Z0-9_-]{12,100}$/.test(key))return {error:'INVALID_IDEMPOTENCY_KEY'};
 if(body.guardianAcknowledgement!==true)return {error:'GUARDIAN_ACKNOWLEDGEMENT_REQUIRED'};
 return {name,grade,board,year,key};
}
function studentLearning(studentId){
 const s=db.prepare('SELECT id,name,enrollment_number FROM students WHERE id=?').get(studentId);
 const m=db.prepare('SELECT * FROM one_memberships WHERE student_id=?').get(studentId);
 const y=db.prepare("SELECT * FROM one_academic_years WHERE student_id=? AND status='active'").get(studentId);
 if(!s||!m||m.membership_status!=='active'||!y)return null;
 const track=db.prepare(`
  SELECT id,edition_year,catalogue_status FROM one_curriculum_tracks
  WHERE grade=? AND board=? AND catalogue_status='verified'
  ORDER BY edition_year DESC LIMIT 1
 `).get(y.grade,y.board);
 const subjects=track?db.prepare(`
  SELECT s.id,s.subject_title AS name,
  (SELECT COUNT(*) FROM one_chapters c WHERE c.subject_id=s.id AND c.review_status='reviewed') AS approved_chapters,
  (SELECT COUNT(*) FROM one_concepts x JOIN one_chapters ch ON x.chapter_id=ch.id
   WHERE ch.subject_id=s.id AND x.content_status='published') AS published_concepts
  FROM one_subjects s WHERE s.track_id=? AND s.review_status='reviewed'
  ORDER BY s.subject_title
 `).all(track.id):[];
 
 const pilot=Boolean(db.prepare(
  "SELECT student_id FROM one_studio_pilot_grants WHERE student_id=? AND expires_at>datetime('now')"
 ).get(studentId));
 const studioUnits=(y.grade===4&&y.board==='CBSE')?db.prepare(`
  SELECT COUNT(*) AS count FROM one_studio_units u
  JOIN one_concepts c ON c.id=u.concept_id
  JOIN one_chapters ch ON ch.id=c.chapter_id
  JOIN one_subjects sub ON sub.id=ch.subject_id
  JOIN one_curriculum_tracks t ON t.id=sub.track_id
  WHERE u.unit_key LIKE 'vg-c4-cbse-shapes-2026-%'
   AND u.status='published' AND t.catalogue_status='verified'
   AND sub.review_status='reviewed' AND ch.review_status='reviewed'
 `).get().count:0;
return {learnerId:s.id,learnerNumber:s.enrollment_number,studentName:s.name,
  currentYear:{grade:y.grade,board:y.board,academicYear:y.academic_year,status:y.status},
  membershipStatus:m.membership_status,entitlementStatus:m.entitlement_status,
  conceptStudio:{available:studioUnits>0&&(m.entitlement_status==='enabled'||pilot),publishedUnits:studioUnits,pilotGranted:pilot},
  catalogue:{status:track?'verified':'not_yet_verified',editionYear:track?.edition_year||null},
  subjects,notice:!track?'Your class curriculum is being academically verified. Published lessons will appear here once reviewed.':'Only approved curriculum content appears in this workspace.'};
}

// An authenticated parent MAY submit a minimal application, never grant access.
oneOnboardingRouter.post('/guardian/applications',requireRole('parent'),(req,res)=>{
 const guardianId=guardianIdFor(req.user);
 if(!guardianId)return problem(res,'GUARDIAN_ACCOUNT_REQUIRED',403);
 const input=validateApplication(req.body);
 if(input.error)return problem(res,input.error,400,'Please check the class, board, year, name and guardian acknowledgement.');
 try{
  const application=atomic(()=>{
   const existing=db.prepare('SELECT * FROM one_admission_applications WHERE guardian_id=? AND idempotency_key=?')
    .get(guardianId,input.key);
   if(existing){
    if(existing.child_name!==input.name||existing.grade!==input.grade||existing.board!==input.board||existing.academic_year!==input.year)
     return {conflict:true};
    return {existing:true,application:existing};
   }
   // Prevent accidental duplicate enrolment under the same guardian from repeated form fills.
   const duplicate=db.prepare(`
    SELECT id FROM one_admission_applications
    WHERE guardian_id=? AND lower(child_name)=lower(?) AND grade=? AND board=?
    AND status IN ('submitted','approved') LIMIT 1
   `).get(guardianId,input.name,input.grade,input.board);
   if(duplicate)return {duplicate:true};
   const id='oneapp-'+randomUUID();
   db.prepare(`
    INSERT INTO one_admission_applications
      (id,guardian_id,child_name,grade,board,academic_year,notice_version,idempotency_key)
    VALUES(?,?,?,?,?,?,?,?)
   `).run(id,guardianId,input.name,input.grade,input.board,input.year,
      'one-guardian-application-v1',input.key);
   return {application:db.prepare('SELECT * FROM one_admission_applications WHERE id=?').get(id)};
  });
  if(application.conflict)return problem(res,'IDEMPOTENCY_KEY_CONFLICT',409);
  if(application.duplicate)return problem(res,'APPLICATION_ALREADY_EXISTS',409,'An existing pending or approved application matches this learner. Contact the academy to review it.');
  return res.status(application.existing?200:201).json({application:appDTO(application.application),
   message:'Application submitted for review. This does not verify guardian identity, confirm admission or enable paid learning.'});
 }catch(err){console.error('[ONE onboarding create]',err);return problem(res,'APPLICATION_SAVE_FAILED',500);}
});

oneOnboardingRouter.get('/guardian/applications',requireRole('parent'),(req,res)=>{
 const guardianId=guardianIdFor(req.user);
 if(!guardianId)return problem(res,'GUARDIAN_ACCOUNT_REQUIRED',403);
 try{
  const items=db.prepare(`
   SELECT a.*,s.enrollment_number FROM one_admission_applications a
   LEFT JOIN students s ON s.id=a.student_id
   WHERE a.guardian_id=? ORDER BY a.created_at DESC LIMIT 40
  `).all(guardianId);
  return res.json({applications:items.map(appDTO)});
 }catch(err){console.error('[ONE onboarding parent list]',err);return problem(res,'APPLICATION_LIST_FAILED',500);}
});

oneOnboardingRouter.get('/learner/me',requireRole('student'),(req,res)=>{
 if(!req.user.studentId)return problem(res,'STUDENT_ACCOUNT_NOT_LINKED',403);
 try{
  const learner=studentLearning(req.user.studentId);
  if(!learner)return problem(res,'ACTIVE_LEARNER_NOT_FOUND',404,'Your learning journey requires administrator activation.');
  return res.json({learner});
 }catch(err){console.error('[ONE learner home]',err);return problem(res,'LEARNER_HOME_FAILED',500);}
});

// Guardian-supervised view for an approved child, even before student login provision.
oneOnboardingRouter.get('/guardian/learners/:studentId/home',requireRole('parent'),(req,res)=>{
 const guardianId=guardianIdFor(req.user);
 if(!guardianId)return problem(res,'GUARDIAN_ACCOUNT_REQUIRED',403);
 try{
  const allowed=db.prepare(`
    SELECT s.id FROM students s
    JOIN one_memberships m ON m.student_id=s.id AND m.guardian_id=?
    JOIN one_consent_reviews cr ON cr.student_id=s.id AND cr.guardian_id=?
    WHERE s.id=? AND s.guardian_id=?
  `).get(guardianId,guardianId,req.params.studentId,guardianId);
  if(!allowed)return problem(res,'LEARNER_ACCESS_DENIED',403);
  const learner=studentLearning(allowed.id);
  if(!learner)return problem(res,'ACTIVE_LEARNER_NOT_FOUND',404);
  return res.json({learner,viewMode:'guardian_supervised'});
 }catch(err){console.error('[ONE guardian learner view]',err);return problem(res,'LEARNER_HOME_FAILED',500);}
});

// Admin routes are mounted after role restriction; no learner browsing for parents.
oneOnboardingRouter.use('/admin',requireRole('admin'));
oneOnboardingRouter.get('/admin/applications',(req,res)=>{
 const filter=String(req.query.status||'submitted');
 if(!['submitted','approved','rejected','all'].includes(filter))
  return problem(res,'INVALID_STATUS_FILTER');
 try{
  const rows=db.prepare(`
   SELECT a.*,u.name AS guardian_name,u.email AS guardian_email,
    s.enrollment_number FROM one_admission_applications a
   JOIN guardians g ON g.id=a.guardian_id
   JOIN users u ON u.id=g.user_id
   LEFT JOIN students s ON s.id=a.student_id
   WHERE (?='all' OR a.status=?)
   ORDER BY a.created_at DESC LIMIT 100
  `).all(filter,filter);
  return res.json({applications:rows.map(a=>({
   ...appDTO(a),guardianName:a.guardian_name,guardianEmail:a.guardian_email
  }))});
 }catch(err){console.error('[ONE onboarding admin list]',err);return problem(res,'APPLICATION_LIST_FAILED',500);}
});

oneOnboardingRouter.post('/admin/applications/:id/approve',(req,res)=>{
 const body=req.body||{};
 const method=body.verificationMethod;
 const ref=typeof body.evidenceReference==='string'?body.evidenceReference.trim():'';
 if(body.confirmed!==true||!['verified_in_person','verified_parent_records','verified_digilocker'].includes(method)
    ||ref.length<4||ref.length>100||/[<>]/.test(ref))
  return problem(res,'VERIFICATION_ATTESTATION_REQUIRED',400,
   'Record a real guardian relationship and consent review using a reference to privately retained evidence, not a document number.');
 try{
  const result=atomic(()=>{
   const app=db.prepare('SELECT * FROM one_admission_applications WHERE id=?').get(req.params.id);
   if(!app)return {notFound:true};
   if(app.status==='approved')return {already:true,studentId:app.student_id};
   if(app.status!=='submitted')return {invalid:true};
   const duplicate=db.prepare(`
    SELECT s.id FROM students s WHERE s.guardian_id=? AND lower(s.name)=lower(?)
     AND s.grade=? AND s.board=? LIMIT 1
   `).get(app.guardian_id,app.child_name,app.grade,app.board);
   if(duplicate)return {duplicate:true};
   const id='stu-'+randomUUID(), enrollment='VG-ONE-'+randomBytes(8).toString('hex').toUpperCase();
   // No default child PIN, fake exam marks, demo school, school ID numbers or uploads.
   const disabledChildPin=randomBytes(24).toString('hex');
   db.prepare(`
    INSERT INTO students
     (id,guardian_id,name,avatar,grade,board,medium,school_name,
      child_pin,has_consent,consent_timestamp,enrollment_number)
    VALUES(?,?,?,'📘',?,?,'English','Not provided',?,1,datetime('now'),?)
   `).run(id,app.guardian_id,app.child_name,app.grade,app.board,disabledChildPin,enrollment);
   db.prepare(`
    INSERT INTO one_memberships(student_id,guardian_id,initial_grade,initial_year,membership_status,entitlement_status)
    VALUES(?,?,?,?,'active','not_configured')
   `).run(id,app.guardian_id,app.grade,app.academic_year);
   db.prepare(`
    INSERT INTO one_consent_reviews
      (student_id,guardian_id,notice_version,verification_method,evidence_reference,verified_by)
    VALUES(?,?,?,?,?,?)
   `).run(id,app.guardian_id,app.notice_version,method,ref,req.user.id);
   db.prepare(`
    INSERT INTO one_academic_years(id,student_id,academic_year,grade,board,status,started_at)
    VALUES(?,?,?,?,?,'active',datetime('now'))
   `).run('one-year-'+randomUUID(),id,app.academic_year,app.grade,app.board);
   db.prepare(`
    INSERT INTO one_journey_audit(id,actor_user_id,student_id,action,detail_code)
    VALUES(?,?,?,'ADMISSION_APPROVED','VERIFICATION_EVIDENCE_REVIEWED')
   `).run('one-audit-'+randomUUID(),req.user.id,id);
   db.prepare(`
    UPDATE one_admission_applications
    SET status='approved',student_id=?,reviewed_by=?,review_method=?,evidence_reference=?,reviewed_at=datetime('now')
    WHERE id=? AND status='submitted'
   `).run(id,req.user.id,method,ref,app.id);
   return {created:true,studentId:id,learnerNumber:enrollment};
  });
  if(result.notFound)return problem(res,'APPLICATION_NOT_FOUND',404);
  if(result.invalid)return problem(res,'APPLICATION_ALREADY_REVIEWED',409);
  if(result.duplicate)return problem(res,'EXISTING_LEARNER_NEEDS_REVIEW',409,'A similar learner profile exists. Verify it manually rather than creating a second account.');
  if(result.already)return res.json({approved:true,alreadyApproved:true,studentId:result.studentId});
  return res.status(201).json({approved:true,studentId:result.studentId,
   learnerNumber:result.learnerNumber,entitlementStatus:'not_configured',
   message:'Academic identity created. No payment was collected. Learner login linkage requires its own controlled approval.'});
 }catch(err){console.error('[ONE onboarding approve]',err);return problem(res,'APPLICATION_APPROVAL_FAILED',500);}
});

oneOnboardingRouter.post('/admin/applications/:id/reject',(req,res)=>{
 const reason=typeof req.body?.reason==='string'?req.body.reason.trim():'';
 if(req.body?.confirmed!==true||reason.length<8||reason.length>200||/[<>]/.test(reason))
  return problem(res,'REJECTION_REASON_REQUIRED');
 try{
  const result=atomic(()=>db.prepare(`
   UPDATE one_admission_applications SET status='rejected',rejection_reason=?,
    reviewed_by=?,reviewed_at=datetime('now')
   WHERE id=? AND status='submitted'
  `).run(reason,req.user.id,req.params.id));
  if(!result.changes)return problem(res,'APPLICATION_NOT_PENDING',409);
  return res.json({rejected:true});
 }catch(err){console.error('[ONE onboarding reject]',err);return problem(res,'APPLICATION_REJECTION_FAILED',500);}
});
