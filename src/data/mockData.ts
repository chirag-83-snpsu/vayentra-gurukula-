import { Chapter, ParentUser, MistakeNotebookItem, DoubtItem, SafeguardingCase, TechnicalCourse, FlashcardItem, TimedTest } from '../types';

export const INITIAL_PARENT: ParentUser = {
  id: 'par-001',
  name: 'Venkatesh Prasad',
  mobile: '+91 98450 12345',
  email: 'guardian@vayentra.org',
  parentPin: '1234',
  subscriptionStatus: 'Active',
  planName: 'Annual Gurukula Pro + AI Tutor',
  renewalDate: '2027-04-10',
  outstandingFee: 0,
  activeChildId: 'stu-001',
  children: [
    {
      id: 'stu-001',
      name: 'Aarav Varma',
      avatar: '🦊',
      grade: 7,
      board: 'CBSE',
      medium: 'English',
      pin: '0000',
      dailyTimeLimitMins: 45,
      minutesUsedToday: 22,
      bedtimeLock: '21:30',
      hasParentConsent: true,
      consentTimestamp: '2026-10-12 14:22:00 IST',
      streakDays: 5,
      starsEarned: 42,
      points: 1250
    },
    {
      id: 'stu-002',
      name: 'Ananya Varma',
      avatar: '🦄',
      grade: 2,
      board: 'STATE_KARNATAKA',
      medium: 'English',
      pin: '1111',
      dailyTimeLimitMins: 30,
      minutesUsedToday: 10,
      bedtimeLock: '20:30',
      hasParentConsent: true,
      consentTimestamp: '2026-10-12 14:25:00 IST',
      streakDays: 3,
      starsEarned: 28,
      points: 620
    }
  ]
};

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'chap-math-01',
    subject: 'Mathematics',
    grade: 7,
    board: 'CBSE',
    title: 'Integers & Real-World Operations',
    description: 'Master positive & negative numbers through temperature changes, banking elevation, and step-by-step number line models.',
    isMastered: false,
    progressPercent: 60,
    episodes: [
      {
        id: 'ep-01',
        chapterId: 'chap-math-01',
        title: 'The Elevation & Debt Hook: Why Integers Matter',
        episodeNumber: 1,
        totalEpisodes: 3,
        durationMinutes: 8,
        hook: 'Imagine standing at sea level (0 meters). If a submarine dives 50m below sea level, how do we write that without confusion? -50 meters! Integers allow navigation, temperature forecasting, and banking.',
        explanation: 'An integer is a whole number (not a fraction) that can be positive, negative, or zero. On a horizontal number line, numbers to the right of zero are positive, and numbers to the left are negative.',
        realWorldExample: 'Bengaluru winter night: 15°C. Siachen glacier: -25°C. The difference is 40°C!',
        tryItPrompt: 'Plot -3, 0, and +4 on your mental number line. Which is furthest left?',
        recapBullets: [
          'Integers include negative numbers, zero, and positive numbers.',
          'Zero is neither positive nor negative.',
          'Moving right adds; moving left subtracts.'
        ],
        isLocked: false,
        isCompleted: true,
        scorePercent: 100,
        trustLabel: {
          reviewerName: 'Acharya Vidyasagar Bhat (Senior Mathematics Chair)',
          board: 'CBSE Aligned & Verified',
          verifiedDate: '10 Oct 2026',
          isAiAssisted: true
        },
        checkpointQuestions: [
          {
            id: 'q1-1',
            prompt: 'Which number is smaller: -7 or -2?',
            options: ['-7', '-2', 'They are equal', 'Cannot be compared'],
            correctIndex: 0,
            explanation: 'On a number line, -7 lies further to the left of -2, meaning -7 is smaller.',
            conceptId: 'int-ordering',
            difficulty: 'Simple'
          },
          {
            id: 'q1-2',
            prompt: 'A bank balance drops from ₹200 to -₹50. How much money was withdrawn?',
            options: ['₹150', '₹200', '₹250', '-₹50'],
            correctIndex: 2,
            explanation: 'Difference: 200 - (-50) = 200 + 50 = ₹250.',
            conceptId: 'int-subtraction',
            difficulty: 'Standard'
          },
          {
            id: 'q1-3',
            prompt: 'What is the sum of (+15) and (-15)?',
            options: ['0', '+30', '-30', '1'],
            correctIndex: 0,
            explanation: 'Numbers and their additive opposites always sum to zero.',
            conceptId: 'int-additive-inverse',
            difficulty: 'Simple'
          }
        ]
      },
      {
        id: 'ep-02',
        chapterId: 'chap-math-01',
        title: 'Sign Battles: Multiplication & Division Rules',
        episodeNumber: 2,
        totalEpisodes: 3,
        durationMinutes: 9,
        hook: 'Why does multiplying two negative numbers make a positive? Think of film: rewinding (-1) a movie of someone walking backwards (-1) looks like walking forwards (+1)!',
        explanation: 'Rule 1: When multiplying like signs, result is positive (+ × + = +, - × - = +). Rule 2: When multiplying unlike signs, result is negative (+ × - = -, - × + = -).',
        realWorldExample: 'If you borrow ₹500 every month for 3 months, your net balance change is: 3 × (-500) = -₹1,500.',
        tryItPrompt: 'What is (-4) × (-6)? What about (-24) ÷ (+3)?',
        recapBullets: [
          'Like signs always yield positive (+).',
          'Unlike signs always yield negative (-).',
          'Odd count of negatives in a product results in negative.'
        ],
        isLocked: false,
        isCompleted: false,
        scorePercent: 0,
        trustLabel: {
          reviewerName: 'Vidushi Ananya Kulkarni (Lead Educator)',
          board: 'CBSE Aligned & Verified',
          verifiedDate: '12 Oct 2026',
          isAiAssisted: true
        },
        checkpointQuestions: [
          {
            id: 'q2-1',
            prompt: 'What is the result of multiplying (-7) × (-8)?',
            options: ['-56', '+56', '-15', '+15'],
            correctIndex: 1,
            explanation: 'Multiplying two negative numbers always yields a positive number. 7 × 8 = 56, so (-7) × (-8) = +56.',
            conceptId: 'int-mult-like',
            difficulty: 'Standard'
          },
          {
            id: 'q2-2',
            prompt: 'Evaluate: (-45) ÷ (+9)',
            options: ['+5', '-5', '-36', '+54'],
            correctIndex: 1,
            explanation: 'When dividing unlike signs, the result is negative. 45 ÷ 9 = 5, hence -5.',
            conceptId: 'int-div-unlike',
            difficulty: 'Standard'
          },
          {
            id: 'q2-3',
            prompt: 'A submarine descends 4 meters every minute for 6 minutes. Represent the change in elevation:',
            options: ['+24 meters', '-24 meters', '-10 meters', '+10 meters'],
            correctIndex: 1,
            explanation: 'Descending is negative (-4m). For 6 minutes: 6 × (-4) = -24 meters.',
            conceptId: 'int-rate',
            difficulty: 'Challenge'
          }
        ]
      },
      {
        id: 'ep-03',
        chapterId: 'chap-math-01',
        title: 'BODMAS with Negative Numbers Mastery',
        episodeNumber: 3,
        totalEpisodes: 3,
        durationMinutes: 10,
        hook: 'Brackets protect negative numbers from sign collisions. Without order of operations, calculators would give different answers for the same problem.',
        explanation: 'BODMAS order: Brackets () -> Orders/Powers -> Division -> Multiplication -> Addition -> Subtraction. Solve inner brackets first, handling sign collisions like -(-5) = +5.',
        realWorldExample: 'In space flight trajectories, velocity vectors combine positive thrust and negative drag simultaneously using precise bracket hierarchy.',
        tryItPrompt: 'Evaluate: 10 - [(-2) × (-3) + (-4)]',
        recapBullets: [
          'Always clear innermost parentheses first.',
          'Two consecutive minus signs -(-a) become +a.',
          'Multiply and divide from left to right before addition/subtraction.'
        ],
        isLocked: true,
        isCompleted: false,
        scorePercent: 0,
        trustLabel: {
          reviewerName: 'Guru Raghavendra Prasad (Vedic Mathematics Chair)',
          board: 'CBSE Aligned & Verified',
          verifiedDate: '14 Oct 2026',
          isAiAssisted: true
        },
        checkpointQuestions: [
          {
            id: 'q3-1',
            prompt: 'Evaluate: 10 - (-5) × 2',
            options: ['30', '20', '0', '-10'],
            correctIndex: 1,
            explanation: 'Multiply first: (-5) × 2 = -10. Then 10 - (-10) = 10 + 10 = 20.',
            conceptId: 'int-bodmas-1',
            difficulty: 'Standard'
          },
          {
            id: 'q3-2',
            prompt: 'What is (-3) × (-2) × (-4)?',
            options: ['+24', '-24', '+9', '-9'],
            correctIndex: 1,
            explanation: 'Three negative factors yield a negative product: (-3) × (-2) = +6; +6 × (-4) = -24.',
            conceptId: 'int-bodmas-2',
            difficulty: 'Standard'
          },
          {
            id: 'q3-3',
            prompt: 'Evaluate: [(-18) ÷ (-3)] - [(-4) × (-2)]',
            options: ['-2', '+2', '+14', '-14'],
            correctIndex: 0,
            explanation: '(-18) ÷ (-3) = +6. (-4) × (-2) = +8. Then +6 - (+8) = -2.',
            conceptId: 'int-bodmas-complex',
            difficulty: 'Challenge'
          }
        ]
      }
    ]
  },
  {
    id: 'chap-sci-01',
    subject: 'Science',
    grade: 7,
    board: 'CBSE',
    title: 'Nutrition in Plants & Photosynthesis',
    description: 'Discover autotrophic nutrition, cellular chlorophyll function, stomatal gas exchange, and plant chemistry.',
    isMastered: true,
    progressPercent: 100,
    episodes: []
  }
];

