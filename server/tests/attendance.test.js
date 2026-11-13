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

  // Login accounts for testing
  const adminRes = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'admin@vayentra.org', password: 'Gurukula@2026' }
  });
  adminToken = adminRes.body.token;

  // Reset any leftover test sessions that could conflict across test runs
  try {
    db.prepare("DELETE FROM attendance_records WHERE session_id IN ('ses-7a-future', 'ses-batch7acbsemath-20261125-mwd48b0w', 'ses-batch7acbsemath-20261025-mw9k6dyq')").run();
    db.prepare("DELETE FROM attendance_sessions WHERE id IN ('ses-7a-future', 'ses-batch7acbsemath-20261125-mwd48b0w', 'ses-batch7acbsemath-20261025-mw9k6dyq')").run();
  } catch (e) {}

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

describe('Phase 3: Persistent Student Attendance Suite', () => {

  describe('1. Role Authorization Boundaries for Attendance APIs', () => {
    test('GET /api/v1/attendance/batches - 401 without Bearer token', async () => {
      const res = await apiRequest('/api/v1/attendance/batches');
      assert.equal(res.status, 401);
      assert.equal(res.body.code, 'UNAUTHORIZED');
    });

    test('GET /api/v1/attendance/batches - 403 for Parent role', async () => {
      const res = await apiRequest('/api/v1/attendance/batches', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });

    test('GET /api/v1/attendance/batches - 403 for Student role', async () => {
      const res = await apiRequest('/api/v1/attendance/batches', {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });

    test('GET /api/v1/attendance/batches - 200 for Teacher role with assigned batches', async () => {
      const res = await apiRequest('/api/v1/attendance/batches', {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.batches));
      assert.ok(res.body.batches.length > 0);
      // All returned batches must belong to this teacher
      assert.ok(res.body.batches.every(b => b.teacherId === 'tch-001'));
    });

    test('GET /api/v1/attendance/batches - 200 for Admin role with all batches', async () => {
      const res = await apiRequest('/api/v1/attendance/batches', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.batches));
      assert.ok(res.body.batches.length >= 4);
    });
  });

  describe('2. Batch Sessions & Active Roster Retrieval', () => {
    test('POST /api/v1/attendance/sessions/get-or-create - creates or retrieves session for batch and date', async () => {
      const res = await apiRequest('/api/v1/attendance/sessions/get-or-create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          date: '2026-10-29',
          topic: 'Quadrilateral Angles & Polygon Diagnostics'
        }
      });
      assert.equal(res.status, 200);
      assert.ok(res.body.session);
      assert.equal(res.body.session.batch_id, 'batch-7a-cbse-math');
      assert.equal(res.body.session.session_date, '2026-10-29');
    });

    test('GET /api/v1/attendance/sessions/:sessionId/roster - returns only active enrolled students', async () => {
      // Find session
      const sessRes = await apiRequest('/api/v1/attendance/batches/batch-7a-cbse-math/sessions', {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      assert.equal(sessRes.status, 200);
      const session = sessRes.body.sessions[0];
      assert.ok(session);

      const rosterRes = await apiRequest(`/api/v1/attendance/sessions/${session.id}/roster`, {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      assert.equal(rosterRes.status, 200);
      assert.ok(rosterRes.body.session);
      assert.ok(Array.isArray(rosterRes.body.roster));
      // Class 7-A has active students: Aarav Varma (stu-001) plus seeded classmates
      const studentIds = rosterRes.body.roster.map(r => r.studentId);
      assert.ok(studentIds.includes('stu-001'));
      assert.ok(studentIds.includes('stu-diya'));
      assert.ok(studentIds.includes('stu-kavya'));
      assert.ok(studentIds.includes('stu-rohan'));
      assert.ok(studentIds.includes('stu-zoya'));
    });
  });

  describe('3. Attendance Marking & Duplicate Protection', () => {
    let testSessionId;

    before(async () => {
      const createRes = await apiRequest('/api/v1/attendance/sessions/get-or-create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          date: '2026-10-25',
          topic: 'Revision & Quiz'
        }
      });
      testSessionId = createRes.body.session.id;
    });

    test('POST /api/v1/attendance/sessions/:sessionId/mark - records attendance for enrolled students', async () => {
      const markRes = await apiRequest(`/api/v1/attendance/sessions/${testSessionId}/mark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          records: [
            { studentId: 'stu-001', status: 'present', remarks: 'Good homework' },
            { studentId: 'stu-diya', status: 'late', remarks: '5 mins late' },
            { studentId: 'stu-kavya', status: 'present', remarks: '' },
            { studentId: 'stu-rohan', status: 'absent', remarks: 'Unwell' },
            { studentId: 'stu-zoya', status: 'excused', remarks: 'Family event approved' }
          ],
          reason: 'Initial session marking'
        }
      });
      assert.equal(markRes.status, 200);
      assert.equal(markRes.body.success, true);
      assert.equal(markRes.body.totalProcessed, 5);

      // Verify in database directly
      const count = db.prepare('SELECT COUNT(*) as c FROM attendance_records WHERE session_id = ?').get(testSessionId).c;
      assert.equal(count, 5);
    });

    test('POST /api/v1/attendance/sessions/:sessionId/mark - duplicate submission updates without row duplication', async () => {
      const beforeCount = db.prepare('SELECT COUNT(*) as c FROM attendance_records WHERE session_id = ?').get(testSessionId).c;

      // Resubmit same records
      const resubmitRes = await apiRequest(`/api/v1/attendance/sessions/${testSessionId}/mark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          records: [
            { studentId: 'stu-001', status: 'present', remarks: 'Updated remarks' },
            { studentId: 'stu-diya', status: 'late', remarks: '5 mins late' },
            { studentId: 'stu-kavya', status: 'present', remarks: '' },
            { studentId: 'stu-rohan', status: 'absent', remarks: 'Unwell' },
            { studentId: 'stu-zoya', status: 'excused', remarks: 'Family event approved' }
          ]
        }
      });
      assert.equal(resubmitRes.status, 200);

      const afterCount = db.prepare('SELECT COUNT(*) as c FROM attendance_records WHERE session_id = ?').get(testSessionId).c;
      assert.equal(afterCount, beforeCount, 'Record count must remain identical due to composite uniqueness');
    });

    test('POST /api/v1/attendance/sessions/:sessionId/mark - rejects invalid attendance status (400)', async () => {
      const invalidRes = await apiRequest(`/api/v1/attendance/sessions/${testSessionId}/mark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          records: [
            { studentId: 'stu-001', status: 'unknown_status' }
          ]
        }
      });
      assert.equal(invalidRes.status, 400);
      assert.equal(invalidRes.body.code, 'INVALID_STATUS');
    });

    test('POST /api/v1/attendance/sessions/:sessionId/mark - rejects non-enrolled student (400)', async () => {
      const unenrolledRes = await apiRequest(`/api/v1/attendance/sessions/${testSessionId}/mark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          records: [
            { studentId: 'stu-alien-999', status: 'present' }
          ]
        }
      });
      assert.equal(unenrolledRes.status, 400);
      assert.equal(unenrolledRes.body.code, 'STUDENT_NOT_ENROLLED');
    });

    test('POST /api/v1/attendance/sessions/:sessionId/mark - rejects marking attendance on cancelled session (400)', async () => {
      const cancelledRes = await apiRequest('/api/v1/attendance/sessions/ses-7a-cancelled/mark', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          records: [
            { studentId: 'stu-001', status: 'present' }
          ]
        }
      });
      assert.equal(cancelledRes.status, 400);
      assert.equal(cancelledRes.body.code, 'SESSION_CANCELLED');
    });
  });

  describe('4. Individual Corrections & Audit Logging', () => {
    let testSessionId;

    before(async () => {
      const createRes = await apiRequest('/api/v1/attendance/sessions/get-or-create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          date: '2026-10-26',
          topic: 'Audit Test Session'
        }
      });
      testSessionId = createRes.body.session.id;

      // Mark stu-rohan as absent initially
      await apiRequest(`/api/v1/attendance/sessions/${testSessionId}/mark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          records: [{ studentId: 'stu-rohan', status: 'absent', remarks: 'Not in class' }],
          reason: 'Initial mark'
        }
      });
    });

    test('POST /api/v1/attendance/sessions/:sessionId/mark - corrects status and creates audit log', async () => {
      // Individual correction: Parent provided medical certificate, change to excused
      const correctRes = await apiRequest(`/api/v1/attendance/sessions/${testSessionId}/mark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          records: [{ studentId: 'stu-rohan', status: 'excused', remarks: 'Medical certificate submitted' }],
          reason: 'Parent submitted doctor note'
        }
      });
      assert.equal(correctRes.status, 200);

      // Verify audit log exists
      const auditLog = db.prepare(`
        SELECT * FROM attendance_audit_logs
        WHERE session_id = ? AND student_id = ? AND previous_status = 'absent' AND new_status = 'excused'
      `).get(testSessionId, 'stu-rohan');

      assert.ok(auditLog, 'Audit log must record the transition from absent to excused');
      assert.equal(auditLog.change_reason, 'Parent submitted doctor note');
    });

    test('GET /api/v1/attendance/audit-logs - queries audit trail', async () => {
      const logsRes = await apiRequest(`/api/v1/attendance/audit-logs?sessionId=${testSessionId}`, {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      assert.equal(logsRes.status, 200);
      assert.ok(Array.isArray(logsRes.body.logs));
      assert.ok(logsRes.body.logs.length > 0);
    });
  });

  describe('5. Real Attendance Calculation & Exclusion of Cancelled / Future Sessions', () => {
    test('GET /api/v1/attendance/students/:studentId/summary - computes real percentage from completed sessions only', async () => {
      const summaryRes = await apiRequest('/api/v1/attendance/students/stu-001/summary', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(summaryRes.status, 200);
      const summary = summaryRes.body.summary;
      assert.ok(summary);
      assert.ok(typeof summary.percentage === 'number');
      assert.ok(summary.totalCompletedSessions >= 5);
      assert.ok(summary.attended >= 5);

      // Verify that cancelled session (ses-7a-cancelled) is NOT in recentRecords
      const recentSessionIds = summaryRes.body.recentRecords.map(r => r.session_id);
      assert.ok(!recentSessionIds.includes('ses-7a-cancelled'), 'Cancelled sessions must be excluded');

      // Verify that future session (ses-7a-future) is NOT in recentRecords
      assert.ok(!recentSessionIds.includes('ses-7a-future'), 'Future sessions must be excluded');
    });

    test('GET /api/v1/attendance/students/:studentId/summary - excludes excused leaves from percentage penalty', async () => {
      const summaryRes = await apiRequest('/api/v1/attendance/students/stu-rohan/summary', {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      assert.equal(summaryRes.status, 200);
      const summary = summaryRes.body.summary;

      // Formula: attended / (attended + absent) * 100
      const expectedEligible = summary.attended + summary.absent;
      assert.equal(summary.eligible, expectedEligible);
      const expectedPercent = Math.round((summary.attended / expectedEligible) * 100);
      assert.equal(summary.percentage, expectedPercent);
    });
  });

  describe('6. Parent & Student Child Ownership Access Control', () => {
    test('GET /api/v1/attendance/students/:studentId/summary - 200 for Parent viewing own linked child (stu-001)', async () => {
      const res = await apiRequest('/api/v1/attendance/students/stu-001/summary', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.student.id, 'stu-001');
    });

    test('GET /api/v1/attendance/students/:studentId/summary - 403 for Parent attempting to view unlinked child', async () => {
      // Find a student not belonging to par-001
      let otherStudent = db.prepare("SELECT id FROM students WHERE guardian_id != 'par-001'").get();
      if (!otherStudent) {
        const otherUserId = `usr-other-${Date.now()}`;
        db.prepare("INSERT INTO users (id, email, name, role) VALUES (?, ?, 'Other Parent', 'parent')").run(
          otherUserId, `other-${Date.now()}@example.com`
        );
        const otherGuardianId = `par-other-${Date.now()}`;
        db.prepare("INSERT INTO guardians (id, user_id) VALUES (?, ?)").run(otherGuardianId, otherUserId);
        const otherStuId = `stu-other-${Date.now()}`;
        db.prepare("INSERT INTO students (id, guardian_id, name, grade, board) VALUES (?, ?, 'Other Child', 7, 'CBSE')").run(
          otherStuId, otherGuardianId
        );
        otherStudent = { id: otherStuId };
      }

      const res = await apiRequest(`/api/v1/attendance/students/${otherStudent.id}/summary`, {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });

    test('GET /api/v1/attendance/students/:studentId/summary - 200 for Student viewing own attendance', async () => {
      const res = await apiRequest('/api/v1/attendance/students/stu-001/summary', {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.student.id, 'stu-001');
    });

    test('GET /api/v1/attendance/students/:studentId/summary - 403 for Student attempting to view another student', async () => {
      const res = await apiRequest('/api/v1/attendance/students/stu-diya/summary', {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });
  });

  describe('7. Monthly & Batch-Wise Attendance Reporting', () => {
    test('GET /api/v1/attendance/reports/monthly - aggregates completed sessions by month', async () => {
      const res = await apiRequest('/api/v1/attendance/reports/monthly', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.report));
      assert.ok(res.body.report.length > 0);
      const october = res.body.report.find(r => r.month === '2026-10');
      assert.ok(october, 'October 2026 report must exist');
      assert.ok(october.sessionsHeld > 0);
      assert.ok(typeof october.attendancePercent === 'number');
    });

    test('GET /api/v1/attendance/reports/batches - aggregates by batch with student metrics', async () => {
      const res = await apiRequest('/api/v1/attendance/reports/batches', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.report));
      const batch7a = res.body.report.find(b => b.batchId === 'batch-7a-cbse-math');
      assert.ok(batch7a, 'Batch 7-A must be present in report');
      assert.ok(batch7a.enrolledCount >= 5);
      assert.ok(batch7a.completedSessionsCount > 0);
      assert.ok(typeof batch7a.batchAttendancePercent === 'number');
      assert.ok(Array.isArray(batch7a.students));
      assert.ok(batch7a.students.length >= 5);
    });
  });

});
