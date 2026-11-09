import {randomUUID,randomBytes} from 'node:crypto';
import {planGradeTransition} from './learnerPassport.js';

export class PassportError extends Error{
 constructor(code,httpStatus=400,message=code){super(message);this.name='PassportError';this.code=code;this.httpStatus=httpStatus;}
}
export function normalizeBoard(board){return board==='STATE_KARNATAKA'?'STATE':board;}
export function academicYearForDate(date=new Date()){
 const start=date.getMonth()>=3?date.getFullYear():date.getFullYear()-1;
 return start+'-'+String((start+1)%100).padStart(2,'0');
}
function academicYearStart(key){
 const match=/^([2-9][0-9]{3})-([0-9]{2})$/.exec(String(key||''));
 if(!match)return null;
 const start=Number(match[1]);
 return Number(match[2])===(start+1)%100?start:null;
}
function queryStudent(db,studentId){
 const student=db.prepare('SELECT * FROM students WHERE id=?').get(studentId);
 if(!student)throw new PassportError('STUDENT_NOT_FOUND',404);
 return student;
}
function passport(db,studentId){
 const p=db.prepare('SELECT * FROM learner_passports WHERE student_id=?').get(studentId);
 if(!p)throw new PassportError('PASSPORT_NOT_INITIALISED',404);
 return p;
}
/** Called from a trusted admission/registration transaction; never from anonymous GET. */
export function ensureStudentPassport(db,studentId){
 const student=queryStudent(db,studentId);
 let p=db.prepare('SELECT * FROM learner_passports WHERE student_id=?').get(studentId);
 if(!p){
  const learnerId='lr-'+randomUUID(),publicNo='VG-L-'+randomBytes(8).toString('hex').toUpperCase();
  db.prepare('INSERT INTO learner_passports(learner_id,student_id,public_learner_no) VALUES(?,?,?)')
   .run(learnerId,studentId,publicNo);
  p={learner_id:learnerId,student_id:studentId,public_learner_no:publicNo};
 }
 db.prepare("INSERT OR IGNORE INTO learner_guardian_links(learner_id,guardian_id,relation,verification_status) VALUES(?,?,'primary','legacy_unverified')")
   .run(p.learner_id,student.guardian_id);
 const open=db.prepare("SELECT * FROM learner_academic_years WHERE learner_id=? AND status IN ('active','pending_review')").get(p.learner_id);
 if(!open&&Number.isInteger(student.grade)&&student.grade>=1&&student.grade<=10){
  const board=normalizeBoard(student.board);
  const normalized=['CBSE','STATE','ICSE'].includes(board)?board:'OTHER';
  const any=db.prepare('SELECT COUNT(*) AS count FROM learner_academic_years WHERE learner_id=?').get(p.learner_id).count;
  if(any===0){
   db.prepare("INSERT INTO learner_academic_years(id,learner_id,year_key,grade,board,medium,status) VALUES(?,?,?,?,?,?,'pending_review')")
    .run('lay-'+randomUUID(),p.learner_id,academicYearForDate(),student.grade,normalized,student.medium||'English');
  }
 }
 return p;
}
/** View only. No implicit creation or permission change. */
export function getStudentPassport(db,studentId){
 const student=queryStudent(db,studentId);
 const p=passport(db,studentId);
 const years=db.prepare(
  'SELECT id,year_key,grade,board,medium,status,verified_at,opened_at,closed_at FROM learner_academic_years WHERE learner_id=? ORDER BY year_key ASC'
 ).all(p.learner_id);
 const links=db.prepare("SELECT COUNT(*) AS count FROM learner_guardian_links WHERE learner_id=? AND verification_status='verified'").get(p.learner_id).count;
 return {learnerId:p.learner_id,learnerNumber:p.public_learner_no,studentId:student.id,
  studentName:student.name,currentGrade:student.grade,currentBoard:normalizeBoard(student.board),
  currentYear:years.find(y=>y.status==='active')||null,years,
  guardianRelationshipReviewRequired:links===0,
  historicRecordsRetained:true};
}
export function verifyStudentYear(db,{studentId,adminUserId,grade,board,yearKey}){
 if(!Number.isInteger(grade)||grade<1||grade>10)throw new PassportError('INVALID_GRADE');
 if(!['CBSE','STATE'].includes(board))throw new PassportError('UNSUPPORTED_BOARD');
 if(academicYearStart(yearKey)===null)throw new PassportError('INVALID_YEAR');
 const student=queryStudent(db,studentId),p=passport(db,studentId);
 if(student.status!=='active')throw new PassportError('STUDENT_NOT_ACTIVE',409);
 if(student.grade!==grade||normalizeBoard(student.board)!==board)
  throw new PassportError('STUDENT_ENROLMENT_MISMATCH',409,'Review or correct the registered grade/board in the established admin process first.');
 db.exec('BEGIN IMMEDIATE');
 try{
  const open=db.prepare(
   "SELECT * FROM learner_academic_years WHERE learner_id=? AND status IN ('pending_review','active')"
  ).get(p.learner_id);
  if(!open)throw new PassportError('NO_OPEN_ACADEMIC_YEAR',409);
  if(open.status==='active'){
   if(open.grade===grade&&open.board===board&&open.year_key===yearKey){
    db.exec('COMMIT');return {alreadyVerified:true,yearId:open.id,status:'active'};
   }
   throw new PassportError('CURRENT_YEAR_ALREADY_VERIFIED',409);
  }
  db.prepare(
   "UPDATE learner_academic_years SET grade=?,board=?,year_key=?,status='active',verified_by=?,verified_at=datetime('now') WHERE id=? AND status='pending_review'"
  ).run(grade,board,yearKey,adminUserId,open.id);
  db.prepare("UPDATE learner_guardian_links SET verification_status='verified' WHERE learner_id=? AND guardian_id=? AND verification_status='legacy_unverified'")
   .run(p.learner_id,student.guardian_id);
  db.prepare('INSERT INTO learner_passport_audit(id,learner_id,actor_user_id,action,event_json) VALUES(?,?,?,?,?)')
   .run('p-aud-'+randomUUID(),p.learner_id,adminUserId,'ACADEMIC_YEAR_VERIFIED',
    JSON.stringify({yearId:open.id,yearKey,grade,board}));
  db.exec('COMMIT');
  return {yearId:open.id,status:'active',alreadyVerified:false};
 }catch(err){db.exec('ROLLBACK');throw err;}
}
export function promoteStudentYear(db,{studentId,adminUserId,fromYearId,nextYearKey,idempotencyKey}){
 if(typeof idempotencyKey!=='string'||!/^[A-Za-z0-9_-]{12,100}$/.test(idempotencyKey))
  throw new PassportError('INVALID_IDEMPOTENCY_KEY');
 if(academicYearStart(nextYearKey)===null)throw new PassportError('INVALID_YEAR');
 if(typeof fromYearId!=='string'||!fromYearId.trim())throw new PassportError('FROM_YEAR_REQUIRED');
 const student=queryStudent(db,studentId),p=passport(db,studentId);
 db.exec('BEGIN IMMEDIATE');
 try{
  const prior=db.prepare('SELECT * FROM learner_promotion_events WHERE idempotency_key=?').get(idempotencyKey);
  if(prior){
   if(prior.learner_id!==p.learner_id||prior.from_year_id!==fromYearId)
    throw new PassportError('IDEMPOTENCY_KEY_REUSED',409);
   const to=db.prepare('SELECT * FROM learner_academic_years WHERE id=?').get(prior.to_year_id);
   if(to.year_key!==nextYearKey)throw new PassportError('IDEMPOTENCY_KEY_REUSED',409);
   db.exec('COMMIT');
   return {alreadyApplied:true,learnerId:p.learner_id,newYearId:to.id,grade:to.grade,board:to.board,academicYear:to.year_key};
  }
  const current=db.prepare(
   "SELECT * FROM learner_academic_years WHERE learner_id=? AND status='active'"
  ).get(p.learner_id);
  if(!current||current.id!==fromYearId)throw new PassportError('CURRENT_YEAR_MISMATCH',409);
  if(student.status!=='active'||student.grade!==current.grade||normalizeBoard(student.board)!==current.board)
   throw new PassportError('STUDENT_CURRENT_GRADE_MISMATCH',409);
  if(current.grade===10)throw new PassportError('CLASS_10_REQUIRES_GRADUATION',409);
  if(!['CBSE','STATE'].includes(current.board))throw new PassportError('BOARD_REQUIRES_REVIEW',409);
  if(academicYearStart(nextYearKey)!==academicYearStart(current.year_key)+1)
   throw new PassportError('NON_CONSECUTIVE_ACADEMIC_YEAR',409);
  const grade=current.grade+1;
  const transition=planGradeTransition(
   {learnerId:p.learner_id,grade:current.grade,board:current.board,academicYearId:current.year_key,status:current.status},
   {learnerId:p.learner_id,grade,board:current.board,academicYearId:nextYearKey}
  );
  if(!transition.allowed)throw new PassportError(transition.reason,409);
  const nextId='lay-'+randomUUID();
  // Historical attendance, homework, results and existing student.id remain untouched.
  db.prepare("UPDATE learner_academic_years SET status='completed',closed_at=datetime('now') WHERE id=? AND status='active'")
   .run(current.id);
  db.prepare(
   "INSERT INTO learner_academic_years(id,learner_id,year_key,grade,board,medium,status,verified_by,verified_at) VALUES(?,?,?,?,?,?,'active',?,datetime('now'))"
  ).run(nextId,p.learner_id,nextYearKey,grade,current.board,current.medium,adminUserId);
  db.prepare('UPDATE students SET grade=? WHERE id=?').run(grade,studentId);
  // Old batch allocations must not keep treating the promoted student as actively enrolled.
  // Keep old batch rows + attendance for historical audit; new grade allocation is manual.
  const retired=db.prepare(
   "UPDATE batch_enrollments SET status='completed' WHERE student_id=? AND status='active'"
  ).run(studentId);
  db.prepare(
   'INSERT INTO learner_promotion_events(id,learner_id,from_year_id,to_year_id,actor_user_id,idempotency_key) VALUES(?,?,?,?,?,?)'
  ).run('pm-'+randomUUID(),p.learner_id,current.id,nextId,adminUserId,idempotencyKey);
  db.prepare('INSERT INTO learner_passport_audit(id,learner_id,actor_user_id,action,event_json) VALUES(?,?,?,?,?)')
   .run('p-aud-'+randomUUID(),p.learner_id,adminUserId,'ACADEMIC_YEAR_PROMOTED',
    JSON.stringify({fromYearId:current.id,toYearId:nextId,fromGrade:current.grade,toGrade:grade,oldBatchesClosed:retired.changes}));
  db.exec('COMMIT');
  return {alreadyApplied:false,learnerId:p.learner_id,newYearId:nextId,grade,board:current.board,
    academicYear:nextYearKey,oldBatchesClosed:retired.changes,requiresNewBatchAllocation:true};
 }catch(err){db.exec('ROLLBACK');throw err;}
}
