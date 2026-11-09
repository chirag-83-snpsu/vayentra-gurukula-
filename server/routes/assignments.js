import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, requireRole, requireChildOwnership } from '../middleware/auth.js';
import { triggerHomeworkAlerts } from '../services/messaging.js';

export const assignmentsRouter = Router();

function getTeacherId(user) {
  if (user.teacherId) return user.teacherId;
  const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(user.id);
  return teacher?.id || null;
}

function canTeacherManageBatch(user, batchId) {
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') {
    const teacherId = getTeacherId(user);
    const batch = db.prepare('SELECT teacher_id FROM batches WHERE id = ?').get(batchId);
    return batch && batch.teacher_id === teacherId;
  }
  return false;
}

// ==========================================
// 1. Create Homework (Batch or Individual Student)
// ==========================================
assignmentsRouter.post('/homework', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const {
    batchId,
    targetStudentId,
    title,
    subject,
    description,
    dueDate,
    chapterId,
    learningResources = []
  } = req.body;

  if (!title || !subject || !description || !dueDate) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'title, subject, description, and dueDate are required.'
    });
  }

  if (!batchId && !targetStudentId) {
    return res.status(400).json({
      code: 'TARGET_REQUIRED',
      message: 'Either batchId or targetStudentId must be specified.'
    });
  }

  try {
    const teacherId = getTeacherId(req.user) || 'tch-001';

    if (batchId) {
      const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId);
      if (!batch) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Batch not found.' });
      }
      if (!canTeacherManageBatch(req.user, batchId)) {
        return res.status(403).json({
          code: 'FORBIDDEN',
          message: 'You are not authorized to create assignments for this batch.'
        });
      }
    }

    if (targetStudentId) {
      const student = db.prepare('SELECT * FROM students WHERE id = ?').get(targetStudentId);
      if (!student) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Target student not found.' });
      }
    }

    const homeworkId = `hw-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const resourcesJson = JSON.stringify(Array.isArray(learningResources) ? learningResources : []);

    db.prepare(`
      INSERT INTO homework_assignments (
        id, teacher_id, batch_id, target_student_id, title, subject, description, due_date, chapter_id, learning_resources_json, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(
      homeworkId,
      teacherId,
      batchId || null,
      targetStudentId || null,
      title,
      subject,
      description,
      dueDate,
      chapterId || null,
      resourcesJson
    );

    const created = db.prepare('SELECT * FROM homework_assignments WHERE id = ?').get(homeworkId);

    // Phase 5: Trigger Homework alerts to guardians
    try {
      triggerHomeworkAlerts({
        assignmentId: homeworkId,
        batchId,
        targetStudentId,
        title,
        subject,
        dueDate
      });
    } catch (notifErr) {
      console.warn('[Vayentra Homework] Notification warning:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Homework successfully assigned with authorized learning resources.',
      homework: {
        ...created,
        learningResources: JSON.parse(created.learning_resources_json || '[]')
      }
    });
  } catch (err) {
    console.error('[API Error /assignments/homework]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to create homework.' });
  }
});

// ==========================================
// 2. Teacher Homework Listing & Progress Tracker
// ==========================================
assignmentsRouter.get('/homework/teacher', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  try {
    let hwRows;
    if (req.user.role === 'admin') {
      hwRows = db.prepare(`
        SELECT hw.*, b.name as batch_name, st.name as target_student_name, u.name as teacher_name
        FROM homework_assignments hw
        LEFT JOIN batches b ON b.id = hw.batch_id
        LEFT JOIN students st ON st.id = hw.target_student_id
        LEFT JOIN teachers t ON t.id = hw.teacher_id
        LEFT JOIN users u ON u.id = t.user_id
        ORDER BY hw.created_at DESC
      `).all();
    } else {
      const teacherId = getTeacherId(req.user);
      hwRows = db.prepare(`
        SELECT hw.*, b.name as batch_name, st.name as target_student_name, u.name as teacher_name
        FROM homework_assignments hw
        LEFT JOIN batches b ON b.id = hw.batch_id
        LEFT JOIN students st ON st.id = hw.target_student_id
        LEFT JOIN teachers t ON t.id = hw.teacher_id
        LEFT JOIN users u ON u.id = t.user_id
        WHERE hw.teacher_id = ?
        ORDER BY hw.created_at DESC
      `).all(teacherId);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const result = hwRows.map(hw => {
      let totalTargeted = 1;
      if (hw.batch_id) {
        totalTargeted = db.prepare(`
          SELECT COUNT(*) as count FROM batch_enrollments
          WHERE batch_id = ? AND status = 'active'
        `).get(hw.batch_id).count;
      }

      const submissionStats = db.prepare(`
        SELECT 
          COUNT(*) as total_submissions,
          SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed_count
        FROM homework_submissions
        WHERE homework_id = ?
      `).get(hw.id);

      return {
        id: hw.id,
        title: hw.title,
        subject: hw.subject,
        description: hw.description,
        dueDate: hw.due_date,
        isOverdue: hw.due_date < todayStr,
        batchId: hw.batch_id,
        batchName: hw.batch_name || 'Individual Student Assignment',
        targetStudentId: hw.target_student_id,
        targetStudentName: hw.target_student_name,
        teacherName: hw.teacher_name || 'Faculty',
        learningResources: JSON.parse(hw.learning_resources_json || '[]'),
        totalTargeted,
        submittedCount: submissionStats.total_submissions || 0,
        reviewedCount: submissionStats.reviewed_count || 0,
        createdAt: hw.created_at
      };
    });

    res.json({ homework: result });
  } catch (err) {
    console.error('[API Error /homework/teacher]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch teacher homework list.' });
  }
});

