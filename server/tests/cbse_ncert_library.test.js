import test,{describe,before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';
let server,base,teacherToken,parentToken;
async function request(path,token,method='GET',body){
 const res=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 return {status:res.status,body:await res.json()};
}
before(async()=>{
 await new Promise(resolve=>{server=http.createServer(app);server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;resolve();});});
 async function login(email){
  const r=await request('/api/v1/auth/login',null,'POST',{email,password:'Gurukula@2026'});
  assert.equal(r.status,200);
  return r.body.token;
 }
 [teacherToken,parentToken]=await Promise.all([login('teacher@vayentra.org'),login('guardian@vayentra.org')]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
describe('NCERT reference and video governance',()=>{
 test('publishes class 1–10 core subject catalogue without personal information',async()=>{
  const r=await request('/api/v1/cbse/catalogue');
  assert.equal(r.status,200);
  assert.deepEqual(r.body.grades,[1,2,3,4,5,6,7,8,9,10]);
  for(const grade of r.body.grades)assert.ok(r.body.subjectsByGrade[String(grade)].length>=3);
  assert.ok(r.body.subjects.length>=40);
  assert.equal(r.body.subjects.every(s=>s.source_status==='reference_only_permission_pending'),true);
  assert.equal(r.body.subjects.every(s=>!('source_url' in s)),true);
 });
 test('rejects invalid class and subject filters',async()=>{
  const a=await request('/api/v1/cbse/topics?grade=11&subject=Mathematics');
  assert.equal(a.status,400);
  const b=await request('/api/v1/cbse/topics?grade=7&subject=');
  assert.equal(b.status,400);
 });
 test('unverified topic drafts are never shown to children',async()=>{
  const r=await request('/api/v1/cbse/topics?grade=7&subject=Mathematics');
  assert.equal(r.status,200);
  assert.equal(r.body.source.permissionStatus,'reference_only_permission_pending');
  assert.ok(Array.isArray(r.body.topics));
  for(const topic of r.body.topics){
   assert.equal(topic.contentStatus,'published');
   assert.equal(topic.video.status==='ready'||topic.video.status==='not_available',true);
   assert.equal(topic.video.url===null||typeof topic.video.url==='string',true);
  }
 });
 test('unauthenticated user cannot create lesson topics',async()=>{
  const r=await request('/api/v1/cbse/teacher/topics',null,'POST',{sourceId:'cbse-7-mathematics',chapterTitle:'Private test',topicTitle:'Private test',conceptDescription:'Private test original item'});
  assert.equal(r.status,401);
 });
 test('parent cannot create topics',async()=>{
  const r=await request('/api/v1/cbse/teacher/topics',parentToken,'POST',{sourceId:'cbse-7-mathematics',chapterTitle:'Private test',topicTitle:'Private test',conceptDescription:'Private test original item'});
  assert.equal(r.status,403);
 });
 test('teacher only has access to assigned grade and subject content',async()=>{
  const allowed=await request('/api/v1/cbse/teacher/topics?grade=7&subject=Mathematics',teacherToken);
  assert.equal(allowed.status,200);
  const blocked=await request('/api/v1/cbse/teacher/topics?grade=10&subject=Mathematics',teacherToken);
  assert.equal(blocked.status,403);
 });
 test('unapproved lesson video media cannot publish through unauthorized request',async()=>{
  const r=await request('/api/v1/cbse/teacher/topics/cbse7math-signed-numbers/publish',parentToken,'POST',{
   mediaUrl:'https://evil.example/lesson.mp4',mediaType:'mp4',durationSeconds:120,
   teacherReviewed:true,originalContentConfirmed:true,sourceChecked:true
  });
  assert.equal(r.status,403);
 });
 test('no copied NCERT textbook pages are stored in video database',()=>{
  const rows=db.prepare('SELECT media_url,origin,production_status FROM cbse_lesson_videos').all();
  assert.ok(rows.every(x=>x.origin==='vayentra_original'));
  assert.ok(rows.every(x=>x.media_url===null||typeof x.media_url==='string'));
 });
});
