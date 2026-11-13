import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';

let server,base,guardianToken,studentToken;
async function req(route,{token,method='GET',body}={}){
 const response=await fetch(base+route,{
  method,
  headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},
  body:body?JSON.stringify(body):undefined
 });
 return {status:response.status,body:await response.json()};
}
before(async()=>{
 await new Promise(resolve=>{
  server=http.createServer(app);
  server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;resolve();});
 });
 async function login(email){
  const result=await req('/api/v1/auth/login',{method:'POST',body:{email,password:'Gurukula@2026'}});
  assert.equal(result.status,200,JSON.stringify(result.body));
  return result.body.token;
 }
 [guardianToken,studentToken]=await Promise.all([login('guardian@vayentra.org'),login('student@vayentra.org')]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});

test('unsigned Google credential and fake sandbox sign-in never create a user',async()=>{
 const beforeCount=db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
 const google=await req('/api/v1/auth/google',{method:'POST',
  body:{credential:'header.eyJlbWFpbCI6ImF0dGFja2VyQGV4YW1wbGUuY29tIn0.signature'}});
 assert.equal(google.status,503);
 assert.equal(google.body.code,'GOOGLE_PROVIDER_NOT_READY');
 const sandbox=await req('/api/v1/auth/google',{method:'POST',body:{isDemoSandbox:true}});
 assert.equal(sandbox.status,503);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM users').get().n,beforeCount);
});
test('pseudo-OTP routes cannot claim to dispatch SMS or verify a static code',async()=>{
 const send=await req('/api/v1/auth/otp/send',{method:'POST',body:{mobile:'9876543210'}});
 assert.equal(send.status,503);
 const verify=await req('/api/v1/auth/otp/verify',{method:'POST',
  body:{mobile:'9876543210',otp:'123456'}});
 assert.equal(verify.status,503);
});
test('student password login uses an explicit database mapping, not a known demo child',async()=>{
 const mine=await req('/api/v1/auth/me',{token:studentToken});
 assert.equal(mine.status,200);
 assert.ok(mine.body.activeChild);
 assert.equal(mine.body.activeChild.id,'stu-001');

 const old=db.prepare("SELECT student_id FROM one_student_account_links WHERE user_id='usr-student-01'").get();
 assert.ok(old);
 db.prepare("DELETE FROM one_student_account_links WHERE user_id='usr-student-01'").run();
 try{
  const unlinked=await req('/api/v1/auth/login',{method:'POST',
   body:{email:'student@vayentra.org',password:'Gurukula@2026'}});
  assert.equal(unlinked.status,403);
  assert.equal(unlinked.body.code,'STUDENT_LINK_REQUIRED');
  const oldSession=await req('/api/v1/auth/me',{token:studentToken});
  assert.equal(oldSession.status,403);
 }finally{
  db.prepare('INSERT INTO one_student_account_links(user_id,student_id) VALUES(?,?)')
   .run('usr-student-01',old.student_id);
 }
});
test('legacy direct child creation is permanently retired; no guardian spoofing or fake consent',async()=>{
 const before=db.prepare('SELECT COUNT(*) AS n FROM students').get().n;
 const r=await req('/api/v1/auth/child/add',{method:'POST',token:guardianToken,body:{
  name:'Test Child Legacy',grade:4,board:'CBSE',guardianId:'forged-other-guardian'
 }});
 assert.equal(r.status,410);
 assert.equal(r.body.code,'USE_REVIEWED_ONE_ADMISSION');
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM students').get().n,before);
});
test('anonymous caller cannot fetch session data',async()=>{
 assert.equal((await req('/api/v1/auth/me')).status,401);
});