// ==========================================
// 3. Review Submissions for a Homework Assignment
// ==========================================
assignmentsRouter.get('/homework/:homeworkId/submissions', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { homeworkId } = req.params;

  try {
    const hw = db.prepare(`
      SELECT hw.*, b.name as batch_name
      FROM homework_assignments hw
      LEFT JOIN batches b ON b.id = hw.batch_id
      WHERE hw.id = ?
    `).get(homeworkId);

    if (!hw) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Homework assignment not found.' });
    }

    // Get list of targeted students
    let students = [];
    if (hw.batch_id) {
      students = db.prepare(`
        SELECT s.id as student_id, s.name, s.enrollment_number, s.avatar, s.grade, s.board
        FROM batch_enrollments be
        JOIN students s ON s.id = be.student_id
        WHERE be.batch_id = ? AND be.status = 'active' AND s.status = 'active'
        ORDER BY s.name ASC
      `).all(hw.batch_id);
    } else if (hw.target_student_id) {
      const single = db.prepare(`
        SELECT id as student_id, name, enrollment_number, avatar, grade, board
        FROM students WHERE id = ?
      `).get(hw.target_student_id);
      if (single) students = [single];
    }

    // Merge with submissions
    const submissions = students.map(st => {
      const sub = db.prepare(`
        SELECT * FROM homework_submissions
        WHERE homework_id = ? AND student_id = ?
      `).get(homeworkId, st.student_id);

      return {
        studentId: st.student_id,
        name: st.name,
        enrollmentNumber: st.enrollment_number,
        avatar: st.avatar,
        grade: st.grade,
        board: st.board,
        hasSubmitted: Boolean(sub),
        submissionId: sub?.id || null,
        submissionText: sub?.submission_text || null,
        attachmentUrl: sub?.attachment_url || null,
        status: sub?.status || 'unsubmitted',
        score: sub?.score ?? null,
        maxScore: sub?.max_score || 100,
        teacherFeedback: sub?.teacher_feedback || '',
        submittedAt: sub?.submitted_at || null,
        reviewedAt: sub?.reviewed_at || null
      };
    });

    res.json({
      homework: {
        id: hw.id,
        title: hw.title,
        subject: hw.subject,
        dueDate: hw.due_date,
        batchName: hw.batch_name
      },
      submissions
    });
  } catch (err) {
    console.error('[API Error /homework/:homeworkId/submissions]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch homework submissions.' });
  }
});

// Grade / Review a Submission
assignmentsRouter.post('/homework/:homeworkId/submissions/:studentId/review', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { homeworkId, studentId } = req.params;
  const { score, teacherFeedback } = req.body;

  if (score === undefined || score === null || isNaN(Number(score))) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'score is required and must be a number.' });
  }

  try {
    const sub = db.prepare(`
      SELECT * FROM homework_submissions
      WHERE homework_id = ? AND student_id = ?
    `).get(homeworkId, studentId);

    if (!sub) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Submission not found for this student.' });
    }

    db.prepare(`
      UPDATE homework_submissions
      SET score = ?, teacher_feedback = ?, status = 'reviewed', reviewed_by_user_id = ?, reviewed_at = datetime('now')
      WHERE id = ?
    `).run(Number(score), teacherFeedback || '', req.user.id, sub.id);

    res.json({
      success: true,
      message: 'Submission reviewed and constructive feedback committed.',
      score: Number(score),
      status: 'reviewed'
    });
  } catch (err) {
    console.error('[API Error /submissions/:studentId/review]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to record homework review.' });
  }
});

