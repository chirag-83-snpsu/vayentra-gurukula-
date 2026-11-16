import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { GRADE3_CURRICULUM } from '../data/grade3Curriculum.js';
import { checkStudentEntitlement } from '../services/subscriptionService.js';

export const grade3CurriculumRouter = Router();
grade3CurriculumRouter.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
grade3CurriculumRouter.use(authenticateToken);

const fail = (res, code, status = 400, message = 'Unable to complete the Class 3 learning request.') =>
  res.status(status).json({ code, message });
const canonicalBoard = (b) => (b === 'STATE_KARNATAKA' || b === 'STATE') ? 'STATE' : b;
const boardValid = (b) => canonicalBoard(b) === 'CBSE' || canonicalBoard(b) === 'STATE';
const evidenceOk = (s) => typeof s === 'string' && s.trim().length >= 8 && s.trim().length <= 120 && !/[<>]/.test(s);
const byBoard = (board) => GRADE3_CURRICULUM.official.find((b) => b.board === canonicalBoard(board));

function unitRows(board) {
  return db.prepare(`
    SELECT u.*, c.title, ch.id AS chapter_id, ch.chapter_title, ch.chapter_number,
      ch.review_status AS chapter_status, ch.textbook_edition,
      s.id AS subject_id, s.subject_title, s.review_status AS subject_status,
      t.id AS track_id, t.board, t.grade, t.edition_year, t.catalogue_status AS track_status
    FROM one_foundation_units u
    JOIN one_concepts c ON c.id=u.concept_id
    JOIN one_chapters ch ON ch.id=c.chapter_id
    JOIN one_subjects s ON s.id=ch.subject_id
    JOIN one_curriculum_tracks t ON t.id=s.track_id
    WHERE u.board=? AND u.grade=3 AND t.grade=3 AND t.board=?
    ORDER BY s.subject_title, ch.chapter_number, u.id
  `).all(board, board);
}

const questions = (id) =>
  db.prepare(
    'SELECT id, position, question_text, choices_json, answer_index, explanation FROM one_foundation_questions WHERE unit_id=? ORDER BY position'
  ).all(id);

function published(row) {
  return row?.status === 'published' && row.track_status === 'verified' && row.subject_status === 'reviewed' && row.chapter_status === 'reviewed';
}

function validOwner(user, studentId) {
  if (user.role === 'student') {
    if (!user.studentId || user.studentId !== studentId) return false;
    return Boolean(
      db.prepare('SELECT 1 FROM one_student_account_links WHERE user_id=? AND student_id=?').get(user.id, studentId)
    );
  }
  if (user.role !== 'parent' || !user.guardianId) return false;
  return Boolean(
    db.prepare(`
      SELECT 1 FROM one_memberships m JOIN students s ON s.id=m.student_id
      JOIN one_consent_reviews cr ON cr.student_id=s.id
      WHERE s.id=? AND s.guardian_id=? AND m.guardian_id=? AND cr.guardian_id=?
        AND m.membership_status='active'
    `).get(studentId, user.guardianId, user.guardianId, user.guardianId)
  );
}

function context(req, res, selectedId, needAccess) {
  const studentId = req.user.role === 'student' ? req.user.studentId : selectedId;
  if (!studentId || !validOwner(req.user, studentId)) {
    fail(res, 'LEARNER_OWNERSHIP_REQUIRED', 403);
    return null;
  }
  const record = db.prepare(`
    SELECT s.id, s.grade, s.board, m.membership_status, m.entitlement_status
    FROM students s JOIN one_memberships m ON m.student_id=s.id WHERE s.id=?
  `).get(studentId);
  const cBoard = record ? canonicalBoard(record.board) : null;
  if (
    !record ||
    record.grade !== 3 ||
    !boardValid(record.board) ||
    record.membership_status !== 'active' ||
    !db.prepare("SELECT 1 FROM one_academic_years WHERE student_id=? AND status='active' AND grade=3 AND board=?").get(studentId, cBoard) ||
    !db.prepare('SELECT 1 FROM one_consent_reviews WHERE student_id=?').get(studentId)
  ) {
    fail(res, 'CLASS3_ENROLMENT_REQUIRED', 403);
    return null;
  }
  const trial = Boolean(
    db.prepare("SELECT 1 FROM one_foundation_pilot_grants WHERE student_id=? AND expires_at>datetime('now')").get(studentId)
  );
  const ent = checkStudentEntitlement(studentId);
  const effectiveStatus = ent.active ? 'enabled' : (ent.status === 'expired' ? 'expired' : record.entitlement_status);
  if (needAccess && effectiveStatus !== 'enabled' && !trial) {
    fail(
      res,
      'LEARNING_ACCESS_PENDING',
      403,
      ent.needsRenewal
        ? 'Your annual subscription has expired. Please renew to continue learning.'
        : 'An approved pilot grant or valid course entitlement is required.'
    );
    return null;
  }
  return { ...record, board: cBoard, entitlement_status: effectiveStatus, pilot: trial, needsRenewal: Boolean(ent.needsRenewal) };
}

