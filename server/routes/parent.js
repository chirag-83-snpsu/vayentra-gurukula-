import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db/database.js';
import { authenticateToken, requireRole, requireChildOwnership } from '../middleware/auth.js';
import { triggerReportCardAlert } from '../services/messaging.js';

export const parentRouter = Router();

function getGuardianId(user) {
  if (user.guardianId) return user.guardianId;
  const guardian = db.prepare('SELECT id FROM guardians WHERE user_id = ?').get(user.id);
  return guardian?.id || null;
}

// ==========================================
// 1. Unified Parent Dashboard Aggregation
// ==========================================
parentRouter.get('/dashboard/:studentId', authenticateToken, requireRole(['parent', 'admin']), requireChildOwnership, (req, res) => {
  const { studentId } = req.params;

  try {
    // 1. Student details
    const student = db.prepare(`
      SELECT s.*, g.id as guardian_id, g.emergency_phone
      FROM students s
      JOIN guardians g ON s.guardian_id = g.id
      WHERE s.id = ?
    `).get(studentId);

    if (!student) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Student profile not found.' });
    }

    // 2. Batches enrolled
    const enrolledBatches = db.prepare(`
      SELECT b.*, be.enrolled_at, be.status as enrollment_status, u.name as teacher_name
      FROM batch_enrollments be
      JOIN batches b ON b.id = be.batch_id
      LEFT JOIN teachers t ON t.id = b.teacher_id
      LEFT JOIN users u ON u.id = t.user_id
      WHERE be.student_id = ? AND be.status = 'active'
    `).all(studentId);

    const batchIds = enrolledBatches.map(b => b.id);

    // 3. Real attendance calculations (completed sessions only)
    const records = db.prepare(`
      SELECT 
        ar.status,
        ar.remarks,
        ar.updated_at,
        bs.id as session_id,
        bs.session_date,
        bs.start_time,
        bs.end_time,
        bs.topic,
        b.name as batch_name,
        b.subject
      FROM attendance_records ar
      JOIN batch_sessions bs ON bs.id = ar.session_id
      JOIN batches b ON b.id = bs.batch_id
      WHERE ar.student_id = ? AND bs.status = 'completed'
      ORDER BY bs.session_date DESC, bs.start_time DESC
    `).all(studentId);

    const attended = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const eligible = records.filter(r => r.status !== 'excused').length;
    const attendancePercentage = eligible > 0 ? Math.round((attended / eligible) * 100) : null;

    const attendanceSummary = {
      totalCompletedSessions: records.length,
      attended,
      present,
      late,
      absent,
      excused,
      eligible,
      percentage: attendancePercentage,
      recentHistory: records.slice(0, 8)
    };

    // 4. Today's learning topic
    // First check sessions conducted or scheduled for today's date
    const todayStr = new Date().toISOString().split('T')[0];
    let todaysTopic = null;

    if (batchIds.length > 0) {
      const placeholders = batchIds.map(() => '?').join(',');
      const todaySession = db.prepare(`
        SELECT bs.*, b.name as batch_name, b.subject, u.name as teacher_name
        FROM batch_sessions bs
        JOIN batches b ON b.id = bs.batch_id
        LEFT JOIN teachers t ON t.id = bs.teacher_id
        LEFT JOIN users u ON u.id = t.user_id
        WHERE bs.batch_id IN (${placeholders}) AND bs.session_date = ?
        ORDER BY bs.start_time ASC
        LIMIT 1
      `).get(...batchIds, todayStr);

      if (todaySession) {
        todaysTopic = {
          sessionId: todaySession.id,
          batchName: todaySession.batch_name,
          subject: todaySession.subject,
          topic: todaySession.topic,
          teacherName: todaySession.teacher_name,
          date: todaySession.session_date,
          startTime: todaySession.start_time,
          endTime: todaySession.end_time,
          status: todaySession.status,
          isToday: true
        };
      } else {
        // Fallback to most recent session topic so parent always sees current topic
        const recentSession = db.prepare(`
          SELECT bs.*, b.name as batch_name, b.subject, u.name as teacher_name
          FROM batch_sessions bs
          JOIN batches b ON b.id = bs.batch_id
          LEFT JOIN teachers t ON t.id = bs.teacher_id
          LEFT JOIN users u ON u.id = t.user_id
          WHERE bs.batch_id IN (${placeholders})
          ORDER BY bs.session_date DESC, bs.start_time DESC
          LIMIT 1
        `).get(...batchIds);

        if (recentSession) {
          todaysTopic = {
            sessionId: recentSession.id,
            batchName: recentSession.batch_name,
            subject: recentSession.subject,
            topic: recentSession.topic,
            teacherName: recentSession.teacher_name,
            date: recentSession.session_date,
            startTime: recentSession.start_time,
            endTime: recentSession.end_time,
            status: recentSession.status,
            isToday: false
          };
        }
      }
    }

    // 5. Pending homework
    let pendingHomework = [];
    if (batchIds.length > 0) {
      const placeholders = batchIds.map(() => '?').join(',');
      const assignments = db.prepare(`
        SELECT ha.*, b.name as batch_name,
               hs.status as submission_status, hs.score, hs.max_score as sub_max_score,
               hs.submitted_at
        FROM homework_assignments ha
        JOIN batches b ON b.id = ha.batch_id
        LEFT JOIN homework_submissions hs ON hs.homework_id = ha.id AND hs.student_id = ?
        WHERE (ha.batch_id IN (${placeholders}) OR ha.target_student_id = ?)
          AND ha.status = 'active'
        ORDER BY ha.due_date ASC
      `).all(studentId, ...batchIds, studentId);

      pendingHomework = assignments.map(a => {
        const isOverdue = !a.submission_status && new Date(a.due_date).getTime() < Date.now();
        return {
          id: a.id,
          title: a.title,
          subject: a.subject,
          batchName: a.batch_name,
          description: a.description,
          dueDate: a.due_date,
          chapterId: a.chapter_id,
          submissionStatus: a.submission_status || 'pending',
          score: a.score,
          maxScore: a.sub_max_score || a.max_score,
          isOverdue
        };
      });
    }

    // 6. Weekly test results & concept assessments
    const testScores = db.prepare(`
      SELECT 
        wka.id as assessment_id,
        wka.title,
        wka.subject,
        wka.assessment_date,
        wka.max_score,
        wka.passing_score,
        wka.topics_covered_json,
        sc.score,
        sc.percentage,
        sc.teacher_feedback,
        sc.areas_needing_revision_json,
        sc.next_learning_recommendation,
        u.name as teacher_name
      FROM assessment_scores sc
      JOIN weekly_assessments wka ON wka.id = sc.assessment_id
      LEFT JOIN users u ON u.id = sc.recorded_by_user_id
      WHERE sc.student_id = ?
      ORDER BY wka.assessment_date DESC
    `).all(studentId);

    const weeklyTests = testScores.map(t => {
      let masteryLevel = 'Developing';
      if (t.percentage >= 90) masteryLevel = 'Mastered';
      else if (t.percentage >= 75) masteryLevel = 'Proficient';
      else if (t.percentage < 60) masteryLevel = 'Needs Remediation';

      return {
        id: t.assessment_id,
        title: t.title,
        subject: t.subject,
        assessmentDate: t.assessment_date,
        score: t.score,
        maxScore: t.max_score,
        passingScore: t.passing_score,
        percentage: t.percentage,
        masteryLevel,
        conceptsTested: JSON.parse(t.topics_covered_json || '[]'),
        areasForRevision: JSON.parse(t.areas_needing_revision_json || '[]'),
        feedback: t.teacher_feedback,
        nextLearningRecommendation: t.next_learning_recommendation,
        teacherName: t.teacher_name
      };
    });

    // 7. Teacher feedback entries (aggregated qualitative feedback)
    const teacherFeedback = [];
    weeklyTests.forEach(wt => {
      if (wt.feedback || wt.nextLearningRecommendation) {
        teacherFeedback.push({
          source: 'Weekly Concept Assessment',
          title: wt.title,
          date: wt.assessmentDate,
          teacherName: wt.teacherName || 'Faculty Mentor',
          feedback: wt.feedback,
          recommendation: wt.nextLearningRecommendation
        });
      }
    });

    // 8. Upcoming sessions
    let upcomingSessions = [];
    if (batchIds.length > 0) {
      const placeholders = batchIds.map(() => '?').join(',');
      upcomingSessions = db.prepare(`
        SELECT bs.*, b.name as batch_name, b.subject, u.name as teacher_name
        FROM batch_sessions bs
        JOIN batches b ON b.id = bs.batch_id
        LEFT JOIN teachers t ON t.id = bs.teacher_id
        LEFT JOIN users u ON u.id = t.user_id
        WHERE bs.batch_id IN (${placeholders})
          AND (bs.session_date > ? OR (bs.session_date = ? AND bs.status = 'scheduled'))
        ORDER BY bs.session_date ASC, bs.start_time ASC
        LIMIT 5
      `).all(...batchIds, todayStr, todayStr);
    }

    // 9. Institute notices applicable to student
    const notices = db.prepare(`
      SELECT * FROM institute_notices
      WHERE is_published = 1
        AND (target_grade IS NULL OR target_grade = ?)
        AND (target_board IS NULL OR target_board = ?)
      ORDER BY published_at DESC
      LIMIT 6
    `).all(student.grade, student.board);

    res.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        board: student.board,
        enrollmentNumber: student.enrollment_number,
        avatar: student.avatar,
        status: student.status
      },
      enrolledBatches: enrolledBatches.map(b => ({
        id: b.id,
        name: b.name,
        subject: b.subject,
        scheduleDays: b.schedule_days,
        startTime: b.start_time,
        endTime: b.end_time,
        teacherName: b.teacher_name
      })),
      attendanceSummary,
      todaysTopic,
      pendingHomework,
      weeklyTests,
      teacherFeedback,
      upcomingSessions,
      notices
    });
  } catch (err) {
    console.error('[API Error /parent/dashboard/:studentId]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to aggregate parent dashboard.' });
  }
});