// ==========================================
// 4. Student & Parent View: Assigned, Completed & Overdue Homework
// ==========================================
assignmentsRouter.get('/homework/student/:studentId', authenticateToken, requireChildOwnership, (req, res) => {
  const { studentId } = req.params;

  try {
    const student = db.prepare('SELECT id, name, grade, board FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Student not found.' });
    }

    // Load active batch IDs for this student
    const enrollments = db.prepare(`
      SELECT batch_id FROM batch_enrollments
      WHERE student_id = ? AND status = 'active'
    `).all(studentId).map(e => e.batch_id);

    // Query all homework assigned directly to student OR to student's batches
    let hwQuery;
    if (enrollments.length > 0) {
      const placeholders = enrollments.map(() => '?').join(',');
      hwQuery = db.prepare(`
        SELECT hw.*, b.name as batch_name, u.name as teacher_name
        FROM homework_assignments hw
        LEFT JOIN batches b ON b.id = hw.batch_id
        LEFT JOIN teachers t ON t.id = hw.teacher_id
        LEFT JOIN users u ON u.id = t.user_id
        WHERE hw.status = 'active'
          AND (hw.target_student_id = ? OR hw.batch_id IN (${placeholders}))
        ORDER BY hw.due_date ASC
      `).all(studentId, ...enrollments);
    } else {
      hwQuery = db.prepare(`
        SELECT hw.*, b.name as batch_name, u.name as teacher_name
        FROM homework_assignments hw
        LEFT JOIN batches b ON b.id = hw.batch_id
        LEFT JOIN teachers t ON t.id = hw.teacher_id
        LEFT JOIN users u ON u.id = t.user_id
        WHERE hw.status = 'active' AND hw.target_student_id = ?
        ORDER BY hw.due_date ASC
      `).all(studentId);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const homeworkList = hwQuery.map(hw => {
      // Find submission if any
      const sub = db.prepare(`
        SELECT * FROM homework_submissions
        WHERE homework_id = ? AND student_id = ?
      `).get(hw.id, studentId);

      let status; // 'completed' | 'overdue' | 'assigned'
      if (sub && (sub.status === 'submitted' || sub.status === 'reviewed')) {
        status = 'completed';
      } else if (hw.due_date < todayStr) {
        status = 'overdue';
      } else {
        status = 'assigned';
      }

      return {
        id: hw.id,
        title: hw.title,
        subject: hw.subject,
        description: hw.description,
        dueDate: hw.due_date,
        batchName: hw.batch_name || 'Individual Assignment',
        teacherName: hw.teacher_name || 'Faculty',
        chapterId: hw.chapter_id,
        learningResources: JSON.parse(hw.learning_resources_json || '[]'),
        status,
        submission: sub ? {
          id: sub.id,
          submissionText: sub.submission_text,
          attachmentUrl: sub.attachment_url,
          status: sub.status,
          score: sub.score,
          maxScore: sub.max_score,
          teacherFeedback: sub.teacher_feedback,
          submittedAt: sub.submitted_at,
          reviewedAt: sub.reviewed_at
        } : null
      };
    });

    const summary = {
      total: homeworkList.length,
      assigned: homeworkList.filter(h => h.status === 'assigned').length,
      completed: homeworkList.filter(h => h.status === 'completed').length,
      overdue: homeworkList.filter(h => h.status === 'overdue').length
    };

    res.json({
      student: { id: student.id, name: student.name },
      summary,
      homework: homeworkList
    });
  } catch (err) {
    console.error('[API Error /homework/student/:studentId]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch student homework.' });
  }
});

// ==========================================
// 5. Submit Homework Solution (Student / Parent)
// ==========================================
assignmentsRouter.post('/homework/:homeworkId/submit', authenticateToken, (req, res) => {
  const { homeworkId } = req.params;
  const { studentId, submissionText, attachmentUrl } = req.body;

  if (!studentId || !submissionText) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'studentId and submissionText are required.'
    });
  }

  // Ownership verification
  if (req.user.role === 'student' && req.user.studentId && req.user.studentId !== studentId) {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Students may only submit their own work.' });
  }
  if (req.user.role === 'parent' && req.user.guardianId) {
    const isChild = db.prepare('SELECT id FROM students WHERE id = ? AND guardian_id = ?').get(studentId, req.user.guardianId);
    if (!isChild) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Parent cannot submit work for unlinked child.' });
    }
  }

  try {
    const hw = db.prepare('SELECT * FROM homework_assignments WHERE id = ?').get(homeworkId);
    if (!hw) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Homework assignment not found.' });
    }

    const subId = `sub-${homeworkId}-${studentId}`;
    db.prepare(`
      INSERT INTO homework_submissions (
        id, homework_id, student_id, submission_text, attachment_url, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, 'submitted', datetime('now'))
      ON CONFLICT(homework_id, student_id) DO UPDATE SET
        submission_text = excluded.submission_text,
        attachment_url = excluded.attachment_url,
        status = 'submitted',
        submitted_at = datetime('now')
    `).run(subId, homeworkId, studentId, submissionText, attachmentUrl || null);

    res.json({
      success: true,
      message: 'Homework solution submitted successfully for faculty review.',
      submissionId: subId
    });
  } catch (err) {
    console.error('[API Error /homework/:homeworkId/submit]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to submit homework.' });
  }
});