function courseMap(board, showDraft) {
  const track = db.prepare(`
    SELECT * FROM one_curriculum_tracks
    WHERE board=? AND grade=3 AND edition_year=? AND medium='English'
  `).get(board, GRADE3_CURRICULUM.edition);
  if (!track) return { board, grade: 3, subjects: [], status: 'not_mapped' };
  const subjects = db.prepare(`
    SELECT id, subject_title, review_status FROM one_subjects WHERE track_id=?
    ORDER BY CASE WHEN subject_title LIKE 'Vayentra Original:%' THEN 1 ELSE 0 END, subject_title
  `).all(track.id);
  const chapters = db.prepare(`
    SELECT ch.id, ch.subject_id, ch.chapter_number, ch.chapter_title, ch.textbook_edition, ch.review_status
    FROM one_chapters ch JOIN one_subjects s ON s.id=ch.subject_id WHERE s.track_id=?
    ORDER BY ch.chapter_number
  `).all(track.id);
  const rows = unitRows(board);
  const catalogSubjects = subjects.map((subject) => {
    const original = subject.subject_title.startsWith('Vayentra Original:');
    const info = !original ? byBoard(board)?.subjects.find((s) => s.name === subject.subject_title) : null;
    const chapterList = chapters
      .filter((ch) => ch.subject_id === subject.id)
      .map((ch) => {
        const unitList = rows.filter((u) => u.chapter_id === ch.id);
        const visible = showDraft ? unitList : unitList.filter(published);
        return {
          id: ch.id,
          number: ch.chapter_number,
          title: ch.chapter_title,
          edition: ch.textbook_edition,
          reviewStatus: ch.review_status,
          lessonCount: visible.length,
          lessonAvailability: unitList.some(published) ? 'approved_lessons_available' : 'planned',
          units: visible.map((u) => ({ id: u.id, title: u.title, status: u.status }))
        };
      });
    return {
      id: subject.id,
      name: subject.subject_title,
      kind: original ? 'vayentra_original_enrichment' : 'school_curriculum',
      book: info?.book || (original ? 'Vayentra original course' : 'School edition to be verified'),
      reference: info?.source || null,
      sourceStatus: info?.status || (original ? 'original_draft' : 'edition_pending'),
      reviewStatus: subject.review_status,
      chapters: chapterList,
      approvedLessons: rows.filter((u) => u.subject_id === subject.id && published(u)).length,
      plannedChapters: chapterList.length
    };
  });
  return {
    board,
    grade: 3,
    edition: GRADE3_CURRICULUM.edition,
    trackId: track.id,
    trackStatus: track.catalogue_status,
    subjects: catalogSubjects,
    note: 'Class 3 official textbook chapter titles are mapped for curriculum planning. Vayentra original enrichment builds foundational AI & Financial literacy. Unapproved lessons stay locked.'
  };
}

function cleanUnit(row) {
  const scene = db.prepare(
    'SELECT scene_json, step_text_json, teacher_prompt FROM one_foundation_picture_scenes WHERE unit_id=?'
  ).get(row.id);
  return {
    id: row.id,
    subject: row.subject_title,
    chapter: row.chapter_title,
    title: row.title,
    objective: row.objective,
    story: row.story,
    homeActivity: row.home_activity,
    expectedMinutes: row.expected_minutes,
    curriculumKind: row.curriculum_kind,
    pictureScene:
      scene && scene.scene_json && scene.scene_json.trim() !== '' && scene.scene_json.trim() !== '{}'
        ? JSON.parse(scene.scene_json)
        : null,
    guidedSteps: scene ? JSON.parse(scene.step_text_json) : [],
    guardianGuide: scene?.teacher_prompt || null,
    questions: questions(row.id).map((q) => ({
      id: q.id,
      position: q.position,
      prompt: q.question_text,
      options: JSON.parse(q.choices_json)
    }))
  };
}