export const INITIAL_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-01',
    studentId: 'stu-001',
    subject: 'Mathematics',
    conceptName: 'Multiplication of Like Signs',
    boxLevel: 2,
    frontPrompt: '(-a) × (-b) = ?',
    backAnswer: '+(a × b)',
    explanation: 'Two negative signs cancel out direction, returning to positive.'
  },
  {
    id: 'fc-02',
    studentId: 'stu-001',
    subject: 'Mathematics',
    conceptName: 'Additive Inverse',
    boxLevel: 3,
    frontPrompt: 'What is the additive inverse of (-19)?',
    backAnswer: '+19',
    explanation: 'Any number added to its additive inverse sums to 0.'
  },
  {
    id: 'fc-03',
    studentId: 'stu-001',
    subject: 'Mathematics',
    conceptName: 'Division by Zero',
    boxLevel: 1,
    frontPrompt: 'What is (-12) ÷ 0?',
    backAnswer: 'Undefined',
    explanation: 'Division by zero is mathematically undefined across all number sets.'
  },
  {
    id: 'fc-04',
    studentId: 'stu-001',
    subject: 'Science',
    conceptName: 'Stomatal Function',
    boxLevel: 4,
    frontPrompt: 'What microscopic organelle controls gas exchange in green leaves?',
    backAnswer: 'Stomata (guarded by Guard Cells)',
    explanation: 'Stomata open to take in carbon dioxide and release oxygen and water vapor.'
  }
];

