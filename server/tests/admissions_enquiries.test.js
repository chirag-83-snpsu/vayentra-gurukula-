import test,{describe,before,after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {app} from '../index.js';
import {db} from '../db/database.js';

let server,base,adminToken,parentToken;
async function request(path,token,method='GET',body){
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',
  ...(token?{Authorization:'Bearer '+token}:{})},
  body:body?JSON.stringify(body):undefined});
 return {status:response.status,body:await response.json()};
}
before(async()=>{
 await new Promise(resolve=>{
  server=http.createServer(app);
  server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;resolve();});
 });
 async function login(email){
  const r=await request('/api/v1/auth/login',null,'POST',{email,password:'Gurukula@2026'});
  assert.equal(r.status,200,'Local seeded test account login');
  return r.body.token;
 }
 [adminToken,parentToken]=await Promise.all([login('admin@vayentra.org'),login('guardian@vayentra.org')]);
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
const valid={guardianName:'Test Guardian',contactPhone:'+91 98765 43210',email:'testguardian@example.invalid',
 grade:7,board:'CBSE',message:'Please share available class times.',consent:true};
describe('Guardian admissions enquiry privacy and reliability',()=>{
 test('missing consent is rejected',async()=>{
  const r=await request('/api/v1/admissions/enquiries',null,'POST',{...valid,consent:false});
  assert.equal(r.status,400);assert.equal(r.body.code,'CONSENT_REQUIRED');
 });
 test('invalid grade, phone and board are rejected',async()=>{
  for(const invalid of [{grade:11},{contactPhone:'123'},{board:'ICSE'}]){
   const r=await request('/api/v1/admissions/enquiries',null,'POST',{...valid,...invalid});
   assert.equal(r.status,400);
  }
 });
 test('public callers cannot read private enquiries',async()=>{
  const r=await request('/api/v1/admissions/admin/enquiries');
  assert.equal(r.status,401);
 });
 test('parent cannot read private admissions inbox',async()=>{
  const r=await request('/api/v1/admissions/admin/enquiries',parentToken);
  assert.equal(r.status,403);
 });
 test('accepted enquiry is private, persisted, editable and deletable by admin',async()=>{
  const submitted=await request('/api/v1/admissions/enquiries',null,'POST',valid);
  assert.equal(submitted.status,201);
  assert.equal(submitted.body.received,true);
  const ref=submitted.body.reference;
  assert.ok(/^enq-/.test(ref));
  try{
   const stored=db.prepare('SELECT * FROM admission_enquiries WHERE id=?').get(ref);
   assert.equal(stored.guardian_name,valid.guardianName);
   assert.equal(stored.contact_phone,'9876543210');
   assert.equal(stored.status,'new');
   const listed=await request('/api/v1/admissions/admin/enquiries?status=new',adminToken);
   assert.equal(listed.status,200);
   assert.ok(listed.body.enquiries.some(x=>x.id===ref&&x.contactPhone==='9876543210'));
   const updated=await request('/api/v1/admissions/admin/enquiries/'+ref,adminToken,'PATCH',{status:'contacted'});
   assert.equal(updated.status,200);
   assert.equal(db.prepare('SELECT status FROM admission_enquiries WHERE id=?').get(ref).status,'contacted');
  }finally{
   const deleted=await request('/api/v1/admissions/admin/enquiries/'+ref,adminToken,'DELETE');
   assert.equal(deleted.status,200);
   assert.equal(db.prepare('SELECT id FROM admission_enquiries WHERE id=?').get(ref),undefined);
  }
 });
 test('parent cannot delete enquiries',async()=>{
  const r=await request('/api/v1/admissions/admin/enquiries/unknown',parentToken,'DELETE');
  assert.equal(r.status,403);
 });
});
