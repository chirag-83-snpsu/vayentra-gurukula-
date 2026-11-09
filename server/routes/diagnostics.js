import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const diagnosticsRouter = Router();
diagnosticsRouter.use(authenticateToken);

const FORM_ID = 'vg-lc-7-cbse-math-v1';
const safeParse = text => JSON.parse(text || '[]');

function canSeeStudent(user, studentId) {
  if (user.role === 'admin') return true;
  if (user.role === 'student') return user.studentId === studentId;
  if (user.role === 'parent') {
    return !!db.prepare('SELECT id FROM students WHERE id=? AND guardian_id=?')
      .get(studentId, user.guardianId || '');
  }
  if (user.role === 'teacher') {
    return !!db.prepare(
      "SELECT 1 FROM batch_enrollments be JOIN batches b ON b.id=be.batch_id WHERE be.student_id=? AND be.status='active' AND b.teacher_id=? LIMIT 1"
    ).get(studentId, user.teacherId || '');
  }
  return false;
}
function canReviewForm(user, formId) {
  if (user.role === 'admin') return true;
  if (user.role !== 'teacher') return false;
  const form=db.prepare('SELECT grade,board,subject FROM diagnostic_forms WHERE id=?').get(formId);
  if (!form) return false;
  return !!db.prepare("SELECT 1 FROM batches WHERE teacher_id=? AND grade=? AND board=? AND subject=? AND status='active' LIMIT 1")
    .get(user.teacherId || '', form.grade, form.board, form.subject);
}
function isStudentEnrolled(user, form) {
  if (!user.studentId) return false;
  return !!db.prepare(`
    SELECT 1 FROM students s
    JOIN batch_enrollments be ON be.student_id=s.id
    JOIN batches b ON b.id=be.batch_id
    WHERE s.id=? AND s.status='active' AND be.status='active'
      AND b.status='active' AND b.grade=? AND b.board=? AND b.subject=?
    LIMIT 1
  `).get(user.studentId, form.grade, form.board, form.subject);
}
function studentForm(form) {
  const items=db.prepare('SELECT id,concept_id,stem,options_json,position FROM diagnostic_items WHERE form_id=? ORDER BY position').all(form.id);
  return {
    id:form.id,title:form.title,grade:form.grade,board:form.board,subject:form.subject,
    questions:items.map(item=>({id:item.id,conceptId:item.concept_id,stem:item.stem,options:safeParse(item.options_json),position:item.position}))
  };
}
function analysisForAttempt(id) {
  const responseRows=db.prepare(`
    SELECT di.concept_id,dr.is_correct,dr.misconception_code
    FROM diagnostic_responses dr
    JOIN diagnostic_items di ON di.id=dr.item_id
    WHERE dr.attempt_id=?
  `).all(id);
  const clusters=new Map();
  for (const row of responseRows) {
    if(!clusters.has(row.concept_id)) clusters.set(row.concept_id,{conceptId:row.concept_id,correct:0,total:0,misconceptions:{}});
    const c=clusters.get(row.concept_id);
    c.total++; c.correct+=Number(row.is_correct);
    if(row.misconception_code) c.misconceptions[row.misconception_code]=(c.misconceptions[row.misconception_code]||0)+1;
  }
  return [...clusters.values()].map(c=>({...c,accuracy:Math.round(100*c.correct/c.total),
    pathway:c.correct===c.total?'extend':'teacher_review_required'}));
}
diagnosticsRouter.get('/forms', (req,res)=>{
  try {
    const forms=db.prepare('SELECT id,title,grade,board,subject,status FROM diagnostic_forms ORDER BY grade,subject').all();
    if(req.user.role==='admin') return res.json({forms});
    if(req.user.role==='teacher')return res.json({forms:forms.filter(f=>canReviewForm(req.user,f.id))});
    if(req.user.role==='student')return res.json({forms:forms.filter(f=>f.status==='published'&&isStudentEnrolled(req.user,f))});
    return res.json({forms:[]});
  }catch(err){res.status(500).json({code:'SERVER_ERROR',message:'Could not load diagnostics.'});}
});
diagnosticsRouter.get('/forms/:formId', (req,res)=>{
  try {
    const form=db.prepare('SELECT * FROM diagnostic_forms WHERE id=?').get(req.params.formId);
    if(!form)return res.status(404).json({code:'NOT_FOUND'});
    if(req.user.role==='student') {
      if(form.status!=='published'||!isStudentEnrolled(req.user,form))return res.status(403).json({code:'FORBIDDEN'});
      return res.json({form:studentForm(form)});
    }
    if(!canReviewForm(req.user,form.id))return res.status(403).json({code:'FORBIDDEN'});
    const full=studentForm(form);
    const correct=db.prepare('SELECT id,correct_index,explanation,misconception_codes_json FROM diagnostic_items WHERE form_id=?').all(form.id);
    res.json({form:{...full,status:form.status,answerKey:correct.map(r=>({
      id:r.id,correctIndex:r.correct_index,explanation:r.explanation,
      misconceptionCodes:safeParse(r.misconception_codes_json)
    }))}});
  }catch(err){res.status(500).json({code:'SERVER_ERROR',message:'Could not load diagnostic.'});}
});
diagnosticsRouter.post('/forms/:formId/publish',requireRole(['teacher','admin']),(req,res)=>{
  const form=db.prepare('SELECT * FROM diagnostic_forms WHERE id=?').get(req.params.formId);
  if(!form)return res.status(404).json({code:'NOT_FOUND'});
  if(!canReviewForm(req.user,form.id))return res.status(403).json({code:'FORBIDDEN'});
  const count=db.prepare('SELECT COUNT(*) AS n FROM diagnostic_items WHERE form_id=?').get(form.id).n;
  if(count<4)return res.status(400).json({code:'INSUFFICIENT_REVIEWED_ITEMS'});
  if(req.body?.confirmedReviewed!==true)return res.status(400).json({code:'TEACHER_REVIEW_REQUIRED',message:'A teacher must confirm curriculum and answer-key review.'});
  db.prepare("UPDATE diagnostic_forms SET status='published',published_at=datetime('now') WHERE id=?").run(form.id);
  res.json({success:true,status:'published'});
});
diagnosticsRouter.post('/forms/:formId/submit',requireRole('student'),(req,res)=>{
  const form=db.prepare('SELECT * FROM diagnostic_forms WHERE id=?').get(req.params.formId);
  if(!form)return res.status(404).json({code:'NOT_FOUND'});
  if(form.status!=='published'||!isStudentEnrolled(req.user,form))return res.status(403).json({code:'FORBIDDEN'});
  const items=db.prepare('SELECT * FROM diagnostic_items WHERE form_id=? ORDER BY position').all(form.id);
  if(!Array.isArray(req.body?.responses)||req.body.responses.length!==items.length)
    return res.status(400).json({code:'INCOMPLETE_SUBMISSION',message:'Answer every item exactly once.'});
  const answers=new Map();
  for(const response of req.body.responses) {
    if(typeof response?.itemId!=='string'||!Number.isInteger(response.selectedIndex)||response.selectedIndex<0||response.selectedIndex>3||answers.has(response.itemId))
      return res.status(400).json({code:'INVALID_RESPONSE'});
    answers.set(response.itemId,response.selectedIndex);
  }
  if(items.some(item=>!answers.has(item.id)))return res.status(400).json({code:'INVALID_ITEM_IDS'});
  const existing=db.prepare('SELECT id FROM diagnostic_attempts WHERE form_id=? AND student_id=?').get(form.id,req.user.studentId);
  if(existing)return res.status(409).json({code:'ALREADY_SUBMITTED',attemptId:existing.id});
  const id='diag-'+randomUUID();
  const correctCount=items.filter(item=>answers.get(item.id)===item.correct_index).length;
  try {
    db.exec('BEGIN IMMEDIATE');
    db.prepare('INSERT INTO diagnostic_attempts(id,form_id,student_id,correct_count,question_count) VALUES(?,?,?,?,?)')
      .run(id,form.id,req.user.studentId,correctCount,items.length);
    const save=db.prepare('INSERT INTO diagnostic_responses(attempt_id,item_id,selected_index,is_correct,misconception_code) VALUES(?,?,?,?,?)');
    for(const item of items){
      const selected=answers.get(item.id),correct=selected===item.correct_index;
      const codes=safeParse(item.misconception_codes_json);
      save.run(id,item.id,selected,correct?1:0,correct?null:(codes[selected]||'NEEDS_REVIEW'));
    }
    db.exec('COMMIT');
    return res.status(201).json({attemptId:id,score:{correct:correctCount,total:items.length},
      message:'Baseline received. Your teacher will review your learning pathway.'});
  }catch(err){
    try{db.exec('ROLLBACK');}catch{}
    if(String(err).includes('UNIQUE'))return res.status(409).json({code:'ALREADY_SUBMITTED'});
    return res.status(500).json({code:'SERVER_ERROR',message:'Could not save diagnostic.'});
  }
});
diagnosticsRouter.get('/attempts/:attemptId',(req,res)=>{
  const attempt=db.prepare('SELECT * FROM diagnostic_attempts WHERE id=?').get(req.params.attemptId);
  if(!attempt)return res.status(404).json({code:'NOT_FOUND'});
  if(!canSeeStudent(req.user,attempt.student_id))return res.status(403).json({code:'FORBIDDEN'});
  const plan=db.prepare('SELECT * FROM diagnostic_learning_plans WHERE attempt_id=?').get(attempt.id);
  const result={id:attempt.id,formId:attempt.form_id,studentId:attempt.student_id,
    correct:attempt.correct_count,total:attempt.question_count,submittedAt:attempt.submitted_at,
    status:plan?'teacher_approved':'pending_teacher_review'};
  if(req.user.role==='teacher'||req.user.role==='admin'){
    if(!canReviewForm(req.user,attempt.form_id))return res.status(403).json({code:'FORBIDDEN'});
    result.concepts=analysisForAttempt(attempt.id);
  }
  if(plan) result.learningPlan={focusConcepts:safeParse(plan.focus_concepts_json),notes:plan.teacher_notes};
  res.json({attempt:result});
});
diagnosticsRouter.get('/student/:studentId/attempts',(req,res)=>{
  if(!canSeeStudent(req.user,req.params.studentId))return res.status(403).json({code:'FORBIDDEN'});
  const attempts=db.prepare('SELECT id FROM diagnostic_attempts WHERE student_id=? ORDER BY submitted_at DESC').all(req.params.studentId);
  res.json({attempts:attempts.map(a=>{
    const attempt=db.prepare('SELECT * FROM diagnostic_attempts WHERE id=?').get(a.id);
    const plan=db.prepare('SELECT * FROM diagnostic_learning_plans WHERE attempt_id=?').get(a.id);
    return {id:attempt.id,formId:attempt.form_id,correct:attempt.correct_count,total:attempt.question_count,
      status:plan?'teacher_approved':'pending_teacher_review',submittedAt:attempt.submitted_at,
      learningPlan:plan?{focusConcepts:safeParse(plan.focus_concepts_json),notes:plan.teacher_notes}:null};
  })});
});
diagnosticsRouter.get('/forms/:formId/attempts',requireRole(['teacher','admin']),(req,res)=>{
  if(!canReviewForm(req.user,req.params.formId))return res.status(403).json({code:'FORBIDDEN'});
  const attempts=db.prepare(`
    SELECT da.id,da.student_id,s.name AS student_name,da.correct_count,da.question_count,da.submitted_at
    FROM diagnostic_attempts da JOIN students s ON s.id=da.student_id
    WHERE da.form_id=? ORDER BY da.submitted_at DESC
  `).all(req.params.formId);
  res.json({attempts:attempts.map(a=>({...a,concepts:analysisForAttempt(a.id),
    approved:!!db.prepare('SELECT 1 FROM diagnostic_learning_plans WHERE attempt_id=?').get(a.id)}))});
});
diagnosticsRouter.post('/attempts/:attemptId/approve-plan',requireRole(['teacher','admin']),(req,res)=>{
  const attempt=db.prepare('SELECT * FROM diagnostic_attempts WHERE id=?').get(req.params.attemptId);
  if(!attempt)return res.status(404).json({code:'NOT_FOUND'});
  if(!canReviewForm(req.user,attempt.form_id))return res.status(403).json({code:'FORBIDDEN'});
  const {focusConcepts,notes}=req.body||{};
  const validConcepts=new Set(db.prepare('SELECT DISTINCT concept_id FROM diagnostic_items WHERE form_id=?').all(attempt.form_id).map(x=>x.concept_id));
  if(!Array.isArray(focusConcepts)||focusConcepts.some(x=>typeof x!=='string'||!validConcepts.has(x))||typeof notes!=='string'||notes.trim().length<5||notes.length>1500)
    return res.status(400).json({code:'INVALID_LEARNING_PLAN'});
  db.prepare(`
    INSERT INTO diagnostic_learning_plans(attempt_id,teacher_user_id,focus_concepts_json,teacher_notes)
    VALUES(?,?,?,?)
    ON CONFLICT(attempt_id) DO UPDATE SET teacher_user_id=excluded.teacher_user_id,
      focus_concepts_json=excluded.focus_concepts_json,teacher_notes=excluded.teacher_notes,approved_at=datetime('now')
  `).run(attempt.id,req.user.id,JSON.stringify(focusConcepts),notes.trim());
  res.json({success:true,status:'teacher_approved'});
});
