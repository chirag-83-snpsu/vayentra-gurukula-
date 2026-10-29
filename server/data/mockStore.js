// Vayentra Gurukula - Backend In-Memory Store & Seed Data
// Based on: Vayentra_Backend_Schema_SRS_V1.docx & VAYENTRA_MASTER_BLUEPRINT_AND_PLAN.md

export const store = {
  system: {
    name: 'Vayentra Gurukula Backend API',
    version: '1.0.0-pilot',
    environment: 'development',
    dbEngine: 'PostgreSQL 16 (In-Memory Engine with Relational Schema Invariants)',
    cacheEngine: 'Redis 7 (Session & Rate-Limiter simulated)',
    startedAt: new Date().toISOString(),
    uptime: () => process.uptime()
  },

  parent: {
    id: 'par-001',
    name: 'Rajesh Varma',
    mobile: '+91 98450 12345',
    email: 'rajesh.varma@vayentra.org',
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
        medium: 'Kannada',
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
  },

  chapters: [
    {
      id: 'chap-math-01',
      subject: 'Mathematics',
      subjectKn: 'ಗಣಿತ',
      grade: 7,
      board: 'CBSE',
      title: 'Integers & Real-World Operations',
      titleKn: 'ಪೂರ್ಣಾಂಕಗಳು ಮತ್ತು ನೈಜ-ಜೀವನದ ಲೆಕ್ಕಗಳು',
      description: 'Master positive & negative numbers through temperature changes, banking elevation, and step-by-step number line models.',
      isMastered: false,
      progressPercent: 60,
      episodes: [
        {
          id: 'ep-01',
          chapterId: 'chap-math-01',
          title: 'The Elevation & Debt Hook: Why Integers Matter',
          titleKn: 'ಎತ್ತರ ಮತ್ತು ಸಾಲ: ಪೂರ್ಣಾಂಕಗಳ ಪ್ರಾಮುಖ್ಯತೆ',
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
            reviewerName: 'Dr. Sharada Rao, CBSE Math Lead',
            board: 'CBSE Aligned',
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
              prompt: 'A temperature drops from 4°C by 9°C. What is the new temperature?',
              options: ['13°C', '-5°C', '5°C', '-13°C'],
              correctIndex: 1,
              explanation: '4 - 9 = -5°C.',
              conceptId: 'int-subtraction',
              difficulty: 'Standard'
            },
            {
              id: 'q1-3',
              prompt: 'What is the additive inverse of -15?',
              options: ['-15', '0', '+15', '1/15'],
              correctIndex: 2,
              explanation: 'The additive inverse is the number that yields zero when added: (-15) + (+15) = 0.',
              conceptId: 'int-inverse',
              difficulty: 'Standard'
            }
          ]
        },
        {
          id: 'ep-02',
          chapterId: 'chap-math-01',
          title: 'Multiplying Negative Numbers: The Sign Flip Rule',
          titleKn: 'ಋಣಾತ್ಮಕ ಸಂಖ್ಯೆಗಳ ಗುಣಾಕಾರ: ಚಿಹ್ನೆಗಳ ನಿಯಮ',
          episodeNumber: 2,
          totalEpisodes: 3,
          durationMinutes: 10,
          hook: 'Why does a negative times a negative make a positive? Think of reversing a video of walking backwards!',
          explanation: 'When multiplying two numbers with the SAME sign, the product is POSITIVE (+). When multiplying two numbers with OPPOSITE signs, the product is NEGATIVE (-).',
          realWorldExample: 'Canceling (-1) a penalty of ₹500 (-500) gives you back +₹500!',
          tryItPrompt: 'Calculate (-4) × (-6) and then (-4) × (6). Notice how the sign flips.',
          recapBullets: [
            '(+) × (+) = (+)',
            '(-) × (-) = (+)',
            '(+) × (-) = (-)'
          ],
          isLocked: false,
          isCompleted: false,
          trustLabel: {
            reviewerName: 'Dr. Sharada Rao, CBSE Math Lead',
            board: 'CBSE Aligned',
            verifiedDate: '10 Oct 2026',
            isAiAssisted: true
          },
          checkpointQuestions: [
            {
              id: 'q2-1',
              prompt: 'Evaluate: (-8) × (-5)',
              options: ['-40', '40', '-13', '13'],
              correctIndex: 1,
              explanation: 'Negative multiplied by negative gives a positive: (-8) × (-5) = +40.',
              conceptId: 'int-mult-same',
              difficulty: 'Simple'
            },
            {
              id: 'q2-2',
              prompt: 'What is (-3) × (-2) × (-4)?',
              options: ['+24', '-24', '+9', '-9'],
              correctIndex: 1,
              explanation: '(-3) × (-2) = +6. Then (+6) × (-4) = -24. Three negatives result in negative.',
              conceptId: 'int-mult-odd',
              difficulty: 'Standard'
            },
            {
              id: 'q2-3',
              prompt: 'Is (-1)^50 equal to +1 or -1?',
              options: ['+1', '-1', '0', '50'],
              correctIndex: 0,
              explanation: 'An even power of -1 is always +1 because pairs cancel out.',
              conceptId: 'int-powers',
              difficulty: 'Challenge'
            }
          ]
        },
        {
          id: 'ep-03',
          chapterId: 'chap-math-01',
          title: 'Mastery Challenge: Order of Operations (BODMAS with Integers)',
          titleKn: 'ಪೂರ್ಣಾಂಕಗಳೊಂದಿಗೆ ಬೋಡ್ಮಾಸ್ ನಿಯಮ',
          episodeNumber: 3,
          totalEpisodes: 3,
          durationMinutes: 12,
          hook: 'Brackets, Orders, Division, Multiplication, Addition, Subtraction: Avoid the single most common exam trap.',
          explanation: 'Always evaluate brackets first, from inside out, maintaining sign rules at every step.',
          realWorldExample: 'Calculating a bank account statement with monthly debits, interest, and credit refunds.',
          tryItPrompt: 'Solve 10 - (-5) × 2. Remember to multiply first!',
          recapBullets: [
            'Multiplication takes precedence over subtraction.',
            '10 - (-10) = 10 + 10 = 20.'
          ],
          isLocked: true,
          isCompleted: false,
          trustLabel: {
            reviewerName: 'Dr. Sharada Rao, CBSE Math Lead',
            board: 'CBSE Aligned',
            verifiedDate: '10 Oct 2026',
            isAiAssisted: true
          },
          checkpointQuestions: [
            {
              id: 'q3-1',
              prompt: 'Calculate: 15 - [ -3 × (4 - 7) ]',
              options: ['24', '6', '-6', '15'],
              correctIndex: 1,
              explanation: 'Inside brackets: 4 - 7 = -3. Then -3 × -3 = 9. Finally 15 - 9 = 6.',
              conceptId: 'int-bodmas',
              difficulty: 'Challenge'
            }
          ]
        }
      ]
    },
    {
      id: 'chap-sci-01',
      subject: 'Science',
      subjectKn: 'ವಿಜ್ಞಾನ',
      grade: 7,
      board: 'CBSE',
      title: 'Nutrition in Plants & Photosynthesis',
      titleKn: 'ಸಸ್ಯಗಳಲ್ಲಿ ಪೋಷಣೆ ಮತ್ತು ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ',
      description: 'Explore chlorophyll, stomata gas exchange, and autotrophic life support systems.',
      isMastered: false,
      progressPercent: 30,
      episodes: []
    }
  ],

  mistakes: [
    {
      id: 'mst-001',
      studentId: 'stu-001',
      questionPrompt: 'Evaluate (-3) × (-2) × (-4)',
      studentAnswer: '+24',
      correctAnswer: '-24',
      errorTag: 'slip',
      conceptName: 'Multiplying Odd Number of Negatives',
      subject: 'Mathematics',
      date: '12 Oct 2026',
      isResolved: false
    },
    {
      id: 'mst-002',
      studentId: 'stu-001',
      questionPrompt: 'Which has greater magnitude: -15 or +12?',
      studentAnswer: '+12',
      correctAnswer: '-15 (| -15 | = 15 > 12)',
      errorTag: 'concept_gap',
      conceptName: 'Absolute Value & Magnitude',
      subject: 'Mathematics',
      date: '11 Oct 2026',
      isResolved: false
    }
  ],

  doubts: [
    {
      id: 'dbt-001',
      studentId: 'stu-001',
      studentName: 'Aarav Varma',
      subject: 'Mathematics',
      questionText: 'Why is zero neither positive nor negative?',
      mediaType: 'text',
      status: 'answered_ai',
      aiAnswer: 'Zero is the reference origin on the number line. A positive number represents a quantity greater than zero (gain), while a negative number represents less than zero (loss). Zero represents the neutral baseline where no gain or loss has occurred, so it has no sign!',
      timestamp: 'Today, 4:15 PM',
      isHelpful: true
    }
  ],

  safeguardingCases: [
    {
      id: 'SG-2026-004',
      studentName: 'Student [Anonymous ID 921]',
      reporterRole: 'Automated AI Moderation Filter',
      severity: 'High',
      category: 'Severe Distress / Self-Harm Keyword Match',
      details: 'Student query in doubt chat contained self-harm distress indicators. AI Tutor halted conversation immediately, provided Vandrevala Foundation helpline (9999 666 555), and escalated to Safeguarding Desk.',
      reportedAt: '13 Oct 2026, 18:30 IST',
      status: 'Investigating',
      actionTaken: 'Safeguarding officer notified school counsellor; parent contact initiated.'
    }
  ],

  techCourses: [
    {
      id: 'tc-01',
      track: 'Applied Software Engineering',
      title: 'Algorithmic Problem Solving & Data Structures in Python',
      level: 'Beginner',
      durationWeeks: 8,
      description: 'Learn computational thinking, clean code hygiene, and Big-O efficiency through hands-on sandbox labs.',
      labStarterCode: `def solve_sum(arr, target):\n    # TODO: Return indices of two numbers that add up to target\n    seen = {}\n    for i, num in enumerate(arr):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n\nprint(solve_sum([2, 7, 11, 15], 9))`,
      labExpectedOutput: '[0, 1]',
      hasCertificate: true
    },
    {
      id: 'tc-02',
      track: 'AI & Data Engineering',
      title: 'Building Safe Educational LLM Agents with RAG',
      level: 'Intermediate',
      durationWeeks: 6,
      description: 'Construct child-safe retrieval augmented generation pipelines with vector databases and PII scrubbing.',
      labStarterCode: `# Build a guardrail evaluator\ndef evaluate_safety(prompt):\n    banned = ['cheat', 'test answer', 'bypass']\n    return not any(b in prompt.lower() for b in banned)\n\nprint(evaluate_safety("Can you explain photosynthesis?"))`,
      labExpectedOutput: 'True',
      hasCertificate: true
    }
  ],

  plans: [
    {
      id: 'plan-school-pro',
      name: 'Annual Gurukula Pro + AI Tutor',
      academy: 'School Academy (Classes 1-10)',
      priceInr: 14999,
      duration: 'Annual',
      features: [
        'Complete CBSE, ICSE & Karnataka State Board curriculum',
        'English & Kannada bilingual narration',
        'Human-reviewed interactive episode checkpoints',
        'DPDP-compliant Child Safe AI Tutor',
        'Parent Family Hub with screen time and bedtime locks',
        'Mistake Notebook with spaced repetition'
      ]
    },
    {
      id: 'plan-tech-pro',
      name: 'Technical Academy Master Track',
      academy: 'Technical & Professional Academy',
      priceInr: 24999,
      duration: 'Annual',
      features: [
        'Fullstack, AI Engineering & Cloud Architecture tracks',
        'In-browser sandbox code evaluation labs',
        'Industry mentor review & QR-verifiable certificates',
        'Real-world portfolio capstone projects'
      ]
    }
  ],

  auditLogs: [
    {
      id: 'audit-001',
      actor: 'system',
      action: 'SERVER_BOOTSTRAP',
      entity: 'Platform Engine',
      ip: '127.0.0.1',
      timestamp: new Date().toISOString()
    },
    {
      id: 'audit-002',
      actor: 'guardian:par-001',
      action: 'DPDP_CONSENT_RECORDED',
      entity: 'Child:stu-001',
      ip: '49.207.210.14',
      timestamp: '2026-10-12T08:52:00.000Z'
    }
  ],

  dpdpConsents: [
    {
      consentId: 'dpdp-001',
      guardianId: 'par-001',
      childId: 'stu-001',
      policyVersion: 'v2.1',
      guardianIp: '49.207.210.14',
      timestamp: '2026-10-12T08:52:00.000Z',
      verified: true
    }
  ]
};
