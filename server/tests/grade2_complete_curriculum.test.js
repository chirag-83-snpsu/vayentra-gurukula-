import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../index.js';
import { db } from '../db/database.js';
import { GRADE2_CURRICULUM } from '../data/grade2Curriculum.js';
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

test('Class 2 Complete Curriculum Publishing, Verification & API Access Suite', async (t) => {
  seedAndPublishGrade2Curriculum(db);

  await t.test('1. Curriculum metadata and lesson array integrity', () => {
    const cbse = GRADE2_CURRICULUM.official.find(b => b.board === 'CBSE');
    assert.ok(cbse);
    const eng = cbse.subjects.find(s => s.name === 'English');
    const maths = cbse.subjects.find(s => s.name === 'Mathematics');
    const evs = cbse.subjects.find(s => s.name === 'Environmental Studies');
    const kannada = cbse.subjects.find(s => s.name === 'Kannada');
    const hindi = cbse.subjects.find(s => s.name === 'Hindi');

    assert.equal(eng.chapters.length, 10);
    assert.equal(eng.lessons.length, 10);
    assert.equal(maths.chapters.length, 11);
    assert.equal(maths.lessons.length, 11);
    assert.equal(evs.chapters.length, 7);
    assert.equal(evs.lessons.length, 7);
    assert.equal(kannada.chapters.length, 6);
    assert.equal(kannada.lessons.length, 6);
    assert.equal(hindi.chapters.length, 8);
    assert.equal(hindi.lessons.length, 8);

    // Check all questions count
    [...eng.lessons, ...maths.lessons, ...evs.lessons, ...kannada.lessons, ...hindi.lessons].forEach((l) => {
      assert.ok(l.title.length > 2);
      assert.ok(l.story.length > 30);
      assert.equal(l.questions.length, 4, `Lesson ${l.title} must have exactly 4 questions`);
    });
  });

  await t.test('2. Database verified publication for CBSE Class 2 (7 subjects, 54 chapters)', () => {
    const track = db.prepare("SELECT id FROM one_curriculum_tracks WHERE board='CBSE' AND grade=2 AND edition_year='2026-27'").get();
    assert.ok(track, 'CBSE Grade 2 track must exist');

    const subjects = db.prepare('SELECT id, subject_title, review_status FROM one_subjects WHERE track_id=?').all(track.id);
    assert.equal(subjects.length, 7, 'CBSE Class 2 must have 7 subjects');

    const expectedCounts = {
      'English': 10,
      'Mathematics': 11,
      'Environmental Studies': 7,
      'Hindi': 8,
      'Kannada': 6,
      'Vayentra Original: AI & Digital Thinking': 6,
      'Vayentra Original: Financial Literacy & Money Management': 6
    };

    for (const [subjName, count] of Object.entries(expectedCounts)) {
      const s = subjects.find(sub => sub.subject_title === subjName);
      assert.ok(s, `Subject ${subjName} must exist`);
      const chs = db.prepare('SELECT id FROM one_chapters WHERE subject_id=?').all(s.id);
      assert.equal(chs.length, count, `${subjName} must have ${count} chapters`);

      const pubConcepts = db.prepare("SELECT COUNT(*) as c FROM one_concepts WHERE chapter_id IN (SELECT id FROM one_chapters WHERE subject_id=?) AND content_status='published'").get(s.id).c;
      assert.equal(pubConcepts, count, `${subjName} must have ${count} published concepts`);

      const pubUnits = db.prepare("SELECT COUNT(*) as c FROM one_foundation_units WHERE concept_id IN (SELECT id FROM one_concepts WHERE chapter_id IN (SELECT id FROM one_chapters WHERE subject_id=?)) AND status='published'").get(s.id).c;
      assert.equal(pubUnits, count, `${subjName} must have ${count} published foundation units`);
    }
  });

  await t.test('3. Database verified publication for STATE Class 2 (6 subjects, 30 chapters)', () => {
    const track = db.prepare("SELECT id FROM one_curriculum_tracks WHERE board='STATE' AND grade=2 AND edition_year='2026-27'").get();
    assert.ok(track, 'STATE Grade 2 track must exist');

    const subjects = db.prepare('SELECT id, subject_title FROM one_subjects WHERE track_id=?').all(track.id);
    assert.equal(subjects.length, 6, 'STATE Class 2 must have 6 subjects');

    const expectedCounts = {
      'English': 4,
      'Mathematics': 4,
      'Environmental Studies': 4,
      'Kannada': 6,
      'Vayentra Original: AI & Digital Thinking': 6,
      'Vayentra Original: Financial Literacy & Money Management': 6
    };

    for (const [subjName, count] of Object.entries(expectedCounts)) {
      const s = subjects.find(sub => sub.subject_title === subjName);
      assert.ok(s, `STATE subject ${subjName} must exist`);
      const chs = db.prepare('SELECT id FROM one_chapters WHERE subject_id=?').all(s.id);
      assert.equal(chs.length, count, `STATE ${subjName} must have ${count} chapters`);

      const pubUnits = db.prepare("SELECT COUNT(*) as c FROM one_foundation_units WHERE concept_id IN (SELECT id FROM one_concepts WHERE chapter_id IN (SELECT id FROM one_chapters WHERE subject_id=?)) AND status='published'").get(s.id).c;
      assert.equal(pubUnits, count, `STATE ${subjName} must have ${count} published foundation units`);
    }
  });

  await t.test('4. Authenticated Dhruv Rao (Class 2 CBSE) API catalogue verification', async () => {
    const loginRes = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'student.grade2@vayentra.org',
      password: 'Gurukula@2026'
    });
    assert.equal(loginRes.status, 200);
    const token = loginRes.body.token;

    const catRes = await requestApi('/api/v1/grade2/me/catalogue', token);
    assert.equal(catRes.status, 200);
    assert.equal(catRes.body.learner.grade, 2);
    assert.equal(catRes.body.learner.board, 'CBSE');

    const catalogueSubjects = catRes.body.catalogue.subjects;
    assert.equal(catalogueSubjects.length, 7);

    // Verify Mathematics has 11 chapters all available
    const maths = catalogueSubjects.find(s => s.name === 'Mathematics');
    assert.ok(maths);
    assert.equal(maths.chapters.length, 11);
    assert.ok(maths.chapters.every(c => c.units && c.units.length > 0 && c.units[0].status === 'published'));

    // Verify English has 10 chapters all available
    const eng = catalogueSubjects.find(s => s.name === 'English');
    assert.ok(eng);
    assert.equal(eng.chapters.length, 10);
    assert.ok(eng.chapters.every(c => c.units && c.units.length > 0 && c.units[0].status === 'published'));
  });
});
