import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookHeart,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
  Volume2,
  VolumeX,
  Compass,
  Check,
  Flame,
  Award,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { recordConceptUnderstood } from '../utils/streakManager';
import '../styles/one-grade1.css';

export interface ConceptLesson {
  id: string;
  grade: number;
  board: string;
  subject: string;
  chapterNumber: number;
  chapterTitle: string;
  lessonTitle: string;
  objective: string;
  locationContext: string;
  storyHook: string;
  theWhyExplanation: string;
  visualModelHtml?: string;
  visualModelType?: 'formula' | 'diagram' | 'table' | 'geometry' | 'circuit';
  offlineActivity: string;
  guidedSteps: string[];
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

// Comprehensive concept lessons for Classes 3 through 10
const UNIVERSAL_LESSONS: Record<number, ConceptLesson[]> = {
  3: [
    {
      id: 'c3-math-place-value',
      grade: 3,
      board: 'CBSE',
      subject: 'Mathematics',
      chapterNumber: 1,
      chapterTitle: 'Place Value & 3-Digit Numbers',
      lessonTitle: 'Namma Metro Token Stacks: The Power of Tens & Ones',
      objective: 'Decompose 2-digit and 3-digit quantities into Hundreds, Tens and Ones to add numbers mentally without finger counting.',
      locationContext: 'Majestic Metro Interchange, Bengaluru',
      storyHook: 'Aarav buys 134 metro tokens for his school field trip. Instead of counting 134 single tokens one by one, the station manager hands him 1 tray of 100 tokens, 3 rolls of 10 tokens, and 4 single tokens.',
      theWhyExplanation: 'Our Hindu-Arabic number system is built entirely on base-10 grouping. Each place to the left is 10 times bigger than the place before it. 134 is not just three digits sitting next to each other; it is 1 Hundred (100) + 3 Tens (30) + 4 Ones (4). When you understand this decomposition, adding 134 + 50 is instant: you simply add 5 Tens to 3 Tens, getting 184 without paper calculation.',
      visualModelType: 'table',
      visualModelHtml: '<div style="display:flex;gap:12px;justify-content:center;margin:16px 0;"><div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:10px;padding:12px 18px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#1e40af;">1</div><small style="color:#64748b;font-weight:700;">HUNDREDS (100)</small></div><div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:10px;padding:12px 18px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#15803d;">3</div><small style="color:#64748b;font-weight:700;">TENS (30)</small></div><div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:10px;padding:12px 18px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#b45309;">4</div><small style="color:#64748b;font-weight:700;">ONES (4)</small></div></div>',
      offlineActivity: 'Count 48 dried rajma beans or chickpeas at home. Group them into bowls of 10. Notice how 4 bowls of 10 and 8 loose beans show 48 immediately.',
      guidedSteps: [
        'Read the 3-digit number aloud: 134.',
        'Identify which digit represents single items (Ones).',
        'Identify the bundle of 10s (Tens) and bundle of 100s (Hundreds).',
        'Practice expanding: 134 = 100 + 30 + 4.'
      ],
      questions: [
        {
          id: 'c3-q1',
          prompt: 'In the number 258, what does the digit 5 actually represent?',
          options: ['5 Ones (5)', '5 Tens (50)', '5 Hundreds (500)', 'Just the number 5'],
          correctIndex: 1,
          explanation: 'The digit 5 is in the tens column, which means 5 bundles of 10 = 50.'
        },
        {
          id: 'c3-q2',
          prompt: 'If you add 20 to 145, which digit in 145 changes?',
          options: ['The hundreds digit (1)', 'The tens digit (4 becomes 6)', 'The ones digit (5)', 'All digits change'],
          correctIndex: 1,
          explanation: 'Adding 20 means adding 2 Tens. 4 Tens + 2 Tens = 6 Tens, giving 165.'
        },
        {
          id: 'c3-q3',
          prompt: 'How many tens are needed to make 1 hundred?',
          options: ['5 tens', '10 tens', '100 tens', '20 tens'],
          correctIndex: 1,
          explanation: '10 bundles of 10 equal 100 (10 × 10 = 100).'
        }
      ]
    },
    {
      id: 'c3-evs-leaves-shadows',
      grade: 3,
      board: 'CBSE',
      subject: 'Environmental Studies',
      chapterNumber: 2,
      chapterTitle: 'Plants & Light Around Us',
      lessonTitle: 'The Shrinking Shadows of Cubbon Park',
      objective: 'Discover that light travels in straight lines and explains why shadows change length and direction as the sun moves across the sky.',
      locationContext: 'Bamboo Groves, Cubbon Park, Bengaluru',
      storyHook: 'At 8:30 AM before school, Diya notices her shadow stretching far across the morning grass, taller than her father. But when they eat lunch at 12:15 PM, her shadow has shrunk to a tiny puddle right under her sneakers!',
      theWhyExplanation: 'Light travels in straight lines. An opaque object like a human body blocks the light, creating a dark shape called a shadow. In early morning and late afternoon, the Sun is low on the horizon, so rays hit you at a slant angle and cast long shadows. At midday, the Sun is nearly overhead, casting rays straight down and making the shadow shortest. Ancient Indian sun-clocks (Sundials) like Jantar Mantar tracked exact time using this exact natural shadow clock.',
      visualModelType: 'diagram',
      offlineActivity: 'Place a pencil upright on white paper outside at 9:00 AM, 12:00 PM, and 4:00 PM. Trace the shadow with a pen and measure the length in centimeters.',
      guidedSteps: [
        'Notice where the light source is located relative to your body.',
        'Observe where the shadow falls: always directly opposite the light source.',
        'Check the shadow length when the sun is low vs when it is high overhead.'
      ],
      questions: [
        {
          id: 'c3-evs-q1',
          prompt: 'When is a tree’s shadow usually shortest during a sunny day?',
          options: ['At sunrise (6:30 AM)', 'Around noon (12:00 PM)', 'At sunset (6:00 PM)', 'Shadows never change length'],
          correctIndex: 1,
          explanation: 'At noon, the sun is highest in the sky, casting light almost straight down so the shadow is smallest.'
        },
        {
          id: 'c3-evs-q2',
          prompt: 'Why does a shadow form behind an object?',
          options: ['Because light bends around the object', 'Because light travels in straight lines and is blocked by opaque objects', 'Because shadows are made of cold air', 'Because the ground absorbs light'],
          correctIndex: 1,
          explanation: 'Light moves in straight paths. When an opaque object blocks the rays, no light reaches the surface directly behind it.'
        }
      ]
    },
    {
      id: 'c3-kannada-aksharamale',
      grade: 3,
      board: 'CBSE',
      subject: 'Kannada',
      chapterNumber: 1,
      chapterTitle: 'ಅಕ್ಷರ ಲೋಕ ಮತ್ತು ಸರಳ ಪದಗಳು',
      lessonTitle: 'ಸ್ವರಗಳು ಮತ್ತು ವ್ಯಂಜನಗಳ ಮಧುರ ಧ್ವನಿ (Kannada Alphabet & Vocabulary)',
      objective: 'ಕನ್ನಡದ ಸ್ವರ, ವ್ಯಂಜನ ಮತ್ತು ಯೋಗವಾಹಗಳನ್ನು ಸರಿಯಾಗಿ ಗುರುತಿಸಿ ಸರಳ ಪದಗಳನ್ನು ಓದುವುದು ಮತ್ತು ಬರೆಯುವುದು.',
      locationContext: 'ಕಬ್ಬನ್ ಪಾರ್ಕ್ ಮತ್ತು ಬೆಂಗಳೂರಿನ ಹಳ್ಳಿಗಳು',
      storyHook: 'ಪುಟ್ಟ ರಾಘವನು ನಂದಿ ಬೆಟ್ಟಕ್ಕೆ ಹೋದಾಗ ಕಲ್ಲಿನ ಮೇಲೆ ಸುಂದರವಾದ ಹಳಗನ್ನಡ ಶಾಸನವನ್ನು ನೋಡಿದನು. ತಾತನವರು "ನಮ್ಮ ಕನ್ನಡ ಲಿಪಿ ಎಷ್ಟು ಚಂದ ಗೊತ್ತಾ? ಸ್ವರಗಳು, ವ್ಯಂಜನಗಳು ಸೇರಿದರೆ ಅದ್ಭುತ ಪದಗಳಾಗುತ್ತವೆ" ಎಂದು ವಿವರಿಸಿದರು.',
      theWhyExplanation: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಒಟ್ಟು ೪೯ ಅಕ್ಷರಗಳಿವೆ: ೧೩ ಸ್ವರಗಳು, ೨ ಯೋಗವಾಹಗಳು (ಅಂ, ಅಃ) ಮತ್ತು ೩೪ ವ್ಯಂಜನಗಳು. ಸ್ವರಗಳೆಂದರೆ ಸ್ವತಂತ್ರವಾಗಿ ಉಚ್ಚರಿಸಬಹುದಾದ ಅಕ್ಷರಗಳು (ಅ ರಿಂದ ಔ). ವ್ಯಂಜನಗಳು ಸ್ವರಗಳ ಸಹಾಯದಿಂದ ಉಚ್ಚರಿಸಲ್ಪಡುತ್ತವೆ (ಕ್ + ಅ = ಕ). ಈ ವೈಜ್ಞಾನಿಕ ಅಕ್ಷರ ಸಂಯೋಜನೆಯಿಂದ ಕನ್ನಡದಲ್ಲಿ ಪ್ರತಿಯೊಂದು ಧ್ವನಿಗೆ ನಿಖರವಾದ ಲಿಪಿ ಇದೆ.',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#92400e;">ಕನ್ನಡ ವರ್ಣಮಾಲೆ: ೪೯ ಅಕ್ಷರಗಳು</div><div style="margin-top:6px;font-size:14px;color:#78350f;">ಸ್ವರಗಳು (೧೩) + ಯೋಗವಾಹಗಳು (೨) + ವ್ಯಂಜನಗಳು (೩೪)</div></div>',
      offlineActivity: 'ಮನೆಯಲ್ಲಿರುವ ಹಿರಿಯರೊಂದಿಗೆ ಕುಳಿತು ೫ ಕನ್ನಡ ಸರಳ ಪದಗಳನ್ನು (ಉದಾ: ಅಮ್ಮ, ಮನೆ, ಶಾಲೆ, ಕೆರೆ, ಗಿಳಿ) ಬರೆದು ತೋರಿಸಿ.',
      guidedSteps: [
        'ಹ್ರಸ್ವಸ್ವರ (ಅ, ಇ, ಉ) ಮತ್ತು ದೀರ್ಘಸ್ವರ (ಆ, ಈ, ಊ) ವ್ಯತ್ಯಾಸ ಗಮನಿಸಿ.',
        'ವ್ಯಂಜನಗಳಿಗೆ ಸ್ವರ ಸೇರಿದಾಗ ಗುಣಿತಾಕ್ಷರ ಉಂಟಾಗುವುದನ್ನು ತಿಳಿಯಿರಿ.',
        'ದೈನಂದಿನ ಕನ್ನಡ ಪದಗಳನ್ನು ಶುದ್ಧವಾಗಿ ಉಚ್ಚರಿಸಿ.'
      ],
      questions: [
        {
          id: 'c3-kan-q1',
          prompt: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಒಟ್ಟು ಎಷ್ಟು ಅಕ್ಷರಗಳಿವೆ?',
          options: ['೪೯ (49)', '೫೨ (52)', '೨೬ (26)', '೩೪ (34)'],
          correctIndex: 0,
          explanation: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಒಟ್ಟು ೪೯ ಅಕ್ಷರಗಳಿವೆ (೧೩ ಸ್ವರ + ೨ ಯೋಗವಾಹ + ೩೪ ವ್ಯಂಜನ).'
        },
        {
          id: 'c3-kan-q2',
          prompt: '\'ಅಂ\' ಮತ್ತು \'ಅಃ\' ಅಕ್ಷರಗಳನ್ನು ವ್ಯಾಕರಣದಲ್ಲಿ ಏನೆಂದು ಕರೆಯುತ್ತಾರೆ?',
          options: ['ಯೋಗವಾಹಗಳು (Yogavahagalu)', 'ಸ್ವರಗಳು', 'ಒತ್ತಕ್ಷರಗಳು', 'ದೀರ್ಘಸ್ವರಗಳು'],
          correctIndex: 0,
          explanation: 'ಅನುಸ್ವಾರ (ಅಂ) ಮತ್ತು ವಿಸರ್ಗ (ಅಃ) ಇವುಗಳನ್ನು ಯೋಗವಾಹಗಳು ಎಂದು ಕರೆಯುತ್ತಾರೆ.'
        }
      ]
    },
    {
      id: 'c3-hindi-varnamala-matra',
      grade: 3,
      board: 'CBSE',
      subject: 'Hindi',
      chapterNumber: 1,
      chapterTitle: 'वर्णमाला और मात्राओं का संसार',
      lessonTitle: 'स्वरों की मात्राएं और सही उच्चारण (Hindi Vowels & Matras)',
      objective: 'हिंदी के स्वर, व्यंजन और मात्राओं को पहचानकर शुद्ध वर्तनी और उच्चारण के साथ पढ़ना और लिखना।',
      locationContext: 'नई दिल्ली एवं जयपुर के प्राथमिक विद्यालय',
      storyHook: 'रोहन अपनी नानी जी को पत्र लिखना चाहता था। उसने लिखा "कमल" लेकिन वह लिखना चाहता था "कोमल"। नानी जी ने मुस्कुराते हुए समझाया कि एक छोटी सी मात्रा पूरे शब्द का अर्थ बदल देती है!',
      theWhyExplanation: 'हिंदी एक ध्वन्यात्मक (phonetic) भाषा है—जैसा बोला जाता है, वैसा ही लिखा जाता है। जब किसी व्यंजन के साथ स्वर जुड़ता है, तो स्वर अपने मूल रूप में न आकर मात्रा (symbol) के रूप में आता है (जैसे क + आ = का, क + इ = कि)। मात्राओं के सही ज्ञान से शब्द का उच्चारण और अर्थ दोनों स्पष्ट और त्रुटिरहित बनते हैं।',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#fef2f2;border:2px solid #ef4444;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#991b1b;">स्वर और उनकी मात्राएं</div><div style="margin-top:6px;font-size:14px;color:#7f1d1d;">अ (कोई मात्रा नहीं), आ (ा), इ (ि), ई (ी), उ (ु), ऊ (ू)</div></div>',
      offlineActivity: 'अपने घर में मिलने वाली 5 वस्तुओं (जैसे किताब, पंखा, गिलास, थाली, मेज) के नाम हिंदी में लिखकर उनकी मात्राओं पर गोला लगाइए।',
      guidedSteps: [
        'ह्रस्व स्वर (इ, उ) और दीर्घ स्वर (ई, ऊ) के उच्चारण समय का अंतर समझें।',
        'मात्रा व्यंजन के किस ओर लगती है, इसका ध्यान रखें (जैसे \'ि\' बाईं ओर, \'ी\' दाईं ओर)।',
        'शब्दों को बोलकर शुद्ध वर्तनी का अभ्यास करें।'
      ],
      questions: [
        {
          id: 'c3-hin-q1',
          prompt: 'किस स्वर की कोई अलग मात्रा नहीं होती?',
          options: ['अ (A)', 'आ (Aa)', 'इ (I)', 'ई (Ee)'],
          correctIndex: 0,
          explanation: '\'अ\' स्वर प्रत्येक व्यंजन में स्वाभाविक रूप से मिला होता है, इसकी कोई अलग मात्रा नहीं होती।'
        },
        {
          id: 'c3-hin-q2',
          prompt: '\'क\' व्यंजन में छोटी \'इ\' की मात्रा जोड़ने पर क्या बनेगा?',
          options: ['कि (Ki)', 'की (Kee)', 'कु (Ku)', 'कू (Koo)'],
          correctIndex: 0,
          explanation: 'क + इ = कि (छोटी \'इ\' की मात्रा व्यंजन के बाईं ओर लगाई जाती है)।'
        }
      ]
    }
  ],
  4: [
    {
      id: 'c4-math-shapes-3d',
      grade: 4,
      board: 'CBSE',
      subject: 'Mathematics',
      chapterNumber: 1,
      chapterTitle: 'Shapes Around Us & Solid Objects',
      lessonTitle: 'Meet the Shapes You Can Hold: Faces, Edges & Vertices',
      objective: 'Differentiate 2D flat drawings from 3D solid shapes and identify faces, straight/curved edges, and vertices in everyday objects.',
      locationContext: 'Classroom & Kitchen, Bengaluru',
      storyHook: 'Ananya draws a circle on paper with a bangle. Then her mother hands her a tennis ball and an orange. Ananya tries to press the orange flat on the paper and notices: a ball is not a circle; it takes up space and can be held from all sides!',
      theWhyExplanation: 'A two-dimensional (2D) shape has only length and width; it lives flat on a plane. A three-dimensional (3D) solid shape has length, width, and depth (height)—it occupies volume in space. A cube has 6 flat square faces, 12 straight edges, and 8 sharp corner points (vertices). A cylinder has 2 flat circular faces and 1 curved surface, allowing it to roll in one direction and stack stably on its flat base.',
      visualModelType: 'geometry',
      offlineActivity: 'Find a cardboard box, an empty tin can, and a marble. Touch and count how many flat surfaces each object has.',
      guidedSteps: [
        'Hold a solid object with both hands.',
        'Run your finger along the flat surfaces (Faces).',
        'Follow where two faces meet along a line (Edge).',
        'Touch the sharp corners where edges meet (Vertices).'
      ],
      questions: [
        {
          id: 'c4-q1',
          prompt: 'How many flat faces does a standard cube (like a playing die) have?',
          options: ['4 faces', '6 faces', '8 faces', '12 faces'],
          correctIndex: 1,
          explanation: 'A cube has 6 identical flat square faces (top, bottom, front, back, left, right).'
        },
        {
          id: 'c4-q2',
          prompt: 'What makes a sphere different from a flat circle?',
          options: ['A sphere has 3 dimensions and takes up space; a circle is flat', 'A sphere has straight corners', 'A circle can roll on carpet', 'They are identical'],
          correctIndex: 0,
          explanation: 'A circle is a 2D flat drawing, while a sphere is a 3D solid object with volume.'
        }
      ]
    },
    {
      id: 'c4-kannada-gunithakshara',
      grade: 4,
      board: 'CBSE',
      subject: 'Kannada',
      chapterNumber: 1,
      chapterTitle: 'ಗುಣಿತಾಕ್ಷರಗಳು ಮತ್ತು ಕಾಗುಣಿತ ಚಿಹ್ನೆಗಳು',
      lessonTitle: 'ಕಾಗುಣಿತ ಚಿಹ್ನೆಗಳ ಮಾಂತ್ರಿಕತೆ (Kannada Kagunitha & Vowel Signs)',
      objective: 'ವ್ಯಂಜನಗಳಿಗೆ ಸ್ವರ ಚಿಹ್ನೆಗಳನ್ನು ಸೇರಿಸಿ ಕಾಗುಣಿತ ರೂಪಗಳನ್ನು ಸರಿಯಾಗಿ ರಚಿಸುವುದು ಮತ್ತು ಓದುವುದು.',
      locationContext: 'ಮೈಸೂರು ಅರಮನೆ ಗ್ರಂಥಾಲಯ',
      storyHook: 'ಅನನ್ಯ ಮೈಸೂರು ಅರಮನೆಯಲ್ಲಿ ಹಳೆಯ ಕನ್ನಡ ಹಸ್ತಪ್ರತಿಗಳನ್ನು ನೋಡಿದಳು. ತಾತ ಹೇಳಿದರು: "ವ್ಯಂಜನ ಕೇವಲ ಅರ್ಧ ಪ್ರಾಣ (ಕ್). ಅದಕ್ಕೆ ಸ್ವರ ಸೇರಿದಾಗ ಮಾತ್ರ ಪೂರ್ಣ ಅಕ್ಷರವಾಗುತ್ತದೆ (ಕ್ + ಆ = ಕಾ)."',
      theWhyExplanation: 'ವ್ಯಂಜನಗಳು ಸ್ವತಂತ್ರವಾಗಿ ಉಚ್ಚರಿಸಲಾಗದ ಅರೆಧ್ವನಿಗಳು (ಉದಾ: ಕ್, ಗ್, ತ್). ಇವುಗಳಿಗೆ ೧೩ ಸ್ವರಗಳು ಸೇರಿದಾಗ ಗುಣಿತಾಕ್ಷರಗಳು (ಕಾಗುಣಿತ) ಸೃಷ್ಟಿಯಾಗುತ್ತವೆ. ಉದಾಹರಣೆಗೆ: ಕ್ + ಅ = ಕ (ತಲೆಕಟ್ಟು), ಕ್ + ಆ = ಕಾ (ದೀರ್ಘ), ಕ್ + ಇ = ಕಿ (ಗುಡಿಸು), ಕ್ + ಈ = ಕೀ (ಗುಡಿಸು ದೀರ್ಘ), ಕ್ + ಉ = ಕು (ಕೊಂಬು). ಈ ವೈಜ್ಞಾನಿಕ ಸ್ವರ ಚಿಹ್ನೆಗಳ ಸಂಯೋಜನೆಯಿಂದ ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಉಚ್ಚಾರಣೆ ಮತ್ತು ಬರವಣಿಗೆ ಎರಡೂ ಒಂದೇ ನಾದದಲ್ಲಿ ಚಲಿಸುತ್ತವೆ.',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#1e40af;">ಕಾಗುಣಿತ ರಚನೆ: ವ್ಯಂಜನ + ಸ್ವರ</div><div style="display:flex;justify-content:center;gap:12px;margin-top:10px;font-size:16px;font-weight:700;"><span style="color:#0f172a;">ಕ್ + ಅ = ಕ</span><span style="color:#2563eb;">ಕ್ + ಆ = ಕಾ</span><span style="color:#16a34a;">ಕ್ + ಇ = ಕಿ</span><span style="color:#d97706;">ಕ್ + ಉ = ಕು</span></div></div>',
      offlineActivity: 'ನಿಮ್ಮ ಹೆಸರಿನ ಮೊದಲ ಅಕ್ಷರವನ್ನು ತೆಗೆದುಕೊಂಡು ಅದರ ಎಲ್ಲಾ ಕಾಗುಣಿತ ರೂಪಗಳನ್ನು (ಕ, ಕಾ, ಕಿ, ಕೀ...) ಹಾಳೆಯಲ್ಲಿ ಸುಂದರವಾಗಿ ಬರೆಯಿರಿ.',
      guidedSteps: [
        'ಮೂಲ ವ್ಯಂಜನ ಧ್ವನಿಯನ್ನು (ಅರ್ಧಾಕ್ಷರ) ಗುರುತಿಸಿ.',
        'ಸೇರುವ ಸ್ವರ ಚಿಹ್ನೆಯನ್ನು (ತಲೆಕಟ್ಟು, ದೀರ್ಘ, ಗುಡಿಸು, ಕೊಂಬು) ಗಮನಿಸಿ.',
        'ಧ್ವನಿಯ ಏರಿಳಿತದೊಂದಿಗೆ ಕಾಗುಣಿತವನ್ನು ಸರಿಯಾಗಿ ಉಚ್ಚರಿಸಿ.'
      ],
      questions: [
        {
          id: 'c4-kan-q1',
          prompt: '\'ಕ್ + ಆ\' ಸೇರಿದಾಗ ಯಾವ ಕಾಗುಣಿತ ಅಕ್ಷರ ಉಂಟಾಗುತ್ತದೆ?',
          options: ['ಕ', 'ಕಾ (Kaa)', 'ಕಿ', 'ಕು'],
          correctIndex: 1,
          explanation: '\'ಕ್\' ವ್ಯಂಜನಕ್ಕೆ \'ಆ\' ದೀರ್ಘ ಸ್ವರ ಸೇರಿದಾಗ \'ಕಾ\' ಅಕ್ಷರವಾಗುತ್ತದೆ.'
        },
        {
          id: 'c4-kan-q2',
          prompt: '\'ಕೊಂಬು\' (ು) ಚಿಹ್ನೆಯು ಯಾವ ಸ್ವರವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ?',
          options: ['ಅ', 'ಇ', 'ಉ (U)', 'ಎ'],
          correctIndex: 2,
          explanation: '\'ಕೊಂಬು\' ಚಿಹ್ನೆಯು \'ಉ\' ಸ್ವರದ ಸಂಕೇತವಾಗಿದೆ (ಉದಾ: ಕ್ + ಉ = ಕು).'
        }
      ]
    },
    {
      id: 'c4-hindi-sangya',
      grade: 4,
      board: 'CBSE',
      subject: 'Hindi',
      chapterNumber: 1,
      chapterTitle: 'संज्ञा और उसके भेद',
      lessonTitle: 'नाम की पहचान: व्यक्ति, वस्तु, स्थान और भाव (Nouns in Hindi)',
      objective: 'संज्ञा की परिभाषा समझना और व्यक्तिवाचक, जातिवाचक एवं भाववाचक संज्ञा में अंतर करना।',
      locationContext: 'मैसूरु पैलेस और बेंगलुरु शहर',
      storyHook: 'आरव और मीरा जब मैसूरु पैलेस देखने गए, तो गाइड ने कहा: "यह महल बहुत विशाल है और इसे देखकर मन में खुशी होती है।" गाइड के इस वाक्य में महल, मैसूरु, आरव और खुशी—सब नाम हैं!',
      theWhyExplanation: 'संसार में प्रत्येक वस्तु, व्यक्ति, स्थान या मन के भाव का कोई न कोई नाम अवश्य होता है। व्याकरण में इसी नाम को संज्ञा कहते हैं। संज्ञा तीन मुख्य प्रकार की होती है: व्यक्तिवाचक (किसी विशेष का नाम जैसे ताजमहल, मीरा), जातिवाचक (पूरी जाति या समूह का नाम जैसे नदी, बालक, शहर), और भाववाचक (जिसे छू नहीं सकते, केवल अनुभव कर सकते हैं जैसे खुशी, मिठास, बचपन)।',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#166534;">संज्ञा के तीन मुख्य भेद</div><div style="margin-top:6px;font-size:14px;color:#14532d;">व्यक्तिवाचक (हिमालय) • जातिवाचक (पर्वत) • भाववाचक (ऊंचाई)</div></div>',
      offlineActivity: 'अपने कमरे में मौजूद 3 जातिवाचक संज्ञा (जैसे कुर्सी, किताब, पंखा) और 2 भाववाचक संज्ञा (जैसे शांति, स्वच्छता) की सूची बनाइए।',
      guidedSteps: [
        'किसी वाक्य में नाम वाले शब्दों को पहचानें।',
        'जांचें कि क्या वह किसी विशेष का नाम है या पूरी जाति का।',
        'यदि वह मन की भावना या गुण है, तो वह भाववाचक संज्ञा है।'
      ],
      questions: [
        {
          id: 'c4-hin-q1',
          prompt: '\'गंगा भारत की पवित्र नदी है\' वाक्य में \'गंगा\' किस प्रकार की संज्ञा है?',
          options: ['व्यक्तिवाचक संज्ञा (Proper Noun)', 'जातिवाचक संज्ञा (Common Noun)', 'भाववाचक संज्ञा (Abstract Noun)', 'क्रिया'],
          correctIndex: 0,
          explanation: '\'गंगा\' एक विशेष नदी का निश्चित नाम है, इसलिए यह व्यक्तिवाचक संज्ञा है।'
        },
        {
          id: 'c4-hin-q2',
          prompt: 'इनमें से कौन सा शब्द भाववाचक संज्ञा है?',
          options: ['मिठास (Sweetness)', 'सेब (Apple)', 'लड़का (Boy)', 'पेड़ (Tree)'],
          correctIndex: 0,
          explanation: '\'मिठास\' एक स्वाद और अनुभव का भाव है जिसे छुआ नहीं जा सकता, केवल महसूस किया जा सकता है।'
        }
      ]
    }
  ],
  5: [
    {
      id: 'c5-math-factors-multiples',
      grade: 5,
      board: 'CBSE',
      subject: 'Mathematics',
      chapterNumber: 1,
      chapterTitle: 'Factors, Multiples & Prime Numbers',
      lessonTitle: 'The Factor Rainbow: Why Some Numbers Refuse to Break',
      objective: 'Understand factors as exact divisors without remainders, and discover prime numbers as building blocks of all integers.',
      locationContext: 'Gandhi Bazaar Flower Market, Bengaluru',
      storyHook: 'A florist has 12 marigold garlands. She can arrange them in 1 row of 12, 2 rows of 6, 3 rows of 4, 4 rows of 3, 6 rows of 2, or 12 rows of 1. But when she receives 13 rose garlands, she can only arrange them in 1 row of 13 or 13 rows of 1!',
      theWhyExplanation: 'Factors of a number are integers that divide it completely with zero remainder. For 12, the factors are 1, 2, 3, 4, 6, and 12. Because 12 has more than two factors, it is a composite number. The number 13 can only be divided by 1 and itself (13). Numbers like 2, 3, 5, 7, 11, and 13 that have exactly two distinct factors are called Prime Numbers. They are the fundamental atoms of mathematics.',
      visualModelType: 'formula',
      visualModelHtml: '<div style="background:#f8fafc;padding:16px;border-radius:10px;border:1px solid #cbd5e1;text-align:center;"><div style="font-size:18px;font-weight:700;color:#0f172a;">12 = 1 × 12 = 2 × 6 = 3 × 4</div><div style="margin-top:8px;font-size:14px;color:#16a34a;font-weight:600;">Factors of 12: {1, 2, 3, 4, 6, 12}</div><div style="margin-top:4px;font-size:14px;color:#dc2626;font-weight:600;">13 is Prime: Factors {1, 13} only</div></div>',
      offlineActivity: 'Take 24 small buttons or coins. Try to build rectangles with them. How many different rectangles can you form?',
      guidedSteps: [
        'Start with 1 × the number.',
        'Test if 2 divides it evenly (even number check).',
        'Test 3, 4, and 5.',
        'Stop testing when factor pairs begin repeating.'
      ],
      questions: [
        {
          id: 'c5-q1',
          prompt: 'Which of the following is a prime number?',
          options: ['9 (divisible by 1, 3, 9)', '15 (divisible by 1, 3, 5, 15)', '17 (divisible by 1 and 17 only)', '21 (divisible by 1, 3, 7, 21)'],
          correctIndex: 2,
          explanation: '17 has exactly two factors: 1 and 17. Therefore, 17 is a prime number.'
        },
        {
          id: 'c5-q2',
          prompt: 'What is the smallest prime number?',
          options: ['0', '1', '2', '3'],
          correctIndex: 2,
          explanation: '2 is the smallest prime number (and the only even prime). 1 is neither prime nor composite.'
        }
      ]
    },
    {
      id: 'c5-kannada-namapada',
      grade: 5,
      board: 'CBSE',
      subject: 'Kannada',
      chapterNumber: 1,
      chapterTitle: 'ನಾಮಪದಗಳು ಮತ್ತು ನೇಗಿಲ ಯೋಗಿ',
      lessonTitle: 'ನಾಮಪದಗಳ ಪ್ರಕಾರಗಳು: ರೂಢನಾಮ, ಅಂಕಿತನಾಮ ಮತ್ತು ಅನ್ವರ್ಥನಾಮ',
      objective: 'ವ್ಯಾಕರಣದಲ್ಲಿ ನಾಮಪದಗಳ ಮೂರು ಮುಖ್ಯ ವಿಧಗಳನ್ನು (ರೂಢನಾಮ, ಅಂಕಿತನಾಮ, ಅನ್ವರ್ಥನಾಮ) ಗುರುತಿಸುವುದು ಮತ್ತು ವಾಕ್ಯಗಳಲ್ಲಿ ಸರಿಯಾಗಿ ಬಳಸುವುದು.',
      locationContext: 'ಮಂಡ್ಯದ ಕಾವೇರಿ ನದಿ ತೀರ ಮತ್ತು ಹಸಿರು ಹೊಲಗಳು',
      storyHook: 'ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪುರವರ \'ನೇಗಿಲ ಯೋಗಿ\' ಕವನ ಓದುತ್ತಿದ್ದಾಗ ತೇಜಸ್ವಿ ಕೇಳಿದ: "ರೈತ, ಕುವೆಂಪು, ನದಿ—ಇವೆಲ್ಲವೂ ನಾಮಪದಗಳೇ? ಇವುಗಳ ನಡುವೆ ಏನು ವ್ಯತ್ಯಾಸ?"',
      theWhyExplanation: 'ವಸ್ತುವಿನ, ವ್ಯಕ್ತಿಯ, ಸ್ಥಳದ ಅಥವಾ ಪ್ರಾಣಿಯ ಹೆಸರನ್ನು ಸೂಚಿಸುವ ಪದಗಳಿಗೆ ನಾಮಪದ ಎನ್ನುತ್ತಾರೆ. ನಾಮಪದಗಳಲ್ಲಿ ಮುಖ್ಯವಾಗಿ ಮೂರು ಪ್ರಕಾರಗಳಿವೆ:\n೧. ರೂಢನಾಮ: ಪರಂಪರೆಯಿಂದ ರೂಢಿಯಲ್ಲಿ ಬಂದ ಸಾಮಾನ್ಯ ಹೆಸರುಗಳು (ಉದಾ: ನದಿ, ಪರ್ವತ, ಮನುಷ್ಯ, ಶಾಲೆ).\n೨. ಅಂಕಿತನಾಮ: ನಿರ್ದಿಷ್ಟ ವ್ಯಕ್ತಿ, ಸ್ಥಳ ಅಥವಾ ವಸ್ತುವನ್ನು ಗುರುತಿಸಲು ಇಟ್ಟ ಹೆಸರು (ಉದಾ: ಕುವೆಂಪು, ಬೆಂಗಳೂರು, ಕಾವೇರಿ, ಭಾರತ).\n೩. ಅನ್ವರ್ಥನಾಮ: ವ್ಯಕ್ತಿಯ ಕೆಲಸ, ಗುಣ ಅಥವಾ ವೃತ್ತಿಯನ್ನು ಆಧರಿಸಿ ಬಂದ ಹೆಸರು (ಉದಾ: ರೈತ, ಶಿಕ್ಷಕ, ವೈದ್ಯ, ವಿಜ್ಞಾನಿ).',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#15803d;">ನಾಮಪದದ ೩ ಮುಖ್ಯ ಪ್ರಕಾರಗಳು</div><div style="display:flex;justify-content:center;gap:16px;margin-top:10px;font-size:14px;font-weight:700;"><span style="color:#0f172a;">ರೂಢನಾಮ (ನದಿ, ಶಾಲೆ)</span><span style="color:#2563eb;">ಅಂಕಿತನಾಮ (ಕಾವೇರಿ, ಭಾರತ)</span><span style="color:#d97706;">ಅನ್ವರ್ಥನಾಮ (ರೈತ, ವೈದ್ಯ)</span></div></div>',
      offlineActivity: 'ನಿಮ್ಮ ಮನೆಯಲ್ಲಿರುವ ೫ ವ್ಯಕ್ತಿಗಳು ಅಥವಾ ವಸ್ತುಗಳ ಪಟ್ಟಿ ಮಾಡಿ, ಅವುಗಳಲ್ಲಿ ಯಾವುದು ಅಂಕಿತನಾಮ ಮತ್ತು ಯಾವುದು ಅನ್ವರ್ಥನಾಮ ಎಂದು ವಿಂಗಡಿಸಿ.',
      guidedSteps: [
        'ಪದವು ಸಾಮಾನ್ಯ ಹೆಸರೋ ಅಥವಾ ಇಟ್ಟ ಹೆಸರೋ ಗಮನಿಸಿ.',
        'ವೃತ್ತಿ ಅಥವಾ ಕೆಲಸವನ್ನು ಸೂಚಿಸುತ್ತಿದ್ದರೆ ಅದು ಅನ್ವರ್ಥನಾಮ.',
        'ನಿರ್ದಿಷ್ಟ ಹೆಸರಾಗಿದ್ದರೆ (ಉದಾ: ಬೆಂಗಳೂರು) ಅದು ಅಂಕಿತನಾಮ.'
      ],
      questions: [
        {
          id: 'c5-kan-q1',
          prompt: '\'ಕಾವೇರಿ\' ಎಂಬುದು ಯಾವ ಪ್ರಕಾರದ ನಾಮಪದ?',
          options: ['ರೂಢನಾಮ', 'ಅಂಕಿತನಾಮ (Ankitanama)', 'ಅನ್ವರ್ಥನಾಮ', 'ಸರ್ವನಾಮ'],
          correctIndex: 1,
          explanation: '\'ಕಾವೇರಿ\' ಒಂದು ನಿರ್ದಿಷ್ಟ ನದಿಗೆ ಇಟ್ಟ ಹೆಸರಾಗಿರುವುದರಿಂದ ಇದು ಅಂಕಿತನಾಮ.'
        },
        {
          id: 'c5-kan-q2',
          prompt: '\'ವೈದ್ಯ\' (Doctor) ಎಂಬ ಪದವು ಯಾವ ನಾಮಪದಕ್ಕೆ ಉದಾಹರಣೆ?',
          options: ['ರೂಢನಾಮ', 'ಅನ್ವರ್ಥನಾಮ (Anvarthanama)', 'ಅಂಕಿತನಾಮ', 'ಭಾವನಾಮ'],
          correctIndex: 1,
          explanation: '\'ವೈದ್ಯ\' ಎಂಬುದು ರೋಗ ಗುಣಪಡಿಸುವ ವೃತ್ತಿ/ಕೆಲಸಕ್ಕೆ ಅನ್ವರ್ಥವಾಗಿ ಬಂದಿರುವುದರಿಂದ ಅನ್ವರ್ಥನಾಮ.'
        }
      ]
    },
    {
      id: 'c5-hindi-sarvanam',
      grade: 5,
      board: 'CBSE',
      subject: 'Hindi',
      chapterNumber: 1,
      chapterTitle: 'सर्वनाम और भाषा प्रवाह',
      lessonTitle: 'संज्ञा के स्थान पर आने वाले शब्द (Pronouns in Hindi)',
      objective: 'संज्ञा के दोहराव को रोककर सर्वनाम (मैं, तुम, वह, हम, आप) का सटीक प्रयोग करना।',
      locationContext: 'स्कूल प्रार्थना सभा एवं खेल का मैदान',
      storyHook: 'कक्षा में शिक्षक ने पढ़ा: "रोहन रोहन के घर गया। रोहन ने रोहन की माँ से पानी माँगा।" सब बच्चे हँसने लगे क्योंकि बार-बार \'रोहन\' बोलने से वाक्य अजीब लग रहा था। शिक्षक ने कहा: "रोहन अपने घर गया और उसने अपनी माँ से पानी माँगा।" यह सर्वनाम का चमत्कार है!',
      theWhyExplanation: 'सर्वनाम वे शब्द हैं जो संज्ञा के स्थान पर प्रयोग किए जाते हैं। यदि भाषा में सर्वनाम न हों, तो हमें हर वाक्य में बार-बार व्यक्ति या वस्तु का नाम दोहराना पड़ेगा जिससे भाषा बोझिल हो जाएगी। सर्वनाम भाषा को संक्षिप्त, सुंदर और प्रवाहपूर्ण बनाते हैं। सर्वनाम के 6 भेद होते हैं: पुरुषवाचक, निश्चयवाचक, अनिश्चयवाचक, संबंधवाचक, प्रश्नवाचक और निजवाचक।',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#1e40af;">सर्वनाम: संज्ञा की जगह</div><div style="margin-top:6px;font-size:14px;color:#1e3a8a;">रोहन पढ़ रहा है ➔ वह पढ़ रहा है • हम सब खेल रहे हैं</div></div>',
      offlineActivity: 'अपने मित्र के बारे में 4 वाक्य बोलिए बिना उसका नाम बार-बार दोहराए (सर्वनाम का प्रयोग करते हुए)।',
      guidedSteps: [
        'संज्ञा पद की पहचान करें जिसे बदलना है।',
        'वचन और आदर के अनुसार सही सर्वनाम चुनें (जैसे बड़ों के लिए \'आप\')।',
        'वाक्य के अर्थ और प्रवाह की पुनः जांच करें।'
      ],
      questions: [
        {
          id: 'c5-hin-q1',
          prompt: '\'दरवाजे पर कोई खड़ा है\' वाक्य में \'कोई\' कौन सा सर्वनाम है?',
          options: ['अनिश्चयवाचक सर्वनाम (Indefinite Pronoun)', 'निश्चयवाचक सर्वनाम', 'प्रश्नवाचक सर्वनाम', 'निजवाचक सर्वनाम'],
          correctIndex: 0,
          explanation: '\'कोई\' शब्द से निश्चित व्यक्ति का बोध नहीं होता, इसलिए यह अनिश्चयवाचक सर्वनाम है।'
        },
        {
          id: 'c5-hin-q2',
          prompt: 'बड़ों से बातचीत करते समय सम्मानसूचक किस सर्वनाम का प्रयोग किया जाता है?',
          options: ['आप (Aap)', 'तू', 'तुम', 'यह'],
          correctIndex: 0,
          explanation: 'हिंदी शिष्टाचार और व्याकरण के अनुसार बड़ों और आदरणीय व्यक्तियों के लिए \'आप\' का प्रयोग होता है।'
        }
      ]
    }
  ],
  6: [
    {
      id: 'c6-science-food-components',
      grade: 6,
      board: 'CBSE',
      subject: 'Science',
      chapterNumber: 1,
      chapterTitle: 'Components of Food & Nutrient Tests',
      lessonTitle: 'The Starch & Protein Detective: Chemical Indicators in the Kitchen',
      objective: 'Identify carbohydrates, proteins, and fats using diagnostic chemical indicator tests (iodine and copper sulphate).',
      locationContext: 'School Science Lab, Bengaluru',
      storyHook: 'Rohan spills two drops of brown iodine tincture onto a slice of boiled potato. Instantly, the golden potato turns deep blue-black! Meanwhile, two drops on a slice of boiled egg white remain clear brown.',
      theWhyExplanation: 'Food contains essential nutrients: Carbohydrates (energy), Proteins (body-building and cellular repair), Fats (stored energy), Vitamins, and Minerals. Starch is a complex carbohydrate. When iodine molecules slip inside the coiled helical structure of starch chains, they form a complex that reflects dark blue-black light. When testing for proteins, adding Copper Sulphate and Caustic Soda (Biuret reagent) reacts with peptide bonds to produce a violet color.',
      visualModelType: 'table',
      offlineActivity: 'Rub a piece of walnut or peanut on brown wrapping paper. Hold the paper against the light. An oily translucent patch proves the presence of fats.',
      guidedSteps: [
        'Take a small food sample on a clean plate.',
        'Add 2-3 drops of diluted iodine solution.',
        'Observe the color transition: Blue-black indicates starch.',
        'For protein, add 2 drops copper sulphate + 10 drops caustic soda.'
      ],
      questions: [
        {
          id: 'c6-q1',
          prompt: 'What color change proves the presence of starch when iodine is added?',
          options: ['Turns bright yellow', 'Turns deep blue-black', 'Turns milky white', 'Produces gas bubbles'],
          correctIndex: 1,
          explanation: 'Iodine reacts specifically with the helical structure of starch to form a dark blue-black complex.'
        },
        {
          id: 'c6-q2',
          prompt: 'Which nutrient is primarily responsible for tissue growth and muscle repair?',
          options: ['Simple sugars', 'Fats', 'Proteins', 'Roughage'],
          correctIndex: 2,
          explanation: 'Proteins are the body-building nutrients required for cell repair, muscle development, and enzymes.'
        }
      ]
    },
    {
      id: 'c6-kannada-vibhakti',
      grade: 6,
      board: 'CBSE',
      subject: 'Kannada',
      chapterNumber: 1,
      chapterTitle: 'ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು ಮತ್ತು ಕಿತ್ತೂರು ಚೆನ್ನಮ್ಮ',
      lessonTitle: 'ಕನ್ನಡದ ಏಳು ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು (The 7 Vibhakti Case Endings)',
      objective: 'ಪ್ರಥಮಾದಿಂದ ಸಪ್ತಮಿವರೆಗಿನ ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು ವಾಕ್ಯದಲ್ಲಿ ನಾಮಪದ ಮತ್ತು ಕ್ರಿಯಾಪದದ ಸಂಬಂಧವನ್ನು ಹೇಗೆ ಬೆಸೆಯುತ್ತವೆ ಎಂದು ಅರಿಯುವುದು.',
      locationContext: 'ಕಿತ್ತೂರು ಕೋಟೆ ಮತ್ತು ಬೆಳಗಾವಿ',
      storyHook: 'ವೀರರಾಣಿ ಕಿತ್ತೂರು ಚೆನ್ನಮ್ಮ ಬ್ರಿಟಿಷರಿಗೆ ಗರ್ಜಿಸಿದಳು: "ನಮ್ಮ ನಾಡಿಗೆ ಕಪ್ಪವನ್ನು ಏಕೆ ಕೊಡಬೇಕು?" ಈ ವಾಕ್ಯದಲ್ಲಿ \'ನಾಡಿಗೆ\' (ನಾಡು + ಗೆ) ಮತ್ತು \'ಕಪ್ಪವನ್ನು\' (ಕಪ್ಪ + ಅನ್ನು) ಪದಗಳು ವಿಭಕ್ತಿಯಿಂದ ಹೇಗೆ ಅರ್ಥಪೂರ್ಣವಾಗಿವೆ?',
      theWhyExplanation: 'ವಾಕ್ಯದಲ್ಲಿ ನಾಮಪದಗಳಿಗೂ ಕ್ರಿಯಾಪದಕ್ಕೂ ಇರುವ ಸಂಬಂಧವನ್ನು (ಕಾರಕಾರ್ಥ) ತೋರಿಸಲು ನಾಮಪದದ ಮುಂದೆ ಸೇರುವ ಪ್ರತ್ಯಯಗಳೇ ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು. ಕನ್ನಡದಲ್ಲಿ ಏಳು ವಿಭಕ್ತಿಗಳಿವೆ:\n೧. ಪ್ರಥಮಾ (ಉ) - ಕರ್ತೃ ಕಾರಕ (ರಾಮನು)\n೨. ದ್ವಿತೀಯಾ (ಅನ್ನು) - ಕರ್ಮ ಕಾರಕ (ಹಣ್ಣನ್ನು)\n೩. ತೃತೀಯಾ (ಇಂದ) - ಕರಣ ಕಾರಕ (ಕತ್ತಿಯಿಂದ)\n೪. ಚತುರ್ಥೀ (ಗೆ/ಇಗೆ/ಕ್ಕೆ) - ಸಂಪ್ರದಾನ ಕಾರಕ (ಶಾಲೆಗೆ)\n೫. ಪಂಚಮೀ (ದೆಸೆಯಿಂದ) - ಅಪಾದಾನ ಕಾರಕ (ಮರದ ದೆಸೆಯಿಂದ)\n೬. ಷಷ್ಠೀ (ಅ) - ಸಂಬಂಧ ಕಾರಕ (ಕನ್ನಡದ ನೆಲ)\n೭. ಸಪ್ತಮೀ (ಅಲ್ಲಿ) - ಅಧಿಕರಣ ಕಾರಕ (ಊರಿನಲ್ಲಿ)',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#1e40af;">ಕನ್ನಡದ ೭ ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:10px;font-size:13px;font-weight:700;"><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #bfdbfe;">೧. ಪ್ರಥಮಾ: ಉ</span><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #bfdbfe;">೨. ದ್ವಿತೀಯಾ: ಅನ್ನು</span><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #bfdbfe;">೩. ತೃತೀಯಾ: ಇಂದ</span><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #bfdbfe;">೪. ಚತುರ್ಥೀ: ಗೆ/ಇಗೆ/ಕ್ಕೆ</span><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #bfdbfe;">೫. ಪಂಚಮೀ: ದೆಸೆಯಿಂದ</span><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #bfdbfe;">೬. ಷಷ್ಠೀ: ಅ</span><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #bfdbfe;">೭. ಸಪ್ತಮೀ: ಅಲ್ಲಿ</span></div></div>',
      offlineActivity: '"ನಾನು ಶಾಲೆ___ ಹೋಗುತ್ತೇನೆ" ಮತ್ತು "ಅಮ್ಮ ಕೈ___ ತಿಂಡಿ ಕೊಟ್ಟಳು" - ಬಿಟ್ಟ ಸ್ಥಳಗಳಿಗೆ ಸೂಕ್ತ ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳನ್ನು ತುಂಬಿರಿ.',
      guidedSteps: [
        'ವಾಕ್ಯದಲ್ಲಿ ಕ್ರಿಯೆಯನ್ನು ಮಾಡುವ ಕರ್ತೃ ಮತ್ತು ಕರ್ಮವನ್ನು ಗುರುತಿಸಿ.',
        'ನಾಮಪದದ ಅಂತ್ಯದಲ್ಲಿ ಸೇರಿರುವ ಪ್ರತ್ಯಯವನ್ನು ಬಿಡಿಸಿ ನೋಡಿ.',
        'ಏಳು ವಿಭಕ್ತಿಗಳಲ್ಲಿ ಆ ಪ್ರತ್ಯಯ ಯಾವ ವಿಭಕ್ತಿಗೆ ಸೇರಿದೆ ಎಂದು ನಿರ್ಧರಿಸಿ.'
      ],
      questions: [
        {
          id: 'c6-kan-q1',
          prompt: '\'ಕನ್ನಡದ ನೆಲ\' ಎಂಬ ಪದದಲ್ಲಿರುವ \'ಅ\' ಯಾವ ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯ?',
          options: ['ಪ್ರಥಮಾ', 'ದ್ವಿತೀಯಾ', 'ಷಷ್ಠೀ (Shashti)', 'ಸಪ್ತಮೀ'],
          correctIndex: 2,
          explanation: '\'ಅ\' ಎಂಬುದು ಷಷ್ಠೀ ವಿಭಕ್ತಿಯ ಪ್ರತ್ಯಯ (ಸಂಬಂಧ ಕಾರಕ: ಕನ್ನಡದ + ನೆಲ).'
        },
        {
          id: 'c6-kan-q2',
          prompt: 'ದ್ವಿತೀಯಾ ವಿಭಕ್ತಿಯ ಪ್ರತ್ಯಯ ಯಾವುದು?',
          options: ['ಉ', 'ಅನ್ನು (Annu)', 'ಇಂದ', 'ಅಲ್ಲಿ'],
          correctIndex: 1,
          explanation: 'ದ್ವಿತೀಯಾ ವಿಭಕ್ತಿಯ ಪ್ರತ್ಯಯ \'ಅನ್ನು\' (ಕರ್ಮ ಕಾರಕ).'
        }
      ]
    },
    {
      id: 'c6-hindi-visheshan',
      grade: 6,
      board: 'CBSE',
      subject: 'Hindi',
      chapterNumber: 1,
      chapterTitle: 'विशेषण और विशेष्य',
      lessonTitle: 'संज्ञा और सर्वनाम की विशेषता बताने वाले शब्द (Adjectives in Hindi)',
      objective: 'विशेषण के चार मुख्य भेदों (गुणवाचक, संख्यावाचक, परिमाणवाचक, सार्वनामिक) को समझना।',
      locationContext: 'लाल किला एवं दिल्ली हाट बाजार',
      storyHook: 'बाजार में फल विक्रेता आवाज लगा रहा था: "मीठे रसीले आम, ताजे लाल सेब, दो किलो अंगूर!" ग्राहक ने ध्यान दिया कि विक्रेता केवल फल का नाम नहीं बता रहा था, बल्कि फल कैसा है और कितना है, यह बता रहा था!',
      theWhyExplanation: 'जो शब्द संज्ञा या सर्वनाम की विशेषता (गुण, दोष, संख्या, माप-तौल आदि) बताते हैं, उन्हें विशेषण कहते हैं। जिस संज्ञा या सर्वनाम की विशेषता बताई जाए, उसे विशेष्य कहते हैं (जैसे \'लाल सेब\' में \'लाल\' विशेषण है और \'सेब\' विशेष्य है)। विशेषण भाषा को सजीव और चित्रात्मक बनाते हैं।',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#92400e;">विशेषण ➔ विशेष्य सम्बन्ध</div><div style="margin-top:6px;font-size:14px;color:#78350f;">वीर (विशेषण) सैनिक (विशेष्य) • दो लीटर (परिमाण) दूध (विशेष्य)</div></div>',
      offlineActivity: 'अपने पसंदीदा खिलौने या पुस्तक की तीन विशेषताएं (गुण, रंग, आकार) हिंदी में लिखिए।',
      guidedSteps: [
        'पूछें: कैसा? कितना? कौन सा?',
        'उत्तर में मिलने वाला शब्द विशेषण होगा।',
        'जिसकी विशेषता बताई जा रही है, वह विशेष्य होगा।'
      ],
      questions: [
        {
          id: 'c6-hin-q1',
          prompt: '\'मुझे दो मीटर कपड़ा चाहिए\' में \'दो मीटर\' किस प्रकार का विशेषण है?',
          options: ['परिमाणवाचक विशेषण (Quantitative Adjective)', 'गुणवाचक विशेषण', 'संख्यावाचक विशेषण', 'सार्वनामिक विशेषण'],
          correctIndex: 0,
          explanation: 'नाप-तौल या माप बताने वाले विशेषण को परिमाणवाचक विशेषण कहते हैं।'
        },
        {
          id: 'c6-hin-q2',
          prompt: '\'परिश्रमी बालक सफलता पाता है\' वाक्य में विशेष्य शब्द कौन सा है?',
          options: ['बालक (Boy)', 'परिश्रमी (Hardworking)', 'सफलता', 'पाता'],
          correctIndex: 0,
          explanation: '\'परिश्रमी\' विशेषण है जो \'बालक\' की विशेषता बता रहा है, अतः \'बालक\' विशेष्य है।'
        }
      ]
    }
  ],
  7: [
    {
      id: 'c7-math-integers',
      grade: 7,
      board: 'CBSE',
      subject: 'Mathematics',
      chapterNumber: 1,
      chapterTitle: 'Integers & Real-World Operations',
      lessonTitle: 'The Siachen Elevation & Banking Hook: Mastering Negative Numbers',
      objective: 'Apply positive and negative integers to real-world scenarios including temperatures below freezing, debt/credit, and coordinate movement.',
      locationContext: 'Siachen Glacier & Reserve Bank of India, Bengaluru',
      storyHook: 'Bengaluru records a pleasant winter night temperature of +15°C. At the same hour, Indian Army soldiers at the Siachen Glacier outpost report a temperature of −25°C. How many degrees colder is Siachen than Bengaluru? You cannot simply calculate 25 − 15!',
      theWhyExplanation: 'Integers extend the whole number system to include opposite directions from zero. Zero is the reference point (sea level, freezing point of water, or zero bank balance). Positive numbers are to the right or above zero; negative numbers are to the left or below zero. The difference between +15°C and −25°C is found by subtracting: 15 − (−25) = 15 + 25 = 40°C. Subtracting a negative number is mathematically identical to adding its positive opposite because removing a debt increases your net worth.',
      visualModelType: 'formula',
      visualModelHtml: '<div style="background:#0f172a;color:#f8fafc;padding:20px;border-radius:12px;text-align:center;"><div style="font-size:22px;font-weight:700;color:#38bdf8;">15 − (−25) = 15 + 25 = 40°C</div><div style="font-size:13px;color:#94a3b8;margin-top:6px;">Moving from −25 to 0 takes 25 steps; from 0 to +15 takes 15 steps. Total gap = 40 steps.</div></div>',
      offlineActivity: 'Draw a vertical number line on paper representing an elevator in a Bengaluru hospital with 4 upper floors (+1 to +4), ground floor (0), and 2 basement levels (−1, −2). Track where you end up if you go from −2 up 5 floors.',
      guidedSteps: [
        'Set zero as your reference baseline.',
        'Plot positive values upward or rightward.',
        'Plot negative values downward or leftward.',
        'Remember: a − (−b) = a + b.'
      ],
      questions: [
        {
          id: 'c7-q1',
          prompt: 'Which number is smaller: −8 or −3?',
          options: ['−3', '−8', 'They are equal', 'Cannot be compared without a calculator'],
          correctIndex: 1,
          explanation: 'On a horizontal number line, −8 lies further to the left than −3. Therefore, −8 is smaller.'
        },
        {
          id: 'c7-q2',
          prompt: 'A bank balance changes from ₹100 to −₹50. How much money was withdrawn in total?',
          options: ['₹50', '₹100', '₹150', '₹200'],
          correctIndex: 2,
          explanation: 'Withdrawing ₹100 reduces the balance to ₹0. Withdrawing another ₹50 brings it to −₹50. Total = ₹150.'
        }
      ]
    },
    {
      id: 'c7-science-heat-conduction',
      grade: 7,
      board: 'CBSE',
      subject: 'Science',
      chapterNumber: 2,
      chapterTitle: 'Heat Transfer: Conduction, Convection & Radiation',
      lessonTitle: 'Why Hot Sambar Heats the Spoon: Thermal Energy in Motion',
      objective: 'Distinguish between conduction in solids, convection in fluids, and radiation through space without a medium.',
      locationContext: 'Kitchen & Coastal Karnataka',
      storyHook: 'You leave a stainless-steel spoon resting in a steaming pot of rasam. Within two minutes, the top handle of the spoon becomes too hot to touch, even though the handle was never immersed in the soup!',
      theWhyExplanation: 'Heat is thermal energy that always flows naturally from a region of higher temperature to a region of lower temperature until thermal equilibrium is reached. In solids (like metal spoons), tightly packed atoms vibrate faster when heated and collide with adjacent atoms, transferring kinetic energy along the material without the atoms physically traveling. This is Conduction. In fluids (liquids and gases), warmer, less dense fluid rises while cooler, denser fluid sinks, creating Convection currents (responsible for sea breezes along the Karnataka coast). Solar heat reaches Earth across the vacuum of space via electromagnetic waves without any matter medium—this is Radiation.',
      visualModelType: 'diagram',
      offlineActivity: 'Hold your hands 10 cm beside a warm cup of water, then 10 cm directly above the cup. Feel why convection warms your hand much faster directly above the rising steam.',
      guidedSteps: [
        'Identify where heat begins (hot source).',
        'Identify the medium (solid, liquid, gas, or vacuum).',
        'Classify the mechanism: Conduction (atom collisions), Convection (fluid currents), Radiation (infrared waves).'
      ],
      questions: [
        {
          id: 'c7-sci-q1',
          prompt: 'How does heat energy travel from the Sun to the Earth across empty space?',
          options: ['By Conduction through air molecules', 'By Convection currents', 'By Radiation via electromagnetic waves', 'By gravitational waves'],
          correctIndex: 2,
          explanation: 'Empty space has no atoms or molecules. Radiation is the only mode of heat transfer that requires no material medium.'
        },
        {
          id: 'c7-sci-q2',
          prompt: 'Why are cooking pots made of metal while their handles are made of Bakelite plastic or wood?',
          options: ['Metals are good conductors to cook food; plastics are insulators to protect hands', 'Plastics melt easily on flame', 'Metals reflect radiation', 'Plastic is too expensive'],
          correctIndex: 0,
          explanation: 'Metals conduct heat rapidly into the food, while Bakelite is an insulator that prevents burns.'
        }
      ]
    },
    {
      id: 'c7-kannada-sandhi',
      grade: 7,
      board: 'CBSE',
      subject: 'Kannada',
      chapterNumber: 1,
      chapterTitle: 'ಕನ್ನಡ ಸಂಧಿಗಳು ಮತ್ತು ವಚನ ಸಾಹಿತ್ಯ',
      lessonTitle: 'ಕನ್ನಡ ಸಂಧಿಗಳು: ಲೋಪ, ಆಗಮ ಮತ್ತು ಆದೇಶ ಸಂಧಿ',
      objective: 'ಎರಡು ಅಕ್ಷರಗಳು ಕಾಲವಿಳಂಬವಿಲ್ಲದೆ ಕೂಡುವಾಗ ಆಗುವ ಸ್ವರ ಹಾಗೂ ವ್ಯಂಜನ ಸಂಧಿ ನಿಯಮಗಳನ್ನು ಗ್ರಹಿಸುವುದು.',
      locationContext: 'ಕೂಡಲಸಂಗಮ, ಬಾಗಲಕೋಟೆ',
      storyHook: 'ಬಸವೇಶ್ವರರ ವಚನ: "ನುಡಿದರೆ ಹರಳು ಹೊಡೆದಂತಿರಬೇಕು". ಇಲ್ಲಿ \'ಹರಳು + ಒಡೆದಂತೆ = ಹರಳೊಡೆದಂತೆ\' ಎಂದು ಎರಡು ಪದಗಳು ಒಂದೇ ನಾದದಲ್ಲಿ ಹೇಗೆ ಸಂಧಿಯಾಗುತ್ತವೆ?',
      theWhyExplanation: 'ಎರಡು ಪದಗಳು ಪರಸ್ಪರ ಸೇರಿ ಒಂದಾಗುವಾಗ ಧ್ವನಿಗಳಲ್ಲಿ ಆಗುವ ಮಾರ್ಪಾಟಿಗೆ ಸಂಧಿಕಾರ್ಯ ಎನ್ನುತ್ತಾರೆ.\nಕನ್ನಡದ್ದೇ ಆದ ಮೂರು ಮುಖ್ಯ ಸಂಧಿಗಳು:\n೧. ಲೋಪ ಸಂಧಿ (ಸ್ವರ ಸಂಧಿ): ಪೂರ್ವಪದದ ಕೊನೆಯ ಸ್ವರವು ಅರ್ಥ ಕೆಡದಂತೆ ಮಾಯವಾಗುವುದು (ಉದಾ: ಊರು + ಊರು = ಊರೂರು, ಇಲ್ಲಿ \'ಉ\' ಸ್ವರ ಲೋಪವಾಗಿದೆ).\n೨. ಆಗಮ ಸಂಧಿ (ಸ್ವರ ಸಂಧಿ): ಎರಡು ಸ್ವರಗಳ ನಡುವೆ ಅರ್ಥ ಕೆಡದಂತೆ ಹೊಸ ವ್ಯಂಜನ (ಯ್ ಅಥವಾ ವ್) ಬಂದು ಸೇರುವುದು (ಉದಾ: ಮನೆ + ಅನ್ನು = ಮನೆಯನ್ನು, ಮರ + ಅನ್ನು = ಮರವನ್ನು).\n೩. ಆದೇಶ ಸಂಧಿ (ವ್ಯಂಜನ ಸಂಧಿ): ಉತ್ತರಪದದ ಆದಿಯಲ್ಲಿರುವ ಕ, ತ, ಪ ವ್ಯಂಜನಗಳಿಗೆ ಕ್ರಮವಾಗಿ ಗ, ದ, ಬ ವ್ಯಂಜನಗಳು ಆದೇಶವಾಗಿ ಬರುವುದು (ಉದಾ: ಕಣ್ + ಪನಿ = ಕಣ್ಣನಿ, ಬೆಟ್ಟ + ತಾವರೆ = ಬೆಟ್ಟದಾವರೆ).',
      visualModelType: 'formula',
      visualModelHtml: '<div style="background:#1e1e2f;color:#f8fafc;padding:16px;border-radius:12px;border:1px solid #3b82f6;text-align:center;"><div style="font-size:18px;font-weight:800;color:#60a5fa;">ಕನ್ನಡ ಸಂಧಿ ಸೂತ್ರಗಳು</div><div style="display:flex;justify-content:center;gap:12px;margin-top:10px;font-size:13px;"><span style="color:#fcd34d;">ಲೋಪ: ಸ್ವರ + ಸ್ವರ = ಸ್ವರಲೋಪ</span><span style="color:#a7f3d0;">ಆಗಮ: ಯ್ / ವ್ ಆಗಮ</span><span style="color:#93c5fd;">ಆದೇಶ: ಕ,ತ,ಪ ➔ ಗ,ದ,ಬ</span></div></div>',
      offlineActivity: 'ನಿಮ್ಮ ಮನೆಯ ಕನ್ನಡ ಪತ್ರಿಕೆಯಲ್ಲಿ \'ಮನೆಯಲ್ಲಿ\', \'ಹಾಲೊಳು\', ಮತ್ತು \'ಕಾಲಡಿಯೊಳು\' ಪದಗಳನ್ನು ಗುರುತಿಸಿ ಸಂಧಿಯನ್ನು ಬಿಡಿಸಿ ಬರೆಯಿರಿ.',
      guidedSteps: [
        'ಸಂಧಿ ಪದವನ್ನು ಪೂರ್ವಪದ ಮತ್ತು ಉತ್ತರಪದಗಳಾಗಿ ಬಿಡಿಸಿ.',
        'ಸ್ವರ ಕಣ್ಮರೆಯಾಗಿದೆಯೇ (ಲೋಪ), ಹೊಸ ಅಕ್ಷರ ಬಂದಿದೆಯೇ (ಆಗಮ) ಅಥವಾ ಕ,ತ,ಪ ಬದಲಾಗಿದೆಯೇ (ಆದೇಶ) ಗಮನಿಸಿ.',
        'ಸಂಧಿಯ ನಿಯಮವನ್ನು ದೃಢೀಕರಿಸಿ.'
      ],
      questions: [
        {
          id: 'c7-kan-q1',
          prompt: '\'ಮನೆ + ಅನ್ನು = ಮನೆಯನ್ನು\' ಇಲ್ಲಿ ಯಾವ ಸಂಧಿ ಆಗಿದೆ?',
          options: ['ಲೋಪ ಸಂಧಿ', 'ಯ-ಕಾರ ಆಗಮ ಸಂಧಿ (Aagama Sandhi)', 'ಆದೇಶ ಸಂಧಿ', 'ವಿಸರ್ಗ ಸಂಧಿ'],
          correctIndex: 1,
          explanation: 'ಎರಡು ಸ್ವರಗಳ ನಡುವೆ \'ಯ್\' ವ್ಯಂಜನವು ಹೊಸದಾಗಿ ಆಗಮವಾಗಿ ಬಂದಿರುವುದರಿಂದ ಇದು ಯ-ಕಾರ ಆಗಮ ಸಂಧಿ.'
        },
        {
          id: 'c7-kan-q2',
          prompt: 'ಆದೇಶ ಸಂಧಿಯಲ್ಲಿ \'ಕ, ತ, ಪ\' ವ್ಯಂಜನಗಳಿಗೆ ಅನುಕ್ರಮವಾಗಿ ಯಾವ ವ್ಯಂಜನಗಳು ಆದೇಶವಾಗುತ್ತವೆ?',
          options: ['ಗ, ದ, ಬ (Ga, Da, Ba)', 'ಚ, ಜ, ಞ', 'ಯ, ರ, ಲ', 'ಶ, ಷ, ಸ'],
          correctIndex: 0,
          explanation: 'ಆದೇಶ ಸಂಧಿಯ ನಿಯಮದಂತೆ ಕ-ಕಾರಕ್ಕೆ ಗ, ತ-ಕಾರಕ್ಕೆ ದ, ಮತ್ತು ಪ-ಕಾರಕ್ಕೆ ಬ ಬರುತ್ತವೆ.'
        }
      ]
    },
    {
      id: 'c7-hindi-kriya-kaal',
      grade: 7,
      board: 'CBSE',
      subject: 'Hindi',
      chapterNumber: 1,
      chapterTitle: 'क्रिया और काल का स्वरूप',
      lessonTitle: 'सकर्मक-अकर्मक क्रिया एवं समय का चक्र (Verbs and Tenses)',
      objective: 'सकर्मक व अकर्मक क्रिया की पहचान करना और भूत, वर्तमान एवं भविष्यत् काल में रूपांतरण करना।',
      locationContext: 'मेट्रो स्टेशन और रेलवे समय सारिणी',
      storyHook: 'स्टेशन पर उद्घोषणा हुई: "ट्रेन आ रही है। यात्री टिकट खरीद रहे हैं। कल यह ट्रेन समय पर पहुँची थी।" इन तीन छोटे वाक्यों में काम का होना और उसके होने का अलग-अलग समय साफ दिखाई देता है।',
      theWhyExplanation: 'जिस शब्द से किसी कार्य के करने या होने का बोध हो, उसे क्रिया कहते हैं। यदि क्रिया का फल कर्म पर पड़ता है, तो वह सकर्मक क्रिया होती है (जैसे \'रोहन पुस्तक पढ़ता है\'); यदि कर्म नहीं होता तो वह अकर्मक होती है (जैसे \'रोहन हँसता है\')। क्रिया के जिस रूप से उसके होने के समय का पता चले, उसे काल (भूतकाल, वर्तमानकाल, भविष्यत्काल) कहते हैं।',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#fdf2f8;border:2px solid #ec4899;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#9d174d;">काल के तीन मुख्य रूप</div><div style="margin-top:6px;font-size:14px;color:#831843;">भूतकाल (पढ़ा था) • वर्तमानकाल (पढ़ रहा है) • भविष्यत्काल (पढ़ेगा)</div></div>',
      offlineActivity: 'एक क्रिया शब्द (जैसे \'लिखना\') चुनिए और उसके तीनों कालों के वाक्य बनाकर बोलिए।',
      guidedSteps: [
        'क्रिया के साथ \'क्या\' या \'किसे\' प्रश्न पूछें। यदि उत्तर मिले तो सकर्मक, न मिले तो अकर्मक।',
        'क्रिया के अंत में \'था/थी/थे\', \'है/हैं\' या \'गा/गी/गे\' देखकर काल पहचानें।',
        'वाक्य के कर्ता और लिंग के अनुसार क्रिया के रूप का मिलान करें।'
      ],
      questions: [
        {
          id: 'c7-hin-q1',
          prompt: '\'पक्षी आकाश में उड़ते हैं\' वाक्य में \'उड़ते हैं\' कैसी क्रिया है?',
          options: ['अकर्मक क्रिया (Intransitive Verb)', 'सकर्मक क्रिया (Transitive Verb)', 'द्विकर्मक क्रिया', 'प्रेरणार्थक क्रिया'],
          correctIndex: 0,
          explanation: '\'उड़ना\' क्रिया का कोई कर्म नहीं है, पक्षी स्वयं उड़ते हैं, अतः यह अकर्मक क्रिया है।'
        },
        {
          id: 'c7-hin-q2',
          prompt: '\'कल हम सब चिड़ियाघर जाएंगे\' वाक्य किस काल का उदाहरण है?',
          options: ['भविष्यत् काल (Future Tense)', 'भूतकाल (Past Tense)', 'वर्तमान काल (Present Tense)', 'आसन्न भूतकाल'],
          correctIndex: 0,
          explanation: 'कार्य आने वाले समय (\'कल\') में होगा, इसलिए यह भविष्यत् काल है।'
        }
      ]
    }
  ],
  8: [
    {
      id: 'c8-math-linear-equations',
      grade: 8,
      board: 'CBSE',
      subject: 'Mathematics',
      chapterNumber: 1,
      chapterTitle: 'Linear Equations in One Variable',
      lessonTitle: 'The Grocery Balance Scale: Solving Equations by Balance Preservation',
      objective: 'Solve algebraic linear equations by treating the equal sign as a balanced physical scale.',
      locationContext: 'KR Market Vegetable Scales, Bengaluru',
      storyHook: 'A vegetable vendor places a bag of tomatoes and two 500g iron weights on the left side of a balance scale. On the right side, she places one 2kg (2000g) block. The scale balances perfectly. What is the mass of the tomato bag?',
      theWhyExplanation: 'An equation is a mathematical statement that two expressions have equal value: Left Hand Side (LHS) = Right Hand Side (RHS). The equal sign (=) is the balance pivot. If you add, subtract, multiply, or divide something on one side, you MUST do the exact same operation to the other side to preserve equality. Translating the vendor scale: x + 1000 = 2000. Subtract 1000 from both sides: x = 1000 grams (1 kg). Transposing a term across the equal sign changes its operation to the inverse (addition becomes subtraction; multiplication becomes division).',
      visualModelType: 'formula',
      visualModelHtml: '<div style="background:#f1f5f9;border:2px solid #0284c7;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#0369a1;">2x + 5 = 15</div><div style="font-size:15px;color:#0f172a;margin-top:6px;">Step 1: Subtract 5 from both sides → 2x = 10</div><div style="font-size:15px;color:#16a34a;font-weight:700;margin-top:4px;">Step 2: Divide both sides by 2 → x = 5</div></div>',
      offlineActivity: 'Write a riddle for a family member: "I think of a number, double it, and add 6. The answer is 20. What is my number?" Solve it using algebra.',
      guidedSteps: [
        'Isolate the variable term on one side.',
        'Apply inverse operations to constants first (add/subtract).',
        'Divide by the coefficient to find the single variable value.',
        'Verify your root by substituting it back into the original equation.'
      ],
      questions: [
        {
          id: 'c8-q1',
          prompt: 'Solve for x: 3x − 7 = 14',
          options: ['x = 5', 'x = 7', 'x = 21', 'x = 3'],
          correctIndex: 1,
          explanation: 'Add 7 to both sides: 3x = 21. Divide by 3: x = 7. Check: 3(7) − 7 = 21 − 7 = 14.'
        },
        {
          id: 'c8-q2',
          prompt: 'If 4y = 28, what is the value of y?',
          options: ['y = 24', 'y = 7', 'y = 112', 'y = 4'],
          correctIndex: 1,
          explanation: 'Divide both sides by 4: y = 28 / 4 = 7.'
        }
      ]
    },
    {
      id: 'c8-kannada-alankara',
      grade: 8,
      board: 'CBSE',
      subject: 'Kannada',
      chapterNumber: 1,
      chapterTitle: 'ಕಾವ್ಯಾಲಂಕಾರ ಮತ್ತು ಸರ್ವಜ್ಞನ ತ್ರಿಪದಿಗಳು',
      lessonTitle: 'ಉಪಮಾ ಅಲಂಕಾರ: ಉಪಮೇಯ ಮತ್ತು ಉಪಮಾನಗಳ ಸಾಮ್ಯ ಸೌಂದರ್ಯ',
      objective: 'ಸಾಹಿತ್ಯದಲ್ಲಿ ಕಾವ್ಯಕ್ಕೆ ಸೌಂದರ್ಯ ತರುವ ಉಪಮಾ ಅಲಂಕಾರದ ನಾಲ್ಕು ಅಂಗಗಳನ್ನು ಗುರುತಿಸುವುದು.',
      locationContext: 'ಧಾರವಾಡದ ಸಾಹಿತ್ಯ ಪರಿಷತ್',
      storyHook: 'ಸರ್ವಜ್ಞ ಕವಿ ಹೇಳುತ್ತಾನೆ: "ಬೆಲ್ಲವಿದ್ದಲ್ಲಿಗೆ ಇರುವೆಗಳು ಸಾಲಾಗಿ ಬಂದಂತೆ ಸಜ್ಜನರ ಬಳಿ ಜ್ಞಾನಿಗಳು ಸೇರುತ್ತಾರೆ". ಕಾವ್ಯದಲ್ಲಿ ಈ ಸಾಮ್ಯತೆ ಏಕೆ ಅಷ್ಟು ಆಕರ್ಷಕ?',
      theWhyExplanation: 'ಮನುಷ್ಯನಿಗೆ ಒಡವೆಗಳು ಹೇಗೆ ಸೌಂದರ್ಯ ಹೆಚ್ಚಿಸುತ್ತವೆಯೋ, ಹಾಗೆಯೇ ಕಾವ್ಯಕ್ಕೆ ಸೌಂದರ್ಯ ತಂದುಕೊಡುವ ಮಾತುಗಳ ಚಮತ್ಕಾರವೇ ಅಲಂಕಾರ. ಅರ್ಥಾಲಂಕಾರಗಳಲ್ಲಿ ಪ್ರಮುಖವಾದದ್ದು ಉಪಮಾ ಅಲಂಕಾರ (Simile). ಎರಡು ಬೇರೆ ಬೇರೆ ವಸ್ತುಗಳಿಗಿರುವ ಪರಸ್ಪರ ಸಾಮ್ಯವನ್ನು (ಹೋಲಿಕೆಯನ್ನು) ಸ್ವಾರಸ್ಯವಾಗಿ ವರ್ಣಿಸುವುದು.\nಉಪಮಾ ಅಲಂಕಾರದ ೪ ಅಂಗಗಳು:\n೧. ಉಪಮೇಯ: ವರ್ಣಿಸಲ್ಪಡುವ ಮೂಲ ವಸ್ತು (ಉದಾ: ಮುಖ).\n೨. ಉಪಮಾನ: ಹೋಲಿಸಲು ತರುವ ಶ್ರೇಷ್ಠ ವಸ್ತು (ಉದಾ: ಚಂದ್ರ).\n೩. ಉಪಮಾವಾಚಕ: ಹೋಲಿಕೆಯನ್ನು ಸೂಚಿಸುವ ಶಬ್ದ (ಅಂತೆ, ಹಾಗೆ, ವೋಲ್, ತೆರದಿ).\n೪. ಸಮಾನಧರ್ಮ: ಎರಡರಲ್ಲೂ ಇರುವ ಸಮಾನ ಗುಣ (ಕಾಂತಿ, ಸುಂದರತೆ).\nಉದಾಹರಣೆ: "ಆಕೆಯ ಮುಖವು ಚಂದ್ರನಂತೆ ಸುಂದರವಾಗಿದೆ".',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#fef2f2;border:2px solid #ef4444;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#991b1b;">ಉಪಮಾ ಅಲಂಕಾರದ ೪ ಅಂಗಗಳು</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:10px;font-size:13px;font-weight:700;"><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #fecaca;">ಉಪಮೇಯ (ವರ್ಣ್ಯ ವಸ್ತು)</span><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #fecaca;">ಉಪಮಾನ (ಹೋಲಿಸುವ ವಸ್ತು)</span><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #fecaca;">ಉಪಮಾವಾಚಕ (ಅಂತೆ, ಹಾಗೆ)</span><span style="background:#fff;padding:6px;border-radius:6px;border:1px solid #fecaca;">ಸಮಾನಧರ್ಮ (ಗುಣಲಕ್ಷಣ)</span></div></div>',
      offlineActivity: '"ಗಿಳಿಯಂತೆ ಮಾತನಾಡುತ್ತಾಳೆ" ಮತ್ತು "ಹಾಲಿನಂತೆ ಬೆಳ್ಳಗಿದೆ" - ಈ ವಾಕ್ಯಗಳಲ್ಲಿ ಉಪಮೇಯ ಮತ್ತು ಉಪಮಾನಗಳನ್ನು ಗುರುತಿಸಿ ಬರೆಯಿರಿ.',
      guidedSteps: [
        'ಯಾವ ವಸ್ತುವನ್ನು ವರ್ಣಿಸಲಾಗುತ್ತಿದೆ ಎಂದು ಗುರುತಿಸಿ (ಉಪಮೇಯ).',
        'ಯಾವ ವಸ್ತುವಿಗೆ ಹೋಲಿಸಲಾಗಿದೆ ಎಂದು ನೋಡಿ (ಉಪಮಾನ).',
        'ಹೋಲಿಕೆಯ ಶಬ್ದ (ಅಂತೆ) ಮತ್ತು ಸಮಾನ ಗುಣವನ್ನು ವಿಶ್ಲೇಷಿಸಿ.'
      ],
      questions: [
        {
          id: 'c8-kan-q1',
          prompt: '"ಆಕೆಯ ಮುಖವು ಚಂದ್ರನಂತೆ ಸುಂದರವಾಗಿದೆ" - ಇದರಲ್ಲಿ ಉಪಮಾನ ಯಾವುದು?',
          options: ['ಆಕೆ', 'ಮುಖ', 'ಚಂದ್ರ (Chandra)', 'ಸುಂದರ'],
          correctIndex: 2,
          explanation: 'ಮುಖಕ್ಕೆ ಹೋಲಿಸಲು ತಂದ ಶ್ರೇಷ್ಠ ವಸ್ತು \'ಚಂದ್ರ\' ಆಗಿರುವುದರಿಂದ ಇದು ಉಪಮಾನ.'
        },
        {
          id: 'c8-kan-q2',
          prompt: 'ಉಪಮಾ ಅಲಂಕಾರದಲ್ಲಿ ಹೋಲಿಕೆಯನ್ನು ಸೂಚಿಸುವ \'ಅಂತೆ\' ಎಂಬ ಶಬ್ದವನ್ನು ಏನೆಂದು ಕರೆಯುತ್ತಾರೆ?',
          options: ['ಉಪಮೇಯ', 'ಉಪಮಾನ', 'ಉಪಮಾವಾಚಕ (Upamavachaka)', 'ಸಮಾನಧರ್ಮ'],
          correctIndex: 2,
          explanation: '\'ಅಂತೆ\' ಎಂಬುದು ಹೋಲಿಕೆಯನ್ನು ಸೂಚಿಸುವ ಪದವಾದ್ದರಿಂದ ಇದನ್ನು ಉಪಮಾವಾಚಕ ಎನ್ನುತ್ತಾರೆ.'
        }
      ]
    },
    {
      id: 'c8-hindi-sandhi',
      grade: 8,
      board: 'CBSE',
      subject: 'Hindi',
      chapterNumber: 1,
      chapterTitle: 'संधि विचार एवं नियम',
      lessonTitle: 'स्वर संधि के भेद: दीर्घ, गुण, वृद्धि, यण और अयादि',
      objective: 'दो निकटवर्ती वर्णों के मेल से होने वाले विकार (संधि) के नियमों को समझना और संधि-विच्छेद करना।',
      locationContext: 'पुस्तकालय एवं भाषा शोध केंद्र',
      storyHook: 'विद्यार्थी जब \'हिमालय\' शब्द पढ़ता है, तो उसे लगता है यह एक शब्द है। लेकिन यह दो शब्दों का संगम है: हिम (बर्फ) + आलय (घर) = हिमालय। अ + आ मिलकर \'आ\' बन गया!',
      theWhyExplanation: 'दो समीपवर्ती वर्णों के परस्पर मेल से जो ध्वनि-परिवर्तन या विकार उत्पन्न होता है, उसे संधि कहते हैं। संधि के तीन मुख्य प्रकार हैं: स्वर संधि, व्यंजन संधि और विसर्ग संधि। स्वर संधि में दो स्वरों के मिलने से परिवर्तन होता है (जैसे विद्या + अर्थी = विद्यार्थी - दीर्घ संधि; देव + इंद्र = देवेंद्र - गुण संधि)। संधि का ज्ञान भाषा को संक्षिप्त, वैज्ञानिक और सुंदर बनाता है।',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#ecfdf5;border:2px solid #10b981;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#065f46;">दीर्घ संधि का सूत्र</div><div style="margin-top:6px;font-size:14px;color:#064e3b;">अ/आ + अ/आ = आ (हिम + आलय = हिमालय) • इ/ई + इ/ई = ई (रवि + इंद्र = रवींद्र)</div></div>',
      offlineActivity: 'अपनी पाठ्यपुस्तक में से 3 संधि युक्त शब्द ढूंढिए और उनका संधि-विच्छेद कीजिए।',
      guidedSteps: [
        'पहले शब्द की अंतिम ध्वनि और दूसरे शब्द की पहली ध्वनि पहचानें।',
        'जांचें कि दोनों ध्वनियों के मिलने पर कौन सा नया स्वर बन रहा है।',
        'संधि-विच्छेद करते समय दोनों भागों का सार्थक अर्थ होना आवश्यक है।'
      ],
      questions: [
        {
          id: 'c8-hin-q1',
          prompt: '\'सूर्य + उदय\' का सही संधि रूप क्या होगा?',
          options: ['सूर्योदय (Suryodaya)', 'सूर्यादय', 'सूर्योउदय', 'सूर्यउदय'],
          correctIndex: 0,
          explanation: 'अ + उ = ओ (यह गुण स्वर संधि का नियम है: सूर्य + उदय = सूर्योदय)।'
        },
        {
          id: 'c8-hin-q2',
          prompt: '\'कवींद्र\' का सही संधि-विच्छेद क्या है?',
          options: ['कवि + इंद्र (Kavi + Indra)', 'कवी + इन्द्र', 'कव + इन्द्र', 'कवि + ईंद्र'],
          correctIndex: 0,
          explanation: 'कवि (इ) + इंद्र (इ) = कवींद्र (ई) - यह दीर्घ स्वर संधि का उदाहरण है।'
        }
      ]
    }
  ],
  9: [
    {
      id: 'c9-math-real-numbers',
      grade: 9,
      board: 'CBSE',
      subject: 'Mathematics',
      chapterNumber: 1,
      chapterTitle: 'Number Systems & Irrational Numbers',
      lessonTitle: 'The Hypotenuse Paradox: Why √2 Cannot Be Written as a Fraction',
      objective: 'Prove the existence of irrational numbers geometrically using the Pythagorean theorem on the real number line.',
      locationContext: 'Ancient Indian Sulba Sutras & Modern Geometry',
      storyHook: 'Draw a square with sides of exactly 1 cm. What is the length of the diagonal connecting opposite corners? By Pythagoras: 1² + 1² = 2, so the diagonal is √2 cm. But try to express √2 as a simple fraction p/q: 1.41421356... its decimal never terminates and never repeats!',
      theWhyExplanation: 'Rational numbers are numbers that can be expressed as a ratio of two integers p/q (where q ≠ 0). Their decimals either terminate (like 1/4 = 0.25) or repeat infinitely in a periodic pattern (like 1/3 = 0.333...). An Irrational number has a non-terminating, non-repeating decimal expansion. By constructing a right triangle with legs of length 1 unit on the number line, the hypotenuse is exactly √2. Using a compass arc, we can transfer that physical geometric length onto the number line, proving real numbers form a continuous unbroken continuum.',
      visualModelType: 'formula',
      visualModelHtml: '<div style="background:#1e293b;color:#f1f5f9;padding:18px;border-radius:12px;text-align:center;"><div style="font-size:20px;font-weight:700;color:#facc15;">Hypotenuse² = 1² + 1² = 2 ⟹ Hypotenuse = √2</div><div style="font-size:13px;color:#94a3b8;margin-top:6px;">√2 ≈ 1.41421356... (Non-terminating, non-repeating)</div></div>',
      offlineActivity: 'Use graph paper and a ruler to draw a right triangle with base 1 cm and height 1 cm. Measure the diagonal with a millimeter ruler to verify it is slightly over 1.4 cm.',
      guidedSteps: [
        'Recall Pythagoras theorem: a² + b² = c².',
        'Construct base of 1 unit and perpendicular height of 1 unit.',
        'Use a compass anchored at 0 to swing an arc to the horizontal number line.',
        'Confirm the landing point is between 1.4 and 1.5.'
      ],
      questions: [
        {
          id: 'c9-q1',
          prompt: 'Which of the following numbers is irrational?',
          options: ['0.25 (terminating)', '0.333... (repeating)', '√4 (= 2)', '√5 (non-terminating, non-repeating)'],
          correctIndex: 3,
          explanation: '√5 is not a perfect square. Its decimal expansion is non-terminating and non-repeating, making it irrational.'
        },
        {
          id: 'c9-q2',
          prompt: 'What happens to the decimal expansion of every rational number?',
          options: ['It must terminate immediately', 'It either terminates or repeats periodically', 'It never terminates and never repeats', 'It always ends in zeros'],
          correctIndex: 1,
          explanation: 'Every rational number p/q has a decimal that either terminates or enters an infinitely repeating cycle of digits.'
        }
      ]
    },
    {
      id: 'c9-kannada-chhandassu',
      grade: 9,
      board: 'CBSE',
      subject: 'Kannada',
      chapterNumber: 1,
      chapterTitle: 'ಛಂದಸ್ಸು ಮತ್ತು ಭಾಮಿನಿ ಷಟ್ಪದಿ',
      lessonTitle: 'ಛಂದಸ್ಸಿನ ರಹಸ್ಯ: ಲಘು-ಗುರು ಪ್ರಸ್ತಾರ ಮತ್ತು ಭಾಮಿನಿ ಷಟ್ಪದಿ',
      objective: 'ಮಾತ್ರಾಗಣಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ, ಲಘು (U) ಮತ್ತು ಗುರು (-) ಗುರುತಿಸಿ, ಭಾಮಿನಿ ಷಟ್ಪದಿಯ ಸೂತ್ರವನ್ನು ಗ್ರಹಿಸುವುದು.',
      locationContext: 'ಕುಮಾರವ್ಯಾಸ ಕಾವ್ಯ ವೇದಿಕೆ, ಗದಗ',
      storyHook: 'ಕುಮಾರವ್ಯಾಸ ಭಾರತವನ್ನು ವಾಚನ ಮಾಡುವಾಗ ಹಾರ್ಮೋನಿಯಂ ನಾದದಂತೆ ಪದ್ಯ ಲಯಬದ್ಧವಾಗಿ ಸಾಗುತ್ತದೆ. ಆ ಲಯದ ಗಣಿತದ ಸೂತ್ರವೇನು?',
      theWhyExplanation: 'ಪದ್ಯ ರಚನೆಯ ನಿಯಮಗಳನ್ನು ತಿಳಿಸುವ ಶಾಸ್ತ್ರಕ್ಕೆ ಛಂದಸ್ಸು ಎನ್ನುತ್ತಾರೆ.\nಮಾತ್ರೆ ಎಂದರೆ ಒಂದು ಅಕ್ಷರವನ್ನು ಉಚ್ಚರಿಸಲು ಬೇಕಾಗುವ ಕಾಲ.\n- ಹ್ರಸ್ವ ಸ್ವರಗಳಿಗೆ ೧ ಮಾತ್ರೆ = ಲಘು (ಚಿಹ್ನೆ: U).\n- ದೀರ್ಘ ಸ್ವರ, ಸಂಯುಕ್ತಾಕ್ಷರದ ಹಿಂದಿನ ಅಕ್ಷರ, ಅನುಸ್ವಾರ-ವಿಸರ್ಗ ಯುಕ್ತ ಅಕ್ಷರಗಳಿಗೆ ೨ ಮಾತ್ರೆ = ಗುರು (ಚಿಹ್ನೆ: -).\nಭಾಮಿನಿ ಷಟ್ಪದಿಯು ಆರು ಸಾಲುಗಳ (ಪಾದಗಳ) ಪದ್ಯ:\n- ೧, ೨, ೪, ೫ ನೆಯ ಪಾದಗಳಲ್ಲಿ ತಲಾ ೩ ಮತ್ತು ೪ ಮಾತ್ರೆಗಳ ೨ ಗಣಗಳಿರುತ್ತವೆ (ಒಟ್ಟು ೧೪ ಮಾತ್ರೆಗಳು: ೩+೪+೩+೪).\n- ೩ ಮತ್ತು ೬ ನೆಯ ಪಾದಗಳಲ್ಲಿ ೩ ಮತ್ತು ೪ ಮಾತ್ರೆಗಳ ೩ ಗಣಗಳಿದ್ದು ಕೊನೆಯಲ್ಲಿ ಒಂದು ಗುರು ಬರುತ್ತದೆ (ಒಟ್ಟು ೨೩ ಮಾತ್ರೆಗಳು: ೩+೪+೩+೪+೩+೪ + ಗುರು).',
      visualModelType: 'formula',
      visualModelHtml: '<div style="background:#0f172a;color:#f8fafc;padding:16px;border-radius:12px;border:1px solid #3b82f6;text-align:center;"><div style="font-size:18px;font-weight:800;color:#38bdf8;">ಭಾಮಿನಿ ಷಟ್ಪದಿಯ ಮಾತ್ರಾ ಸೂತ್ರ</div><div style="font-size:14px;color:#93c5fd;margin-top:8px;">ಪಾದ ೧, ೨, ೪, ೫: [೩ + ೪] [೩ + ೪] = ೧೪ ಮಾತ್ರೆಗಳು</div><div style="font-size:14px;color:#4ade80;margin-top:4px;">ಪಾದ ೩, ೬: [೩ + ೪] [೩ + ೪] [೩ + ೪] + ಗುರು = ೨೩ ಮಾತ್ರೆಗಳು</div></div>',
      offlineActivity: 'ನಿಮ್ಮ ಹೆಸರಿಗೆ ಪ್ರಸ್ತಾರ ಹಾಕಿ ಲಘು-ಗುರುಗಳನ್ನು ಗುರುತಿಸಿ (ಉದಾ: ರಾಗ: ಗುರು-ಗುರು [- -], ವಿನಯ: ಲಘು-ಲಘು-ಲಘು [U U U]).',
      guidedSteps: [
        'ಹ್ರಸ್ವ ಸ್ವರಗಳಿಗೆ ಲಘು (U) ಮತ್ತು ದೀರ್ಘ ಸ್ವರಗಳಿಗೆ ಗುರು (-) ಗುರುತಿಸಿ.',
        'ಒತ್ತಕ್ಷರದ ಹಿಂದಿನ ಅಕ್ಷರ ಗುರುವಾಗಿ ಬದಲಾಗುವುದನ್ನು ಗಮನಿಸಿ.',
        '೩ ಮತ್ತು ೪ ಮಾತ್ರೆಗಳ ಗಣಗಳಾಗಿ ವಿಭಾಗಿಸಿ ಲೆಕ್ಕ ಹಾಕಿ.'
      ],
      questions: [
        {
          id: 'c9-kan-q1',
          prompt: 'ಒಂದು ದೀರ್ಘ ಸ್ವರಕ್ಕೆ (ಉದಾ: \'ಆ\', \'ಈ\') ಎಷ್ಟು ಮಾತ್ರೆಗಳ ಮೌಲ್ಯವಿದೆ?',
          options: ['೧ ಮಾತ್ರೆ (ಲಘು)', '೨ ಮಾತ್ರೆಗಳು (ಗುರು - 2 Matras)', '೩ ಮಾತ್ರೆಗಳು', '೪ ಮಾತ್ರೆಗಳು'],
          correctIndex: 1,
          explanation: 'ದೀರ್ಘ ಸ್ವರಗಳು ಉಚ್ಚಾರಣೆಗೆ ಎರಡು ಮಾತ್ರೆಗಳ ಕಾಲ ತೆಗೆದುಕೊಳ್ಳುವುದರಿಂದ ಅವು ಗುರು (-) ಆಗುತ್ತವೆ.'
        },
        {
          id: 'c9-kan-q2',
          prompt: 'ಭಾಮಿನಿ ಷಟ್ಪದಿಯ ಪ್ರತಿ ಪಾದದಲ್ಲಿ ಬರುವ ಮಾತ್ರಾಗಣಗಳ ಜೋಡಿ ಯಾವುದು?',
          options: ['೩ ಮತ್ತು ೪ ಮಾತ್ರೆಗಳು (3 & 4 Matras)', '೫ ಮತ್ತು ೫', '೪ ಮತ್ತು ೪', '೨ ಮತ್ತು ೩'],
          correctIndex: 0,
          explanation: 'ಭಾಮಿನಿ ಷಟ್ಪದಿಯು ೩ ಮತ್ತು ೪ ಮಾತ್ರೆಗಳ ಗಣಗಳಿಂದ ರಚಿತವಾಗಿರುತ್ತದೆ.'
        }
      ]
    },
    {
      id: 'c9-hindi-upsarg-pratyay',
      grade: 9,
      board: 'CBSE',
      subject: 'Hindi',
      chapterNumber: 1,
      chapterTitle: 'शब्द निर्माण: उपसर्ग और प्रत्यय',
      lessonTitle: 'मूल शब्द और शब्दांश: भाषा की रचनात्मक शक्ति',
      objective: 'उपसर्ग और प्रत्यय जोड़कर नए शब्द बनाना और उनके अर्थ परिवर्तन का विश्लेषण करना।',
      locationContext: 'साहित्यिक कार्यशाला, वाराणसी',
      storyHook: 'एक ही मूल शब्द \'मान\' है। इसके आगे \'अप-\' जोड़ा तो बना \'अपमान\' (बुरा अर्थ)। इसके आगे \'सम्-\' जोड़ा तो बना \'सम्मान\' (आदर का अर्थ)। इसके पीछे \'-इत\' जोड़ा तो बना \'मानित\'। एक ही शब्द ने कैसे अपना रंग-रूप बदल लिया!',
      theWhyExplanation: 'वे शब्दांश जो किसी मूल शब्द के पहले जुड़कर उसके अर्थ में विशेषता या परिवर्तन लाते हैं, उन्हें उपसर्ग (Prefix) कहते हैं (जैसे प्र + हार = प्रहार, वि + हार = विहार)। वे शब्दांश जो शब्द के अंत में जुड़कर नया शब्द बनाते हैं, उन्हें प्रत्यय (Suffix) कहते हैं (जैसे मानव + ता = मानवता, मीठा + आस = मिठास)। उपसर्ग और प्रत्यय स्वयं स्वतंत्र शब्द नहीं होते, लेकिन भाषा के शब्द-भंडार को असीम विस्तार देते हैं।',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#fef2f2;border:2px solid #f87171;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#991b1b;">शब्द निर्माण संरचना</div><div style="margin-top:6px;font-size:14px;color:#7f1d1d;">उपसर्ग + मूल शब्द ➔ \'अनु\' + \'शासन\' = अनुशासन • मूल शब्द + प्रत्यय ➔ \'भारत\' + \'ईय\' = भारतीय</div></div>',
      offlineActivity: '\'धर्म\', \'ज्ञान\' और \'सत्य\' शब्दों में विभिन्न उपसर्ग लगाकर नए शब्द बनाइए।',
      guidedSteps: [
        'पहले मूल शब्द को अलग करें जिसका अपना स्वतंत्र अर्थ हो।',
        'यदि आगे जुड़ा शब्दांश है तो उपसर्ग, यदि पीछे जुड़ा है तो प्रत्यय पहचानें।',
        'नए शब्द के बदले हुए अर्थ पर विचार करें।'
      ],
      questions: [
        {
          id: 'c9-hin-q1',
          prompt: '\'अभिमान\' शब्द में कौन सा उपसर्ग लगा है?',
          options: ['अभि (Abhi)', 'अ', 'मान', 'अभ'],
          correctIndex: 0,
          explanation: '\'अभि\' उपसर्ग है और \'मान\' मूल शब्द है: अभि + मान = अभिमान।'
        },
        {
          id: 'c9-hin-q2',
          prompt: '\'सफलता\' शब्द में प्रत्यय क्या है?',
          options: ['ता (Taa)', 'स', 'फल', 'सफल'],
          correctIndex: 0,
          explanation: '\'सफल\' मूल शब्द के अंत में \'ता\' प्रत्यय जुड़कर भाववाचक संज्ञा \'सफलता\' बना है।'
        }
      ]
    }
  ],
  10: [
    {
      id: 'c10-math-quadratic-factorisation',
      grade: 10,
      board: 'CBSE',
      subject: 'Mathematics',
      chapterNumber: 1,
      chapterTitle: 'Quadratic Equations & Roots',
      lessonTitle: 'Solving Quadratic Equations by Factorisation: x² − 5x + 6 = 0',
      objective: 'Identify roots of a second-degree polynomial equation systematically by splitting the middle term and verifying solutions.',
      locationContext: 'CBSE Class 10 Board Standards, New Delhi / Bengaluru',
      storyHook: 'A rectangular community garden in Koramangala has an area equation: x² − 5x + 6 = 0, where x represents the boundary adjustment. Can two different numbers both make this exact equation balance to zero?',
      theWhyExplanation: 'A quadratic equation has the general form ax² + bx + c = 0 (where a ≠ 0). The Fundamental Theorem of Algebra proves a degree-2 equation has exactly two roots (which can be real, repeated, or complex). To solve by factorisation, find two numbers whose product equals (a × c = +6) and whose sum equals the middle coefficient (b = −5). Those two numbers are −2 and −3 because (−2) × (−3) = +6 and (−2) + (−3) = −5. We rewrite the equation as (x − 2)(x − 3) = 0. By the Zero Product Rule, if A × B = 0, then either A = 0 or B = 0. Hence, x = 2 or x = 3.',
      visualModelType: 'formula',
      visualModelHtml: '<div style="background:#090d16;color:#f8fafc;padding:20px;border-radius:12px;border:1px solid #1e293b;text-align:center;"><div style="font-size:22px;font-weight:800;color:#60a5fa;">x² − 5x + 6 = 0</div><div style="font-size:16px;color:#38bdf8;margin:8px 0;">(x − 2)(x − 3) = 0</div><div style="font-size:17px;font-weight:700;color:#4ade80;">Roots: x = 2 and x = 3</div></div>',
      offlineActivity: 'Verify both roots on paper by substituting x = 2: (2)² − 5(2) + 6 = 4 − 10 + 6 = 0. Then substitute x = 3: (3)² − 5(3) + 6 = 9 − 15 + 6 = 0.',
      guidedSteps: [
        'Write the quadratic in standard form: ax² + bx + c = 0.',
        'Calculate the product a × c and note coefficient b.',
        'Find a factor pair p and q such that p × q = ac and p + q = b.',
        'Split the middle term, factor by grouping, and apply Zero Product Rule.'
      ],
      questions: [
        {
          id: 'c10-q1',
          prompt: 'What are the roots of the quadratic equation x² − 7x + 12 = 0?',
          options: ['x = 1 and x = 12', 'x = 3 and x = 4', 'x = −3 and x = −4', 'x = 2 and x = 6'],
          correctIndex: 1,
          explanation: '(−3) × (−4) = +12 and (−3) + (−4) = −7. Factorised: (x − 3)(x − 4) = 0, giving roots x = 3 and x = 4.'
        },
        {
          id: 'c10-q2',
          prompt: 'If the discriminant D = b² − 4ac is greater than zero (D > 0), what does it tell you about the roots?',
          options: ['The roots are real and distinct', 'The roots are imaginary', 'There is only one root', 'The equation cannot be solved'],
          correctIndex: 0,
          explanation: 'When D > 0, the quadratic formula yields two distinct real solutions.'
        }
      ]
    },
    {
      id: 'c10-sci-electricity-ohm',
      grade: 10,
      board: 'CBSE',
      subject: 'Science',
      chapterNumber: 2,
      chapterTitle: 'Electricity & Ohm\'s Law',
      lessonTitle: 'The Electric Highway: Potential Difference, Current & Resistance (V = IR)',
      objective: 'State Ohm\'s law, understand the physical meaning of resistance, and calculate current in series and parallel circuit configurations.',
      locationContext: 'Electric Vehicle Charging Station, Electronic City, Bengaluru',
      storyHook: 'An electric scooter plugs into a 240V charging dock. Current flows into the lithium battery pack. If the charging circuit has an effective resistance of 24 Ohms (Ω), how many Amperes of current flow through the cable?',
      theWhyExplanation: 'Electric current (I, in Amperes) is the rate of flow of electric charge: I = Q/t. Potential Difference (V, in Volts) is the electrical pressure or work done to move unit charge between two points: V = W/Q. Georg Simon Ohm discovered that for a metallic conductor at constant temperature, the current flowing through it is directly proportional to the potential difference across its terminals: V ∝ I, or V = I × R. Resistance (R, in Ohms Ω) is the property of a conductor to oppose the flow of charges. For the EV charger: I = V / R = 240 / 24 = 10 Amperes.',
      visualModelType: 'circuit',
      visualModelHtml: '<div style="background:#0b1329;color:#f8fafc;padding:20px;border-radius:12px;border:1px solid #1e3a8a;text-align:center;"><div style="font-size:26px;font-weight:800;color:#fbbf24;">V = I × R</div><div style="display:flex;justify-content:center;gap:20px;margin-top:10px;font-size:14px;"><span style="color:#60a5fa;">I = V / R</span><span style="color:#34d399;">R = V / I</span></div></div>',
      offlineActivity: 'Check the label on your phone charger at home. Look for Output: e.g. 5V, 2A. Calculate the effective resistance of the charging phone using R = V / I = 5 / 2 = 2.5 Ω.',
      guidedSteps: [
        'Write down the given quantities: Voltage V, Current I, Resistance R.',
        'Confirm all values are in standard SI units (Volts, Amperes, Ohms).',
        'Rearrange V = IR to solve for the unknown parameter.',
        'Calculate and include proper units in your answer.'
      ],
      questions: [
        {
          id: 'c10-sci-q1',
          prompt: 'What is the current flowing through a 4 Ω resistor when a potential difference of 12 V is applied?',
          options: ['48 A', '3 A', '8 A', '0.33 A'],
          correctIndex: 1,
          explanation: 'By Ohm\'s law: I = V / R = 12 / 4 = 3 Amperes.'
        },
        {
          id: 'c10-sci-q2',
          prompt: 'If the resistance of a circuit is doubled while the voltage remains constant, what happens to the current?',
          options: ['The current doubles', 'The current is halved', 'The current stays identical', 'The current quadruples'],
          correctIndex: 1,
          explanation: 'Current is inversely proportional to resistance (I = V/R). Doubling R halves the current.'
        }
      ]
    },
    {
      id: 'c10-kannada-gadegalu',
      grade: 10,
      board: 'CBSE',
      subject: 'Kannada',
      chapterNumber: 1,
      chapterTitle: 'ಗಾದೆ ಮಾತುಗಳು ಮತ್ತು ಕರ್ತರಿ-ಕರ್ಮಣಿ ಪ್ರಯೋಗ',
      lessonTitle: 'ಗಾದೆ ವಿಸ್ತರಣೆ ಮತ್ತು ಕರ್ತರಿ-ಕರ್ಮಣಿ ವಾಕ್ಯ ರಚನೆ (Kannada Syntax & Proverbs)',
      objective: 'ಕರ್ತರಿ (Active) ಮತ್ತು ಕರ್ಮಣಿ (Passive) ಪ್ರಯೋಗಗಳ ನಿಯಮಗಳನ್ನು ಅರಿತು, ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗೆ ಗಾದೆ ವಿಸ್ತರಣೆಯ ತಂತ್ರ ಕಲಿಯುವುದು.',
      locationContext: 'ಹಂಪಿ ವಿರೂಪಾಕ್ಷ ಮಂದಿರ ಮತ್ತು ಕನ್ನಡ ವಿಶ್ವವಿದ್ಯಾಲಯ',
      storyHook: '"ವೇದ ಸುಳ್ಳಾದರೂ ಗಾದೆ ಸುಳ್ಳಾಗದು" ಎಂಬ ಹಿರಿಯರ ನಾಣ್ಣುಡಿ ಇದೆ. "ಕುಂಬಾರನಿಗೆ ವರುಷ, ದೊಣ್ಣೆಗೆ ನಿಮಿಷ" - ಈ ಪುಟ್ಟ ಗಾದೆಯಲ್ಲಿ ಮಾನವ ಸಮಾಜದ ಯಾವ ಗಹನವಾದ ಸತ್ಯ ಅಡಗಿದೆ?',
      theWhyExplanation: 'ಗಾದೆಗಳು ಪೂರ್ವಿಕರ ಅಪಾರ ಜೀವಿತಾನುಭವದ ಹಿಂಡಿದ ರಸ. ಪರೀಕ್ಷೆಯಲ್ಲಿ ಗಾದೆ ವಿಸ್ತರಿಸುವಾಗ: ಪೀಠಿಕೆ (ಗಾದೆಯ ಹಿನ್ನೆಲೆ), ಅರ್ಥ ವಿವರಣೆ (ಅಂತರಾರ್ಥ), ಮತ್ತು ಸಮಾರೋಪ (ಜೀವನಕ್ಕೆ ಅನ್ವಯ) ಎಂಬ ಮೂರು ಹಂತಗಳಲ್ಲಿ ಬರೆಯಬೇಕು.\nಇನ್ನೊಂದು ಪ್ರಮುಖ ವ್ಯಾಕರಣ ಭಾಗವೆಂದರೆ ಕರ್ತರಿ-ಕರ್ಮಣಿ ಪ್ರಯೋಗ:\n- ಕರ್ತರಿ ಪ್ರಯೋಗ (Active Voice): ವಾಕ್ಯದಲ್ಲಿ ಕರ್ತೃವಿಗೆ ಪ್ರಾಧಾನ್ಯತೆ (ಉದಾ: ರನ್ನನು ಗದಾಯುದ್ಧವನ್ನು ಬರೆದನು).\n- ಕರ್ಮಣಿ ಪ್ರಯೋಗ (Passive Voice): ವಾಕ್ಯದಲ್ಲಿ ಕರ್ಮಪದಕ್ಕೆ ಪ್ರಾಧಾನ್ಯತೆ. ಧಾತುವಿಗೆ \'ಅಲ್ಪಡಿಸು\' ಅಥವಾ \'ಪಡು\' ಪ್ರತ್ಯಯ ಸೇರುತ್ತದೆ (ಉದಾ: ರನ್ನನಿಂದ ಗದಾಯುದ್ಧವು ಬರೆಯಲ್ಪಟ್ಟಿತು).',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#fefce8;border:2px solid #ca8a04;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#854d0e;">ಕರ್ತರಿ ➔ ಕರ್ಮಣಿ ಪ್ರಯೋಗ ಪರಿವರ್ತನೆ</div><div style="display:flex;justify-content:center;gap:16px;margin-top:10px;font-size:14px;font-weight:700;"><span style="color:#0f172a;">ಕರ್ತರಿ: ವಾಲ್ಮೀಕಿ ರಾಮಾಯಣವನ್ನು ಬರೆದನು</span><span style="color:#15803d;">ಕರ್ಮಣಿ: ವಾಲ್ಮೀಕಿಯಿಂದ ರಾಮಾಯಣವು ಬರೆಯಲ್ಪಟ್ಟಿತು</span></div></div>',
      offlineActivity: '"ಕೈ ಕೆಸರಾದರೆ ಬಾಯಿ ಮೊಸರು" ಗಾದೆಯ ಅರ್ಥವನ್ನು ೫ ವಾಕ್ಯಗಳಲ್ಲಿ ನಿಮ್ಮ ಸ್ವಂತ ಮಾತುಗಳಲ್ಲಿ ಬರೆಯಿರಿ.',
      guidedSteps: [
        'ಗಾದೆಯ ವಾಚ್ಯಾರ್ಥ ಮತ್ತು ಅಂತರಾರ್ಥವನ್ನು ಗುರುತಿಸಿ.',
        'ಕರ್ತರಿ ವಾಕ್ಯದಲ್ಲಿರುವ ಕರ್ತೃವಿಗೆ ತೃತೀಯಾ ವಿಭಕ್ತಿ (ಇಂದ) ಸೇರಿಸಿ.',
        'ಕ್ರಿಯಾಪದದ ಧಾತುವಿಗೆ \'ಅಲ್ಪಡು\' ಸೇರಿಸಿ ಕರ್ಮಣಿ ರೂಪಕ್ಕೆ ಪರಿವರ್ತಿಸಿ.'
      ],
      questions: [
        {
          id: 'c10-kan-q1',
          prompt: '"ವಾಲ್ಮೀಕಿಯು ರಾಮಾಯಣವನ್ನು ರಚಿಸಿದನು" - ಇದನ್ನು ಕರ್ಮಣಿ ಪ್ರಯೋಗಕ್ಕೆ ಪರಿವರ್ತಿಸಿದಾಗ ಸರಿಯಾದ ರೂಪ ಯಾವುದು?',
          options: ['ವಾಲ್ಮೀಕಿಯಿಂದ ರಾಮಾಯಣವು ರಚಿಸಲ್ಪಟ್ಟಿತು (Rachisalpattitu)', 'ವಾಲ್ಮೀಕಿ ರಾಮಾಯಣ ಓದಿದನು', 'ರಾಮಾಯಣ ವಾಲ್ಮೀಕಿ ರಚನೆ', 'ವಾಲ್ಮೀಕಿಗೆ ರಾಮಾಯಣ ಇಷ್ಟ'],
          correctIndex: 0,
          explanation: 'ಕರ್ತೃ \'ವಾಲ್ಮೀಕಿ\'ಗೆ \'ಇಂದ\' ಪ್ರತ್ಯಯ ಸೇರಿ ಧಾತುವಿಗೆ \'ಅಲ್ಪಡು\' ಸೇರಿದಾಗ \'ವಾಲ್ಮೀಕಿಯಿಂದ ರಾಮಾಯಣವು ರಚಿಸಲ್ಪಟ್ಟಿತು\' ಎಂದಾಗುತ್ತದೆ.'
        },
        {
          id: 'c10-kan-q2',
          prompt: 'ಗಾದೆ ವಿಸ್ತರಣೆಯಲ್ಲಿ ಮುಖ್ಯವಾಗಿ ಇರಬೇಕಾದ ಮೂರು ಅಂಗಗಳು ಯಾವುವು?',
          options: ['ಪೀಠಿಕೆ, ಅರ್ಥ ವಿವರಣೆ, ಉಪಸಂಹಾರ (Intro, Meaning, Conclusion)', 'ಹಾಡು, ಕಥೆ, ನೃತ್ಯ', 'ಪ್ರಶ್ನೆ, ಉತ್ತರ, ಅಂಕ', 'ಕರ್ತೃ, ಕರ್ಮ, ಕ್ರಿಯೆ'],
          correctIndex: 0,
          explanation: 'ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ ಮೌಲ್ಯಮಾಪನ ಮಾನದಂಡದಂತೆ ಗಾದೆ ವಿಸ್ತರಣೆಯಲ್ಲಿ ಪೀಠಿಕೆ, ವಿವರಣೆ ಮತ್ತು ಉಪಸಂಹಾರ ಇರಬೇಕು.'
        }
      ]
    },
    {
      id: 'c10-hindi-padbandh-samasa',
      grade: 10,
      board: 'CBSE',
      subject: 'Hindi',
      chapterNumber: 1,
      chapterTitle: 'पदबंध एवं समास (CBSE Course A & B Grammar)',
      lessonTitle: 'व्याकरणिक पदबंध के भेद और सामासिक पद रचना',
      objective: 'बोर्ड परीक्षा प्रारूप के अनुसार संज्ञा, विशेषण, सर्वनाम, क्रिया और क्रियाविशेषण पदबंध की अचूक पहचान करना।',
      locationContext: 'बोर्ड परीक्षा तैयारी कार्यशाला',
      storyHook: 'वाक्य में अकेला शब्द \'पद\' कहलाता है। लेकिन जब कई पद मिलकर एक ही व्याकरणिक इकाई का कार्य करते हैं, तो वह \'पदबंध\' बन जाता है। जैसे: \'दशरथ सुत राम\' - यहाँ तीन शब्द मिलकर एक संज्ञा का काम कर रहे हैं!',
      theWhyExplanation: 'पदबंध (Phrasal Unit) कई पदों का ऐसा समूह है जो बंधकर एक ही व्याकरणिक इकाई (संज्ञा, सर्वनाम, विशेषण, क्रिया या क्रियाविशेषण) का कार्य करता है। इसका अंतिम या मुख्य पद \'शीर्ष पद\' कहलाता है। यदि शीर्ष पद संज्ञा है, तो वह संज्ञा पदबंध होगा (उदा: \'भारत के प्रधानमंत्री\')। यदि शीर्ष पद विशेषण है, तो वह विशेषण पदबंध होगा (उदा: \'बहुत तेज दौड़ने वाला\')। सीबीएसई बोर्ड परीक्षा में पदबंध पहचान पर सीधे 4 अंक के प्रश्न पूछे जाते हैं।',
      visualModelType: 'table',
      visualModelHtml: '<div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:16px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#1e40af;">पदबंध के 5 मुख्य भेद (CBSE Board)</div><div style="margin-top:6px;font-size:14px;color:#1e3a8a;">संज्ञा पदबंध • सर्वनाम पदबंध • विशेषण पदबंध • क्रिया पदबंध • क्रियाविशेषण पदबंध</div></div>',
      offlineActivity: 'समाचार पत्र के पहले पृष्ठ से 2 संज्ञा पदबंध और 2 विशेषण पदबंध रेखांकित कीजिए।',
      guidedSteps: [
        'रेखांकित अंश का अंतिम (शीर्ष) पद देखें।',
        'जांचें कि पूरा पद समूह किस व्याकरणिक कोटि का कार्य कर रहा है।',
        'यदि रेखांकित अंश संज्ञा पर समाप्त हो तो संज्ञा पदबंध, विशेषण पर हो तो विशेषण पदबंध चुनें।'
      ],
      questions: [
        {
          id: 'c10-hin-q1',
          prompt: '\'सदा सच बोलने वाले आप\' आज मौन क्यों हैं? रेखांकित पदबंध का भेद बताइए:',
          options: ['सर्वनाम पदबंध (Pronoun Phrase)', 'संज्ञा पदबंध', 'विशेषण पदबंध', 'क्रिया पदबंध'],
          correctIndex: 0,
          explanation: 'पद समूह का अंतिम और मुख्य पद \'आप\' एक सर्वनाम है, अतः यह सर्वनाम पदबंध है।'
        },
        {
          id: 'c10-hin-q2',
          prompt: '\'बरगद की घनी छांव में बैठा बालक\' में रेखांकित \'घनी छांव में बैठा\' कौन सा पदबंध है?',
          options: ['विशेषण पदबंध (Adjective Phrase)', 'संज्ञा पदबंध', 'क्रियाविशेषण पदबंध', 'क्रिया पदबंध'],
          correctIndex: 0,
          explanation: 'यह पद समूह \'बालक\' (संज्ञा) की विशेषता बता रहा है, अतः यह विशेषण पदबंध है।'
        }
      ]
    }
  ]
};

export const OneUniversalGradeExplorer: React.FC<{
  grade: number;
  board: string;
  initialSubjectName?: string;
  onBack: () => void;
}> = ({ grade, board, initialSubjectName, onBack }) => {
  const lessons = UNIVERSAL_LESSONS[grade] || UNIVERSAL_LESSONS[10] || [];
  const subjects = Array.from(new Set(lessons.map((l) => l.subject)));
  const defaultSubject = initialSubjectName && subjects.includes(initialSubjectName)
    ? initialSubjectName
    : subjects[0] || 'Mathematics';

  const [activeSubject, setActiveSubject] = useState<string>(defaultSubject);
  const [selectedLesson, setSelectedLesson] = useState<ConceptLesson | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (initialSubjectName && subjects.includes(initialSubjectName)) {
      setActiveSubject(initialSubjectName);
    }
  }, [initialSubjectName, subjects]);

  const filteredLessons = lessons.filter((l) => l.subject === activeSubject);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitCheck = () => {
    if (!selectedLesson) return;
    setSubmitted(true);
    // Track concept mastery
    recordConceptUnderstood(selectedLesson.id);

    // Confetti celebration
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleSpeechToggle = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else if (selectedLesson) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedLesson.theWhyExplanation);
      utterance.rate = 0.9;
      utterance.lang = selectedLesson.subject === 'Kannada' ? 'kn-IN' : selectedLesson.subject === 'Hindi' ? 'hi-IN' : 'en-IN';
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section className="vg1" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <header className="vg1-header">
        <div>
          <span className="vg1-eyebrow">
            <Sparkles size={16} /> VAYENTRA ONE · CONCEPT CLASSES
          </span>
          <h2>
            Class {grade}. <em>Learn the why.</em>
          </h2>
          <p>
            Explore verified concept classes based on your board lessons. Move beyond rote memorization with step-by-step intuition and everyday examples.
          </p>
        </div>
        <div className="vg1-grade-stamp">
          <GraduationCap size={27} />
          <strong>{String(grade).padStart(2, '0')}</strong>
          <small>CLASS {grade}</small>
        </div>
      </header>

      {/* Meta Bar */}
      <div className="vg1-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#15803d" />
          <span>{board === 'STATE' ? 'Karnataka State Board' : 'CBSE Aligned'} · 2026-27 Academic Curriculum</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700 }}>
          <CheckCircle2 size={16} /> Approved Concept Classes Active
        </div>
      </div>

      {selectedLesson ? (
        /* ACTIVE CONCEPT LESSON VIEW */
        <article className="vg1-lesson" style={{ marginTop: '20px' }}>
          <button
            type="button"
            className="vg1-minibutton"
            onClick={() => {
              if (speaking && typeof window !== 'undefined') window.speechSynthesis.cancel();
              setSpeaking(false);
              setSelectedLesson(null);
              setAnswers({});
              setSubmitted(false);
            }}
          >
            <ArrowLeft size={16} /> Back to Class {grade} Subjects
          </button>

          <div className="vg1-lesson-title">
            <span>
              {selectedLesson.subject} · Chapter {selectedLesson.chapterNumber}: {selectedLesson.chapterTitle}
            </span>
            <h3>{selectedLesson.lessonTitle}</h3>
            <p>
              <Target size={18} />
              {selectedLesson.objective}
            </p>
          </div>

          {/* Real-World Everyday Context Hook */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
              border: '1.5px solid #86efac',
              borderRadius: '12px',
              padding: '18px 20px',
              margin: '16px 0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em' }}>
              <Compass size={18} /> REAL-WORLD CONTEXT · {selectedLesson.locationContext.toUpperCase()}
            </div>
            <p style={{ marginTop: '8px', fontSize: '15px', lineHeight: 1.6, color: '#1e293b' }}>
              {selectedLesson.storyHook}
            </p>
          </div>

          {/* Deep Concept Breakdown: The Why */}
          <div className="vg1-story">
            <div className="vg1m-story-head">
              <span>
                <BookHeart size={20} /> LEARN THE WHY · DEEP CONCEPT BREAKDOWN
              </span>
              <button type="button" className="vg1-minibutton" onClick={handleSpeechToggle}>
                {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {speaking ? 'Stop narration' : 'Read aloud'}
              </button>
            </div>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#0f172a' }}>
              {selectedLesson.theWhyExplanation}
            </p>
          </div>

          {/* Visual Model / Interactive Diagram */}
          {selectedLesson.visualModelHtml && (
            <div
              style={{ margin: '16px 0' }}
              dangerouslySetInnerHTML={{ __html: selectedLesson.visualModelHtml }}
            />
          )}

          {/* Guided Discovery Steps */}
          {selectedLesson.guidedSteps && selectedLesson.guidedSteps.length > 0 && (
            <section className="vg1m-guided" aria-label="Step-by-step discovery">
              <h4>Step-by-Step Thinking</h4>
              <ol>
                {selectedLesson.guidedSteps.map((step, idx) => (
                  <li key={idx}>
                    <span>{idx + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Offline Home Activity */}
          <div className="vg1-activity">
            <Lightbulb size={21} />
            <div>
              <strong>Try it away from the screen</strong>
              <p>{selectedLesson.offlineActivity}</p>
            </div>
          </div>

          {/* Concept Check Practice Questions */}
          <section className="vg1-practice" aria-label="Concept check">
            <div>
              <span>SMALL CONCEPT CHECK</span>
              <h4>Check Your Understanding</h4>
              <p>Choose your answers to verify your conceptual grasp. Explanations show the logic behind each choice.</p>
            </div>

            {selectedLesson.questions.map((q, qIndex) => {
              const selectedIdx = answers[q.id];
              const isAnswered = selectedIdx !== undefined;
              const isCorrect = isAnswered && selectedIdx === q.correctIndex;

              return (
                <div className="vg1-question" key={q.id}>
                  <h5>
                    {qIndex + 1}. {q.prompt}
                  </h5>
                  <div className="vg1-options">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedIdx === optIdx;
                      let btnClass = isSelected ? 'selected' : '';
                      if (submitted) {
                        if (optIdx === q.correctIndex) btnClass = 'correct-opt';
                        else if (isSelected && !isCorrect) btnClass = 'wrong-opt';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          className={btnClass}
                          disabled={submitted}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                        >
                          <b>{String.fromCharCode(65 + optIdx)}</b>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className={'vg1-reason' + (isCorrect ? ' correct' : ' revisit')}>
                      <strong>{isCorrect ? '✓ Well reasoned!' : "Let's review the concept"}</strong>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {!submitted ? (
              <button
                type="button"
                className="vg1-primary"
                disabled={selectedLesson.questions.some((q) => answers[q.id] === undefined)}
                onClick={handleSubmitCheck}
              >
                Submit Concept Check <ArrowRight size={17} />
              </button>
            ) : (
              <div className="vg1-result">
                <strong>Concept Check Completed!</strong>
                <p>Your understanding is saved to your daily streak tracker. Keep learning the why!</p>
                <button
                  type="button"
                  className="vg1-minibutton"
                  onClick={() => {
                    setSubmitted(false);
                    setAnswers({});
                  }}
                >
                  <RotateCcw size={14} /> Try again with care
                </button>
              </div>
            )}
          </section>
        </article>
      ) : (
        /* SUBJECTS & LESSONS DIRECTORY */
        <>
          <div className="vg1-intro" style={{ marginTop: '20px' }}>
            <h3>Choose a subject to explore</h3>
            <p>Every subject contains concept-driven lessons with real-world examples, visual breakdowns, and practice exercises.</p>
          </div>

          {/* Subject Pills */}
          <div className="vg1-subjects" aria-label={`Class ${grade} Subjects`}>
            {subjects.map((sub) => {
              const count = lessons.filter((l) => l.subject === sub).length;
              return (
                <button
                  key={sub}
                  type="button"
                  className={'vg1-subject' + (activeSubject === sub ? ' active' : '')}
                  onClick={() => setActiveSubject(sub)}
                >
                  <span className="vg1-subject-icon">
                    {sub.includes('Math') ? <Target size={23} /> : sub.includes('Money') ? <WalletCards size={23} /> : sub.includes('AI') ? <Sparkles size={23} /> : sub === 'Kannada' ? <BookHeart size={23} /> : <BookOpen size={23} />}
                  </span>
                  <strong>{sub.replace('Vayentra Original: ', '')}</strong>
                  <small>{sub.includes('Original') ? 'Vayentra original enrichment' : 'Board textbook curriculum'}</small>
                  <span className="vg1-count">{count} concept classes available</span>
                </button>
              );
            })}
          </div>

          {/* Lessons List for Active Subject */}
          <article className="vg1-chapters" style={{ marginTop: '20px' }}>
            <header>
              <div>
                <span>{activeSubject.includes('Original') ? 'VAYENTRA ORIGINAL PROGRAMME' : 'BOARD CURRICULUM'}</span>
                <h3>{activeSubject.replace('Vayentra Original: ', '')}</h3>
                <p>Class {grade} · Concept-Based Lessons</p>
              </div>
              <span className="vg1-verified">Reviewed & Approved</span>
            </header>

            {filteredLessons.length > 0 ? (
              filteredLessons.map((l) => (
                <div className="vg1-chapter" key={l.id}>
                  <div className="vg1-chapter-title">
                    <span>{String(l.chapterNumber).padStart(2, '0')}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong>{l.lessonTitle}</strong>
                        <span
                          style={{
                            background: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          Concept Class Available
                        </span>
                      </div>
                      <small>Chapter {l.chapterNumber}: {l.chapterTitle} • 10-12 mins</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="vg1-open"
                    onClick={() => {
                      setSelectedLesson(l);
                      setAnswers({});
                      setSubmitted(false);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                  >
                    Open concept class <ChevronDown size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="vg1-pending">
                <BookOpen size={28} />
                <p>Concept classes for this subject are being prepared by the faculty. Check back shortly.</p>
              </div>
            )}
          </article>
        </>
      )}
    </section>
  );
};
