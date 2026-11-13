/**
 * Vayentra Gurukula — Class 2 English (Mridang) Curriculum Data
 * Official NCERT Mridang Class 2 Alignment (Chapters 3 to 10).
 * Original Vayentra authored stories, interactive guided steps, offline home activities, and formative questions.
 */

export const GRADE2_ENGLISH_MRIDANG_LESSONS = [
  {
    chapterNumber: 3,
    chapterTitle: 'It is Fun',
    conceptKey: 'it-is-fun-actions',
    title: 'Playful Action Verbs & Rhyming Games',
    objective: 'Identify and demonstrate common action verbs (leap, hop, skip, twirl) and match rhyming pairs.',
    story: 'Recess time at the school courtyard is full of laughter! Look at the children playing: Aarav can HOP like a quick green frog. Diya can LEAP over the chalk boundary line. Kabir TWIRLS like a cheerful top on the grass. When we run, dance, jump, and bend, our bodies stay energetic and strong. Doing words like hop, leap, skip, and swing tell us what people and animals are doing. They make our stories lively and full of joy!',
    activity: 'Stand up safely. Have a family member call out action words: "Hop!", "Twirl!", "Freeze!". Act each one out with a big smile.',
    guidedSteps: [
      'Act out three action words: Skip, Hop, Twirl.',
      'Find the rhyming pair: Hop and Pop, Fun and Run.',
      'Make a complete sentence: "I like to _____ in the garden."'
    ],
    teacherPrompt: 'Prompt learners to distinguish between naming words (nouns) and action words (verbs).',
    visualScene: {
      kind: 'playground-actions',
      elements: [
        { id: 'frog-hop', label: 'Hopping Frog', color: '#16a34a' },
        { id: 'jumping-child', label: 'Child Leaping', color: '#3b82f6' },
        { id: 'spinning-top', label: 'Spinning Top', color: '#f59e0b' }
      ]
    },
    questions: [
      {
        prompt: 'Which of these is a doing word (action verb)?',
        options: ['Hop', 'Bench', 'Grass'],
        answerIndex: 0,
        explanation: 'Hop is an action that someone can do.'
      },
      {
        prompt: 'Which word rhymes with "fun"?',
        options: ['Run', 'Cat', 'Big'],
        answerIndex: 0,
        explanation: 'Fun and Run end in the same "-un" sound.'
      },
      {
        prompt: 'How does a frog move across a lily pad?',
        options: ['By hopping', 'By driving a car', 'By flying with wings'],
        answerIndex: 0,
        explanation: 'Frogs use their strong hind legs to hop and leap.'
      },
      {
        prompt: 'Why is physical play good for growing children?',
        options: ['It keeps bodies energetic, flexible, and healthy', 'It makes us lazy', 'It breaks our toys'],
        answerIndex: 0,
        explanation: 'Active play strengthens muscles, bones, and heart health.'
      }
    ]
  },
  {
    chapterNumber: 4,
    chapterTitle: 'Seeing without Seeing',
    conceptKey: 'seeing-without-seeing',
    title: 'Exploring Through Touch, Sound & Empathy',
    objective: 'Understand how people who cannot see perceive the world using touch, sound, and smell, fostering inclusion and empathy.',
    story: 'Meera wears a cloth blindfold during a friendly classroom game. At first, the darkness feels strange. But soon, her ears notice the quiet ticking of the wall clock. Her hands touch the waxy leaf of a potted plant. Her nose smells fresh jasmine flowers near the window. Her classmate Rohan explains that people with visual impairment read using a special tactile script called Braille, where raised dots represent letters. Seeing without eyes means listening with attention, feeling with gentle fingers, and treating everyone with kindness.',
    activity: 'Close your eyes. Run your fingers over three different fabrics at home (cotton, wool, silk). Describe how each one feels.',
    guidedSteps: [
      'Close your eyes for 30 seconds and list three sounds you hear in your room.',
      'Explore how raised dots help people read Braille books.',
      'Practice asking politely: "May I assist you?" when someone needs guidance.'
    ],
    teacherPrompt: 'Cultivate empathy and respectful language towards persons with diverse physical abilities.',
    visualScene: {
      kind: 'sensory-empathy',
      elements: [
        { id: 'braille', label: 'Raised Braille Dots', color: '#6366f1' },
        { id: 'flower', label: 'Fragrant Jasmine', color: '#e2e8f0' },
        { id: 'bell-sound', label: 'Sound Waves', color: '#06b6d4' }
      ]
    },
    questions: [
      {
        prompt: 'What special script uses raised dots that people read with their fingertips?',
        options: ['Braille', 'Cartoons', 'Secret codes only'],
        answerIndex: 0,
        explanation: 'Braille is an embossed dot alphabet read by touch.'
      },
      {
        prompt: 'Which senses helped Meera explore the room when her eyes were blindfolded?',
        options: ['Hearing, touch, and smell', 'Taste only', 'None at all'],
        answerIndex: 0,
        explanation: 'Our ears, fingers, and nose give rich clues about our surroundings.'
      },
      {
        prompt: 'How should we treat friends with visual impairments?',
        options: ['With respect, friendship, and gentle assistance', 'By making fun of them', 'By avoiding them'],
        answerIndex: 0,
        explanation: 'Empathy, inclusion, and warmth make our school community welcoming.'
      },
      {
        prompt: 'What does sensory awareness teach us?',
        options: ['To listen and observe the world more carefully', 'To talk loudly', 'To ignore our friends'],
        answerIndex: 0,
        explanation: 'Focusing on our senses helps us understand our environment deeply.'
      }
    ]
  },
  {
    chapterNumber: 5,
    chapterTitle: 'Come Back, Cat!',
    conceptKey: 'come-back-cat',
    title: 'Positional Words & Animal Care',
    objective: 'Use prepositions of place (under, behind, on, inside) to track a wandering pet.',
    story: 'Where is Chotu the kitten? Grandmother is searching with her silver spectacles! Chotu is not ON the cushioned chair. He is not UNDER the woven cot. Grandfather checks BEHIND the kitchen cupboard. Suddenly, a soft "Meow!" comes from INSIDE the laundry basket! Chotu is curled up warmly between clean towels. When caring for pets, we must keep safe boundaries, provide fresh food and clean water, and check warm corners where small kittens love to nap.',
    activity: 'Hide a soft toy in your living room. Give three positional clues to a sibling (e.g., "It is UNDER the pillow").',
    guidedSteps: [
      'Say the position words: Under, On, Behind, Inside.',
      'Find the word that tells where Chotu was hiding: Inside the basket.',
      'Draw a cat sitting ON a mat and a ball UNDER a stool.'
    ],
    teacherPrompt: 'Review prepositions of location with classroom objects: inside the bag, on the desk.',
    visualScene: {
      kind: 'cat-positions',
      elements: [
        { id: 'basket', label: 'Woven Basket', color: '#ca8a04' },
        { id: 'chotu', label: 'Curled Kitten', color: '#f97316' },
        { id: 'chair', label: 'Cushioned Chair', color: '#8b5cf6' }
      ]
    },
    questions: [
      {
        prompt: 'Where was Chotu the kitten finally found sleeping?',
        options: ['INSIDE the laundry basket', 'On the ceiling fan', 'In the river'],
        answerIndex: 0,
        explanation: 'Chotu was curled up safely inside the woven basket.'
      },
      {
        prompt: 'Which word in "The kitten is under the bed" tells us the position?',
        options: ['Under', 'Kitten', 'Bed'],
        answerIndex: 0,
        explanation: '"Under" is a preposition of place showing position.'
      },
      {
        prompt: 'What must we always provide for our domestic pets?',
        options: ['Clean water, healthy food, and gentle care', 'Sweet candy only', 'Cold stones'],
        answerIndex: 0,
        explanation: 'Pets need fresh water, nutritious meals, and safe shelter.'
      },
      {
        prompt: 'What is the opposite of INSIDE?',
        options: ['OUTSIDE', 'BESIDE', 'ABOVE'],
        answerIndex: 0,
        explanation: 'Outside is the direct antonym of inside.'
      }
    ]
  },
  {
    chapterNumber: 6,
    chapterTitle: 'Between Home and School',
    conceptKey: 'between-home-and-school',
    title: 'Neighbourhood Landmarks & Road Safety',
    objective: 'Describe routes, recognize community landmarks, and apply safe pedestrian rules on the way to school.',
    story: 'Every morning, Ravi and his mother walk from their yellow front gate to the primary school. Along the way, they pass three familiar landmarks: the fragrant bakery where loaves of bread are baking, the tall banyan tree with hanging aerial roots, and the green pedestrian crossing near the traffic signal. Mother teaches Ravi the pedestrian rhyme: "Look to your right, look to your left, and look to your right again before stepping forward." Knowing our neighbourhood helps us stay safe and observant.',
    activity: 'Draw a simple map of your path from your bedroom to the kitchen or from your house to the school gate.',
    guidedSteps: [
      'Name two landmarks you see when you travel to school.',
      'Recite the zebra-crossing rule: Stop, Look, and Listen.',
      'Identify traffic light colours: Red means Stop, Green means Go.'
    ],
    teacherPrompt: 'Emphasize road safety: always hold an adult’s hand when crossing streets.',
    visualScene: {
      kind: 'school-walk',
      elements: [
        { id: 'crossing', label: 'Zebra Crossing', color: '#f1f5f9' },
        { id: 'banyan', label: 'Big Banyan Tree', color: '#15803d' },
        { id: 'bakery', label: 'Fresh Bakery Shop', color: '#d97706' }
      ]
    },
    questions: [
      {
        prompt: 'Where should pedestrians safely cross a busy road?',
        options: ['At the zebra crossing with an adult', 'Anywhere between running cars', 'In the dark'],
        answerIndex: 0,
        explanation: 'Zebra crossings are marked safe zones for pedestrian crossings.'
      },
      {
        prompt: 'What should we do before stepping onto a road?',
        options: ['Stop, look right, look left, and listen', 'Close our eyes and run', 'Look only at our shoes'],
        answerIndex: 0,
        explanation: 'Checking traffic both ways keeps us safe from moving vehicles.'
      },
      {
        prompt: 'What is a "landmark"?',
        options: ['A well-known building, tree, or place that helps us find our way', 'A secret hole', 'A television programme'],
        answerIndex: 0,
        explanation: 'Landmarks are recognizable features used for navigation.'
      },
      {
        prompt: 'What does a red traffic light signal for drivers?',
        options: ['Stop', 'Go very fast', 'Turn around'],
        answerIndex: 0,
        explanation: 'Red always means STOP for road vehicles.'
      }
    ]
  },
  {
    chapterNumber: 7,
    chapterTitle: 'This is My Town',
    conceptKey: 'this-is-my-town',
    title: 'Community Places & Public Helpers',
    objective: 'Identify key community places (hospital, library, market, fire station) and describe their societal purpose.',
    story: 'Welcome to our town! In the town square, the public library is filled with colourful storybooks where children read quietly. Down the street, the government health clinic has doctors and nurses who treat people when they have a fever. Across the park, the post office sorts letters and parcels into leather bags. In the town market, vendors sell shiny red apples, purple brinjals, and golden bananas. A town is not just bricks and cement; it is a community of people working together with care and cooperation.',
    activity: 'List four public buildings in your town or village. Draw a sign board for your favourite place.',
    guidedSteps: [
      'Match the place to its helper: Clinic -> Doctor, Library -> Librarian, Post Office -> Postman.',
      'Explain why keeping public places clean is every citizen\'s duty.',
      'Practice saying: "Thank you for serving our community."'
    ],
    teacherPrompt: 'Discuss civic responsibility and pride in public facilities.',
    visualScene: {
      kind: 'town-community',
      elements: [
        { id: 'library', label: 'Town Library', color: '#3b82f6' },
        { id: 'clinic', label: 'Health Clinic', color: '#ef4444' },
        { id: 'market', label: 'Fruit Market', color: '#22c55e' }
      ]
    },
    questions: [
      {
        prompt: 'Where do people go to borrow books and read quietly?',
        options: ['The public library', 'The petrol pump', 'The cinema hall'],
        answerIndex: 0,
        explanation: 'Libraries are quiet community centres filled with books.'
      },
      {
        prompt: 'Who helps us at the town clinic when we feel sick?',
        options: ['Doctors and nurses', 'Bus conductors', 'Carpenters'],
        answerIndex: 0,
        explanation: 'Medical professionals provide care and treatment at health clinics.'
      },
      {
        prompt: 'How can citizens keep their town clean and pleasant?',
        options: ['By throwing trash into public dustbins', 'By littering on the footpath', 'By breaking streetlights'],
        answerIndex: 0,
        explanation: 'Responsible citizens always dispose of waste in designated bins.'
      },
      {
        prompt: 'Why are markets important in a town?',
        options: ['They allow farmers and traders to sell fresh food and essentials', 'They have no purpose', 'They are only for playing hide and seek'],
        answerIndex: 0,
        explanation: 'Markets connect producers and families for daily groceries.'
      }
    ]
  },
  {
    chapterNumber: 8,
    chapterTitle: 'A Show of Hands',
    conceptKey: 'a-show-of-hands',
    title: 'Teamwork, Democracy & Classroom Decisions',
    objective: 'Understand how groups make fair decisions by raising hands, taking turns, and respecting majority choices.',
    story: 'Class 2 has a fun choice to make today! Teacher Ananya asks: "Should we hear a folktale about an elephant, or learn a song about raindrops?" All the children listen politely. "Let us take a show of hands," says the teacher. Seven children raise their hands for the elephant tale, while twelve children raise their hands for the rain song. "The rain song has more votes!" laughs the teacher. Even the children who wanted the elephant story smile and clap along. Raising hands teaches us fairness, patience, and good teamwork.',
    activity: 'Hold a family vote on which vegetable to cook for dinner or what board game to play tonight.',
    guidedSteps: [
      'Count hands raised: compare 7 and 12.',
      'Discuss why taking turns to speak shows politeness.',
      'Practice being a gracious team member when your choice does not win.'
    ],
    teacherPrompt: 'Connect raising hands to early democratic thinking and cooperative learning.',
    visualScene: {
      kind: 'classroom-vote',
      elements: [
        { id: 'teacher', label: 'Teacher Listening', color: '#0ea5e9' },
        { id: 'hands', label: 'Raised Hands', color: '#f59e0b' },
        { id: 'blackboard', label: 'Vote Tally', color: '#334155' }
      ]
    },
    questions: [
      {
        prompt: 'Why did the children raise their hands in the classroom?',
        options: ['To vote fairly on what activity to choose', 'Because they were tired', 'To swat flies'],
        answerIndex: 0,
        explanation: 'A show of hands is a fair way for a group to vote on choices.'
      },
      {
        prompt: 'If 12 children vote for a song and 7 vote for a story, which choice has more votes?',
        options: ['The rain song (12 votes)', 'The story (7 votes)', 'They are equal'],
        answerIndex: 0,
        explanation: '12 is greater than 7, so the rain song received the majority.'
      },
      {
        prompt: 'What should we do if our favourite option does not win the vote?',
        options: ['Cooperate cheerfully and enjoy the chosen group activity', 'Cry and throw pencils', 'Refuse to participate'],
        answerIndex: 0,
        explanation: 'Good teamwork means respecting the group decision with a positive attitude.'
      },
      {
        prompt: 'Why should only one person speak at a time in class?',
        options: ['So everyone can listen and understand clearly', 'So it gets noisy', 'It does not matter'],
        answerIndex: 0,
        explanation: 'Listening attentively while others speak shows respect.'
      }
    ]
  },
  {
    chapterNumber: 9,
    chapterTitle: 'Out in the Garden',
    conceptKey: 'out-in-the-garden',
    title: 'Descriptive Words (Adjectives) & Nature Wonders',
    objective: 'Use sensory adjectives (fragrant, velvety, fluttery, glossy) to describe flowers, leaves, and garden creatures.',
    story: 'Early morning in the school herbal garden is pure magic. Tara touches the velvety petals of a red rose. Nearby, a tiny emerald-green caterpillar nibbles the edge of a fresh leaf. A busy honeybee with fuzzy golden stripes buzzes softly from bloom to bloom, sipping sweet nectar. In the damp soil, an earthworm wriggles gently, helping turn the earth rich and fertile. When we describe things with colour words, shape words, and feeling words, our language blossoms like a spring garden!',
    activity: 'Collect three fallen leaves from outside. Describe their colours, shapes (oval, pointed), and textures (rough, smooth).',
    guidedSteps: [
      'Find the describing words: Velvety rose, Fuzzy bee, Damp soil.',
      'Name two beneficial garden insects that help plants grow.',
      'Explain why we should observe flowers gently without plucking them.'
    ],
    teacherPrompt: 'Highlight how adjectives make prose vivid and evocative for early readers.',
    visualScene: {
      kind: 'garden-nature',
      elements: [
        { id: 'rose', label: 'Velvety Red Rose', color: '#e11d48' },
        { id: 'bee', label: 'Fuzzy Honeybee', color: '#eab308' },
        { id: 'leaf', label: 'Glossy Green Leaf', color: '#16a34a' }
      ]
    },
    questions: [
      {
        prompt: 'Which word in "The fuzzy honeybee buzzed" is a describing word (adjective)?',
        options: ['Fuzzy', 'Buzzed', 'Bee'],
        answerIndex: 0,
        explanation: '"Fuzzy" describes how the bee looks and feels.'
      },
      {
        prompt: 'How do honeybees help flowering plants in the garden?',
        options: ['They help pollinate flowers while gathering nectar', 'They eat the roots', 'They break the branches'],
        answerIndex: 0,
        explanation: 'Bees carry pollen between blossoms, helping plants create seeds and fruits.'
      },
      {
        prompt: 'Why should we admire garden flowers without plucking them unnecessarily?',
        options: ['Flowers feed bees and beautify nature when left on the stem', 'Flowers bite people', 'Flowers dislike sunlight'],
        answerIndex: 0,
        explanation: 'Leaving blooms on plants preserves ecosystems and nectar for insects.'
      },
      {
        prompt: 'Which of these pairs represents opposite textures?',
        options: ['Rough and Smooth', 'Red and Green', 'Tall and Fast'],
        answerIndex: 0,
        explanation: 'Rough and smooth are direct antonyms of touch and texture.'
      }
    ]
  },
  {
    chapterNumber: 10,
    chapterTitle: 'The Elephant and the Dog',
    conceptKey: 'elephant-and-dog',
    title: 'True Friendship & Animal Bonds',
    objective: 'Comprehend a classic story of unconditional friendship, read for story sequence, and discuss loyalty.',
    story: 'In the royal stable lived a mighty elephant named Airavata. One day, a skinny, hungry stray dog wandered into the stable looking for food. Instead of chasing the dog away, the gentle elephant shared his sweet sugarcane and fresh bananas. The two became inseparable friends! They bathed together in the river and slept side by side. When a villager bought the dog and took him far away, both animals refused to eat out of sorrow. Seeing their deep love, the king ordered the dog returned immediately! True friendship knows no size, shape, or difference.',
    activity: 'Tell a friend or sibling what you appreciate most about your friendship.',
    guidedSteps: [
      'Retell the beginning, middle, and end of the elephant and dog story.',
      'Explain why the elephant shared his food with the little dog.',
      'Discuss how true friends care for each other in good times and hard times.'
    ],
    teacherPrompt: 'Emphasize values of generosity, empathy across differences, and emotional bonding.',
    visualScene: {
      kind: 'elephant-friendship',
      elements: [
        { id: 'elephant', label: 'Gentle Elephant Airavata', color: '#475569' },
        { id: 'dog', label: 'Playful Little Dog', color: '#d97706' },
        { id: 'sugarcane', label: 'Sweet Sugarcane', color: '#65a30d' }
      ]
    },
    questions: [
      {
        prompt: 'What did the gentle elephant share with the hungry stray dog?',
        options: ['Sugarcane and sweet bananas', 'Dry stones', 'Chilli peppers'],
        answerIndex: 0,
        explanation: 'The kind elephant shared his own food with the hungry dog.'
      },
      {
        prompt: 'What happened when the dog was taken far away from the elephant?',
        options: ['Both animals missed each other and stopped eating', 'They forgot about each other', 'They rejoiced'],
        answerIndex: 0,
        explanation: 'Their bond was so deep that both became sad when separated.'
      },
      {
        prompt: 'What important moral does this story teach children?',
        options: ['True friendship values love and kindness beyond size or species', 'Only identical animals can be friends', 'Sharing is bad'],
        answerIndex: 0,
        explanation: 'Friendship is built on mutual kindness, sharing, and loyalty.'
      },
      {
        prompt: 'Who ordered the dog to be returned to his elephant friend?',
        options: ['The compassionate king', 'The gatekeeper', 'The forest bird'],
        answerIndex: 0,
        explanation: 'The king recognized their genuine bond and reunited them.'
      }
    ]
  }
];
