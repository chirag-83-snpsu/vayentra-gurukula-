import test,{describe,before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';

let server,base,studentToken,parentToken;
before(async()=>{
 await new Promise(resolve=>{server=http.createServer(app);server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;resolve();});});
 async function login(email){
  const response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'Gurukula@2026'})});
  assert.equal(response.status,200,'seed account login');
  return (await response.json()).token;
 }
 [studentToken,parentToken]=await Promise.all([login('student@vayentra.org'),login('guardian@vayentra.org')]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
const req=async(path,token,method='GET',body)=>{
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 return {status:response.status,body:await response.json()};
};
describe('Daily Practice authenticated ownership contracts',()=>{
 test('unauthenticated user cannot read flashcards',async()=>{
  const r=await req('/api/v1/school/practice/flashcards');
  assert.equal(r.status,401);
 });
 test('parent cannot read student-only flashcards',async()=>{
  const r=await req('/api/v1/school/practice/flashcards',parentToken);
  assert.equal(r.status,403);
 });
 test('student receives their own card roster',async()=>{
  const r=await req('/api/v1/school/practice/flashcards',studentToken);
  assert.equal(r.status,200);assert.ok(Array.isArray(r.body));
 });
 test('query studentId must not override authenticated identity',async()=>{
  const own=await req('/api/v1/school/practice/flashcards',studentToken);
  const forced=await req('/api/v1/school/practice/flashcards?studentId=someone-else',studentToken);
  assert.equal(forced.status,200);
  assert.deepEqual(forced.body,own.body);
 });
 test('parent cannot update flashcard progress',async()=>{
  const r=await req('/api/v1/school/practice/flashcards/unknown/review',parentToken,'POST',{isCorrect:true});
  assert.equal(r.status,403);
 });
 test('invalid status is rejected before mutation',async()=>{
  const r=await req('/api/v1/school/practice/flashcards/unknown/review',studentToken,'POST',{isCorrect:'true'});
  assert.equal(r.status,400);
 });
 test('another student card ID cannot be changed',async()=>{
  const r=await req('/api/v1/school/practice/flashcards/other-student-card/review',studentToken,'POST',{isCorrect:false});
  assert.equal(r.status,404);
 });
});
