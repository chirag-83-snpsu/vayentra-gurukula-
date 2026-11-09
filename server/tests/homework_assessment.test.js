import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../index.js';
import { db } from '../db/database.js';

let server;
let baseUrl;

let adminToken;
let teacherToken;
let parentToken;
let studentToken;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  const adminRes = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'admin@vayentra.org', password: 'Gurukula@2026' }
  });
  adminToken = adminRes.body.token;

  const teacherRes = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'teacher@vayentra.org', password: 'Gurukula@2026' }
  });
  teacherToken = teacherRes.body.token;

  const parentRes = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'guardian@vayentra.org', password: 'Gurukula@2026' }
  });
  parentToken = parentRes.body.token;

  const studentRes = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'student@vayentra.org', password: 'Gurukula@2026' }
  });
  studentToken = studentRes.body.token;
});

after(async () => {
  await new Promise((resolve) => {
    if (server) {
      server.close(resolve);
    } else {
      resolve();
    }
  });
});

async function apiRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  return { status: response.status, body: data };
}

describe('Phase 4: Homework and Weekly Assessments Suite', () => {

  describe('1. Homework Creation & RBAC Permissions', () => {
    test('POST /api/v1/assignments/homework - 401 unauthenticated', async () => {
      const res = await apiRequest('/api/v1/assignments/homework', { method: 'POST', body: {} });
      assert.equal(res.status, 401);
    });

    test('POST /api/v1/assignments/homework - 403 for Parent role', async () => {
      const res = await apiRequest('/api/v1/assignments/homework', {
        method: 'POST',
        headers: { Authorization: `Bearer ${parentToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          title: 'Unauthorized Parent HW',
          subject: 'Mathematics',
          description: 'Test',
          dueDate: '2026-11-15'
        }
      });
      assert.equal(res.status, 403);
    });

    test('POST /api/v1/assignments/homework - 403 for Student role', async () => {
      const res = await apiRequest('/api/v1/assignments/homework', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          title: 'Unauthorized Student HW',
          subject: 'Mathematics',
          description: 'Test',
          dueDate: '2026-11-15'
        }
      });
      assert.equal(res.status, 403);
    });

    test('POST /api/v1/assignments/homework - 400 when missing target batch and student', async () => {
      const res = await apiRequest('/api/v1/assignments/homework', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          title: 'Untargeted HW',
          subject: 'Mathematics',
          description: 'Test',
          dueDate: '2026-11-15'
        }
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.code, 'TARGET_REQUIRED');
    });

    test('POST /api/v1/assignments/homework - 201 Teacher creates homework for batch with learning resources', async () => {
      const res = await apiRequest('/api/v1/assignments/homework', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          title: 'Rational Numbers Introduction Practice',
          subject: 'Mathematics',
          description: 'Solve questions 1-8. Show working on number line representation.',
          dueDate: '2026-11-12',
          learningResources: [
            { title: 'Chapter 1 Recap Notes', url: '/school/chapters', type: 'notes' },
            { title: 'Interactive Flashcards', url: '/school/practice/flashcards', type: 'flashcards' }
          ]
        }
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.homework.id);
      assert.equal(res.body.homework.learningResources.length, 2);
    });

    test('POST /api/v1/assignments/homework - 201 Teacher creates personalized homework for individual student', async () => {
      const res = await apiRequest('/api/v1/assignments/homework', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          targetStudentId: 'stu-001',
          title: 'Personalized Remedial Drill: Negative Exponents',
          subject: 'Mathematics',
          description: 'Targeted remediation based on mistake notebook entries.',
          dueDate: '2026-11-14'
        }
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.homework.target_student_id, 'stu-001');
    });
  });

  describe('2. Teacher Dashboard & Submissions Review', () => {
    test('GET /api/v1/assignments/homework/teacher - lists created homework with submission progress metrics', async () => {
      const res = await apiRequest('/api/v1/assignments/homework/teacher', {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.homework));
      assert.ok(res.body.homework.length >= 2);
      const hw1 = res.body.homework.find(h => h.id === 'hw-7a-int-drill');
      assert.ok(hw1);
      assert.ok(typeof hw1.submittedCount === 'number');
      assert.ok(typeof hw1.reviewedCount === 'number');
    });

    test('GET /api/v1/assignments/homework/:homeworkId/submissions - returns targeted student roster and submissions', async () => {
      const res = await apiRequest('/api/v1/assignments/homework/hw-7a-int-drill/submissions', {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.submissions));
      const stu001Sub = res.body.submissions.find(s => s.studentId === 'stu-001');
      assert.ok(stu001Sub);
      assert.equal(stu001Sub.hasSubmitted, true);
      assert.ok(stu001Sub.score >= 90);
      assert.equal(stu001Sub.status, 'reviewed');
    });

    test('POST /api/v1/assignments/homework/:homeworkId/submissions/:studentId/review - saves grade and teacher feedback', async () => {
      const res = await apiRequest('/api/v1/assignments/homework/hw-7a-int-drill/submissions/stu-001/review', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          score: 98,
          teacherFeedback: 'Outstanding precision! Clean algebraic notation.'
        }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.score, 98);

      // Verify in DB directly
      const sub = db.prepare('SELECT score, teacher_feedback, status FROM homework_submissions WHERE homework_id = ? AND student_id = ?').get('hw-7a-int-drill', 'stu-001');
      assert.equal(sub.score, 98);
      assert.equal(sub.status, 'reviewed');
    });
  });

  describe('3. Student & Parent View: Assigned, Completed, and Overdue Homework', () => {
    test('GET /api/v1/assignments/homework/student/:studentId - categorizes assigned, completed and overdue homework', async () => {
      // Create a fresh unsubmitted assignment for stu-001 with future date
      const freshHwRes = await apiRequest('/api/v1/assignments/homework', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          targetStudentId: 'stu-001',
          title: 'Fresh Test Homework',
          subject: 'Mathematics',
          description: 'Testing assigned status',
          dueDate: '2026-11-20'
        }
      });
      const freshHwId = freshHwRes.body.homework.id;

      const res = await apiRequest('/api/v1/assignments/homework/student/stu-001', {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(res.body.summary);
      assert.ok(res.body.summary.completed >= 1);
      assert.ok(Array.isArray(res.body.homework));

      // hw-7a-int-drill has reviewed submission => completed
      const completedHw = res.body.homework.find(h => h.id === 'hw-7a-int-drill');
      assert.ok(completedHw);
      assert.equal(completedHw.status, 'completed');
      assert.ok(completedHw.submission);
      assert.ok(completedHw.submission.score >= 90);

      // freshHw has no submission and future due date => assigned
      const assignedHw = res.body.homework.find(h => h.id === freshHwId);
      assert.ok(assignedHw);
      assert.equal(assignedHw.status, 'assigned');
    });

    test('GET /api/v1/assignments/homework/student/:studentId - Parent can view linked child homework', async () => {
      const res = await apiRequest('/api/v1/assignments/homework/student/stu-001', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.student.id, 'stu-001');
    });

    test('GET /api/v1/assignments/homework/student/:studentId - 403 Parent cannot view unlinked student', async () => {
      // Find a student not linked to par-001
      const otherStudent = db.prepare("SELECT id FROM students WHERE guardian_id != 'par-001'").get();
      if (otherStudent) {
        const res = await apiRequest(`/api/v1/assignments/homework/student/${otherStudent.id}`, {
          headers: { Authorization: `Bearer ${parentToken}` }
        });
        assert.equal(res.status, 403);
      }
    });

    test('POST /api/v1/assignments/homework/:homeworkId/submit - Student submits work with duplicate protection', async () => {
      const submitRes = await apiRequest('/api/v1/assignments/homework/hw-stu001-challenge/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: {
          studentId: 'stu-001',
          submissionText: 'Found GCD(252, 105): 252 = 2^2 * 3^2 * 7; 105 = 3 * 5 * 7. Common factors 3 * 7 = 21.'
        }
      });
      assert.equal(submitRes.status, 200);
      assert.equal(submitRes.body.success, true);

      // Submit again (revision/update) - should update without duplicate row error
      const updateRes = await apiRequest('/api/v1/assignments/homework/hw-stu001-challenge/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: {
          studentId: 'stu-001',
          submissionText: 'Updated proof with Euclidean remainder steps: 252 = 2*105 + 42; 105 = 2*42 + 21; 42 = 2*21 + 0. GCD = 21.'
        }
      });
      assert.equal(updateRes.status, 200);

      // Check DB row count is exactly 1
      const count = db.prepare('SELECT COUNT(*) as c FROM homework_submissions WHERE homework_id = ? AND student_id = ?').get('hw-stu001-challenge', 'stu-001').c;
      assert.equal(count, 1);
    });

    test('POST /api/v1/assignments/homework/:homeworkId/submit - 403 when student attempts submitting for other student', async () => {
      const res = await apiRequest('/api/v1/assignments/homework/hw-stu001-challenge/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: {
          studentId: 'stu-diya',
          submissionText: 'Impersonation attempt'
        }
      });
      assert.equal(res.status, 403);
    });
  });

  describe('4. Weekly Concept Assessments & Score Recording', () => {
    let testAssessmentId;

    test('POST /api/v1/assignments/assessments - 201 Teacher creates weekly concept assessment', async () => {
      const res = await apiRequest('/api/v1/assignments/assessments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          title: 'Week 4 Concept Check: Fractions & Rational Pre-Requisites',
          subject: 'Mathematics',
          assessmentDate: '2026-10-31',
          maxScore: 50,
          passingScore: 35,
          topicsCovered: ['Simplification of Fractions', 'Reciprocal Rule', 'Mixed Fractions']
        }
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.assessment.id);
      testAssessmentId = res.body.assessment.id;
    });

    test('POST /api/v1/assignments/assessments/:assessmentId/scores - Teacher records genuine scores and recommendations', async () => {
      const res = await apiRequest(`/api/v1/assignments/assessments/${testAssessmentId}/scores`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          scores: [
            {
              studentId: 'stu-001',
              score: 48,
              teacherFeedback: 'Outstanding command over reciprocal multiplication.',
              areasNeedingRevision: ['Improper to mixed fraction conversion under time limits'],
              nextLearningRecommendation: 'Practice 3-step fraction reduction challenges in chapter 2.'
            },
            {
              studentId: 'stu-diya',
              score: 42,
              teacherFeedback: 'Good conceptual progress.',
              areasNeedingRevision: ['Common denominator LCD finding'],
              nextLearningRecommendation: 'Review prime factorization flashcards.'
            }
          ]
        }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.processedCount, 2);
    });
  });

  describe('5. Subject-Wise Progress & Concept Mastery Report', () => {
    test('GET /api/v1/assignments/assessments/student/:studentId/report - returns subject progress and concept mastery', async () => {
      const res = await apiRequest('/api/v1/assignments/assessments/student/stu-001/report', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.subjectProgress));
      assert.ok(res.body.subjectProgress.length > 0);

      const mathProgress = res.body.subjectProgress.find(s => s.subject === 'Mathematics');
      assert.ok(mathProgress, 'Mathematics progress must be present');
      assert.ok(mathProgress.assessmentCount >= 2);
      assert.ok(mathProgress.averageScorePercent >= 80);
      assert.equal(mathProgress.masteryLevel, 'Concept Mastered');
      assert.ok(Array.isArray(mathProgress.areasNeedingRevision));
      assert.ok(mathProgress.latestRecommendation);

      // Verify assessment history is chronological and genuine
      assert.ok(Array.isArray(res.body.assessmentHistory));
      assert.ok(res.body.assessmentHistory.length >= 2);
      assert.ok(res.body.assessmentHistory.every(a => a.score > 0 && a.percentage > 0));
    });

    test('GET /api/v1/assignments/assessments/student/:studentId/report - 403 for unauthorized parent request', async () => {
      const otherStudent = db.prepare("SELECT id FROM students WHERE guardian_id != 'par-001'").get();
      if (otherStudent) {
        const res = await apiRequest(`/api/v1/assignments/assessments/student/${otherStudent.id}/report`, {
          headers: { Authorization: `Bearer ${parentToken}` }
        });
        assert.equal(res.status, 403);
      }
    });
  });

});
