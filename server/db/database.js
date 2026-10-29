import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'vayentra.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Enable foreign key constraints & WAL mode for performance
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  console.log(`[Vayentra DB] Initializing SQLite database at: ${DB_PATH}`);

  // Create core tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_id TEXT UNIQUE,
      email TEXT UNIQUE,
      mobile TEXT UNIQUE,
      name TEXT NOT NULL,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'parent',
      password_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS guardians (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      parent_pin TEXT NOT NULL DEFAULT '1234',
      subscription_status TEXT NOT NULL DEFAULT 'Active',
      plan_name TEXT NOT NULL DEFAULT 'Annual Gurukula Pro + AI Tutor',
      renewal_date TEXT NOT NULL DEFAULT '2027-04-10',
      outstanding_fee REAL NOT NULL DEFAULT 0.0,
      emergency_phone TEXT,
      verified_adult INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      guardian_id TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT '🦊',
      grade INTEGER NOT NULL,
      board TEXT NOT NULL DEFAULT 'CBSE',
      medium TEXT NOT NULL DEFAULT 'English',
      school_name TEXT NOT NULL DEFAULT 'Vayentra Gurukula Academy',
      child_pin TEXT NOT NULL DEFAULT '0000',
      daily_time_limit_mins INTEGER NOT NULL DEFAULT 45,
      minutes_used_today INTEGER NOT NULL DEFAULT 22,
      bedtime_lock TEXT NOT NULL DEFAULT '21:30',
      has_consent INTEGER NOT NULL DEFAULT 1,
      consent_timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      streak_days INTEGER NOT NULL DEFAULT 5,
      stars_earned INTEGER NOT NULL DEFAULT 42,
      points INTEGER NOT NULL DEFAULT 1250,
      FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS consent_records (
      id TEXT PRIMARY KEY,
      guardian_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      policy_version TEXT NOT NULL DEFAULT 'v2.1',
      guardian_ip TEXT NOT NULL,
      legal_hash TEXT NOT NULL,
      granted_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_revoked INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (guardian_id) REFERENCES guardians(id),
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      subject_kn TEXT NOT NULL,
      grade INTEGER NOT NULL,
      board TEXT NOT NULL,
      title TEXT NOT NULL,
      title_kn TEXT NOT NULL,
      description TEXT NOT NULL,
      progress_percent INTEGER NOT NULL DEFAULT 0,
      is_mastered INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS episodes (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      title TEXT NOT NULL,
      title_kn TEXT NOT NULL,
      episode_number INTEGER NOT NULL,
      total_episodes INTEGER NOT NULL,
      duration_minutes INTEGER NOT NULL,
      hook TEXT NOT NULL,
      explanation TEXT NOT NULL,
      real_world_example TEXT NOT NULL,
      try_it_prompt TEXT NOT NULL,
      recap_bullets_json TEXT NOT NULL,
      is_locked INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0,
      score_percent INTEGER NOT NULL DEFAULT 0,
      reviewer_name TEXT NOT NULL,
      verified_date TEXT NOT NULL,
      board_alignment TEXT NOT NULL,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checkpoint_questions (
      id TEXT PRIMARY KEY,
      episode_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      prompt_kn TEXT,
      options_json TEXT NOT NULL,
      correct_index INTEGER NOT NULL,
      concept_id TEXT NOT NULL,
      explanation TEXT NOT NULL,
      FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS practice_flashcards (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      concept_name TEXT NOT NULL,
      box_level INTEGER NOT NULL DEFAULT 1,
      front_prompt TEXT NOT NULL,
      back_answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      last_reviewed TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timed_tests (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade INTEGER NOT NULL,
      board TEXT NOT NULL,
      time_limit_mins INTEGER NOT NULL DEFAULT 20,
      pass_mark_percent INTEGER NOT NULL DEFAULT 60,
      questions_json TEXT NOT NULL,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id)
    );

    CREATE TABLE IF NOT EXISTS test_attempts (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      test_id TEXT NOT NULL,
      title TEXT NOT NULL,
      score_percent INTEGER NOT NULL,
      correct_count INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      passed INTEGER NOT NULL,
      duration_secs INTEGER NOT NULL,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS mistake_notebook (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      concept_name TEXT NOT NULL,
      question_prompt TEXT NOT NULL,
      student_answer TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      error_tag TEXT NOT NULL,
      is_resolved INTEGER NOT NULL DEFAULT 0,
      date_logged TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doubts (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      question_text TEXT NOT NULL,
      media_type TEXT NOT NULL DEFAULT 'text',
      status TEXT NOT NULL DEFAULT 'answered_ai',
      ai_answer TEXT,
      is_helpful INTEGER NOT NULL DEFAULT 1,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS safeguarding_cases (
      id TEXT PRIMARY KEY,
      student_id TEXT,
      student_name TEXT NOT NULL,
      reporter_role TEXT NOT NULL,
      severity TEXT NOT NULL,
      category TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Investigating',
      action_taken TEXT NOT NULL,
      reported_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      ip TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      details_json TEXT
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_inr REAL NOT NULL,
      billing_period TEXT NOT NULL,
      features_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      guardian_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      amount_inr REAL NOT NULL,
      gst_inr REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Captured',
      order_id TEXT NOT NULL,
      payment_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (guardian_id) REFERENCES guardians(id)
    );

    CREATE TABLE IF NOT EXISTS tech_courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      track TEXT NOT NULL,
      level TEXT NOT NULL,
      duration TEXT NOT NULL,
      description TEXT NOT NULL,
      skills_json TEXT NOT NULL,
      lab_title TEXT NOT NULL,
      lab_task TEXT NOT NULL,
      lab_starter_code TEXT NOT NULL,
      lab_expected_output TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tech_submissions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      code TEXT NOT NULL,
      passed INTEGER NOT NULL DEFAULT 1,
      certificate_hash TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) {
    console.log('[Vayentra DB] Database already contains records. Skipping seed.');
    return;
  }

  console.log('[Vayentra DB] Seeding authentic Gurukula curriculum and verified accounts...');

  // 1. Seed Plans
  const insertPlan = db.prepare(`
    INSERT INTO plans (id, name, price_inr, billing_period, features_json)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertPlan.run(
    'plan-annual-pro',
    'Annual Gurukula Pro + AI Tutor',
    4999.0,
    'Annual',
    JSON.stringify([
      'Full CBSE / ICSE / Karnataka Board syllabus access (Class 1-10)',
      'Human-reviewed interactive curiosity episodes & checkpoints',
      'Child-safe 24/7 AI Concept Tutor (DPDP & COPPA compliant)',
      'Mistake Notebook & Spaced Repetition Practice Arena',
      'Guardian Family Portal with daily bedtime & study hour locks',
      'Downloadable bilingual term report cards in English and Kannada'
    ])
  );
  insertPlan.run(
    'plan-term',
    'Term Academic Pass',
    1899.0,
    'Term (4 Months)',
    JSON.stringify([
      'Term-specific chapter episodes and checkpoint quizzes',
      'AI Doubt resolution bounded to syllabus curriculum',
      'Parent progress overview and daily limits'
    ])
  );

  // 2. Seed Default Guardian User (Vayentra Guardian)
  const insertUser = db.prepare(`
    INSERT INTO users (id, google_id, email, mobile, name, avatar, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(
    'usr-guardian-01',
    'google-sub-10987654321',
    'guardian@vayentra.org',
    '+91 98450 12345',
    'Venkatesh Prasad',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'parent'
  );

  const insertGuardian = db.prepare(`
    INSERT INTO guardians (id, user_id, parent_pin, subscription_status, plan_name, renewal_date, outstanding_fee, emergency_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertGuardian.run(
    'par-001',
    'usr-guardian-01',
    '1234',
    'Active',
    'Annual Gurukula Pro + AI Tutor',
    '2027-04-10',
    0.0,
    '+91 98450 99999'
  );

  // 3. Seed Students under Guardian
  const insertStudent = db.prepare(`
    INSERT INTO students (
      id, guardian_id, name, avatar, grade, board, medium, school_name,
      child_pin, daily_time_limit_mins, minutes_used_today, bedtime_lock,
      has_consent, consent_timestamp, streak_days, stars_earned, points
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStudent.run(
    'stu-001',
    'par-001',
    'Aarav Varma',
    '🦊',
    7,
    'CBSE',
    'English',
    'Vayentra Central Gurukula, Bengaluru',
    '0000',
    45,
    22,
    '21:30',
    1,
    '2026-10-12 14:22:00 IST',
    5,
    42,
    1250
  );
  insertStudent.run(
    'stu-002',
    'par-001',
    'Ananya Varma',
    '🦄',
    2,
    'STATE_KARNATAKA',
    'Kannada',
    'Vayentra Prathamika Shala, Mysuru',
    '1111',
    30,
    10,
    '20:30',
    1,
    '2026-10-12 14:25:00 IST',
    3,
    28,
    620
  );

  // 4. Seed Chapters
  const insertChapter = db.prepare(`
    INSERT INTO chapters (
      id, subject, subject_kn, grade, board, title, title_kn, description, progress_percent, is_mastered
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertChapter.run(
    'chap-math-01',
    'Mathematics',
    'ಗಣಿತ',
    7,
    'CBSE',
    'Integers & Real-World Operations',
    'ಪೂರ್ಣಾಂಕಗಳು ಮತ್ತು ನೈಜ-ಜೀವನದ ಲೆಕ್ಕಗಳು',
    'Master positive & negative numbers through temperature changes, banking elevation, and step-by-step number line models.',
    60,
    0
  );
  insertChapter.run(
    'chap-sci-01',
    'Science',
    'ವಿಜ್ಞಾನ',
    7,
    'CBSE',
    'Nutrition in Plants & Photosynthesis',
    'ಸಸ್ಯಗಳಲ್ಲಿ ಪೋಷಣೆ ಮತ್ತು ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ',
    'Discover autotrophic nutrition, cellular chlorophyll function, stomatal gas exchange, and plant chemistry.',
    100,
    1
  );
  insertChapter.run(
    'chap-kan-01',
    'Kannada',
    'ಕನ್ನಡ',
    2,
    'STATE_KARNATAKA',
    'Akshara Maale & Sarala Padagalu',
    'ಅಕ್ಷರ ಮಾಲೆ ಮತ್ತು ಸರಳ ಪದಗಳು',
    'Kannada alphabet vowels (Swaragalu), consonants (Vyanjanagalu), and foundational vocabulary with audio.',
    80,
    0
  );

  // 5. Seed Episodes for Chapter 1
  const insertEpisode = db.prepare(`
    INSERT INTO episodes (
      id, chapter_id, title, title_kn, episode_number, total_episodes, duration_minutes,
      hook, explanation, real_world_example, try_it_prompt, recap_bullets_json,
      is_locked, is_completed, score_percent, reviewer_name, verified_date, board_alignment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEpisode.run(
    'ep-01',
    'chap-math-01',
    'The Elevation & Debt Hook: Why Integers Matter',
    'ಎತ್ತರ ಮತ್ತು ಸಾಲ: ಪೂರ್ಣಾಂಕಗಳ ಪ್ರಾಮುಖ್ಯತೆ',
    1,
    3,
    8,
    'Imagine standing at sea level (0 meters). If a submarine dives 50m below sea level, how do we write that without confusion? -50 meters! Integers allow navigation, temperature forecasting, and banking.',
    'An integer is a whole number (not a fraction) that can be positive, negative, or zero. On a horizontal number line, numbers to the right of zero are positive, and numbers to the left are negative.',
    'Bengaluru winter night: 15°C. Siachen glacier: -25°C. The difference is 40°C!',
    'Plot -3, 0, and +4 on your mental number line. Which is furthest left?',
    JSON.stringify([
      'Integers include negative numbers, zero, and positive numbers.',
      'Zero is neither positive nor negative.',
      'Moving right adds; moving left subtracts.'
    ]),
    0,
    1,
    100,
    'Acharya Vidyasagar Bhat (Senior Mathematics Chair)',
    '10 Oct 2026',
    'CBSE Aligned & Verified'
  );

  insertEpisode.run(
    'ep-02',
    'chap-math-01',
    'Sign Battles: Multiplication & Division Rules',
    'ಚಿಹ್ನೆಗಳ ನಿಯಮ: ಗುಣಾಕಾರ ಮತ್ತು ಭಾಗಾಕಾರ',
    2,
    3,
    9,
    'Why does multiplying two negative numbers make a positive? Think of film: rewinding (-1) a movie of someone walking backwards (-1) looks like walking forwards (+1)!',
    'Rule 1: When multiplying like signs, result is positive (+ × + = +, - × - = +). Rule 2: When multiplying unlike signs, result is negative (+ × - = -, - × + = -).',
    'If you borrow ₹500 every month for 3 months, your net balance change is: 3 × (-500) = -₹1,500.',
    'What is (-4) × (-6)? What about (-24) ÷ (+3)?',
    JSON.stringify([
      'Like signs always yield positive (+).',
      'Unlike signs always yield negative (-).',
      'Odd count of negatives in a product results in negative.'
    ]),
    0,
    0,
    0,
    'Vidushi Ananya Kulkarni (Lead Educator)',
    '12 Oct 2026',
    'CBSE Aligned & Verified'
  );

  insertEpisode.run(
    'ep-03',
    'chap-math-01',
    'BODMAS with Negative Numbers Mastery',
    'ಪೂರ್ಣಾಂಕಗಳೊಂದಿಗೆ ಬೋಡ್ಮಾಸ್ ನಿಯಮ',
    3,
    3,
    10,
    'Brackets protect negative numbers from sign collisions. Without order of operations, calculators would give different answers for the same problem.',
    'BODMAS order: Brackets () -> Orders/Powers -> Division -> Multiplication -> Addition -> Subtraction. Solve inner brackets first, handling sign collisions like -(-5) = +5.',
    'In space flight trajectories, velocity vectors combine positive thrust and negative drag simultaneously using precise bracket hierarchy.',
    'Evaluate: 10 - [(-2) × (-3) + (-4)]',
    JSON.stringify([
      'Always clear innermost parentheses first.',
      'Two consecutive minus signs -(-a) become +a.',
      'Multiply and divide from left to right before addition/subtraction.'
    ]),
    1,
    0,
    0,
    'Guru Raghavendra Prasad (Vedic Mathematics Chair)',
    '14 Oct 2026',
    'CBSE Aligned & Verified'
  );

  // 6. Seed Checkpoint Questions for Episode 2
  const insertQuestion = db.prepare(`
    INSERT INTO checkpoint_questions (
      id, episode_id, prompt, prompt_kn, options_json, correct_index, concept_id, explanation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertQuestion.run(
    'q-ep2-1',
    'ep-02',
    'What is the result of multiplying (-7) × (-8)?',
    '(-7) × (-8) ರ ಗುಣಲಬ್ಧ ಎಷ್ಟು?',
    JSON.stringify(['-56', '+56', '-15', '+15']),
    1,
    'int_mult_like_signs',
    'Multiplying two negative numbers always yields a positive number. 7 × 8 = 56, so (-7) × (-8) = +56.'
  );

  insertQuestion.run(
    'q-ep2-2',
    'ep-02',
    'Evaluate: (-45) ÷ (+9)',
    '(-45) ÷ (+9) ರ ಬೆಲೆಯನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ:',
    JSON.stringify(['+5', '-5', '-36', '+54']),
    1,
    'int_div_unlike_signs',
    'When dividing a negative number by a positive number, the result is always negative. 45 ÷ 9 = 5, hence -5.'
  );

  insertQuestion.run(
    'q-ep2-3',
    'ep-02',
    'A submarine descends 4 meters every minute for 6 minutes. Represent the change in elevation as an integer:',
    'ಜಲಾಂತರ್ಗಾಮಿ ನೌಕೆಯು ಪ್ರತಿ ನಿಮಿಷಕ್ಕೆ 4 ಮೀಟರ್ ಆಳಕ್ಕೆ ಇಳಿಯುತ್ತದೆ. 6 ನಿಮಿಷಗಳ ನಂತರದ ಎತ್ತರದ ಬದಲಾವಣೆ:',
    JSON.stringify(['+24 meters', '-24 meters', '-10 meters', '+10 meters']),
    1,
    'int_real_world_rate',
    'Descending is negative (-4m). For 6 minutes: 6 × (-4) = -24 meters.'
  );

  // 7. Seed Flashcards (Leitner Spaced Repetition)
  const insertFlashcard = db.prepare(`
    INSERT INTO practice_flashcards (
      id, student_id, subject, concept_name, box_level, front_prompt, back_answer, explanation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertFlashcard.run(
    'fc-01',
    'stu-001',
    'Mathematics',
    'Multiplication of Like Signs',
    2,
    '(-a) × (-b) = ?',
    '+(a × b)',
    'Two negative signs reverse each other, returning to positive.'
  );
  insertFlashcard.run(
    'fc-02',
    'stu-001',
    'Mathematics',
    'Additive Inverse',
    3,
    'What is the additive inverse of (-19)?',
    '+19',
    'Any number added to its additive inverse results in 0.'
  );
  insertFlashcard.run(
    'fc-03',
    'stu-001',
    'Mathematics',
    'Division by Zero',
    1,
    'What is (-12) ÷ 0?',
    'Undefined',
    'Division by zero is mathematically undefined across all number sets.'
  );
  insertFlashcard.run(
    'fc-04',
    'stu-001',
    'Science',
    'Stomatal Function',
    4,
    'What microscopic organelle controls gas exchange in green leaves?',
    'Stomata (guarded by Guard Cells)',
    'Stomata open to take in carbon dioxide and release oxygen and water vapor.'
  );

  // 8. Seed Timed Chapter Test
  const insertTest = db.prepare(`
    INSERT INTO timed_tests (
      id, chapter_id, title, subject, grade, board, time_limit_mins, pass_mark_percent, questions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTest.run(
    'test-math-chap01',
    'chap-math-01',
    'Chapter 1 Mastery Exam: Integers & Sign Arithmetic',
    'Mathematics',
    7,
    'CBSE',
    20,
    60,
    JSON.stringify([
      {
        id: 'qt-1',
        prompt: 'Which of the following is the smallest integer: -15, -3, 0, 4?',
        options: ['-15', '-3', '0', '4'],
        correctIndex: 0,
        explanation: 'On a number line, -15 lies furthest to the left.'
      },
      {
        id: 'qt-2',
        prompt: 'Calculate: (-6) × (-4) × (-2)',
        options: ['+48', '-48', '+24', '-24'],
        correctIndex: 1,
        explanation: '(-6) × (-4) = +24. Then (+24) × (-2) = -48.'
      },
      {
        id: 'qt-3',
        prompt: 'At midnight the temperature in Leh was -4°C. By 4 AM it dropped by 5°C. What was the temperature at 4 AM?',
        options: ['-1°C', '+1°C', '-9°C', '+9°C'],
        correctIndex: 2,
        explanation: '-4°C - 5°C = -9°C.'
      },
      {
        id: 'qt-4',
        prompt: 'Evaluate using BODMAS: 20 - [(-8) ÷ 2 + 5]',
        options: ['+19', '+21', '-21', '+9'],
        correctIndex: 0,
        explanation: '(-8) ÷ 2 = -4. Then -4 + 5 = 1. Finally 20 - 1 = 19.'
      },
      {
        id: 'qt-5',
        prompt: 'What number multiplied by (-9) gives (+108)?',
        options: ['+12', '-12', '+117', '-117'],
        correctIndex: 1,
        explanation: '108 ÷ (-9) = -12.'
      }
    ])
  );

  // 9. Seed Mistake Notebook
  const insertMistake = db.prepare(`
    INSERT INTO mistake_notebook (
      id, student_id, subject, concept_name, question_prompt, student_answer, correct_answer, error_tag, is_resolved
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertMistake.run(
    'mst-01',
    'stu-001',
    'Mathematics',
    'Multiplication of Two Negatives',
    'Evaluate: (-8) * (-5)',
    '-40',
    '+40',
    'Sign Confusion: Remember film rewind analogy (- * - = +)',
    0
  );
  insertMistake.run(
    'mst-02',
    'stu-001',
    'Mathematics',
    'Order of Operations (BODMAS)',
    'Evaluate: 12 - (-4) * 2',
    '32',
    '20',
    'Multiplication must be executed before subtraction: (-4)*2 = -8, then 12 - (-8) = 20',
    0
  );

  // 10. Seed Doubts
  const insertDoubt = db.prepare(`
    INSERT INTO doubts (
      id, student_id, student_name, subject, question_text, media_type, status, ai_answer, is_helpful
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDoubt.run(
    'dbt-01',
    'stu-001',
    'Aarav Varma',
    'Mathematics',
    'Why is minus times minus equal to plus in real life?',
    'text',
    'answered_ai',
    'Great question! Think of debt and direction. If having a debt of ₹10 is (-10), then taking away (-1) three debts of ₹10 means: (-3) × (-10) = +₹30 richer! Removing a negative always produces a positive gain.',
    1
  );

  // 11. Seed Safeguarding Cases
  const insertCase = db.prepare(`
    INSERT INTO safeguarding_cases (
      id, student_id, student_name, reporter_role, severity, category, details, status, action_taken
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCase.run(
    'SG-2026-081',
    'stu-001',
    'Aarav Varma',
    'Designated Safeguarding Officer',
    'Low',
    'Routine Consent Audit',
    'Annual DPDP parent consent verified for academic session 2026-2027. IP and device fingerprint validated.',
    'Resolved',
    'Consent ledger sealed with SHA-256 tamper-evident hash.'
  );

  // 12. Seed Technical Academy Courses
  const insertCourse = db.prepare(`
    INSERT INTO tech_courses (
      id, title, track, level, duration, description, skills_json,
      lab_title, lab_task, lab_starter_code, lab_expected_output
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCourse.run(
    'tc-01',
    'Full-Stack AI & Cloud Engineering',
    'Software Architecture',
    'Intermediate',
    '12 Weeks',
    'Build and deploy scalable, microservice-backed AI platforms using Node.js, Python, PostgreSQL, and vector databases.',
    JSON.stringify(['TypeScript', 'PostgreSQL', 'Docker', 'RAG AI Pipelines', 'Cloud Security']),
    'API Gateway Rate Limiter Implementation',
    'Implement a Token Bucket Rate Limiter middleware in Python that allows 10 requests per second per IP.',
    `# Vayentra Technical Academy - Lab Exercise 01
# Complete the rate limiter check function

def is_request_allowed(ip_address: str, current_timestamp: float) -> bool:
    capacity = 10
    refill_rate = 1.0  # tokens per second
    # Write your token check logic here:
    tokens = 10
    if tokens > 0:
        return True
    return False

# Test run
print("Test Case 1:", is_request_allowed("192.168.1.1", 100.0))
`,
    'Test Case 1: True\nTest Case 2: True\nRate limiter unit tests passed!'
  );
  insertCourse.run(
    'tc-02',
    'Vedic Mathematics & Computational Algorithms',
    'Applied Mathematics',
    'All Levels',
    '6 Weeks',
    'Harness ancient Indian sutras for rapid mental arithmetic, high-speed polynomial factorization, and algorithmic optimizations.',
    JSON.stringify(['Urdhva Tiryagbhyam', 'Nikhilam Sutra', 'Big-O Analysis', 'Fast Multiplication']),
    'Vertical & Crosswise High-Speed Multiplier',
    'Write an algorithm implementing the Urdhva Tiryagbhyam sutra for 2-digit multiplication in O(1) space.',
    `# Vedic Mathematics - Urdhva Tiryagbhyam
def vedic_multiply_2digit(n1: int, n2: int) -> int:
    # Digits
    a, b = n1 // 10, n1 % 10
    c, d = n2 // 10, n2 % 10
    
    # Step 1: Vertically (b * d)
    step1 = b * d
    # Step 2: Crosswise (a * d + b * c)
    step2 = a * d + b * c
    # Step 3: Vertically (a * c)
    step3 = a * c
    
    return step3 * 100 + step2 * 10 + step1

print("88 x 82 =", vedic_multiply_2digit(88, 82))
`,
    '88 x 82 = 7216\nAlgorithm complexity verified.'
  );

  console.log('[Vayentra DB] Database seed completed successfully!');
}
