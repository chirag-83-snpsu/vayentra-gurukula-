import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {db} from '../db/database.js';
import {authenticateToken,requireRole} from '../middleware/auth.js';
import {classGrades,CBSE_SUBJECTS_BY_GRADE,OFFICIAL_NCERT_REFERENCES} from '../data/cbseCatalog.js';

export const cbseLibraryRouter=Router();
const parseGrade=raw=>{
 const value=Number(raw);
 return Number.isInteger(value)&&value>=1&&value<=10?value:null;
};
function hasContentPermission(user,source){
 if(user.role==='admin')return true;
 if(user.role!=='teacher'||!user.teacherId)return false;
 return !!db.prepare(`
  SELECT 1 FROM batches
  WHERE teacher_id=? AND grade=? AND board='CBSE' AND subject=? AND status='active' LIMIT 1
 `).get(user.teacherId,source.grade,source.subject);
}
function lookupTopic(id){
 return db.prepare(`
  SELECT t.*,s.grade,s.subject,s.board,s.source_status,s.curriculum_status,s.academic_year,
   v.id as video_id,v.production_status,v.script_outline,v.media_url,v.media_type,v.duration_seconds,
   v.reviewed_at AS video_reviewed_at
  FROM cbse_topics t
  JOIN cbse_subject_sources s ON s.id=t.source_id
  LEFT JOIN cbse_lesson_videos v ON v.topic_id=t.id WHERE t.id=?
 `).get(id);
}
function safePublicTopic(row){
 return {
  id:row.id,grade:row.grade,subject:row.subject,chapterTitle:row.chapter_title,
  topicTitle:row.topic_title,conceptDescription:row.concept_description,
  lessonOrder:row.lesson_order,academicYear:row.academic_year,
  sourceStatus:row.source_status,contentStatus:row.status,
  video:{
   status:row.production_status==='ready'&&row.video_reviewed_at&&row.media_url?'ready':'not_available',
   url:row.production_status==='ready'&&row.video_reviewed_at?row.media_url:null,
   mediaType:row.production_status==='ready'&&row.video_reviewed_at?row.media_type:null,
   durationSeconds:row.production_status==='ready'?row.duration_seconds:null,
   provenance:'Vayentra original learning video, not NCERT-published footage'
  }
 };
}
function isOriginalMediaUrl(text){
 if(typeof text!=='string'||text.length>1400)return false;
 if(/^\/media\/lessons\/[a-zA-Z0-9/_-]+\.(mp4|webm)$/.test(text))return true;
 // External hosts must be explicitly approved and configured by institute admins.
 try{
  const link=new URL(text);
  const hosts=(process.env.ALLOWED_LESSON_VIDEO_HOSTS||'').split(',').map(s=>s.trim()).filter(Boolean);
  return link.protocol==='https:'&&hosts.includes(link.hostname)&&/\.(mp4|webm)$/i.test(link.pathname);
 }catch{return false;}
}

