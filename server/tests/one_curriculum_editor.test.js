import test,{before,after,describe} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';

let server,base,admin,parent,student;
async function request(path,token,method='GET',body){
 const resp=await fetch(base+path,{method,headers:{'Content-Type':'application/json',
  ...(token?{Authorization:'Bearer '+token}:{})},
  body:body?JSON.stringify(body):undefined});
 return {status:resp.status,json:await resp.json()};
}
before(async()=>{
 await new Promise(resolve=>{server=http.createServer(app);server.listen(0,'127.0.0.1',()=>{
  base='http://127.0.0.1:'+server.address().port;resolve();
 });});
 for(const [email,role] of [['admin@vayentra.org','admin'],['guardian@vayentra.org','parent'],['student@vayentra.org','student']]){
  const r=await request('/api/v1/auth/login',null,'POST',{email,password:'Gurukula@2026'});
  assert.equal(r.status,200);
  if(role==='admin')admin=r.json.token;
  if(role==='parent')parent=r.json.token;
  if(role==='student')student=r.json.token;
 }
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
describe('Vayentra ONE editorial publishing and learner entitlements',()=>{
 test('guest cannot read admin draft content map',async()=>{
  assert.equal((await request('/api/v1/one-content/admin/tracks/one-2026-cbse-7/map')).status,401);
 });
 test('guardian cannot read admin draft content map',async()=>{
  assert.equal((await request('/api/v1/one-content/admin/tracks/one-2026-cbse-7/map',parent)).status,403);
 });
 test('teacher-independent student cannot read private guardian outline route',async()=>{
  assert.equal((await request('/api/v1/one-content/students/stu-001/outline',student)).status,403);
 });
 test('guardian cannot read paid concept outline without active entitlement',async()=>{
  assert.equal((await request('/api/v1/one-content/students/stu-001/outline',parent)).status,403);
 });
 test('admin can review draft track map without publishing any chapters',async()=>{
  const r=await request('/api/v1/one-content/admin/tracks/one-2026-cbse-7/map',admin);
  assert.equal(r.status,200);
  assert.equal(r.json.track.grade,7);
  assert.equal(r.json.track.board,'CBSE');
  assert.ok(Array.isArray(r.json.subjects));
 });
 test('admin cannot verify board curriculum without academic-review reference',async()=>{
  const r=await request('/api/v1/one-content/admin/tracks/one-2026-cbse-7/verify',admin,'POST',{editorialReference:''});
  assert.equal(r.status,400);
 });
 test('admin cannot insert blank subject',async()=>{
  const r=await request('/api/v1/one-content/admin/tracks/one-2026-cbse-7/subjects',admin,'POST',{title:''});
  assert.equal(r.status,400);
 });
 test('admin cannot publish concept without rights attestation',async()=>{
  const r=await request('/api/v1/one-content/admin/concepts/unknown/publish',admin,'POST',{
   academicReviewReference:'REVIEW-2026-TEST',originalContentRightsConfirmed:false
  });
  assert.equal(r.status,400);
 });
});
