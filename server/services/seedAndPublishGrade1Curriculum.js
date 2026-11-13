import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { GRADE1_ENGLISH_MRIDANG } from '../data/grade1EnglishMridang.js';
import { GRADE1_HINDI_SARANGI } from '../data/grade1HindiSarangi.js';
import { GRADE1_MATHS_JOYFUL } from '../data/grade1MathsJoyful.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.VAYENTRA_DB_PATH || path.join(__dirname, '../db/vayentra.sqlite');

export function seedAndPublishGrade1Curriculum(targetDb) {
  const db = targetDb || new DatabaseSync(DB_PATH);
  console.log(`[Grade 1 Publisher] Running curriculum authoring & publication on: ${DB_PATH}`);

  db.exec('BEGIN IMMEDIATE');
  try {
    const adminUser = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get();
    const reviewerUser = db.prepare("SELECT id FROM users WHERE role='reviewer' LIMIT 1").get();
    const adminId = adminUser ? adminUser.id : 'usr-admin-01';
    const reviewerId = reviewerUser ? reviewerUser.id : 'usr-reviewer-01';

    // 1. Ensure CBSE Grade 1 track is verified
    db.prepare(`
      UPDATE one_curriculum_tracks 
      SET catalogue_status='verified' 
      WHERE board='CBSE' AND grade=1 AND edition_year='2026-27'
    `).run();

    // 2. Author and seed English (Mridang) lessons
    const englishSubject = db.prepare(`
      SELECT s.id 
      FROM one_subjects s
      JOIN one_curriculum_tracks t ON t.id=s.track_id
      WHERE t.board='CBSE' AND t.grade=1 AND s.subject_title='English'
    `).get();

    if (!englishSubject) {
      throw new Error('CBSE Grade 1 English subject not found in catalogue.');
    }

    const englishSubjectId = englishSubject.id;

    for (const lesson of GRADE1_ENGLISH_MRIDANG.lessons) {
      const chapter = db.prepare(`
        SELECT id, chapter_number, chapter_title 
        FROM one_chapters 
        WHERE subject_id=? AND chapter_number=?
      `).get(englishSubjectId, lesson.chapterNumber);

      if (!chapter) {
        console.warn(`[Grade 1 Publisher] Warning: chapter ${lesson.chapterNumber} not found for English.`);
        continue;
      }

      const chapterId = chapter.id;

      if (lesson.chapterNumber === 1) {
        // Update existing starter lesson
        const starterConcept = db.prepare(`
          SELECT id FROM one_concepts WHERE id='one-g1-cbse-starter-english'
        `).get();

        if (starterConcept) {
          db.prepare(`
            UPDATE one_concepts 
            SET title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now')
            WHERE id='one-g1-cbse-starter-english'
          `).run(lesson.title, lesson.story, reviewerId);

          db.prepare(`
            UPDATE one_foundation_units
            SET objective=?, story=?, home_activity=?, expected_minutes=9,
                status='published', reviewer_id=?, review_reference='ACAD-2026-MRIDANG-CH1-VERIFIED',
                reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
            WHERE id='one-fdn-one-g1-cbse-starter-english'
          `).run(lesson.objective, lesson.story, lesson.activity, reviewerId, adminId);

          // Scene & steps
          db.prepare(`
            INSERT OR REPLACE INTO one_foundation_picture_scenes (unit_id, scene_json, step_text_json, teacher_prompt, illustration_rights)
            VALUES (?, '{}', ?, ?, 'original_vayentra_svg')
          `).run(
            'one-fdn-one-g1-cbse-starter-english',
            JSON.stringify(lesson.steps),
            lesson.guardianGuide
          );

          // Questions
          db.prepare("DELETE FROM one_foundation_questions WHERE unit_id='one-fdn-one-g1-cbse-starter-english'").run();
          lesson.questions.forEach((q, idx) => {
            db.prepare(`
              INSERT INTO one_foundation_questions (id, unit_id, position, question_text, choices_json, answer_index, explanation)
              VALUES (?, 'one-fdn-one-g1-cbse-starter-english', ?, ?, ?, ?, ?)
            `).run(
              `one-fdn-q-english-ch1-${idx + 1}`,
              idx + 1,
              q.prompt,
              JSON.stringify(q.options),
              q.answerIndex,
              q.explanation
            );
          });
        }
      } else {
        // Chapters 2 to 9
        const conceptId = `one-g1-cbse-english-ch${lesson.chapterNumber}-${lesson.conceptKey}`;
        const unitId = `one-fdn-${conceptId}`;

        // Upsert concept
        const existingConcept = db.prepare('SELECT id FROM one_concepts WHERE id=?').get(conceptId);
        if (!existingConcept) {
          db.prepare(`
            INSERT INTO one_concepts (id, chapter_id, position, title, explanation_original, content_status, reviewer_id, reviewed_at)
            VALUES (?, ?, 1, ?, ?, 'published', ?, datetime('now'))
          `).run(conceptId, chapterId, lesson.title, lesson.story, reviewerId);
        } else {
          db.prepare(`
            UPDATE one_concepts 
            SET title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now')
            WHERE id=?
          `).run(lesson.title, lesson.story, reviewerId, conceptId);
        }

        // Upsert unit
        const existingUnit = db.prepare('SELECT id FROM one_foundation_units WHERE id=?').get(unitId);
        if (!existingUnit) {
          db.prepare(`
            INSERT INTO one_foundation_units 
              (id, concept_id, unit_key, grade, board, curriculum_kind, objective, story, home_activity, expected_minutes,
               status, reviewer_id, review_reference, reviewed_at, publisher_id, published_at)
            VALUES (?, ?, ?, 1, 'CBSE', 'school_support', ?, ?, ?, 9,
                    'published', ?, 'ACAD-2026-MRIDANG-VERIFIED', datetime('now'), ?, datetime('now'))
          `).run(unitId, conceptId, unitId, lesson.objective, lesson.story, lesson.activity, reviewerId, adminId);
        } else {
          db.prepare(`
            UPDATE one_foundation_units
            SET objective=?, story=?, home_activity=?, expected_minutes=9,
                status='published', reviewer_id=?, review_reference='ACAD-2026-MRIDANG-VERIFIED',
                reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
            WHERE id=?
          `).run(lesson.objective, lesson.story, lesson.activity, reviewerId, adminId, unitId);
        }

        // Scene & steps
        db.prepare(`
          INSERT OR REPLACE INTO one_foundation_picture_scenes (unit_id, scene_json, step_text_json, teacher_prompt, illustration_rights)
          VALUES (?, '{}', ?, ?, 'original_vayentra_svg')
        `).run(unitId, JSON.stringify(lesson.steps), lesson.guardianGuide);

        // Questions
        db.prepare('DELETE FROM one_foundation_questions WHERE unit_id=?').run(unitId);
        lesson.questions.forEach((q, idx) => {
          db.prepare(`
            INSERT INTO one_foundation_questions (id, unit_id, position, question_text, choices_json, answer_index, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            `one-fdn-q-english-ch${lesson.chapterNumber}-${idx + 1}`,
            unitId,
            idx + 1,
            q.prompt,
            JSON.stringify(q.options),
            q.answerIndex,
            q.explanation
          );
        });
      }

      // Mark English chapter as reviewed
      db.prepare("UPDATE one_chapters SET review_status='reviewed' WHERE id=?").run(chapterId);
    }

    // Mark English subject as reviewed
    db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(englishSubjectId);

    // 2b. Author and seed Hindi (Sarangi) lessons
    const hindiSubject = db.prepare(`
      SELECT s.id 
      FROM one_subjects s
      JOIN one_curriculum_tracks t ON t.id=s.track_id
      WHERE t.board='CBSE' AND t.grade=1 AND s.subject_title='Hindi'
    `).get();

    if (hindiSubject) {
      const hindiSubjectId = hindiSubject.id;

      for (const lesson of GRADE1_HINDI_SARANGI.lessons) {
        const chapter = db.prepare(`
          SELECT id, chapter_number, chapter_title 
          FROM one_chapters 
          WHERE subject_id=? AND chapter_number=?
        `).get(hindiSubjectId, lesson.chapterNumber);

        if (!chapter) {
          console.warn(`[Grade 1 Publisher] Warning: chapter ${lesson.chapterNumber} not found for Hindi.`);
          continue;
        }

        const chapterId = chapter.id;

        if (lesson.chapterNumber === 1) {
          // Update starter Hindi lesson
          const starterConcept = db.prepare("SELECT id FROM one_concepts WHERE id='one-g1-cbse-starter-hindi'").get();

          if (starterConcept) {
            db.prepare(`
              UPDATE one_concepts 
              SET title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now')
              WHERE id='one-g1-cbse-starter-hindi'
            `).run(lesson.title, lesson.story, reviewerId);

            db.prepare(`
              UPDATE one_foundation_units
              SET objective=?, story=?, home_activity=?, expected_minutes=9,
                  status='published', reviewer_id=?, review_reference='ACAD-2026-SARANGI-CH1-VERIFIED',
                  reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
              WHERE id='one-fdn-one-g1-cbse-starter-hindi'
            `).run(lesson.objective, lesson.story, lesson.activity, reviewerId, adminId);

            db.prepare(`
              INSERT OR REPLACE INTO one_foundation_picture_scenes (unit_id, scene_json, step_text_json, teacher_prompt, illustration_rights)
              VALUES (?, ?, ?, ?, 'original_vayentra_svg')
            `).run(
              'one-fdn-one-g1-cbse-starter-hindi',
              JSON.stringify(lesson.visualScene || {}),
              JSON.stringify(lesson.guidedSteps || []),
              lesson.guardianGuide || ''
            );

            db.prepare("DELETE FROM one_foundation_questions WHERE unit_id='one-fdn-one-g1-cbse-starter-hindi'").run();
            lesson.questions.forEach((q, idx) => {
              db.prepare(`
                INSERT INTO one_foundation_questions (id, unit_id, position, question_text, choices_json, answer_index, explanation)
                VALUES (?, 'one-fdn-one-g1-cbse-starter-hindi', ?, ?, ?, ?, ?)
              `).run(
                `one-fdn-q-hindi-ch1-${idx + 1}`,
                idx + 1,
                q.prompt,
                JSON.stringify(q.options),
                q.answerIndex,
                q.explanation
              );
            });
          }
        } else {
          // Chapters 2 to 19
          const conceptId = `one-g1-cbse-hindi-${lesson.conceptKey}`;
          const unitId = `one-fdn-${conceptId}`;

          const existingConcept = db.prepare('SELECT id FROM one_concepts WHERE id=?').get(conceptId);
          if (!existingConcept) {
            db.prepare(`
              INSERT INTO one_concepts (id, chapter_id, position, title, explanation_original, content_status, reviewer_id, reviewed_at)
              VALUES (?, ?, 1, ?, ?, 'published', ?, datetime('now'))
            `).run(conceptId, chapterId, lesson.title, lesson.story, reviewerId);
          } else {
            db.prepare(`
              UPDATE one_concepts 
              SET title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now')
              WHERE id=?
            `).run(lesson.title, lesson.story, reviewerId, conceptId);
          }

          const existingUnit = db.prepare('SELECT id FROM one_foundation_units WHERE id=?').get(unitId);
          if (!existingUnit) {
            db.prepare(`
              INSERT INTO one_foundation_units 
                (id, concept_id, unit_key, grade, board, curriculum_kind, objective, story, home_activity, expected_minutes,
                 status, reviewer_id, review_reference, reviewed_at, publisher_id, published_at)
              VALUES (?, ?, ?, 1, 'CBSE', 'school_support', ?, ?, ?, 9,
                      'published', ?, ?, datetime('now'), ?, datetime('now'))
            `).run(
              unitId,
              conceptId,
              unitId,
              lesson.objective,
              lesson.story,
              lesson.activity,
              reviewerId,
              `ACAD-2026-SARANGI-CH${lesson.chapterNumber}-VERIFIED`,
              adminId
            );
          } else {
            db.prepare(`
              UPDATE one_foundation_units 
              SET objective=?, story=?, home_activity=?, expected_minutes=9, status='published', reviewer_id=?, review_reference=?, reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
              WHERE id=?
            `).run(
              lesson.objective,
              lesson.story,
              lesson.activity,
              reviewerId,
              `ACAD-2026-SARANGI-CH${lesson.chapterNumber}-VERIFIED`,
              adminId,
              unitId
            );
          }

          db.prepare(`
            INSERT OR REPLACE INTO one_foundation_picture_scenes (unit_id, scene_json, step_text_json, teacher_prompt, illustration_rights)
            VALUES (?, ?, ?, ?, 'original_vayentra_svg')
          `).run(
            unitId,
            JSON.stringify(lesson.visualScene || {}),
            JSON.stringify(lesson.guidedSteps || []),
            lesson.guardianGuide || ''
          );

          db.prepare('DELETE FROM one_foundation_questions WHERE unit_id=?').run(unitId);
          lesson.questions.forEach((q, idx) => {
            db.prepare(`
              INSERT INTO one_foundation_questions (id, unit_id, position, question_text, choices_json, answer_index, explanation)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
              `one-fdn-q-hindi-ch${lesson.chapterNumber}-${idx + 1}`,
              unitId,
              idx + 1,
              q.prompt,
              JSON.stringify(q.options),
              q.answerIndex,
              q.explanation
            );
          });
        }

        // Mark Hindi chapter as reviewed
        db.prepare("UPDATE one_chapters SET review_status='reviewed' WHERE id=?").run(chapterId);
      }

      // Mark Hindi subject as reviewed
      db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(hindiSubjectId);
    }

    // 3. Author and seed Mathematics (Joyful Mathematics) lessons - Chapters 1 to 13
    const mathSubject = db.prepare(`
      SELECT s.id 
      FROM one_subjects s
      JOIN one_curriculum_tracks t ON t.id=s.track_id
      WHERE t.board='CBSE' AND t.grade=1 AND s.subject_title='Mathematics'
    `).get();

    if (mathSubject) {
      const mathSubjectId = mathSubject.id;
      db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(mathSubjectId);

      for (const lesson of GRADE1_MATHS_JOYFUL.lessons) {
        let chapter = db.prepare(`
          SELECT id, chapter_number, chapter_title 
          FROM one_chapters 
          WHERE subject_id=? AND chapter_number=?
        `).get(mathSubjectId, lesson.chapterNumber);

        if (!chapter) {
          const chId = `one-g1-ch-${mathSubjectId}-${lesson.chapterNumber}-202627`;
          db.prepare(`
            INSERT INTO one_chapters (id, subject_id, chapter_number, chapter_title, textbook_edition, review_status)
            VALUES (?, ?, ?, ?, '2026-27 Edition', 'reviewed')
          `).run(chId, mathSubjectId, lesson.chapterNumber, lesson.chapterTitle);
          chapter = { id: chId, chapter_number: lesson.chapterNumber, chapter_title: lesson.chapterTitle };
        } else {
          db.prepare("UPDATE one_chapters SET chapter_title=?, review_status='reviewed' WHERE id=?")
            .run(lesson.chapterTitle, chapter.id);
        }

        const chapterId = chapter.id;

        if (lesson.chapterNumber === 1) {
          // Chapter 1 overview starter lesson
          const starterConcept = db.prepare("SELECT id FROM one_concepts WHERE id='one-g1-cbse-starter-mathematics'").get();
          if (starterConcept) {
            db.prepare(`
              UPDATE one_concepts 
              SET title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now')
              WHERE id='one-g1-cbse-starter-mathematics'
            `).run(lesson.title, lesson.story, reviewerId);

            db.prepare(`
              UPDATE one_foundation_units
              SET objective=?, story=?, home_activity=?, expected_minutes=9,
                  status='published', reviewer_id=?, review_reference='ACAD-2026-JOYFUL-MATH-CH1-VERIFIED',
                  reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
              WHERE id='one-fdn-one-g1-cbse-starter-mathematics'
            `).run(lesson.objective, lesson.story, lesson.activity, reviewerId, adminId);

            db.prepare(`
              INSERT OR REPLACE INTO one_foundation_picture_scenes (unit_id, scene_json, step_text_json, teacher_prompt, illustration_rights)
              VALUES (?, ?, ?, ?, 'original_vayentra_svg')
            `).run(
              'one-fdn-one-g1-cbse-starter-mathematics',
              JSON.stringify(lesson.visualScene || {}),
              JSON.stringify(lesson.guidedSteps || []),
              lesson.guardianGuide || ''
            );

            db.prepare("DELETE FROM one_foundation_questions WHERE unit_id='one-fdn-one-g1-cbse-starter-mathematics'").run();
            lesson.questions.forEach((q, idx) => {
              db.prepare(`
                INSERT INTO one_foundation_questions (id, unit_id, position, question_text, choices_json, answer_index, explanation)
                VALUES (?, 'one-fdn-one-g1-cbse-starter-mathematics', ?, ?, ?, ?, ?)
              `).run(
                `one-fdn-q-maths-starter-ch1-${idx + 1}`,
                idx + 1,
                q.prompt,
                JSON.stringify(q.options),
                q.answerIndex,
                q.explanation
              );
            });
          }

          // Ensure Chapter 1's granular units are also published
          db.prepare(`
            UPDATE one_foundation_units 
            SET status='published', reviewer_id=?, review_reference='ACAD-2026-MATHS-CH1-VERIFIED',
                reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
            WHERE grade=1 AND board='CBSE' AND unit_key LIKE 'one-fdn-one-g1-maths-ch1-%'
          `).run(reviewerId, adminId);

          db.prepare(`
            UPDATE one_concepts
            SET content_status='published', reviewer_id=?, reviewed_at=datetime('now')
            WHERE id LIKE 'one-g1-maths-ch1-%'
          `).run(reviewerId);
        } else {
          // Chapters 2 to 13
          const conceptId = `one-g1-cbse-maths-ch${lesson.chapterNumber}-${lesson.conceptKey}`;
          const unitId = `one-fdn-${conceptId}`;

          const existingConcept = db.prepare('SELECT id FROM one_concepts WHERE id=?').get(conceptId);
          if (!existingConcept) {
            db.prepare(`
              INSERT INTO one_concepts (id, chapter_id, position, title, explanation_original, content_status, reviewer_id, reviewed_at)
              VALUES (?, ?, 1, ?, ?, 'published', ?, datetime('now'))
            `).run(conceptId, chapterId, lesson.title, lesson.story, reviewerId);
          } else {
            db.prepare(`
              UPDATE one_concepts 
              SET title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now')
              WHERE id=?
            `).run(lesson.title, lesson.story, reviewerId, conceptId);
          }

          const existingUnit = db.prepare('SELECT id FROM one_foundation_units WHERE id=?').get(unitId);
          if (!existingUnit) {
            db.prepare(`
              INSERT INTO one_foundation_units 
                (id, concept_id, unit_key, grade, board, curriculum_kind, objective, story, home_activity, expected_minutes,
                 status, reviewer_id, review_reference, reviewed_at, publisher_id, published_at)
              VALUES (?, ?, ?, 1, 'CBSE', 'school_support', ?, ?, ?, 9,
                      'published', ?, ?, datetime('now'), ?, datetime('now'))
            `).run(
              unitId,
              conceptId,
              unitId,
              lesson.objective,
              lesson.story,
              lesson.activity,
              reviewerId,
              `ACAD-2026-JOYFUL-MATH-CH${lesson.chapterNumber}-VERIFIED`,
              adminId
            );
          } else {
            db.prepare(`
              UPDATE one_foundation_units 
              SET objective=?, story=?, home_activity=?, expected_minutes=9, status='published', reviewer_id=?, review_reference=?, reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
              WHERE id=?
            `).run(
              lesson.objective,
              lesson.story,
              lesson.activity,
              reviewerId,
              `ACAD-2026-JOYFUL-MATH-CH${lesson.chapterNumber}-VERIFIED`,
              adminId,
              unitId
            );
          }

          db.prepare(`
            INSERT OR REPLACE INTO one_foundation_picture_scenes (unit_id, scene_json, step_text_json, teacher_prompt, illustration_rights)
            VALUES (?, ?, ?, ?, 'original_vayentra_svg')
          `).run(
            unitId,
            JSON.stringify(lesson.visualScene || {}),
            JSON.stringify(lesson.guidedSteps || []),
            lesson.guardianGuide || ''
          );

          db.prepare('DELETE FROM one_foundation_questions WHERE unit_id=?').run(unitId);
          lesson.questions.forEach((q, idx) => {
            db.prepare(`
              INSERT INTO one_foundation_questions (id, unit_id, position, question_text, choices_json, answer_index, explanation)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
              `one-fdn-q-maths-ch${lesson.chapterNumber}-${idx + 1}`,
              unitId,
              idx + 1,
              q.prompt,
              JSON.stringify(q.options),
              q.answerIndex,
              q.explanation
            );
          });
        }
      }
    }

    // 4. Mark AI & Digital Thinking chapters and subject as reviewed & publish all 8 units
    const aiSubject = db.prepare(`
      SELECT s.id 
      FROM one_subjects s
      JOIN one_curriculum_tracks t ON t.id=s.track_id
      WHERE t.board='CBSE' AND t.grade=1 AND s.subject_title='Vayentra Original: AI & Digital Thinking'
    `).get();

    if (aiSubject) {
      db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(aiSubject.id);
      db.prepare("UPDATE one_chapters SET review_status='reviewed' WHERE subject_id=?").run(aiSubject.id);

      db.prepare(`
        UPDATE one_foundation_units
        SET status='published', reviewer_id=?, review_reference='ACAD-2026-AI-ENRICHMENT-VERIFIED',
            reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
        WHERE grade=1 AND board='CBSE' AND unit_key LIKE 'one-fdn-one-g1-cbse-ai-%'
      `).run(reviewerId, adminId);

      db.prepare(`
        UPDATE one_concepts
        SET content_status='published', reviewer_id=?, reviewed_at=datetime('now')
        WHERE id LIKE 'one-g1-cbse-ai-%'
      `).run(reviewerId);
    }

    // 5. Mark Money & Life Skills chapters and subject as reviewed & publish all 8 units
    const moneySubject = db.prepare(`
      SELECT s.id 
      FROM one_subjects s
      JOIN one_curriculum_tracks t ON t.id=s.track_id
      WHERE t.board='CBSE' AND t.grade=1 AND s.subject_title='Vayentra Original: Money & Life Skills'
    `).get();

    if (moneySubject) {
      db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(moneySubject.id);
      db.prepare("UPDATE one_chapters SET review_status='reviewed' WHERE subject_id=?").run(moneySubject.id);

      db.prepare(`
        UPDATE one_foundation_units
        SET status='published', reviewer_id=?, review_reference='ACAD-2026-MONEY-ENRICHMENT-VERIFIED',
            reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
        WHERE grade=1 AND board='CBSE' AND unit_key LIKE 'one-fdn-one-g1-cbse-money-%'
      `).run(reviewerId, adminId);

      db.prepare(`
        UPDATE one_concepts
        SET content_status='published', reviewer_id=?, reviewed_at=datetime('now')
        WHERE id LIKE 'one-g1-cbse-money-%'
      `).run(reviewerId);
    }

    // 6. Author and publish Kannada lessons for Class 1 (CBSE and STATE)
    for (const board of ['CBSE', 'STATE']) {
      const track = db.prepare("SELECT id FROM one_curriculum_tracks WHERE board=? AND grade=1 AND edition_year='2026-27'").get(board);
      if (!track) continue;

      let kannadaSubject = db.prepare("SELECT id FROM one_subjects WHERE track_id=? AND subject_title='Kannada'").get(track.id);
      let kannadaSubjId;
      if (kannadaSubject) {
        kannadaSubjId = kannadaSubject.id;
        db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(kannadaSubjId);
      } else {
        kannadaSubjId = `one-g1-${board.toLowerCase()}-kannada`;
        db.prepare(`
          INSERT INTO one_subjects (id, track_id, subject_title, review_status)
          VALUES (?, ?, 'Kannada', 'reviewed')
        `).run(kannadaSubjId, track.id);
      }

      const kannadaLessons = [
        {
          num: 1,
          title: 'ಅಕ್ಷರ ಲೋಕ (Swaragalu - Vowels: ಅ, ಆ, ಇ, ಈ, ಉ, ಊ)',
          objective: 'ಕನ್ನಡದ ಮೂಲ ಸ್ವರಗಳನ್ನು ಗುರುತಿಸುವುದು ಮತ್ತು ಅವುಗಳ ಧ್ವನಿಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಉಚ್ಚರಿಸುವುದು (Identify and pronounce fundamental Kannada vowels).',
          story: 'ಅಮ್ಮ ನಮಗೆ ಪ್ರೀತಿಯಿಂದ ಊಟ ನೀಡುತ್ತಾಳೆ. ಆನೆಯು ಕಾಡಿನಲ್ಲಿ ಗಂಭೀರವಾಗಿ ಹೆಜ್ಜೆ ಹಾಕುತ್ತದೆ. ಇಲಿಯು ಪುಟ್ಟದಾಗಿ ಓಡುತ್ತದೆ. ಈಜು ಕೊಳದಲ್ಲಿ ನಾವು ಖುಷಿಯಿಂದ ಈಜುತ್ತೇವೆ. ಅ-ಅಮ್ಮ, ಆ-ಆನೆ, ಇ-ಇಲಿ, ಈ-ಈಜು, ಉ-ಉಡುಗೊರೆ, ಊ-ಊಟ. ಈ ಸ್ವರಗಳು ಕನ್ನಡ ಅಕ್ಷರ ಮಾಲೆಯ ಮೊದಲ ಮುತ್ತುಗಳು!',
          activity: 'ಅಕ್ಕಿ ಅಥವಾ ರಂಗೋಲಿ ಪುಡಿಯಲ್ಲಿ ನಿಮ್ಮ ಬೆರಳಿನಿಂದ \'ಅ\' ಮತ್ತು \'ಆ\' ಅಕ್ಷರಗಳನ್ನು ಬರೆದು ಅಭ್ಯಾಸ ಮಾಡಿ.',
          steps: [
            'ಅಕ್ಷರ \'ಅ\' ಧ್ವನಿಯನ್ನು ಕೇಳಿ - ಅಮ್ಮ (Mother).',
            'ಅಕ್ಷರ \'ಆ\' ಧ್ವನಿಯನ್ನು ದೀರ್ಘವಾಗಿ ಹೇಳಿ - ಆನೆ (Elephant).',
            'ಇ - ಇಲಿ (Mouse), ಈ - ಈಜು (Swim).',
            'ಉ - ಉಡುಗೊರೆ (Gift), ಊ - ಊಟ (Meal).'
          ],
          questions: [
            { prompt: '\'ಅ\' ಅಕ್ಷರದಿಂದ ಶುರುವಾಗುವ ಪದ ಯಾವುದು?', options: ['ಅಮ್ಮ (Amma)', 'ಆನೆ (Aane)', 'ಇಲಿ (Ili)', 'ಊಟ (Oota)'], ans: 0, exp: '\'ಅ\' ಅಕ್ಷರದಿಂದ \'ಅಮ್ಮ\' (Mother) ಪದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.' },
            { prompt: '\'ಆ\' ಅಕ್ಷರದಿಂದ ಶುರುವಾಗುವ ಪದ ಯಾವುದು?', options: ['ಮನೆ (Mane)', 'ಆನೆ (Elephant)', 'ಗಿಳಿ (Parrot)', 'ಕಮಲ (Lotus)'], ans: 1, exp: '\'ಆ\' ಅಕ್ಷರದಿಂದ \'ಆನೆ\' (Elephant) ಪದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.' },
            { prompt: 'ಕನ್ನಡ ಸ್ವರಗಳಲ್ಲಿ ಒಟ್ಟು ಎಷ್ಟು ಸ್ವರಗಳಿವೆ?', options: ['೧೩ (13)', '೨೬ (26)', '೮ (8)', '೨ (2)'], ans: 0, exp: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ೧೩ ಮೂಲ ಸ್ವರಗಳಿವೆ (ಅ ರಿಂದ ಔ).' },
            { prompt: '\'ಇಲಿ\' ಪದದ ಮೊದಲ ಅಕ್ಷರ ಯಾವುದು?', options: ['ಅ', 'ಆ', 'ಇ', 'ಈ'], ans: 2, exp: '\'ಇಲಿ\' (Mouse) ಪದವು \'ಇ\' ಅಕ್ಷರದಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.' }
          ]
        },
        {
          num: 2,
          title: 'ಸರಳ ಪದಗಳು ಮತ್ತು ವ್ಯಂಜನಗಳು (Consonants & Simple Words)',
          objective: 'ಕನ್ನಡದ ಸರಳ ವ್ಯಂಜನಗಳನ್ನು ಗುರುತಿಸಿ ಸುಲಭವಾದ ೨-೩ ಅಕ್ಷರಗಳ ಪದಗಳನ್ನು ಓದುವುದು (Read simple 2-3 letter consonant words).',
          story: 'ನಮ್ಮ ಹಳ್ಳಿಯಲ್ಲಿ ಒಂದು ಸುಂದರವಾದ ಕೆರೆ ಇದೆ. ಕೆರೆಯಲ್ಲಿ ಬಿಳಿ ಕಮಲ ಅರಳಿದೆ. ಹಸಿರು ಮರದ ಮೇಲೆ ಗಿಳಿ ಕುಳಿತಿದೆ. ಅಪ್ಪ ತಂದ ತಟ್ಟೆಯಲ್ಲಿ ಸವಿಯಾದ ಹಣ್ಣುಗಳಿವೆ. ಕ-ಕಮಲ, ಗ-ಗಿಳಿ, ಮ-ಮರ, ಮ-ಮನೆ. ನಾವೆಲ್ಲರೂ ಜೊತೆಯಾಗಿ ಕಲಿಯೋಣ!',
          activity: 'ನಿಮ್ಮ ಮನೆಯಲ್ಲಿರುವ ೫ ವಸ್ತುಗಳ ಹೆಸರನ್ನು ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ (ಉದಾಹರಣೆಗೆ: ಚಮಚ, ಲೋಟ, ತಟ್ಟೆ, ಪುಸ್ತಕ, ಬಾಗಿಲು).',
          steps: [
            'ಕ - ಕಮಲ (Lotus)',
            'ಗ - ಗಿಳಿ (Parrot)',
            'ಮ - ಮರ (Tree)',
            'ಮ - ಮನೆ (House)'
          ],
          questions: [
            { prompt: '\'ಕಮಲ\' ಪದದ ಮೊದಲ ವ್ಯಂಜನ ಯಾವುದು?', options: ['ಕ', 'ಗ', 'ಚ', 'ಜ'], ans: 0, exp: '\'ಕಮಲ\' (Lotus) ಪದದ ಮೊದಲ ಅಕ್ಷರ \'ಕ\'.' },
            { prompt: 'ಮರದ ಮೇಲೆ ಕುಳಿತಿರುವ ಹಕ್ಕಿ ಯಾವುದು?', options: ['ಗಿಳಿ (Parrot)', 'ಹುಲಿ (Tiger)', 'ಆನೆ (Elephant)', 'ಮೀನು (Fish)'], ans: 0, exp: 'ಕಥೆಯಲ್ಲಿ ಗಿಳಿಯು ಮರದ ಮೇಲೆ ಕುಳಿತು ಚಿಲಿಪಿಲಿಗುಟ್ಟುತ್ತಿದೆ.' },
            { prompt: '\'ಮನೆ\' ಎಂದರೆ ಇಂಗ್ಲಿಷಿನಲ್ಲಿ ಏನು?', options: ['Tree', 'House', 'Water', 'Book'], ans: 1, exp: '\'ಮನೆ\' ಎಂದರೆ House.' },
            { prompt: '\'ಮರ\' ಪದದಲ್ಲಿ ಎಷ್ಟು ಅಕ್ಷರಗಳಿವೆ?', options: ['೧ (1)', '೨ (2)', '೪ (4)', '೫ (5)'], ans: 1, exp: '\'ಮ\' ಮತ್ತು \'ರ\' - ಒಟ್ಟು ೨ ಅಕ್ಷರಗಳು.' }
          ]
        },
        {
          num: 3,
          title: 'ನನ್ನ ಕುಟುಂಬ ಮತ್ತು ಗೆಳೆಯರು (My Family & Friends)',
          objective: 'ಕುಟುಂಬದ ಸದಸ್ಯರ ಹೆಸರುಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ಹೇಳುವುದು ಮತ್ತು ಗೌರವಪೂರ್ವಕ ಸಂಭಾಷಣೆ ಕಲಿಯುವುದು (Family relations & polite greetings).',
          story: 'ಬೆಳಿಗ್ಗೆ ಎದ್ದ ತಕ್ಷಣ ಅಪ್ಪ ಅಮ್ಮನಿಗೆ "ನಮಸ್ಕಾರ" ಹೇಳಬೇಕು. ಶಾಲೆಯಲ್ಲಿ ಗುರುಗಳಿಗೆ ಗೌರವ ಸಲ್ಲಿಸಬೇಕು. ಅಜ್ಜ ಮತ್ತು ಅಜ್ಜಿ ನಮಗೆ ಚಂದದ ಕಥೆಗಳನ್ನು ಹೇಳುತ್ತಾರೆ. ಅಣ್ಣ, ತಂಗಿ ಮತ್ತು ಗೆಳೆಯರೊಂದಿಗೆ ಪ್ರೀತಿಯಿಂದ ಆಟವಾಡಬೇಕು. "ಧನ್ಯವಾದಗಳು" ಮತ್ತು "ದಯವಿಟ್ಟು" ಎಂಬ ಮೃದು ಮಾತುಗಳು ಎಲ್ಲರಿಗೂ ಇಷ್ಟವಾಗುತ್ತವೆ.',
          activity: 'ಇಂದು ಮನೆಯಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬರಿಗೂ "ನಮಸ್ಕಾರ" ಮತ್ತು ಸಹಾಯ ಮಾಡಿದಾಗ "ಧನ್ಯವಾದಗಳು" ಎಂದು ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ.',
          steps: [
            'ನಮಸ್ಕಾರ (Namaskara - Greetings/Hello)',
            'ಅಪ್ಪ ಮತ್ತು ಅಮ್ಮ (Parents)',
            'ಅಜ್ಜ ಮತ್ತು ಅಜ್ಜಿ (Grandparents)',
            'ಧನ್ಯವಾದಗಳು (Dhanyavadagalu - Thank you)'
          ],
          questions: [
            { prompt: 'ಯಾರಾದರೂ ಮನೆಗೆ ಬಂದಾಗ ನಾವು ಏನು ಹೇಳಿ ಸ್ವಾಗತಿಸಬೇಕು?', options: ['ನಮಸ್ಕಾರ (Namaskara)', 'ಹೋಗಿ ಬನ್ನಿ (Bye)', 'ಸುಮ್ಮನಿರಿ (Quiet)', 'ಗೊತ್ತಿಲ್ಲ (Don\'t know)'], ans: 0, exp: 'ಕನ್ನಡ ಸಂಸ್ಕೃತಿಯಲ್ಲಿ ಅತಿಥಿಗಳನ್ನು "ನಮಸ್ಕಾರ" ಎಂದು ಪ್ರೀತಿಯಿಂದ ಸ್ವಾಗತಿಸುತ್ತೇವೆ.' },
            { prompt: 'ಯಾರಾದರೂ ನಮಗೆ ಸಹಾಯ ಮಾಡಿದಾಗ ಏನು ಹೇಳಬೇಕು?', options: ['ಬೇಡ', 'ಧನ್ಯವಾದಗಳು (Thank you)', 'ಕೋಪ', 'ಅಳು'], ans: 1, exp: 'ಸಹಾಯಕ್ಕೆ ಕೃತಜ್ಞತೆ ಸಲ್ಲಿಸಲು "ಧನ್ಯವಾದಗಳು" ಎಂದು ಹೇಳುತ್ತೇವೆ.' },
            { prompt: '\'ಅಜ್ಜಿ\' ಎಂದರೆ ಯಾರು?', options: ['Grandmother', 'Brother', 'Friend', 'Teacher'], ans: 0, exp: '\'ಅಜ್ಜಿ\' ಎಂದರೆ Grandmother.' },
            { prompt: 'ಗೆಳೆಯರೊಂದಿಗೆ ನಾವು ಹೇಗೆ ಇರಬೇಕು?', options: ['ಜಗಳವಾಡಬೇಕು', 'ಪ್ರೀತಿ ಮತ್ತು ಸ್ನೇಹದಿಂದ ಇರಬೇಕು', 'ಮಾತನಾಡಬಾರದು', 'ಹೊಡೆಯಬೇಕು'], ans: 1, exp: 'ಗೆಳೆಯರೊಂದಿಗೆ ಪ್ರೀತಿ ಮತ್ತು ಸಹಕಾರದಿಂದ ಆಟವಾಡಬೇಕು.' }
          ]
        },
        {
          num: 4,
          title: 'ಬಣ್ಣಗಳು ಮತ್ತು ಪ್ರಾಸ ಗೀತೆಗಳು (Colours & Playful Rhymes)',
          objective: 'ಪ್ರಕೃತಿಯ ವಿವಿಧ ಬಣ್ಣಗಳನ್ನು ಗುರುತಿಸುವುದು ಮತ್ತು ಪ್ರಾಸಬದ್ಧವಾಗಿ ಹಾಡುವುದು (Identify nature colours and recite Kannada rhymes).',
          story: 'ಕಾಗೆ ಕಪ್ಪು, ಹಾಲು ಬಿಳಿ, ಗಿಳಿಯ ಮೈಯು ಹಸಿರು ಕಳಿ! ಕಣ್ಣಿಗೆ ತಂಪು ಆಕಾಶದ ನೀಲಿ, ಅರಿಶಿನ ಹಳದಿ, ಗುಲಾಬಿ ಕೆಂಪು! ಮಳೆಬಿಲ್ಲು ಮೂಡಿದಾಗ ಆಕಾಶದಲ್ಲಿ ಏಳು ಬಣ್ಣಗಳ ಸಡಗರ. ಬಣ್ಣಗಳ ಜಗತ್ತು ಎಷ್ಟು ಚಂದ!',
          activity: 'ನಿಮ್ಮ ಬಳಿ ಇರುವ ಬಣ್ಣದ ಪೆನ್ಸಿಲ್‌ಗಳನ್ನು ತೆಗೆದುಕೊಂಡು ಕೆಂಪು, ಹಳದಿ, ಹಸಿರು, ನೀಲಿ ಬಣ್ಣಗಳಿಂದ ಸುಂದರವಾದ ಮಳೆಬಿಲ್ಲನ್ನು ಬಿಡಿಸಿ.',
          steps: [
            'ಕೆಂಪು (Red) - ಸೇಬು ಹಣ್ಣು',
            'ಹಳದಿ (Yellow) - ಬಾಳೆಹಣ್ಣು',
            'ಹಸಿರು (Green) - ಮರದ ಎಲೆ',
            'ಬಿಳಿ (White) - ಹಸುವಿನ ಹಾಲು'
          ],
          questions: [
            { prompt: 'ಹಾಲಿನ ಬಣ್ಣ ಯಾವುದು?', options: ['ಕಪ್ಪು (Black)', 'ಬಿಳಿ (White)', 'ಕೆಂಪು (Red)', 'ಹಸಿರು (Green)'], ans: 1, exp: 'ಹಾಲಿನ ಬಣ್ಣ ಬಿಳಿ (White).' },
            { prompt: 'ಗಿಳಿಯ ಮೈಬಣ್ಣ ಯಾವುದು?', options: ['ಹಸಿರು (Green)', 'ನೀಲಿ (Blue)', 'ಹಳದಿ (Yellow)', 'ಕಪ್ಪು (Black)'], ans: 0, exp: 'ಗಿಳಿಯು ಹಸಿರು (Green) ಬಣ್ಣದಲ್ಲಿರುತ್ತದೆ.' },
            { prompt: '\'ಕೆಂಪು\' ಬಣ್ಣದ ಹಣ್ಣು ಯಾವುದು?', options: ['ಸೇಬು (Apple)', 'ತೆಂಗಿನಕಾಯಿ (Coconut)', 'ಹಾಲು (Milk)', 'ಎಲೆ (Leaf)'], ans: 0, exp: 'ಸೇಬು ಹಣ್ಣು ಕೆಂಪು (Red) ಬಣ್ಣದ್ದಾಗಿದೆ.' },
            { prompt: 'ಮಳೆಬಿಲ್ಲಿನಲ್ಲಿ (Rainbow) ಎಷ್ಟು ಬಣ್ಣಗಳಿರುತ್ತವೆ?', options: ['೩ (3)', '೫ (5)', '೭ (7)', '೧೦ (10)'], ans: 2, exp: 'ಮಳೆಬಿಲ್ಲಿನಲ್ಲಿ ಏಳು (7) ಬಣ್ಣಗಳಿರುತ್ತವೆ.' }
          ]
        }
      ];

      for (const kl of kannadaLessons) {
        let existingCh = db.prepare('SELECT id FROM one_chapters WHERE subject_id=? AND chapter_number=?').get(kannadaSubjId, kl.num);
        let chId;
        if (existingCh) {
          chId = existingCh.id;
          db.prepare("UPDATE one_chapters SET chapter_title=?, review_status='reviewed' WHERE id=?").run(kl.title, chId);
        } else {
          chId = `${kannadaSubjId}-ch-${kl.num}`;
          db.prepare(`
            INSERT INTO one_chapters (id, subject_id, chapter_number, chapter_title, textbook_edition, review_status)
            VALUES (?, ?, ?, ?, '2026-27 Edition', 'reviewed')
          `).run(chId, kannadaSubjId, kl.num, kl.title);
        }

        const conceptId = `${kannadaSubjId}-ch-${kl.num}-concept`;
        const existingConcept = db.prepare('SELECT id FROM one_concepts WHERE id=?').get(conceptId);
        if (existingConcept) {
          db.prepare("UPDATE one_concepts SET chapter_id=?, title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now') WHERE id=?")
            .run(chId, kl.title, kl.story, reviewerId, conceptId);
        } else {
          db.prepare(`
            INSERT INTO one_concepts (id, chapter_id, position, title, explanation_original, content_status, reviewer_id, reviewed_at)
            VALUES (?, ?, 1, ?, ?, 'published', ?, datetime('now'))
          `).run(conceptId, chId, kl.title, kl.story, reviewerId);
        }

        const unitId = `one-fdn-${conceptId}`;
        const existingUnit = db.prepare('SELECT id FROM one_foundation_units WHERE id=?').get(unitId);
        if (existingUnit) {
          db.prepare(`
            UPDATE one_foundation_units
            SET objective=?, story=?, home_activity=?, expected_minutes=10, status='published', reviewer_id=?, reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
            WHERE id=?
          `).run(kl.objective, kl.story, kl.activity, reviewerId, adminId, unitId);
        } else {
          db.prepare(`
            INSERT INTO one_foundation_units (id, concept_id, unit_key, grade, board, curriculum_kind, objective, story, home_activity, expected_minutes, status, reviewer_id, review_reference, reviewed_at, publisher_id, published_at)
            VALUES (?, ?, ?, 1, ?, 'school_support', ?, ?, ?, 10, 'published', ?, 'ACAD-2026-KANNADA-G1-VERIFIED', datetime('now'), ?, datetime('now'))
          `).run(unitId, conceptId, unitId, board, kl.objective, kl.story, kl.activity, reviewerId, adminId);
        }

        // Steps
        db.prepare(`
          INSERT OR REPLACE INTO one_foundation_picture_scenes (unit_id, scene_json, step_text_json, teacher_prompt, illustration_rights)
          VALUES (?, '{}', ?, ?, 'original_vayentra_svg')
        `).run(unitId, JSON.stringify(kl.steps), 'Listen and practice pronunciation with an adult.');

        // Questions
        db.prepare('DELETE FROM one_foundation_questions WHERE unit_id=?').run(unitId);
        kl.questions.forEach((q, idx) => {
          db.prepare(`
            INSERT INTO one_foundation_questions (id, unit_id, position, question_text, choices_json, answer_index, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(`${unitId}-q${idx + 1}`, unitId, idx + 1, q.prompt, JSON.stringify(q.options), q.ans, q.exp);
        });
      }
    }

    // 7. Author and publish Karnataka STATE Grade 1 subjects & lessons
    const stateTrack = db.prepare("SELECT id FROM one_curriculum_tracks WHERE board='STATE' AND grade=1 AND edition_year='2026-27'").get();
    if (stateTrack) {
      db.prepare("UPDATE one_curriculum_tracks SET catalogue_status='verified' WHERE id=?").run(stateTrack.id);

      // 7a. STATE AI & Digital Thinking (8 modules)
      const stateAi = db.prepare("SELECT id FROM one_subjects WHERE track_id=? AND subject_title='Vayentra Original: AI & Digital Thinking'").get(stateTrack.id);
      if (stateAi) {
        db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(stateAi.id);
        db.prepare("UPDATE one_chapters SET review_status='reviewed' WHERE subject_id=?").run(stateAi.id);
        db.prepare(`
          UPDATE one_foundation_units
          SET status='published', reviewer_id=?, review_reference='ACAD-2026-STATE-AI-VERIFIED',
              reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
          WHERE grade=1 AND board='STATE' AND unit_key LIKE 'one-fdn-one-g1-state-ai-%'
        `).run(reviewerId, adminId);
        db.prepare(`
          UPDATE one_concepts
          SET content_status='published', reviewer_id=?, reviewed_at=datetime('now')
          WHERE id LIKE 'one-g1-state-ai-%'
        `).run(reviewerId);
      }

      // 7b. STATE Money & Life Skills (8 modules)
      const stateMoney = db.prepare("SELECT id FROM one_subjects WHERE track_id=? AND subject_title='Vayentra Original: Money & Life Skills'").get(stateTrack.id);
      if (stateMoney) {
        db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(stateMoney.id);
        db.prepare("UPDATE one_chapters SET review_status='reviewed' WHERE subject_id=?").run(stateMoney.id);
        db.prepare(`
          UPDATE one_foundation_units
          SET status='published', reviewer_id=?, review_reference='ACAD-2026-STATE-MONEY-VERIFIED',
              reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
          WHERE grade=1 AND board='STATE' AND unit_key LIKE 'one-fdn-one-g1-state-money-%'
        `).run(reviewerId, adminId);
        db.prepare(`
          UPDATE one_concepts
          SET content_status='published', reviewer_id=?, reviewed_at=datetime('now')
          WHERE id LIKE 'one-g1-state-money-%'
        `).run(reviewerId);
      }

      // 7c. STATE Starters: English, Mathematics, Environmental Studies
      const stateStarters = [
        {
          subjectTitle: 'English',
          chapterTitle: 'Hello and My Name',
          conceptId: 'one-g1-state-starter-english',
          unitId: 'one-fdn-one-g1-state-starter-english',
          title: 'Speaking and Greetings: Hello, My Name Is Tara',
          objective: 'Speak a friendly greeting, introduce yourself clearly, and practise polite listening with friends and family.',
          story: 'Hello! My name is Tara. When we meet someone new, we look with a warm smile and say "Hello!". Listening carefully to our friend\'s name helps us make good friends. We can share what we enjoy, like drawing or singing. Being kind and patient with everyone\'s words helps us all learn happily together.',
          activity: 'Stand in front of a mirror or a family member. Smile, wave gently, and say: "Hello, my name is [your name]! Nice to meet you."',
          steps: ['Smile and say "Hello" or "Good morning".', 'Say your name clearly: "My name is...".', 'Ask your friend politely: "What is your name?".', 'Listen with full attention.'],
          questions: [
            { prompt: 'What is a polite way to greet someone when you meet them?', options: ['Say "Hello" with a warm smile', 'Shout loudly and look away', 'Walk away without speaking'], ans: 0, exp: 'Saying "Hello" with a warm smile shows kindness and politeness.' },
            { prompt: 'When a new friend tells you their name, what should you do?', options: ['Listen carefully and remember it', 'Cover your ears', 'Laugh at their name'], ans: 0, exp: 'Listening carefully shows respect to your new friend.' },
            { prompt: 'How do you say your own name clearly in English?', options: ['"My name is..."', '"I am nothing"', '"Goodbye now"'], ans: 0, exp: 'We say "My name is..." followed by our name.' },
            { prompt: 'Why is it good to learn each other\'s names?', options: ['It helps us make good friends and play together', 'It is not helpful', 'Names do not matter'], ans: 0, exp: 'Knowing names brings friends closer together.' }
          ]
        },
        {
          subjectTitle: 'Mathematics',
          chapterTitle: 'Where Is It? Spatial Positions',
          conceptId: 'one-g1-state-starter-mathematics',
          unitId: 'one-fdn-one-g1-state-starter-mathematics',
          title: 'Positional Words: Near, Far, Above, Below, Inside, Outside',
          objective: 'Identify and describe positions of objects using spatial language in everyday settings.',
          story: 'Ravi\'s wooden toy train is on the study table. Now Ravi puts it under the table. When the parrot flies up, it is ABOVE the mango tree. The colourful fish swim INSIDE the pond, while the frog hops OUTSIDE on the grass. Using words like on, under, above, below, inside, and outside helps us find and organise things every single day!',
          activity: 'Take a book and a ball. Put the ball ON the book, then UNDER the book, then BESIDE the book. Explain each position.',
          steps: ['Identify what is ON your table.', 'Look up: what is ABOVE you?', 'Look down: what is ON the floor BELOW?'],
          questions: [
            { prompt: 'Where is an object if it is resting on top of a table?', options: ['ON the table', 'UNDER the table', 'FAR in the sky'], ans: 0, exp: 'Resting on top means it is ON the table.' },
            { prompt: 'Where are the stars in the night sky relative to the ground?', options: ['ABOVE the ground', 'UNDER the ground', 'INSIDE a box'], ans: 0, exp: 'The night sky is high ABOVE the ground.' },
            { prompt: 'If an eraser is placed inside your pencil pouch, where is it?', options: ['INSIDE the pouch', 'OUTSIDE the house', 'BEHIND the moon'], ans: 0, exp: 'Inside means contained within the pouch.' },
            { prompt: 'What is the opposite of NEAR?', options: ['FAR', 'CLOSE', 'INSIDE'], ans: 0, exp: 'The opposite of near is far away.' }
          ]
        },
        {
          subjectTitle: 'Environmental Studies',
          chapterTitle: 'People Who Help Us in Our Community',
          conceptId: 'one-g1-state-starter-environmental-studies',
          unitId: 'one-fdn-one-g1-state-starter-environmental-studies',
          title: 'Our Caring Community Helpers',
          objective: 'Recognise community helpers (farmers, teachers, sanitation workers, doctors) and express gratitude with respect.',
          story: 'Every morning our neighbourhood comes alive! Farmers grow fresh vegetables, cleaners sweep the clean paths, teachers guide us with kind stories, and doctors help us when we feel sick. Every job is important and keeps our world healthy and cheerful. When someone helps us, saying a sincere "Thank you" brings joy to everyone!',
          activity: 'Draw a thank-you card for someone who helps you every day (such as a school helper, parent, or neighbourhood worker).',
          steps: ['Notice three people helping in your school or neighbourhood today.', 'Say a polite "Thank you" to someone who helps clean or serve food.', 'Remember: every honest job deserves dignity and respect.'],
          questions: [
            { prompt: 'Who helps us grow fresh grains, fruits, and vegetables to eat?', options: ['Farmers', 'Astronauts', 'Mechanics'], ans: 0, exp: 'Farmers work hard in the fields to grow our food.' },
            { prompt: 'What should we say to someone who helps us every day?', options: ['"Thank you!" with respect', '"Nothing at all"', '"Go away"'], ans: 0, exp: 'Saying "Thank you" shows appreciation and respect.' },
            { prompt: 'Who helps us stay healthy and cares for us when we are sick?', options: ['Doctors and nurses', 'Bus drivers', 'Carpenters'], ans: 0, exp: 'Doctors and nurses provide medical care when we are unwell.' },
            { prompt: 'Are all honest jobs important in a community?', options: ['Yes, every honest job helps our community thrive', 'No, only some matter', 'None of them matter'], ans: 0, exp: 'Every kind of honest work is valuable and worthy of respect.' }
          ]
        }
      ];

      for (const st of stateStarters) {
        const subj = db.prepare("SELECT id FROM one_subjects WHERE track_id=? AND subject_title=?").get(stateTrack.id, st.subjectTitle);
        if (!subj) continue;

        db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(subj.id);

        let ch = db.prepare("SELECT id FROM one_chapters WHERE subject_id=?").get(subj.id);
        if (ch) {
          db.prepare("UPDATE one_chapters SET chapter_title=?, review_status='reviewed' WHERE id=?").run(st.chapterTitle, ch.id);
        } else {
          const chId = `one-g1-ch-${subj.id}-1`;
          db.prepare(`
            INSERT INTO one_chapters (id, subject_id, chapter_number, chapter_title, textbook_edition, review_status)
            VALUES (?, ?, 1, ?, '2026-27 Edition', 'reviewed')
          `).run(chId, subj.id, st.chapterTitle);
          ch = { id: chId };
        }

        db.prepare(`
          UPDATE one_concepts 
          SET title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now')
          WHERE id=?
        `).run(st.title, st.story, reviewerId, st.conceptId);

        db.prepare(`
          UPDATE one_foundation_units
          SET objective=?, story=?, home_activity=?, expected_minutes=10,
              status='published', reviewer_id=?, review_reference='ACAD-2026-STATE-VERIFIED',
              reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
          WHERE id=?
        `).run(st.objective, st.story, st.activity, reviewerId, adminId, st.unitId);

        db.prepare(`
          INSERT OR REPLACE INTO one_foundation_picture_scenes (unit_id, scene_json, step_text_json, teacher_prompt, illustration_rights)
          VALUES (?, '{}', ?, 'Discuss with an adult or teacher.', 'original_vayentra_svg')
        `).run(st.unitId, JSON.stringify(st.steps));

        db.prepare('DELETE FROM one_foundation_questions WHERE unit_id=?').run(st.unitId);
        st.questions.forEach((q, idx) => {
          db.prepare(`
            INSERT INTO one_foundation_questions (id, unit_id, position, question_text, choices_json, answer_index, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(`${st.unitId}-q${idx + 1}`, st.unitId, idx + 1, q.prompt, JSON.stringify(q.options), q.ans, q.exp);
        });
      }

      // Clean up STATE Kannada duplicate chapter if any
      const dupCh = db.prepare("SELECT id FROM one_chapters WHERE id='one-g1-ch-one-g1-state-kannada-1-Vayentra'").get();
      if (dupCh) {
        db.prepare("DELETE FROM one_foundation_questions WHERE unit_id='one-fdn-one-g1-state-starter-kannada'").run();
        db.prepare("DELETE FROM one_foundation_units WHERE id='one-fdn-one-g1-state-starter-kannada'").run();
        db.prepare("DELETE FROM one_concepts WHERE id='one-g1-state-starter-kannada'").run();
        db.prepare("DELETE FROM one_chapters WHERE id=?").run(dupCh.id);
      }
    }

    // Record publication audit in one_foundation_reviews for all Class 1 published units
    const publishedUnits = db.prepare(`
      SELECT id FROM one_foundation_units WHERE grade=1 AND status='published'
    `).all();

    for (const u of publishedUnits) {
      const hasReview = db.prepare("SELECT 1 FROM one_foundation_reviews WHERE unit_id=? AND decision='published'").get(u.id);
      if (!hasReview) {
        db.prepare(`
          INSERT INTO one_foundation_reviews (id, unit_id, actor_user_id, decision, evidence_reference)
          VALUES (?, ?, ?, 'published', 'ACAD-2026-EDITORIAL-BOARD-APPROVAL')
        `).run('one-g1-review-' + randomUUID(), u.id, adminId);
      }
    }

    // Ensure student.grade1@vayentra.org linked to stu-g1-001 (Milo Sharma, Grade 1 CBSE)
    const defaultPassword = 'Gurukula@2026';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);
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
    console.log(`[Grade 1 Publisher] Successfully published ${publishedUnits.length} Class 1 lessons across CBSE & STATE.`);
    return { success: true, publishedUnitsCount: publishedUnits.length };
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('[Grade 1 Publisher] Error seeding and publishing curriculum:', err);
    throw err;
  }
}

// Direct execution
const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirect) {
  const result = seedAndPublishGrade1Curriculum();
  console.log('Result:', result);
}