export const INITIAL_TIMED_TEST: TimedTest = {
  id: 'test-math-chap01',
  chapterId: 'chap-math-01',
  title: 'Chapter 1 Mastery Exam: Integers & Sign Arithmetic',
  subject: 'Mathematics',
  grade: 7,
  board: 'CBSE',
  timeLimitMins: 20,
  passMarkPercent: 60,
  totalQuestions: 5,
  questions: [
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
  ]
};

export const INITIAL_MISTAKES: MistakeNotebookItem[] = [
  {
    id: 'mst-01',
    studentId: 'stu-001',
    subject: 'Mathematics',
    conceptName: 'Multiplication of Two Negatives',
    questionPrompt: 'Evaluate: (-8) * (-5)',
    studentAnswer: '-40',
    correctAnswer: '+40',
    errorTag: 'Sign Confusion: Remember film rewind analogy (- * - = +)',
    date: '14 Oct 2026',
    isResolved: false
  },
  {
    id: 'mst-02',
    studentId: 'stu-001',
    subject: 'Mathematics',
    conceptName: 'Order of Operations (BODMAS)',
    questionPrompt: 'Evaluate: 12 - (-4) * 2',
    studentAnswer: '32',
    correctAnswer: '20',
    errorTag: 'Multiplication must be executed before subtraction: (-4)*2 = -8, then 12 - (-8) = 20',
    date: '14 Oct 2026',
    isResolved: false
  }
];