// Public navigation catalogue: reference labels only. No NCERT PDF copies are served.
cbseLibraryRouter.get('/catalogue',(_req,res)=>{
 try{
  const sources=db.prepare(`
   SELECT id,grade,subject,publisher,source_portal,source_status,curriculum_status,academic_year
   FROM cbse_subject_sources ORDER BY grade,subject
  `).all();
  return res.json({
   board:'CBSE',
   grades:classGrades,
   subjectsByGrade:CBSE_SUBJECTS_BY_GRADE,
   subjects:sources,
   officialPortals:OFFICIAL_NCERT_REFERENCES.map(({id,publisher,name,domain,kind})=>({id,publisher,name,domain,kind})),
   disclaimer:'General NCERT reference mapping only. Textbook titles and topics require academic verification. Direct textbook links require NCERT permission; no NCERT pages are copied or hosted.'
  });
 }catch(err){
  console.error('[CBSE Catalogue]',err);
  return res.status(500).json({code:'CATALOGUE_ERROR',message:'Curriculum sources are temporarily unavailable.'});
 }
});
cbseLibraryRouter.get('/topics',(req,res)=>{
 const grade=parseGrade(req.query.grade);
 const subject=String(req.query.subject||'').trim();
 if(!grade||subject.length<2||subject.length>100)return res.status(400).json({code:'INVALID_FILTER'});
 try{
  const source=db.prepare('SELECT * FROM cbse_subject_sources WHERE grade=? AND subject=?').get(grade,subject);
  if(!source)return res.status(404).json({code:'SUBJECT_NOT_FOUND'});
  const topics=db.prepare(`
   SELECT t.id FROM cbse_topics t
   WHERE t.source_id=? AND t.status='published' ORDER BY t.chapter_title,t.lesson_order
  `).all(source.id);
  res.json({
   grade,subject,academicYear:source.academic_year,source:{
    publisher:source.publisher,portal:source.source_portal,domain:'ncert.nic.in',
    permissionStatus:source.source_status,coverage:'Reference only — chapter-level linkage unverified'
   },
   topics:topics.map(t=>safePublicTopic(lookupTopic(t.id))),
   contentStatus:topics.length?'available':'academic_content_pending'
  });
 }catch(err){console.error('[CBSE Topics]',err);res.status(500).json({code:'TOPICS_ERROR'});}
});
cbseLibraryRouter.use('/teacher',authenticateToken,requireRole(['teacher','admin']));
cbseLibraryRouter.get('/teacher/topics',(req,res)=>{
 const grade=parseGrade(req.query.grade);
 const subject=String(req.query.subject||'').trim();
 if(!grade||subject.length<2||subject.length>100)return res.status(400).json({code:'INVALID_FILTER'});
 const source=db.prepare('SELECT * FROM cbse_subject_sources WHERE grade=? AND subject=?').get(grade,subject);
 if(!source)return res.status(404).json({code:'SUBJECT_NOT_FOUND'});
 if(!hasContentPermission(req.user,source))return res.status(403).json({code:'FORBIDDEN'});
 const topics=db.prepare('SELECT id FROM cbse_topics WHERE source_id=? ORDER BY chapter_title,lesson_order').all(source.id);
 res.json({topics:topics.map(t=>lookupTopic(t.id)).map(row=>({...safePublicTopic(row),
  status:row.status,scriptOutline:row.script_outline||'',productionStatus:row.production_status||'not_started'
 }))});
});
cbseLibraryRouter.post('/teacher/topics',(req,res)=>{
 const {sourceId,chapterTitle,topicTitle,conceptDescription}=req.body||{};
 if(typeof sourceId!=='string'||typeof chapterTitle!=='string'||typeof topicTitle!=='string'||
  chapterTitle.trim().length<4||chapterTitle.length>160||topicTitle.trim().length<4||topicTitle.length>160||
  typeof conceptDescription!=='string'||conceptDescription.trim().length<10||conceptDescription.length>500)
  return res.status(400).json({code:'INVALID_TOPIC'});
 const source=db.prepare('SELECT * FROM cbse_subject_sources WHERE id=?').get(sourceId);
 if(!source)return res.status(404).json({code:'SUBJECT_NOT_FOUND'});
 if(!hasContentPermission(req.user,source))return res.status(403).json({code:'FORBIDDEN'});
 const id='topic-'+randomUUID();
 try{
  db.exec('BEGIN IMMEDIATE');
  db.prepare('INSERT INTO cbse_topics(id,source_id,chapter_title,topic_title,concept_description,status) VALUES(?,?,?,?,?,?)')
   .run(id,sourceId,chapterTitle.trim(),topicTitle.trim(),conceptDescription.trim(),'draft');
  db.prepare("INSERT INTO cbse_lesson_videos(id,topic_id) VALUES(?,?)").run('video-'+randomUUID(),id);
  db.exec('COMMIT');
  res.status(201).json({id,status:'draft',message:'Original topic draft created. Academic review is required.'});
 }catch(err){
  try{db.exec('ROLLBACK')}catch{}
  if(String(err).includes('UNIQUE'))return res.status(409).json({code:'TOPIC_EXISTS'});
  console.error('[CBSE Topic create]',err);
  return res.status(500).json({code:'SAVE_FAILED'});
 }
});
cbseLibraryRouter.put('/teacher/topics/:id/script',(req,res)=>{
 const topic=lookupTopic(req.params.id);
 if(!topic)return res.status(404).json({code:'TOPIC_NOT_FOUND'});
 if(!hasContentPermission(req.user,topic))return res.status(403).json({code:'FORBIDDEN'});
 const outline=req.body?.scriptOutline;
 if(typeof outline!=='string'||outline.trim().length<60||outline.length>8000)
  return res.status(400).json({code:'INVALID_ORIGINAL_SCRIPT',message:'Provide a 60–8000-character original explanation and storyboard.'});
 db.prepare(`
  UPDATE cbse_lesson_videos SET script_outline=?,production_status='teacher_review',
  updated_at=datetime('now') WHERE topic_id=?
 `).run(outline.trim(),topic.id);
 res.json({success:true,productionStatus:'teacher_review',message:'Original video script saved for teacher review.'});
});
cbseLibraryRouter.post('/teacher/topics/:id/publish',(req,res)=>{
 const topic=lookupTopic(req.params.id);
 if(!topic)return res.status(404).json({code:'TOPIC_NOT_FOUND'});
 if(!hasContentPermission(req.user,topic))return res.status(403).json({code:'FORBIDDEN'});
 const {mediaUrl,mediaType,durationSeconds,teacherReviewed,originalContentConfirmed,sourceChecked}=req.body||{};
 if(teacherReviewed!==true||originalContentConfirmed!==true||sourceChecked!==true)
  return res.status(400).json({code:'REVIEW_REQUIRED',message:'Confirm academic alignment and ownership of original video content.'});
 if(!topic.script_outline||topic.script_outline.length<60)return res.status(400).json({code:'SCRIPT_REQUIRED'});
 if(!isOriginalMediaUrl(mediaUrl)||!['mp4','webm'].includes(mediaType)||!Number.isInteger(durationSeconds)||durationSeconds<10||durationSeconds>3600)
  return res.status(400).json({code:'INVALID_MEDIA',message:'Provide a reviewed video URL from an approved host and duration.'});
 if(!mediaUrl.toLowerCase().split('?')[0].endsWith('.'+mediaType))
  return res.status(400).json({code:'MEDIA_TYPE_MISMATCH'});
 try{
  db.exec('BEGIN IMMEDIATE');
  db.prepare("UPDATE cbse_topics SET status='published',reviewed_by_user_id=?,reviewed_at=datetime('now') WHERE id=?")
   .run(req.user.id,topic.id);
  db.prepare(`
   UPDATE cbse_lesson_videos SET media_url=?,media_type=?,duration_seconds=?,
    production_status='ready',reviewed_by_user_id=?,reviewed_at=datetime('now'),
    published_at=datetime('now'),updated_at=datetime('now') WHERE topic_id=?
  `).run(mediaUrl,mediaType,durationSeconds,req.user.id,topic.id);
  db.exec('COMMIT');
  res.json({success:true,status:'published',videoStatus:'ready'});
 }catch(err){try{db.exec('ROLLBACK')}catch{}console.error('[CBSE video publish]',err);res.status(500).json({code:'PUBLISH_FAILED'});}
});
