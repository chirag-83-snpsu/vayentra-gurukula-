import { Router } from 'express';
import {randomUUID} from 'node:crypto';
import { db } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const admissionsRouter=Router();
const recentRequests=new Map();
const WINDOW_MS=60*60*1000;
const MAX_REQUESTS=5;
admissionsRouter.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
function throttle(ip){
 const now=Date.now();
 for(const [key,value] of recentRequests){if(value.reset<=now)recentRequests.delete(key);}
 let rec=recentRequests.get(ip)||{count:0,reset:now+WINDOW_MS};
 if(rec.count>=MAX_REQUESTS)return false;
 rec.count+=1;recentRequests.set(ip,rec);return true;
}
function normalisePhone(v){
 const digits=String(v||'').replace(/[\s()+-]/g,'');
 const local=digits.length===12&&digits.startsWith('91')?digits.slice(2):digits;
 return /^[6-9][0-9]{9}$/.test(local)?local:null;
}
function validate(body){
 if(!body||typeof body!=='object')return {error:'INVALID_REQUEST'};
 if(typeof body.honeypot==='string'&&body.honeypot.trim())return {bot:true};
 const name=typeof body.guardianName==='string'?body.guardianName.trim().replace(/\s+/g,' '):'';
 const phone=normalisePhone(body.contactPhone);
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 const grade=Number(body.grade);
 const board=body.board;
 const message=typeof body.message==='string'?body.message.trim():'';
 if(name.length<2||name.length>80||/[<>]/.test(name))return {error:'INVALID_GUARDIAN_NAME'};
 if(!phone)return {error:'INVALID_PHONE'};
 if(email.length>120||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return {error:'INVALID_EMAIL'};
 if(!Number.isInteger(grade)||grade<1||grade>10)return {error:'INVALID_CLASS'};
 if(!['CBSE','STATE'].includes(board))return {error:'INVALID_BOARD'};
 if(message.length>400)return {error:'MESSAGE_TOO_LONG'};
 if(body.consent!==true)return {error:'CONSENT_REQUIRED'};
 return {name,phone,email,grade,board,message};
}
// Parent/guardian submits an enquiry. We do not solicit a child's name.
admissionsRouter.post('/enquiries',(req,res)=>{
 const data=validate(req.body);
 if(data.bot)return res.status(202).json({received:true,message:'Enquiry received.'});
 if(data.error)return res.status(400).json({code:data.error,message:'Please check the enquiry form and provide valid parent/guardian contact information.'});
 const ip=req.ip||req.socket.remoteAddress||'unknown';
 if(!throttle(ip))return res.status(429).json({code:'RATE_LIMITED',message:'Too many enquiries from this connection. Please try again later.'});
 try{
  const id='enq-'+randomUUID();
  db.prepare(`
   INSERT INTO admission_enquiries
    (id,guardian_name,contact_phone,contact_email,grade,board,message)
   VALUES(?,?,?,?,?,?,?)
  `).run(id,data.name,data.phone,data.email||null,data.grade,data.board,data.message||null);
  res.status(201).json({received:true,reference:id,message:'Your enquiry was recorded. Our admissions team can review it.'});
 }catch(err){
  console.error('[Admission enquiries] Could not save new enquiry',err);
  res.status(500).json({code:'SAVE_FAILED',message:'We could not save your enquiry. Please try again later.'});
 }
});
// All enquiry records are restricted to verified administrators only.
admissionsRouter.use('/admin',authenticateToken,requireRole('admin'));
admissionsRouter.get('/admin/enquiries',(req,res)=>{
 const status=String(req.query.status||'all');
 if(!['all','new','contacted','closed'].includes(status))return res.status(400).json({code:'INVALID_STATUS_FILTER'});
 const limit=Math.min(100,Math.max(1,Number(req.query.limit)||50));
 try{
  const list=status==='all'
   ?db.prepare('SELECT * FROM admission_enquiries ORDER BY created_at DESC LIMIT ?').all(limit)
   :db.prepare('SELECT * FROM admission_enquiries WHERE status=? ORDER BY created_at DESC LIMIT ?').all(status,limit);
  return res.json({enquiries:list.map(x=>({
   id:x.id,guardianName:x.guardian_name,contactPhone:x.contact_phone,
   email:x.contact_email,grade:x.grade,board:x.board,message:x.message,status:x.status,
   createdAt:x.created_at,updatedAt:x.updated_at
  }))});
 }catch(err){console.error('[Admission enquiries] Could not read list',err);return res.status(500).json({code:'LOAD_FAILED'});}
});
admissionsRouter.patch('/admin/enquiries/:id',(req,res)=>{
 const status=req.body?.status;
 if(!['new','contacted','closed'].includes(status))return res.status(400).json({code:'INVALID_STATUS'});
 try{
  const r=db.prepare("UPDATE admission_enquiries SET status=?,updated_at=datetime('now') WHERE id=?").run(status,req.params.id);
  if(r.changes===0)return res.status(404).json({code:'NOT_FOUND'});
  return res.json({updated:true,status});
 }catch(err){console.error('[Admission enquiries] Update failed',err);return res.status(500).json({code:'UPDATE_FAILED'});}
});
// Allows removal of parent contact data when no longer needed or on appropriate request.
admissionsRouter.delete('/admin/enquiries/:id',(req,res)=>{
 try{
  const r=db.prepare('DELETE FROM admission_enquiries WHERE id=?').run(req.params.id);
  if(r.changes===0)return res.status(404).json({code:'NOT_FOUND'});
  return res.json({deleted:true});
 }catch(err){console.error('[Admission enquiries] Delete failed',err);return res.status(500).json({code:'DELETE_FAILED'});}
});