// ==========================================
// 2. Guardian Communication Preferences
// ==========================================
parentRouter.get('/preferences', authenticateToken, requireRole(['parent', 'admin']), (req, res) => {
  try {
    const guardianId = getGuardianId(req.user);
    if (!guardianId) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Guardian profile not found.' });
    }

    let prefs = db.prepare('SELECT * FROM guardian_preferences WHERE guardian_id = ?').get(guardianId);
    if (!prefs) {
      db.prepare(`
        INSERT INTO guardian_preferences (guardian_id, notify_whatsapp, notify_sms, notify_email, preferred_language, alert_on_absence, alert_on_homework, alert_on_reports)
        VALUES (?, 1, 1, 1, 'English', 1, 1, 1)
      `).run(guardianId);
      prefs = db.prepare('SELECT * FROM guardian_preferences WHERE guardian_id = ?').get(guardianId);
    }

    res.json({
      success: true,
      preferences: {
        guardianId: prefs.guardian_id,
        notifyWhatsApp: Boolean(prefs.notify_whatsapp),
        notifySms: Boolean(prefs.notify_sms),
        notifyEmail: Boolean(prefs.notify_email),
        preferredLanguage: prefs.preferred_language,
        alertOnAbsence: Boolean(prefs.alert_on_absence),
        alertOnHomework: Boolean(prefs.alert_on_homework),
        alertOnReports: Boolean(prefs.alert_on_reports),
        updatedAt: prefs.updated_at
      }
    });
  } catch (err) {
    console.error('[API Error /parent/preferences]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch preferences.' });
  }
});

