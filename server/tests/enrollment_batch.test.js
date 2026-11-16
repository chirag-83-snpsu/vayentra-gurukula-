import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../index.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
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

describe('Phase 2: Student Enrollment and Batch Management Suite', () => {
  let adminToken;
  let parentToken;
  let teacherToken;
  let studentToken;

  let createdStudentId;
  let createdTeacherId;
  let batchId1;
  let batchId2;

  before(async () => {
    // Acquire tokens for role authorization testing
    const adminRes = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'admin@vayentra.org', password: 'Gurukula@2026' }
    });
    adminToken = adminRes.body.token;

    const parentRes = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'guardian@vayentra.org', password: 'Gurukula@2026' }
    });
    parentToken = parentRes.body.token;

    const teacherRes = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'teacher@vayentra.org', password: 'Gurukula@2026' }
    });
    teacherToken = teacherRes.body.token;

    const studentRes = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'student@vayentra.org', password: 'Gurukula@2026' }
    });
    studentToken = studentRes.body.token;
  });

  describe('1. Role Authorization Boundaries for Admin Portal', () => {
    test('GET /api/v1/admin/students - 401 without Bearer token', async () => {
      const res = await apiRequest('/api/v1/admin/students');
      assert.equal(res.status, 401);
    });

    test('GET /api/v1/admin/students - 403 for Parent role', async () => {
      const res = await apiRequest('/api/v1/admin/students', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 403);
    });

    test('GET /api/v1/admin/students - 403 for Teacher role', async () => {
      const res = await apiRequest('/api/v1/admin/students', {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      assert.equal(res.status, 403);
    });

    test('GET /api/v1/admin/students - 403 for Student role', async () => {
      const res = await apiRequest('/api/v1/admin/students', {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert.equal(res.status, 403);
    });

    test('GET /api/v1/admin/students - 200 for Admin role', async () => {
      const res = await apiRequest('/api/v1/admin/students', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.students));
    });
  });

  describe('2. Student Registration & Guardian Relationship', () => {
    test('POST /api/v1/admin/students - Validates required fields (grade range 1-10)', async () => {
      const res = await apiRequest('/api/v1/admin/students', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { name: 'Invalid Grade Student', grade: 12, board: 'CBSE' }
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.code, 'VALIDATION_ERROR');
    });

    test('POST /api/v1/admin/students - Validates board type (CBSE, STATE_KARNATAKA, ICSE)', async () => {
      const res = await apiRequest('/api/v1/admin/students', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { name: 'Invalid Board Student', grade: 8, board: 'CAMBRIDGE' }
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.code, 'VALIDATION_ERROR');
    });

    test('POST /api/v1/admin/students - Registers student with atomic guardian linking and unique IDs', async () => {
      const res = await apiRequest('/api/v1/admin/students', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Pooja Hegde',
          grade: 8,
          board: 'STATE_KARNATAKA',
          medium: 'Kannada',
          guardianName: 'Suresh Hegde',
          guardianEmail: 'suresh.hegde@gurukula.in',
          guardianPhone: '+91 98450 88888',
          dob: '2012-05-14',
          notes: 'Interested in Mental Maths & Kannada literature'
        }
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.student.id.startsWith('stu-'));
      assert.ok(res.body.student.enrollment_number.startsWith('VG-2026-'));
      assert.equal(res.body.student.grade, 8);
      assert.equal(res.body.student.board, 'STATE_KARNATAKA');
      assert.equal(res.body.student.status, 'active');
      createdStudentId = res.body.student.id;
    });

    test('GET /api/v1/admin/students - Search by name and filters by grade and board', async () => {
      const res = await apiRequest('/api/v1/admin/students?search=Pooja&grade=8&board=STATE_KARNATAKA', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(res.body.students.length >= 1);
      assert.ok(res.body.students.some(s => s.name === 'Pooja Hegde'));
      assert.ok(res.body.students.some(s => s.guardian.name === 'Suresh Hegde'));
    });
  });

  describe('3. Teacher Management & Authorization Safeguards', () => {
    test('POST /api/v1/admin/teachers - Creates certified teacher profile', async () => {
      const uniqueTeacherEmail = `naveen.kumar.${Date.now()}@vayentra.org`;
      const uniquePhone = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await apiRequest('/api/v1/admin/teachers', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Naveen Kumar, B.Ed.',
          email: uniqueTeacherEmail,
          qualification: 'M.Sc. Physics, Karnataka TET Certified',
          specialization: 'High School Physics & Experiments',
          phone: uniquePhone
        }
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.teacher.id.startsWith('tch-'));
      createdTeacherId = res.body.teacher.id;
    });

    test('POST /api/v1/admin/batches - Rejects assignment of non-existent teacher (400)', async () => {
      const res = await apiRequest('/api/v1/admin/batches', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Ghost Teacher Batch',
          grade: 9,
          board: 'CBSE',
          subject: 'Physics',
          teacherId: 'tch-ghost-999',
          startTime: '10:00',
          endTime: '11:00',
          daysOfWeek: ['MON', 'WED']
        }
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.code, 'UNAUTHORIZED_TEACHER');
    });
  });

  describe('4. Batch Creation & Schedule Conflict Prevention', () => {
    test('POST /api/v1/admin/batches - Creates primary batch slot', async () => {
      const res = await apiRequest('/api/v1/admin/batches', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Class 8-A · State Board Physics',
          grade: 8,
          board: 'STATE_KARNATAKA',
          subject: 'Science',
          teacherId: createdTeacherId,
          startTime: '17:00',
          endTime: '18:00',
          daysOfWeek: ['MON', 'WED', 'FRI'],
          room: 'Lab-1',
          maxCapacity: 20
        }
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      batchId1 = res.body.batch.id;
    });

    test('POST /api/v1/admin/batches - Prevents teacher schedule conflict on common days (409)', async () => {
      // Proposed batch overlaps with 17:00-18:00 on MON/WED: 17:30-18:30
      const res = await apiRequest('/api/v1/admin/batches', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Class 9-B · Conflicting Physics',
          grade: 9,
          board: 'CBSE',
          subject: 'Physics',
          teacherId: createdTeacherId,
          startTime: '17:30',
          endTime: '18:30',
          daysOfWeek: ['WED', 'FRI'],
          maxCapacity: 20
        }
      });

      assert.equal(res.status, 409);
      assert.equal(res.body.code, 'TEACHER_SCHEDULE_CONFLICT');
    });

    test('POST /api/v1/admin/batches - Allows non-overlapping batch for same teacher', async () => {
      // 18:15-19:15 on MON/WED/FRI (non-overlapping)
      const res = await apiRequest('/api/v1/admin/batches', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Class 9-A · Evening Physics Lab',
          grade: 9,
          board: 'CBSE',
          subject: 'Science',
          teacherId: createdTeacherId,
          startTime: '18:15',
          endTime: '19:15',
          daysOfWeek: ['MON', 'WED', 'FRI'],
          room: 'Lab-2',
          maxCapacity: 25
        }
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      batchId2 = res.body.batch.id;
    });
  });

  describe('5. Student Multi-Batch Enrollment & Conflict Prevention', () => {
    test('POST /api/v1/admin/batches/:batchId/enroll - Enrolls student in Batch 1', async () => {
      const res = await apiRequest(`/api/v1/admin/batches/${batchId1}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { studentId: createdStudentId, notes: 'State board physics scholarship' }
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.enrollment.status, 'active');
    });

    test('POST /api/v1/admin/batches/:batchId/enroll - Rejects duplicate active enrollment in same batch', async () => {
      const res = await apiRequest(`/api/v1/admin/batches/${batchId1}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { studentId: createdStudentId }
      });

      assert.equal(res.status, 409);
      assert.equal(res.body.code, 'ALREADY_ENROLLED');
    });

    test('POST /api/v1/admin/batches/:batchId/enroll - Multi-batch enrollment allowed for non-conflicting batch', async () => {
      // batchId2 is 18:15-19:15, batchId1 is 17:00-18:00
      const res = await apiRequest(`/api/v1/admin/batches/${batchId2}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { studentId: createdStudentId, notes: 'Enrolled in second batch' }
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
    });

    test('GET /api/v1/admin/students/:id - Verifies multiple active batches on single student profile', async () => {
      const res = await apiRequest(`/api/v1/admin/students/${createdStudentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.student.name, 'Pooja Hegde');
      assert.equal(res.body.enrollments.length, 2);
    });

    test('POST /api/v1/admin/batches/:batchId/enroll - Prevents student schedule conflict', async () => {
      // Create a batch that overlaps with Batch 1 (17:15-18:15 on MON)
      const batchRes = await apiRequest('/api/v1/admin/batches', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Clashing English Batch',
          grade: 8,
          board: 'STATE_KARNATAKA',
          subject: 'English',
          startTime: '17:15',
          endTime: '18:15',
          daysOfWeek: ['MON'],
          maxCapacity: 20
        }
      });
      const clashingBatchId = batchRes.body.batch.id;

      // Attempt to enroll Pooja who is already in Batch 1 (17:00-18:00 on MON)
      const res = await apiRequest(`/api/v1/admin/batches/${clashingBatchId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { studentId: createdStudentId }
      });

      assert.equal(res.status, 409);
      assert.equal(res.body.code, 'STUDENT_SCHEDULE_CONFLICT');
    });
  });

  describe('6. Inactive Student Management', () => {
    test('PATCH /api/v1/admin/students/:id/status - Toggles student to inactive', async () => {
      const res = await apiRequest(`/api/v1/admin/students/${createdStudentId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { status: 'inactive' }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'inactive');
    });

    test('POST /api/v1/admin/batches/:batchId/enroll - Prevents inactive student from enrolling', async () => {
      // Create a separate batch
      const bRes = await apiRequest('/api/v1/admin/batches', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Class 8 Art & Culture',
          grade: 8,
          board: 'STATE_KARNATAKA',
          subject: 'Art',
          startTime: '11:00',
          endTime: '12:00',
          daysOfWeek: ['SUN']
        }
      });

      const res = await apiRequest(`/api/v1/admin/batches/${bRes.body.batch.id}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { studentId: createdStudentId }
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.code, 'INACTIVE_STUDENT');
    });

    test('PATCH /api/v1/admin/students/:id/status - Restores student to active', async () => {
      const res = await apiRequest(`/api/v1/admin/students/${createdStudentId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { status: 'active' }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'active');
    });
  });

  describe('7. Batch Transfers & Atomic Reconciliation', () => {
    test('POST /api/v1/admin/batches/:batchId/transfer - Transfers student from Batch 1 to new destination batch', async () => {
      // Create destination batch (Tuesday/Thursday slot)
      const destBatchRes = await apiRequest('/api/v1/admin/batches', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Class 8-C · Weekend Physics',
          grade: 8,
          board: 'STATE_KARNATAKA',
          subject: 'Science',
          startTime: '10:00',
          endTime: '11:30',
          daysOfWeek: ['SAT', 'SUN'],
          maxCapacity: 15
        }
      });
      const destBatchId = destBatchRes.body.batch.id;

      const res = await apiRequest(`/api/v1/admin/batches/${batchId1}/transfer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          studentId: createdStudentId,
          targetBatchId: destBatchId,
          reason: 'Weekend schedule preference requested by guardian'
        }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.fromBatchId, batchId1);
      assert.equal(res.body.toBatch.id, destBatchId);

      // Verify student details reflects transferred status on source and active on target
      const verifyRes = await apiRequest(`/api/v1/admin/students/${createdStudentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const sourceEnr = verifyRes.body.enrollments.find(e => e.batch.id === batchId1);
      const targetEnr = verifyRes.body.enrollments.find(e => e.batch.id === destBatchId);

      assert.equal(sourceEnr.status, 'transferred');
      assert.equal(targetEnr.status, 'active');
    });
  });
});
