/**
 * Vayentra Gurukula — Class 2 Mathematics (Joyful Mathematics) Curriculum Data
 * Official NCERT Joyful Mathematics Class 2 Alignment (Chapters 3 to 11).
 * Original Vayentra authored stories, interactive guided steps, offline home activities, and formative questions.
 */

export const GRADE2_MATHS_JOYFUL_LESSONS = [
  {
    chapterNumber: 3,
    chapterTitle: 'Fun with Numbers',
    conceptKey: 'fun-with-numbers-g2',
    title: 'Two-Digit Numbers: Tens, Ones & Number Ladders up to 99',
    objective: 'Read, write, expand, and compare two-digit numbers up to 99 using bundles of tens and loose units.',
    story: 'At the village clay pottery workshop, master potter Gopal is packing decorative Diwali diyas into boxes. Each clay box holds exactly 10 diyas. Gopal fills 6 boxes and has 8 loose diyas on the counter. "Look, little Maya," says Gopal, "6 Tens and 8 Ones gives us 68 diyas in all!" If Gopal makes 2 more diyas, 68 becomes 70—that makes 7 full tens! Breaking numbers into tens and ones helps us see how big numbers grow, compare which pile has more, and count quickly without making mistakes.',
    activity: 'Use matchsticks or dried rajma beans. Make bundles of 10 with rubber bands and show the numbers 25, 48, and 73.',
    guidedSteps: [
      'Write 68 in expanded form: 60 + 8.',
      'What number comes just before 70? What comes just after 70?',
      'Compare 54 and 45: which has more tens?'
    ],
    teacherPrompt: 'Reinforce place value: the left digit represents groups of ten, the right represents single units.',
    visualScene: {
      kind: 'tens-diya-boxes',
      elements: [
        { id: 'boxes', label: '6 Boxes of 10 Diyas (60)', color: '#d97706' },
        { id: 'loose', label: '8 Loose Diyas (8)', color: '#f59e0b' },
        { id: 'total', label: 'Total: 68', color: '#16a34a' }
      ]
    },
    questions: [
      {
        prompt: 'In the number 68, what is the place value of the digit 6?',
        options: ['60 (6 Tens)', '6 (6 Ones)', '600 (6 Hundreds)'],
        answerIndex: 0,
        explanation: 'The digit 6 in the tens place has a value of 6 tens, or 60.'
      },
      {
        prompt: 'Which number is greater: 54 or 45?',
        options: ['54 (because 5 tens is more than 4 tens)', '45', 'They are equal'],
        answerIndex: 0,
        explanation: '5 tens (50) is greater than 4 tens (40).'
      },
      {
        prompt: 'What number comes immediately before 80?',
        options: ['79', '81', '70'],
        answerIndex: 0,
        explanation: '79 comes right before 80 when counting forward.'
      },
      {
        prompt: 'How many tens and ones are there in the number 92?',
        options: ['9 Tens and 2 Ones', '2 Tens and 9 Ones', '92 Tens'],
        answerIndex: 0,
        explanation: '92 equals 90 (9 tens) + 2 (2 ones).'
      }
    ]
  },
  {
    chapterNumber: 4,
    chapterTitle: 'Shadow Story (Togalu Gombeyaata)',
    conceptKey: 'shadow-story-geometry',
    title: 'Shadows, Light & 2D Shapes of 3D Objects',
    objective: 'Explore how 3D everyday objects cast 2D flat shadows, connecting solid forms to geometric silhouettes.',
    story: 'In an open theatre, grandfather sets up a white cotton screen with a bright brass oil lamp behind it. He holds up a leather puppet of an elephant—this is the traditional Karnataka art of Togalu Gombeyaata! When the light shines on the puppet, a crisp dark silhouette appears on the screen. Grandfather then holds up a round tea cup: its shadow on the wall is a circle! When he holds up a rectangular matchbox, its shadow is a flat rectangle. Shadows show us the flat 2D outlines of solid 3D things!',
    activity: 'Take a torch into a dim room. Shine it on a ball, a book, and a cylinder glass against a wall. Trace each shadow.',
    guidedSteps: [
      'Notice: A round ball casts a circular shadow.',
      'Notice: A cuboid book casts a rectangular shadow.',
      'Move the torch closer and farther to see how shadow size changes.'
    ],
    teacherPrompt: 'Connect shadows to geometric projections and early 2D/3D visualization.',
    visualScene: {
      kind: 'shadow-puppet',
      elements: [
        { id: 'screen', label: 'White Puppet Screen', color: '#f8fafc' },
        { id: 'shadow', label: 'Dark Silhouette', color: '#1e293b' },
        { id: 'lamp', label: 'Brass Oil Lamp Light', color: '#eab308' }
      ]
    },
    questions: [
      {
        prompt: 'What 2D shape is the shadow cast by a round cricket ball?',
        options: ['A circle', 'A square', 'A triangle'],
        answerIndex: 0,
        explanation: 'A sphere casts a round circular outline when light falls straight on it.'
      },
      {
        prompt: 'What is needed to make a shadow appear?',
        options: ['A light source, an object, and a screen or wall', 'Complete pitch darkness only', 'Cold wind only'],
        answerIndex: 0,
        explanation: 'A shadow forms when an opaque object blocks light rays from reaching a surface.'
      },
      {
        prompt: 'What flat shape does the face of a rectangular textbook cast?',
        options: ['A rectangle', 'A circle', 'A star'],
        answerIndex: 0,
        explanation: 'The flat face of a rectangular book produces a rectangular shadow.'
      },
      {
        prompt: 'What is Togalu Gombeyaata?',
        options: ['A traditional shadow puppet theatre art of Karnataka', 'A video game', 'A cooking utensil'],
        answerIndex: 0,
        explanation: 'Togalu Gombeyaata is a cherished Karnataka heritage shadow puppetry art.'
      }
    ]
  },
  {
    chapterNumber: 5,
    chapterTitle: 'Playing with Lines',
    conceptKey: 'playing-with-lines',
    title: 'Straight, Curved, Standing & Slanting Lines',
    objective: 'Identify vertical (standing), horizontal (sleeping), slanting, and curved lines in drawings and letters.',
    story: 'Pooja and Farhan are drawing on the veranda with chalk sticks. Farhan draws a straight STANDING line like a tall flag pole. Pooja draws a flat SLEEPING line like the level water of a pond. Together, they make a SLANTING line like a playground slide! Then Pooja wiggles her wrist to draw a flowing CURVED line like a swimming fish. Look at the English alphabet: the letter "H" is made of two standing lines and one sleeping line. The letter "O" is a complete curved loop. Everything we draw begins with lines!',
    activity: 'Find four objects in your room: one with straight edges (like a scale) and one with curved edges (like a coin).',
    guidedSteps: [
      'Trace in the air: Standing line (vertical), Sleeping line (horizontal), Slanting line (diagonal).',
      'Draw the letter "A": notice two slanting lines and one sleeping line.',
      'Draw waves in the ocean using smooth curved lines.'
    ],
    teacherPrompt: 'Guide children to break down printed letters and geometric figures into basic line types.',
    visualScene: {
      kind: 'types-of-lines',
      elements: [
        { id: 'vertical', label: 'Standing Line (|)', color: '#3b82f6' },
        { id: 'horizontal', label: 'Sleeping Line (—)', color: '#10b981' },
        { id: 'slanting', label: 'Slanting Line (/)', color: '#f59e0b' },
        { id: 'curved', label: 'Curved Line (~)', color: '#ec4899' }
      ]
    },
    questions: [
      {
        prompt: 'What type of line is like a tall flagpole standing straight up?',
        options: ['A standing (vertical) line', 'A curved loop', 'A zigzag circle'],
        answerIndex: 0,
        explanation: 'Standing lines go straight up and down vertically.'
      },
      {
        prompt: 'Which English capital letter is made entirely of curved lines?',
        options: ['O', 'T', 'H'],
        answerIndex: 0,
        explanation: 'The letter "O" consists of one smooth, continuous curved line.'
      },
      {
        prompt: 'What lines make up the letter "T"?',
        options: ['One sleeping line and one standing line', 'Two curved circles', 'Three slanting lines'],
        answerIndex: 0,
        explanation: 'A "T" has a horizontal sleeping bar across the top and a vertical standing stem.'
      },
      {
        prompt: 'Which playground ride resembles a slanting line?',
        options: ['A slide', 'A merry-go-round', 'A swing loop'],
        answerIndex: 0,
        explanation: 'A slide slopes downward at a slant from top to bottom.'
      }
    ]
  },
  {
    chapterNumber: 6,
    chapterTitle: 'Decoration for Festival',
    conceptKey: 'decoration-for-festival',
    title: 'Patterns, Symmetry & Festive Motifs',
    objective: 'Create, extend, and identify repeating geometric patterns and symmetry in festive decorations (torans, rangoli).',
    story: 'Tomorrow is the harvest festival of Sankranti! Ananya and her mother are decorating the front doorway. They string fresh mango leaves and yellow marigold flowers in a repeating pattern: Leaf, Flower, Leaf, Flower, Leaf... What comes next? A golden flower! Inside the courtyard, Ananya draws a chalk rangoli. First, she creates a square, places four dots, and extends symmetrical petal curves in all four directions. Repeating rules and balanced shapes turn simple chalk and blossoms into breathtaking art!',
    activity: 'Use coloured bottle caps or cut-out paper shapes to make a repeating pattern: Circle, Triangle, Square, Circle...',
    guidedSteps: [
      'Identify the repeating unit: [Leaf, Marigold].',
      'Extend the pattern: Leaf, Flower, Leaf, Flower, [?].',
      'Notice symmetry: a rangoli design that looks balanced on left and right.'
    ],
    teacherPrompt: 'Encourage learners to articulate the pattern rule aloud before predicting the next shape.',
    visualScene: {
      kind: 'festive-toran',
      elements: [
        { id: 'leaf', label: 'Green Mango Leaf', color: '#15803d' },
        { id: 'flower', label: 'Golden Marigold', color: '#eab308' },
        { id: 'rangoli', label: 'Symmetrical Rangoli', color: '#f43f5e' }
      ]
    },
    questions: [
      {
        prompt: 'Complete the pattern: Square, Circle, Square, Circle, _____?',
        options: ['Square', 'Triangle', 'Star'],
        answerIndex: 0,
        explanation: 'The pattern alternates between square and circle.'
      },
      {
        prompt: 'What natural items are traditionally used to make doorway torans in India?',
        options: ['Mango leaves and marigold blossoms', 'Plastic wrappers', 'Metal wires only'],
        answerIndex: 0,
        explanation: 'Fresh mango leaves and auspicious marigolds are traditional festive doorway decor.'
      },
      {
        prompt: 'What does "symmetry" mean in a rangoli or art design?',
        options: ['Both halves look balanced and match like mirror reflections', 'It is crooked and messy', 'It has no colours'],
        answerIndex: 0,
        explanation: 'Symmetry means balance, where parts mirror each other evenly.'
      },
      {
        prompt: 'If a border pattern repeats every 3 shapes [Red, Blue, Green], what is the 4th shape?',
        options: ['Red', 'Yellow', 'Black'],
        answerIndex: 0,
        explanation: 'After completing the cycle of 3, the pattern restarts with the first color: Red.'
      }
    ]
  },
  {
    chapterNumber: 7,
    chapterTitle: "Rani's Gift",
    conceptKey: 'ranis-gift-capacity',
    title: 'Capacity & Measuring Liquids: Glasses, Bowls & Litres',
    objective: 'Compare and estimate liquid capacity using non-standard containers (cups, bowls, bottles) and understand volume.',
    story: 'It is a warm Sunday afternoon, and Rani wants to serve refreshing lemon juice to her grandfather and cousins. She fills a large glass jug from the water filter. Rani wonders: "How many small cups can this single jug fill?" She pours carefully: Cup 1, Cup 2, Cup 3, Cup 4, Cup 5, Cup 6! The large jug holds exactly 6 small cups of juice. When Rani pours juice into a tall narrow glass and a wide shallow bowl, both contain the same amount of liquid even though they look different. Capacity tells us how much liquid a container can hold!',
    activity: 'Take a small plastic cup and a medium cooking pot. Count how many cups of water fill the pot to the brim.',
    guidedSteps: [
      'Compare containers: which holds more water—a spoon or a cup? A bucket or a jug?',
      'Pour water from one container to another without spilling.',
      'Learn the standard unit word: 1 Litre (L).'
    ],
    teacherPrompt: 'Conduct simple conservation-of-volume demonstrations with water and containers of different shapes.',
    visualScene: {
      kind: 'capacity-jug-cups',
      elements: [
        { id: 'jug', label: 'Large Glass Jug (6 Cups)', color: '#38bdf8' },
        { id: 'cups', label: '6 Small Cups', color: '#fbbf24' },
        { id: 'lemon', label: 'Fresh Lemon Slices', color: '#84cc16' }
      ]
    },
    questions: [
      {
        prompt: 'Which container can hold the most water?',
        options: ['A bathroom bucket', 'A tea spoon', 'A coffee mug'],
        answerIndex: 0,
        explanation: 'A large bucket has far greater capacity than a mug or spoon.'
      },
      {
        prompt: 'If 1 jug fills exactly 4 tumblers, how many tumblers will 2 identical jugs fill?',
        options: ['8 tumblers', '4 tumblers', '2 tumblers'],
        answerIndex: 0,
        explanation: '4 + 4 = 8 tumblers.'
      },
      {
        prompt: 'What standard unit is commonly used to measure milk and petrol?',
        options: ['Litre', 'Metre', 'Kilogram of wood'],
        answerIndex: 0,
        explanation: 'Liquids are measured in Litres (L) and millilitres (mL).'
      },
      {
        prompt: 'If you pour 1 cup of juice into a wide bowl, does the amount of juice change?',
        options: ['No, the amount stays the same; only the shape changes', 'Yes, it magically doubles', 'It disappears'],
        answerIndex: 0,
        explanation: 'The volume remains constant regardless of the container’s shape.'
      }
    ]
  },
  {
    chapterNumber: 8,
    chapterTitle: 'Grouping and Sharing',
    conceptKey: 'grouping-and-sharing',
    title: 'Equal Groups & Fair Sharing (Foundations of Division)',
    objective: 'Divide a set of objects into equal groups, share items fairly without remainders, and write sharing statements.',
    story: 'Grandmother baked 12 warm, golden cookies with cardamom and cashews. Three grandchildren—Aman, Diya, and Neil—sit eagerly at the low wooden dining table. Grandmother says: "Share these 12 cookies equally so that every child receives the exact same number." Aman places 1 cookie on each plate, then another, then another, and then another! Each child gets exactly 4 cookies. 12 shared equally among 3 children is 4 cookies each. Sharing equally means nobody gets left out, and everyone smiles!',
    activity: 'Take 15 dried chickpeas or buttons. Share them equally onto 3 plates. How many are on each plate?',
    guidedSteps: [
      'Count the total objects: 12 cookies.',
      'Count the groups: 3 grandchildren.',
      'Distribute one by one until all are shared: 4 on each plate.'
    ],
    teacherPrompt: 'Use concrete manipulatives to build intuitive foundations for division as repeated equal sharing.',
    visualScene: {
      kind: 'sharing-cookies',
      elements: [
        { id: 'plate1', label: 'Plate 1: 4 Cookies', color: '#f59e0b' },
        { id: 'plate2', label: 'Plate 2: 4 Cookies', color: '#f59e0b' },
        { id: 'plate3', label: 'Plate 3: 4 Cookies', color: '#f59e0b' }
      ]
    },
    questions: [
      {
        prompt: 'If 10 bananas are shared equally between 2 monkeys, how many does each monkey get?',
        options: ['5 bananas', '2 bananas', '10 bananas'],
        answerIndex: 0,
        explanation: '10 divided into 2 equal parts is 5 each (5 + 5 = 10).'
      },
      {
        prompt: 'What does "sharing equally" mean?',
        options: ['Every person receives the exact same number of items', 'One person takes everything', 'Random guessing'],
        answerIndex: 0,
        explanation: 'Equal sharing means fairness and identical amounts for all.'
      },
      {
        prompt: 'If 12 marbles are grouped into packets of 3, how many packets can you make?',
        options: ['4 packets', '3 packets', '12 packets'],
        answerIndex: 0,
        explanation: '12 grouped in threes gives 4 complete packets (3 + 3 + 3 + 3 = 12).'
      },
      {
        prompt: 'How many pairs can you make from 8 shoes?',
        options: ['4 pairs', '2 pairs', '8 pairs'],
        answerIndex: 0,
        explanation: 'A pair means 2 shoes. 8 / 2 = 4 pairs.'
      }
    ]
  },
  {
    chapterNumber: 9,
    chapterTitle: 'Which Season is It?',
    conceptKey: 'which-season-is-it',
    title: 'Days, Months & The Cycle of Seasons',
    objective: 'Sequence days of the week, name the 12 months, and associate seasonal changes with weather and clothing.',
    story: 'Kabir checks the colourful paper calendar hanging on the wall. Today is Friday! Kabir knows there are 7 days in a week: Monday through Sunday. Across the year, 12 months come and go like turning pages. In May, during the hot Summer, Kabir enjoys sweet cold watermelon. In July, during the Monsoon season, raindrops tap on the tin roof and Kabir wears his yellow raincoat. In December, during Winter, cool breezes blow and families wear warm woolen sweaters. Understanding the calendar helps us celebrate festivals and plan our year!',
    activity: 'Recite all 7 days of the week in order. What day is today, what day was yesterday, and what day will tomorrow be?',
    guidedSteps: [
      'Count the days in a week: 7 days.',
      'Recite the 12 months from January to December.',
      'Match clothing to seasons: Raincoat -> Monsoon, Sweater -> Winter, Cotton shirt -> Summer.'
    ],
    teacherPrompt: 'Connect calendar reading to daily classroom routines and seasonal agricultural cycles in India.',
    visualScene: {
      kind: 'seasons-calendar',
      elements: [
        { id: 'summer', label: 'Summer Sun', color: '#f59e0b' },
        { id: 'monsoon', label: 'Rain Clouds', color: '#0284c7' },
        { id: 'winter', label: 'Winter Woolens', color: '#6366f1' }
      ]
    },
    questions: [
      {
        prompt: 'How many days are there in one complete week?',
        options: ['7 days', '5 days', '12 days'],
        answerIndex: 0,
        explanation: 'A week has exactly 7 days: Mon, Tue, Wed, Thu, Fri, Sat, Sun.'
      },
      {
        prompt: 'If today is Wednesday, what day will tomorrow be?',
        options: ['Thursday', 'Tuesday', 'Sunday'],
        answerIndex: 0,
        explanation: 'Thursday comes immediately after Wednesday.'
      },
      {
        prompt: 'How many months make up one full year?',
        options: ['12 months', '7 months', '100 months'],
        answerIndex: 0,
        explanation: 'There are 12 months in a calendar year (January to December).'
      },
      {
        prompt: 'Which season brings heavy rain and green sprouting grass across India?',
        options: ['Monsoon (Rainy season)', 'Dry Winter', 'Spring'],
        answerIndex: 0,
        explanation: 'The monsoon brings seasonal rain that waters crops and refills reservoirs.'
      }
    ]
  },
  {
    chapterNumber: 10,
    chapterTitle: 'Fun at the Fair',
    conceptKey: 'fun-at-the-fair-money',
    title: 'Adding, Subtracting & Shopping at the Village Fair',
    objective: 'Perform simple addition and subtraction with Indian currency (₹10, ₹20, ₹50) to buy toy items and calculate change.',
    story: 'The annual village mela has set up bright canopy stalls! Tara holds a crisp ₹50 note given by her grandfather for the fair. At the toy stall, a wooden spinning top costs ₹20, and a pack of colour crayons costs ₹15. Tara adds them together in her head: ₹20 + ₹15 = ₹35! She hands her ₹50 note to the friendly stallholder. The shopkeeper calculates: ₹50 - ₹35 = ₹15 change! He hands Tara her new top, crayons, and a crisp ₹10 note plus a ₹5 coin. Understanding money math helps us shop wisely and manage our pocket savings!',
    activity: 'Set up a pretend toy shop with labels: ₹5, ₹10, ₹20. Use pretend paper notes to buy two toys and calculate change.',
    guidedSteps: [
      'Add prices: ₹20 top + ₹15 crayons = ₹35.',
      'Subtract from total cash: ₹50 - ₹35 = ₹15 change.',
      'Check coin combinations: ₹10 note + ₹5 coin = ₹15.'
    ],
    teacherPrompt: 'Emphasize real-life financial confidence: counting change carefully before leaving a counter.',
    visualScene: {
      kind: 'fair-stall',
      elements: [
        { id: 'top', label: 'Wooden Top (₹20)', color: '#d97706' },
        { id: 'crayons', label: 'Colour Crayons (₹15)', color: '#10b981' },
        { id: 'note', label: '₹50 Currency Note', color: '#06b6d4' }
      ]
    },
    questions: [
      {
        prompt: 'If you buy a whistle for ₹10 and a balloon for ₹10, how much do you spend in total?',
        options: ['₹20', '₹15', '₹100'],
        answerIndex: 0,
        explanation: '₹10 + ₹10 = ₹20.'
      },
      {
        prompt: 'You give ₹50 to buy an item costing ₹30. How much change should you receive?',
        options: ['₹20', '₹10', '₹5'],
        answerIndex: 0,
        explanation: '₹50 - ₹30 = ₹20 change.'
      },
      {
        prompt: 'Which Indian coin has the highest face value among these?',
        options: ['₹20 coin', '₹5 coin', '₹1 coin'],
        answerIndex: 0,
        explanation: 'The ₹20 coin holds the largest denomination among these three.'
      },
      {
        prompt: 'How many ₹10 notes are needed to make ₹50?',
        options: ['5 notes of ₹10', '2 notes of ₹10', '10 notes of ₹10'],
        answerIndex: 0,
        explanation: '5 times 10 equals 50 (10, 20, 30, 40, 50).'
      }
    ]
  },
  {
    chapterNumber: 11,
    chapterTitle: 'Data Handling',
    conceptKey: 'data-handling-pictographs',
    title: 'Collecting, Tallying & Reading Pictographs',
    objective: 'Organize data in simple pictographs or tally charts, compare categories, and answer analytical questions.',
    story: 'During sports day, Teacher Deepa wants to know which fruit Class 2 students love best. She draws three fruit columns on the blackboard: Mango, Apple, and Banana. Each child walks up and sticks a small star sticker under their favourite fruit. When everyone finishes, the class counts the stars: 8 stars for Mango, 5 stars for Apple, and 7 stars for Banana. Looking at the chart, everyone can see instantly: Mango is the most popular fruit! Turning information into a picture chart makes facts clear, organised, and easy for everyone to understand.',
    activity: 'Ask five family members or friends their favourite colour (Blue, Red, Yellow). Draw a tally chart on paper.',
    guidedSteps: [
      'Count star stickers: Mango = 8, Apple = 5, Banana = 7.',
      'Find the highest count (Most popular): Mango with 8.',
      'Find the total children surveyed: 8 + 5 + 7 = 20 students.'
    ],
    teacherPrompt: 'Introduce pictographs as visual representations of real-world survey data.',
    visualScene: {
      kind: 'pictograph-fruits',
      elements: [
        { id: 'mango', label: 'Mango: ★★★★★★★★ (8)', color: '#f59e0b' },
        { id: 'apple', label: 'Apple: ★★★★★ (5)', color: '#ef4444' },
        { id: 'banana', label: 'Banana: ★★★★★★★ (7)', color: '#eab308' }
      ]
    },
    questions: [
      {
        prompt: 'According to the chart (Mango: 8, Apple: 5, Banana: 7), which fruit had the most votes?',
        options: ['Mango (8 votes)', 'Apple (5 votes)', 'Banana (7 votes)'],
        answerIndex: 0,
        explanation: '8 is the highest number in the chart, making Mango the most popular.'
      },
      {
        prompt: 'How many more children preferred Mangoes (8) over Apples (5)?',
        options: ['3 children', '5 children', '8 children'],
        answerIndex: 0,
        explanation: '8 - 5 = 3 more children.'
      },
      {
        prompt: 'What is a "pictograph"?',
        options: ['A chart that uses pictures or symbols to show counted information', 'A painting made in the dark', 'A broken camera'],
        answerIndex: 0,
        explanation: 'A pictograph uses symbols or icons to represent data counts clearly.'
      },
      {
        prompt: 'What was the total number of children who participated in the fruit survey (8 + 5 + 7)?',
        options: ['20 children', '15 children', '10 children'],
        answerIndex: 0,
        explanation: '8 + 5 = 13, and 13 + 7 = 20 total students.'
      }
    ]
  }
];
