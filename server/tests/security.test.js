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

describe('Vayentra Gurukula Security & Authorization Suite', () => {
  let adminToken;
  let teacherToken;
  let safeguardingToken;
  let reviewerToken;
  let parentToken;
  let studentToken;

  describe('1. Authentication & Verified Password Login', () => {
    test('POST /api/v1/auth/login - Admin login success', async () => {
      const res = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'admin@vayentra.org', password: 'Gurukula@2026' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'admin');
      assert.ok(res.body.token, 'Token must be issued');
      adminToken = res.body.token;
    });

    test('POST /api/v1/auth/login - Teacher login success', async () => {
      const res = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'teacher@vayentra.org', password: 'Gurukula@2026' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'teacher');
      teacherToken = res.body.token;
    });

    test('POST /api/v1/auth/login - Safeguarding login success', async () => {
      const res = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'safeguarding@vayentra.org', password: 'Gurukula@2026' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'safeguarding');
      safeguardingToken = res.body.token;
    });

    test('POST /api/v1/auth/login - Reviewer login success', async () => {
      const res = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'reviewer@vayentra.org', password: 'Gurukula@2026' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'reviewer');
      reviewerToken = res.body.token;
    });

    test('POST /api/v1/auth/login - Parent login returns guardian & child profiles', async () => {
      const res = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'guardian@vayentra.org', password: 'Gurukula@2026' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'parent');
      assert.ok(res.body.guardian, 'Guardian profile must be hydrated');
      assert.ok(Array.isArray(res.body.children), 'Children must be listed');
      parentToken = res.body.token;
    });

    test('POST /api/v1/auth/login - Student login success', async () => {
      const res = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'student@vayentra.org', password: 'Gurukula@2026' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'student');
      studentToken = res.body.token;
    });

    test('POST /api/v1/auth/login - Rejects invalid password', async () => {
      const res = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'admin@vayentra.org', password: 'WrongPassword!123' }
      });
      assert.equal(res.status, 401);
      assert.equal(res.body.code, 'INVALID_CREDENTIALS');
    });

    test('POST /api/v1/auth/login - Rejects non-existent account', async () => {
      const res = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'ghost@vayentra.org', password: 'AnyPassword' }
      });
      assert.equal(res.status, 401);
      assert.equal(res.body.code, 'INVALID_CREDENTIALS');
    });

    test('POST /api/v1/auth/login - Rejects missing parameters', async () => {
      const res = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'admin@vayentra.org' }
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.code, 'VALIDATION_ERROR');
    });
  });

  describe('2. Session Hydration (GET /api/v1/auth/me)', () => {
    test('GET /api/v1/auth/me - Rejects request with missing token (no insecure fallback)', async () => {
      const res = await apiRequest('/api/v1/auth/me');
      assert.equal(res.status, 401);
      assert.equal(res.body.code, 'UNAUTHORIZED');
    });

    test('GET /api/v1/auth/me - Rejects malformed / counterfeit Bearer token', async () => {
      const res = await apiRequest('/api/v1/auth/me', {
        headers: { Authorization: 'Bearer invalid.fake.token' }
      });
      assert.equal(res.status, 401);
      assert.equal(res.body.code, 'INVALID_TOKEN');
    });

    test('GET /api/v1/auth/me - Successfully hydrates authenticated Admin session', async () => {
      const res = await apiRequest('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, 'admin@vayentra.org');
      assert.equal(res.body.user.role, 'admin');
    });

    test('GET /api/v1/auth/me - Successfully hydrates authenticated Parent session with children', async () => {
      const res = await apiRequest('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, 'guardian@vayentra.org');
      assert.equal(res.body.user.role, 'parent');
      assert.ok(res.body.guardian);
      assert.ok(res.body.children.length > 0);
    });
  });

  describe('3. Role-Based Access Control (RBAC)', () => {
    test('GET /api/v1/safeguarding/cases - Unauthenticated access is blocked (401)', async () => {
      const res = await apiRequest('/api/v1/safeguarding/cases');
      assert.equal(res.status, 401);
    });

    test('GET /api/v1/safeguarding/cases - Parent role cannot access safeguarding vault (403)', async () => {
      const res = await apiRequest('/api/v1/safeguarding/cases', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });

    test('GET /api/v1/safeguarding/cases - Student role cannot access safeguarding vault (403)', async () => {
      const res = await apiRequest('/api/v1/safeguarding/cases', {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });

    test('GET /api/v1/safeguarding/cases - Safeguarding Officer is authorized (200)', async () => {
      const res = await apiRequest('/api/v1/safeguarding/cases', {
        headers: { Authorization: `Bearer ${safeguardingToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
    });

    test('GET /api/v1/safeguarding/cases - Administrator is authorized (200)', async () => {
      const res = await apiRequest('/api/v1/safeguarding/cases', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
    });

    test('POST /api/v1/checkout - Blocked for unauthenticated user (401)', async () => {
      const res = await apiRequest('/api/v1/checkout', {
        method: 'POST',
        body: { planId: 'plan-annual-pro' }
      });
      assert.equal(res.status, 401);
    });

    test('POST /api/v1/checkout - Blocked for Student role (403)', async () => {
      const res = await apiRequest('/api/v1/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: { planId: 'plan-annual-pro' }
      });
      assert.equal(res.status, 403);
    });

    test('POST /api/v1/checkout - Authorized for Parent role (200)', async () => {
      const res = await apiRequest('/api/v1/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${parentToken}` },
        body: { planId: 'plan-annual-pro' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.orderId);
    });
  });

  describe('4. Child Ownership & Boundary Checks', () => {
    test('GET /api/v1/school/practice/flashcards - Blocked without token (401)', async () => {
      const res = await apiRequest('/api/v1/school/practice/flashcards?studentId=stu-001');
      assert.equal(res.status, 401);
    });

    test('GET /api/v1/school/practice/flashcards - Parent allowed for own linked child (200)', async () => {
      const res = await apiRequest('/api/v1/school/practice/flashcards?studentId=stu-001', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
    });

    test('GET /api/v1/school/practice/flashcards - Parent rejected for unlinked child ID (403)', async () => {
      const res = await apiRequest('/api/v1/school/practice/flashcards?studentId=stu-alien-999', {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    });

    test('POST /api/v1/auth/pin/verify - Rejects missing token (401)', async () => {
      const res = await apiRequest('/api/v1/auth/pin/verify', {
        method: 'POST',
        body: { pin: '1234' }
      });
      assert.equal(res.status, 401);
    });

    test('POST /api/v1/auth/pin/verify - Rejects non-parent accounts (403)', async () => {
      const res = await apiRequest('/api/v1/auth/pin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: { pin: '1234' }
      });
      assert.equal(res.status, 403);
    });

    test('POST /api/v1/auth/pin/verify - Rejects incorrect PIN (401)', async () => {
      const res = await apiRequest('/api/v1/auth/pin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${parentToken}` },
        body: { pin: '9999' }
      });
      assert.equal(res.status, 401);
      assert.equal(res.body.authorized, false);
    });

    test('POST /api/v1/auth/pin/verify - Approves correct Parent PIN (200)', async () => {
      const res = await apiRequest('/api/v1/auth/pin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${parentToken}` },
        body: { pin: '1234' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.authorized, true);
    });
  });

  describe('5. Production Security Isolation & Demo Isolation', () => {
    test('POST /api/v1/auth/google - Rejects sandbox identity in production environment', async () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        const res = await apiRequest('/api/v1/auth/google', {
          method: 'POST',
          body: { isDemoSandbox: true }
        });
        assert.equal(res.status, 403);
        assert.equal(res.body.code, 'SANDBOX_PROHIBITED');
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });

    test('POST /api/v1/auth/logout - Session termination endpoint returns 200', async () => {
      const res = await apiRequest('/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });
});
