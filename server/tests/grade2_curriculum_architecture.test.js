import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../index.js';
import { db } from '../db/database.js';
import { GRADE2_CURRICULUM } from '../data/grade2Curriculum.js';
import { seedAndPublishGrade2Curriculum } from '../services/seedAndPublishGrade2Curriculum.js';

let server;
let base;
let adminToken;
let teacherToken;
let parentToken;
let student2Token;
let student1Token;

async function api(path, token, method = 'GET', payload = null) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: payload ? JSON.stringify(payload) : undefined
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function login(email) {
  const r = await api('/api/v1/auth/login', null, 'POST', {
    email,
    password: 'Gurukula@2026'
  });
  assert.equal(r.status, 200, `Login failed for ${email}: ` + JSON.stringify(r.body));
  return r.body.token;
}

test('Class 2 Curriculum Architecture & Full Integration Suite', async (t) => {
  seedAndPublishGrade2Curriculum(db);
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      base = 'http://127.0.0.1:' + server.address().port;
      resolve();
    });
  });

  [adminToken, teacherToken, parentToken, student2Token, student1Token] = await Promise.all([
    login('admin@vayentra.org'),
    login('teacher@vayentra.org'),
    login('guardian@vayentra.org'),
    login('student.grade2@vayentra.org'),
    login('student.grade1@vayentra.org')
  ]);

  await t.test('1. Database schema: Class 2 curriculum tracks and subjects for CBSE & State Board', () => {
    const tracks = db.prepare("SELECT id, board, grade, catalogue_status FROM one_curriculum_tracks WHERE grade=2").all();
    assert.equal(tracks.length, 2, 'Should have 2 tracks (CBSE and STATE)');
    assert.ok(tracks.every(tr => tr.catalogue_status === 'verified'), 'Both tracks must be verified');

    const cbseTrack = tracks.find(tr => tr.board === 'CBSE');
    const stateTrack = tracks.find(tr => tr.board === 'STATE');

    const cbseSubjects = db.prepare("SELECT subject_title FROM one_subjects WHERE track_id=?").all(cbseTrack.id).map(s => s.subject_title);
    const stateSubjects = db.prepare("SELECT subject_title FROM one_subjects WHERE track_id=?").all(stateTrack.id).map(s => s.subject_title);

    // CBSE must have 6 subjects including Hindi
    assert.ok(cbseSubjects.includes('English'));
    assert.ok(cbseSubjects.includes('Mathematics'));
    assert.ok(cbseSubjects.includes('Hindi'));
    assert.ok(cbseSubjects.includes('Environmental Studies'));
    assert.ok(cbseSubjects.includes('Vayentra Original: AI & Digital Thinking'));
    assert.ok(cbseSubjects.includes('Vayentra Original: Financial Literacy & Money Management'));

    // STATE must have 6 subjects including Kannada
    assert.ok(stateSubjects.includes('English'));
    assert.ok(stateSubjects.includes('Mathematics'));
    assert.ok(stateSubjects.includes('Kannada'));
    assert.ok(stateSubjects.includes('Environmental Studies'));
    assert.ok(stateSubjects.includes('Vayentra Original: AI & Digital Thinking'));
    assert.ok(stateSubjects.includes('Vayentra Original: Financial Literacy & Money Management'));
  });

  await t.test('2. Student authentication: Dhruv Rao (student.grade2@vayentra.org) loads Class 2 CBSE catalogue', async () => {
    const res = await api('/api/v1/grade2/me/catalogue', student2Token);
    assert.equal(res.status, 200);
    assert.equal(res.body.learner.grade, 2);
    assert.equal(res.body.learner.board, 'CBSE');
    assert.equal(res.body.access, 'pilot_or_entitled');

    const subjs = res.body.catalogue.subjects;
    assert.equal(subjs.length, 7, 'Must present all 7 subjects including Kannada');
    assert.ok(subjs.some(s => s.name === 'Hindi'), 'CBSE syllabus includes Hindi');
    assert.ok(subjs.some(s => s.name === 'Kannada'), 'CBSE syllabus includes Kannada');
  });

  await t.test('3. Guardian preview: Guardian views Ananya Varma (stu-002, Class 2 Karnataka State)', async () => {
    const res = await api('/api/v1/grade2/guardian/stu-002/catalogue', parentToken);
    assert.equal(res.status, 200);
    assert.equal(res.body.learner.grade, 2);
    assert.equal(res.body.learner.board, 'STATE');

    const subjs = res.body.catalogue.subjects;
    assert.equal(subjs.length, 6, 'State board must present 6 subjects');
    assert.ok(subjs.some(s => s.name === 'Kannada'), 'Karnataka State syllabus includes Kannada');
    assert.ok(!subjs.some(s => s.name === 'Hindi'), 'State syllabus here focuses on Kannada');
  });

  await t.test('4. Security Boundary: Class 1 student cannot access Class 2 catalogue endpoint', async () => {
    const res = await api('/api/v1/grade2/me/catalogue', student1Token);
    assert.equal(res.status, 403, 'Grade 1 student cannot access Grade 2 endpoint');
    assert.equal(res.body.code, 'CLASS2_ENROLMENT_REQUIRED');
  });

  await t.test('5. Practice exercise & server-side assessment check', async () => {
    // Dhruv takes English Chapter 1: My Bicycle
    const catRes = await api('/api/v1/grade2/me/catalogue', student2Token);
    const engSub = catRes.body.catalogue.subjects.find(s => s.name === 'English');
    const unitId = engSub.chapters[0].units[0].id;

    const unitRes = await api('/api/v1/grade2/me/units/' + unitId, student2Token);
    assert.equal(unitRes.status, 200);
    assert.ok(unitRes.body.lesson.title.includes('Bicycle'));
    assert.equal(unitRes.body.lesson.questions.length, 4);

    const idempotencyKey = 'g2-test-key-' + Date.now();
    const submitRes = await api('/api/v1/grade2/me/attempts', student2Token, 'POST', {
      unitId,
      idempotencyKey,
      answers: [1, 0, 0, 0] // Correct answers for Ch 1
    });

    assert.equal(submitRes.status, 201);
    assert.equal(submitRes.body.correct, 4);
    assert.equal(submitRes.body.total, 4);
    assert.equal(submitRes.body.replayed, false);

    // Replay attempt with same idempotency key
    const replayRes = await api('/api/v1/grade2/me/attempts', student2Token, 'POST', {
      unitId,
      idempotencyKey,
      answers: [1, 0, 0, 0]
    });
    assert.equal(replayRes.status, 200);
    assert.equal(replayRes.body.replayed, true);
  });

  await t.test('6. Teacher mastery tracking for Class 2 concept', async () => {
    const postRes = await api('/api/v1/grade2/teacher/mastery', teacherToken, 'POST', {
      studentId: 'stu-g2-001',
      conceptId: 'one-g2-cbse-bicycle-rhyme-parts',
      mastery: 'teacher_confirmed'
    });
    assert.equal(postRes.status, 200);
    assert.equal(postRes.body.mastery, 'teacher_confirmed');

    const getRes = await api('/api/v1/grade2/teacher/mastery/stu-g2-001', teacherToken);
    assert.equal(getRes.status, 200);
    assert.ok(getRes.body.mastery.some(m => m.concept_id === 'one-g2-cbse-bicycle-rhyme-parts' && m.mastery === 'teacher_confirmed'));
  });

  await t.test('7. Regression check: Class 1 functionality remains completely unharmed', async () => {
    const c1Res = await api('/api/v1/grade1/me/catalogue', student1Token);
    assert.equal(c1Res.status, 200);
    assert.equal(c1Res.body.learner.grade, 1);
    assert.ok(c1Res.body.catalogue.subjects.length > 0);
  });

  if (server) await new Promise((res) => server.close(res));
});