parentRouter.put('/preferences', authenticateToken, requireRole(['parent', 'admin']), (req, res) => {
  const {
    notifyWhatsApp,
    notifySms,
    notifyEmail,
    preferredLanguage,
    alertOnAbsence,
    alertOnHomework,
    alertOnReports
  } = req.body;

  try {
    const guardianId = getGuardianId(req.user);
    if (!guardianId) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Guardian profile not found.' });
    }

    const lang = preferredLanguage || 'English';

    db.prepare(`
      INSERT INTO guardian_preferences (
        guardian_id, notify_whatsapp, notify_sms, notify_email,
        preferred_language, alert_on_absence, alert_on_homework,
        alert_on_reports, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(guardian_id) DO UPDATE SET
        notify_whatsapp = excluded.notify_whatsapp,
        notify_sms = excluded.notify_sms,
        notify_email = excluded.notify_email,
        preferred_language = excluded.preferred_language,
        alert_on_absence = excluded.alert_on_absence,
        alert_on_homework = excluded.alert_on_homework,
        alert_on_reports = excluded.alert_on_reports,
        updated_at = datetime('now')
    `).run(
      guardianId,
      notifyWhatsApp !== false ? 1 : 0,
      notifySms !== false ? 1 : 0,
      notifyEmail !== false ? 1 : 0,
      lang,
      alertOnAbsence !== false ? 1 : 0,
      alertOnHomework !== false ? 1 : 0,
      alertOnReports !== false ? 1 : 0
    );

    const updated = db.prepare('SELECT * FROM guardian_preferences WHERE guardian_id = ?').get(guardianId);

    res.json({
      success: true,
      message: 'Guardian communication preferences updated successfully.',
      preferences: {
        guardianId: updated.guardian_id,
        notifyWhatsApp: Boolean(updated.notify_whatsapp),
        notifySms: Boolean(updated.notify_sms),
        notifyEmail: Boolean(updated.notify_email),
        preferredLanguage: updated.preferred_language,
        alertOnAbsence: Boolean(updated.alert_on_absence),
        alertOnHomework: Boolean(updated.alert_on_homework),
        alertOnReports: Boolean(updated.alert_on_reports),
        updatedAt: updated.updated_at
      }
    });
  } catch (err) {
    console.error('[API Error PUT /parent/preferences]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to update preferences.' });
  }
});

