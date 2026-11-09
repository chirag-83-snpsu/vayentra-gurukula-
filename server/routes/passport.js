import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {db} from '../db/database.js';
import {authenticateToken,requireRole} from '../middleware/auth.js';
import {
 PassportError,getStudentPassport,verifyStudentYear,promoteStudentYear
} from '../domain/passportService.js';

export const passportRouter=Router();
passportRouter.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
passportRouter.use(authenticateToken);
function sendError(res,err){
 if(err instanceof PassportError)return res.status(err.httpStatus).json({code:err.code,message:err.message});
 console.error('[Learning Passport]',err);
 return res.status(500).json({code:'PASSPORT_REQUEST_FAILED',message:'Could not complete the Learning Passport operation.'});
}
function authorisedForStudent(user,studentId){
 if(user.role==='admin')return true;
 if(user.role==='student'){
  if(!user.studentId||user.studentId!==studentId)return false;
  return Boolean(db.prepare('SELECT student_id FROM learner_student_accounts WHERE user_id=? AND student_id=?')
   .get(user.id,studentId));
 }
 if(user.role==='parent'){
  if(!user.guardianId)return false;
  return Boolean(db.prepare(`
   SELECT 1 FROM learner_passports p
   JOIN learner_guardian_links l ON l.learner_id=p.learner_id
   JOIN students s ON s.id=p.student_id
   WHERE p.student_id=? AND l.guardian_id=? AND s.guardian_id=?
     AND l.verification_status IN ('legacy_unverified','verified')
  `).get(studentId,user.guardianId,user.guardianId));
 }
 return false;
}
// Learn your own identity and year history. No client-provided student ID is trusted.
passportRouter.get('/me',(req,res)=>{
 try{
  if(req.user.role==='student'){
   if(!req.user.studentId||!authorisedForStudent(req.user,req.user.studentId))
    return res.status(403).json({code:'STUDENT_ACCOUNT_NOT_LINKED'});
   return res.json({passports:[getStudentPassport(db,req.user.studentId)]});
  }
  if(req.user.role==='parent'){
   if(!req.user.guardianId)return res.status(403).json({code:'GUARDIAN_PROFILE_REQUIRED'});
   const children=db.prepare(`
    SELECT p.student_id FROM learner_passports p
    JOIN learner_guardian_links l ON l.learner_id=p.learner_id
    JOIN students s ON s.id=p.student_id
    WHERE l.guardian_id=? AND s.guardian_id=?
      AND l.verification_status IN ('legacy_unverified','verified')
    ORDER BY s.id
   `).all(req.user.guardianId,req.user.guardianId);
   return res.json({passports:children.map(row=>getStudentPassport(db,row.student_id))});
  }
  return res.status(403).json({code:'LEARNER_PORTAL_ONLY'});
 }catch(err){return sendError(res,err);}
});
passportRouter.get('/students/:studentId',(req,res)=>{
 if(!authorisedForStudent(req.user,req.params.studentId))
  return res.status(403).json({code:'PASSPORT_ACCESS_DENIED'});
 try{return res.json(getStudentPassport(db,req.params.studentId));}
 catch(err){return sendError(res,err);}
});
passportRouter.use('/admin',requireRole('admin'));
passportRouter.get('/admin/roster',(req,res)=>{
 try{
  const rows=db.prepare(`
   SELECT p.student_id,p.learner_id,p.public_learner_no,
    s.name,s.grade,s.board, y.id AS current_year_id,y.year_key,y.status AS year_status
   FROM learner_passports p JOIN students s ON s.id=p.student_id
   LEFT JOIN learner_academic_years y ON y.learner_id=p.learner_id
       AND y.status IN ('active','pending_review')
   ORDER BY s.name ASC LIMIT 200
  `).all();
  return res.json({learners:rows.map(row=>({
   studentId:row.student_id,learnerId:row.learner_id,learnerNumber:row.public_learner_no,
   name:row.name,grade:row.grade,board:row.board,currentYearId:row.current_year_id||null,
   yearKey:row.year_key||null,yearStatus:row.year_status||'no_year'
  }))});
 }catch(err){return sendError(res,err);}
});
passportRouter.post('/admin/students/:studentId/verify',(req,res)=>{
 if(req.body?.confirmed!==true)return res.status(400).json({code:'CONFIRMATION_REQUIRED'});
 try{
  const result=verifyStudentYear(db,{studentId:req.params.studentId,adminUserId:req.user.id,
   grade:req.body.grade,board:req.body.board,yearKey:req.body.yearKey});
  return res.json(result);
 }catch(err){return sendError(res,err);}
});
passportRouter.post('/admin/students/:studentId/promote',(req,res)=>{
 if(req.body?.confirmed!==true)return res.status(400).json({code:'CONFIRMATION_REQUIRED'});
 try{
  const result=promoteStudentYear(db,{studentId:req.params.studentId,adminUserId:req.user.id,
   fromYearId:req.body.fromYearId,nextYearKey:req.body.nextYearKey,
   idempotencyKey:req.body.idempotencyKey});
  return res.json(result);
 }catch(err){return sendError(res,err);}
});
passportRouter.post('/admin/students/:studentId/link-student-account',(req,res)=>{
 const userId=req.body?.studentUserId;
 if(req.body?.confirmed!==true||typeof userId!=='string')
  return res.status(400).json({code:'CONFIRMATION_AND_USER_REQUIRED'});
 try{
  const account=db.prepare('SELECT id,role FROM users WHERE id=?').get(userId);
  if(!account||account.role!=='student')return res.status(400).json({code:'USER_MUST_BE_STUDENT'});
  const student=db.prepare('SELECT id FROM students WHERE id=?').get(req.params.studentId);
  if(!student)return res.status(404).json({code:'STUDENT_NOT_FOUND'});
  const existing=db.prepare('SELECT student_id FROM learner_student_accounts WHERE user_id=?').get(userId);
  if(existing)return existing.student_id===student.id
   ?res.json({linked:true,alreadyLinked:true})
   :res.status(409).json({code:'ACCOUNT_ALREADY_LINKED'});
  const claimed=db.prepare('SELECT user_id FROM learner_student_accounts WHERE student_id=?').get(student.id);
  if(claimed)return res.status(409).json({code:'LEARNER_ALREADY_LINKED'});
  db.prepare('INSERT INTO learner_student_accounts(user_id,student_id,linked_by) VALUES(?,?,?)')
   .run(userId,student.id,req.user.id);
  const learner=db.prepare('SELECT learner_id FROM learner_passports WHERE student_id=?').get(student.id);
  db.prepare('INSERT INTO learner_passport_audit(id,learner_id,actor_user_id,action,event_json) VALUES(?,?,?,?,?)')
   .run('p-aud-'+randomUUID(),learner?.learner_id||null,req.user.id,'STUDENT_ACCOUNT_LINKED',
     JSON.stringify({studentId:student.id,userId}));
  return res.status(201).json({linked:true,alreadyLinked:false});
 }catch(err){return sendError(res,err);}
});
