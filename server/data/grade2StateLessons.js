/**
 * Vayentra Gurukula — Class 2 Karnataka State Board Lessons Data
 * Official KTBS Class 2 Alignment for English, Mathematics, and Environmental Studies.
 * Original Vayentra authored stories, interactive guided steps, offline home activities, and formative questions.
 */

export const GRADE2_STATE_ENGLISH_LESSONS = [
  {
    chapterNumber: 2,
    chapterTitle: 'Bengaluru Gardens',
    conceptKey: 'state-bengaluru-gardens',
    title: 'Green Wonders: Lalbagh & Cubbon Park Morning Walk',
    objective: 'Describe garden features (trees, birds, glasshouse) and build descriptive nature vocabulary in English.',
    story: 'On Sunday morning, Priya and her uncle visit the famous Lalbagh Botanical Garden in Bengaluru. Tall century-old trees reach up toward the sky, providing cool shade. Priya sees colourful flowerbeds of red salvias and orange marigolds. Near the lotus pond, a grey heron stands completely still on one leg, waiting for small fish. In the centre of the garden stands the historic Glass House, shining in the morning sun. Priya takes a deep breath of fresh air. City gardens are the green lungs of Karnataka!',
    activity: 'Visit a neighbourhood park or garden with an adult. Write down names of three flowers and two bird species you observe.',
    guidedSteps: [
      'Name three features of a botanical garden: Glasshouse, Lotus pond, Ancient trees.',
      'What was the grey heron doing by the pond? (Standing patiently on one leg).',
      'Explain why parks and trees are important for city air.'
    ],
    teacherPrompt: 'Encourage pride in local environmental heritage like Bengaluru\'s historic public gardens.',
    visualScene: {
      kind: 'bengaluru-garden',
      elements: [
        { id: 'glasshouse', label: 'Lalbagh Glass House', color: '#38bdf8' },
        { id: 'heron', label: 'Heron by Pond', color: '#94a3b8' },
        { id: 'trees', label: 'Tall Century Trees', color: '#15803d' }
      ]
    },
    questions: [
      {
        prompt: 'Which famous botanical garden in Bengaluru is known for its historic Glass House?',
        options: ['Lalbagh Botanical Garden', 'A railway station', 'A busy bus stop'],
        answerIndex: 0,
        explanation: 'Lalbagh is Bengaluru\'s world-famous historical botanical garden.'
      },
      {
        prompt: 'Why are public gardens and city parks called "green lungs"?',
        options: ['Because trees absorb smoke and give fresh oxygen to the city', 'Because they are painted green', 'Because they make engine noise'],
        answerIndex: 0,
        explanation: 'Dense city greenery filters pollutants and generates clean breathing air.'
      },
      {
        prompt: 'How did the grey heron stand near the lotus pond?',
        options: ['Very still on one leg', 'Running backward', 'Doing cartwheels'],
        answerIndex: 0,
        explanation: 'Herons stand patiently motionless to catch fish in shallow water.'
      },
      {
        prompt: 'How should visitors behave when visiting public gardens?',
        options: ['Walk on designated paths and keep the garden clean', 'Pluck all the flowers', 'Litter plastic packets'],
        answerIndex: 0,
        explanation: 'Respectful visitors preserve the natural beauty for everyone.'
      }
    ]
  },
  {
    chapterNumber: 3,
    chapterTitle: 'Action Rhymes',
    conceptKey: 'state-action-rhymes',
    title: 'Rhythm, Movement & Action Rhymes',
    objective: 'Recite English action rhymes, follow multi-step physical directions, and identify rhyming pairs.',
    story: 'Hands up high, reach for the sky! Hands down low, touch your big toe! Turn to the left, turn to the right, stretch like a cat in the morning light. Action rhymes bring words to life with music and joyful body movement. When children clap to the beat, their ears listen to rhythm, their voices practice clear pronunciation, and their minds connect words with real actions. Learning English through poetry and dance makes every lesson an active celebration!',
    activity: 'Teach a sibling the four-line stretch rhyme. Practice saying the words clearly while moving together.',
    guidedSteps: [
      'Action directions: Reach up high, Touch toes low, Turn left, Turn right.',
      'Rhyming pairs: High and Sky, Low and Toe, Right and Light.',
      'Clap to a 4-beat rhythm: 1, 2, 3, 4!'
    ],
    teacherPrompt: 'Integrate physical coordination with phonemic awareness and rhythmic cadence.',
    visualScene: {
      kind: 'action-rhymes',
      elements: [
        { id: 'hands-up', label: 'Reach for the Sky', color: '#f59e0b' },
        { id: 'touch-toes', label: 'Touch Toes', color: '#3b82f6' },
        { id: 'music-notes', label: 'Rhythm Notes', color: '#ec4899' }
      ]
    },
    questions: [
      {
        prompt: 'Which word rhymes with "sky"?',
        options: ['High', 'Low', 'Toe'],
        answerIndex: 0,
        explanation: 'Sky and High share the identical ending "-y/-igh" vowel sound.'
      },
      {
        prompt: 'What action goes with "reach for the sky"?',
        options: ['Stretching both hands up high', 'Sitting on a chair', 'Sleeping in bed'],
        answerIndex: 0,
        explanation: 'Reaching for the sky means extending arms upward.'
      },
      {
        prompt: 'How do action rhymes help us learn a new language?',
        options: ['By linking spoken words with physical actions and rhythm', 'By making us sleepy', 'By reading silently without speaking'],
        answerIndex: 0,
        explanation: 'Total Physical Response (TPR) strengthens vocabulary memory through movement.'
      },
      {
        prompt: 'Which word rhymes with "toe"?',
        options: ['Low', 'High', 'Cat'],
        answerIndex: 0,
        explanation: 'Toe and Low end in the same rhyming sound.'
      }
    ]
  },
  {
    chapterNumber: 4,
    chapterTitle: 'Helping Hands',
    conceptKey: 'state-helping-hands',
    title: 'Community Friends & Everyday Kindness',
    objective: 'Identify local community service roles (sanitation worker, BMTC bus driver, teacher, nurse) and practice gratitude.',
    story: 'Every day across Karnataka, millions of dedicated hands work together! At 6:00 AM, the city pourakarmika (sanitation worker) sweeps the neighborhood street clean. The BMTC bus driver navigates safely through morning traffic so children reach school on time. In the primary clinic, the nurse checks children\'s height and gives gentle health drops. In the fields of Mandya, farmers cultivate golden paddy to feed our families. When everyone does their part with care, our entire society thrives like a happy family.',
    activity: 'Draw a thank-you badge for someone who helps your community (like a bus driver, security guard, or cleaner).',
    guidedSteps: [
      'Name three community service roles in your city or village.',
      'Say in English: "Thank you for keeping our city safe and clean."',
      'Discuss how every honest job deserves dignity and respect.'
    ],
    teacherPrompt: 'Instill deep social appreciation and respect for all forms of labour without hierarchy.',
    visualScene: {
      kind: 'community-helpers',
      elements: [
        { id: 'bus', label: 'BMTC Bus Driver', color: '#0284c7' },
        { id: 'nurse', label: 'Caring Nurse', color: '#10b981' },
        { id: 'farmer', label: 'Paddy Farmer', color: '#ca8a04' }
      ]
    },
    questions: [
      {
        prompt: 'Who drives the public city bus safely to help people commute to school and work?',
        options: ['The bus driver', 'The librarian', 'A pet dog'],
        answerIndex: 0,
        explanation: 'Bus drivers safely operate public transport for the community.'
      },
      {
        prompt: 'What is the honourable Kannada name for city sanitation workers who keep streets clean?',
        options: ['Pourakarmika', 'Carpenter', 'Singer'],
        answerIndex: 0,
        explanation: 'Pourakarmikas perform vital sanitation services keeping our cities hygienic.'
      },
      {
        prompt: 'How should we treat workers who help in our school and neighborhood?',
        options: ['With politeness, dignity, and sincere gratitude', 'By being rude', 'By ignoring them'],
        answerIndex: 0,
        explanation: 'Every form of honest work deserves respect and courteous words.'
      },
      {
        prompt: 'Who works hard in agricultural fields to grow grains and vegetables for all of us?',
        options: ['Farmers', 'Pilots', 'Divers'],
        answerIndex: 0,
        explanation: 'Farmers cultivate the food that nourishes everyone.'
      }
    ]
  }
];