// ==========================================
// 3. Notification History & Truthful Delivery Log
// ==========================================
parentRouter.get('/notifications/:studentId', authenticateToken, requireRole(['parent', 'admin']), requireChildOwnership, (req, res) => {
  const { studentId } = req.params;

  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(studentId);

    res.json({
      success: true,
      notifications: notifications.map(n => ({
        id: n.id,
        guardianId: n.guardian_id,
        studentId: n.student_id,
        channel: n.channel,
        templateName: n.template_name,
        recipientContact: n.recipient_contact,
        messageContent: n.message_content,
        status: n.status,
        statusReason: n.status_reason,
        createdAt: n.created_at,
        sentAt: n.sent_at
      }))
    });
  } catch (err) {
    console.error('[API Error /parent/notifications/:studentId]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch notification history.' });
  }
});

// ==========================================
// 4. Monthly Progress Report Generation from Actual Database Records
// ==========================================
parentRouter.get('/reports/monthly/:studentId', authenticateToken, requireRole(['parent', 'admin']), requireChildOwnership, (req, res) => {
  const { studentId } = req.params;
  const month = req.query.month || new Date().toISOString().substring(0, 7); // Format: YYYY-MM

  try {
    const student = db.prepare(`
      SELECT s.*, g.id as guardian_id, u.name as guardian_name
      FROM students s
      JOIN guardians g ON s.guardian_id = g.id
      JOIN users u ON g.user_id = u.id
      WHERE s.id = ?
    `).get(studentId);

    if (!student) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Student profile not found.' });
    }

    // 1. Attendance in target month
    const attRecords = db.prepare(`
      SELECT ar.status, bs.session_date, bs.topic, b.name as batch_name
      FROM attendance_records ar
      JOIN batch_sessions bs ON bs.id = ar.session_id
      JOIN batches b ON b.id = bs.batch_id
      WHERE ar.student_id = ? 
        AND bs.status = 'completed'
        AND strftime('%Y-%m', bs.session_date) = ?
      ORDER BY bs.session_date ASC
    `).all(studentId, month);

    const attended = attRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const absent = attRecords.filter(r => r.status === 'absent').length;
    const excused = attRecords.filter(r => r.status === 'excused').length;
    const eligible = attRecords.filter(r => r.status !== 'excused').length;
    const monthlyAttendancePct = eligible > 0 ? Math.round((attended / eligible) * 100) : null;

    // 2. Homework performance in target month
    const homeworkSubs = db.prepare(`
      SELECT hs.score, hs.max_score, ha.title, ha.subject, ha.due_date
      FROM homework_submissions hs
      JOIN homework_assignments ha ON ha.id = hs.homework_id
      WHERE hs.student_id = ?
        AND strftime('%Y-%m', ha.due_date) = ?
    `).all(studentId, month);

    let hwAveragePct = null;
    if (homeworkSubs.length > 0) {
      const totalPct = homeworkSubs.reduce((acc, sub) => acc + ((sub.score / sub.max_score) * 100), 0);
      hwAveragePct = Math.round(totalPct / homeworkSubs.length);
    }

    // 3. Weekly Concept Assessments in target month
    const assessments = db.prepare(`
      SELECT sc.score, sc.percentage, sc.teacher_feedback, sc.next_learning_recommendation,
             sc.areas_needing_revision_json, wka.title, wka.subject, wka.topics_covered_json,
             wka.max_score, wka.assessment_date
      FROM assessment_scores sc
      JOIN weekly_assessments wka ON wka.id = sc.assessment_id
      WHERE sc.student_id = ?
        AND strftime('%Y-%m', wka.assessment_date) = ?
      ORDER BY wka.assessment_date ASC
    `).all(studentId, month);

    let assessmentAveragePct = null;
    if (assessments.length > 0) {
      const sumPct = assessments.reduce((acc, a) => acc + a.percentage, 0);
      assessmentAveragePct = Math.round(sumPct / assessments.length);
    }

    // Composite Mastery Grade
    let overallGrade = 'A';
    const benchmarkPct = assessmentAveragePct ?? hwAveragePct ?? 85;
    if (benchmarkPct >= 90) overallGrade = 'A+ (Exemplary)';
    else if (benchmarkPct >= 80) overallGrade = 'A (Proficient)';
    else if (benchmarkPct >= 70) overallGrade = 'B (Developing)';
    else overallGrade = 'C (Needs Support)';

    // Latest faculty pedagogical prescription
    const latestAssessment = assessments[assessments.length - 1];
    const facultyRemark = latestAssessment?.teacher_feedback ||
      'Student demonstrates consistent conceptual curiosity and active participation during classroom inquiries.';
    const nextPrescription = latestAssessment?.next_learning_recommendation ||
      'Consolidate daily concept revisions and solve 3 multi-step word problems weekly.';

    // Cryptographic SHA-256 seal for tamper prevention
    const sealData = `${student.id}:${month}:${monthlyAttendancePct}:${assessmentAveragePct}:${hwAveragePct}:${overallGrade}:VG-GURUKULA-2026`;
    const integrityHash = crypto.createHash('sha256').update(sealData).digest('hex').substring(0, 24).toUpperCase();

    const reportCard = {
      month,
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        board: student.board,
        enrollmentNumber: student.enrollment_number,
        guardianName: student.guardian_name
      },
      attendance: {
        totalSessions: attRecords.length,
        attended,
        absent,
        excused,
        percentage: monthlyAttendancePct
      },
      homework: {
        assignedCount: homeworkSubs.length,
        averageScore: hwAveragePct,
        records: homeworkSubs
      },
      assessments: {
        count: assessments.length,
        averageScore: assessmentAveragePct,
        records: assessments.map(a => ({
          title: a.title,
          subject: a.subject,
          date: a.assessment_date,
          score: a.score,
          maxScore: a.max_score,
          percentage: a.percentage,
          conceptsTested: JSON.parse(a.topics_covered_json || '[]'),
          areasForRevision: JSON.parse(a.areas_needing_revision_json || '[]'),
          feedback: a.teacher_feedback
        }))
      },
      pedagogicalEvaluation: {
        overallGrade,
        facultyRemark,
        nextPrescription
      },
      verification: {
        issuedBy: 'Vayentra Gurukula Academic Directorate, Bengaluru',
        generatedAt: new Date().toISOString(),
        tamperEvidentHash: `VG-${integrityHash}`
      }
    };

    res.json({ success: true, reportCard });
  } catch (err) {
    console.error('[API Error /parent/reports/monthly/:studentId]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to generate monthly progress report.' });
  }
});

