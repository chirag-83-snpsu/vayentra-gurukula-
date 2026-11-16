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
let otherParentToken;
let studentToken;

let createdOtherStudentId;
let otherGuardianId;

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

  // Create an isolated secondary parent and student to test boundary & data minimization
  const testSuffix = Date.now().toString(36);
  const otherUserId = `usr-alien-${testSuffix}`;
  otherGuardianId = `par-alien-${testSuffix}`;
  createdOtherStudentId = `stu-alien-${testSuffix}`;

  db.prepare(`
    INSERT INTO users (id, email, name, role, password_hash)
    VALUES (?, ?, ?, 'parent', ?)
  `).run(otherUserId, `otherparent-${testSuffix}@vayentra.org`, 'Other Guardian', '$2a$10$wT8K5qI47sC3k9U3g.U4v.N8g6sX/G/1c0r.x0Xz6m9Q6Y7Q0Q1.');

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  db.prepare(`
    INSERT INTO guardians (id, user_id, parent_pin, emergency_phone)
    VALUES (?, ?, '4321', ?)
  `).run(otherGuardianId, otherUserId, `+91 98450 ${randomDigits}1`);

  db.prepare(`
    INSERT INTO students (id, name, grade, board, enrollment_number, guardian_id, status)
    VALUES (?, 'Alien Child', 6, 'CBSE', ?, ?, 'active')
  `).run(createdOtherStudentId, `VG-2026-${randomDigits}`, otherGuardianId);

  // Login as other parent
  const otherLoginRes = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: `otherparent-${testSuffix}@vayentra.org`, password: 'Gurukula@2026' }
  });
  otherParentToken = otherLoginRes.body?.token;
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

