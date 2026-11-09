import test,{before,after,describe} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';

let server,base,admin,parent;
async function req(path,token,method='GET',body){
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',
  ...(token?{Authorization:'Bearer '+token}:{})},
  body:body?JSON.stringify(body):undefined});
 return {status:response.status,body:await response.json()};
}
before(async()=>{
 await new Promise(resolve=>{server=http.createServer(app);server.listen(0,'127.0.0.1',()=>{
  base='http://127.0.0.1:'+server.address().port;resolve();
 });});
 const login=async email=>{
  const r=await req('/api/v1/auth/login',null,'POST',{email,password:'Gurukula@2026'});
  assert.equal(r.status,200);
  return r.body.token;
 };
 [admin,parent]=await Promise.all([login('admin@vayentra.org'),login('guardian@vayentra.org')]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});

describe('Complete Vayentra ONE Class 7 → 10 journey in isolated test database',()=>{
 test('one consent-reviewed enrolment preserves identity, year, marks and class transitions',async()=>{
  const initial=db.prepare('SELECT id,grade FROM students WHERE id=?').get('stu-001');
  assert.equal(initial.grade,7);
  const beforeAttendance=db.prepare('SELECT COUNT(*) AS n FROM attendance_records WHERE student_id=?').get('stu-001').n;
  const start=await req('/api/v1/journey/admin/students/stu-001/enrol',admin,'POST',{academicYear:'2026-27'});
  assert.equal(start.status,201);
  assert.equal(start.body.status,'pending_consent');
  const early=await req('/api/v1/journey/admin/students/stu-001/activate',admin,'POST',{});
  assert.equal(early.status,403);
  const consent=await req('/api/v1/journey/admin/students/stu-001/record-consent-review',admin,'POST',{
   verificationMethod:'verified_in_person',evidenceReference:'QA-VERIFIED-REVIEW-1001',
   noticeVersion:'one-parent-consent-v1'
  });
  assert.equal(consent.status,200);
  const active=await req('/api/v1/journey/admin/students/stu-001/activate',admin,'POST',{});
  assert.equal(active.status,200);
  assert.equal(active.body.entitlementStatus,'not_configured');
  const detail=await req('/api/v1/journey/students/stu-001',parent);
  assert.equal(detail.status,200);
  assert.equal(detail.body.academicYears.length,1);
  assert.equal(detail.body.academicYears[0].grade,7);
  const yearId=detail.body.academicYears[0].id;
  const badMarks=await req('/api/v1/journey/students/stu-001/marks',parent,'POST',{
   academicYearId:yearId,subject:'Mathematics',exam:'Term 1',obtained:101,maximum:100
  });
  assert.equal(badMarks.status,400);
  const mark=await req('/api/v1/journey/students/stu-001/marks',parent,'POST',{
   academicYearId:yearId,subject:'Mathematics',exam:'Term 1',obtained:88.5,maximum:100,evidenceStatus:'school_verified'
  });
  assert.equal(mark.status,201);
  assert.equal(mark.body.evidenceStatus,'self_reported');
  const badYear=await req('/api/v1/journey/admin/students/stu-001/advance-year',admin,'POST',{nextAcademicYear:'2028-29'});
  assert.equal(badYear.status,409);
  assert.equal(db.prepare('SELECT grade FROM students WHERE id=?').get('stu-001').grade,7);
  for(const [next,expected] of [['2027-28',8],['2028-29',9],['2029-30',10]]){
   const promoted=await req('/api/v1/journey/admin/students/stu-001/advance-year',admin,'POST',{nextAcademicYear:next});
   assert.equal(promoted.status,200,JSON.stringify(promoted.body));
   assert.equal(promoted.body.grade,expected);
   assert.equal(db.prepare('SELECT grade FROM students WHERE id=?').get('stu-001').grade,expected);
  }
  const after=await req('/api/v1/journey/students/stu-001',parent);
  assert.equal(after.status,200);
  assert.equal(after.body.student.id,initial.id);
  assert.equal(after.body.student.grade,10);
  assert.equal(after.body.academicYears.length,4);
  assert.deepEqual(after.body.academicYears.map(x=>x.status),['completed','completed','completed','active']);
  assert.equal(after.body.marks.length,1);
  assert.equal(after.body.marks[0].obtained,88.5);
  assert.equal(after.body.marks[0].evidenceStatus,'self_reported');
  const afterAttendance=db.prepare('SELECT COUNT(*) AS n FROM attendance_records WHERE student_id=?').get('stu-001').n;
  assert.equal(afterAttendance,beforeAttendance,'historical attendance unchanged');
  const retired=db.prepare(`
   SELECT COUNT(*) AS n FROM batch_enrollments e JOIN batches b ON b.id=e.batch_id
   WHERE e.student_id=? AND b.grade=7 AND e.status='active'
  `).get('stu-001').n;
  assert.equal(retired,0,'prior grade batch enrolments should no longer be active');
  const forbidden=await req('/api/v1/journey/admin/students/stu-001/advance-year',admin,'POST',{nextAcademicYear:'2030-31'});
  assert.equal(forbidden.status,409);
  assert.equal(forbidden.body.code,'GRADUATION_REVIEW_REQUIRED');
 });
});
