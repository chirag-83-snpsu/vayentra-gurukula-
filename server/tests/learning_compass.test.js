import test,{describe,before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';

let server,base,studentToken,teacherToken,parentToken;
before(async()=>{
 await new Promise(resolve=>{
  server=http.createServer(app);
  server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;resolve();});
 });
 async function login(email){
  const response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({email,password:'Gurukula@2026'})});
  const data=await response.json();
  assert.equal(response.status,200,'Seed user login must work');
  return data.token;
 }
 [studentToken,teacherToken,parentToken]=await Promise.all([
  login('student@vayentra.org'),login('teacher@vayentra.org'),login('guardian@vayentra.org')
 ]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
async function request(path,token,method='GET',body){
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 return {status:response.status,body:await response.json()};
}
const pilot='/api/v1/diagnostics/forms/vg-lc-7-cbse-math-v1';
describe('Learning Compass pilot security and content contract',()=>{
 test('unauthenticated form listing is rejected',async()=>{
  const result=await request('/api/v1/diagnostics/forms');
  assert.equal(result.status,401);
 });
 test('guardian cannot enumerate private student diagnostic forms',async()=>{
  const result=await request('/api/v1/diagnostics/forms',parentToken);
  assert.equal(result.status,200);
  assert.deepEqual(result.body.forms,[]);
 });
 test('teacher sees eight-item draft answer key',async()=>{
  const result=await request(pilot,teacherToken);
  assert.equal(result.status,200);
  assert.equal(result.body.form.questions.length,8);
  assert.equal(result.body.form.answerKey.length,8);
  for(const q of result.body.form.questions){
   const key=result.body.form.answerKey.find(x=>x.id===q.id);
   assert.ok(key);
   assert.ok(Number.isInteger(key.correctIndex));
   assert.ok(key.correctIndex>=0&&key.correctIndex<q.options.length);
  }
 });
 test('student does not receive teacher answer key before publication',async()=>{
  const result=await request(pilot,studentToken);
  // Form is deliberately a draft; the student must not receive its answer key.
  assert.equal(result.status,403);
 });
 test('student cannot publish question bank',async()=>{
  const result=await request(pilot+'/publish',studentToken,'POST',{confirmedReviewed:true});
  assert.equal(result.status,403);
 });
 test('parent may not submit child diagnostic',async()=>{
  const result=await request(pilot+'/submit',parentToken,'POST',{responses:[]});
  assert.equal(result.status,403);
 });
 test('draft diagnostic cannot be submitted by student',async()=>{
  const result=await request(pilot+'/submit',studentToken,'POST',{responses:[]});
  assert.equal(result.status,403);
 });
 test('guardian cannot access arbitrary student record',async()=>{
  const result=await request('/api/v1/diagnostics/student/not-my-child/attempts',parentToken);
  assert.equal(result.status,403);
 });
 test('question bank contains four misconception dimensions',()=>{
  const form=db.prepare('SELECT * FROM diagnostic_forms WHERE id=?').get('vg-lc-7-cbse-math-v1');
  assert.equal(form.status,'draft');
  const concepts=db.prepare('SELECT DISTINCT concept_id FROM diagnostic_items WHERE form_id=?').all(form.id).map(x=>x.concept_id);
  assert.deepEqual(concepts.sort(),['equation-formation','integer-signs','multiplication-signs','order-of-operations']);
 });
});
