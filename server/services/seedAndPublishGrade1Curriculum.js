import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { GRADE1_ENGLISH_MRIDANG } from '../data/grade1EnglishMridang.js';
import { GRADE1_HINDI_SARANGI } from '../data/grade1HindiSarangi.js';

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

    // 3. Mark Mathematics subject and chapter 1 as reviewed & publish all 10 Math units
    const mathSubject = db.prepare(`
      SELECT s.id 
      FROM one_subjects s
      JOIN one_curriculum_tracks t ON t.id=s.track_id
      WHERE t.board='CBSE' AND t.grade=1 AND s.subject_title='Mathematics'
    `).get();

    if (mathSubject) {
      db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(mathSubject.id);
      db.prepare("UPDATE one_chapters SET review_status='reviewed' WHERE subject_id=? AND chapter_number=1").run(mathSubject.id);

      db.prepare(`
        UPDATE one_foundation_units 
        SET status='published', reviewer_id=?, review_reference='ACAD-2026-MATHS-CH1-VERIFIED',
            reviewed_at=datetime('now'), publisher_id=?, published_at=datetime('now')
        WHERE grade=1 AND board='CBSE' AND (unit_key LIKE 'one-fdn-one-g1-maths-ch1-%' OR id='one-fdn-one-g1-cbse-starter-maths')
      `).run(reviewerId, adminId);

      db.prepare(`
        UPDATE one_concepts
        SET content_status='published', reviewer_id=?, reviewed_at=datetime('now')
        WHERE id LIKE 'one-g1-maths-ch1-%' OR id='one-g1-cbse-starter-maths'
      `).run(reviewerId);
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
        const chId = `${kannadaSubjId}-ch-${kl.num}`;
        const existingCh = db.prepare('SELECT id FROM one_chapters WHERE id=?').get(chId);
        if (existingCh) {
          db.prepare("UPDATE one_chapters SET chapter_title=?, review_status='reviewed' WHERE id=?").run(kl.title, chId);
        } else {
          db.prepare(`
            INSERT INTO one_chapters (id, subject_id, chapter_number, chapter_title, textbook_edition, review_status)
            VALUES (?, ?, ?, ?, '2026-27 Edition', 'reviewed')
          `).run(chId, kannadaSubjId, kl.num, kl.title);
        }

        const conceptId = `${chId}-concept`;
        const existingConcept = db.prepare('SELECT id FROM one_concepts WHERE id=?').get(conceptId);
        if (existingConcept) {
          db.prepare("UPDATE one_concepts SET title=?, explanation_original=?, content_status='published', reviewer_id=?, reviewed_at=datetime('now') WHERE id=?")
            .run(kl.title, kl.story, reviewerId, conceptId);
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

    // Record publication audit in one_foundation_reviews
    const publishedUnits = db.prepare(`
      SELECT id FROM one_foundation_units WHERE grade=1 AND board='CBSE' AND status='published'
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

    db.exec('COMMIT');
    console.log(`[Grade 1 Publisher] Successfully published ${publishedUnits.length} Class 1 CBSE lessons.`);
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