// ==========================================
// 6. Weekly Concept Assessments (Teacher / Admin)
// ==========================================
assignmentsRouter.post('/assessments', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const {
    batchId,
    title,
    subject,
    assessmentDate,
    maxScore = 50,
    passingScore = 35,
    topicsCovered = []
  } = req.body;

  if (!batchId || !title || !subject || !assessmentDate) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'batchId, title, subject, and assessmentDate are required.'
    });
  }

  try {
    if (!canTeacherManageBatch(req.user, batchId)) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Unauthorized for this batch.' });
    }

    const teacherId = getTeacherId(req.user) || 'tch-001';
    const assessmentId = `wka-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    db.prepare(`
      INSERT INTO weekly_assessments (
        id, batch_id, teacher_id, title, subject, assessment_date, max_score, passing_score, topics_covered_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      assessmentId,
      batchId,
      teacherId,
      title,
      subject,
      assessmentDate,
      Number(maxScore),
      Number(passingScore),
      JSON.stringify(Array.isArray(topicsCovered) ? topicsCovered : [])
    );

    const created = db.prepare('SELECT * FROM weekly_assessments WHERE id = ?').get(assessmentId);

    res.status(201).json({
      success: true,
      message: 'Weekly concept assessment checkpoint created.',
      assessment: {
        ...created,
        topicsCovered: JSON.parse(created.topics_covered_json || '[]')
      }
    });
  } catch (err) {
    console.error('[API Error /assessments]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to create assessment.' });
  }
});

assignmentsRouter.get('/assessments/batch/:batchId', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { batchId } = req.params;

  try {
    if (!canTeacherManageBatch(req.user, batchId)) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Unauthorized for this batch.' });
    }

    const assessments = db.prepare(`
      SELECT wa.*, 
        (SELECT COUNT(*) FROM assessment_scores sc WHERE sc.assessment_id = wa.id) as scores_recorded_count,
        (SELECT COUNT(*) FROM batch_enrollments be WHERE be.batch_id = wa.batch_id AND be.status = 'active') as total_enrolled
      FROM weekly_assessments wa
      WHERE wa.batch_id = ?
      ORDER BY wa.assessment_date DESC
    `).all(batchId);

    res.json({
      assessments: assessments.map(a => ({
        ...a,
        topicsCovered: JSON.parse(a.topics_covered_json || '[]')
      }))
    });
  } catch (err) {
    console.error('[API Error /assessments/batch/:batchId]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch assessments.' });
  }
});

// Record Scores, Feedback, Revision Areas & Actionable Recommendations
assignmentsRouter.post('/assessments/:assessmentId/scores', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { assessmentId } = req.params;
  const { scores } = req.body;

  if (!Array.isArray(scores) || scores.length === 0) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'scores array is required.' });
  }

  try {
    const assessment = db.prepare('SELECT * FROM weekly_assessments WHERE id = ?').get(assessmentId);
    if (!assessment) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Assessment not found.' });
    }

    if (!canTeacherManageBatch(req.user, assessment.batch_id)) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Unauthorized for this assessment.' });
    }

    db.exec('BEGIN TRANSACTION;');
    try {
      const upsertScore = db.prepare(`
        INSERT INTO assessment_scores (
          id, assessment_id, student_id, score, percentage, teacher_feedback, areas_needing_revision_json, next_learning_recommendation, recorded_by_user_id, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(assessment_id, student_id) DO UPDATE SET
          score = excluded.score,
          percentage = excluded.percentage,
          teacher_feedback = excluded.teacher_feedback,
          areas_needing_revision_json = excluded.areas_needing_revision_json,
          next_learning_recommendation = excluded.next_learning_recommendation,
          recorded_by_user_id = excluded.recorded_by_user_id,
          recorded_at = datetime('now')
      `);

      for (const sc of scores) {
        if (!sc.studentId || sc.score === undefined) continue;

        const numScore = Number(sc.score);
        const percentage = Math.round((numScore / assessment.max_score) * 100);
        const revisionJson = JSON.stringify(Array.isArray(sc.areasNeedingRevision) ? sc.areasNeedingRevision : []);
        const scoreId = `sc-${assessmentId}-${sc.studentId}`;

        upsertScore.run(
          scoreId,
          assessmentId,
          sc.studentId,
          numScore,
          percentage,
          sc.teacherFeedback || 'Concept checkpoint reviewed.',
          revisionJson,
          sc.nextLearningRecommendation || 'Continue concept practice drills.',
          req.user.id
        );
      }

      db.exec('COMMIT;');

      res.json({
        success: true,
        message: 'Weekly assessment scores, feedback, and actionable learning recommendations recorded.',
        processedCount: scores.length
      });
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }
  } catch (err) {
    console.error('[API Error /assessments/:assessmentId/scores]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to record assessment scores.' });
  }
});