export const GRADE2_STATE_MATHS_LESSONS = [
  {
    chapterNumber: 2,
    chapterTitle: 'Shapes and Spatial Play',
    conceptKey: 'state-shapes-spatial',
    title: 'Flat & Solid Shapes in Traditional Crafts',
    objective: 'Differentiate 2D flat shapes (circle, square, triangle, rectangle) from 3D solids (sphere, cube, cylinder) in daily items.',
    story: 'At the Channapatna toy workshop, craftsman Basavaraju carves smooth wooden toys from ivory wood. Look at the shapes: the rolling toy wheels are flat CIRCLES. The wooden building blocks are solid CUBES with six square faces. The lacquered beads on the string are shiny SPHERES. The handle of the rattle is a smooth CYLINDER. 2D shapes are flat drawings on paper, while 3D shapes are solid objects we can hold in our hands. Shapes are the building blocks of toys, buildings, and machines!',
    activity: 'Find three 3D objects in your kitchen: a cylinder (tin or tumbler), a sphere (lemon or onion), and a cuboid (biscuit box).',
    guidedSteps: [
      'Compare 2D (flat outline) vs 3D (solid object you can hold).',
      'Count faces of a cube: 6 square faces.',
      'Identify objects that can roll (cylinder, sphere) vs slide (cube, box).'
    ],
    teacherPrompt: 'Use traditional Channapatna toys or common kitchen utensils to explore shape properties tactilely.',
    visualScene: {
      kind: 'wooden-shapes',
      elements: [
        { id: 'sphere', label: 'Lacquered Sphere Bead', color: '#ef4444' },
        { id: 'cylinder', label: 'Wooden Cylinder Rattle', color: '#f59e0b' },
        { id: 'cube', label: 'Solid Wooden Cube', color: '#3b82f6' }
      ]
    },
    questions: [
      {
        prompt: 'Which of these 3D solid shapes can roll smoothly across the floor?',
        options: ['A sphere (like a wooden bead or ball)', 'A flat brick', 'A wooden plank'],
        answerIndex: 0,
        explanation: 'Spheres have round curved surfaces and roll easily in all directions.'
      },
      {
        prompt: 'How many flat square faces does a solid playing cube have?',
        options: ['6 faces', '2 faces', '10 faces'],
        answerIndex: 0,
        explanation: 'A cube has exactly 6 identical square faces.'
      },
      {
        prompt: 'What 3D shape is a cylindrical steel drinking tumbler?',
        options: ['A cylinder', 'A triangle', 'A cone'],
        answerIndex: 0,
        explanation: 'A tumbler has two circular ends and a curved surface, making it a cylinder.'
      },
      {
        prompt: 'What is the famous Karnataka town celebrated for colourful wooden lacquerware toys?',
        options: ['Channapatna', 'Goa', 'Delhi'],
        answerIndex: 0,
        explanation: 'Channapatna is affectionately known as the "Toy Town" (Gombegala Ooru) of Karnataka.'
      }
    ]
  },
  {
    chapterNumber: 3,
    chapterTitle: 'Addition & Subtraction',
    conceptKey: 'state-addition-subtraction',
    title: 'Market Stories: Mental Math & Problem Solving',
    objective: 'Solve real-life two-digit addition and subtraction word problems with sums and differences up to 99.',
    story: 'At the Devaraja Market in Mysuru, fruit seller Raju arranges sweet Mysore bananas. In the morning, Raju had 45 bananas in his woven wicker basket. A customer buys 20 bananas for a temple pooja. Raju calculates quickly: 45 - 20 = 25 bananas left! Later, his brother brings 30 fresh bananas from the farm. Raju adds: 25 + 30 = 55 bananas in total! Addition brings quantities together to find the whole; subtraction takes away or compares to find what remains.',
    activity: 'Create a math story with 18 flowers and 10 leaves. Solve: how many in all? (18 + 10 = 28).',
    guidedSteps: [
      'Solve subtraction: 45 - 20 = 25.',
      'Solve addition: 25 + 30 = 55.',
      'Practice mental math: adding tens (20, 30, 40) quickly.'
    ],
    teacherPrompt: 'Connect arithmetic with realistic market contexts to build intuitive number sense.',
    visualScene: {
      kind: 'market-math',
      elements: [
        { id: 'basket', label: 'Wicker Fruit Basket', color: '#ca8a04' },
        { id: 'bananas', label: 'Sweet Yellow Bananas', color: '#eab308' },
        { id: 'calc', label: 'Mental Math: 45 - 20 = 25', color: '#16a34a' }
      ]
    },
    questions: [
      {
        prompt: 'If a basket has 34 mangoes and you add 10 more, how many are there now?',
        options: ['44 mangoes', '24 mangoes', '35 mangoes'],
        answerIndex: 0,
        explanation: '34 + 10 = 44.'
      },
      {
        prompt: 'You had 50 jasmine flower buds and gave 20 to your friend. How many buds do you have left?',
        options: ['30 buds', '70 buds', '10 buds'],
        answerIndex: 0,
        explanation: '50 - 20 = 30.'
      },
      {
        prompt: 'What arithmetic operation do we use when combining two groups together?',
        options: ['Addition (+)', 'Subtraction (-)', 'None'],
        answerIndex: 0,
        explanation: 'Addition combines two or more numbers to calculate the sum.'
      },
      {
        prompt: 'What is 60 + 25?',
        options: ['85', '75', '95'],
        answerIndex: 0,
        explanation: '60 + 20 = 80, and 80 + 5 = 85.'
      }
    ]
  },
  {
    chapterNumber: 4,
    chapterTitle: 'Measurement and Money',
    conceptKey: 'state-measurement-money',
    title: 'Handspans, Balances & Everyday Rupees',
    objective: 'Estimate lengths using non-standard body units (handspan, cubit) and recognize Indian currency combinations up to ₹100.',
    story: 'Grandmother is buying fresh fragrant jasmine garland (mallige hoovu) at the street corner. The flower seller measures the garland using his forearm: from his elbow to the tip of his middle finger—this traditional measure is called a CUBIT (moorada). At the vegetable counter, the vendor uses a two-pan balance scale with iron weights to weigh fresh green beans. To pay, mother hands a ₹20 note and two ₹10 coins: ₹20 + ₹10 + ₹10 = ₹40! Measuring lengths, weighing vegetables, and counting rupees helps daily life run smoothly and fairly.',
    activity: 'Measure the length of your study table using your handspan (stretched thumb to pinky). How many handspans long is it?',
    guidedSteps: [
      'Compare body units: Handspan, Footstep, Cubit (forearm).',
      'Observe a two-pan balance: both sides balance when weights are equal.',
      'Add coin values: ₹20 + ₹10 + ₹10 = ₹40.'
    ],
    teacherPrompt: 'Discuss traditional non-standard measurement units alongside standard metres and kilograms.',
    visualScene: {
      kind: 'measurement-money',
      elements: [
        { id: 'garland', label: 'Jasmine Garland (1 Cubit)', color: '#f8fafc' },
        { id: 'balance', label: 'Pan Balance Scale', color: '#64748b' },
        { id: 'rupees', label: '₹20 + ₹10 + ₹10 = ₹40', color: '#16a34a' }
      ]
    },
    questions: [
      {
        prompt: 'What traditional body unit measures from the elbow to the tip of the middle finger?',
        options: ['A Cubit (Moora in Kannada)', 'A Footstep', 'A Finger-width only'],
        answerIndex: 0,
        explanation: 'A cubit spans from the elbow joint to the tip of the outstretched middle finger.'
      },
      {
        prompt: 'If you have one ₹50 note and one ₹20 note, how much money do you have in total?',
        options: ['₹70', '₹30', '₹100'],
        answerIndex: 0,
        explanation: '₹50 + ₹20 = ₹70.'
      },
      {
        prompt: 'When the two pans of a vegetable balance scale are at the exact same level, what does it mean?',
        options: ['Both sides have equal weight (balanced)', 'One side is heavier', 'The scale is broken'],
        answerIndex: 0,
        explanation: 'Level balance pans indicate equal mass on both sides.'
      },
      {
        prompt: 'Why do we use standard measuring tapes and scales instead of handspans alone?',
        options: ['Because handspans differ from person to person; standard units stay identical everywhere', 'Because handspans are illegal', 'Because hands are too fast'],
        answerIndex: 0,
        explanation: 'Standard units (metres, kilograms) ensure accuracy and fairness for everyone.'
      }
    ]
  }
];

