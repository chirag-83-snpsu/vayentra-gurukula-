import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';
let server,base,admin,parent,student,teacher,reviewer;
async function call(path,token,method='GET',body){
 const response=await fetch(base+path,{method,headers:{
 ...(body?{'Content-Type':'application/json'}:{}),
 ...(token?{Authorization:'Bearer '+token}:{})
 },body:body?JSON.stringify(body):undefined});
 return {status:response.status,body:await response.json()};
}
async function login(email){
 const response=await call('/api/v1/auth/login',null,'POST',{email,password:'Gurukula@2026'});
 assert.equal(response.status,200,JSON.stringify(response.body));
 return response.body.token;
}
before(async()=>{
 await new Promise(resolve=>{
  server=http.createServer(app);
  server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;resolve();});
 });
 [admin,parent,student,teacher,reviewer]=await Promise.all([
  login('admin@vayentra.org'),login('guardian@vayentra.org'),
  login('student@vayentra.org'),login('teacher@vayentra.org'),login('reviewer@vayentra.org')
 ]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
const unitId='one-studio-objects';
const trackId='one-2026-cbse-4',subjectId='one-pilot-c4-maths',chapterId='one-pilot-c4-shapes';
test('Class 4 Shapes Studio: review gates, original lessons, private assessment and pilot entitlement',async()=>{
 const subject=db.prepare('SELECT * FROM one_subjects WHERE id=?').get(subjectId);
 const chapter=db.prepare('SELECT * FROM one_chapters WHERE id=?').get(chapterId);
 const track=db.prepare('SELECT * FROM one_curriculum_tracks WHERE id=?').get(trackId);
 const unit=db.prepare('SELECT * FROM one_studio_units WHERE id=?').get(unitId);
 assert.ok(track);assert.ok(subject);assert.ok(chapter);assert.ok(unit,'Migration 013 should seed original draft content');
 assert.equal(db.prepare('SELECT COUNT(*) n FROM one_studio_units').get().n>=6,true);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM one_studio_questions WHERE unit_id=?').get(unitId).n,4);
 const oldConcept=db.prepare('SELECT content_status,reviewer_id,reviewed_at FROM one_concepts WHERE id=?').get(unit.concept_id);
 const newRef='STUDIO-P2-TEST-ACADEMIC-2026';
 const rightsRef='STUDIO-P2-TEST-ORIGINAL-RIGHTS-2026';
 let appId=null,studentId=null;
 try{
  const preview=await call('/api/v1/one-studio/editor/preview',teacher);
  assert.equal(preview.status,200);
  assert.equal(preview.body.units.length,6);
  assert.equal(preview.body.units[0].status,'draft');
  assert.equal(preview.body.units[0].questions.length,4);
  assert.equal((await call('/api/v1/one-studio/editor/preview',parent)).status,403);
  assert.equal((await call('/api/v1/one-studio/me/course')).status,401);
  assert.equal((await call('/api/v1/one-studio/me/course',parent)).status,403);
  const application=await call('/api/v1/one-onboarding/guardian/applications',parent,'POST',{
    childName:'Original Shapes Pilot Child',grade:4,board:'CBSE',academicYear:'2026-27',
    guardianAcknowledgement:true,idempotencyKey:'studio-pilot-onboarding-2026-1'
  });
  assert.equal(application.status,201,JSON.stringify(application.body));
  appId=application.body.application.id;
  const approved=await call('/api/v1/one-onboarding/admin/applications/'+appId+'/approve',admin,'POST',{
    confirmed:true,verificationMethod:'verified_in_person',evidenceReference:'TEST-CLASS4-CASE-01'
  });
  assert.equal(approved.status,201,JSON.stringify(approved.body));
  studentId=approved.body.studentId;
  const prefix='/api/v1/one-studio/guardian/'+encodeURIComponent(studentId);
  const noEntitlement=await call(prefix+'/course',parent);
  assert.equal(noEntitlement.status,403);
  assert.equal(noEntitlement.body.code,'LEARNING_ENTITLEMENT_REQUIRED');
  assert.equal((await call(prefix+'/course',student)).status,403);
  const noReview=await call('/api/v1/one-studio/editor/units/'+unitId+'/publish',admin,'POST',{
    originalContentRightsConfirmed:true,rightsEvidenceReference:rightsRef
  });
  assert.equal(noReview.status,409);
  assert.equal((await call('/api/v1/one-studio/editor/units/'+unitId+'/review',parent,'POST',{
    decision:'approved',academicReviewReference:newRef
  })).status,403);
  const requested=await call('/api/v1/one-studio/editor/units/'+unitId+'/request-review',teacher,'POST',{});
  assert.equal(requested.status,200);
  const reviewed=await call('/api/v1/one-studio/editor/units/'+unitId+'/review',reviewer,'POST',{
    decision:'approved',academicReviewReference:newRef
  });
  assert.equal(reviewed.status,200,JSON.stringify(reviewed.body));
  assert.equal(db.prepare('SELECT status FROM one_studio_units WHERE id=?').get(unitId).status,'reviewed');
  assert.equal((await call('/api/v1/one-studio/editor/units/'+unitId+'/publish',admin,'POST',{
    originalContentRightsConfirmed:true,rightsEvidenceReference:rightsRef
  })).status,409,'Reviewer approval alone cannot publish until curriculum is verified.');
  assert.equal((await call('/api/v1/one-content/admin/tracks/'+trackId+'/verify',admin,'POST',{
    editorialReference:'TEST-NCERT-CLASS4-2026-CURRICULUM'
  })).status,200);
  assert.equal((await call('/api/v1/one-content/admin/subjects/'+subjectId+'/approve',admin,'POST',{
    academicReviewReference:'TEST-SUBJECT-REVIEW'
  })).status,200);
  assert.equal((await call('/api/v1/one-content/admin/chapters/'+chapterId+'/approve',admin,'POST',{
    academicReviewReference:'TEST-CHAPTER-REVIEW'
  })).status,200);
  const published=await call('/api/v1/one-studio/editor/units/'+unitId+'/publish',admin,'POST',{
    originalContentRightsConfirmed:true,rightsEvidenceReference:rightsRef
  });
  assert.equal(published.status,200,JSON.stringify(published.body));
  const granting=await call('/api/v1/one-studio/admin/pilot-grants',admin,'POST',{
    studentId,expiresAt:new Date(Date.now()+14*86400000).toISOString(),
    reason:'Fourteen day isolated Class 4 academic pilot test'
  });
  assert.equal(granting.status,200,JSON.stringify(granting.body));
  assert.equal(db.prepare('SELECT entitlement_status FROM one_memberships WHERE student_id=?').get(studentId).entitlement_status,'not_configured');
  const course=await call(prefix+'/course',parent);
  assert.equal(course.status,200,JSON.stringify(course.body));
  assert.equal(course.body.units.length,1,'Unreviewed lessons cannot appear in learner catalogue.');
  assert.equal(course.body.units[0].id,unitId);
  const details=await call(prefix+'/units/'+unitId,parent);
  assert.equal(details.status,200);
  assert.equal(details.body.questions.length,4);
  assert.equal(Object.prototype.hasOwnProperty.call(details.body.questions[0],'correct_index'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(details.body.questions[0],'correctIndex'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(details.body.questions[0],'rationale'),false);
  assert.equal((await call(prefix+'/units/one-studio-faces',parent)).status,404);
  const answers=[1,0,2,0],key='studio-practice-test-0001';
  const submitted=await call(prefix+'/attempts',parent,'POST',{unitId,idempotencyKey:key,answers});
  assert.equal(submitted.status,201,JSON.stringify(submitted.body));
  assert.equal(submitted.body.correct,4);
  assert.equal(submitted.body.total,4);
  assert.equal(submitted.body.feedback.length,4);
  const repeated=await call(prefix+'/attempts',parent,'POST',{unitId,idempotencyKey:key,answers});
  assert.equal(repeated.status,200);
  assert.equal(repeated.body.replayed,true);
  assert.equal((await call(prefix+'/attempts',parent,'POST',{
   unitId,idempotencyKey:key,answers:[0,0,0,0]
  })).status,409);
  const progress=await call(prefix+'/progress',parent);
  assert.equal(progress.status,200);
  assert.equal(progress.body.progress.completedChecks,1);
  assert.equal(progress.body.progress.attemptCount,1);
  const mastery=db.prepare('SELECT mastery FROM one_concept_mastery WHERE student_id=? AND concept_id=?')
    .get(studentId,unit.concept_id);
  assert.equal(mastery.mastery,'practising','A perfect formative check cannot silently grant teacher-confirmed mastery.');
  const adminProgress=await call('/api/v1/one-studio/admin/students/'+studentId+'/progress',admin);
  assert.equal(adminProgress.status,200);
  assert.equal(adminProgress.body.progress.attemptCount,1);
  assert.equal((await call('/api/v1/one-studio/admin/students/'+studentId+'/progress',parent)).status,403);
  const unpublished=await call('/api/v1/one-studio/editor/units/'+unitId+'/unpublish',admin,'POST',{
    reason:'Test audit: academic content must be temporarily withdrawn for accuracy review.'
  });
  assert.equal(unpublished.status,200);
  assert.equal(unpublished.body.reasonStored,true);
  assert.equal((await call(prefix+'/course',parent)).body.units.length,0);
  assert.equal((await call(prefix+'/units/'+unitId,parent)).status,404);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM one_studio_publication_events WHERE unit_id=?').get(unitId).n>=2,true);
 }finally{
  // Test database only. Revert shared course statuses; purge fictional learner evidence.
  if(studentId){
   db.prepare('DELETE FROM one_studio_attempts WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_concept_mastery WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_studio_pilot_grants WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_journey_audit WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_academic_years WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_consent_reviews WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_memberships WHERE student_id=?').run(studentId);
  }
  if(appId)db.prepare('DELETE FROM one_admission_applications WHERE id=?').run(appId);
  if(studentId)db.prepare('DELETE FROM students WHERE id=?').run(studentId);
  db.prepare('DELETE FROM one_studio_reviews WHERE unit_id=? AND review_reference=?').run(unitId,newRef);
  db.prepare('DELETE FROM one_studio_publication_events WHERE unit_id=?').run(unitId);
  db.prepare('DELETE FROM one_content_review_logs WHERE editorial_reference IN (?,?,?,?)')
   .run('TEST-NCERT-CLASS4-2026-CURRICULUM','TEST-SUBJECT-REVIEW','TEST-CHAPTER-REVIEW',rightsRef);
  db.prepare('UPDATE one_curriculum_tracks SET catalogue_status=?,verified_at=? WHERE id=?')
   .run(track.catalogue_status,track.verified_at,trackId);
  db.prepare('UPDATE one_subjects SET review_status=? WHERE id=?')
   .run(subject.review_status,subjectId);
  db.prepare('UPDATE one_chapters SET review_status=? WHERE id=?')
   .run(chapter.review_status,chapterId);
  db.prepare('UPDATE one_concepts SET content_status=?,reviewer_id=?,reviewed_at=? WHERE id=?')
   .run(oldConcept.content_status,oldConcept.reviewer_id,oldConcept.reviewed_at,unit.concept_id);
  db.prepare('UPDATE one_studio_units SET status=?,reviewer_id=?,review_reference=?,reviewed_at=?,publisher_id=?,published_at=? WHERE id=?')
   .run(unit.status,unit.reviewer_id,unit.review_reference,unit.reviewed_at,unit.publisher_id,unit.published_at,unitId);
 }
});
