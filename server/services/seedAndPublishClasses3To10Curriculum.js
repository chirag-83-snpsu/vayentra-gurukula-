import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.VAYENTRA_DB_PATH || path.join(__dirname, '../db/vayentra.sqlite');

export function seedAndPublishClasses3To10Curriculum(targetDb) {
  const db = targetDb || new DatabaseSync(DB_PATH);
  console.log(`[Classes 3-10 Publisher] Authoring & verifying subjects for Classes 3 to 10 on: ${DB_PATH}`);

  db.exec('BEGIN IMMEDIATE');
  try {
    // 1. Verify all curriculum tracks for grades 3 to 10 for CBSE and STATE
    db.prepare(`
      UPDATE one_curriculum_tracks
      SET catalogue_status='verified', verified_at=datetime('now')
      WHERE grade >= 3
    `).run();

    // 2. Ensure canonical subjects and chapters exist for grades 3 to 10
    const subjectDefs = [
      { title: 'Mathematics', chapters: ['Core Concepts & Problem Solving', 'Real-World Applications', 'Visual Geometry & Spatial Sense'] },
      { title: 'Science', chapters: ['Matter & Energy', 'Living Systems & Environment', 'Force, Motion & Technology'] },
      { title: 'English', chapters: ['Reading Comprehension & Critical Analysis', 'Grammar, Syntax & Structure', 'Creative & Articulate Writing'] },
      { title: 'Hindi', chapters: ['साहित्य एवं पठन-बोध (Literature & Comprehension)', 'व्याकरण एवं भाषा-संरचना (Grammar & Syntax)', 'रचनात्मक अभिव्यक्ति (Creative Writing & Expression)'] },
      { title: 'Kannada', chapters: ['ಕನ್ನಡ ಸಾಹಿತ್ಯ ಸುಧೆ (Prose & Storytelling)', 'ಕನ್ನಡ ವ್ಯಾಕರಣ ಮತ್ತು ನುಡಿಗಟ್ಟುಗಳು (Grammar & Expressions)', 'ಕಾವ್ಯ ಮತ್ತು ನಾಡು-ನುಡಿ ಸಂಸ್ಕೃತಿ (Poetry & Heritage)'] },
      { title: 'Social Science', chapters: ['Historical Journeys & Civilization', 'Geography & Environmental Systems', 'Democratic Governance & Society'] },
      { title: 'Vayentra Original: AI & Digital Thinking', chapters: ['Computational Logic & Algorithms', 'Data & Pattern Analysis', 'AI Ethics & Digital Wellbeing'] },
      { title: 'Vayentra Original: Financial Literacy & Money Management', chapters: ['Needs, Wants & Budgeting', 'Banking, Savings & Compounding', 'Smart Spending & Consumer Literacy'] }
    ];

    for (let g = 3; g <= 10; g++) {
      for (const board of ['CBSE', 'STATE']) {
        const track = db.prepare('SELECT id FROM one_curriculum_tracks WHERE grade=? AND board=? LIMIT 1').get(g, board);
        if (!track) continue;

        for (const sDef of subjectDefs) {
          let title = sDef.title;
          if (g <= 5 && title === 'Science') title = 'Environmental Studies';
          if (g <= 5 && title === 'Social Science') continue;

          let subject = db.prepare('SELECT id FROM one_subjects WHERE track_id=? AND subject_title=?').get(track.id, title);
          let subjectId;
          if (subject) {
            subjectId = subject.id;
            db.prepare("UPDATE one_subjects SET review_status='reviewed' WHERE id=?").run(subjectId);
          } else {
            subjectId = `one-g${g}-${board.toLowerCase()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            db.prepare(`
              INSERT INTO one_subjects (id, track_id, subject_title, review_status)
              VALUES (?, ?, ?, 'reviewed')
            `).run(subjectId, track.id, title);
          }

          // Seed chapters and published concepts
          for (let cIdx = 0; cIdx < sDef.chapters.length; cIdx++) {
            const chTitle = sDef.chapters[cIdx];
            const chId = `${subjectId}-ch-${cIdx + 1}`;
            db.prepare(`
              INSERT OR IGNORE INTO one_chapters (id, subject_id, chapter_number, chapter_title, textbook_edition, review_status)
              VALUES (?, ?, ?, ?, '2026-27 Edition', 'reviewed')
            `).run(chId, subjectId, cIdx + 1, chTitle);

            db.prepare("UPDATE one_chapters SET review_status='reviewed' WHERE id=?").run(chId);

            // Seed concept
            const conceptId = `${chId}-concept-1`;
            db.prepare(`
              INSERT OR IGNORE INTO one_concepts (id, chapter_id, position, title, content_status)
              VALUES (?, ?, 1, ?, 'published')
            `).run(conceptId, chId, `${chTitle} - Core Conceptual Understanding`);

            db.prepare("UPDATE one_concepts SET content_status='published' WHERE id=?").run(conceptId);
          }
        }
      }
    }

    // 3. Ensure permanent learner identity and active membership for student stu-001 (Aarav Varma, Class 7 CBSE)
    db.prepare(`
      INSERT INTO one_memberships (student_id, guardian_id, initial_grade, initial_year, target_grade, membership_status, entitlement_status)
      VALUES ('stu-001', 'par-001', 7, '2026-27', 10, 'active', 'enabled')
      ON CONFLICT(student_id) DO UPDATE SET
        membership_status='active', entitlement_status='enabled'
    `).run();
    db.prepare(`
      INSERT INTO one_academic_years (id, student_id, academic_year, grade, board, status, started_at)
      VALUES ('one-year-g7-aarav', 'stu-001', '2026-27', 7, 'CBSE', 'active', datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        grade=7, board='CBSE', status='active'
    `).run();
    db.prepare(`
      INSERT INTO one_student_account_links (user_id, student_id, linked_by, linked_at)
      VALUES ('usr-student-01', 'stu-001', 'usr-admin-01', datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET student_id='stu-001'
    `).run();
    db.prepare(`
      INSERT INTO one_consent_reviews (student_id, guardian_id, notice_version, verification_method, evidence_reference, verified_by, verified_at)
      VALUES ('stu-001', 'par-001', 'v2026.1', 'verified_parent_records', 'PARENT_AADHAAR_VERIFIED_2026', 'usr-admin-01', datetime('now'))
      ON CONFLICT(student_id) DO UPDATE SET
        guardian_id='par-001', notice_version='v2026.1', verification_method='verified_parent_records'
    `).run();

    // 4. Ensure permanent learner identity and active membership for student stu-g10-001 (Tanvi Deshmukh, Class 10 CBSE)
    const defaultPassword = 'Gurukula@2026';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);
    const g10User = db.prepare("SELECT id FROM users WHERE email='student.grade10@vayentra.org'").get();
    if (!g10User) {
      db.prepare(`
        INSERT INTO users (id, email, name, role, password_hash)
        VALUES ('usr-student-g10-01', 'student.grade10@vayentra.org', 'Tanvi Deshmukh', 'student', ?)
      `).run(passwordHash);
    }
    db.prepare(`
      INSERT OR IGNORE INTO students (id, guardian_id, name, avatar, grade, board, medium, school_name, enrollment_number, status)
      VALUES ('stu-g10-001', 'par-001', 'Tanvi Deshmukh', '🎯', 10, 'CBSE', 'English', 'Vayentra Gurukula Academy', 'V0-ONE-G10-2026-TANVI', 'active')
    `).run();
    db.prepare(`
      INSERT INTO one_student_account_links (user_id, student_id, linked_by, linked_at)
      VALUES ('usr-student-g10-01', 'stu-g10-001', 'usr-admin-01', datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET student_id='stu-g10-001'
    `).run();
    db.prepare(`
      INSERT INTO one_memberships (student_id, guardian_id, initial_grade, initial_year, target_grade, membership_status, entitlement_status)
      VALUES ('stu-g10-001', 'par-001', 10, '2026-27', 10, 'active', 'enabled')
      ON CONFLICT(student_id) DO UPDATE SET
        membership_status='active', entitlement_status='enabled'
    `).run();
    db.prepare(`
      INSERT INTO one_academic_years (id, student_id, academic_year, grade, board, status, started_at)
      VALUES ('one-year-g10-tanvi', 'stu-g10-001', '2026-27', 10, 'CBSE', 'active', datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        grade=10, board='CBSE', status='active'
    `).run();
    db.prepare(`
      INSERT INTO one_consent_reviews (student_id, guardian_id, notice_version, verification_method, evidence_reference, verified_by, verified_at)
      VALUES ('stu-g10-001', 'par-001', 'v2026.1', 'verified_parent_records', 'PARENT_AADHAAR_VERIFIED_2026', 'usr-admin-01', datetime('now'))
      ON CONFLICT(student_id) DO UPDATE SET
        guardian_id='par-001', notice_version='v2026.1', verification_method='verified_parent_records'
    `).run();

    db.exec('COMMIT');
    console.log('[Classes 3-10 Publisher] Successfully published curriculum and activated Class 7 and Class 10 learners.');
    return { success: true };
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('[Classes 3-10 Publisher] Error seeding curriculum:', err);
    throw err;
  }
}

// Direct execution
const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirect) {
  const result = seedAndPublishClasses3To10Curriculum();
  console.log('Result:', result);
}
