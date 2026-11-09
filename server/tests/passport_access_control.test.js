import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
let server,base,adminToken,parentToken,studentToken;
async function request(path,token){
 const response=await fetch(base+path,{headers:token?{Authorization:'Bearer '+token}:{}});
 return {status:response.status,data:await response.json()};
}
before(async()=>{
 await new Promise(resolve=>{
  server=http.createServer(app);
  server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;resolve();});
 });
 const signIn=async email=>{
  const response=await fetch(base+'/api/v1/auth/login',{method:'POST',
   headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'Gurukula@2026'})});
  assert.equal(response.status,200,'Seeded test account login');
  return (await response.json()).token;
 };
 [adminToken,parentToken,studentToken]=await Promise.all([
  signIn('admin@vayentra.org'),signIn('guardian@vayentra.org'),signIn('student@vayentra.org')
 ]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
test('guests cannot access learner ID or academic-year history',async()=>{
 const response=await request('/api/v1/passport/me');
 assert.equal(response.status,401);
});
test('linked guardians view their registered child passport only',async()=>{
 const current=await request('/api/v1/passport/me',parentToken);
 assert.equal(current.status,200);
 assert.ok(Array.isArray(current.data.passports));
 assert.ok(current.data.passports.length>0);
 for(const p of current.data.passports){
  assert.match(p.learnerNumber,/^VG-L-/);
  const own=await request('/api/v1/passport/students/'+encodeURIComponent(p.studentId),parentToken);
  assert.equal(own.status,200);
 }
 const denied=await request('/api/v1/passport/students/not-my-student',parentToken);
 assert.equal(denied.status,403);
});
test('student views only an explicitly linked own passport',async()=>{
 const mine=await request('/api/v1/passport/me',studentToken);
 assert.equal(mine.status,200);
 assert.equal(mine.data.passports.length,1);
 const id=mine.data.passports[0].studentId;
 assert.equal((await request('/api/v1/passport/students/'+encodeURIComponent(id),studentToken)).status,200);
 assert.equal((await request('/api/v1/passport/students/not-my-student',studentToken)).status,403);
});
test('administrator access is required for promotion roster',async()=>{
 const admin=await request('/api/v1/passport/admin/roster',adminToken);
 assert.equal(admin.status,200);
 assert.ok(Array.isArray(admin.data.learners));
 assert.equal((await request('/api/v1/passport/admin/roster',parentToken)).status,403);
 assert.equal((await request('/api/v1/passport/admin/roster',studentToken)).status,403);
});