function summary(studentId, board) {
  const units = unitRows(board);
  const permitted = new Set(units.map((u) => u.id));
  const attempts = db.prepare(`
    SELECT unit_id, correct_count, total_count, created_at FROM one_foundation_attempts
    WHERE student_id=? ORDER BY created_at DESC, rowid DESC LIMIT 1000
  `).all(studentId).filter((x) => permitted.has(x.unit_id));
  const latest = new Map();
  for (const a of attempts) if (!latest.has(a.unit_id)) latest.set(a.unit_id, a);
  return {
    checkedLessons: latest.size,
    attemptsRecorded: attempts.length,
    latestChecks: [...latest.values()].map((a) => ({
      unitId: a.unit_id,
      correct: a.correct_count,
      total: a.total_count,
      checkedAt: a.created_at,
      guidance: a.correct_count === a.total_count ? 'This check was correct; explore a new example later.' : 'Revisit the story with a trusted adult.'
    })),
    note: 'Formative practice evidence only. No official marks, scores of other students or automatic mastery claims.'
  };
}

function learnerCatalogue(req, res, selectedId) {
  const owner = context(req, res, selectedId, false);
  if (!owner) return;
  try {
    const map = courseMap(owner.board, false);
    const authorised = owner.entitlement_status === 'enabled' || owner.pilot;
    return res.json({
      learner: { grade: 3, board: owner.board },
      catalogue: map,
      access: authorised ? 'pilot_or_entitled' : 'locked',
      progress: authorised ? summary(owner.id, owner.board) : null
    });
  } catch (err) {
    console.error('[Grade3 catalogue]', err);
    return fail(res, 'CLASS3_CATALOGUE_FAILED', 500);
  }
}

function lesson(req, res, selectedId) {
  const owner = context(req, res, selectedId, true);
  if (!owner) return;
  try {
    const row = unitRows(owner.board).find((u) => u.id === req.params.unitId);
    if (!published(row)) return fail(res, 'LESSON_NOT_PUBLISHED', 404);
    return res.json({ lesson: cleanUnit(row), progress: summary(owner.id, owner.board) });
  } catch (err) {
    console.error('[Grade3 lesson]', err);
    return fail(res, 'CLASS3_LESSON_FAILED', 500);
  }
}

function gradeChoice(id, answers) {
  const qs = questions(id);
  const feedback = qs.map((q, i) => ({
    questionId: q.id,
    chosenIndex: answers[i],
    correctIndex: q.answer_index,
    correct: answers[i] === q.answer_index,
    reason: q.explanation
  }));
  return { correct: feedback.filter((x) => x.correct).length, total: feedback.length, feedback };
}

function submit(req, res, selectedId) {
  const owner = context(req, res, selectedId, true);
  if (!owner) return;
  const { unitId, idempotencyKey, answers } = req.body || {};
  if (
    typeof unitId !== 'string' ||
    typeof idempotencyKey !== 'string' ||
    !/^[a-zA-Z0-9_-]{12,100}$/.test(idempotencyKey)
  )
    return fail(res, 'INVALID_PRACTICE_REQUEST');
  try {
    const row = unitRows(owner.board).find((u) => u.id === unitId);
    if (!published(row)) return fail(res, 'LESSON_NOT_PUBLISHED', 404);
    const qs = questions(row.id);
    if (
      qs.length < 1 ||
      qs.length > 8 ||
      !Array.isArray(answers) ||
      answers.length !== qs.length ||
      answers.some((v, i) => !Number.isInteger(v) || v < 0 || v >= JSON.parse(qs[i].choices_json).length)
    )
      return fail(res, 'INVALID_PRACTICE_ANSWERS');
    const prev = db.prepare('SELECT * FROM one_foundation_attempts WHERE student_id=? AND idempotency_key=?').get(
      owner.id,
      idempotencyKey
    );
    if (prev) {
      if (prev.unit_id !== unitId || prev.answers_json !== JSON.stringify(answers))
        return fail(res, 'IDEMPOTENCY_CONFLICT', 409);
      return res.json({ attemptId: prev.id, replayed: true, ...gradeChoice(unitId, answers) });
    }
    const count = db.prepare(
      "SELECT COUNT(*) n FROM one_foundation_attempts WHERE student_id=? AND unit_id=? AND created_at>=datetime('now','-1 day')"
    ).get(owner.id, unitId).n;
    if (count >= 8) return fail(res, 'PRACTICE_LIMIT_REACHED', 429, 'Take a break and revisit with a trusted adult.');
    const scored = gradeChoice(unitId, answers),
      attemptId = 'one-g3-check-' + randomUUID();
    db.prepare(`
      INSERT INTO one_foundation_attempts
      (id, student_id, unit_id, attempted_by, idempotency_key, answers_json, correct_count, total_count)
      VALUES(?,?,?,?,?,?,?,?)
    `).run(attemptId, owner.id, unitId, req.user.id, idempotencyKey, JSON.stringify(answers), scored.correct, scored.total);
    return res.status(201).json({
      attemptId,
      replayed: false,
      ...scored,
      note: 'A check can be retried. Correct answers do not automatically prove mastered learning.'
    });
  } catch (err) {
    console.error('[Grade3 submit]', err);
    return fail(res, 'CLASS3_ATTEMPT_FAILED', 500);
  }
}

