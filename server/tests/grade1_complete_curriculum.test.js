import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../index.js';
import { db } from '../db/database.js';
import { GRADE1_MATHS_JOYFUL } from '../data/grade1MathsJoyful.js';
import { GRADE1_HINDI_SARANGI } from '../data/grade1HindiSarangi.js';
import { GRADE1_ENGLISH_MRIDANG } from '../data/grade1EnglishMridang.js';
import { seedAndPublishGrade1Curriculum } from '../services/seedAndPublishGrade1Curriculum.js';

let server, baseUrl;

async function requestApi(path, token, method = 'GET', body = null) {
  const res = await fetch(baseUrl + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, body: await res.json() };
}

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test('Class 1 Complete Curriculum Publishing, Verification & API Access Suite', async (t) => {
  // Ensure seed and publication is up to date
  seedAndPublishGrade1Curriculum(db);

  await t.test('1. Joyful Mathematics 13 chapters metadata, questions & scene integrity', () => {
    assert.equal(GRADE1_MATHS_JOYFUL.edition, '2026-27');
    assert.equal(GRADE1_MATHS_JOYFUL.subjectTitle, 'Mathematics');
    assert.equal(GRADE1_MATHS_JOYFUL.textbookName, 'Joyful Mathematics');
    assert.equal(GRADE1_MATHS_JOYFUL.lessons.length, 13, 'Must have all 13 official NCERT Joyful Maths chapters');

    GRADE1_MATHS_JOYFUL.lessons.forEach((l, idx) => {
      assert.equal(l.chapterNumber, idx + 1);
      assert.ok(l.chapterTitle.length > 2);
      assert.ok(l.title.length > 5);
      assert.ok(l.story.length > 50, `Chapter ${idx + 1} story must be substantial`);
      assert.ok(l.objective.length > 15);
      assert.ok(l.activity.length > 10);
      assert.equal(l.questions.length, 4, `Chapter ${idx + 1} must have exactly 4 questions`);
      l.questions.forEach((q) => {
        assert.ok(q.prompt.length > 5);
        assert.ok(q.options.length >= 2);
        assert.ok(q.answerIndex >= 0 && q.answerIndex < q.options.length);
        assert.ok(q.explanation.length > 5);
      });
    });
  });

  await t.test('2. Database verified publication for CBSE Class 1 (6 subjects, 61 chapters)', () => {
    const track = db.prepare("SELECT id FROM one_curriculum_tracks WHERE board='CBSE' AND grade=1 AND edition_year='2026-27'").get();
    assert.ok(track, 'CBSE Grade 1 track must exist');

    const subjects = db.prepare('SELECT id, subject_title, review_status FROM one_subjects WHERE track_id=?').all(track.id);
    assert.equal(subjects.length, 6, 'CBSE Class 1 must have 6 subjects');
    assert.ok(subjects.every(s => s.review_status === 'reviewed'), 'All 6 subjects must be reviewed');

    const english = subjects.find(s => s.subject_title === 'English');
    const hindi = subjects.find(s => s.subject_title === 'Hindi');
    const kannada = subjects.find(s => s.subject_title === 'Kannada');
    const maths = subjects.find(s => s.subject_title === 'Mathematics');
    const ai = subjects.find(s => s.subject_title === 'Vayentra Original: AI & Digital Thinking');
    const money = subjects.find(s => s.subject_title === 'Vayentra Original: Money & Life Skills');

    const checkSubjectChapters = (subjId, expectedCount) => {
      const chs = db.prepare('SELECT id, review_status FROM one_chapters WHERE subject_id=?').all(subjId);
      assert.equal(chs.length, expectedCount, `Expected ${expectedCount} chapters for subject ${subjId}`);
      assert.ok(chs.every(c => c.review_status === 'reviewed'), `All chapters for ${subjId} must be reviewed`);
    };

    checkSubjectChapters(english.id, 9);
    checkSubjectChapters(hindi.id, 19);
    checkSubjectChapters(kannada.id, 4);
    checkSubjectChapters(maths.id, 13);
    checkSubjectChapters(ai.id, 8);
    checkSubjectChapters(money.id, 8);
  });

  await t.test('3. Database verified publication for STATE Class 1 (6 subjects, 23 chapters)', () => {
    const track = db.prepare("SELECT id FROM one_curriculum_tracks WHERE board='STATE' AND grade=1 AND edition_year='2026-27'").get();
    assert.ok(track, 'STATE Grade 1 track must exist');

    const subjects = db.prepare('SELECT id, subject_title, review_status FROM one_subjects WHERE track_id=?').all(track.id);
    assert.equal(subjects.length, 6, 'STATE Class 1 must have 6 subjects');
    assert.ok(subjects.every(s => s.review_status === 'reviewed'), 'All 6 subjects must be reviewed');

    const kannada = subjects.find(s => s.subject_title === 'Kannada');
    const kannadaChs = db.prepare('SELECT id, review_status FROM one_chapters WHERE subject_id=?').all(kannada.id);
    assert.equal(kannadaChs.length, 4, 'Savi Kannada must have 4 chapters');
    assert.ok(kannadaChs.every(c => c.review_status === 'reviewed'));
  });

  await t.test('4. Student Milo Sharma (stu-g1-001) retrieves catalogue with all approved lessons', async () => {
    const loginRes = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'student.grade1@vayentra.org',
      password: 'Gurukula@2026'
    });
    assert.equal(loginRes.status, 200);
    const token = loginRes.body.token;

    const catRes = await requestApi('/api/v1/grade1/me/catalogue', token);
    assert.equal(catRes.status, 200);
    assert.equal(catRes.body.learner.grade, 1);
    assert.equal(catRes.body.learner.board, 'CBSE');
    assert.equal(catRes.body.access, 'pilot_or_entitled');

    const mathsSubj = catRes.body.catalogue.subjects.find(s => s.name === 'Mathematics');
    assert.ok(mathsSubj);
    assert.equal(mathsSubj.plannedChapters, 13);
    assert.ok(mathsSubj.approvedLessons >= 13, `Expected at least 13 approved math lessons, got ${mathsSubj.approvedLessons}`);

    // Verify all 13 math chapters have approved lessons available
    mathsSubj.chapters.forEach((ch, idx) => {
      assert.equal(ch.number, idx + 1);
      assert.equal(ch.lessonAvailability, 'approved_lessons_available', `Chapter ${ch.number} (${ch.title}) must have approved lessons`);
      assert.ok(ch.units.length >= 1, `Chapter ${ch.number} must contain at least 1 unit`);
    });
  });

  await t.test('5. Student opens Mathematics Chapter 2 ("What is Long?"), answers questions and receives feedback', async () => {
    const loginRes = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'student.grade1@vayentra.org',
      password: 'Gurukula@2026'
    });
    const token = loginRes.body.token;

    const unitRes = await requestApi('/api/v1/grade1/me/units/one-fdn-one-g1-cbse-maths-ch2-what-is-long', token);
    assert.equal(unitRes.status, 200);
    const lesson = unitRes.body.lesson;
    assert.equal(lesson.title, 'Comparing Length & Height: Long, Short, Tall');
    assert.ok(lesson.story.includes('Tara and Kabir'));
    assert.equal(lesson.questions.length, 4);

    // Submit attempt with answers
    const attemptRes = await requestApi('/api/v1/grade1/me/attempts', token, 'POST', {
      unitId: lesson.id,
      idempotencyKey: 'test-attempt-ch2-' + Date.now(),
      answers: [0, 0, 0, 0]
    });
    assert.equal(attemptRes.status, 201);
    assert.equal(attemptRes.body.total, 4);
    assert.ok(attemptRes.body.feedback.length === 4);
    assert.ok(attemptRes.body.feedback.every(f => typeof f.correct === 'boolean'));
  });

  await t.test('6. Guardian retrieves linked child catalogue and RBAC rejects unauthorized student', async () => {
    // Guardian access
    const guardianLogin = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'guardian@vayentra.org',
      password: 'Gurukula@2026'
    });
    assert.equal(guardianLogin.status, 200);
    const guardianToken = guardianLogin.body.token;

    const guardianCat = await requestApi('/api/v1/grade1/guardian/stu-g1-001/catalogue', guardianToken);
    assert.equal(guardianCat.status, 200);
    assert.equal(guardianCat.body.learner.grade, 1);

    // Non-Class-1 student (stu-001 is Grade 7) receives 403
    const stu7Login = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'student@vayentra.org',
      password: 'Gurukula@2026'
    });
    assert.equal(stu7Login.status, 200);
    const stu7Cat = await requestApi('/api/v1/grade1/me/catalogue', stu7Login.body.token);
    assert.equal(stu7Cat.status, 403, 'Grade 7 student must be forbidden from Grade 1 portal');

    // Unauthenticated receives 401
    const anonCat = await requestApi('/api/v1/grade1/me/catalogue', null);
    assert.equal(anonCat.status, 401);
  });
});
