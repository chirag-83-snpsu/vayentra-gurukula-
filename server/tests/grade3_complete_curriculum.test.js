import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../index.js';
import { db } from '../db/database.js';
import { GRADE3_CURRICULUM } from '../data/grade3Curriculum.js';
import { seedAndPublishGrade1Curriculum } from '../services/seedAndPublishGrade1Curriculum.js';
import { seedAndPublishGrade2Curriculum } from '../services/seedAndPublishGrade2Curriculum.js';
import { seedAndPublishGrade3Curriculum } from '../services/seedAndPublishGrade3Curriculum.js';

let server;
let base;
let adminToken;
let teacherToken;
let parentToken;
let student3Token;
let student1Token;
let student2Token;

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

test('Class 3 Complete Curriculum & Platform Generalization Suite', async (t) => {
  seedAndPublishGrade1Curriculum(db);
  seedAndPublishGrade2Curriculum(db);
  seedAndPublishGrade3Curriculum(db);
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      base = 'http://127.0.0.1:' + server.address().port;
      resolve();
    });
  });

  [adminToken, teacherToken, parentToken, student3Token, student1Token, student2Token] = await Promise.all([
    login('admin@vayentra.org'),
    login('teacher@vayentra.org'),
    login('guardian@vayentra.org'),
    login('student.grade3@vayentra.org'),
    login('student.grade1@vayentra.org'),
    login('student.grade2@vayentra.org')
  ]);

  await t.test('1. Database schema & publication: Class 3 tracks, subjects and units', () => {
    const tracks = db.prepare('SELECT id, board, grade, catalogue_status FROM one_curriculum_tracks WHERE grade=3').all();
    assert.equal(tracks.length, 2, 'Should have 2 tracks (CBSE and STATE)');
    assert.ok(tracks.every((tr) => tr.catalogue_status === 'verified'), 'Both tracks must be verified');

    const subjects = db.prepare(`
      SELECT s.subject_title, t.board, COUNT(ch.id) AS ch_count
      FROM one_subjects s
      JOIN one_curriculum_tracks t ON t.id = s.track_id
      JOIN one_chapters ch ON ch.subject_id = s.id
      WHERE t.grade = 3
      GROUP BY s.subject_title, t.board
    `).all();

    assert.ok(subjects.length >= 14, 'Should have at least 7 subjects each for CBSE and STATE');

    const expectedSubjects = [
      'English',
      'Mathematics',
      'Hindi',
      'Kannada',
      'Environmental Studies',
      'Vayentra Original: AI & Digital Thinking',
      'Vayentra Original: Financial Literacy & Money Management'
    ];

    for (const board of ['CBSE', 'STATE']) {
      for (const subj of expectedSubjects) {
        const found = subjects.find((s) => s.board === board && s.subject_title === subj);
        assert.ok(found, `Missing subject ${subj} for board ${board}`);
        assert.ok(found.ch_count >= 3, `Subject ${subj} must have at least 3 chapters`);
      }
    }

    const unitsCount = db.prepare('SELECT COUNT(*) AS c FROM one_foundation_units WHERE grade=3 AND status=\'published\'').get().c;
    assert.ok(unitsCount >= 80, `Expected at least 80 published Class 3 units, found ${unitsCount}`);

    const questionsCount = db.prepare(`
      SELECT COUNT(*) AS c FROM one_foundation_questions fq
      JOIN one_foundation_units fu ON fu.id = fq.unit_id
      WHERE fu.grade=3
    `).get().c;
    assert.ok(questionsCount >= unitsCount * 4, `Expected at least 4 questions per unit, found ${questionsCount}`);
  });

  await t.test('2. Longitudinal onboarding: Class 3 learner profile and verified subject spaces', async () => {
    const r = await api('/api/v1/one-onboarding/learner/me', student3Token);
    assert.equal(r.status, 200);
    assert.equal(r.body.learner.studentName, 'Kabir Patel');
    assert.equal(r.body.learner.currentYear.grade, 3);
    assert.equal(r.body.learner.currentYear.board, 'CBSE');
    assert.equal(r.body.learner.entitlementStatus, 'enabled');
    assert.equal(r.body.learner.subjects.length, 7, 'Class 3 learner must see all 7 verified subjects');

    const math = r.body.learner.subjects.find((s) => s.name === 'Mathematics');
    assert.ok(math);
    assert.ok(math.approved_chapters >= 8);
    assert.ok(math.published_concepts >= 8);
  });

  await t.test('3. Grade isolation and RBAC security boundaries', async () => {
    // Class 1 student blocked from Class 3
    const g1OnG3 = await api('/api/v1/grade3/me/catalogue', student1Token);
    assert.equal(g1OnG3.status, 403);
    assert.equal(g1OnG3.body.code, 'CLASS3_ENROLMENT_REQUIRED');

    // Class 2 student blocked from Class 3
    const g2OnG3 = await api('/api/v1/grade3/me/catalogue', student2Token);
    assert.equal(g2OnG3.status, 403);
    assert.equal(g2OnG3.body.code, 'CLASS3_ENROLMENT_REQUIRED');

    // Class 3 student blocked from Class 1
    const g3OnG1 = await api('/api/v1/grade1/me/catalogue', student3Token);
    assert.equal(g3OnG1.status, 403);
    assert.equal(g3OnG1.body.code, 'CLASS1_ENROLMENT_REQUIRED');

    // Class 3 student blocked from Class 2
    const g3OnG2 = await api('/api/v1/grade2/me/catalogue', student3Token);
    assert.equal(g3OnG2.status, 403);
    assert.equal(g3OnG2.body.code, 'CLASS2_ENROLMENT_REQUIRED');

    // Unauthenticated access blocked
    const unauth = await api('/api/v1/grade3/me/catalogue', null);
    assert.equal(unauth.status, 401);
  });

  await t.test('4. Class 3 learning catalogue, lesson retrieval, and formative assessment attempt', async () => {
    const catRes = await api('/api/v1/grade3/me/catalogue', student3Token);
    assert.equal(catRes.status, 200);
    assert.equal(catRes.body.access, 'pilot_or_entitled');
    assert.equal(catRes.body.catalogue.grade, 3);
    assert.equal(catRes.body.catalogue.subjects.length, 7);

    // Pick a lesson from Mathematics
    const maths = catRes.body.catalogue.subjects.find((s) => s.name === 'Mathematics');
    assert.ok(maths);
    assert.ok(maths.chapters[0].units.length > 0);
    const unitId = maths.chapters[0].units[0].id;

    // Fetch lesson
    const lessonRes = await api(`/api/v1/grade3/me/units/${encodeURIComponent(unitId)}`, student3Token);
    assert.equal(lessonRes.status, 200);
    assert.ok(lessonRes.body.lesson.title);
    assert.ok(lessonRes.body.lesson.story);
    assert.ok(lessonRes.body.lesson.homeActivity);
    assert.equal(lessonRes.body.lesson.questions.length, 4);

    // Submit practice answers
    const idemKey = 'g3-test-practice-' + Date.now();
    const attemptRes = await api('/api/v1/grade3/me/attempts', student3Token, 'POST', {
      unitId,
      idempotencyKey: idemKey,
      answers: [0, 0, 0, 0]
    });

    assert.equal(attemptRes.status, 201);
    assert.equal(attemptRes.body.total, 4);
    assert.equal(attemptRes.body.feedback.length, 4);
    assert.equal(attemptRes.body.replayed, false);

    // Idempotency check
    const replayRes = await api('/api/v1/grade3/me/attempts', student3Token, 'POST', {
      unitId,
      idempotencyKey: idemKey,
      answers: [0, 0, 0, 0]
    });
    assert.equal(replayRes.status, 200);
    assert.equal(replayRes.body.replayed, true);
  });

  await t.test('5. Multilingual Unicode integrity: Hindi (Devanagari) & Kannada scripts', async () => {
    const catRes = await api('/api/v1/grade3/me/catalogue', student3Token);
    
    // Hindi
    const hindi = catRes.body.catalogue.subjects.find((s) => s.name === 'Hindi');
    assert.ok(hindi);
    const hindiUnit = hindi.chapters[0].units[0];
    const hindiLesson = await api(`/api/v1/grade3/me/units/${encodeURIComponent(hindiUnit.id)}`, student3Token);
    assert.equal(hindiLesson.status, 200);
    assert.match(hindiLesson.body.lesson.title, /[\u0900-\u097F]/, 'Hindi lesson title must contain Devanagari script');
    assert.match(hindiLesson.body.lesson.story, /[\u0900-\u097F]/, 'Hindi lesson story must contain Devanagari script');

    // Kannada
    const kannada = catRes.body.catalogue.subjects.find((s) => s.name === 'Kannada');
    assert.ok(kannada);
    const kannadaUnit = kannada.chapters[0].units[0];
    const kannadaLesson = await api(`/api/v1/grade3/me/units/${encodeURIComponent(kannadaUnit.id)}`, student3Token);
    assert.equal(kannadaLesson.status, 200);
    assert.match(kannadaLesson.body.lesson.title, /[\u0C80-\u0CFF]/, 'Kannada lesson title must contain Kannada script');
    assert.match(kannadaLesson.body.lesson.story, /[\u0C80-\u0CFF]/, 'Kannada lesson story must contain Kannada script');
  });

  await t.test('6. Admin curriculum matrix and 1-click publishing action', async () => {
    // Admin matrix endpoint
    const matrixRes = await api('/api/v1/admin/curriculum/matrix?grade=3', adminToken);
    assert.equal(matrixRes.status, 200);
    assert.ok(matrixRes.body.summary);
    assert.ok(matrixRes.body.summary.totalChapters > 0);
    assert.ok(matrixRes.body.matrix.length > 0);

    const firstItem = matrixRes.body.matrix[0];
    assert.equal(firstItem.class, 3);
    assert.ok(firstItem.subject);
    assert.ok(firstItem.chapterTitle);
    assert.ok(firstItem.assessmentReadiness);

    // Test 1-click publishing action on an existing chapter
    const pubRes = await api('/api/v1/admin/curriculum/publish-chapter', adminToken, 'POST', {
      chapterId: firstItem.chapterId,
      academicReviewReference: 'ACAD-VERIFY-TEST-PUBLISH'
    });
    assert.equal(pubRes.status, 200);
    assert.equal(pubRes.body.success, true);
    assert.equal(pubRes.body.chapter.publicationStatus, 'published');
  });

  await t.test('7. Guardian-supervised access to linked Class 3 student', async () => {
    const parentCat = await api('/api/v1/grade3/guardian/stu-g3-001/catalogue', parentToken);
    assert.equal(parentCat.status, 200);
    assert.equal(parentCat.body.learner.grade, 3);
    assert.equal(parentCat.body.catalogue.subjects.length, 7);

    // Blocked when requesting alien unlinked student
    const alienRes = await api('/api/v1/grade3/guardian/stu-alien-999/catalogue', parentToken);
    assert.equal(alienRes.status, 403);
    assert.equal(alienRes.body.code, 'LEARNER_OWNERSHIP_REQUIRED');
  });

  server.close();
});
