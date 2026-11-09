import test,{describe} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {
 academicYearForDate,ensureStudentPassport,getStudentPassport,
 verifyStudentYear,promoteStudentYear
} from '../domain/passportService.js';

function fixture(){
 const db=new DatabaseSync(':memory:');
 db.exec("PRAGMA foreign_keys=ON");
 db.exec(`
 CREATE TABLE users(id TEXT PRIMARY KEY,role TEXT NOT NULL);
 CREATE TABLE guardians(id TEXT PRIMARY KEY);
 CREATE TABLE students(id TEXT PRIMARY KEY,guardian_id TEXT NOT NULL REFERENCES guardians(id),
 name TEXT NOT NULL,grade INTEGER NOT NULL,board TEXT NOT NULL,medium TEXT NOT NULL,status TEXT NOT NULL);
 CREATE TABLE learner_passports(
 learner_id TEXT PRIMARY KEY,student_id TEXT NOT NULL UNIQUE REFERENCES students(id),
 public_learner_no TEXT NOT NULL UNIQUE,created_at TEXT DEFAULT (datetime('now')));
 CREATE TABLE learner_guardian_links(
 learner_id TEXT NOT NULL REFERENCES learner_passports(learner_id),
 guardian_id TEXT NOT NULL REFERENCES guardians(id),relation TEXT NOT NULL,
 verification_status TEXT NOT NULL,PRIMARY KEY(learner_id,guardian_id));
 CREATE TABLE learner_academic_years(
 id TEXT PRIMARY KEY,learner_id TEXT NOT NULL REFERENCES learner_passports(learner_id),
 year_key TEXT NOT NULL,grade INTEGER NOT NULL,board TEXT NOT NULL,medium TEXT NOT NULL,
 status TEXT NOT NULL,verified_by TEXT REFERENCES users(id),verified_at TEXT,
 opened_at TEXT DEFAULT (datetime('now')),closed_at TEXT,
 UNIQUE(learner_id,year_key));
 CREATE UNIQUE INDEX idx_one_open ON learner_academic_years(learner_id)
 WHERE status IN ('active','pending_review');
 CREATE TABLE learner_promotion_events(
 id TEXT PRIMARY KEY,learner_id TEXT NOT NULL REFERENCES learner_passports(learner_id),
 from_year_id TEXT NOT NULL UNIQUE REFERENCES learner_academic_years(id),
 to_year_id TEXT NOT NULL UNIQUE REFERENCES learner_academic_years(id),
 actor_user_id TEXT REFERENCES users(id),idempotency_key TEXT UNIQUE,
 created_at TEXT DEFAULT (datetime('now')));
 CREATE TABLE learner_student_accounts(
 user_id TEXT PRIMARY KEY REFERENCES users(id),student_id TEXT NOT NULL UNIQUE REFERENCES students(id),
 linked_by TEXT REFERENCES users(id));
 CREATE TABLE learner_passport_audit(
 id TEXT PRIMARY KEY,learner_id TEXT REFERENCES learner_passports(learner_id),
 actor_user_id TEXT REFERENCES users(id),action TEXT NOT NULL,event_json TEXT NOT NULL,
 created_at TEXT DEFAULT (datetime('now')));
 CREATE TABLE batch_enrollments(id TEXT PRIMARY KEY,student_id TEXT NOT NULL REFERENCES students(id),status TEXT NOT NULL);
 CREATE TABLE attendance_records(id TEXT PRIMARY KEY,student_id TEXT NOT NULL REFERENCES students(id),was_present INTEGER NOT NULL);
 CREATE TABLE homework_submissions(id TEXT PRIMARY KEY,student_id TEXT NOT NULL REFERENCES students(id),work TEXT NOT NULL);
 `);
 db.prepare("INSERT INTO users(id,role) VALUES('admin','admin'),('student-user','student')").run();
 db.prepare("INSERT INTO guardians(id) VALUES('guardian-1')").run();
 db.prepare("INSERT INTO students(id,guardian_id,name,grade,board,medium,status) VALUES('student-4','guardian-1','Example Learner',4,'CBSE','English','active')").run();
 db.prepare("INSERT INTO batch_enrollments(id,student_id,status) VALUES('batchlink-4','student-4','active')").run();
 db.prepare("INSERT INTO attendance_records(id,student_id,was_present) VALUES('att-01','student-4',1)").run();
 db.prepare("INSERT INTO homework_submissions(id,student_id,work) VALUES('hw-01','student-4','Legacy homework')").run();
 return db;
}
function verifiedFixture(){
 const db=fixture();
 const p=ensureStudentPassport(db,'student-4');
 const verify=verifyStudentYear(db,{
  studentId:'student-4',adminUserId:'admin',grade:4,board:'CBSE',yearKey:'2026-27'
 });
 return {db,p,fromYearId:verify.yearId};
}
describe('Learning Passport: permanent ID and academic year timeline',()=>{
 test('passport created once and guardian link remains separately unverified',()=>{
  const db=fixture();
  try{
   const a=ensureStudentPassport(db,'student-4');
   const b=ensureStudentPassport(db,'student-4');
   assert.equal(a.learner_id,b.learner_id);
   assert.match(a.public_learner_no,/^VG-L-/);
   assert.equal(db.prepare("SELECT COUNT(*) n FROM learner_passports").get().n,1);
   assert.equal(db.prepare("SELECT verification_status FROM learner_guardian_links").get().verification_status,'legacy_unverified');
   assert.equal(getStudentPassport(db,'student-4').years.length,1);
   assert.equal(getStudentPassport(db,'student-4').currentYear,null);
  }finally{db.close();}
 });
 test('staff verifies grade 4 but does not falsely certify parent relationship',()=>{
  const {db}=verifiedFixture();
  try{
   const passport=getStudentPassport(db,'student-4');
   assert.equal(passport.currentYear.grade,4);
   assert.equal(passport.currentYear.year_key,'2026-27');
   assert.equal(passport.guardianRelationshipReviewRequired,true);
  }finally{db.close();}
 });
 test('Class 4 → Class 5 is transactional, preserves student ID and past work',()=>{
  const {db,p,fromYearId}=verifiedFixture();
  try{
   const result=promoteStudentYear(db,{
    studentId:'student-4',adminUserId:'admin',fromYearId,nextYearKey:'2027-28',
    idempotencyKey:'class4to5-2027-01'
   });
   assert.equal(result.alreadyApplied,false);
   assert.equal(result.grade,5);
   assert.equal(result.oldBatchesClosed,1);
   const current=db.prepare("SELECT * FROM students WHERE id='student-4'").get();
   assert.equal(current.grade,5);
   assert.equal(db.prepare("SELECT COUNT(*) n FROM students").get().n,1);
   assert.equal(db.prepare("SELECT status FROM batch_enrollments").get().status,'completed');
   assert.equal(db.prepare("SELECT was_present FROM attendance_records").get().was_present,1);
   assert.equal(db.prepare("SELECT work FROM homework_submissions").get().work,'Legacy homework');
   const history=getStudentPassport(db,'student-4');
   assert.equal(history.learnerId,p.learner_id);
   assert.deepEqual(history.years.map(y=>[y.grade,y.status]),[[4,'completed'],[5,'active']]);
   assert.equal(history.years[0].id,fromYearId);
   assert.equal(db.prepare("SELECT COUNT(*) n FROM learner_promotion_events").get().n,1);
  }finally{db.close();}
 });
 test('repeated identical idempotency key returns original operation; no grade 6',()=>{
  const {db,fromYearId}=verifiedFixture();
  try{
   const payload={studentId:'student-4',adminUserId:'admin',fromYearId,
    nextYearKey:'2027-28',idempotencyKey:'grade-transition-2027-28'};
   promoteStudentYear(db,payload);
   const retry=promoteStudentYear(db,payload);
   assert.equal(retry.alreadyApplied,true);
   assert.equal(db.prepare('SELECT grade FROM students').get().grade,5);
   assert.equal(db.prepare('SELECT COUNT(*) n FROM learner_academic_years').get().n,2);
   assert.throws(()=>promoteStudentYear(db,{...payload,nextYearKey:'2028-29'}),e=>e.code==='IDEMPOTENCY_KEY_REUSED');
  }finally{db.close();}
 });
 test('wrong year, wrong old-year identity and unverified grades never mutate records',()=>{
  const {db,fromYearId}=verifiedFixture();
  try{
   const payload={studentId:'student-4',adminUserId:'admin',fromYearId,
    nextYearKey:'2028-29',idempotencyKey:'another-idem-2028'};
   assert.throws(()=>promoteStudentYear(db,payload),e=>e.code==='NON_CONSECUTIVE_ACADEMIC_YEAR');
   assert.throws(()=>promoteStudentYear(db,{...payload,fromYearId:'wrong',nextYearKey:'2027-28'}),e=>e.code==='CURRENT_YEAR_MISMATCH');
   assert.equal(db.prepare('SELECT grade FROM students').get().grade,4);
   assert.equal(db.prepare('SELECT status FROM batch_enrollments').get().status,'active');
   assert.equal(db.prepare("SELECT COUNT(*) n FROM learner_promotion_events").get().n,0);
  }finally{db.close();}
 });
 test('Class 10 cannot promote to Class 11; it requires graduation workflow',()=>{
  const db=fixture();
  try{
   db.prepare("UPDATE students SET grade=10 WHERE id='student-4'").run();
   ensureStudentPassport(db,'student-4');
   const v=verifyStudentYear(db,{studentId:'student-4',adminUserId:'admin',grade:10,board:'CBSE',yearKey:'2026-27'});
   assert.throws(()=>promoteStudentYear(db,{studentId:'student-4',adminUserId:'admin',
    fromYearId:v.yearId,nextYearKey:'2027-28',idempotencyKey:'class10-grad-required'}),e=>e.code==='CLASS_10_REQUIRES_GRADUATION');
   assert.equal(db.prepare('SELECT grade FROM students').get().grade,10);
  }finally{db.close();}
 });
 test('passport source academic year is provisional until staff reviews',()=>{
  const db=fixture();
  try{
   ensureStudentPassport(db,'student-4');
   assert.equal(db.prepare('SELECT status FROM learner_academic_years').get().status,'pending_review');
   assert.equal(academicYearForDate(new Date('2026-11-01T00:00:00Z')),'2026-27');
  }finally{db.close();}
 });
});
