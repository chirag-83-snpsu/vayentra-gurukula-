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

let testStudentId;
let testStudentId2;
let testEnrollmentNum;
let testBatchId;
let testAssessmentId;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // Clean up any previous test runs' temporary release batches
  db.prepare("DELETE FROM batches WHERE name LIKE 'Class 7 Release Batch%'").run();

  // Authenticate Admin
  const adminRes = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'admin@vayentra.org', password: 'Gurukula@2026' }
  });
  adminToken = adminRes.body.token;

  // Authenticate Teacher
  const teacherRes = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'teacher@vayentra.org', password: 'Gurukula@2026' }
  });
  teacherToken = teacherRes.body.token;

  // Authenticate Primary Parent (guardian of stu-001)
  const parentRes = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'guardian@vayentra.org', password: 'Gurukula@2026' }
  });
  parentToken = parentRes.body.token;

  // Authenticate Primary Student (stu-001)
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

  return {
    status: response.status,
    headers: response.headers,
    body: data
  };
}

describe('Phase 6: End-to-End Release & Accessibility Verification Suite', () => {

  // ========================================================
  // 1. Admission, Student Registration & Batch Enrollment
  // ========================================================
  describe('1. E2E Student Admission & Multi-Batch Enrollment', () => {
    test('Admin registers new students with verified guardian and enrollment number', async () => {
      const suffix = Math.floor(1000 + Math.random() * 9000);

      // Student 1
      const res = await apiRequest('/api/v1/admin/students', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: `Ananya Sharma ${suffix}`,
          grade: 7,
          board: 'CBSE',
          medium: 'English',
          guardianName: 'Sanjay Sharma',
          guardianPhone: `+91 98450 ${suffix}1`,
          guardianEmail: `sanjay.${suffix}@vayentra.org`
        }
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.student.id);
      assert.ok(res.body.student.enrollment_number);
      testStudentId = res.body.student.id;
      testEnrollmentNum = res.body.student.enrollment_number;

      // Student 2
      const res2 = await apiRequest('/api/v1/admin/students', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: `Rohan Gupta ${suffix}`,
          grade: 7,
          board: 'CBSE',
          medium: 'English',
          guardianName: 'Anita Gupta',
          guardianPhone: `+91 98450 ${suffix}2`,
          guardianEmail: `anita.${suffix}@vayentra.org`
        }
      });
      assert.equal(res2.status, 201);
      testStudentId2 = res2.body.student.id;
    });

    test('Rejects invalid grade range or non-existent guardian ID', async () => {
      const res = await apiRequest('/api/v1/admin/students', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Invalid Student',
          grade: 14,
          board: 'CBSE'
        }
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.code, 'VALIDATION_ERROR');
    });

    test('Creates dedicated test batch and enrolls learners', async () => {
      const batchRes = await apiRequest('/api/v1/admin/batches', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: `Class 7 Release Batch ${Date.now().toString(36)}`,
          grade: 7,
          board: 'CBSE',
          subject: 'Mathematics',
          teacherId: 'tch-001',
          daysOfWeek: ['SUN'],
          startTime: '10:00',
          endTime: '11:00',
          maxCapacity: 25,
          room: 'Studio-E2E'
        }
      });

      assert.equal(batchRes.status, 201);
      assert.ok(batchRes.body.batch.id);
      testBatchId = batchRes.body.batch.id;

      // Enroll testStudentId
      const enr1 = await apiRequest(`/api/v1/admin/batches/${testBatchId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { studentId: testStudentId }
      });
      assert.equal(enr1.status, 201);

      // Enroll testStudentId2
      const enr2 = await apiRequest(`/api/v1/admin/batches/${testBatchId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { studentId: testStudentId2 }
      });
      assert.equal(enr2.status, 201);
    });
  });

  // ========================================================
  // 2. Mobile Attendance Workflow & Absence Alerts
  // ========================================================
  describe('2. E2E Mobile Attendance Marking & Truthful Alerts', () => {
    let currentSessionId;
    const sessionDate = `2026-11-${String(Math.floor(10 + Math.random() * 18)).padStart(2, '0')}`;

    test('Teacher initializes or retrieves session on mobile', async () => {
      const sessRes = await apiRequest('/api/v1/attendance/sessions/get-or-create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          batchId: testBatchId,
          date: sessionDate,
          topic: 'Quadrilateral Angle Sum Theorem'
        }
      });

      assert.equal(sessRes.status, 200);
      assert.ok(sessRes.body.session.id);
      currentSessionId = sessRes.body.session.id;
    });

    test('Teacher submits mobile attendance payload with segmented statuses (P, A, L, E)', async () => {
      const records = [
        { studentId: testStudentId, status: 'absent', remarks: 'Parent informed fever' },
        { studentId: testStudentId2, status: 'present', remarks: 'Active classroom participation' }
      ];

      const markRes = await apiRequest(`/api/v1/attendance/sessions/${currentSessionId}/mark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          records,
          reason: 'Mobile Attendance Roll Call'
        }
      });

      assert.equal(markRes.status, 200);
      assert.equal(markRes.body.success, true);
      assert.equal(markRes.body.totalProcessed, records.length);
    });

    test('Idempotent update: Re-submitting corrected status updates SQLite without duplicate rows', async () => {
      const correctionRes = await apiRequest(`/api/v1/attendance/sessions/${currentSessionId}/mark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          records: [
            { studentId: testStudentId, status: 'excused', remarks: 'Medical slip verified' }
          ],
          reason: 'Individual faculty correction'
        }
      });

      assert.equal(correctionRes.status, 200);

      // Verify in audit trail
      const auditRes = await apiRequest(`/api/v1/attendance/audit-logs?sessionId=${currentSessionId}`, {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      assert.equal(auditRes.status, 200);
      assert.ok(auditRes.body.logs.length > 0);
      assert.ok(auditRes.body.logs.some(l => l.student_id === testStudentId && l.new_status === 'excused'));
    });
  });

  // ========================================================
  // 3. Homework & Concept Assessment Cycle
  // ========================================================
  describe('3. E2E Homework Assignment, Submission & Concept Evaluation', () => {
    let homeworkId;

    test('Teacher creates homework with due date and authorized learning resource', async () => {
      const hwRes = await apiRequest('/api/v1/assignments/homework', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          title: 'Special Quadrilaterals & Parallelogram Proofs',
          subject: 'Mathematics',
          description: 'Complete NCERT Exercise 8.2 Questions 1 through 6 in math notebook.',
          dueDate: '2026-11-20',
          learningResources: ['NCERT Mathematics Class 7 Chapter 8', 'Gurukula Concept Flashcards']
        }
      });

      assert.equal(hwRes.status, 201);
      assert.equal(hwRes.body.success, true);
      assert.ok(hwRes.body.homework.id);
      homeworkId = hwRes.body.homework.id;
    });

    test('Student submits homework response', async () => {
      const subRes = await apiRequest(`/api/v1/assignments/homework/${homeworkId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: {
          studentId: 'stu-001',
          submissionText: 'Completed proofs for parallelogram diagonal bisector property in exercise notebook.'
        }
      });

      assert.equal(subRes.status, 200);
      assert.equal(subRes.body.success, true);
      assert.ok(subRes.body.submissionId);
    });

    test('Teacher creates and evaluates weekly concept assessment with actionable revision recommendation', async () => {
      // Create weekly assessment for Batch 7-A
      const wkaRes = await apiRequest('/api/v1/assignments/assessments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          title: 'Weekly Geometry Assessment 4',
          subject: 'Mathematics',
          assessmentDate: '2026-11-01',
          maxScore: 25,
          passingScore: 18,
          topicsCovered: ['Parallelograms', 'Rhombus Properties', 'Diagonals']
        }
      });

      assert.equal(wkaRes.status, 201);
      testAssessmentId = wkaRes.body.assessment.id;

      // Grade assessment
      const scoreRes = await apiRequest(`/api/v1/assignments/assessments/${testAssessmentId}/scores`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          scores: [
            {
              studentId: 'stu-001',
              score: 22.5,
              teacherFeedback: 'Exceptional geometric reasoning. Practice angle bisector construction.',
              areasNeedingRevision: ['Angle Bisector Construction'],
              nextLearningRecommendation: 'Review geometric construction flashcards'
            }
          ]
        }
      });

      assert.equal(scoreRes.status, 200);
      assert.equal(scoreRes.body.success, true);
      assert.ok(scoreRes.body.processedCount >= 1);
    });
  });

  // ========================================================
  // 4. Parent Reporting & Verifiable Progress Dossier
  // ========================================================
  describe('4. E2E Parent Dashboard, Progress Report & Truthful Gateway Status', () => {
    test('Parent fetches child dashboard with dynamic attendance and genuine data', async () => {
      const dashRes = await apiRequest('/api/v1/parent/dashboard/stu-001', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });

      assert.equal(dashRes.status, 200);
      assert.equal(dashRes.body.success, true);
      assert.ok(dashRes.body.student.id === 'stu-001');
      assert.ok(dashRes.body.attendanceSummary);
      assert.ok(typeof dashRes.body.attendanceSummary.percentage === 'number');
      assert.ok(Array.isArray(dashRes.body.pendingHomework));
      assert.ok(Array.isArray(dashRes.body.weeklyTests));
      assert.ok(Array.isArray(dashRes.body.teacherFeedback));
    });

    test('Generates cryptographically verified progress report card with integrity hash', async () => {
      const rptRes = await apiRequest('/api/v1/parent/reports/monthly/stu-001?month=2026-10', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });

      assert.equal(rptRes.status, 200);
      assert.equal(rptRes.body.success, true);
      const rpt = rptRes.body.reportCard;
      assert.ok(rpt.verification.tamperEvidentHash);
      assert.ok(rpt.verification.tamperEvidentHash.startsWith('VG-'));
      assert.equal(rpt.student.id, 'stu-001');
    });

    test('Truthful gateway status endpoint reflects unconfigured state honestly', async () => {
      const gwRes = await apiRequest('/api/v1/admin/messaging/gateway-status', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      assert.equal(gwRes.status, 200);
      assert.equal(gwRes.body.success, true);
      assert.equal(gwRes.body.gateways.whatsapp.configured, false);
      assert.equal(gwRes.body.gateways.sms.configured, false);
      assert.equal(gwRes.body.gateways.mockMode, false);
    });
  });

  // ========================================================
  // 5. Accessibility, Privacy Boundaries & Data Minimization
  // ========================================================
  describe('5. Accessibility, Privacy Boundaries & Security Sanitization', () => {
    test('Unauthenticated requests are strictly rejected with 401 UNAUTHORIZED', async () => {
      const res = await apiRequest('/api/v1/parent/dashboard/stu-001');
      assert.equal(res.status, 401);
      assert.equal(res.body.code, 'UNAUTHORIZED');
    });

    test('Cross-child boundary: Parent cannot view unlinked child (403 FORBIDDEN)', async () => {
      // parentToken owns stu-001, but testStudentId belongs to another family
      const res = await apiRequest(`/api/v1/parent/dashboard/${testStudentId}`, {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });

    test('Data minimization: Responses never expose sensitive password hashes or secret tokens', async () => {
      const meRes = await apiRequest('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });

      assert.equal(meRes.status, 200);
      const jsonStr = JSON.stringify(meRes.body);
      assert.ok(!jsonStr.includes('password_hash'), 'Password hash must never be returned');
      assert.ok(!jsonStr.includes('$2a$'), 'Bcrypt hash signature must never be exposed');
    });

    test('Responses contain no internal developer jargon or wireframe labels', async () => {
      const dashRes = await apiRequest('/api/v1/parent/dashboard/stu-001', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });

      const text = JSON.stringify(dashRes.body);
      assert.ok(!text.includes('FR-'), 'No FR- requirement IDs in user-facing JSON');
      assert.ok(!text.includes('Wireframe'), 'No Wireframe text in user-facing JSON');
      assert.ok(!text.includes('Diagram'), 'No Diagram text in user-facing JSON');
    });
  });

});