export const INITIAL_DOUBTS: DoubtItem[] = [
  {
    id: 'dbt-01',
    studentId: 'stu-001',
    studentName: 'Aarav Varma',
    subject: 'Mathematics',
    questionText: 'Why is minus times minus equal to plus in real life?',
    mediaType: 'text',
    status: 'answered_ai',
    aiAnswer: 'Great question! Think of debt and direction. If having a debt of ₹10 is (-10), then taking away (-1) three debts of ₹10 means: (-3) × (-10) = +₹30 richer! Removing a negative always produces a positive gain.',
    timestamp: '14 Oct, 18:30 IST',
    isHelpful: true
  }
];

export const INITIAL_SAFEGUARDING: SafeguardingCase[] = [
  {
    id: 'SG-2026-081',
    studentName: 'Aarav Varma',
    reporterRole: 'Designated Safeguarding Officer',
    severity: 'Low',
    category: 'Routine Consent Audit',
    details: 'Annual DPDP parent consent verified for academic session 2026-2027. IP and device fingerprint validated.',
    reportedAt: '12 Oct 2026, 14:22 IST',
    status: 'Resolved',
    actionTaken: 'Consent ledger sealed with SHA-256 tamper-evident hash.'
  }
];

export const INITIAL_TECH_COURSES: TechnicalCourse[] = [
  {
    id: 'tc-01',
    track: 'Software Architecture',
    title: 'Full-Stack AI & Cloud Engineering',
    level: 'Intermediate',
    durationWeeks: 12,
    duration: '12 Weeks',
    skills: ['TypeScript', 'PostgreSQL', 'Docker', 'RAG AI Pipelines', 'Cloud Security'],
    description: 'Build and deploy scalable, microservice-backed AI platforms using Node.js, Python, PostgreSQL, and vector databases.',
    labTitle: 'API Gateway Rate Limiter Implementation',
    labTask: 'Implement a Token Bucket Rate Limiter check in Python allowing 10 requests per second per IP.',
    labStarterCode: `# Vayentra Technical Academy - Lab Exercise 01
def is_request_allowed(ip_address: str, current_timestamp: float) -> bool:
    capacity = 10
    tokens = 10
    if tokens > 0:
        return True
    return False

print("Test Case 1:", is_request_allowed("192.168.1.1", 100.0))`,
    labExpectedOutput: 'Test Case 1: True\nTest Case 2: True\nRate limiter unit tests passed!',
    hasCertificate: true
  },
  {
    id: 'tc-02',
    track: 'Applied Mathematics',
    title: 'Vedic Mathematics & Computational Algorithms',
    level: 'All Levels',
    durationWeeks: 6,
    duration: '6 Weeks',
    skills: ['Urdhva Tiryagbhyam', 'Nikhilam Sutra', 'Big-O Analysis', 'Fast Multiplication'],
    description: 'Harness ancient Indian sutras for rapid mental arithmetic, high-speed polynomial factorization, and algorithmic optimizations.',
    labTitle: 'Vertical & Crosswise High-Speed Multiplier',
    labTask: 'Write an algorithm implementing the Urdhva Tiryagbhyam sutra for 2-digit multiplication in O(1) space.',
    labStarterCode: `# Vedic Mathematics - Urdhva Tiryagbhyam
def vedic_multiply_2digit(n1: int, n2: int) -> int:
    a, b = n1 // 10, n1 % 10
    c, d = n2 // 10, n2 % 10
    step1 = b * d
    step2 = a * d + b * c
    step3 = a * c
    return step3 * 100 + step2 * 10 + step1

print("88 x 82 =", vedic_multiply_2digit(88, 82))`,
    labExpectedOutput: '88 x 82 = 7216\nAlgorithm complexity verified.',
    hasCertificate: true
  }
];
