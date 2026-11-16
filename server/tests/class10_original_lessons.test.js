import test,{describe,before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';

const maths='vg-cbse10-maths-quadratic-factorisation';
const science='vg-cbse10-science-balancing-equations';
let server,base,adminToken,parentToken;
async function req(path,token,method='GET',body){
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
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
 [adminToken,parentToken]=await Promise.all([login('admin@vayentra.org'),login('guardian@vayentra.org')]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
describe('Class 10 original Maths and Science video lesson packs',()=>{
 test('the two lessons are seeded as private teacher-review drafts',()=>{
  for(const id of [maths,science]){
   const record=db.prepare(`
     SELECT t.id,t.status,v.production_status,v.media_url,v.script_outline
     FROM cbse_topics t JOIN cbse_lesson_videos v ON v.topic_id=t.id WHERE t.id=?
   `).get(id);
   assert.ok(record,'seed '+id);
   assert.equal(record.status,'draft');
   assert.equal(record.production_status,'teacher_review');
   assert.equal(record.media_url,null);
   assert.ok(record.script_outline.length>900);
  }
 });
 test('each pack contains 3 unapproved practice questions and valid answer keys',()=>{
  for(const id of [maths,science]){
   const rows=db.prepare('SELECT * FROM cbse_topic_practice_items WHERE topic_id=? ORDER BY position').all(id);
   assert.equal(rows.length,3);
   for(const row of rows){
    const options=JSON.parse(row.options_json);
    assert.equal(options.length,4);
    assert.ok(Number.isInteger(row.correct_index)&&row.correct_index>=0&&row.correct_index<4);
    assert.equal(row.status,'draft');
    assert.ok(row.explanation.length>30);
   }
  }
 });
 test('public lesson catalog does not show unpublished Class 10 content',async()=>{
  for(const subject of ['Mathematics','Science']){
   const r=await req('/api/v1/cbse/topics?grade=10&subject='+subject);
   assert.equal(r.status,200);
   assert.equal(r.body.topics.some(t=>[maths,science].includes(t.id)),false);
  }
 });
 test('a student or parent cannot fetch draft answer keys through the private teacher endpoint',async()=>{
  const result=await req('/api/v1/cbse/teacher/topics/'+maths+'/practice',parentToken);
  assert.equal(result.status,403);
 });
 test('a guest cannot access the protected teacher answer key',async()=>{
  const result=await req('/api/v1/cbse/teacher/topics/'+maths+'/practice');
  assert.equal(result.status,401);
 });
 test('admin can review original scripts and answer keys',async()=>{
  const result=await req('/api/v1/cbse/teacher/topics/'+science+'/practice',adminToken);
  assert.equal(result.status,200);
  assert.equal(result.body.questions.length,3);
  assert.equal(result.body.questions[0].correctIndex,1);
 });
 test('public quiz is blocked before educator video approval',async()=>{
  const view=await req('/api/v1/cbse/topics/'+maths+'/practice');
  const check=await req('/api/v1/cbse/topics/'+maths+'/practice/check',null,'POST',{responses:[]});
  assert.equal(view.status,404);
  assert.equal(check.status,404);
 });
 test('a published lesson quiz hides keys until submission, grades correctly, and rejects duplicate items',async()=>{
  db.exec('BEGIN IMMEDIATE');
  try{
   db.prepare("UPDATE cbse_topics SET status='published' WHERE id=?").run(maths);
   db.prepare("UPDATE cbse_lesson_videos SET production_status='ready',media_url='/media/lessons/math-test.mp4' WHERE topic_id=?").run(maths);
   db.prepare("UPDATE cbse_topic_practice_items SET status='published' WHERE topic_id=?").run(maths);
   const available=await req('/api/v1/cbse/topics/'+maths+'/practice');
   assert.equal(available.status,200);
   assert.equal(available.body.questions.length,3);
   assert.ok(available.body.questions.every(q=>!('correctIndex' in q)&&!('explanation' in q)));
   const responseRows=[
    {itemId:'vg-c10-m-q1',selectedIndex:0},
    {itemId:'vg-c10-m-q2',selectedIndex:1},
    {itemId:'vg-c10-m-q3',selectedIndex:0}
   ];
   const result=await req('/api/v1/cbse/topics/'+maths+'/practice/check',null,'POST',{responses:responseRows});
   assert.equal(result.status,200);
   assert.equal(result.body.correct,3);
   assert.equal(result.body.total,3);
   assert.ok(result.body.feedback.every(f=>f.isCorrect));
   const invalid=await req('/api/v1/cbse/topics/'+maths+'/practice/check',null,'POST',{
    responses:[responseRows[0],responseRows[0],responseRows[2]]
   });
   assert.equal(invalid.status,400);
  }finally{db.exec('ROLLBACK');}
 });
});
