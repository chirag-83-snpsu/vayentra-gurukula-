import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';
import {GRADE1_MATHS_CHAPTER1} from '../data/grade1MathsChapter1.js';

let server,base,admin,parent,student,teacher,reviewer;
async function api(path,token,method='GET',payload){
 const response=await fetch(base+path,{
  method,headers:{...(payload?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},
  body:payload?JSON.stringify(payload):undefined
 });
 return {status:response.status,body:await response.json()};
}
async function login(email){
 const r=await api('/api/v1/auth/login',null,'POST',{email,password:'Gurukula@2026'});
 assert.equal(r.status,200,JSON.stringify(r.body));return r.body.token;
}
before(async()=>{
 await new Promise(resolve=>{server=http.createServer(app);server.listen(0,'127.0.0.1',()=>{
  base='http://127.0.0.1:'+server.address().port;resolve();
 });});
 [admin,parent,student,teacher,reviewer]=await Promise.all([
  login('admin@vayentra.org'),login('guardian@vayentra.org'),
  login('student@vayentra.org'),login('teacher@vayentra.org'),login('reviewer@vayentra.org')
 ]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});

test('migration 015 creates nine original math concepts, 36 private questions and aligned picture scenes',()=>{
 assert.equal(GRADE1_MATHS_CHAPTER1.chapterTitle,'Finding the Furry Cat!');
 assert.equal(GRADE1_MATHS_CHAPTER1.lessons.length,9);
 assert.ok(GRADE1_MATHS_CHAPTER1.lessons.every(l=>l.questions.length===4));
 assert.ok(GRADE1_MATHS_CHAPTER1.lessons.every(l=>l.scene.positions.length>=2&&l.story.length>=500));
 assert.equal(db.prepare("SELECT COUNT(*) AS n FROM one_foundation_units WHERE unit_key LIKE 'one-fdn-one-g1-maths-ch1-%'").get().n,9);
 assert.equal(db.prepare("SELECT COUNT(*) AS n FROM one_foundation_questions WHERE unit_id LIKE 'one-fdn-one-g1-maths-ch1-%'").get().n,36);
 assert.equal(db.prepare("SELECT COUNT(*) AS n FROM one_foundation_picture_scenes WHERE unit_id LIKE 'one-fdn-one-g1-maths-ch1-%'").get().n,9);
 assert.equal(db.prepare("SELECT COUNT(*) AS n FROM one_foundation_units WHERE status='published' AND unit_key LIKE 'one-fdn-one-g1-maths-ch1-%'").get().n,0);
 const concepts=db.prepare(`
  SELECT c.position,c.title FROM one_concepts c JOIN one_chapters ch ON ch.id=c.chapter_id
  JOIN one_subjects s ON s.id=ch.subject_id JOIN one_curriculum_tracks t ON t.id=s.track_id
  WHERE t.board='CBSE' AND t.grade=1 AND s.subject_title='Mathematics'
   AND ch.chapter_number=1 ORDER BY c.position
 `).all();
 assert.equal(concepts.length,10,'Original earlier warm-up is retained in position 1.');
 assert.deepEqual(concepts.slice(1).map(x=>x.position),[2,3,4,5,6,7,8,9,10]);
});
test('guardian-supervised Maths picture explorer requires approved content and preserves formative history',async()=>{
 const unitId='one-fdn-one-g1-maths-ch1-on-under';
 const beforeUnit=db.prepare('SELECT * FROM one_foundation_units WHERE id=?').get(unitId);
 const oldConcept=db.prepare('SELECT * FROM one_concepts WHERE id=?').get(beforeUnit.concept_id);
 const mapping=db.prepare(`
  SELECT sub.id subject_id,sub.review_status subject_review,ch.id chapter_id,
   ch.review_status chapter_review,t.id track_id,t.catalogue_status track_status,t.verified_at track_verified_at
  FROM one_foundation_units u
  JOIN one_concepts c ON c.id=u.concept_id
  JOIN one_chapters ch ON ch.id=c.chapter_id
  JOIN one_subjects sub ON sub.id=ch.subject_id
  JOIN one_curriculum_tracks t ON t.id=sub.track_id WHERE u.id=?
 `).get(unitId);
 let applicationId=null,childId=null;
 const markers=['G1-MATH-CH1-TRACK-2026','G1-MATH-CH1-SUBJECT-2026','G1-MATH-CH1-CHAPTER-2026'];
 try{
  assert.equal((await api('/api/v1/grade1/editor/map?board=CBSE',parent)).status,403);
  assert.equal((await api('/api/v1/grade1/me/catalogue',student)).status,403);
  const application=await api('/api/v1/one-onboarding/guardian/applications',parent,'POST',{
   childName:'Fictional Milo Pilot Learner',grade:1,board:'CBSE',academicYear:'2026-27',
   guardianAcknowledgement:true,idempotencyKey:'milo-ch1-test-enrol-2026-01'
  });
  assert.equal(application.status,201,JSON.stringify(application.body));
  applicationId=application.body.application.id;
  const approved=await api('/api/v1/one-onboarding/admin/applications/'+applicationId+'/approve',admin,'POST',{
   confirmed:true,verificationMethod:'verified_in_person',evidenceReference:'MILO-TEST-GUARDIAN-CASE-2026'
  });
  assert.equal(approved.status,201,JSON.stringify(approved.body));
  childId=approved.body.studentId;
  const basePath='/api/v1/grade1/guardian/'+encodeURIComponent(childId);
  assert.equal((await api(basePath+'/units/'+unitId,parent)).status,403,'Without learner access all lessons are closed.');
  assert.equal((await api(basePath+'/catalogue',student)).status,403,'A different student cannot select the fictional child.');
  const grant=await api('/api/v1/grade1/admin/pilot-grants',admin,'POST',{
   studentId:childId,reason:'Original school Maths picture pilot, isolated data',
   expiresAt:new Date(Date.now()+8*86400000).toISOString()
  });
  assert.equal(grant.status,200);
  assert.equal(grant.body.paidAccessChanged,false);
  assert.equal((await api(basePath+'/units/'+unitId,parent)).status,404,'Draft remains private even when trial access exists.');
  assert.equal((await api('/api/v1/grade1/editor/units/'+unitId+'/request-review',teacher,'POST',{
   editorialReference:'MATH-CH1-TEACHER-REVIEW-2026'
  })).status,200);
  assert.equal((await api('/api/v1/grade1/editor/units/'+unitId+'/review',reviewer,'POST',{
   decision:'approved',academicReviewReference:'MATH-CH1-REVIEWER-2026'
  })).status,200);
  assert.equal((await api('/api/v1/grade1/editor/units/'+unitId+'/publish',admin,'POST',{
   rightsVerified:true,originalWorkReference:'MATH-CH1-RIGHTS-2026'
  })).status,409,'Official board/source mapping must be verified too.');
  assert.equal((await api('/api/v1/one-content/admin/tracks/'+mapping.track_id+'/verify',admin,'POST',{
   editorialReference:markers[0]
  })).status,200);
  assert.equal((await api('/api/v1/one-content/admin/subjects/'+mapping.subject_id+'/approve',admin,'POST',{
   academicReviewReference:markers[1]
  })).status,200);
  assert.equal((await api('/api/v1/one-content/admin/chapters/'+mapping.chapter_id+'/approve',admin,'POST',{
   academicReviewReference:markers[2]
  })).status,200);
  assert.equal((await api('/api/v1/grade1/editor/units/'+unitId+'/publish',admin,'POST',{
   rightsVerified:true,originalWorkReference:'MATH-CH1-RIGHTS-2026'
  })).status,200);
  const learning=await api(basePath+'/units/'+unitId,parent);
  assert.equal(learning.status,200,JSON.stringify(learning.body));
  assert.deepEqual(learning.body.lesson.pictureScene.positions,['on','under']);
  assert.equal(learning.body.lesson.guidedSteps.length,4);
  assert.equal(learning.body.lesson.questions.length,4);
  assert.equal(Object.hasOwn(learning.body.lesson.questions[0],'correctIndex'),false);
  assert.equal(Object.hasOwn(learning.body.lesson.questions[0],'explanation'),false);
  const pre=await api('/api/v1/grade1/editor/map?board=CBSE',reviewer);
  assert.equal(pre.status,200);
  assert.ok(pre.body.units.some(u=>u.id===unitId&&u.questions.some(q=>q.correctIndex===0)));
  const answers=[0,1,1,1],idempotencyKey='milo-picture-check-2026-001';
  const graded=await api(basePath+'/attempts',parent,'POST',{unitId,answers,idempotencyKey});
  assert.equal(graded.status,201,JSON.stringify(graded.body));assert.equal(graded.body.correct,4);
  assert.equal(graded.body.feedback.length,4);
  assert.equal((await api(basePath+'/attempts',parent,'POST',{unitId,answers,idempotencyKey})).body.replayed,true);
  assert.equal((await api(basePath+'/attempts',parent,'POST',{unitId,answers:[0,0,0,0],idempotencyKey})).status,409);
  assert.equal((await api(basePath+'/catalogue',parent)).body.progress.checkedLessons,1);
  const withdrawn=await api('/api/v1/grade1/editor/units/'+unitId+'/withdraw',admin,'POST',{
   reason:'Fictional learning pilot paused for independent academic recheck.'
  });
  assert.equal(withdrawn.status,200);
  assert.equal((await api(basePath+'/units/'+unitId,parent)).status,404);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM one_foundation_attempts WHERE student_id=?').get(childId).n,1,
   'Historical child learning evidence is not erased by withdrawing content.');
 }finally{
  if(childId){
   db.prepare('DELETE FROM one_foundation_attempts WHERE student_id=?').run(childId);
   db.prepare('DELETE FROM one_foundation_pilot_grants WHERE student_id=?').run(childId);
   db.prepare('DELETE FROM one_journey_audit WHERE student_id=?').run(childId);
   db.prepare('DELETE FROM one_academic_years WHERE student_id=?').run(childId);
   db.prepare('DELETE FROM one_consent_reviews WHERE student_id=?').run(childId);
   db.prepare('DELETE FROM one_memberships WHERE student_id=?').run(childId);
  }
  if(applicationId)db.prepare('DELETE FROM one_admission_applications WHERE id=?').run(applicationId);
  if(childId)db.prepare('DELETE FROM students WHERE id=?').run(childId);
  db.prepare('DELETE FROM one_foundation_reviews WHERE unit_id=?').run(unitId);
  db.prepare('DELETE FROM one_content_review_logs WHERE editorial_reference IN (?,?,?)')
   .run(...markers);
  db.prepare('UPDATE one_curriculum_tracks SET catalogue_status=?,verified_at=? WHERE id=?')
   .run(mapping.track_status,mapping.track_verified_at,mapping.track_id);
  db.prepare('UPDATE one_subjects SET review_status=? WHERE id=?')
   .run(mapping.subject_review,mapping.subject_id);
  db.prepare('UPDATE one_chapters SET review_status=? WHERE id=?')
   .run(mapping.chapter_review,mapping.chapter_id);
  db.prepare('UPDATE one_concepts SET content_status=?,reviewer_id=?,reviewed_at=? WHERE id=?')
   .run(oldConcept.content_status,oldConcept.reviewer_id,oldConcept.reviewed_at,beforeUnit.concept_id);
  db.prepare(`
   UPDATE one_foundation_units SET status=?,reviewer_id=?,review_reference=?,reviewed_at=?,publisher_id=?,published_at=?
   WHERE id=?
 `).run(beforeUnit.status,beforeUnit.reviewer_id,beforeUnit.review_reference,
   beforeUnit.reviewed_at,beforeUnit.publisher_id,beforeUnit.published_at,unitId);
 }
});
