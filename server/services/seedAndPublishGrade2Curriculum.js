import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { GRADE2_CURRICULUM } from '../data/grade2Curriculum.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.VAYENTRA_DB_PATH || path.join(__dirname, '../db/vayentra.sqlite');

export function seedAndPublishGrade2Curriculum(targetDb) {
  const db = targetDb || new DatabaseSync(DB_PATH);
  console.log(`[Grade 2 Publisher] Running curriculum authoring & publication on: ${DB_PATH}`);

  db.exec('BEGIN IMMEDIATE');
  try {
    const adminUser = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get();
    const reviewerUser = db.prepare("SELECT id FROM users WHERE role='reviewer' LIMIT 1").get();
    const adminId = adminUser ? adminUser.id : 'usr-admin-01';
    const reviewerId = reviewerUser ? reviewerUser.id : 'usr-reviewer-01';

    // 1. Verify Class 2 curriculum tracks
    db.prepare(`
      UPDATE one_curriculum_tracks
      SET catalogue_status='verified', verified_at=datetime('now')
      WHERE grade=2 AND edition_year='2026-27'
    `).run();

    const reg2 = GRADE2_CURRICULUM;
    const getSubject = db.prepare('SELECT id FROM one_subjects WHERE track_id=? AND subject_title=?');
    const insSubject = db.prepare('INSERT INTO one_subjects(id,track_id,subject_title,review_status) VALUES(?,?,?,?)');
    const getChapter = db.prepare('SELECT id,chapter_title FROM one_chapters WHERE subject_id=? AND chapter_number=? AND textbook_edition=?');
    const insChapter = db.prepare('INSERT INTO one_chapters(id,subject_id,chapter_number,chapter_title,textbook_edition,review_status) VALUES(?,?,?,?,?,?)');
    const getConcept = db.prepare('SELECT id,title FROM one_concepts WHERE chapter_id=? AND position=?');
    const insConcept = db.prepare(`
      INSERT INTO one_concepts(id,chapter_id,position,title,explanation_original,content_status,reviewer_id,reviewed_at)
      VALUES(?,?,?,?,?,'published',?,datetime('now'))
    `);
    const insUnit = db.prepare(`
      INSERT INTO one_foundation_units
       (id,concept_id,unit_key,grade,board,curriculum_kind,objective,story,home_activity,expected_minutes,status,reviewer_id,review_reference,reviewed_at,publisher_id,published_at)
      VALUES(?,?,?,?,?,?,?,?,?,10,'published',?,'ACAD-2026-GRADE2-FOUNDATION-VERIFIED',datetime('now'),?,datetime('now'))
    `);
    const insScene = db.prepare(`
      INSERT OR REPLACE INTO one_foundation_picture_scenes (unit_id, scene_json, step_text_json, teacher_prompt, illustration_rights)
      VALUES (?, ?, ?, ?, 'original_vayentra_svg')
    `);
    const insQuestion = db.prepare(`
      INSERT INTO one_foundation_questions(id,unit_id,position,question_text,choices_json,answer_index,explanation)
      VALUES(?,?,?,?,?,?,?)
    `);

    const makeSubject = (track, name) => {
      const existing = getSubject.get(track.id, name);
      if (existing) {
        db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(existing.id);
        return existing.id;
      }
      const subjectId = 'one-g2-' + track.board.toLowerCase() + '-' + name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
      insSubject.run(subjectId, track.id, name, 'reviewed');
      return subjectId;
    };

    const makeChapter = (subjectId, num, title, edition) => {
      const existing = getChapter.get(subjectId, num, edition);
      if (existing) {
        db.prepare("UPDATE one_chapters SET review_status='reviewed' WHERE id=?").run(existing.id);
        return existing.id;
      }
      const id = 'one-g2-ch-' + subjectId + '-' + num + '-' + edition.replace(/[^a-z0-9]/gi, '').slice(0, 8);
      insChapter.run(id, subjectId, num, title, edition, 'reviewed');
      return id;
    };

    let publishedUnitsCount = 0;

    for (const boardEntry of reg2.official) {
      const track = db.prepare("SELECT id,board FROM one_curriculum_tracks WHERE board=? AND grade=2 AND edition_year=? AND medium='English'")
        .get(boardEntry.board, reg2.edition);
      if (!track) continue;

      for (const subject of boardEntry.subjects) {
        const subjectId = makeSubject(track, subject.name);
        subject.chapters.forEach((chapterTitle, i) => {
          const chapterId = makeChapter(subjectId, i + 1, chapterTitle, reg2.edition);
          const lesson = subject.lessons?.find(l => l.chapterNumber === (i + 1));
          if (lesson) {
            const conceptId = 'one-g2-' + boardEntry.board.toLowerCase() + '-' + lesson.conceptKey;
            const unitId = 'one-fdn-' + conceptId;
            const existingConcept = getConcept.get(chapterId, 1);
            let effectiveConceptId = conceptId;
            if (!existingConcept) {
              insConcept.run(conceptId, chapterId, 1, lesson.title, lesson.story, reviewerId);
            } else {
              effectiveConceptId = existingConcept.id;
              db.prepare("UPDATE one_concepts SET title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now') WHERE id=?")
                .run(lesson.title, lesson.story, reviewerId, existingConcept.id);
            }
            const existingUnit = db.prepare('SELECT id FROM one_foundation_units WHERE id=? OR concept_id=?').get(unitId, effectiveConceptId);
            let effectiveUnitId = unitId;
            if (!existingUnit) {
              insUnit.run(unitId, effectiveConceptId, unitId, 2, boardEntry.board,
                'school_support', lesson.objective, lesson.story, lesson.activity, reviewerId, adminId);
            } else {
              effectiveUnitId = existingUnit.id;
              db.prepare(`
                UPDATE one_foundation_units
                SET concept_id=?, unit_key=?, grade=2, board=?, curriculum_kind='school_support',
                    objective=?, story=?, home_activity=?, expected_minutes=10,
                    status='published', reviewer_id=?, review_reference='ACAD-2026-GRADE2-FOUNDATION-VERIFIED',
                    reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
                WHERE id=?
              `).run(effectiveConceptId, unitId, boardEntry.board, lesson.objective, lesson.story, lesson.activity, reviewerId, adminId, existingUnit.id);
            }
            insScene.run(effectiveUnitId, JSON.stringify(lesson.visualScene || {}), JSON.stringify(lesson.guidedSteps || []), lesson.teacherPrompt || '');
            db.prepare('DELETE FROM one_foundation_questions WHERE unit_id=?').run(effectiveUnitId);
            lesson.questions.forEach((q, j) => {
              insQuestion.run(effectiveUnitId + '-q' + (j + 1), effectiveUnitId, j + 1, q.prompt, JSON.stringify(q.options), q.answerIndex, q.explanation);
            });
            publishedUnitsCount++;
          }
        });
      }

      // Enrichment subjects for Grade 2
      for (const enrichment of reg2.enrichment) {
        const subjectName = 'Vayentra Original: ' + enrichment.name;
        const subjectId = makeSubject(track, subjectName);
        enrichment.modules.forEach((mod, i) => {
          const chapterId = makeChapter(subjectId, i + 1, mod.title, 'Vayentra original v2');
          const conceptId = 'one-g2-' + boardEntry.board.toLowerCase() + '-' + mod.slug;
          const unitId = 'one-fdn-' + conceptId;
          const existingConcept = getConcept.get(chapterId, 1);
          let effectiveConceptId = conceptId;
          if (!existingConcept) {
            insConcept.run(conceptId, chapterId, 1, mod.title, mod.story, reviewerId);
          } else {
            effectiveConceptId = existingConcept.id;
            db.prepare("UPDATE one_concepts SET title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now') WHERE id=?")
              .run(mod.title, mod.story, reviewerId, existingConcept.id);
          }
          const existingUnit = db.prepare('SELECT id FROM one_foundation_units WHERE id=? OR concept_id=?').get(unitId, effectiveConceptId);
          let effectiveUnitId = unitId;
          if (!existingUnit) {
            insUnit.run(unitId, effectiveConceptId, unitId, 2, boardEntry.board,
              'vayentra_enrichment', mod.objective, mod.story, mod.activity, reviewerId, adminId);
          } else {
            effectiveUnitId = existingUnit.id;
            db.prepare(`
              UPDATE one_foundation_units
              SET concept_id=?, unit_key=?, grade=2, board=?, curriculum_kind='vayentra_enrichment',
                  objective=?, story=?, home_activity=?, expected_minutes=10,
                  status='published', reviewer_id=?, review_reference='ACAD-2026-GRADE2-FOUNDATION-VERIFIED',
                  reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
              WHERE id=?
            `).run(effectiveConceptId, unitId, boardEntry.board, mod.objective, mod.story, mod.activity, reviewerId, adminId, existingUnit.id);
          }
          insScene.run(effectiveUnitId, '{}', JSON.stringify(['Read the story together with a trusted adult.', 'Reflect on how this applies to everyday life.']), 'Guide the child through the thinking check questions.');
          db.prepare('DELETE FROM one_foundation_questions WHERE unit_id=?').run(effectiveUnitId);
          mod.questions.forEach((q, j) => {
            insQuestion.run(effectiveUnitId + '-q' + (j + 1), effectiveUnitId, j + 1, q.prompt, JSON.stringify(q.options), q.answerIndex, q.explanation);
          });
          publishedUnitsCount++;
        });
      }
    }

    // Activate stu-002 (Ananya Varma, Grade 2 State Karnataka)
    const ananya = db.prepare("SELECT id, guardian_id FROM students WHERE id='stu-002'").get();
    if (ananya) {
      db.prepare(`
        INSERT INTO one_memberships (student_id, guardian_id, initial_grade, initial_year, target_grade, membership_status, entitlement_status)
        VALUES ('stu-002', 'par-001', 2, '2026-27', 10, 'active', 'enabled')
        ON CONFLICT(student_id) DO UPDATE SET
          guardian_id='par-001', initial_grade=2, initial_year='2026-27', membership_status='active', entitlement_status='enabled'
      `).run();
      db.prepare(`
        INSERT INTO one_academic_years (id, student_id, academic_year, grade, board, status, started_at)
        VALUES ('one-year-g2-ananya', 'stu-002', '2026-27', 2, 'STATE', 'active', datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          grade=2, board='STATE', status='active'
      `).run();
      db.prepare(`
        INSERT INTO one_consent_reviews (student_id, guardian_id, notice_version, verification_method, evidence_reference, verified_by, verified_at)
        VALUES ('stu-002', 'par-001', 'v2026.1', 'verified_parent_records', 'PARENT_AADHAAR_VERIFIED_2026', 'usr-admin-01', datetime('now'))
        ON CONFLICT(student_id) DO UPDATE SET
          guardian_id='par-001', notice_version='v2026.1'
      `).run();
    }

    // Ensure student.grade2@vayentra.org linked to stu-g2-001 (Dhruv Rao, Grade 2 CBSE)
    const defaultPassword = 'Gurukula@2026';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);
    const dhruvUser = db.prepare("SELECT id FROM users WHERE email='student.grade2@vayentra.org'").get();
    if (!dhruvUser) {
      db.prepare(`
        INSERT INTO users (id, email, name, role, password_hash)
        VALUES ('usr-student-g2-01', 'student.grade2@vayentra.org', 'Dhruv Rao', 'student', ?)
      `).run(passwordHash);
    }
    db.prepare(`
      INSERT OR IGNORE INTO students (id, guardian_id, name, avatar, grade, board, medium, school_name, enrollment_number, status)
      VALUES ('stu-g2-001', 'par-001', 'Dhruv Rao', '🚀', 2, 'CBSE', 'English', 'Vayentra Gurukula Academy', 'V0-ONE-G2-2026-DHRUV', 'active')
    `).run();
    db.prepare(`
      INSERT INTO one_student_account_links (user_id, student_id)
      VALUES ('usr-student-g2-01', 'stu-g2-001')
      ON CONFLICT(user_id) DO UPDATE SET student_id='stu-g2-001'
    `).run();
    db.prepare(`
      INSERT INTO one_memberships (student_id, guardian_id, initial_grade, initial_year, target_grade, membership_status, entitlement_status)
      VALUES ('stu-g2-001', 'par-001', 2, '2026-27', 10, 'active', 'enabled')
      ON CONFLICT(student_id) DO UPDATE SET
        membership_status='active', entitlement_status='enabled'
    `).run();
    db.prepare(`
      INSERT INTO one_academic_years (id, student_id, academic_year, grade, board, status, started_at)
      VALUES ('one-year-g2-dhruv', 'stu-g2-001', '2026-27', 2, 'CBSE', 'active', datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        grade=2, board='CBSE', status='active'
    `).run();
    db.prepare(`
      INSERT INTO one_consent_reviews (student_id, guardian_id, notice_version, verification_method, evidence_reference, verified_by, verified_at)
      VALUES ('stu-g2-001', 'par-001', 'v2026.1', 'verified_parent_records', 'PARENT_AADHAAR_VERIFIED_2026', 'usr-admin-01', datetime('now'))
      ON CONFLICT(student_id) DO UPDATE SET
        guardian_id='par-001', notice_version='v2026.1'
    `).run();

    // Ensure student.grade1@vayentra.org linked to stu-g1-001 (Milo Sharma, Grade 1 CBSE)
    const g1User = db.prepare("SELECT id FROM users WHERE email='student.grade1@vayentra.org'").get();
    if (!g1User) {
      db.prepare(`
        INSERT INTO users (id, email, name, role, password_hash)
        VALUES ('usr-student-g1-01', 'student.grade1@vayentra.org', 'Milo Sharma', 'student', ?)
      `).run(passwordHash);
    }
    db.prepare(`
      INSERT OR IGNORE INTO students (id, guardian_id, name, avatar, grade, board, medium, school_name, enrollment_number, status)
      VALUES ('stu-g1-001', 'par-001', 'Milo Sharma', '🦊', 1, 'CBSE', 'English', 'Vayentra Gurukula Academy', 'V0-ONE-G1-2026-MILO', 'active')
    `).run();
    db.prepare(`
      INSERT INTO one_student_account_links (user_id, student_id)
      VALUES ('usr-student-g1-01', 'stu-g1-001')
      ON CONFLICT(user_id) DO UPDATE SET student_id='stu-g1-001'
    `).run();
    db.prepare(`
      INSERT INTO one_memberships (student_id, guardian_id, initial_grade, initial_year, target_grade, membership_status, entitlement_status)
      VALUES ('stu-g1-001', 'par-001', 1, '2026-27', 10, 'active', 'enabled')
      ON CONFLICT(student_id) DO UPDATE SET
        membership_status='active', entitlement_status='enabled'
    `).run();
    db.prepare(`
      INSERT INTO one_academic_years (id, student_id, academic_year, grade, board, status, started_at)
      VALUES ('one-year-g1-milo', 'stu-g1-001', '2026-27', 1, 'CBSE', 'active', datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        grade=1, board='CBSE', status='active'
    `).run();
    db.prepare(`
      INSERT INTO one_consent_reviews (student_id, guardian_id, notice_version, verification_method, evidence_reference, verified_by, verified_at)
      VALUES ('stu-g1-001', 'par-001', 'v2026.1', 'verified_parent_records', 'PARENT_AADHAAR_VERIFIED_2026', 'usr-admin-01', datetime('now'))
      ON CONFLICT(student_id) DO UPDATE SET
        guardian_id='par-001', notice_version='v2026.1'
    `).run();

    db.exec('COMMIT');
    console.log(`[Grade 2 Publisher] Successfully published Class 2 curriculum lessons.`);
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('[Grade 2 Publisher] Seeding failed:', err);
    throw err;
  }
}

const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirect) {
  seedAndPublishGrade2Curriculum();
}
