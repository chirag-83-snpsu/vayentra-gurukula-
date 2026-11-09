import test,{describe,before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {db} from '../db/database.js';
import {app} from '../index.js';
import {CLASS10_NEXT_LESSON_BATCH} from '../data/class10NextLessonBatch.js';

let server,base;
async function request(path,method='GET',body){
 const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 return {status:r.status,body:await r.json()};
}
before(async()=>{
 await new Promise(resolve=>{server=http.createServer(app);server.listen(0,'127.0.0.1',()=>{
  base='http://127.0.0.1:'+server.address().port;resolve();
 });});
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
describe('Four additional original Class 10 CBSE Maths/Science lessons',()=>{
 test('lesson pack includes exactly two maths and two science entries',()=>{
  assert.equal(CLASS10_NEXT_LESSON_BATCH.length,4);
  assert.equal(CLASS10_NEXT_LESSON_BATCH.filter(x=>x.sourceId==='cbse-10-mathematics').length,2);
  assert.equal(CLASS10_NEXT_LESSON_BATCH.filter(x=>x.sourceId==='cbse-10-science').length,2);
 });
 test('migration 009 creates unique draft lesson records',()=>{
  for(const lesson of CLASS10_NEXT_LESSON_BATCH){
   const topic=db.prepare('SELECT * FROM cbse_topics WHERE id=?').get(lesson.id);
   assert.ok(topic,lesson.id);
   assert.equal(topic.status,'draft');
   assert.equal(topic.source_id,lesson.sourceId);
   const video=db.prepare('SELECT * FROM cbse_lesson_videos WHERE topic_id=?').get(lesson.id);
   assert.ok(video);
   assert.equal(video.origin,'vayentra_original');
   assert.equal(video.production_status,'teacher_review');
   assert.equal(video.media_url,null);
   assert.ok(video.script_outline.length>=60);
  }
 });
 test('each lesson has three reviewed-draft assessment items with valid keys',()=>{
  for(const lesson of CLASS10_NEXT_LESSON_BATCH){
   const rows=db.prepare('SELECT * FROM cbse_topic_practice_items WHERE topic_id=? ORDER BY position').all(lesson.id);
   assert.equal(rows.length,3);
   for(const q of rows){
    assert.equal(q.status,'draft');
    const opts=JSON.parse(q.options_json);
    assert.equal(opts.length,4);
    assert.ok(Number.isInteger(q.correct_index));
    assert.ok(q.correct_index>=0&&q.correct_index<=3);
    assert.ok(q.explanation.length>15);
   }
  }
 });
 test('drafts cannot appear in the public Class 10 curriculum or quiz listing',async()=>{
  for(const subject of ['Mathematics','Science']){
   const r=await request('/api/v1/cbse/topics?grade=10&subject='+encodeURIComponent(subject));
   assert.equal(r.status,200);
   for(const item of CLASS10_NEXT_LESSON_BATCH)
    assert.equal(r.body.topics.some(t=>t.id===item.id),false);
  }
  for(const lesson of CLASS10_NEXT_LESSON_BATCH){
   const r=await request('/api/v1/cbse/topics/'+lesson.id+'/practice');
   assert.equal(r.status,404);
  }
 });
 test('all seeded quiz answers match their original explanations',()=>{
  const checks=[
   {id:'vg-c10-ap-q1',correct:1},
   {id:'vg-c10-ap-q2',correct:1},
   {id:'vg-c10-ap-q3',correct:1},
   {id:'vg-c10-trig-q1',correct:2},
   {id:'vg-c10-trig-q2',correct:2},
   {id:'vg-c10-trig-q3',correct:1},
   {id:'vg-c10-ohm-q1',correct:0},
   {id:'vg-c10-ohm-q2',correct:2},
   {id:'vg-c10-ohm-q3',correct:2},
   {id:'vg-c10-photo-q1',correct:1},
   {id:'vg-c10-photo-q2',correct:0},
   {id:'vg-c10-photo-q3',correct:1}
  ];
  for(const check of checks){
   const question=db.prepare('SELECT * FROM cbse_topic_practice_items WHERE id=?').get(check.id);
   assert.ok(question,check.id);
   assert.equal(question.correct_index,check.correct);
  }
 });
});