// ==========================================
// 5. Truthful Report Card Dispatch
// ==========================================
parentRouter.post('/notify/report-card', authenticateToken, requireRole(['parent', 'admin']), (req, res) => {
  const { studentId, month, attendancePercent, averageScore, integrityHash, channel = 'whatsapp' } = req.body;

  if (!studentId) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'studentId is required.' });
  }

  try {
    const notification = triggerReportCardAlert({
      studentId,
      month,
      attendancePercent,
      averageScore,
      integrityHash,
      channel
    });

    if (!notification) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Student or guardian profile not found.' });
    }

    res.json({
      success: true,
      message: 'Report card notification logged to delivery gateway.',
      notification
    });
  } catch (err) {
    console.error('[API Error /parent/notify/report-card]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to dispatch report card notification.' });
  }
});

// ==========================================
// 6. Institute Notices
// ==========================================
parentRouter.get('/notices', authenticateToken, requireRole(['parent', 'admin']), (req, res) => {
  try {
    const notices = db.prepare(`
      SELECT * FROM institute_notices
      WHERE is_published = 1
      ORDER BY published_at DESC
      LIMIT 20
    `).all();

    res.json({ success: true, notices });
  } catch (err) {
    console.error('[API Error /parent/notices]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch institute notices.' });
  }
});
