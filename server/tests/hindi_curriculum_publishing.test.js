import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../index.js';
import { db } from '../db/database.js';
import { GRADE1_HINDI_SARANGI } from '../data/grade1HindiSarangi.js';
import { seedAndPublishGrade1Curriculum } from '../services/seedAndPublishGrade1Curriculum.js';
import { seedAndPublishGrade2Curriculum } from '../services/seedAndPublishGrade2Curriculum.js';

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

test('Hindi Curriculum Authoring, Publishing & Role Access Verification Suite', async (t) => {
  // Ensure curriculum is properly seeded & published
  seedAndPublishGrade1Curriculum(db);
  seedAndPublishGrade2Curriculum(db);

  await t.test('1. Class 1 Hindi (Sarangi) metadata, Unicode and 19-chapter completeness', () => {
    assert.equal(GRADE1_HINDI_SARANGI.edition, '2026-27');
    assert.equal(GRADE1_HINDI_SARANGI.subjectTitle, 'Hindi');
    assert.equal(GRADE1_HINDI_SARANGI.textbookName, 'Sarangi');
    assert.equal(GRADE1_HINDI_SARANGI.lessons.length, 19, 'Must have exactly 19 NCERT Sarangi lessons');

    // Verify ordering and Devanagari Unicode
    GRADE1_HINDI_SARANGI.lessons.forEach((l, idx) => {
      assert.equal(l.chapterNumber, idx + 1, `Chapter ${idx + 1} must be numbered sequentially`);
      assert.ok(l.chapterTitle.length > 1, 'Chapter title must not be empty');
      assert.ok(/[\u0900-\u097F]/.test(l.chapterTitle), `Chapter ${l.chapterTitle} must contain valid Devanagari script`);
      assert.ok(/[\u0900-\u097F]/.test(l.story), `Lesson story for chapter ${l.chapterNumber} must contain Devanagari text`);
      assert.ok(l.objective.length > 10, 'Objective must be pedagogical and descriptive');
      assert.ok(l.activity.length > 10, 'Activity must be practical');
      assert.equal(l.questions.length, 4, `Chapter ${l.chapterNumber} must have exactly 4 assessment questions`);
      l.questions.forEach((q, qIdx) => {
        assert.ok(q.prompt.length > 5, 'Question prompt must be meaningful');
        assert.equal(q.options.length, 3, 'Each question must have 3 options');
        assert.ok(q.answerIndex >= 0 && q.answerIndex < 3, 'Answer index must be 0, 1, or 2');
        assert.ok(q.explanation.length > 5, 'Explanation must be helpful');
      });
    });
  });

  await t.test('2. Database integrity: All 19 Class 1 Hindi chapters are reviewed and published in one_foundation_units', () => {
    const chapters = db.prepare(`
      SELECT ch.chapter_number, ch.chapter_title, ch.review_status,
             c.title as concept_title, u.id as unit_id, u.status as unit_status
      FROM one_chapters ch
      JOIN one_subjects s ON s.id = ch.subject_id
      JOIN one_curriculum_tracks t ON t.id = s.track_id
      JOIN one_concepts c ON c.chapter_id = ch.id
      JOIN one_foundation_units u ON u.concept_id = c.id
      WHERE t.grade = 1 AND t.board = 'CBSE' AND s.subject_title = 'Hindi'
      ORDER BY ch.chapter_number
    `).all();

    assert.equal(chapters.length, 19, 'Must find 19 published Hindi units in SQLite');
    for (const ch of chapters) {
      assert.equal(ch.review_status, 'reviewed', `Chapter ${ch.chapter_number} must be marked reviewed`);
      assert.equal(ch.unit_status, 'published', `Unit ${ch.unit_id} must be marked published`);
      assert.ok(/[\u0900-\u097F]/.test(ch.concept_title), 'Concept title must be valid Devanagari');
    }
  });

  await t.test('3. Class 2 Hindi (Sarangi Class 2): All 8 chapters authored, reviewed and published', () => {
    const chapters = db.prepare(`
      SELECT ch.chapter_number, ch.chapter_title, ch.review_status,
             u.id as unit_id, u.status as unit_status
      FROM one_chapters ch
      JOIN one_subjects s ON s.id = ch.subject_id
      JOIN one_curriculum_tracks t ON t.id = s.track_id
      JOIN one_concepts c ON c.chapter_id = ch.id
      JOIN one_foundation_units u ON u.concept_id = c.id
      WHERE t.grade = 2 AND t.board = 'CBSE' AND s.subject_title = 'Hindi'
      ORDER BY ch.chapter_number
    `).all();

    assert.equal(chapters.length, 8, 'Must find 8 published Hindi units in Class 2 CBSE');
    for (const ch of chapters) {
      assert.equal(ch.review_status, 'reviewed');
      assert.equal(ch.unit_status, 'published');
    }
  });

  await t.test('4. Role-based API access: Student reads published Hindi curriculum and lesson', async () => {
    const loginRes = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'student.grade1@vayentra.org',
      password: 'Gurukula@2026'
    });
    assert.equal(loginRes.status, 200);
    const token = loginRes.body.token;

    // Get Class 1 CBSE curriculum catalogue
    const catRes = await requestApi('/api/v1/grade1/me/catalogue', token);
    assert.equal(catRes.status, 200);
    const catData = catRes.body;
    const hindi = catData.catalogue.subjects.find((s) => s.name === 'Hindi');
    assert.ok(hindi, 'Hindi subject must exist in student catalogue');
    assert.equal(hindi.chapters.length, 19, 'Must show 19 chapters mapped');
    assert.equal(hindi.approvedLessons, 19, 'Must show 19 approved & published lessons');
    assert.equal(hindi.reviewStatus, 'reviewed', 'Subject must be reviewed');

    // Get first Hindi lesson (मीना का परिवार)
    const unit1Id = 'one-fdn-one-g1-cbse-starter-hindi';
    const lessonRes = await requestApi(`/api/v1/grade1/me/units/${unit1Id}`, token);
    assert.equal(lessonRes.status, 200);
    const lessonData = lessonRes.body;
    assert.equal(lessonData.lesson.subject, 'Hindi');
    assert.equal(lessonData.lesson.chapter, 'मीना का परिवार');
    assert.ok(lessonData.lesson.story.includes('मीना का परिवार बहुत बड़ा और प्यारा है'));
    assert.equal(lessonData.lesson.questions.length, 4, 'Must have 4 questions');
  });

  await t.test('5. Role-based API access: Parent, Teacher and Admin permissions on Hindi catalogue', async () => {
    // Parent login
    const parentLogin = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'guardian@vayentra.org',
      password: 'Gurukula@2026'
    });
    assert.equal(parentLogin.status, 200);
    const parentTok = parentLogin.body.token;

    // Parent views child's curriculum
    const parentCat = await requestApi('/api/v1/grade1/guardian/stu-g1-001/catalogue', parentTok);
    assert.equal(parentCat.status, 200);
    const parentHindi = parentCat.body.catalogue.subjects.find((s) => s.name === 'Hindi');
    assert.equal(parentHindi.approvedLessons, 19);

    // Teacher login
    const teacherLogin = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'teacher@vayentra.org',
      password: 'Gurukula@2026'
    });
    assert.equal(teacherLogin.status, 200);
    const teacherTok = teacherLogin.body.token;

    // Teacher views editor map
    const teacherMap = await requestApi('/api/v1/grade1/editor/map', teacherTok);
    assert.equal(teacherMap.status, 200);

    // Admin login
    const adminLogin = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'admin@vayentra.org',
      password: 'Gurukula@2026'
    });
    assert.equal(adminLogin.status, 200);
    const adminTok = adminLogin.body.token;

    // Admin review track map
    const adminMap = await requestApi('/api/v1/grade1/editor/map', adminTok);
    assert.equal(adminMap.status, 200);
  });
});
