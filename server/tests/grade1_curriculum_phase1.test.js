import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';
import {GRADE1_CURRICULUM} from '../data/grade1Curriculum.js';
let server,base,admin,parent,student,teacher,reviewer;
async function call(path,token,method='GET',body){
 const r=await fetch(base+path,{method,headers:{
  ...(body?{'Content-Type':'application/json'}:{}),
  ...(token?{Authorization:'Bearer '+token}:{})
 },body:body?JSON.stringify(body):undefined});
 return {status:r.status,body:await r.json()};
}
async function login(email){
 const r=await call('/api/v1/auth/login',null,'POST',{email,password:'Gurukula@2026'});
 assert.equal(r.status,200,JSON.stringify(r.body));
 return r.body.token;
}
before(async()=>{
 await new Promise(resolve=>{server=http.createServer(app);
  server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;resolve();});
 });
 [admin,parent,student,teacher,reviewer]=await Promise.all([
  login('admin@vayentra.org'),login('guardian@vayentra.org'),
  login('student@vayentra.org'),login('teacher@vayentra.org'),login('reviewer@vayentra.org')
 ]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});

test('Class 1 source mapping is accurate and enrichment is staged, not automatically published',()=>{
 assert.deepEqual(GRADE1_CURRICULUM.official.find(x=>x.board==='CBSE').subjects.map(x=>x.chapters.length),[9,19,13]);
 assert.deepEqual(GRADE1_CURRICULUM.official.find(x=>x.board==='STATE').subjects.map(x=>x.chapters.length),[0,0,0,0]);
 assert.equal(GRADE1_CURRICULUM.enrichment.length,2);
 assert.equal(GRADE1_CURRICULUM.enrichment.reduce((n,t)=>n+t.modules.length,0),16);
 assert.equal(GRADE1_CURRICULUM.starterLessons.length,7);
 const rows=db.prepare('SELECT board,status FROM one_foundation_units').all();
 assert.equal(rows.length,39);
 assert.equal(rows.filter(x=>x.board==='CBSE').length,19);
 assert.equal(rows.filter(x=>x.board==='STATE').length,20);
 assert.ok(rows.every(x=>x.status==='draft'));
 assert.equal(db.prepare('SELECT COUNT(*) n FROM one_foundation_questions').get().n,71,
  '32 enrichment lessons x 2 checks plus 7 starter checks.');
 const state=db.prepare("SELECT id FROM one_curriculum_tracks WHERE board='STATE' AND grade=1 AND edition_year='2026-27'").get();
 assert.ok(state);
 const subject=db.prepare("SELECT id FROM one_subjects WHERE track_id=? AND subject_title='Environmental Studies'").get(state.id);
 assert.ok(subject);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM one_chapters WHERE subject_id=?').get(subject.id).n,1,
  'Only an explicitly original starter activity; do not invent KTBS textbook chapter titles.');
});
test('Class 1 editorial API requires staff role, privately exposes answer keys only to reviewers',async()=>{
 assert.equal((await call('/api/v1/grade1/editor/map?board=CBSE')).status,401);
 assert.equal((await call('/api/v1/grade1/editor/map?board=CBSE',parent)).status,403);
 assert.equal((await call('/api/v1/grade1/editor/map?board=STATE',teacher)).status,200);
 const review=await call('/api/v1/grade1/editor/map?board=CBSE',reviewer);
 assert.equal(review.status,200,JSON.stringify(review.body));
 assert.equal(review.body.units.length,19);
 assert.equal(review.body.curriculum.subjects.length,5);
 assert.equal(review.body.units[0].questions[0].correctIndex>=0,true);
});
test('Class 1 guardian learner journey: no draft leakage, no free payment entitlement, reviewed AI practice persists',async()=>{
 let appId=null,studentId=null;
 const unitId='one-fdn-one-g1-cbse-ai-spot-patterns';
 const unitBefore=db.prepare('SELECT * FROM one_foundation_units WHERE id=?').get(unitId);
 assert.ok(unitBefore);
 const originalConcept=db.prepare('SELECT * FROM one_concepts WHERE id=?').get(unitBefore.concept_id);
 const joined=db.prepare(`
 SELECT sub.*,ch.id chapter_id,ch.review_status chapter_status,t.id track_id,t.catalogue_status track_status,t.verified_at track_verified_at
 FROM one_foundation_units u
 JOIN one_concepts c ON c.id=u.concept_id JOIN one_chapters ch ON ch.id=c.chapter_id
 JOIN one_subjects sub ON sub.id=ch.subject_id JOIN one_curriculum_tracks t ON t.id=sub.track_id
 WHERE u.id=?
 `).get(unitId);
 const sourceRef='G1-2026-TEST-SOURCE-REVIEW';
 const subRef='G1-2026-TEST-SUBJECT-REVIEW';
 const chRef='G1-2026-TEST-CHAPTER-REVIEW';
 const rights='G1-2026-TEST-ORIGINAL-RIGHTS';
 const acad='G1-2026-TEST-ACADEMIC-REVIEW';
 try{
  const apply=await call('/api/v1/one-onboarding/guardian/applications',parent,'POST',{
   childName:'Fictional Grade One Pilot',grade:1,board:'CBSE',academicYear:'2026-27',
   guardianAcknowledgement:true,idempotencyKey:'grade-one-pilot-2026-0001'
  });
  assert.equal(apply.status,201,JSON.stringify(apply.body));appId=apply.body.application.id;
  const approved=await call('/api/v1/one-onboarding/admin/applications/'+appId+'/approve',admin,'POST',{
   confirmed:true,verificationMethod:'verified_in_person',evidenceReference:'TEST-G1-GUARDIAN-2026'
  });
  assert.equal(approved.status,201,JSON.stringify(approved.body));studentId=approved.body.studentId;
  const prefix='/api/v1/grade1/guardian/'+encodeURIComponent(studentId);
  const listing=await call(prefix+'/catalogue',parent);
  assert.equal(listing.status,200,JSON.stringify(listing.body));
  assert.equal(listing.body.learner.grade,1);
  assert.equal(listing.body.learner.board,'CBSE');
  assert.equal(listing.body.access,'locked');
  assert.equal(listing.body.catalogue.subjects.length,5);
  const english=listing.body.catalogue.subjects.find(s=>s.name==='English');
  assert.equal(english.chapters.length,9);
  assert.equal(listing.body.catalogue.subjects.find(s=>s.name==='Mathematics').chapters.length,13);
  assert.equal(listing.body.catalogue.subjects.find(s=>s.name==='Hindi').chapters.length,19);
  assert.equal(listing.body.catalogue.subjects.find(s=>s.name==='Vayentra Original: AI & Digital Thinking').chapters.length,8);
  assert.equal(listing.body.catalogue.subjects.find(s=>s.name==='Vayentra Original: Money & Life Skills').chapters.length,8);
  assert.equal((await call(prefix+'/units/'+unitId,parent)).status,403);
  assert.equal((await call(prefix+'/catalogue',student)).status,403);
  assert.equal((await call('/api/v1/grade1/editor/units/'+unitId+'/publish',admin,'POST',{
   rightsVerified:true,originalWorkReference:rights
  })).status,409);
  const grant=await call('/api/v1/grade1/admin/pilot-grants',admin,'POST',{
   studentId,reason:'Fictional guardian-supervised Class One pilot',
   expiresAt:new Date(Date.now()+7*86400000).toISOString()
  });
  assert.equal(grant.status,200,JSON.stringify(grant.body));
  assert.equal(grant.body.paidAccessChanged,false);
  assert.equal(db.prepare('SELECT entitlement_status FROM one_memberships WHERE student_id=?').get(studentId).entitlement_status,'not_configured');
  assert.equal((await call(prefix+'/units/'+unitId,parent)).status,404);
  assert.equal((await call('/api/v1/grade1/editor/units/'+unitId+'/request-review',parent,'POST',{
   editorialReference:'TEST-STAFF-REF'
  })).status,403);
  const reqReview=await call('/api/v1/grade1/editor/units/'+unitId+'/request-review',teacher,'POST',{
   editorialReference:'TEST-C1-TEACHER-CHECK'
  });
  assert.equal(reqReview.status,200,JSON.stringify(reqReview.body));
  const signed=await call('/api/v1/grade1/editor/units/'+unitId+'/review',reviewer,'POST',{
   decision:'approved',academicReviewReference:acad
  });
  assert.equal(signed.status,200,JSON.stringify(signed.body));
  assert.equal((await call('/api/v1/grade1/editor/units/'+unitId+'/publish',admin,'POST',{
   rightsVerified:true,originalWorkReference:rights
  })).status,409,'Academic source, subject and chapter must be independently mapped first.');
  assert.equal((await call('/api/v1/one-content/admin/tracks/'+joined.track_id+'/verify',admin,'POST',{
   editorialReference:sourceRef
  })).status,200);
  assert.equal((await call('/api/v1/one-content/admin/subjects/'+joined.id+'/approve',admin,'POST',{
   academicReviewReference:subRef
  })).status,200);
  assert.equal((await call('/api/v1/one-content/admin/chapters/'+joined.chapter_id+'/approve',admin,'POST',{
   academicReviewReference:chRef
  })).status,200);
  const published=await call('/api/v1/grade1/editor/units/'+unitId+'/publish',admin,'POST',{
   rightsVerified:true,originalWorkReference:rights
  });
  assert.equal(published.status,200,JSON.stringify(published.body));
  const outline=await call(prefix+'/catalogue',parent);
  assert.equal(outline.status,200);
  assert.equal(outline.body.access,'pilot_or_entitled');
  assert.equal(outline.body.catalogue.subjects.find(s=>s.name.includes('AI')).approvedLessons,1);
  const lesson=await call(prefix+'/units/'+unitId,parent);
  assert.equal(lesson.status,200);
  assert.equal(lesson.body.lesson.questions.length,2);
  assert.equal(Object.hasOwn(lesson.body.lesson.questions[0],'correctIndex'),false);
  assert.equal(Object.hasOwn(lesson.body.lesson.questions[0],'explanation'),false);
  const answers=[0,0],key='g1-concept-check-2026-001';
  const saved=await call(prefix+'/attempts',parent,'POST',{unitId,answers,idempotencyKey:key});
  assert.equal(saved.status,201,JSON.stringify(saved.body));assert.equal(saved.body.correct,2);
  assert.equal((await call(prefix+'/attempts',parent,'POST',{unitId,answers,idempotencyKey:key})).body.replayed,true);
  assert.equal((await call(prefix+'/attempts',parent,'POST',{unitId,answers:[1,1],idempotencyKey:key})).status,409);
  assert.equal((await call(prefix+'/catalogue',parent)).body.progress.checkedLessons,1);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM one_foundation_attempts WHERE student_id=?').get(studentId).n,1);
  const withdrawn=await call('/api/v1/grade1/editor/units/'+unitId+'/withdraw',admin,'POST',{
   reason:'TEST academic accuracy correction before public release'
  });
  assert.equal(withdrawn.status,200);
  assert.equal((await call(prefix+'/units/'+unitId,parent)).status,404);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM one_foundation_attempts WHERE student_id=?').get(studentId).n,1,
   'Withdrawal never deletes historic learning evidence.');
 }finally{
  // Strictly a disposable test DB. Never run this suite against a live academic DB.
  if(studentId){
   db.prepare('DELETE FROM one_foundation_attempts WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_foundation_pilot_grants WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_journey_audit WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_academic_years WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_consent_reviews WHERE student_id=?').run(studentId);
   db.prepare('DELETE FROM one_memberships WHERE student_id=?').run(studentId);
  }
  if(appId)db.prepare('DELETE FROM one_admission_applications WHERE id=?').run(appId);
  if(studentId)db.prepare('DELETE FROM students WHERE id=?').run(studentId);
  db.prepare('DELETE FROM one_foundation_reviews WHERE unit_id=?').run(unitId);
  db.prepare('DELETE FROM one_content_review_logs WHERE editorial_reference IN (?,?,?)')
   .run(sourceRef,subRef,chRef);
  db.prepare('UPDATE one_curriculum_tracks SET catalogue_status=?,verified_at=? WHERE id=?')
   .run(joined.track_status,joined.track_verified_at,joined.track_id);
  db.prepare('UPDATE one_subjects SET review_status=? WHERE id=?')
   .run(joined.review_status,joined.id);
  db.prepare('UPDATE one_chapters SET review_status=? WHERE id=?')
   .run(joined.chapter_status,joined.chapter_id);
  db.prepare('UPDATE one_concepts SET content_status=?,reviewer_id=?,reviewed_at=? WHERE id=?')
   .run(originalConcept.content_status,originalConcept.reviewer_id,originalConcept.reviewed_at,unitBefore.concept_id);
  db.prepare('UPDATE one_foundation_units SET status=?,reviewer_id=?,review_reference=?,reviewed_at=?,publisher_id=?,published_at=? WHERE id=?')
   .run(unitBefore.status,unitBefore.reviewer_id,unitBefore.review_reference,unitBefore.reviewed_at,unitBefore.publisher_id,unitBefore.published_at,unitId);
 }
});
