import test,{before,after,describe} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';

let server,base,admin,parent,student;
async function call(path,token,method='GET',body){
 const res=await fetch(base+path,{method,headers:{'Content-Type':'application/json',
  ...(token?{Authorization:'Bearer '+token}:{})},
  body:body?JSON.stringify(body):undefined});
 return {status:res.status,data:await res.json()};
}
before(async()=>{
 await new Promise(resolve=>{
  server=http.createServer(app);
  server.listen(0,'127.0.0.1',()=>{
   base='http://127.0.0.1:'+server.address().port;resolve();
  });
 });
 for(const [email,target] of [['admin@vayentra.org','admin'],['guardian@vayentra.org','parent'],['student@vayentra.org','student']]){
  const resp=await call('/api/v1/auth/login',null,'POST',{email,password:'Gurukula@2026'});
  assert.equal(resp.status,200,'Required seeded local QA account '+email);
  if(target==='admin')admin=resp.data.token;
  if(target==='parent')parent=resp.data.token;
  if(target==='student')student=resp.data.token;
 }
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});

describe('Vayentra ONE learner identity and academic history — read-only regression',()=>{
 test('20 draft catalogue shells exist for CBSE and Karnataka State, Class 1 to 10',async()=>{
  const resp=await call('/api/v1/journey/catalogue');
  assert.equal(resp.status,200);
  assert.equal(resp.data.tracks.length,20);
  assert.deepEqual([...new Set(resp.data.tracks.map(t=>t.board))].sort(),['CBSE','STATE']);
  assert.ok(resp.data.tracks.every(t=>t.grade>=1&&t.grade<=10));
  assert.ok(resp.data.tracks.every(t=>t.status==='needs_teacher_mapping'));
  assert.ok(resp.data.tracks.every(t=>t.publishedConcepts===0),'No fabricated published content');
 });
 test('public catalogue query rejects unsupported grade and board',async()=>{
  for(const suffix of ['?grade=11','?grade=0','?board=ICSE']){
   const resp=await call('/api/v1/journey/catalogue'+suffix);
   assert.equal(resp.status,400);
  }
 });
 test('guest cannot access any student personal journey',async()=>{
  assert.equal((await call('/api/v1/journey/students/stu-001')).status,401);
 });
 test('student role cannot access private guardian academic journal',async()=>{
  assert.equal((await call('/api/v1/journey/students/stu-001',student)).status,403);
 });
 test('guardian can read linked student journey; missing journey remains explicitly uninitialised',async()=>{
  const resp=await call('/api/v1/journey/students/stu-001',parent);
  assert.equal(resp.status,200);
  assert.equal(resp.data.student.id,'stu-001');
  assert.ok('membership' in resp.data);
  assert.ok(Array.isArray(resp.data.academicYears));
  assert.ok(Array.isArray(resp.data.marks));
  assert.equal(resp.data.uploadAvailable,false);
  assert.ok(!('password_hash' in resp.data.student));
 });
 test('guardian cannot read unlinked student ID',async()=>{
  const resp=await call('/api/v1/journey/students/not-a-linked-student',parent);
  assert.equal(resp.status,403);
 });
 test('parent cannot create or activate ONE enrolment for arbitrary student',async()=>{
  const resp=await call('/api/v1/journey/admin/students/stu-001/enrol',parent,'POST',{academicYear:'2026-27'});
  assert.equal(resp.status,403);
 });
 test('admin enrolment rejects malformed academic year without mutating records',async()=>{
  const resp=await call('/api/v1/journey/admin/students/stu-001/enrol',admin,'POST',{academicYear:'2026-99'});
  assert.equal(resp.status,400);
 });
 test('guardian cannot add marks before an active verified ONE membership',async()=>{
  const resp=await call('/api/v1/journey/students/stu-001/marks',parent,'POST',{
   academicYearId:'missing-year',subject:'Mathematics',exam:'Term 1',obtained:80,maximum:100
  });
  assert.ok([403,404].includes(resp.status));
 });
 test('schema includes secure metadata and explicit account links, not a binary upload endpoint',()=>{
  for(const table of ['one_memberships','one_consent_reviews','one_academic_years',
   'one_mark_entries','one_document_metadata','one_curriculum_tracks','one_subjects',
   'one_chapters','one_concepts','one_concept_assets','one_concept_mastery',
   'one_journey_audit','one_student_account_links']){
   assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table),table);
  }
  assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='one_year_active_unique'").get());
 });
});