// Student routes
grade3CurriculumRouter.get('/me/catalogue', requireRole('student'), (req, res) => learnerCatalogue(req, res, null));
grade3CurriculumRouter.get('/me/units/:unitId', requireRole('student'), (req, res) => lesson(req, res, null));
grade3CurriculumRouter.post('/me/attempts', requireRole('student'), (req, res) => submit(req, res, null));

// Parent guardian routes
grade3CurriculumRouter.get('/guardian/:studentId/catalogue', requireRole('parent'), (req, res) =>
  learnerCatalogue(req, res, req.params.studentId)
);
grade3CurriculumRouter.get('/guardian/:studentId/units/:unitId', requireRole('parent'), (req, res) =>
  lesson(req, res, req.params.studentId)
);
grade3CurriculumRouter.post('/guardian/:studentId/attempts', requireRole('parent'), (req, res) =>
  submit(req, res, req.params.studentId)
);

// Editorial routes
grade3CurriculumRouter.get('/editor/map', requireRole(['admin', 'teacher', 'reviewer']), (req, res) => {
  const b = req.query.board === 'STATE' ? 'STATE' : 'CBSE';
  return res.json(courseMap(b, true));
});

grade3CurriculumRouter.post('/editor/units/:unitId/request-review', requireRole(['teacher', 'admin']), (req, res) => {
  const row = db.prepare('SELECT id, status FROM one_foundation_units WHERE id=? AND grade=3').get(req.params.unitId);
  if (!row) return fail(res, 'UNIT_NOT_FOUND', 404);
  if (row.status !== 'draft') return fail(res, 'INVALID_STATUS_TRANSITION', 409);
  db.prepare("UPDATE one_foundation_units SET status='in_review' WHERE id=?").run(row.id);
  return res.json({ status: 'in_review' });
});

grade3CurriculumRouter.post('/editor/units/:unitId/review', requireRole('reviewer'), (req, res) => {
  const { decision, academicReviewReference } = req.body || {};
  if (!['approved', 'rejected'].includes(decision) || !evidenceOk(academicReviewReference))
    return fail(res, 'REVIEW_PAYLOAD_INVALID');
  const row = db.prepare('SELECT id, status FROM one_foundation_units WHERE id=? AND grade=3').get(req.params.unitId);
  if (!row) return fail(res, 'UNIT_NOT_FOUND', 404);
  const next = decision === 'approved' ? 'reviewed' : 'draft';
  db.prepare(`
    UPDATE one_foundation_units
    SET status=?, reviewer_id=?, review_reference=?, reviewed_at=datetime('now')
    WHERE id=?
  `).run(next, req.user.id, academicReviewReference.trim(), row.id);
  return res.json({ status: next });
});

grade3CurriculumRouter.post('/editor/units/:unitId/publish', requireRole('admin'), (req, res) => {
  const row = db.prepare(`
    SELECT u.*, ch.review_status chapter_status, s.review_status subject_status, t.catalogue_status track_status
    FROM one_foundation_units u
    JOIN one_concepts c ON c.id=u.concept_id
    JOIN one_chapters ch ON ch.id=c.chapter_id
    JOIN one_subjects s ON s.id=ch.subject_id
    JOIN one_curriculum_tracks t ON t.id=s.track_id
    WHERE u.id=? AND u.grade=3
  `).get(req.params.unitId);
  if (!row) return fail(res, 'UNIT_NOT_FOUND', 404);
  if (row.track_status !== 'verified' || row.subject_status !== 'reviewed' || row.chapter_status !== 'reviewed')
    return fail(res, 'HIERARCHY_NOT_VERIFIED', 409);
  if (row.status !== 'reviewed') return fail(res, 'UNIT_NOT_REVIEWED', 409);
  db.prepare("UPDATE one_foundation_units SET status='published', publisher_id=?, published_at=datetime('now') WHERE id=?")
    .run(req.user.id, row.id);
  return res.json({ status: 'published' });
});

grade3CurriculumRouter.post('/editor/units/:unitId/withdraw', requireRole('admin'), (req, res) => {
  const row = db.prepare('SELECT id, status FROM one_foundation_units WHERE id=? AND grade=3').get(req.params.unitId);
  if (!row) return fail(res, 'UNIT_NOT_FOUND', 404);
  if (row.status !== 'published') return fail(res, 'UNIT_NOT_PUBLISHED', 409);
  db.prepare("UPDATE one_foundation_units SET status='withdrawn' WHERE id=?").run(row.id);
  return res.json({ status: 'withdrawn' });
});
