import test,{describe,before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';
let server,base;
async function request(path,body,token){
 const response=await fetch(base+path,{
  method:body?'POST':'GET',
  headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
  ...(body?{body:JSON.stringify(body)}:{})
 });
 return {status:response.status,body:await response.json()};
}
before(async()=>{
 await new Promise(resolve=>{server=http.createServer(app);server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;resolve();});});
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
const password='Gurukula@2026';
describe('Separate login and verified enrolled class',()=>{
 test('student profile is linked to the actual authenticated user',()=>{
  const row=db.prepare(`
   SELECT s.id,s.grade,s.name,u.id AS user_id
   FROM users u
   JOIN student_user_links l ON l.user_id=u.id
   JOIN students s ON s.id=l.student_id WHERE u.email='student@vayentra.org'
  `).get();
  assert.ok(row,'seed student link must be present after migration');
  assert.ok(Number.isInteger(row.grade));
  assert.ok(row.grade>=1&&row.grade<=10);
 });
 test('correct student class and password allow enrollment-linked login',async()=>{
  const row=db.prepare(`
   SELECT s.id,s.grade,s.name FROM student_user_links l JOIN users u ON u.id=l.user_id
   JOIN students s ON s.id=l.student_id WHERE u.email='student@vayentra.org'
  `).get();
  const result=await request('/api/v1/auth/login',{
   email:'student@vayentra.org',password,audience:'student',grade:row.grade
  });
  assert.equal(result.status,200);
  assert.equal(result.body.user.role,'student');
  assert.equal(result.body.activeChild.id,row.id);
  assert.equal(result.body.activeChild.grade,row.grade);
  assert.ok(result.body.token);
  const me=await request('/api/v1/auth/me',null,result.body.token);
  assert.equal(me.status,200);
  assert.equal(me.body.activeChild.id,row.id);
 });
 test('wrong class is rejected rather than switching the student's profile',async()=>{
  const row=db.prepare(`
   SELECT s.grade FROM student_user_links l JOIN users u ON u.id=l.user_id
   JOIN students s ON s.id=l.student_id WHERE u.email='student@vayentra.org'
  `).get();
  const wrong=row.grade===10?9:row.grade+1;
  const result=await request('/api/v1/auth/login',{
   email:'student@vayentra.org',password,audience:'student',grade:wrong
  });
  assert.equal(result.status,403);
  assert.equal(result.body.code,'CLASS_MISMATCH');
  assert.equal(result.body.token,undefined);
 });
 test('an account type selector cannot change authenticated role',async()=>{
  const result=await request('/api/v1/auth/login',{
   email:'guardian@vayentra.org',password,audience:'student',grade:7
  });
  assert.equal(result.status,403);
  assert.equal(result.body.code,'ACCOUNT_TYPE_MISMATCH');
 });
 test('parent can sign in without a class selector',async()=>{
  const result=await request('/api/v1/auth/login',{
   email:'guardian@vayentra.org',password,audience:'parent'
  });
  assert.equal(result.status,200);
  assert.equal(result.body.user.role,'parent');
 });
 test('staff can sign in without impersonating a student',async()=>{
  const result=await request('/api/v1/auth/login',{
   email:'teacher@vayentra.org',password,audience:'staff'
  });
  assert.equal(result.status,200);
  assert.equal(result.body.user.role,'teacher');
 });
 test('invalid audience or grade input is rejected',async()=>{
  const badAudience=await request('/api/v1/auth/login',{
   email:'student@vayentra.org',password,audience:'admin'
  });
  assert.equal(badAudience.status,400);
  const badClass=await request('/api/v1/auth/login',{
   email:'student@vayentra.org',password,audience:'student',grade:11
  });
  assert.equal(badClass.status,400);
 });
 test('student profile stays private without authentication',async()=>{
  const result=await request('/api/v1/auth/me');
  assert.equal(result.status,401);
 });
});