describe('Phase 5: Parent Communication and Reporting Suite', () => {

  describe('1. Parent Dashboard Authentication & Child Authorization Boundaries', () => {
    test('GET /api/v1/parent/dashboard/:studentId - Rejects unauthenticated request (401)', async () => {
      const res = await apiRequest('/api/v1/parent/dashboard/stu-001');
      assert.equal(res.status, 401);
      assert.equal(res.body.code, 'UNAUTHORIZED');
    });

    test('GET /api/v1/parent/dashboard/:studentId - Rejects Student role trying to access parent dashboard (403)', async () => {
      const res = await apiRequest('/api/v1/parent/dashboard/stu-001', {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });

    test('GET /api/v1/parent/dashboard/:studentId - Rejects Parent attempting to view unlinked child (403)', async () => {
      // parentToken is par-001, createdOtherStudentId belongs to otherGuardianId
      const res = await apiRequest(`/api/v1/parent/dashboard/${createdOtherStudentId}`, {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });

    test('GET /api/v1/parent/dashboard/:studentId - Allows Parent viewing their own linked child (200)', async () => {
      const res = await apiRequest('/api/v1/parent/dashboard/stu-001', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.student.id, 'stu-001');
      assert.equal(res.body.student.name, 'Aarav Varma');
    });

    test('GET /api/v1/parent/dashboard/:studentId - Allows Administrator viewing any student dashboard (200)', async () => {
      const res = await apiRequest(`/api/v1/parent/dashboard/${createdOtherStudentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.student.id, createdOtherStudentId);
    });

    test('GET /api/v1/parent/dashboard/:studentId - Returns 404 for non-existent student', async () => {
      const res = await apiRequest('/api/v1/parent/dashboard/stu-does-not-exist', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 404);
      assert.equal(res.body.code, 'NOT_FOUND');
    });
  });

  describe('2. Unified Dashboard Aggregation Integrity', () => {
    test('GET /api/v1/parent/dashboard/:studentId - Returns attendance, today topic, homework, and weekly tests', async () => {
      const res = await apiRequest('/api/v1/parent/dashboard/stu-001', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });

      assert.equal(res.status, 200);
      const data = res.body;

      // 1. Student details
      assert.ok(data.student);
      assert.equal(data.student.id, 'stu-001');
      assert.equal(data.student.grade, 7);
      assert.equal(data.student.board, 'CBSE');
      assert.ok(data.student.enrollmentNumber);

      // 2. Enrolled batches
      assert.ok(Array.isArray(data.enrolledBatches));
      assert.ok(data.enrolledBatches.length > 0);

      // 3. Real attendance calculations
      assert.ok(data.attendanceSummary);
      assert.ok(typeof data.attendanceSummary.totalCompletedSessions === 'number');
      assert.ok(typeof data.attendanceSummary.attended === 'number');
      assert.ok(typeof data.attendanceSummary.percentage === 'number');
      assert.ok(Array.isArray(data.attendanceSummary.recentHistory));

      // 4. Learning topic
      assert.ok(data.todaysTopic);
      assert.ok(data.todaysTopic.topic);
      assert.ok(data.todaysTopic.batchName);

      // 5. Pending homework
      assert.ok(Array.isArray(data.pendingHomework));
      assert.ok(data.pendingHomework.length > 0);
      const hw1 = data.pendingHomework[0];
      assert.ok(hw1.title);
      assert.ok(hw1.dueDate);
      assert.ok(typeof hw1.isOverdue === 'boolean');

      // 6. Weekly test results
      assert.ok(Array.isArray(data.weeklyTests));
      assert.ok(data.weeklyTests.length > 0);
      const test1 = data.weeklyTests[0];
      assert.ok(test1.title);
      assert.ok(typeof test1.percentage === 'number');
      assert.ok(Array.isArray(test1.conceptsTested));

      // 7. Teacher feedback
      assert.ok(Array.isArray(data.teacherFeedback));

      // 8. Upcoming sessions and notices
      assert.ok(Array.isArray(data.upcomingSessions));
      assert.ok(Array.isArray(data.notices));
      assert.ok(data.notices.length > 0);
    });
  });

  describe('3. Guardian Communication Preferences Management', () => {
    test('GET /api/v1/parent/preferences - Retrieves default communication preferences', async () => {
      const res = await apiRequest('/api/v1/parent/preferences', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.preferences);
      assert.equal(typeof res.body.preferences.notifyWhatsApp, 'boolean');
      assert.equal(typeof res.body.preferences.notifySms, 'boolean');
      assert.equal(typeof res.body.preferences.notifyEmail, 'boolean');
      assert.ok(['English', 'Kannada'].includes(res.body.preferences.preferredLanguage));
      assert.equal(typeof res.body.preferences.alertOnAbsence, 'boolean');
      assert.equal(typeof res.body.preferences.alertOnHomework, 'boolean');
      assert.equal(typeof res.body.preferences.alertOnReports, 'boolean');
    });

    test('PUT /api/v1/parent/preferences - Updates preferences and language to Kannada', async () => {
      const updatePayload = {
        notifyWhatsApp: true,
        notifySms: false,
        notifyEmail: true,
        preferredLanguage: 'Kannada',
        alertOnAbsence: true,
        alertOnHomework: true,
        alertOnReports: false
      };

      const res = await apiRequest('/api/v1/parent/preferences', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${parentToken}` },
        body: updatePayload
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.preferences.preferredLanguage, 'Kannada');
      assert.equal(res.body.preferences.notifySms, false);
      assert.equal(res.body.preferences.alertOnReports, false);

      // Verify retrieval reflects saved values
      const getRes = await apiRequest('/api/v1/parent/preferences', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(getRes.body.preferences.preferredLanguage, 'Kannada');
      assert.equal(getRes.body.preferences.notifySms, false);
    });

    test('PUT /api/v1/parent/preferences - Resets preferences to English for subsequent tests', async () => {
      const res = await apiRequest('/api/v1/parent/preferences', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${parentToken}` },
        body: {
          notifyWhatsApp: true,
          notifySms: true,
          notifyEmail: true,
          preferredLanguage: 'English',
          alertOnAbsence: true,
          alertOnHomework: true,
          alertOnReports: true
        }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.preferences.preferredLanguage, 'English');
      assert.equal(res.body.preferences.notifySms, true);
    });
  });

  describe('4. Attendance Alerts Triggering & Truthful Delivery State', () => {
    test('POST /api/v1/attendance/sessions/:sessionId/mark - Triggers absence alerts only after teacher confirms and saves', async () => {
      // Create session for Batch 7-A on a unique date
      const dateStr = `2026-11-${String(Math.floor(1 + Math.random() * 25)).padStart(2, '0')}`;
      const sesRes = await apiRequest('/api/v1/attendance/sessions/get-or-create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          date: dateStr,
          topic: 'Quadrilateral Angle Sum Property'
        }
      });
      const sessionId = sesRes.body.session.id;

      // Mark stu-001 absent
      const markRes = await apiRequest(`/api/v1/attendance/sessions/${sessionId}/mark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          records: [
            { studentId: 'stu-001', status: 'absent', remarks: 'Unplanned absence' },
            { studentId: 'stu-diya', status: 'present', remarks: '' }
          ],
          reason: 'Daily Roll Call'
        }
      });

      assert.equal(markRes.status, 200);
      assert.equal(markRes.body.success, true);
      assert.ok(markRes.body.alertsQueued >= 1, 'At least 1 alert should be queued for absent student');

      // Check SQLite notifications table directly
      const notifications = db.prepare(`
        SELECT * FROM notifications
        WHERE student_id = 'stu-001' AND template_name = 'attendance_absence'
        ORDER BY id DESC
      `).all();

      assert.ok(notifications.length > 0, 'Notification record must be persisted in SQLite');
      const latestNotif = notifications[0];

      // Verify truthful 'not_sent' state (gateway unconfigured in test environment)
      assert.equal(latestNotif.status, 'not_sent', 'Must show truthful not_sent state');
      assert.ok(
        latestNotif.status_reason.includes('Messaging gateway unconfigured'),
        'Reason must explain unconfigured gateway'
      );
      assert.equal(latestNotif.sent_at, null);

      // Verify approved formal EdTech template text
      assert.ok(latestNotif.message_content.includes('marked ABSENT'));
      assert.ok(latestNotif.message_content.includes('Quadrilateral Angle Sum Property'));
    });
  });

  describe('5. Homework Alerts Triggering', () => {
    test('POST /api/v1/assignments/homework - Triggers homework alert to guardians with truthful status', async () => {
      const hwRes = await apiRequest('/api/v1/assignments/homework', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: {
          batchId: 'batch-7a-cbse-math',
          title: 'Polygon Interior Angles Worksheet',
          subject: 'Mathematics',
          description: 'Solve problems 1 through 10 from NCERT page 45.',
          dueDate: '2026-11-05',
          learningResources: ['NCERT Class 7 Exemplar']
        }
      });

      assert.equal(hwRes.status, 201);
      assert.equal(hwRes.body.success, true);

      // Verify notification in SQLite
      const hwNotifs = db.prepare(`
        SELECT * FROM notifications
        WHERE student_id = 'stu-001' AND template_name = 'homework_assigned'
        ORDER BY id DESC
      `).all();

      assert.ok(hwNotifs.length > 0, 'Homework assigned notification must be recorded');
      assert.equal(hwNotifs[0].status, 'not_sent', 'Truthful status when unconfigured');
      assert.ok(hwNotifs[0].message_content.includes('Polygon Interior Angles Worksheet'));
    });
  });

  describe('6. Notification History & Delivery Audit Log', () => {
    test('GET /api/v1/parent/notifications/:studentId - Rejects unlinked child (403)', async () => {
      const res = await apiRequest(`/api/v1/parent/notifications/${createdOtherStudentId}`, {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });

    test('GET /api/v1/parent/notifications/:studentId - Returns notification history for linked child', async () => {
      const res = await apiRequest('/api/v1/parent/notifications/stu-001', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.notifications));
      assert.ok(res.body.notifications.length > 0);

      const item = res.body.notifications[0];
      assert.ok(item.id);
      assert.ok(item.channel);
      assert.ok(item.templateName);
      assert.ok(item.recipientContact);
      assert.ok(item.messageContent);
      assert.ok(item.status);
    });
  });

  describe('7. Monthly Progress Report Generation from Actual Database Records', () => {
    test('GET /api/v1/parent/reports/monthly/:studentId - Compiles verified report card with cryptographic integrity hash', async () => {
      const res = await apiRequest('/api/v1/parent/reports/monthly/stu-001?month=2026-10', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const rpt = res.body.reportCard;

      assert.ok(rpt);
      assert.equal(rpt.month, '2026-10');
      assert.equal(rpt.student.id, 'stu-001');
      assert.equal(rpt.student.name, 'Aarav Varma');
      assert.equal(rpt.student.grade, 7);

      // Attendance metrics
      assert.ok(rpt.attendance);
      assert.ok(typeof rpt.attendance.totalSessions === 'number');
      assert.ok(typeof rpt.attendance.percentage === 'number');

      // Homework metrics
      assert.ok(rpt.homework);
      assert.ok(typeof rpt.homework.assignedCount === 'number');

      // Assessment metrics
      assert.ok(rpt.assessments);
      assert.ok(Array.isArray(rpt.assessments.records));

      // Pedagogical evaluation
      assert.ok(rpt.pedagogicalEvaluation);
      assert.ok(rpt.pedagogicalEvaluation.overallGrade);
      assert.ok(rpt.pedagogicalEvaluation.facultyRemark);
      assert.ok(rpt.pedagogicalEvaluation.nextPrescription);

      // Cryptographic verification hash
      assert.ok(rpt.verification);
      assert.ok(rpt.verification.tamperEvidentHash);
      assert.ok(rpt.verification.tamperEvidentHash.startsWith('VG-'));
      assert.ok(rpt.verification.tamperEvidentHash.length >= 10);
    });

    test('POST /api/v1/parent/notify/report-card - Dispatches report card alert with truthful delivery status', async () => {
      const res = await apiRequest('/api/v1/parent/notify/report-card', {
        method: 'POST',
        headers: { Authorization: `Bearer ${parentToken}` },
        body: {
          studentId: 'stu-001',
          month: '2026-10',
          attendancePercent: 92,
          averageScore: 94,
          integrityHash: 'VG-A1B2C3D4E5F6',
          channel: 'whatsapp'
        }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.notification);
      assert.equal(res.body.notification.status, 'not_sent');
      assert.ok(res.body.notification.statusReason.includes('Messaging gateway unconfigured'));
    });
  });

  describe('8. Institute Notices Feed', () => {
    test('GET /api/v1/parent/notices - Returns published notices', async () => {
      const res = await apiRequest('/api/v1/parent/notices', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.notices));
      assert.ok(res.body.notices.length >= 3);

      const notice = res.body.notices[0];
      assert.ok(notice.id);
      assert.ok(notice.title);
      assert.ok(notice.category);
      assert.ok(notice.content);
    });
  });

  describe('9. Upstream Telecom Provider Credentials & Gateway Diagnostics', () => {
    test('GET /api/v1/admin/messaging/gateway-status - 403 for non-admin accounts', async () => {
      const res = await apiRequest('/api/v1/admin/messaging/gateway-status', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 403);
    });

    test('GET /api/v1/admin/messaging/gateway-status - 200 for Admin with masked credentials', async () => {
      const res = await apiRequest('/api/v1/admin/messaging/gateway-status', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.gateways);

      const { whatsapp, sms } = res.body.gateways;
      assert.ok(whatsapp);
      assert.equal(typeof whatsapp.configured, 'boolean');
      assert.equal(whatsapp.provider, 'Meta WhatsApp Cloud API (Graph v21.0)');

      assert.ok(sms);
      assert.equal(typeof sms.configured, 'boolean');
      assert.ok(sms.senderId);
      assert.ok(sms.provider.includes('TRAI DLT Compliant'));
    });

    test('POST /api/v1/admin/messaging/test-dispatch - Rejects request without recipientPhone (400)', async () => {
      const res = await apiRequest('/api/v1/admin/messaging/test-dispatch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { channel: 'whatsapp' }
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.code, 'BAD_REQUEST');
    });

    test('POST /api/v1/admin/messaging/test-dispatch - Handles unconfigured gateway truthfully (502)', async () => {
      const res = await apiRequest('/api/v1/admin/messaging/test-dispatch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { channel: 'whatsapp', recipientPhone: '+91 98450 11111' }
      });

      // Without credentials set in test env, returns 502 with truthful gateway explanation
      assert.equal(res.status, 502);
      assert.equal(res.body.code, 'GATEWAY_DISPATCH_ERROR');
      assert.ok(res.body.message.includes('WhatsApp Cloud API credentials'));
    });

    test('Upstream WhatsApp dispatch with sandbox/configured credentials succeeds and logs ID', async () => {
      // Temporarily enable TELECOM_GATEWAY_MOCK to test upstream dispatch flow
      process.env.TELECOM_GATEWAY_MOCK = 'true';
      try {
        const res = await apiRequest('/api/v1/admin/messaging/test-dispatch', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
          body: { channel: 'whatsapp', recipientPhone: '+91 98450 11111' }
        });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(res.body.providerMessageId.startsWith('wamid.'));
        assert.ok(res.body.provider.includes('WhatsApp'));
      } finally {
        delete process.env.TELECOM_GATEWAY_MOCK;
      }
    });

    test('Upstream SMS dispatch with sandbox/configured credentials succeeds and logs ID', async () => {
      process.env.TELECOM_GATEWAY_MOCK = 'true';
      try {
        const res = await apiRequest('/api/v1/admin/messaging/test-dispatch', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
          body: { channel: 'sms', recipientPhone: '+91 98450 11111' }
        });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(res.body.providerMessageId.startsWith('SM'));
        assert.ok(res.body.provider.includes('MSG91'));
      } finally {
        delete process.env.TELECOM_GATEWAY_MOCK;
      }
    });
  });

});
