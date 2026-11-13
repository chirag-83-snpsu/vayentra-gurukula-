/**
 * Vayentra Gurukula — Class 1 Mathematics (Joyful Mathematics) Curriculum
 * Official CBSE / NCERT Class 1 Mathematics alignment (2026–27 reference edition).
 * Original Vayentra educational stories, guided steps, offline activities and formative questions.
 * Fully compliant with child safety and copyright guidelines (original authored pedagogical content).
 */

export const GRADE1_MATHS_JOYFUL = {
  edition: '2026-27',
  subjectTitle: 'Mathematics',
  textbookName: 'Joyful Mathematics',
  lessons: [
    {
      chapterNumber: 1,
      chapterTitle: 'Finding the Furry Cat!',
      conceptKey: 'finding-furry-cat',
      title: 'Spatial Relationships: Inside, Outside, Above and Below',
      objective: 'Identify and describe positions of objects using spatial terms (inside/outside, top/bottom, above/below, near/far).',
      story: 'Milo the cat loves playing hide-and-seek! Look around the courtyard: a friendly orange kitten is sitting INSIDE the woven basket, while her brother puppy is resting OUTSIDE on the green grass. High ABOVE on the banyan branch, a yellow kite is fluttering in the breeze. Down BELOW on the path, round pebbles are arranged in a neat row. Knowing words like inside, outside, top, and bottom helps us describe where everything belongs in our wonderful world!',
      activity: 'Take a small bowl and three spoons. Place one spoon INSIDE the bowl and two spoons OUTSIDE. Point and explain to a family member.',
      guidedSteps: [
        'Look at your room: name one object that is ABOVE your head (like the ceiling fan or light).',
        'Name one object that is INSIDE your pencil box.',
        'Practise saying: "near and far", "top and bottom".'
      ],
      guardianGuide: 'Encourage spatial language during daily routines: "Put your shoes under the rack" or "Place the cup on top of the counter".',
      visualScene: {
        kind: 'spatial-play',
        title: 'Courtyard Hide & Seek',
        elements: [
          { id: 'cat', label: 'Cat Inside Basket', color: '#f59e0b' },
          { id: 'kite', label: 'Kite Above Tree', color: '#ef4444' },
          { id: 'pebbles', label: 'Pebbles Below', color: '#64748b' }
        ]
      },
      questions: [
        {
          prompt: 'Where was the orange kitten sitting?',
          options: ['INSIDE the woven basket', 'High in the clouds', 'Under the water'],
          answerIndex: 0,
          explanation: 'The kitten was tucked safely inside the basket.'
        },
        {
          prompt: 'Which word describes a kite flying in the sky compared to the ground?',
          options: ['ABOVE', 'INSIDE', 'UNDER'],
          answerIndex: 0,
          explanation: 'Above means higher up in position.'
        },
        {
          prompt: 'If your pencils are in your school bag, where are they?',
          options: ['INSIDE the bag', 'OUTSIDE on the roof', 'FAR away'],
          answerIndex: 0,
          explanation: 'When objects are held within a container, they are inside.'
        },
        {
          prompt: 'What is the opposite of TOP?',
          options: ['BOTTOM', 'MIDDLE', 'NEAR'],
          answerIndex: 0,
          explanation: 'The opposite of top is bottom.'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'What is Long?',
      conceptKey: 'what-is-long',
      title: 'Comparing Length & Height: Long, Short, Tall',
      objective: 'Compare two or more objects by length and height using direct comparison (longer/shorter, taller/shorter).',
      story: 'Tara and Kabir gathered sticks in the school garden to make boundary markers for their flower bed. Tara found a smooth bamboo stick that was as tall as her shoulder! Kabir found a tiny twig that fit inside his palm. "My stick is LONGER," said Tara with a smile. "And my stick is SHORTER," said Kabir. Next, they looked at the trees: the coconut palm was very TALL, reaching for the clouds, while the rose plant was SHORT and leafy. Comparing lengths helps us build, measure, and create!',
      activity: 'Collect five pencils or crayons. Line them up from the SHORTEST to the LONGEST on your study table.',
      guidedSteps: [
        'Stand back-to-back with a family member. Who is taller and who is shorter?',
        'Look at your hand: compare the length of your thumb and your middle finger.',
        'Practise saying: "longer than", "shorter than", "tallest".'
      ],
      guardianGuide: 'Help early learners line up the baseline (starting edge) of two items evenly before comparing their lengths.',
      visualScene: {
        kind: 'length-comparison',
        title: 'Comparing Lengths in the Garden',
        elements: [
          { id: 'palm', label: 'Tall Palm Tree', color: '#16a34a' },
          { id: 'rose', label: 'Short Rose Bush', color: '#ec4899' },
          { id: 'stick', label: 'Long Bamboo Stick', color: '#ca8a04' }
        ]
      },
      questions: [
        {
          prompt: 'Which word describes a towering coconut tree compared to a rose bush?',
          options: ['TALLER', 'SHORTER', 'LIGHTER'],
          answerIndex: 0,
          explanation: 'A coconut tree extends much higher into the air, making it taller.'
        },
        {
          prompt: 'When comparing the length of two pencils, what must we do first?',
          options: ['Line up their bottom ends evenly', 'Hold them in the dark', 'Break them'],
          answerIndex: 0,
          explanation: 'Both objects must start at the exact same base line to compare length accurately.'
        },
        {
          prompt: 'A train is ______ than a bicycle.',
          options: ['LONGER', 'SHORTER', 'ROUNDER'],
          answerIndex: 0,
          explanation: 'A train has many bogies connected together, making it much longer than a bicycle.'
        },
        {
          prompt: 'What is the opposite of LONG?',
          options: ['SHORT', 'WIDE', 'HEAVY'],
          answerIndex: 0,
          explanation: 'The opposite of long is short.'
        }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Mango Treat',
      conceptKey: 'mango-treat',
      title: 'Counting Numbers 1 to 9 & One-to-One Correspondence',
      objective: 'Count objects up to 9 accurately, recognise numerals 1 to 9, and associate quantities with number symbols.',
      story: 'Under the shady mango tree, ripe golden mangoes fell on the soft grass. Granny brought a wicker basket. "Let us count our sweet harvest!" she said. One mango, two mangoes, three mangoes, four, five! Then Kabir found four more: six, seven, eight, and nine! Exactly 9 juicy sweet mangoes. Granny gave 1 mango to Kabir, 1 to Tara, and 1 to each neighbour. Counting is like singing a rhythm: 1, 2, 3, 4, 5, 6, 7, 8, 9. Each number represents one distinct treasure!',
      activity: 'Collect 9 small dried seeds or buttons. Count them aloud one by one as you move each into a small cup.',
      guidedSteps: [
        'Count the fingers on your left hand: 1, 2, 3, 4, 5!',
        'Show 7 fingers using both hands (5 on one hand and 2 on the other).',
        'Write the numeral 9 in the air with your pointer finger.'
      ],
      guardianGuide: 'Ensure the child touches or moves each object once per count word to reinforce one-to-one matching.',
      visualScene: {
        kind: 'counting-mangoes',
        title: 'Golden Mango Harvest',
        elements: [
          { id: 'mangoes', label: '9 Golden Mangoes', color: '#facc15' },
          { id: 'basket', label: 'Woven Basket', color: '#b45309' },
          { id: 'tree', label: 'Mango Tree', color: '#15803d' }
        ]
      },
      questions: [
        {
          prompt: 'How many fingers do we have on one hand?',
          options: ['5', '8', '10'],
          answerIndex: 0,
          explanation: 'One human hand has 5 fingers (including the thumb).'
        },
        {
          prompt: 'Which number comes immediately after 6 when counting forward?',
          options: ['7', '5', '8'],
          answerIndex: 0,
          explanation: 'When counting: 1, 2, 3, 4, 5, 6, 7. 7 follows 6.'
        },
        {
          prompt: 'If Granny had 9 mangoes in her basket, which numeral represents that amount?',
          options: ['9', '6', '3'],
          answerIndex: 0,
          explanation: 'The symbol 9 represents the quantity of nine items.'
        },
        {
          prompt: 'What does "one-to-one counting" mean?',
          options: ['Touching each item once as we say its number name', 'Skipping two items', 'Counting backwards only'],
          answerIndex: 0,
          explanation: 'Accurate counting requires pairing one count word with exactly one physical object.'
        }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Making 10',
      conceptKey: 'making-10',
      title: 'The Magic of Ten: Tens-Frames & Number Bonds',
      objective: 'Understand 10 as a milestone number, explore number pairs that add up to 10 (1+9, 2+8, 3+7, 4+6, 5+5).',
      story: 'In ancient India, scholars saw that our two hands together have exactly 10 fingers. Ten is a superpower number! Teacher Anand drew a box with 10 squares—five on top and five on the bottom. "This is our Ten-Frame," he explained. Ananya put 7 red beads in the frame. "How many empty squares are left to make 10?" asked Teacher Anand. Ananya counted the three empty spaces: "7 and 3 make 10!" Then Kabir tried: "6 and 4 make 10! 5 and 5 make 10!" Making 10 is the secret key that unlocks all big numbers.',
      activity: 'Draw a ten-frame (two rows of five boxes). Use rajma beans to show three different ways to make 10 (e.g. 8+2, 6+4, 5+5).',
      guidedSteps: [
        'Hold up all 10 fingers. Put down 2 fingers. How many are standing up? (8).',
        'What number paired with 9 makes 10? (1).',
        'Practise saying: "5 and 5 make 10".'
      ],
      guardianGuide: 'Mastery of pairs that make 10 (number bonds to 10) forms the foundation of all mental arithmetic.',
      visualScene: {
        kind: 'ten-frame',
        title: 'Ten-Frame Play',
        elements: [
          { id: 'frame', label: 'Ten-Frame Grid', color: '#38bdf8' },
          { id: 'red-dots', label: '7 Red Dots', color: '#ef4444' },
          { id: 'blue-dots', label: '3 Blue Dots', color: '#3b82f6' }
        ]
      },
      questions: [
        {
          prompt: 'What number added to 7 makes 10?',
          options: ['3', '2', '5'],
          answerIndex: 0,
          explanation: '7 + 3 = 10. 7 red beads and 3 blue beads fill a ten-frame.'
        },
        {
          prompt: 'Which pair of equal numbers makes 10?',
          options: ['5 and 5', '4 and 4', '6 and 6'],
          answerIndex: 0,
          explanation: '5 + 5 = 10. Half of ten is five.'
        },
        {
          prompt: 'If you have 10 chalk sticks and give 1 to your friend, how many do you have left?',
          options: ['9', '8', '11'],
          answerIndex: 0,
          explanation: '10 take away 1 leaves 9.'
        },
        {
          prompt: 'How many boxes does a standard Ten-Frame have?',
          options: ['10 boxes (two rows of 5)', '8 boxes', '12 boxes'],
          answerIndex: 0,
          explanation: 'A ten-frame consists of 10 rectangular boxes arranged as 2 rows of 5.'
        }
      ]
    },
    {
      chapterNumber: 5,
      chapterTitle: 'How Many?',
      conceptKey: 'how-many-teens',
      title: 'Numbers 10 to 20: Grouping in Tens and Ones',
      objective: 'Count, read, and write numbers from 10 to 20; understand teen numbers as "one ten and extra ones".',
      story: 'Farmer Mohan had a bag of fresh carrots. He asked Meena to make bundles of 10. Meena counted ten crunchy carrots and tied them with a jute string: "Here is ONE BUNDLE OF TEN!" Beside the bundle, there were four loose carrots. "One bundle of ten and 4 loose carrots make FOURTEEN (14)!" said Meena proudly. Then Mohan added two more loose carrots: "One ten and 6 ones make SIXTEEN (16)!" Grouping into tens makes counting large numbers fast and easy.',
      activity: 'Take 15 toothpicks or matchsticks (with adult supervision). Bundle 10 with a rubber band. Notice: 1 ten and 5 ones = 15.',
      guidedSteps: [
        'Count from 10 to 20: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20.',
        'What is 13 made of? (1 ten and 3 ones).',
        'What is 20 made of? (2 full bundles of ten).'
      ],
      guardianGuide: 'Help children see teen numbers not just as symbols, but physically as 1 group of ten plus extra ones.',
      visualScene: {
        kind: 'bundling-tens',
        title: 'Bundles of Ten Carrots',
        elements: [
          { id: 'bundle', label: '1 Bundle of 10 Carrots', color: '#ea580c' },
          { id: 'loose', label: '4 Loose Carrots', color: '#f97316' },
          { id: 'string', label: 'Jute String Tie', color: '#a16207' }
        ]
      },
      questions: [
        {
          prompt: 'What is the number 14 made of?',
          options: ['1 ten and 4 ones', '4 tens and 1 one', '14 tens'],
          answerIndex: 0,
          explanation: '14 is one group of ten plus four extra units.'
        },
        {
          prompt: 'Which number is ONE MORE than 17?',
          options: ['18', '16', '19'],
          answerIndex: 0,
          explanation: 'Counting forward: 16, 17, 18. 18 is one more than 17.'
        },
        {
          prompt: 'If you have two full bundles of 10 sticks, how many sticks do you have in total?',
          options: ['20', '12', '10'],
          answerIndex: 0,
          explanation: '2 tens equal 20.'
        },
        {
          prompt: 'Which number is smaller: 12 or 19?',
          options: ['12', '19', 'Both are equal'],
          answerIndex: 0,
          explanation: '12 has 2 ones while 19 has 9 ones; 12 comes earlier on the number line.'
        }
      ]
    },
    {
      chapterNumber: 6,
      chapterTitle: 'Vegetable Farm',
      conceptKey: 'vegetable-farm-addition',
      title: 'Addition up to 20: Putting Together and Adding On',
      objective: 'Understand addition as combining sets or counting on; solve simple contextual addition problems up to 20.',
      story: 'Grandpa’s vegetable patch was bursting with fresh vegetables. Tara plucked 4 bright red tomatoes from the first vine and 5 ripe tomatoes from the second vine. She put them both in her woven basket: 4 + 5 = 9 tomatoes! Then Kabir brought 3 green cucumbers. "Let us add them together!" said Grandpa. 9 tomatoes plus 3 cucumbers: count on—10, 11, 12! Total 12 fresh vegetables! When we put quantities together, the plus sign (+) shows our total grows bigger.',
      activity: 'Take 4 leaves and 6 pebbles from the garden. Put them together in one pile. Count the total (4 + 6 = 10).',
      guidedSteps: [
        'Count on to add: To solve 8 + 3, start at 8 and count forward 3 times: 9, 10, 11!',
        'What happens when you add 0 to any number? (The number stays the same: 7 + 0 = 7).',
        'Practise saying: "3 plus 4 equals 7".'
      ],
      guardianGuide: 'Teach children to count on from the larger number rather than counting all items from 1 each time.',
      visualScene: {
        kind: 'farm-addition',
        title: 'Vegetable Harvest Basket',
        elements: [
          { id: 'tomatoes', label: '9 Red Tomatoes', color: '#ef4444' },
          { id: 'cucumbers', label: '3 Cucumbers', color: '#22c55e' },
          { id: 'plus', label: 'Addition Symbol (+)', color: '#0284c7' }
        ]
      },
      questions: [
        {
          prompt: 'What is 6 + 4?',
          options: ['10', '9', '11'],
          answerIndex: 0,
          explanation: '6 + 4 = 10. They are number bonds to 10.'
        },
        {
          prompt: 'If you have 8 mangoes and pick 3 more, how many do you have in total?',
          options: ['11', '10', '12'],
          answerIndex: 0,
          explanation: 'Count on from 8: 9, 10, 11. Total is 11.'
        },
        {
          prompt: 'What is 15 + 0?',
          options: ['15', '0', '16'],
          answerIndex: 0,
          explanation: 'Adding zero to any number leaves the amount unchanged.'
        },
        {
          prompt: 'Which mathematical sign means "to put together or add"?',
          options: ['+ (plus sign)', '- (minus sign)', '= (equals sign)'],
          answerIndex: 0,
          explanation: 'The plus sign (+) indicates addition.'
        }
      ]
    },
    {
      chapterNumber: 7,
      chapterTitle: "Lina's Family",
      conceptKey: 'linas-family-subtraction',
      title: 'Subtraction up to 20: Taking Away & Finding What Remains',
      objective: 'Understand subtraction as taking away, separating, or finding difference; solve subtraction problems up to 20.',
      story: 'Lina’s mother baked 12 warm sesame cookies for tea time. Lina’s little brother took 2 cookies, and Lina ate 1 cookie with her milk. "How many cookies were taken away?" asked mother. 2 + 1 = 3 cookies taken away! Lina counted the cookies remaining on the floral plate: 12 take away 3 leaves 9! 12 - 3 = 9. When things are eaten, shared, or taken away, the minus sign (-) shows how many are left. Lina smiled: "Nine delicious cookies left for grandmother and father!"',
      activity: 'Place 10 bottle caps in a line. Take away 4 caps and put them behind your back. Count how many caps remain (10 - 4 = 6).',
      guidedSteps: [
        'Count backwards to subtract: To solve 9 - 2, start at 9 and count back 2 steps: 8, 7!',
        'What is 8 take away 8? (0 - nothing is left).',
        'Practise saying: "10 minus 3 equals 7".'
      ],
      guardianGuide: 'Connect subtraction to everyday real experiences like sharing snacks or using up craft supplies.',
      visualScene: {
        kind: 'cookie-subtraction',
        title: 'Cookies on the Plate',
        elements: [
          { id: 'plate', label: 'Cookie Plate', color: '#e2e8f0' },
          { id: 'cookies', label: '9 Remaining Cookies', color: '#d97706' },
          { id: 'crumbs', label: '3 Eaten Cookies', color: '#f59e0b' }
        ]
      },
      questions: [
        {
          prompt: 'What is 10 - 4?',
          options: ['6', '5', '7'],
          answerIndex: 0,
          explanation: '10 take away 4 leaves 6.'
        },
        {
          prompt: 'If there were 12 birds on a branch and 3 flew away, how many birds are still on the branch?',
          options: ['9 birds', '15 birds', '8 birds'],
          answerIndex: 0,
          explanation: '12 - 3 = 9 birds remain.'
        },
        {
          prompt: 'What happens when you subtract zero from a number (like 8 - 0)?',
          options: ['The number remains 8', 'The answer is 0', 'It becomes 7'],
          answerIndex: 0,
          explanation: 'Taking away nothing leaves the original amount intact.'
        },
        {
          prompt: 'Which sign represents subtraction?',
          options: ['- (minus sign)', '+ (plus sign)', '× (multiply sign)'],
          answerIndex: 0,
          explanation: 'The minus sign (-) represents subtraction.'
        }
      ]
    },
    {
      chapterNumber: 8,
      chapterTitle: 'Fun with Numbers',
      conceptKey: 'fun-with-numbers-50',
      title: 'Numbers up to 50: Patterns, Tens & Sequences',
      objective: 'Count, read, sequence, and compare 2-digit numbers up to 50; count by tens (10, 20, 30, 40, 50).',
      story: 'In the school sports ground, Coach Naveen drew a long number hopscotch grid with numbers from 1 to 50! Tara loved jumping by tens: "10, 20, 30, 40, 50—I reached fifty in just five giant leaps!" Kabir noticed number patterns: in the twenties, every number starts with 2 (21, 22, 23...). In the thirties, every number starts with 3 (31, 32, 33...). Numbers follow a beautiful, rhythmic order that never ends!',
      activity: 'Draw a number line from 20 to 30 on paper. Pick a number (e.g. 24) and point to the number that comes before and after it.',
      guidedSteps: [
        'Count by 10s up to 50: 10, 20, 30, 40, 50!',
        'Which number comes right before 30? (29).',
        'Which number comes right after 49? (50).'
      ],
      guardianGuide: 'Use a 100-chart or grid up to 50 to help children visualise columns of tens and rows of ones.',
      visualScene: {
        kind: 'hopscotch-grid',
        title: 'Number Hopscotch to 50',
        elements: [
          { id: 'tens', label: '10, 20, 30, 40, 50 Markers', color: '#0284c7' },
          { id: 'hopscotch', label: 'Hopscotch Grid', color: '#f59e0b' },
          { id: 'runner', label: 'Jumping Milo', color: '#10b981' }
        ]
      },
      questions: [
        {
          prompt: 'Which number comes immediately after 39?',
          options: ['40', '38', '41'],
          answerIndex: 0,
          explanation: 'Counting forward: 38, 39, 40. 40 comes after 39.'
        },
        {
          prompt: 'When counting by tens, what number comes after 30?',
          options: ['40', '35', '50'],
          answerIndex: 0,
          explanation: 'Counting by tens: 10, 20, 30, 40, 50.'
        },
        {
          prompt: 'Which number is larger: 45 or 35?',
          options: ['45 (it has 4 tens)', '35 (it has 3 tens)', 'Both are equal'],
          answerIndex: 0,
          explanation: '45 has 4 tens while 35 has only 3 tens; 45 is larger.'
        },
        {
          prompt: 'What number comes between 28 and 30?',
          options: ['29', '27', '31'],
          answerIndex: 0,
          explanation: '29 sits between 28 and 30 on the number line.'
        }
      ]
    },
    {
      chapterNumber: 9,
      chapterTitle: 'Utsav',
      conceptKey: 'utsav-patterns',
      title: 'Patterns in Shapes, Colours and Rhythms',
      objective: 'Identify, extend, and create repeating visual and numerical patterns in everyday life.',
      story: 'Festival day (Utsav) arrived at Vayentra Gurukula! Grandmother decorated the threshold with a vibrant rangoli pattern: Red flower, Yellow flower, Red flower, Yellow flower! "What comes next, Kabir?" she asked. "A Red flower!" cheered Kabir. Along the veranda, paper lanterns were hung in a sequence: Triangle, Circle, Square, Triangle, Circle, Square! Patterns are everywhere in nature—on a tiger’s stripes, a honeybee’s comb, and the beats of a festival drum: Dhum, Ta, Dhum, Ta!',
      activity: 'Use colour pencils to draw a pattern border: Blue, Green, Blue, Green, Blue, Green on a bookmark.',
      guidedSteps: [
        'Notice the repeating unit (the rule) of a pattern.',
        'Clap a rhythmic sound pattern: Clap, Tap, Clap, Tap!',
        'Create a pattern with spoons and forks on the dining table.'
      ],
      guardianGuide: 'Encourage children to explain the "rule" of the pattern in their own words before completing it.',
      visualScene: {
        kind: 'rangoli-pattern',
        title: 'Festival Rangoli & Lanterns',
        elements: [
          { id: 'flowers', label: 'Red & Yellow Flower Border', color: '#ef4444' },
          { id: 'lanterns', label: 'Geometric Lanterns', color: '#f59e0b' },
          { id: 'drum', label: 'Rhythm Dholak', color: '#8b5cf6' }
        ]
      },
      questions: [
        {
          prompt: 'What comes next in this pattern: Red, Blue, Red, Blue, Red, ______?',
          options: ['Blue', 'Green', 'Yellow'],
          answerIndex: 0,
          explanation: 'The pattern repeats alternately: Red, Blue, Red, Blue.'
        },
        {
          prompt: 'What is the next shape: Circle, Square, Circle, Square, ______?',
          options: ['Circle', 'Triangle', 'Star'],
          answerIndex: 0,
          explanation: 'The sequence repeats Circle, Square, Circle, Square, Circle.'
        },
        {
          prompt: 'Which animal has a natural pattern of stripes on its fur?',
          options: ['Tiger or Zebra', 'Elephant', 'Bear'],
          answerIndex: 0,
          explanation: 'Tigers and zebras have prominent striped patterns on their bodies.'
        },
        {
          prompt: 'What is the next number in this pattern: 2, 4, 6, 8, ______?',
          options: ['10', '9', '12'],
          answerIndex: 0,
          explanation: 'The numbers increase by 2 each time (even numbers).'
        }
      ]
    },
    {
      chapterNumber: 10,
      chapterTitle: 'How do I Spend my Day?',
      conceptKey: 'how-i-spend-my-day',
      title: 'Time & Sequence: Morning, Afternoon, Evening, Night',
      objective: 'Sequence daily events in chronological order; associate activities with parts of the day (morning, afternoon, evening, night).',
      story: 'Every day is a gift of 24 hours that unfolds in four beautiful stages! In the MORNING, the golden sun rises, birds chirp, and we brush our teeth and go to school. In the AFTERNOON, the sun is high and warm; we eat our lunch and read books. In the EVENING, the sky turns orange and pink; we play outside with friends and finish our homework. At NIGHT, stars sparkle, we eat dinner with family, and listen to a peaceful story before drifting into sweet sleep. Doing things at the right time keeps us healthy, bright, and happy!',
      activity: 'Draw four pictures showing what you do in the morning, afternoon, evening, and night.',
      guidedSteps: [
        'When do you have breakfast? (In the morning).',
        'When do stars appear in the sky? (At night).',
        'Practise saying: "earlier", "later", "before", "after".'
      ],
      guardianGuide: 'Help early learners understand time through daily routines rather than mechanical clock reading initially.',
      visualScene: {
        kind: 'daily-routine',
        title: 'Four Stages of the Day',
        elements: [
          { id: 'sun', label: 'Morning Sun', color: '#facc15' },
          { id: 'noon', label: 'Afternoon School', color: '#38bdf8' },
          { id: 'night', label: 'Night Moon & Stars', color: '#1e1b4b' }
        ]
      },
      questions: [
        {
          prompt: 'Which part of the day comes first when we wake up?',
          options: ['Morning', 'Night', 'Afternoon'],
          answerIndex: 0,
          explanation: 'The morning begins our daily waking hours.'
        },
        {
          prompt: 'When do we usually eat our lunch?',
          options: ['In the afternoon', 'In the middle of the night', 'Before sunrise'],
          answerIndex: 0,
          explanation: 'Lunch is the midday meal eaten in the afternoon.'
        },
        {
          prompt: 'What happens BEFORE you go to sleep at night?',
          options: ['We change into nightwear and brush our teeth', 'We eat breakfast', 'The sun rises'],
          answerIndex: 0,
          explanation: 'Evening routines like dinner and brushing happen before bedtime.'
        },
        {
          prompt: 'When is it safe to play outdoor running games with friends?',
          options: ['In the cool evening', 'In the dark midnight', 'During thunderstorm'],
          answerIndex: 0,
          explanation: 'The cool evening is ideal for safe outdoor recreation.'
        }
      ]
    },
    {
      chapterNumber: 11,
      chapterTitle: 'How Many Times?',
      conceptKey: 'how-many-times-measure',
      title: 'Non-Standard Measurement: Handspans, Paces and Balance',
      objective: 'Measure length, height, and distance using body parts (handspan, cubit, paces) and compare weights.',
      story: 'Long before plastic rulers were invented, people used their own bodies to measure! Meena wanted to know how long her study table was. She stretched her fingers wide: from thumb tip to little finger tip is one HANDSPAN. She placed her handspan across the wooden table: 1, 2, 3, 4, 5, 6 handspans long! Then Kabir measured the length of the classroom by walking carefully heel-to-toe: 18 PACES! Next, they held an apple in one hand and a leaf in the other: the apple felt HEAVY, and the leaf felt LIGHT. Comparing sizes and weights makes us thoughtful builders!',
      activity: 'Measure your bed or study desk using your handspan. Write down the number of handspans.',
      guidedSteps: [
        'Stretch your hand wide: your handspan is from thumb to little finger.',
        'Measure the width of a door using your footsteps (paces).',
        'Hold a heavy book in one hand and a pencil in the other: which is heavier?'
      ],
      guardianGuide: 'Explain why handspan measurements can differ between adults and children (because adult hands are larger).',
      visualScene: {
        kind: 'handspan-measurement',
        title: 'Measuring with Handspan',
        elements: [
          { id: 'hand', label: 'Stretched Handspan', color: '#fed7aa' },
          { id: 'table', label: 'Wooden Table', color: '#78350f' },
          { id: 'balance', label: 'Heavy vs Light Scales', color: '#64748b' }
        ]
      },
      questions: [
        {
          prompt: 'What is a "handspan"?',
          options: ['Distance from tip of thumb to tip of little finger', 'The length of an elbow', 'A plastic ruler'],
          answerIndex: 0,
          explanation: 'A handspan is an ancient body unit measured with outstretched fingers.'
        },
        {
          prompt: 'Why might a table measure 8 child handspans but only 5 adult handspans?',
          options: ['Because adult hands are larger than child hands', 'Because the table changed size', 'The child counted wrong'],
          answerIndex: 0,
          explanation: 'Body units vary in size from person to person.'
        },
        {
          prompt: 'Which is heavier: a watermelon or a feather?',
          options: ['A watermelon', 'A feather', 'Both weigh the same'],
          answerIndex: 0,
          explanation: 'A solid watermelon has much more mass than a light bird feather.'
        },
        {
          prompt: 'Which body unit is used to measure long distances on the ground?',
          options: ['Footsteps (paces)', 'Fingernail', 'Eyelash'],
          answerIndex: 0,
          explanation: 'Walking paces are used to measure room lengths or distances.'
        }
      ]
    },
    {
      chapterNumber: 12,
      chapterTitle: 'How Much Can We Spend?',
      conceptKey: 'how-much-can-we-spend',
      title: 'Indian Coins & Notes: Identifying Currency and Small Purchases',
      objective: 'Recognise Indian currency coins (₹1, ₹2, ₹5, ₹10) and notes (₹10, ₹20), understand spending and saving.',
      story: 'Tara and Kabir set up a pretend vegetable stall in the school corridor. Teacher Anand gave each child play currency coins: shiny round ₹1, ₹2, ₹5, and bi-metallic ₹10 coins with the Lion Capital symbol of India. Kabir wanted to buy a bundle of coriander for ₹3. He thought carefully: "I can give one ₹2 coin and one ₹1 coin! 2 + 1 = 3!" Tara bought a red bell pepper for ₹7 using one ₹5 coin and one ₹2 coin. "Money is earned through hard work," said Teacher Anand. "We must spend wisely and save what we can in our piggy bank!"',
      activity: 'Look at real Indian coins at home with a parent. Feel the raised edges and find the Rupee symbol (₹).',
      guidedSteps: [
        'Notice the Indian Rupee symbol: ₹.',
        'Which two coins can you combine to pay ₹3? (₹2 + ₹1).',
        'Which two coins can you combine to pay ₹7? (₹5 + ₹2).'
      ],
      guardianGuide: 'Incorporate coin identification into safe real-world errands like buying milk or coriander.',
      visualScene: {
        kind: 'currency-shop',
        title: 'Pretend Vegetable Market',
        elements: [
          { id: 'coins', label: '₹1, ₹2, ₹5, ₹10 Coins', color: '#94a3b8' },
          { id: 'stall', label: 'Market Stall', color: '#16a34a' },
          { id: 'piggy', label: 'Piggy Bank for Savings', color: '#ec4899' }
        ]
      },
      questions: [
        {
          prompt: 'What is the official symbol of the Indian Rupee?',
          options: ['₹', '$', '€'],
          answerIndex: 0,
          explanation: '₹ is the official symbol for the Indian Rupee.'
        },
        {
          prompt: 'Which two coins together make ₹6?',
          options: ['One ₹5 coin and one ₹1 coin', 'Two ₹2 coins', 'One ₹10 coin'],
          answerIndex: 0,
          explanation: '₹5 + ₹1 = ₹6.'
        },
        {
          prompt: 'If an eraser costs ₹4 and you pay with a ₹5 coin, how much change should you receive?',
          options: ['₹1', '₹2', '₹0'],
          answerIndex: 0,
          explanation: '₹5 - ₹4 = ₹1 change.'
        },
        {
          prompt: 'What is a wise habit to develop with pocket money?',
          options: ['Saving some in a piggy bank for future needs', 'Spending everything on junk food', 'Throwing coins away'],
          answerIndex: 0,
          explanation: 'Saving money teaches self-discipline and financial responsibility.'
        }
      ]
    },
    {
      chapterNumber: 13,
      chapterTitle: 'So Many Toys',
      conceptKey: 'so-many-toys-data',
      title: 'Data Handling: Sorting, Categorising & Pictographs',
      objective: 'Sort objects by attributes (type, colour, size); count and record frequencies in simple pictograph tables.',
      story: 'After sports day, the kindergarten toy chest was completely mixed up! Wooden building blocks, yellow rubber balls, blue toy cars, and stuffed teddy bears were jumbled together. Teacher Anand clapped his hands: "Let us organise like junior scientists!" Kabir sorted all the TOY CARS into one basket: 1, 2, 3, 4 cars! Meena sorted all the RUBBER BALLS into another basket: 1, 2, 3, 4, 5, 6 balls! Tara counted 3 teddy bears. When they drew a picture chart on the chalkboard, everyone could see at a single glance: "We have the most balls, and the fewest teddy bears!" Sorting makes chaos into calm order.',
      activity: 'Sort your footwear rack at home: count how many pairs are slippers, and how many are school shoes.',
      guidedSteps: [
        'Sort objects by colour (all reds together, all blues together).',
        'Sort objects by type (all spoons together, all plates together).',
        'Which group has the MOST items? Which group has the LEAST?'
      ],
      guardianGuide: 'Ask comparative questions: "How many more cars than bears?" to build relational reasoning.',
      visualScene: {
        kind: 'data-sorting',
        title: 'Toy Chest Sorting Chart',
        elements: [
          { id: 'cars', label: '4 Blue Cars', color: '#3b82f6' },
          { id: 'balls', label: '6 Yellow Balls', color: '#facc15' },
          { id: 'bears', label: '3 Teddy Bears', color: '#a16207' }
        ]
      },
      questions: [
        {
          prompt: 'If there are 6 balls, 4 cars, and 3 bears, which toy group has the MOST items?',
          options: ['Balls (6 items)', 'Cars (4 items)', 'Bears (3 items)'],
          answerIndex: 0,
          explanation: '6 is the largest quantity among 6, 4, and 3.'
        },
        {
          prompt: 'Which toy group has the FEWEST (least) items?',
          options: ['Bears (3 items)', 'Cars (4 items)', 'Balls (6 items)'],
          answerIndex: 0,
          explanation: '3 is the smallest quantity.'
        },
        {
          prompt: 'What does "sorting" mean?',
          options: ['Grouping similar items together by colour, size, or type', 'Throwing things into a pile', 'Breaking toys'],
          answerIndex: 0,
          explanation: 'Sorting means organising objects into categories based on shared features.'
        },
        {
          prompt: 'How many MORE balls (6) are there than cars (4)?',
          options: ['2 more (6 - 4 = 2)', '4 more', '1 more'],
          answerIndex: 0,
          explanation: '6 - 4 = 2. There are 2 more balls than cars.'
        }
      ]
    }
  ]
};
