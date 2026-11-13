/**
 * Vayentra Gurukula — Class 2 Environmental Studies (The World Around Us) Curriculum Data
 * Official NCERT Class 2 EVS Alignment (Chapters 3 to 7).
 * Original Vayentra authored stories, interactive guided steps, offline home activities, and formative questions.
 */

export const GRADE2_EVS_WORLD_AROUND_US_LESSONS = [
  {
    chapterNumber: 3,
    chapterTitle: 'Plants: From Tiny Seed to Sturdy Tree',
    conceptKey: 'plants-seed-to-tree',
    title: 'The Secret Life of Plants: Roots, Leaves & Seed Sprouting',
    objective: 'Identify plant parts (root, stem, leaf, blossom, fruit) and explain what seeds need to germinate (soil, water, warmth, air).',
    story: 'In a clay pot on the school balcony, Kabir tucks a brown bean seed under soft garden soil. Every morning, he sprinkles a little water and lets the pot soak in gentle morning sunlight. After four days, something wondrous happens: a pale green sprout pushes through the soil! Beneath the ground, white roots spread to anchor the plant and drink mineral water. Above the ground, a tender stem lifts two heart-shaped leaves toward the sky. Plants are living wonders that give us clean air, sweet fruits, and cool green shade!',
    activity: 'Place two dried chickpeas in a moist cotton ball on a small plate. Watch them sprout over three days and sketch the roots.',
    guidedSteps: [
      'Name five main plant parts: Root, Stem, Leaf, Flower, Fruit.',
      'List what seeds need to sprout: Moisture, Soil, Sunlight, Air.',
      'Explain how green leaves make food using sunshine.'
    ],
    teacherPrompt: 'Guide children to appreciate plants as living organisms that nourish planet Earth.',
    visualScene: {
      kind: 'plant-growth',
      elements: [
        { id: 'roots', label: 'Spreading Roots', color: '#92400e' },
        { id: 'stem', label: 'Green Stem', color: '#16a34a' },
        { id: 'sun', label: 'Warm Sunlight', color: '#f59e0b' }
      ]
    },
    questions: [
      {
        prompt: 'Which part of the plant grows under the soil to drink water and hold it firmly?',
        options: ['Roots', 'Flowers', 'Fruits'],
        answerIndex: 0,
        explanation: 'Roots absorb water and nutrients from the soil and anchor the plant.'
      },
      {
        prompt: 'What four things does a tiny seed need to germinate into a healthy seedling?',
        options: ['Water, soil, sunlight, and air', 'Plastic and soda', 'Darkness and cold ice only'],
        answerIndex: 0,
        explanation: 'Seeds require moisture, warmth from sunlight, air, and nutrient-rich soil.'
      },
      {
        prompt: 'Which plant part is often called the "kitchen of the plant" because it makes food?',
        options: ['The green leaves', 'The dry bark', 'The stone nearby'],
        answerIndex: 0,
        explanation: 'Leaves absorb sunlight and carbon dioxide to synthesize food for the plant.'
      },
      {
        prompt: 'Why are trees essential for all living creatures on Earth?',
        options: ['They release clean oxygen to breathe and provide food and shade', 'They make roads bumpy', 'They do nothing'],
        answerIndex: 0,
        explanation: 'Trees produce the oxygen we breathe and sustain biodiversity.'
      }
    ]
  },
  {
    chapterNumber: 4,
    chapterTitle: 'Animal Friends & Their Habitats',
    conceptKey: 'animal-friends-habitats',
    title: 'Animals Around Us: Wild, Domestic & Water Dwellers',
    objective: 'Classify animals by where they live (land, water, sky) and distinguish domestic helpers from protected wild creatures.',
    story: 'Our world is teeming with wonderful animal friends! In the village courtyard, cows graze peacefully on green fodder, providing fresh milk. In the pond, iridescent silver fish swim using fins, while frogs hop between land and water. High in the mango canopy, green parrots with red curved beaks flutter and call. Far away in protected forest reserves, majestic tigers and elephants live freely in their natural jungle habitat. Every creature, whether small like a honeybee or large like an elephant, has a special home and role in nature\'s family.',
    activity: 'Draw three circles labelled: Land, Water, Sky. Place animal sketches (Dog, Fish, Bird) into the correct circle.',
    guidedSteps: [
      'Classify animals: Domestic (Cow, Dog, Goat) vs Wild (Tiger, Deer, Bear).',
      'Identify animal homes: Birds build nests, bees build hives, rabbits dig burrows.',
      'Discuss why we must protect wildlife and never harm natural habitats.'
    ],
    teacherPrompt: 'Instill conservation ethics: wildlife belongs in wild habitats, not in small cages.',
    visualScene: {
      kind: 'animal-habitats',
      elements: [
        { id: 'cow', label: 'Domestic Cow', color: '#b45309' },
        { id: 'fish', label: 'River Fish', color: '#0284c7' },
        { id: 'parrot', label: 'Canopy Parrot', color: '#22c55e' }
      ]
    },
    questions: [
      {
        prompt: 'Which animal lives both in water and on land?',
        options: ['A frog', 'A monkey', 'An eagle'],
        answerIndex: 0,
        explanation: 'Frogs are amphibians that can swim in water and hop on land.'
      },
      {
        prompt: 'Which of these is a domestic animal that lives alongside humans?',
        options: ['A dairy cow', 'A wild leopard', 'A crocodile'],
        answerIndex: 0,
        explanation: 'Cows are domestic companions providing milk and helping in farming.'
      },
      {
        prompt: 'Where do wild animals like tigers and bears belong?',
        options: ['Freely in protected natural forests', 'Inside tiny pet boxes', 'In shopping malls'],
        answerIndex: 0,
        explanation: 'Wild animals thrive naturally in forest and wilderness reserves.'
      },
      {
        prompt: 'How can children show kindness to neighbourhood birds during hot summers?',
        options: ['Leave a shallow earthen dish of clean drinking water outside', 'Throw stones at their nests', 'Chase them away'],
        answerIndex: 0,
        explanation: 'Providing fresh water in summer helps birds stay hydrated and cool.'
      }
    ]
  },
  {
    chapterNumber: 5,
    chapterTitle: 'Water in Our Everyday World',
    conceptKey: 'water-everyday-world',
    title: 'Water of Life: Sources, Everyday Uses & Conservation',
    objective: 'Recognize freshwater sources (rain, rivers, wells, lakes) and commit to daily water-saving habits.',
    story: 'Where does the water in our kitchen tap come from? When monsoon clouds gather, rain pours down from the sky, filling rivers, lakes, and underground aquifers. Water cleans our bodies, quenches our thirst, cooks our daily meals, and helps farmers grow rice and vegetables. But clean drinking water is precious and limited. Rohan always turns off the tap while scrubbing soap on his hands. His family collects rainwater from the terrace to water their garden. When we respect water, we protect life for tomorrow!',
    activity: 'Count how many buckets of water your household uses in a single morning. Think of one way to save half a bucket.',
    guidedSteps: [
      'Name three natural water sources: Rain, Rivers, Lakes.',
      'Demonstrate turning taps off completely so no drops leak.',
      'Explain why drinking water must always be boiled or filtered cleanly.'
    ],
    teacherPrompt: 'Emphasize water as a shared community resource that must never be wasted or contaminated.',
    visualScene: {
      kind: 'water-conservation',
      elements: [
        { id: 'rain', label: 'Rain Clouds', color: '#38bdf8' },
        { id: 'tap', label: 'Tight Tap (No Leaks)', color: '#0284c7' },
        { id: 'lake', label: 'Freshwater Lake', color: '#0369a1' }
      ]
    },
    questions: [
      {
        prompt: 'What is the main natural source of fresh water on Earth?',
        options: ['Rain', 'Factory pipes', 'Salt in rocks'],
        answerIndex: 0,
        explanation: 'Rainfall replenishes rivers, lakes, reservoirs, and underground wells.'
      },
      {
        prompt: 'What should we do while brushing our teeth or soaping our hands?',
        options: ['Keep the water tap turned off', 'Let the water run into the drain continuously', 'Leave the room with tap open'],
        answerIndex: 0,
        explanation: 'Turning the tap off saves litres of clean water every day.'
      },
      {
        prompt: 'Why should drinking water be filtered or boiled?',
        options: ['To remove invisible germs and keep us safe from illness', 'To make it turn blue', 'To make it hot only'],
        answerIndex: 0,
        explanation: 'Filtering or boiling purifies water from harmful bacteria and contaminants.'
      },
      {
        prompt: 'Can plants survive without water?',
        options: ['No, plants wither and dry up without water', 'Yes, plants never need water', 'Plants drink milk only'],
        answerIndex: 0,
        explanation: 'All plants need water to transport nutrients and maintain cellular life.'
      }
    ]
  },
  {
    chapterNumber: 6,
    chapterTitle: 'Air, Weather and Seasons',
    conceptKey: 'air-weather-seasons',
    title: 'The Invisible Blanket: Air, Wind & Seasonal Rhythms',
    objective: 'Demonstrate that air is all around us, occupies space, moves as wind, and influences weather patterns.',
    story: 'We cannot see air with our eyes, but we can feel it everywhere! When Pooja blows into a flat rubber balloon, the balloon expands round and plump—air is taking up space inside! When she holds a paper windmill in the breeze, the blades spin rapidly—moving air is called WIND. A gentle breeze cools our skin on a warm afternoon, while strong storm winds can sway sturdy tree branches. Air keeps birds aloft, helps sailing boats glide, and gives living creatures the breath of life.',
    activity: 'Make a simple paper pinwheel or fan from folded scrap paper. Wave it near your face to feel the moving air.',
    guidedSteps: [
      'Blow up a paper bag or balloon: see how air occupies space.',
      'Explain: moving air is called Wind; a gentle wind is a Breeze.',
      'Discuss how trees clean the air we breathe by absorbing carbon and giving oxygen.'
    ],
    teacherPrompt: 'Connect air properties to tactile sensations: feeling wind, watching flying kites, seeing leaves rustle.',
    visualScene: {
      kind: 'air-wind',
      elements: [
        { id: 'pinwheel', label: 'Spinning Pinwheel', color: '#f43f5e' },
        { id: 'balloon', label: 'Inflated Balloon', color: '#8b5cf6' },
        { id: 'wind', label: 'Gentle Breeze', color: '#06b6d4' }
      ]
    },
    questions: [
      {
        prompt: 'What is moving air called?',
        options: ['Wind', 'Water', 'Rock'],
        answerIndex: 0,
        explanation: 'Air in motion across the atmosphere is called wind.'
      },
      {
        prompt: 'Can we see clean air with our eyes?',
        options: ['No, but we can feel it and see things move in it', 'Yes, it looks like purple jelly', 'Only at midnight'],
        answerIndex: 0,
        explanation: 'Clean air is invisible, but we feel it blowing and see it rustling leaves.'
      },
      {
        prompt: 'What happens when you blow air into a flat rubber balloon?',
        options: ['It expands because air takes up space inside', 'It becomes flat as paper', 'It turns into stone'],
        answerIndex: 0,
        explanation: 'Air is matter that has volume and fills the interior of the balloon.'
      },
      {
        prompt: 'How do lush green trees help the air in our cities?',
        options: ['They filter dust, absorb smoke, and provide fresh oxygen', 'They make the air dirty', 'They block all light'],
        answerIndex: 0,
        explanation: 'Trees act as natural green lungs by purifying the air and releasing oxygen.'
      }
    ]
  },
  {
    chapterNumber: 7,
    chapterTitle: 'Safe Habits & Neighbourhood Walks',
    conceptKey: 'safe-habits-neighbourhood',
    title: 'Daily Hygiene, Healthy Habits & Community Safety',
    objective: 'Practice personal hygiene (handwashing, dental care, clean clothes) and apply personal boundary safety.',
    story: 'Being healthy and safe makes every day an adventure! Meena starts her day by brushing her teeth thoroughly and taking a refreshing bath. Before every meal, she washes her hands with soap and water, scrubbing between fingers and singing the 20-second handwash rhyme. When Meena walks outside, she holds an adult\'s hand, walks on the pedestrian footpath, and stays alert. Meena also knows the safe touch rule: her body belongs to her, and she can always talk openly to trusted family members or teachers whenever anything feels uncomfortable. Safe habits protect our body, mind, and joyful spirit!',
    activity: 'Practice washing hands with soap for a full 20 seconds, counting slowly from 1 to 20 with proper lathering.',
    guidedSteps: [
      'The 5-step handwash rule: Wet, Soap, Scrub for 20 seconds, Rinse, Dry.',
      'Personal safety: My body belongs to me; always speak to trusted adults.',
      'Neighbourhood hygiene: Never throw garbage in drains or on open pathways.'
    ],
    teacherPrompt: 'Reinforce child safeguarding concepts gently: trusted adults, personal safety boundaries, and healthy routines.',
    visualScene: {
      kind: 'safe-habits',
      elements: [
        { id: 'soap', label: 'Clean Soap Lather', color: '#38bdf8' },
        { id: 'water', label: 'Clean Water Stream', color: '#0284c7' },
        { id: 'shield', label: 'Safety & Health Shield', color: '#10b981' }
      ]
    },
    questions: [
      {
        prompt: 'How long should we scrub our hands with soap to remove germs effectively?',
        options: ['For 20 seconds', 'For 1 second only', 'We should not use soap'],
        answerIndex: 0,
        explanation: 'Lathering for 20 seconds thoroughly breaks down dirt and harmful microbes.'
      },
      {
        prompt: 'When should we always wash our hands with soap and water?',
        options: ['Before eating food and after using the restroom', 'Only on Sundays', 'Never'],
        answerIndex: 0,
        explanation: 'Hand hygiene before meals and after sanitation prevents infectious illnesses.'
      },
      {
        prompt: 'If something ever feels unsafe or confusing, what should a child do?',
        options: ['Tell a trusted adult (like a parent or teacher) immediately', 'Keep it a secret', 'Run away alone'],
        answerIndex: 0,
        explanation: 'Children should always speak openly with trusted guardians or teachers.'
      },
      {
        prompt: 'Where should we walk when moving along a town road?',
        options: ['On the pedestrian footpath while holding an adult’s hand', 'In the middle of vehicular traffic', 'With eyes closed'],
        answerIndex: 0,
        explanation: 'Footpaths keep pedestrians separated and safe from road vehicles.'
      }
    ]
  }
];
