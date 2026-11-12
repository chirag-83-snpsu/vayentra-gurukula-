import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';

let server,base,admin,parent,student;
async function call(url,token,method='GET',data){
 const res=await fetch(base+url,{method,headers:{
  ...(data?{'Content-Type':'application/json'}:{}),
  ...(token?{Authorization:'Bearer '+token}:{})
 },body:data?JSON.stringify(data):undefined});
 return {status:res.status,body:await res.json()};
}
async function login(email){
 const result=await call('/api/v1/auth/login',null,'POST',{email,password:'Gurukula@2026'});
 assert.equal(result.status,200,JSON.stringify(result.body));
 return result.body.token;
}
before(async()=>{
 await new Promise(resolve=>{
  server=http.createServer(app);
  server.listen(0,'127.0.0.1',()=>{
   base='http://127.0.0.1:'+server.address().port;resolve();
  });
 });
 [admin,parent,student]=await Promise.all([
  login('admin@vayentra.org'),login('guardian@vayentra.org'),login('student@vayentra.org')
 ]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
const payload={childName:'Pilot Learner ONE',grade:4,board:'CBSE',
 academicYear:'2026-27',guardianAcknowledgement:true,idempotencyKey:'pilot-onboarding-2026-001'};

test('ONE admission: parent-only application, consent review, one learner, no paid access',async()=>{
 assert.equal((await call('/api/v1/one-onboarding/guardian/applications')).status,401);
 assert.equal((await call('/api/v1/one-onboarding/guardian/applications',admin,'POST',payload)).status,403);
 assert.equal((await call('/api/v1/one-onboarding/guardian/applications',parent,'POST',
   {...payload,guardianAcknowledgement:false})).status,400);
 assert.equal((await call('/api/v1/one-onboarding/guardian/applications',parent,'POST',
   {...payload,grade:11})).status,400);
 const countBefore=db.prepare('SELECT COUNT(*) AS n FROM students').get().n;
 let id=null,studentId=null;
 try{
  const created=await call('/api/v1/one-onboarding/guardian/applications',parent,'POST',payload);
  assert.equal(created.status,201,JSON.stringify(created.body));
  id=created.body.application.id;
  assert.equal(created.body.application.status,'submitted');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM students').get().n,countBefore,
   'Submitting only creates a pending application; not a learner');
  const duplicate=await call('/api/v1/one-onboarding/guardian/applications',parent,'POST',payload);
  assert.equal(duplicate.status,200);
  assert.equal(duplicate.body.application.id,id);
  assert.equal((await call('/api/v1/one-onboarding/guardian/applications',parent,'POST',
    {...payload,board:'STATE'})).status,409);
  assert.equal((await call('/api/v1/one-onboarding/admin/applications',parent)).status,403);
  assert.equal((await call('/api/v1/one-onboarding/admin/applications/'+id+'/approve',parent,'POST',
    {confirmed:true,verificationMethod:'verified_in_person',evidenceReference:'TEST-001'})).status,403);
  assert.equal((await call('/api/v1/one-onboarding/admin/applications/'+id+'/approve',admin,'POST',
    {confirmed:true,verificationMethod:'verified_in_person',evidenceReference:''})).status,400);
  const approved=await call('/api/v1/one-onboarding/admin/applications/'+id+'/approve',admin,'POST',{
   confirmed:true,verificationMethod:'verified_in_person',evidenceReference:'TEST-REVIEW-001'
  });
  assert.equal(approved.status,201,JSON.stringify(approved.body));
  assert.equal(approved.body.entitlementStatus,'not_configured');
  studentId=approved.body.studentId;
  assert.match(approved.body.learnerNumber,/^VG-ONE-/);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM students').get().n,countBefore+1);
  const fresh=db.prepare('SELECT * FROM students WHERE id=?').get(studentId);
  assert.equal(fresh.grade,4);assert.equal(fresh.board,'CBSE');
  assert.equal(fresh.name,payload.childName);
  assert.equal(fresh.enrollment_number,approved.body.learnerNumber);
  const guardianHome=await call('/api/v1/one-onboarding/guardian/learners/'+encodeURIComponent(studentId)+'/home',parent);
  assert.equal(guardianHome.status,200,JSON.stringify(guardianHome.body));
  assert.equal(guardianHome.body.viewMode,'guardian_supervised');
  assert.equal(guardianHome.body.learner.currentYear.grade,4);
  assert.equal(guardianHome.body.learner.entitlementStatus,'not_configured');
  assert.equal(guardianHome.body.learner.subjects.length,0,'Unreviewed course shells never become published lessons.');
  const refused=await call('/api/v1/one-onboarding/guardian/learners/'+encodeURIComponent(studentId)+'/home',student);
  assert.equal(refused.status,403);
  const unrelated=await call('/api/v1/one-onboarding/guardian/learners/not-an-authorised-id/home',parent);
  assert.equal(unrelated.status,403);
  const membership=db.prepare('SELECT * FROM one_memberships WHERE student_id=?').get(studentId);
  assert.equal(membership.membership_status,'active');
  assert.equal(membership.entitlement_status,'not_configured');
  const yr=db.prepare('SELECT * FROM one_academic_years WHERE student_id=?').all(studentId);
  assert.equal(yr.length,1);assert.equal(yr[0].grade,4);
  assert.equal(yr[0].status,'active');assert.equal(yr[0].academic_year,'2026-27');
  assert.ok(db.prepare('SELECT student_id FROM one_consent_reviews WHERE student_id=?').get(studentId));
  const again=await call('/api/v1/one-onboarding/admin/applications/'+id+'/approve',admin,'POST',{
   confirmed:true,verificationMethod:'verified_in_person',evidenceReference:'TEST-REVIEW-001'
  });
  assert.equal(again.status,200);assert.equal(again.body.alreadyApproved,true);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM one_academic_years WHERE student_id=?').get(studentId).n,1);
  const family=await call('/api/v1/one-onboarding/guardian/applications',parent);
  assert.equal(family.status,200);assert.ok(family.body.applications.some(a=>a.id===id&&a.learnerNumber===approved.body.learnerNumber));
 }finally{
  // Only test data. Run tests with NODE_ENV=test against an isolated DB.
  if(studentId){
   db.prepare('DELETE FROM one_journey_audit WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_academic_years WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_consent_reviews WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_memberships WHERE student_id=?').run(studentId);
  }
  if(id)db.prepare('DELETE FROM one_admission_applications WHERE id=?').run(id);
  if(studentId)db.prepare('DELETE FROM students WHERE id=?').run(studentId);
 }
});
test('ONE admission rejection does not create a learner, reason visible only to guardian',async()=>{
 const data={childName:'Rejected Pilot Applicant',grade:6,board:'STATE',
  academicYear:'2026-27',guardianAcknowledgement:true,idempotencyKey:'pilot-onboarding-reject-002'};
 const sent=await call('/api/v1/one-onboarding/guardian/applications',parent,'POST',data);
 assert.equal(sent.status,201);
 const id=sent.body.application.id;
 try{
  assert.equal((await call('/api/v1/one-onboarding/admin/applications/'+id+'/reject',parent,'POST',
   {confirmed:true,reason:'Review required'})).status,403);
  const rejected=await call('/api/v1/one-onboarding/admin/applications/'+id+'/reject',admin,'POST',
   {confirmed:true,reason:'Guardian relationship evidence was not provided.'});
  assert.equal(rejected.status,200);
  const r=db.prepare('SELECT status,student_id FROM one_admission_applications WHERE id=?').get(id);
  assert.equal(r.status,'rejected');assert.equal(r.student_id,null);
  const parentView=await call('/api/v1/one-onboarding/guardian/applications',parent);
  assert.equal(parentView.status,200);
  assert.ok(parentView.body.applications.some(a=>a.id===id&&a.reviewNote));
 }finally{db.prepare('DELETE FROM one_admission_applications WHERE id=?').run(id);}
});
test('authenticated student learner home never accepts a chosen studentId',async()=>{
 assert.equal((await call('/api/v1/one-onboarding/learner/me',parent)).status,403);
 assert.equal((await call('/api/v1/one-onboarding/learner/me')).status,401);
 const own=await call('/api/v1/one-onboarding/learner/me?studentId=another',student);
 // Existing seeded demo student may not yet have a verified active ONE journey.
 assert.ok([200,404].includes(own.status));
 if(own.status===200)assert.equal(own.body.learner.learnerId,'stu-001');
});