export const GRADE2_STATE_EVS_LESSONS = [
  {
    chapterNumber: 1,
    chapterTitle: 'Our Senses & Health',
    conceptKey: 'state-senses-health',
    title: 'Body Helpers: Senses, Nutrition & Clean Habits',
    objective: 'Demonstrate healthy body routines, explain the role of sense organs, and choose nutritious traditional foods.',
    story: 'A healthy body is our greatest treasure! In the morning, Ravi drinks clean water and eats warm steamed idlis with coconut chutney. Idlis give gentle energy without heavy oil. Ravi washes his eyes with clean cool water, brushes his teeth twice a day with soft circular strokes, and keeps his fingernails clipped short and clean. When we care for our ears, eyes, skin, and teeth, our senses stay sharp, our minds feel joyful, and we are ready for a full day of school adventures!',
    activity: 'List your three favourite nutritious home foods (such as ragi mudde, dal, vegetable sambar). Explain why home-cooked food is healthy.',
    guidedSteps: [
      'Name two daily habits that protect your teeth: Brushing morning and night.',
      'Explain why keeping nails clean stops germs from entering our food.',
      'Choose whole fruits (like guava or banana) over packaged chips.'
    ],
    teacherPrompt: 'Encourage traditional wholesome regional foods: ragi, lentils, fresh seasonal fruits, and greens.',
    visualScene: {
      kind: 'healthy-routine',
      elements: [
        { id: 'idli', label: 'Steamed Idli Breakfast', color: '#f8fafc' },
        { id: 'toothbrush', label: 'Dental Care', color: '#38bdf8' },
        { id: 'fruits', label: 'Fresh Guava & Banana', color: '#84cc16' }
      ]
    },
    questions: [
      {
        prompt: 'Why should we wash our hands with soap before touching food?',
        options: ['To wash away invisible dirt and germs', 'To make hands smell like flowers only', 'To make food wet'],
        answerIndex: 0,
        explanation: 'Soap removes bacteria that could cause tummy aches if ingested.'
      },
      {
        prompt: 'Which of these is a nutritious home-cooked South Indian breakfast?',
        options: ['Steamed idlis with vegetable sambar', 'Packaged deep-fried chips', 'Sugary soda drink'],
        answerIndex: 0,
        explanation: 'Steamed idlis and lentil-rich sambar provide balanced proteins and healthy energy.'
      },
      {
        prompt: 'How often should children brush their teeth to maintain healthy gums?',
        options: ['Twice a day: in the morning and before sleeping at night', 'Once a month', 'Never'],
        answerIndex: 0,
        explanation: 'Brushing twice daily cleans plaque and food particles effectively.'
      },
      {
        prompt: 'Why should we keep our fingernails trimmed neatly?',
        options: ['So dirt and harmful bacteria cannot hide under long nails', 'To paint them black', 'To make them hurt'],
        answerIndex: 0,
        explanation: 'Trimmed nails prevent dirt accumulation and transmission to food.'
      }
    ]
  },
  {
    chapterNumber: 3,
    chapterTitle: 'Plants and Trees in Karnataka',
    conceptKey: 'state-plants-karnataka',
    title: 'The Green Heritage of Karnataka: Sandalwood, Neem & Tulsi',
    objective: 'Recognize iconic trees of Karnataka (Sandalwood, Neem, Banyan, Coconut) and their medicinal and ecological benefits.',
    story: 'Karnataka is celebrated across the world as the land of fragrant Sandalwood (Gandhada Gudi)! In grandmother\'s courtyard stands a lush green Tulsi plant in a terracotta pot. Grandmother explains that Tulsi leaves have natural healing properties that soothe coughs. Along the village road, broad Neem trees provide antibacterial shade and bitter leaves that repel harmful insects. Near coastal Mangaluru and Karwar, tall coconut palms sway gracefully, providing sweet tender water and nutritious kernels. Respecting trees means safeguarding our state\'s natural soul!',
    activity: 'Find a neem or tulsi leaf. Gently crush it between your fingers and describe the distinct fragrance.',
    guidedSteps: [
      'Name three iconic trees of Karnataka: Sandalwood (Chandana), Neem (Bevu), Coconut (Thengu).',
      'Explain the health benefits of Tulsi and Neem.',
      'Why is Karnataka affectionately known as "Gandhada Gudi" (Temple of Sandalwood)?'
    ],
    teacherPrompt: 'Connect botanical biodiversity to Karnataka\'s regional culture, literature, and indigenous medicine.',
    visualScene: {
      kind: 'karnataka-trees',
      elements: [
        { id: 'sandalwood', label: 'Fragrant Sandalwood Tree', color: '#ca8a04' },
        { id: 'neem', label: 'Medicinal Neem Tree', color: '#15803d' },
        { id: 'tulsi', label: 'Sacred Tulsi Plant', color: '#16a34a' }
      ]
    },
    questions: [
      {
        prompt: 'Which world-famous fragrant tree gives Karnataka the cherished title "Gandhada Gudi"?',
        options: ['Sandalwood (Chandana)', 'Plastic pine tree', 'Cactus'],
        answerIndex: 0,
        explanation: 'Karnataka is renowned worldwide for its fragrant sandalwood forests and heritage.'
      },
      {
        prompt: 'Which common backyard medicinal plant in Karnataka is known for soothing coughs and colds?',
        options: ['Tulsi (Holy Basil)', 'Poison ivy', 'Thorn weed'],
        answerIndex: 0,
        explanation: 'Tulsi has celebrated antiviral and respiratory soothing properties in Ayurveda.'
      },
      {
        prompt: 'Why do villagers often use fresh neem twigs (Bevina kaddi)?',
        options: ['For natural antibacterial oral hygiene and tooth cleaning', 'As cooking fuel only', 'To paint walls'],
        answerIndex: 0,
        explanation: 'Neem twigs have natural antimicrobial properties traditionally used for dental care.'
      },
      {
        prompt: 'What refreshing, natural beverage do coastal coconut palms provide during summer?',
        options: ['Tender coconut water (Eleniru)', 'Bottled soda', 'Cold coffee'],
        answerIndex: 0,
        explanation: 'Tender coconut water is a natural electrolyte-rich drink.'
      }
    ]
  },
  {
    chapterNumber: 4,
    chapterTitle: 'Festivals and Joy',
    conceptKey: 'state-festivals-joy',
    title: 'Festivals of Karnataka: Dasara, Ugadi & Community Unity',
    objective: 'Explore traditional festivals of Karnataka (Mysuru Dasara, Ugadi, Deepavali) and understand community harmony.',
    story: 'Festivals in Karnataka fill towns and villages with music, lights, and shared sweetness! On the auspicious New Year day of Ugadi, families prepare "Bevu-Bella"—a mixture of bitter neem blossoms and sweet jaggery. Grandmother explains: "Bevu-Bella teaches us that life has both joy and sorrow; we must embrace both with a calm and cheerful heart!" During the world-famous Mysuru Dasara festival, the grand Amba Vilas Palace glows with one hundred thousand golden electric bulbs, and the decorated elephant carries the golden howdah. Festivals bring neighbours together with love and mutual respect!',
    activity: 'Draw a picture of Mysuru Palace illuminated with lights or a plate of sweet Holige (Obbattu).',
    guidedSteps: [
      'What does "Bevu-Bella" symbolize on Ugadi? (Life is a blend of bitter and sweet experiences).',
      'Where is the grand Jumboo Savari elephant procession held during Dasara? (Mysuru).',
      'Explain how sharing festive sweets unites people of all backgrounds.'
    ],
    teacherPrompt: 'Emphasize the philosophical and emotional wisdom embedded in cultural festivals: harmony, sharing, and resilience.',
    visualScene: {
      kind: 'karnataka-festivals',
      elements: [
        { id: 'palace', label: 'Mysuru Palace Lights', color: '#f59e0b' },
        { id: 'bevu-bella', label: 'Bevu-Bella Dish', color: '#16a34a' },
        { id: 'howdah', label: 'Golden Howdah (Ambari)', color: '#eab308' }
      ]
    },
    questions: [
      {
        prompt: 'What traditional symbolic mixture is prepared on the Kannada New Year festival of Ugadi?',
        options: ['Bevu-Bella (Neem blossoms and sweet Jaggery)', 'Chilli powder only', 'Cold ice cream'],
        answerIndex: 0,
        explanation: 'Bevu-Bella symbolizes that life is a balanced journey of sweet joys and bitter challenges.'
      },
      {
        prompt: 'In which royal city of Karnataka is the world-renowned 10-day Dasara celebration held?',
        options: ['Mysuru (Mysore)', 'Mumbai', 'Chennai'],
        answerIndex: 0,
        explanation: 'Mysuru Dasara is an internationally celebrated state festival (Naada Habba) of Karnataka.'
      },
      {
        prompt: 'What special treat is traditionally baked and shared during Ugadi festival?',
        options: ['Sweet Holige (Obbattu)', 'Salty popcorn', 'Dry toast'],
        answerIndex: 0,
        explanation: 'Holige (Obbattu) is a beloved sweet flatbread prepared during Ugadi and festive occasions.'
      },
      {
        prompt: 'Why are community festivals important for society?',
        options: ['They bring family, friends, and neighbours together in harmony and joy', 'To make people argue', 'To close all schools forever'],
        answerIndex: 0,
        explanation: 'Festivals strengthen social bonds, cultural heritage, and goodwill among communities.'
      }
    ]
  }
];
