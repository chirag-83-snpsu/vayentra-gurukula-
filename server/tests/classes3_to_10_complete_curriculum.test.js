import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../index.js';
import { db } from '../db/database.js';
import { seedAndPublishClasses3To10Curriculum } from '../services/seedAndPublishClasses3To10Curriculum.js';

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

test('Classes 3 to 10 Complete Curriculum Publishing, Unicode & Learner Access Suite', async (t) => {
  seedAndPublishClasses3To10Curriculum(db);

  await t.test('1. Every class from 3 to 10 has verified curriculum tracks for CBSE and STATE', () => {
    for (let g = 3; g <= 10; g++) {
      for (const board of ['CBSE', 'STATE']) {
        const track = db.prepare('SELECT id, catalogue_status FROM one_curriculum_tracks WHERE grade=? AND board=?').get(g, board);
        assert.ok(track, `Track for Grade ${g} ${board} must exist`);
        assert.equal(track.catalogue_status, 'verified', `Grade ${g} ${board} track must be verified`);
      }
    }
  });

  await t.test('2. Every class from 3 to 10 has required subjects including Hindi, Kannada, Maths, Science/EVS, AI & Money', () => {
    for (let g = 3; g <= 10; g++) {
      for (const board of ['CBSE', 'STATE']) {
        const track = db.prepare('SELECT id FROM one_curriculum_tracks WHERE grade=? AND board=?').get(g, board);
        const subjects = db.prepare('SELECT id, subject_title, review_status FROM one_subjects WHERE track_id=?').all(track.id);

        const expectedMinSubjects = g <= 5 ? 7 : 8; // Social Science added for grade 6+
        assert.ok(subjects.length >= expectedMinSubjects, `Grade ${g} ${board} must have at least ${expectedMinSubjects} subjects (has ${subjects.length})`);
        assert.ok(subjects.every(s => s.review_status === 'reviewed'), `All subjects in Grade ${g} ${board} must be reviewed`);

        // Check required subjects
        const titles = subjects.map(s => s.subject_title);
        assert.ok(titles.includes('English'), `Grade ${g} must have English`);
        assert.ok(titles.includes('Hindi'), `Grade ${g} must have Hindi`);
        assert.ok(titles.includes('Kannada'), `Grade ${g} must have Kannada`);
        assert.ok(titles.includes('Mathematics'), `Grade ${g} must have Mathematics`);
        assert.ok(titles.includes(g <= 5 ? 'Environmental Studies' : 'Science'), `Grade ${g} must have ${g <= 5 ? 'EVS' : 'Science'}`);
        if (g >= 6) {
          assert.ok(titles.includes('Social Science'), `Grade ${g} must have Social Science`);
        }
        assert.ok(titles.includes('Vayentra Original: AI & Digital Thinking'), `Grade ${g} must have AI`);
        assert.ok(titles.includes('Vayentra Original: Financial Literacy & Money Management'), `Grade ${g} must have Money`);
      }
    }
  });

  await t.test('3. Devanagari and Kannada Unicode script integrity across all classes', () => {
    const hindiSubjects = db.prepare("SELECT id FROM one_subjects WHERE subject_title='Hindi'").all();
    assert.ok(hindiSubjects.length >= 16, 'Must have Hindi subjects across all 8 grades and 2 boards');

    for (const h of hindiSubjects) {
      const chapters = db.prepare('SELECT chapter_title FROM one_chapters WHERE subject_id=?').all(h.id);
      assert.ok(chapters.length > 0, `Hindi subject ${h.id} must have chapters`);
      assert.ok(chapters.some(c => /[\u0900-\u097F]/.test(c.chapter_title)), `Hindi chapters for ${h.id} must contain Devanagari Unicode`);
    }

    const kannadaSubjects = db.prepare("SELECT id FROM one_subjects WHERE subject_title='Kannada'").all();
    for (const k of kannadaSubjects) {
      const chapters = db.prepare('SELECT chapter_title FROM one_chapters WHERE subject_id=?').all(k.id);
      assert.ok(chapters.length > 0, `Kannada subject ${k.id} must have chapters`);
      assert.ok(chapters.some(c => /[\u0C80-\u0CFF]/.test(c.chapter_title)), `Kannada chapters for ${k.id} must contain Kannada Unicode`);
    }
  });

  await t.test('4. Authenticated Class 7 Learner (Aarav Varma, stu-001) access verification', async () => {
    const loginRes = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'student@vayentra.org',
      password: 'Gurukula@2026'
    });
    assert.equal(loginRes.status, 200);
    const token = loginRes.body.token;

    // Check learner home in One Launchpad
    const homeRes = await requestApi('/api/v1/one-onboarding/learner/me', token);
    assert.equal(homeRes.status, 200);
    assert.equal(homeRes.body.learner.learnerId, 'stu-001');
    assert.equal(homeRes.body.learner.currentYear.grade, 7);
    assert.equal(homeRes.body.learner.currentYear.board, 'CBSE');

    // Check subjects available to Class 7 learner
    const subjects = homeRes.body.learner.subjects;
    assert.ok(subjects.length >= 8, `Class 7 must have at least 8 subjects (has ${subjects.length})`);
    const subjectNames = subjects.map(s => s.name);
    assert.ok(subjectNames.includes('Mathematics'));
    assert.ok(subjectNames.includes('Science'));
    assert.ok(subjectNames.includes('Hindi'));
    assert.ok(subjectNames.includes('Kannada'));
    assert.ok(subjectNames.includes('English'));
    assert.ok(subjectNames.includes('Social Science'));
    assert.ok(subjectNames.includes('Vayentra Original: AI & Digital Thinking'));
    assert.ok(subjectNames.includes('Vayentra Original: Financial Literacy & Money Management'));
  });

  await t.test('5. Authenticated Class 10 Learner (Tanvi Deshmukh, stu-g10-001) access verification', async () => {
    const loginRes = await requestApi('/api/v1/auth/login', null, 'POST', {
      email: 'student.grade10@vayentra.org',
      password: 'Gurukula@2026'
    });
    assert.equal(loginRes.status, 200);
    const token = loginRes.body.token;

    const homeRes = await requestApi('/api/v1/one-onboarding/learner/me', token);
    assert.equal(homeRes.status, 200);
    assert.equal(homeRes.body.learner.learnerId, 'stu-g10-001');
    assert.equal(homeRes.body.learner.currentYear.grade, 10);
    assert.equal(homeRes.body.learner.currentYear.board, 'CBSE');

    const subjects = homeRes.body.learner.subjects;
    assert.ok(subjects.length >= 8);
    const subjectNames = subjects.map(s => s.name);
    assert.ok(subjectNames.includes('Mathematics'));
    assert.ok(subjectNames.includes('Science'));
    assert.ok(subjectNames.includes('Hindi'));
    assert.ok(subjectNames.includes('Kannada'));
    assert.ok(subjectNames.includes('English'));
    assert.ok(subjectNames.includes('Social Science'));
  });
});