// ==========================================
// 7. Student / Parent Subject-Wise Progress & Concept Mastery Report
// ==========================================
assignmentsRouter.get('/assessments/student/:studentId/report', authenticateToken, requireChildOwnership, (req, res) => {
  const { studentId } = req.params;

  try {
    const student = db.prepare('SELECT id, name, grade, board FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Student not found.' });
    }

    // Load all genuine assessment scores for this student (chronological history preserved)
    const records = db.prepare(`
      SELECT 
        sc.id,
        sc.score,
        sc.percentage,
        sc.teacher_feedback,
        sc.areas_needing_revision_json,
        sc.next_learning_recommendation,
        sc.recorded_at,
        wa.id as assessment_id,
        wa.title as assessment_title,
        wa.subject,
        wa.assessment_date,
        wa.max_score,
        wa.passing_score,
        wa.topics_covered_json,
        u.name as teacher_name
      FROM assessment_scores sc
      JOIN weekly_assessments wa ON wa.id = sc.assessment_id
      LEFT JOIN users u ON u.id = sc.recorded_by_user_id
      WHERE sc.student_id = ?
      ORDER BY wa.assessment_date DESC
    `).all(studentId);

    // Group by Subject for Subject-Wise Progress & Concept Mastery
    const subjectMap = new Map();

    records.forEach(r => {
      const subj = r.subject || 'General Studies';
      if (!subjectMap.has(subj)) {
        subjectMap.set(subj, {
          subject: subj,
          scores: [],
          revisions: new Set(),
          latestRecommendation: r.next_learning_recommendation
        });
      }

      const sData = subjectMap.get(subj);
      sData.scores.push(r.percentage);
      try {
        const revs = JSON.parse(r.areas_needing_revision_json || '[]');
        revs.forEach(item => sData.revisions.add(item));
      } catch (e) {}
    });

    const subjectProgress = Array.from(subjectMap.values()).map(s => {
      const avg = Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length);
      let masteryLevel;
      if (avg >= 80) masteryLevel = 'Concept Mastered';
      else if (avg >= 60) masteryLevel = 'Developing Proficiency';
      else masteryLevel = 'Needs Targeted Remediation';

      return {
        subject: s.subject,
        assessmentCount: s.scores.length,
        averageScorePercent: avg,
        masteryLevel,
        areasNeedingRevision: Array.from(s.revisions),
        latestRecommendation: s.latestRecommendation || 'Continue guided syllabus practice.'
      };
    });

    // Formatted assessment history
    const assessmentHistory = records.map(r => ({
      id: r.id,
      assessmentId: r.assessment_id,
      title: r.assessment_title,
      subject: r.subject,
      assessmentDate: r.assessment_date,
      score: r.score,
      maxScore: r.max_score,
      percentage: r.percentage,
      passed: r.score >= r.passing_score,
      teacherFeedback: r.teacher_feedback,
      areasNeedingRevision: JSON.parse(r.areas_needing_revision_json || '[]'),
      nextLearningRecommendation: r.next_learning_recommendation,
      teacherName: r.teacher_name || 'Faculty Mentor',
      topicsCovered: JSON.parse(r.topics_covered_json || '[]'),
      recordedAt: r.recorded_at
    }));

    res.json({
      student: { id: student.id, name: student.name, grade: student.grade, board: student.board },
      subjectProgress,
      assessmentHistory
    });
  } catch (err) {
    console.error('[API Error /assessments/student/:studentId/report]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to generate concept mastery report.' });
  }
});
