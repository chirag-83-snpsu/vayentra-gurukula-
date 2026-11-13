/**
 * Vayentra Gurukula — Class 3 Curriculum Data (2026-27 Academic Year)
 * Official CBSE (NCERT 2026–27 reference edition) & Karnataka State Board alignment.
 * 
 * Subjects covered:
 * 1. English (NCERT Santoor / Marigold Class 3)
 * 2. Mathematics (NCERT Joyful Mathematics / Math-Magic Class 3)
 * 3. Hindi (NCERT Veena वीणा / Sarangi Class 3)
 * 4. Kannada (KTBS Savirudi / Nali Kali Class 3)
 * 5. Environmental Studies (NCERT Our Wondrous World / Looking Around Class 3)
 * 6. Vayentra Original: AI & Digital Thinking (Class 3 Enrichment)
 * 7. Vayentra Original: Financial Literacy & Money Management (Class 3 Enrichment)
 */

export const GRADE3_CURRICULUM = {
  grade: 3,
  edition: '2026-27',
  pedagogy: 'Concept-first, experiential, multilingual support, tactile offline discovery; strictly child-safe (no generative chatbots).',
  official: [
    {
      board: 'CBSE',
      subjects: [
        {
          name: 'English',
          book: 'Santoor (NCERT Class 3)',
          source: 'https://ncert.nic.in/textbook.php?geen1=0-10',
          status: 'source_chapters_verified',
          chapters: [
            'Colours',
            'Two Friends',
            'The Wooden Bowl',
            'The Magic Seed',
            'Animals and Birds'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'Colours',
              conceptKey: 'colours-nature-rhymes',
              title: 'Colours of the Earth & Sensory Rhymes',
              objective: 'Identify descriptive colour words in nature, rhyme patterns, and expand sensory vocabulary.',
              story: 'Early in the morning, Maya and her grandfather walk into the Lalbagh botanical garden. Maya gazes at the radiant golden sunlight filtering through the deep emerald leaves. A brilliant blue kingfisher dips its sapphire wings into the lotus pond, where pale pink blossoms float gracefully upon the water. Grandfather smiles and says, "Maya, nature paints without ever needing a brush. Notice how the moist soil is warm terracotta brown, while the sky above spreads out like a soft azure blanket." Maya notices that when colours are placed side by side—like bright yellow sunflowers against dark green foliage—each colour shines even brighter.',
              activity: 'Collect five leaves or flower petals of different shades that have fallen on the ground. Arrange them from lightest green to darkest green in your sketchbook.',
              guidedSteps: [
                'Identify three vivid colour words: Emerald, Sapphire, Terracotta.',
                'Find rhyming pairs: Bright and Light, Blue and True.',
                'Describe one object in your room using both a colour word and a texture word (e.g., smooth red apple).'
              ],
              teacherPrompt: 'Guide children to appreciate nature\'s color harmony and introduce adjectives that enrich creative expression.',
              visualScene: {
                kind: 'nature-colours',
                elements: [
                  { id: 'sunlight', label: 'Golden Morning Rays', color: '#f59e0b' },
                  { id: 'leaves', label: 'Emerald Banyan Leaves', color: '#10b981' },
                  { id: 'kingfisher', label: 'Sapphire Kingfisher', color: '#3b82f6' },
                  { id: 'lotus', label: 'Blushing Pink Lotus', color: '#ec4899' }
                ]
              },
              questions: [
                {
                  prompt: 'What colour word in the story describes the kingfisher\'s feathers?',
                  options: ['Sapphire blue', 'Jet black', 'Dull grey', 'Rusty orange'],
                  answerIndex: 0,
                  explanation: 'The story describes the kingfisher dipping its vibrant sapphire wings into the water.'
                },
                {
                  prompt: 'Which word rhymes with "bright"?',
                  options: ['Light', 'Brave', 'Green', 'Shine'],
                  answerIndex: 0,
                  explanation: 'Bright and light share the exact same ending sound "-ight".'
                },
                {
                  prompt: 'Why did grandfather say nature paints without a brush?',
                  options: ['Because living plants, birds and skies have natural rich colours', 'Because he forgot his paint set', 'Because it was raining'],
                  answerIndex: 0,
                  explanation: 'Nature\'s flowers, trees, and sky are naturally colourful and beautiful on their own.'
                },
                {
                  prompt: 'Which word best describes the colour of rich garden soil?',
                  options: ['Terracotta brown', 'Neon pink', 'Snowy white', 'Bright turquoise'],
                  answerIndex: 0,
                  explanation: 'Terracotta describes the warm, reddish-brown tone of fertile natural earth.'
                }
              ]
            },
            {
              chapterNumber: 2,
              chapterTitle: 'Two Friends',
              conceptKey: 'friendship-empathy-cooperation',
              title: 'True Friendship & Collaborative Problem Solving',
              objective: 'Understand narrative structure, emotional empathy, and how cooperative teamwork overcomes challenges.',
              story: 'In a bustling school near Mysore, Rohan and Kabir were inseparable classmates. Rohan was swift on his feet and loved football, while Kabir was an observant thinker who loved solving crossword puzzles. One rainy afternoon, during the school science fair, their water-filtration project model accidentally tilted, spilling sand and gravel across the presentation table just fifteen minutes before the judges arrived. Rohan felt his heart sink and nearly gave up, but Kabir calmly said, "Rohan, you collect the gravel quickly because you have fast hands, while I will reset the filter funnel and re-layer the charcoal." By joining their unique strengths without blaming each other, they restored the model with two minutes to spare. The judges praised not only their clean water sample but their calm teamwork.',
              activity: 'Pair up with a family member or friend. Try building a tower of 10 paper cups using only one hand each, working together in complete harmony.',
              guidedSteps: [
                'Identify the problem faced by Rohan and Kabir.',
                'Notice how neither friend wasted time in blaming the other.',
                'List two different strengths that each friend brought to solve the issue.'
              ],
              teacherPrompt: 'Emphasize that true friends support each other during setbacks instead of complaining or fault-finding.',
              visualScene: {
                kind: 'collaborative-workbench',
                elements: [
                  { id: 'filter', label: 'Funnel & Charcoal Filter', color: '#64748b' },
                  { id: 'sand', label: 'Sorted River Sand & Pebbles', color: '#d97706' },
                  { id: 'water', label: 'Purified Clear Water Jar', color: '#0ea5e9' }
                ]
              },
              questions: [
                {
                  prompt: 'What happened to Rohan and Kabir\'s science model before the judges arrived?',
                  options: ['It tilted and spilled sand and gravel', 'It won first prize immediately', 'It was stolen by a monkey'],
                  answerIndex: 0,
                  explanation: 'The model accidentally tilted and spilled sand across their workbench.'
                },
                {
                  prompt: 'How did Kabir respond when disaster struck?',
                  options: ['He stayed calm and suggested dividing tasks by their strengths', 'He cried and ran home', 'He blamed Rohan angrily'],
                  answerIndex: 0,
                  explanation: 'Kabir stayed calm and organized a fast division of work based on their strengths.'
                },
                {
                  prompt: 'What made their partnership successful?',
                  options: ['Cooperation, mutual encouragement, and no blaming', 'Giving up immediately', 'Arguing over who was faster'],
                  answerIndex: 0,
                  explanation: 'Effective teams succeed by combining diverse talents and encouraging each other.'
                },
                {
                  prompt: 'What did the judges praise in addition to the clean water model?',
                  options: ['Their calm teamwork and problem-solving', 'Their expensive clothes', 'How loud they spoke'],
                  answerIndex: 0,
                  explanation: 'The judges were deeply impressed by how calmly and cooperatively they worked.'
                }
              ]
            },
            {
              chapterNumber: 3,
              chapterTitle: 'The Wooden Bowl',
              conceptKey: 'respect-grandparents-compassion',
              title: 'The Wooden Bowl: Respect, Dignity & Family Compassion',
              objective: 'Learn the moral imperative of respecting aging elders and how children\'s actions mirror adult behavior.',
              story: 'An elderly grandfather lived with his son, daughter-in-law, and little eight-year-old grandson, Arjun. As grandfather grew frail, his trembling hands sometimes spilled soup at the dining table or dropped glass plates on the tiled floor. Irritated by the mess, the parents placed a small wooden table in the corner of the kitchen and gave the old man his meals in a rough wooden bowl. Grandfather ate alone with quiet tears in his eyes. One evening, the father saw little Arjun diligently carving and smoothing small blocks of scrap wood on the verandah. "What are you making so carefully, my child?" asked the father gently. Arjun looked up with innocent eyes and answered, "I am making a wooden bowl for you and Amma, so you will have something to eat from when you grow old." Stunned by the boy\'s profound words, tears filled the parents\' eyes. From that night on, grandfather was lovingly helped to the main family table, and every meal was shared together with warm respect.',
              activity: 'Spend fifteen quiet minutes with a grandparent or an elderly neighbor. Ask them to share a favorite memory from when they were in Class 3, and write one sentence about it.',
              guidedSteps: [
                'Reflect on why grandfather\'s hands were trembling.',
                'Understand how Arjun\'s innocent craft reminded his parents of filial duty.',
                'Identify ways we can assist grandparents with dignity and gentle patience.'
              ],
              teacherPrompt: 'Discuss empathy for aging family members and how cultural traditions across India emphasize veneration of elders.',
              visualScene: {
                kind: 'family-dining',
                elements: [
                  { id: 'table', label: 'Shared Family Table', color: '#78350f' },
                  { id: 'bowl', label: 'Handcrafted Wooden Bowl', color: '#b45309' },
                  { id: 'grandpa', label: 'Beloved Grandfather', color: '#475569' }
                ]
              },
              questions: [
                {
                  prompt: 'Why did the parents initially give grandfather a wooden bowl?',
                  options: ['Because his hands trembled and glass dishes sometimes broke', 'Because he asked for it', 'Because it was his birthday'],
                  answerIndex: 0,
                  explanation: 'His trembling hands caused spills and broken china, leading to their impatient decision.'
                },
                {
                  prompt: 'What was little Arjun crafting from wood scraps on the verandah?',
                  options: ['A wooden bowl for his parents when they grow old', 'A toy boat', 'A cricket bat'],
                  answerIndex: 0,
                  explanation: 'Arjun was carving bowls for his parents, mirroring how they treated grandfather.'
                },
                {
                  prompt: 'How did Arjun\'s words transform his parents\' perspective?',
                  options: ['They realized their lack of empathy and welcomed grandfather back to the family table', 'They became angry with Arjun', 'They bought more wooden bowls'],
                  answerIndex: 0,
                  explanation: 'Arjun\'s innocent mirror made them realize the importance of compassion, honor, and care.'
                },
                {
                  prompt: 'What core Gurukula value does this classic tale teach us?',
                  options: ['Treating elders with dignity, patience, and profound love', 'Throwing away broken items', 'Eating in complete silence'],
                  answerIndex: 0,
                  explanation: 'Respect, patience, and warmth towards elders form the foundation of Gurukula culture.'
                }
              ]
            },
            {
              chapterNumber: 4,
              chapterTitle: 'The Magic Seed',
              conceptKey: 'plant-lifecycle-patience-nature',
              title: 'The Magic Seed: Life Cycles & Scientific Wonder',
              objective: 'Trace the developmental stages of seed germination: water absorption, radicle, shoot, and sunlight synthesis.',
              story: 'In her school garden in Hassan, Shreya pressed a tiny, wrinkled neem seed into the dark, damp earth. "Will it become a mighty tree tomorrow?" she asked her teacher, Guruji Sastry. Guruji smiled warmly: "Patience, Shreya. The greatest miracles in nature occur in secret beneath the soil." For three days, nothing appeared above the surface. But underneath, the seed coat was absorbing soil moisture, swelling gently until it cracked open. First, a tiny pale root called a radicle reached downwards into the earth, anchoring the plant and searching for minerals. Then, on the fifth morning, a tender green shoot arched upward through the crust, lifting two cotyledon leaves toward the golden morning sun. Shreya clapped her hands in delight. Through regular watering, gentle weeding, and sunlit mornings, the seedling grew sturdy and green.',
              activity: 'Place two dried green gram (moong) seeds inside a moist cotton swab in a small saucer. Check every morning and record the day the white root sprouts.',
              guidedSteps: [
                'Name the three essential elements seeds need to sprout: Moisture, Warmth, Air.',
                'Identify what grows downward first (the root/radicle).',
                'Identify what reaches upward to greet the sun (the green shoot).'
              ],
              teacherPrompt: 'Connect seed germination to biological patience, scientific recording, and ecological appreciation.',
              visualScene: {
                kind: 'seed-sprout-diagram',
                elements: [
                  { id: 'seed', label: 'Swelling Seed Coat', color: '#78350f' },
                  { id: 'root', label: 'Descending Primary Root', color: '#fef08a' },
                  { id: 'shoot', label: 'Emerging Green Cotyledons', color: '#22c55e' },
                  { id: 'soil', label: 'Moist Humus Soil', color: '#451a03' }
                ]
              },
              questions: [
                {
                  prompt: 'Which part of the seed emerges first during germination?',
                  options: ['The downward-growing root (radicle)', 'A large wooden branch', 'A fragrant flower', 'Ripe fruit'],
                  answerIndex: 0,
                  explanation: 'The primary root grows downward first to anchor the seedling and absorb water.'
                },
                {
                  prompt: 'What three essentials do seeds need in order to awaken and sprout?',
                  options: ['Water, warmth, and air', 'Chocolate, soda, and plastic', 'Dark paint and ice'],
                  answerIndex: 0,
                  explanation: 'Moisture softens the seed coat, warmth activates growth enzymes, and oxygen provides energy.'
                },
                {
                  prompt: 'Why did Guruji tell Shreya that patience was necessary?',
                  options: ['Because living growth takes time and happens quietly under the soil', 'Because the seed was dead', 'Because trees only grow at night'],
                  answerIndex: 0,
                  explanation: 'Biological development requires time, nurturing care, and cannot be rushed overnight.'
                },
                {
                  prompt: 'What do the two first baby leaves (cotyledons) do when they reach sunlight?',
                  options: ['They turn green and begin catching sunlight to make food', 'They fall off immediately', 'They turn into wooden bark'],
                  answerIndex: 0,
                  explanation: 'Cotyledons expand and harness sunlight through photosynthesis to nourish the young plant.'
                }
              ]
            },
            {
              chapterNumber: 5,
              chapterTitle: 'Animals and Birds',
              conceptKey: 'animal-adaptations-biodiversity',
              title: 'Wings, Paws & Beaks: Creature Adaptations in Indian Habitats',
              objective: 'Classify animals and birds by their dietary adaptations, beak structures, and environmental habitats.',
              story: 'At the Ranganathittu Bird Sanctuary on the Kaveri river, guide Ramu pointed his binoculars toward the quiet riverbanks. A great Indian pelican glided over the water, using its large elastic pouch beneath its bill like a fisherman\'s scoop net to catch small fish. Nearby, perched upon a riverside bamboo stalk, a little green bee-eater with a slender, curved beak snatched a flying dragonfly with acrobatic precision. On the mudbank below, a smooth-coated otter family chattered excitedly, their webbed paws propelling them through river currents as smoothly as fish. Ramu explained to the young visitors: "Every creature has special physical features called adaptations that match exactly how it finds nourishment and makes its home in the wild."',
              activity: 'Observe any bird outside your window for 10 minutes (crow, pigeon, or sparrow). Notice the shape of its beak and what it is pecking at.',
              guidedSteps: [
                'Identify how the pelican\'s throat pouch acts as a fishing net.',
                'Observe how the otter\'s webbed paws assist in swift swimming.',
                'Contrast the curved beak of a seed-eating parrot with the pointed beak of an insect-eating woodpecker.'
              ],
              teacherPrompt: 'Discuss habitat conservation along Indian river systems and the importance of preserving wildlife sanctuaries.',
              visualScene: {
                kind: 'sanctuary-wildlife',
                elements: [
                  { id: 'pelican', label: 'Spot-billed Pelican with Pouch', color: '#94a3b8' },
                  { id: 'otter', label: 'River Otter with Webbed Paws', color: '#78350f' },
                  { id: 'kaveri', label: 'Gentle Kaveri River Currents', color: '#0284c7' }
                ]
              },
              questions: [
                {
                  prompt: 'How does a pelican use the elastic pouch under its bill?',
                  options: ['As a scoop to catch fish from the water', 'To carry dry twigs for the nest', 'To sing loud songs'],
                  answerIndex: 0,
                  explanation: 'Pelicans have large gular pouches that function like dip nets to scoop fish from water.'
                },
                {
                  prompt: 'What physical feature helps river otters swim swiftly through river currents?',
                  options: ['Webbed paws and streamlined bodies', 'Long feathered wings', 'Heavy wooden hooves'],
                  answerIndex: 0,
                  explanation: 'Webbed feet push water efficiently, allowing otters to navigate river currents.'
                },
                {
                  prompt: 'What do we call special body features that help animals thrive in their natural habitats?',
                  options: ['Adaptations', 'Costumes', 'Accessories', 'Inventions'],
                  answerIndex: 0,
                  explanation: 'Adaptations are specialized evolutionary characteristics that help organisms survive.'
                },
                {
                  prompt: 'Which beak shape is best adapted for sipping nectar from deep tube-shaped flowers?',
                  options: ['Long, slender and slightly curved', 'Short, heavy and crushing like a nutcracker', 'Flat and wide like a duck\'s bill'],
                  answerIndex: 0,
                  explanation: 'Sunbirds and hummingbirds have long, slender beaks designed to probe floral blossoms.'
                }
              ]
            }
          ]
        },
        {
          name: 'Mathematics',
          book: 'Joyful Mathematics (NCERT Class 3)',
          source: 'https://ncert.nic.in/textbook.php?gemh1=0-14',
          status: 'source_chapters_verified',
          chapters: [
            'Where to Look (Spatial Perspectives)',
            'Fun with Numbers (3-Digit Place Value)',
            'Give and Take (Addition & Subtraction Strategies)',
            'Long and Short (Measurement of Length)',
            'Shapes and Designs (2D & 3D Geometry)',
            'Fun with Giving and Sharing (Multiplication & Division)',
            'Time Goes On (Clocks & Timelines)',
            'Who is Heavier? (Weight & Balance)'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'Where to Look (Spatial Perspectives)',
              conceptKey: 'spatial-views-perspectives',
              title: 'Top, Front & Side Views: Developing Spatial Thinking',
              objective: 'Identify objects from top, front, and side orientations and understand symmetrical grid reflections.',
              story: 'In art class at Vidya Mandir, Teacher Ananya placed a ceramic teacup and a toy Maruti car in the center of the wooden low table. She asked four students sitting in different positions to sketch what they saw. Vikram, looking directly from above, drew an oval with a round opening inside it—the top view! Priya, sitting right in front of the car, drew two headlights and the radiator grille—the front view! Dev, sitting to the side, drew two wheels and the door windows—the side view! When they compared drawings, Vikram was puzzled: "How can the same object look so completely different?" Teacher Ananya explained: "Objects do not change shape, but our perspective changes based on our line of sight. Architects and aerospace engineers use top, front, and side views to design real buildings and aircraft with mathematical precision."',
              activity: 'Take a matchbox or shoe box. Look at it from directly above, from the short front end, and from the long side. Sketch each view in your notebook.',
              guidedSteps: [
                'View an object at eye level for the Front View.',
                'Stand up and look straight down for the Top View (plan view).',
                'Move 90 degrees to inspect the Side View (elevation).',
                'Notice which details disappear in each perspective.'
              ],
              teacherPrompt: 'Connect 2D representations to 3D spatial geometry, introducing children to engineering visualization.',
              visualScene: {
                kind: 'isometric-perspectives',
                elements: [
                  { id: 'top', label: 'Top View (Oval Rim)', color: '#3b82f6' },
                  { id: 'front', label: 'Front View (Headlights & Grille)', color: '#10b981' },
                  { id: 'side', label: 'Side View (Wheels & Doors)', color: '#f59e0b' }
                ]
              },
              questions: [
                {
                  prompt: 'When looking at a closed dining table directly from the ceiling (Top View), what 2D shape do you see?',
                  options: ['A rectangle or circle with no legs visible', 'A triangle with four legs', 'A jagged star'],
                  answerIndex: 0,
                  explanation: 'From directly above, you see the tabletop surface; the supporting legs are hidden underneath.'
                },
                {
                  prompt: 'If you look at a railway train from the front, what primary features do you see?',
                  options: ['The locomotive headlight, windshield, and tracks', 'All thirty passenger wagons side by side', 'The roofs of all coaches'],
                  answerIndex: 0,
                  explanation: 'The front view shows the front face of the engine, headlights, and tracks ahead.'
                },
                {
                  prompt: 'Why do architects draw both Top Views (floor plans) and Side Views (elevations)?',
                  options: ['To accurately represent the 3D dimensions of the entire building', 'Because they run out of ink', 'To confuse the builders'],
                  answerIndex: 0,
                  explanation: 'Multiple 2D views are essential to construct accurate 3D structures.'
                },
                {
                  prompt: 'Which view of a staircase looks like a simple set of parallel horizontal stripes?',
                  options: ['The top view looking straight down', 'The side view showing steps going up', 'The bottom view'],
                  answerIndex: 0,
                  explanation: 'Looking straight down at stairs displays a series of parallel rectangular treads.'
                }
              ]
            },
            {
              chapterNumber: 2,
              chapterTitle: 'Fun with Numbers (3-Digit Place Value)',
              conceptKey: 'three-digit-place-value-expanded',
              title: 'Hundreds, Tens and Ones: Decomposing 3-Digit Quantities',
              objective: 'Read, write, expand, and mentally manipulate numbers up to 999 using base-10 block decomposition.',
              story: 'At the Bengaluru Namma Metro station, station master Murthy is stocking transit tokens for the morning rush. The tokens arrive in neat wooden boxes. 1 large box holds exactly 100 tokens (Hundreds). 1 plastic roll holds exactly 10 tokens (Tens). And loose single tokens are kept in a ceramic saucer (Ones). Customer Aarav asks for 346 tokens for a school excursion. Station master Murthy does not count 346 single coins one by one! Instead, with a confident smile, he picks 3 large boxes of 100 (300), 4 rolls of 10 (40), and 6 loose tokens (6). "300 + 40 + 6 = 346," Aarav exclaims. "You assembled 346 in just 5 seconds!" When we group numbers into Hundreds, Tens, and Ones, even large quantities become transparent and fast to calculate.',
              activity: 'Using rajma beans or toothpicks, make bundles of 10 tied with rubber bands. Represent the number 125 using 1 bundle of 100 (or ten 10s), 2 bundles of 10, and 5 loose items.',
              guidedSteps: [
                'Identify the Hundreds place: 3 × 100 = 300.',
                'Identify the Tens place: 4 × 10 = 40.',
                'Identify the Ones place: 6 × 1 = 6.',
                'Write in expanded form: 346 = 300 + 40 + 6.'
              ],
              teacherPrompt: 'Emphasize that the value of each digit is determined by its position, establishing strong mental arithmetic foundations.',
              visualScene: {
                kind: 'base-10-blocks',
                elements: [
                  { id: 'hundreds', label: '3 Flats of 100 = 300', color: '#1e40af' },
                  { id: 'tens', label: '4 Rods of 10 = 40', color: '#16a34a' },
                  { id: 'ones', label: '6 Unit Cubes = 6', color: '#d97706' }
                ]
              },
              questions: [
                {
                  prompt: 'In the number 582, what is the actual place value of the digit 8?',
                  options: ['80 (8 Tens)', '800 (8 Hundreds)', '8 (8 Ones)', '8000'],
                  answerIndex: 0,
                  explanation: 'The digit 8 is in the tens column, representing 8 bundles of 10 = 80.'
                },
                {
                  prompt: 'What number is formed by 7 Hundreds, 0 Tens, and 9 Ones?',
                  options: ['709', '790', '79', '7009'],
                  answerIndex: 0,
                  explanation: '7 in the hundreds place, 0 in the tens place, and 9 in the ones place gives 709.'
                },
                {
                  prompt: 'What happens to the number 432 if you add 3 Hundreds (300) to it?',
                  options: ['The hundreds digit increases to 7, making 732', 'It becomes 435', 'It becomes 462'],
                  answerIndex: 0,
                  explanation: 'Adding 300 modifies only the hundreds digit: 4 + 3 = 7 Hundreds, giving 732.'
                },
                {
                  prompt: 'Which number is exactly one less than 600?',
                  options: ['599', '590', '509', '598'],
                  answerIndex: 0,
                  explanation: '600 - 1 = 599. Decomposing 600 into 5 Hundreds, 9 Tens, and 9 Ones.'
                }
              ]
            },
            {
              chapterNumber: 3,
              chapterTitle: 'Give and Take (Addition & Subtraction Strategies)',
              conceptKey: 'mental-math-addition-subtraction',
              title: 'Friendly Number Strategies: Mental Addition & Regrouping',
              objective: 'Apply regrouping (carrying and borrowing) and decomposition to add and subtract 3-digit numbers mentally.',
              story: 'At the Gandhi Bazaar bookstore in Bengaluru, shopkeeper Shridhar tracks his inventory. In the morning, he had 248 illustrated storybooks on the shelves. By noon, a school delivery van brings another 175 books. Instead of frantically searching for paper and pencil, Shridhar uses the "Friendly 10s" strategy in his head: "248 is almost 250! Let me borrow 2 from 175 to make 248 into 250. Now I have 250 + 173. 250 + 100 = 350. 350 + 73 = 423 books!" When a customer later buys 68 books, Shridhar subtracts 70 (which leaves 353) and adds back 2 to get 355. Mental math is like choosing the smoothest, straightest path instead of bumping over rough stones.',
              activity: 'Try adding 48 + 35 in your head by taking 2 from 35 and giving it to 48 (50 + 33). Time how fast you can find the answer.',
              guidedSteps: [
                'Look for numbers close to multiples of 10 or 100 (e.g., 48 is close to 50, 198 is close to 200).',
                'Borrow or transfer small amounts to create "friendly round numbers".',
                'Calculate the rounded sum or difference, then adjust back.',
                'Verify using standard column regrouping: Units -> Tens -> Hundreds.'
              ],
              teacherPrompt: 'Encourage multiple flexible pathways to arithmetic solutions rather than rote mechanical column rules.',
              visualScene: {
                kind: 'number-line-jump',
                elements: [
                  { id: 'start', label: 'Start at 248', color: '#6366f1' },
                  { id: 'jump100', label: '+ 100 Jump to 348', color: '#0ea5e9' },
                  { id: 'jump70', label: '+ 70 Jump to 418', color: '#10b981' },
                  { id: 'jump5', label: '+ 5 Jump to 423', color: '#f59e0b' }
                ]
              },
              questions: [
                {
                  prompt: 'What is 356 + 200?',
                  options: ['556', '536', '376', '456'],
                  answerIndex: 0,
                  explanation: 'Adding 200 adds 2 to the hundreds column: 3 + 2 = 5 Hundreds, keeping tens and ones intact = 556.'
                },
                {
                  prompt: 'When solving 49 + 27 mentally, what is a fast "friendly number" shortcut?',
                  options: ['Change 49 to 50, calculate 50 + 26 = 76', 'Count 49 tick marks on paper', 'Guess 100'],
                  answerIndex: 0,
                  explanation: 'Borrowing 1 from 27 makes 49 into 50. 50 + 26 = 76 instantly.'
                },
                {
                  prompt: 'What is 500 - 140?',
                  options: ['360', '460', '260', '340'],
                  answerIndex: 0,
                  explanation: '500 - 100 = 400. 400 - 40 = 360.'
                },
                {
                  prompt: 'In column addition, if the sum in the ones column equals 14, what do you do?',
                  options: ['Write 4 in the ones column and carry 1 Ten to the tens column', 'Write 14 in the single ones box', 'Erase the whole problem'],
                  answerIndex: 0,
                  explanation: '14 ones is 1 Ten and 4 Ones. Write 4 in the ones place and carry over 1 Ten to the tens place.'
                }
              ]
            },
            {
              chapterNumber: 4,
              chapterTitle: 'Long and Short (Measurement of Length)',
              conceptKey: 'standard-length-metres-centimetres',
              title: 'Metres & Centimetres: Precision Measurement with Rulers',
              objective: 'Measure and compare lengths using standard units (cm and m) and understand the relationship 1 m = 100 cm.',
              story: 'In the woodcraft studio at Channapatna, master craftsman Basavanna was building a traditional wooden rocking horse for children. Little apprentice Diya watched him measure the curved cedar runners. "Basavanna Uncle, why don\'t you just use hand-spans or footsteps to measure the wood?" Diya asked. Basavanna chuckled gently and showed her his hand next to hers: "Look at your palm, Diya. Your hand-span is only 12 centimetres, while mine is 22 centimetres! If you measured the wood with your hand and I cut it with mine, the pieces would never fit together! That is why the whole world uses standard units: centimetres for small items like pencils and toy wheels, and metres for large items like tables, sarees, and rooms. Exactly 100 centimetres line up end-to-end to make 1 metre."',
              activity: 'Use a 15-cm or 30-cm plastic ruler to measure the length of your pencil, your eraser, and your maths textbook. Write down each measurement in cm.',
              guidedSteps: [
                'Always align the 0 mark of the ruler (not the edge of the plastic) with the start of the object.',
                'Look straight down at the ending mark to avoid parallax error.',
                'Remember the Golden Rule: 1 Metre (m) = 100 Centimetres (cm).',
                'Decide which unit to use: cm for notebooks, m for school corridors and tree heights.'
              ],
              teacherPrompt: 'Guide learners to understand why standardized units replaced variable ancient units like cubits and hand-spans.',
              visualScene: {
                kind: 'metric-ruler-diagram',
                elements: [
                  { id: 'zero', label: 'Zero Alignment Mark', color: '#ef4444' },
                  { id: 'centimetre', label: '10 Millimetres = 1 Centimetre', color: '#0ea5e9' },
                  { id: 'metre', label: '100 cm = 1 Full Metre Bar', color: '#10b981' }
                ]
              },
              questions: [
                {
                  prompt: 'How many centimetres are there in 1 standard metre?',
                  options: ['100 cm', '10 cm', '1000 cm', '50 cm'],
                  answerIndex: 0,
                  explanation: 'The metric standard is exactly 1 metre = 100 centimetres.'
                },
                {
                  prompt: 'Where must you place the 0-mark of a ruler when measuring a pencil?',
                  options: ['Exactly at the very tip or start of the pencil', 'At the 5 cm mark', 'Anywhere in the middle'],
                  answerIndex: 0,
                  explanation: 'Accurate measurement requires starting from the 0 baseline.'
                },
                {
                  prompt: 'Which unit is best suited for measuring the length of a badminton court?',
                  options: ['Metres (m)', 'Millimetres (mm)', 'Centimetres (cm)'],
                  answerIndex: 0,
                  explanation: 'Large spaces and architectural distances are measured in metres.'
                },
                {
                  prompt: 'If a ribbon is 2 metres and 40 cm long, how many total centimetres is that?',
                  options: ['240 cm', '204 cm', '24 cm', '2400 cm'],
                  answerIndex: 0,
                  explanation: '2 metres = 200 cm. 200 cm + 40 cm = 240 cm.'
                }
              ]
            },
            {
              chapterNumber: 5,
              chapterTitle: 'Shapes and Designs (2D & 3D Geometry)',
              conceptKey: 'geometry-edges-vertices-tessellations',
              title: 'Edges, Corners & Tiling: Exploring 2D Shapes and Tangrams',
              objective: 'Identify straight edges, curved boundaries, corners (vertices), and tiling (tessellation) patterns without gaps.',
              story: 'At the Somnathpura Hoysala temple in Karnataka, young architecture enthusiast Tanvi marvelled at the intricate soapstone floor tiles. Each tile was cut into crisp hexagons and diamonds that locked together flawlessly, leaving not a single millimeter of open gap between them. Her elder sister, an engineering student, explained: "When identical geometric shapes fit together across a flat floor without overlapping and without any gaps, mathematicians call it a Tessellation or Tiling! Look at squares, rectangles, and regular hexagons—their straight edges and corners meet at perfect angles. But notice what happens if you try to pave a floor using only round circular coins: circles leave hollow gaps between them because curved boundaries cannot corner together seamlessly."',
              activity: 'Cut out 6 identical squares and 6 identical circles from scrap paper. Try laying them side by side on your desk. Notice which shape tiles completely without empty holes.',
              guidedSteps: [
                'Count the sides and corners of a Square (4 straight sides, 4 corners, all sides equal).',
                'Count the sides and corners of a Triangle (3 sides, 3 vertices).',
                'Notice that a Circle has 1 continuous curved boundary and 0 sharp corners.',
                'Observe how kitchen floor tiles or bathroom walls use tessellating rectangles and squares.'
              ],
              teacherPrompt: 'Connect geometric properties like vertices and line segments to artistic tiling, Kolam patterns, and traditional Indian architecture.',
              visualScene: {
                kind: 'tessellation-mosaic',
                elements: [
                  { id: 'square', label: '4 Edges, 4 Vertices (Square)', color: '#3b82f6' },
                  { id: 'hexagon', label: '6 Edges, Perfect Tiling (Hexagon)', color: '#10b981' },
                  { id: 'circle', label: 'Curved Edge, 0 Vertices (Circle)', color: '#f59e0b' }
                ]
              },
              questions: [
                {
                  prompt: 'How many straight edges and sharp corners does a triangle have?',
                  options: ['3 edges and 3 corners', '4 edges and 4 corners', '2 edges and 1 corner'],
                  answerIndex: 0,
                  explanation: 'A triangle is a closed polygon formed by 3 straight line segments with 3 vertices.'
                },
                {
                  prompt: 'What happens when shapes tile or tessellate across a floor surface?',
                  options: ['They fit together perfectly with no gaps and no overlapping', 'They leave big holes everywhere', 'They pile up into a mountain'],
                  answerIndex: 0,
                  explanation: 'Tessellation means tiling a flat plane using geometric shapes without gaps or overlaps.'
                },
                {
                  prompt: 'Can you pave a completely flat floor without gaps using only circular coins?',
                  options: ['No, circles have curved boundaries that leave hollow gaps between them', 'Yes, easily', 'Only if the coins are made of gold'],
                  answerIndex: 0,
                  explanation: 'Circles cannot tessellate because their curved edges cannot meet at zero-gap vertices.'
                },
                {
                  prompt: 'How many pieces are there in a traditional ancient Chinese Tangram puzzle?',
                  options: ['7 geometric flat pieces', '100 pieces', '2 pieces', '20 pieces'],
                  answerIndex: 0,
                  explanation: 'A classic tangram set consists of 7 flat polygons (5 triangles, 1 square, 1 parallelogram).'
                }
              ]
            },
            {
              chapterNumber: 6,
              chapterTitle: 'Fun with Giving and Sharing (Multiplication & Division)',
              conceptKey: 'multiplication-repeated-addition-equal-sharing',
              title: 'Repeated Addition & Fair Sharing: The Foundations of Tables',
              objective: 'Understand multiplication as repeated equal groups and division as fair equal sharing among recipients.',
              story: 'On Krishna Janmashtami, Grandmother prepared delicious golden laddoos in her kitchen. She called her three grandchildren—Milo, Ananya, and Kabir—into the dining hall. Grandmother placed 4 laddoos in Milo\'s brass bowl, 4 laddoos in Ananya\'s bowl, and 4 laddoos in Kabir\'s bowl. "How many laddoos did I distribute in total?" Grandmother quizzed them. Milo counted: "4 + 4 + 4 = 12 laddoos!" Kabir smiled and added: "Amma, instead of adding 4 three times, we can say 3 groups of 4! 3 × 4 = 12!" Grandmother nodded happily: "Exactly! Multiplication is simply fast repeated addition of equal groups. And if I had 12 laddoos and wanted to share them equally among 3 children, 12 divided by 3 gives 4 laddoos to each of you without anyone feeling left out!"',
              activity: 'Take 12 small buttons or pebbles. Form 4 equal groups. Count how many items are in each group (12 ÷ 4 = 3).',
              guidedSteps: [
                'Identify the number of groups: 3.',
                'Identify the quantity in each group: 4.',
                'Connect repeated addition to multiplication: 4 + 4 + 4 = 3 × 4 = 12.',
                'Connect equal distribution to division: 12 shared among 3 = 4 each.'
              ],
              teacherPrompt: 'Emphasize the conceptual duality between multiplication (combining equal groups) and division (partitioning into equal shares).',
              visualScene: {
                kind: 'multiplication-array',
                elements: [
                  { id: 'group1', label: 'Group 1: 4 Laddoos', color: '#f59e0b' },
                  { id: 'group2', label: 'Group 2: 4 Laddoos', color: '#f59e0b' },
                  { id: 'group3', label: 'Group 3: 4 Laddoos', color: '#f59e0b' },
                  { id: 'total', label: 'Total Array = 3 × 4 = 12', color: '#10b981' }
                ]
              },
              questions: [
                {
                  prompt: 'What is another way to express 5 + 5 + 5 + 5?',
                  options: ['4 × 5 = 20', '5 × 5 = 25', '4 + 5 = 9', '5 - 4 = 1'],
                  answerIndex: 0,
                  explanation: 'Adding 5 four times is 4 groups of 5, which is 4 × 5 = 20.'
                },
                {
                  prompt: 'If you have 18 pencils and distribute them equally into 3 pencil boxes, how many pencils go in each box?',
                  options: ['6 pencils (18 ÷ 3 = 6)', '5 pencils', '8 pencils', '3 pencils'],
                  answerIndex: 0,
                  explanation: 'Fair sharing 18 items across 3 containers yields 18 ÷ 3 = 6 per box.'
                },
                {
                  prompt: 'Any number multiplied by 0 always equals:',
                  options: ['0', '1', 'The number itself', '100'],
                  answerIndex: 0,
                  explanation: 'Multiplying by 0 means having zero groups of that quantity, which equals 0.'
                },
                {
                  prompt: 'If one bicycle has 2 wheels, how many wheels do 7 bicycles have in total?',
                  options: ['14 wheels (7 × 2 = 14)', '9 wheels', '12 wheels', '16 wheels'],
                  answerIndex: 0,
                  explanation: '7 bicycles × 2 wheels per bicycle = 14 wheels.'
                }
              ]
            },
            {
              chapterNumber: 7,
              chapterTitle: 'Time Goes On (Clocks & Timelines)',
              conceptKey: 'reading-clocks-hours-minutes-calendars',
              title: 'Hands of the Clock & Days of the Calendar',
              objective: 'Read analog clocks to the hour and half-hour, calculate elapsed time, and understand calendar weeks and months.',
              story: 'In the school clock tower in Mysuru, the large brass mechanical clock ticks with reassuring rhythm. Grandfather showed young Dhruv how the clock face is arranged. "The short, stout hand is the Hour hand—it takes 12 full hours to complete one slow circuit around the dial. The long, slender hand is the Minute hand—it sprints around the whole dial in 60 minutes! When the minute hand points straight up at the 12, the hour hand tells you the exact hour. When the minute hand points halfway down at the 6, exactly 30 minutes have passed—we say half-past the hour." Dhruv looked at his school bell schedule: school starts at 9:00 AM, recess begins at 11:30 AM (half-past eleven), and the dismissal bell rings at 3:30 PM. Time is the natural river that structures our learning and resting.',
              activity: 'Look at a wall clock at home. Write down the exact time you wake up, eat lunch, and go to sleep.',
              guidedSteps: [
                'Identify the short Hour hand and the long Minute hand.',
                'Notice that the dial is divided into 12 numbered sections.',
                'Each number on the dial represents 5 minutes for the minute hand (5, 10, 15, 20... up to 60).',
                'Read the hour first, then read the minutes.'
              ],
              teacherPrompt: 'Connect analog clock reading to the 60-minute cycle, AM/PM transitions, and calendar navigation.',
              visualScene: {
                kind: 'analog-clock-dial',
                elements: [
                  { id: 'hourHand', label: 'Short Hour Hand at 3', color: '#1e40af' },
                  { id: 'minHand', label: 'Long Minute Hand at 6 (30 mins)', color: '#ef4444' },
                  { id: 'face', label: '12-Hour Circular Dial', color: '#e2e8f0' }
                ]
              },
              questions: [
                {
                  prompt: 'When the long minute hand points straight at the 6 and the short hour hand is midway between 4 and 5, what time is it?',
                  options: ['4:30 (Half-past four)', '5:00', '6:20', '4:06'],
                  answerIndex: 0,
                  explanation: 'When the minute hand is at 6, it represents 30 minutes past the hour. Here, it is 4:30.'
                },
                {
                  prompt: 'How many minutes are there in one complete hour?',
                  options: ['60 minutes', '100 minutes', '30 minutes', '24 minutes'],
                  answerIndex: 0,
                  explanation: 'There are exactly 60 minutes in 1 hour (and 60 seconds in 1 minute).'
                },
                {
                  prompt: 'How many hours are there in one full solar day and night?',
                  options: ['24 hours', '12 hours', '48 hours', '10 hours'],
                  answerIndex: 0,
                  explanation: 'Earth completes one full rotation on its axis in 24 hours.'
                },
                {
                  prompt: 'If a drawing class starts at 10:00 AM and lasts for 1 hour and 30 minutes, when does it finish?',
                  options: ['11:30 AM', '11:00 AM', '12:00 PM', '10:30 AM'],
                  answerIndex: 0,
                  explanation: '10:00 AM + 1 hour = 11:00 AM; + 30 minutes = 11:30 AM.'
                }
              ]
            },
            {
              chapterNumber: 8,
              chapterTitle: 'Who is Heavier? (Weight & Balance)',
              conceptKey: 'mass-weight-kilograms-grams',
              title: 'Kilograms & Balance Scales: Understanding Mass and Gravity',
              objective: 'Estimate and compare weights using standard units (g and kg) and understand balance scale equilibrium.',
              story: 'At the Russell Market vegetable stall, vegetable seller Munir holds a pair of gleaming brass balance scales by a center cord. Customer Mrs. Deshmukh asks for 1 kilogram of fresh red tomatoes. Munir places a heavy iron weight engraved with "1 kg" onto the left brass pan. The left pan immediately drops down while the empty right pan tilts up high into the air! Munir begins picking ripe, firm tomatoes and gently placing them into the right pan. One, two, three, four, five... With seven tomatoes in the pan, the center metal pointer balances straight up in the vertical slot, and both pans float at the exact same horizontal height! "There!" smiles Munir. "The downward gravitational pull of the tomatoes now exactly equals the 1-kilogram iron standard. Exactly 1000 grams make 1 kilogram."',
              activity: 'Find three packaged items in your pantry (like a bag of salt, a tea packet, or biscuit pack). Check the net weight printed on each label and identify whether it is measured in grams (g) or kilograms (kg).',
              guidedSteps: [
                'Understand balance equilibrium: when the needle points straight center, both sides have equal mass.',
                'Remember the standard weight equivalence: 1 Kilogram (kg) = 1000 Grams (g).',
                'Use grams (g) for lighter items like spices, gold, and apples.',
                'Use kilograms (kg) for heavy sacks of rice, flour, and your own body weight.'
              ],
              teacherPrompt: 'Demonstrate balance beam mechanics, introducing children to mass conservation and the gravitational baseline.',
              visualScene: {
                kind: 'balance-scale-equilibrium',
                elements: [
                  { id: 'ironWeight', label: '1 kg Standard Iron Weight (Left)', color: '#334155' },
                  { id: 'pointer', label: 'Balanced Center Pointer', color: '#16a34a' },
                  { id: 'tomatoes', label: '1 kg Ripe Tomatoes (Right)', color: '#dc2626' }
                ]
              },
              questions: [
                {
                  prompt: 'How many grams equal 1 kilogram?',
                  options: ['1000 grams', '100 grams', '10 grams', '500 grams'],
                  answerIndex: 0,
                  explanation: 'The prefix "kilo-" means one thousand. 1 kg = 1000 g.'
                },
                {
                  prompt: 'When a two-pan balance scale is in perfect horizontal equilibrium, what does it signify?',
                  options: ['Both pans have the exact same mass/weight', 'The left pan is much heavier', 'The scale is broken'],
                  answerIndex: 0,
                  explanation: 'Horizontal alignment means both pans hold equal gravitational weight.'
                },
                {
                  prompt: 'Which item would most appropriately be measured in grams (g) instead of kilograms (kg)?',
                  options: ['A single cardamon pod or pencil', 'A sack of 50 kg basmati rice', 'An elephant'],
                  answerIndex: 0,
                  explanation: 'Very light objects like spices or pencils are measured in small gram units.'
                },
                {
                  prompt: 'If you have a 500-gram packet of lentils and another 500-gram packet, what is their combined weight?',
                  options: ['1 kilogram (1000 g)', '2 kilograms', '500 grams', '100 grams'],
                  answerIndex: 0,
                  explanation: '500 g + 500 g = 1000 g = 1 full kilogram.'
                }
              ]
            }
          ]
        },
        {
          name: 'Hindi',
          book: 'Veena वीणा / Sarangi (NCERT Class 3)',
          source: 'https://ncert.nic.in/textbook.php?ghin1=0-14',
          status: 'source_chapters_verified',
          chapters: [
            'देश हमारा',
            'बया हमारी चिड़िया रानी',
            'चंदा मामा',
            'मीना का परिवार',
            'सीख'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'देश हमारा',
              conceptKey: 'desh-hamara-poem-patriotism',
              title: 'कविता: देश हमारा - प्रकृति की सुंदरता और देशप्रेम',
              objective: 'कविता का सस्वर वाचन, तुकांत शब्दों की पहचान, तथा मातृभूमि की प्राकृतिक विविधता को समझना।',
              story: 'कक्षा तीन की हिंदी अध्यापिका वंदना जी ने बच्चों को एक सुंदर कविता गाकर सुनाई: "सुंदर देश हमारा भारत, सोने जैसा रूप इसका। उत्तर में प्रहरी हिमवान, दक्षिण में सागर लहराता।" अध्यापिका जी ने समझाया कि भारत एक ऐसा अनूठा देश है जहाँ उत्तर में हिमालय पर्वत मुकुट की तरह चमकता है, गंगा-यमुना जैसी पवित्र नदियाँ खेतों को हरियाली प्रदान करती हैं, और दक्षिण में हिंद महासागर भारत माता के चरण पखारता है। कविता की पंक्तियों में "भारत" और "रूप", "पर्वत" और "सागर" जैसे शब्द हमारे देश की महानता और प्राकृतिक विविधता को दर्शाते हैं। बच्चों ने लयबद्ध तालियों के साथ कविता को दोहराया और अपनी मातृभूमि के प्रति आदर का भाव महसूस किया।',
              activity: 'भारत के राष्ट्रीय प्रतीकों (तिरंगा, मोर, बाघ, कमल) का सुंदर चित्र अपनी कॉपी में बनाइए और उनके नाम हिंदी में लिखिए।',
              guidedSteps: [
                'कविता की प्रत्येक पंक्ति को स्पष्ट और मधुर स्वर में पढ़ें।',
                'तुकांत (rhyming) शब्दों पर ध्यान दें: जैसे - न्यारा, प्यारा; महान, हिमवान।',
                'भारत के चारों दिशाओं के प्राकृतिक सौंदर्य के बारे में बातचीत करें।'
              ],
              teacherPrompt: 'कविता के माध्यम से देवनागरी लिपि के संयुक्त अक्षरों का सही उच्चारण और देश की सांस्कृतिक एकता का पाठ पढ़ाएं।',
              visualScene: {
                kind: 'india-natural-heritage',
                elements: [
                  { id: 'himalaya', label: 'हिमालय के श्वेत शिखर', color: '#94a3b8' },
                  { id: 'ganga', label: 'गंगा की पावन धारा', color: '#38bdf8' },
                  { id: 'tricolor', label: 'हमारा प्यारा तिरंगा', color: '#f97316' }
                ]
              },
              questions: [
                {
                  prompt: 'कविता के अनुसार भारत के उत्तर में कौन सा महान पर्वत स्थित है?',
                  options: ['हिमालय पर्वत (हिमवान)', 'आल्प्स पर्वत', 'अरावली पर्वत'],
                  answerIndex: 0,
                  explanation: 'भारत के उत्तर में हिमालय पर्वत सजग प्रहरी की तरह खड़ा है।'
                },
                {
                  prompt: 'शब्द "न्यारा" का सही तुकांत (rhyming) शब्द कौन सा है?',
                  options: ['प्यारा', 'सूरज', 'पर्वत', 'नदी'],
                  answerIndex: 0,
                  explanation: 'न्यारा और प्यारा दोनों में अंत की ध्वनि एक जैसी है।'
                },
                {
                  prompt: 'दक्षिण में कौन सा महासागर भारत की सीमा को स्पर्श करता है?',
                  options: ['हिंद महासागर', 'प्रशांत महासागर', 'आर्कटिक महासागर'],
                  answerIndex: 0,
                  explanation: 'भारत के दक्षिण में विशाल हिंद महासागर लहराता है।'
                },
                {
                  prompt: 'इस कविता से हमें मुख्य रूप से क्या सीख मिलती है?',
                  options: ['अपनी मातृभूमि से प्रेम करना और उसकी प्राकृतिक सुंदरता का आदर करना', 'पेड़ों को काटना', 'दूसरों से झगड़ा करना'],
                  answerIndex: 0,
                  explanation: 'यह कविता हमें देशप्रेम, एकता और प्राकृतिक पर्यावरण की रक्षा की प्रेरणा देती है।'
                }
              ]
            },
            {
              chapterNumber: 2,
              chapterTitle: 'बया हमारी चिड़िया रानी',
              conceptKey: 'baya-chidya-nest-craft',
              title: 'बया चिड़िया: प्रकृति की कुशल शिल्पी और उसका सुंदर घोंसला',
              objective: 'पशु-पक्षी जगत के प्रति संवेदनशीलता, घोंसला निर्माण की समझ, तथा नए शब्दों का ज्ञान।',
              story: 'बरसात का मौसम था। आम के पेड़ पर एक छोटी सी पीले-भूरे रंग की बया चिड़िया तिनके जोड़ रही थी। रोहन और उसकी छोटी बहन रिया बरामदे में खड़े होकर उसे ध्यान से देख रहे थे। बया अपने नन्हे चोंच से घास के लंबे-पतले रेशे चुनकर लाती और बड़ी कुशलता से उन्हें आपस में बुनती जाती। कुछ ही दिनों में उसने एक सुंदर, बोतल के आकार का लटकता हुआ घोंसला तैयार कर लिया, जिसमें नीचे से अंदर जाने का सुरक्षित रास्ता था! माँ ने बच्चों को बताया: "बया को परिंदों का सबसे बड़ा इंजीनियर कहा जाता है। बिना किसी सूई-धागे के वह हवा में झूलता हुआ इतना मजबूत घोंसला बनाती है कि भारी बारिश और आंधी में भी उसके नन्हे अंडे पूरी तरह सुरक्षित रहते हैं।" बच्चे बया के इस नन्हें शिल्प को देखकर आश्चर्यचकित रह गए।',
              activity: 'सूखे घास के 5-6 तिनके या ऊन के धागे लेकर उन्हें आपस में गूंथने का प्रयास करें। समझें कि चिड़िया को कितनी मेहनत और कौशल की आवश्यकता होती है।',
              guidedSteps: [
                'कहानी को ध्यानपूर्वक पढ़ें और नए शब्दों के अर्थ समझें: तिनका, कुशलता, शिल्पी।',
                'बया के घोंसले की बनावट पर गौर करें—वह उल्टा लटका हुआ क्यों होता है?',
                'पक्षियों के लिए घर की छत या बालकनी में एक कटोरी पानी रखने का संकल्प लें।'
              ],
              teacherPrompt: 'बच्चों को पशु-पक्षियों के प्रति दयालु बनने और पक्षियों के आवास को नष्ट न करने की सीख दें।',
              visualScene: {
                kind: 'baya-hanging-nest',
                elements: [
                  { id: 'baya', label: 'मेहनती बया चिड़िया', color: '#eab308' },
                  { id: 'nest', label: 'घास से बुना लटकता घोंसला', color: '#854d0e' },
                  { id: 'tree', label: 'आम का हरा-भरा पेड़', color: '#15803d' }
                ]
              },
              questions: [
                {
                  prompt: 'बया चिड़िया अपना घोंसला मुख्य रूप से किन चीजों से बनाती है?',
                  options: ['घास के पतले तिनकों और रेशों से बुनकर', 'सीमेंट और लोहे से', 'प्लास्टिक की थैलियों से'],
                  answerIndex: 0,
                  explanation: 'बया अपने नन्हें चोंच से घास के रेशों को बड़ी कुशलता से बुनती है।'
                },
                {
                  prompt: 'बया के घोंसले की क्या विशेषता होती है?',
                  options: ['वह पेड़ की डाली पर उल्टा लटकता हुआ और मजबूत होता है', 'वह जमीन पर खुला पड़ा होता है', 'वह पत्थरों से बना होता है'],
                  answerIndex: 0,
                  explanation: 'बया का घोंसला लटकता हुआ और बारिश-आंधी से पूरी तरह सुरक्षित होता है।'
                },
                {
                  prompt: 'बया चिड़िया से हमें जीवन की कौन सी सबसे बड़ी सीख मिलती है?',
                  options: ['कठिन परिश्रम, धैर्य और शिल्पकला का महत्व', 'आलस्य करना', 'दिन भर सोना'],
                  answerIndex: 0,
                  explanation: 'बया हमें सिखाती है कि धैर्य और निरंतर मेहनत से बड़ा से बड़ा काम संभव है।'
                },
                {
                  prompt: 'गर्मी और बरसात के दिनों में हमें पक्षियों के लिए क्या प्रबंध करना चाहिए?',
                  options: ['छत या बालकनी पर साफ पानी और दाना रखना', 'उन्हें पत्थर मारना', 'उनके घोंसले तोड़ना'],
                  answerIndex: 0,
                  explanation: 'पक्षियों के लिए जल और अन्न की व्यवस्था करना दयालुता का कार्य है।'
                }
              ]
            },
            {
              chapterNumber: 3,
              chapterTitle: 'चंदा मामा',
              conceptKey: 'chanda-mama-phases-night-sky',
              title: 'चंदा मामा: रात का आकाश और चंद्रमा की घटती-बढ़ती कलाएं',
              objective: 'चांद के बदलते आकारों (अमावस्या, पूर्णिमा) का अवलोकन, बाल कल्पना और रोचक कविता।',
              story: 'रात को जब छत पर शीतल चाँदनी फैल जाती है, तो दादी माँ नन्हे कबीर को गोद में लेकर चंदा मामा की कहानी सुनाती हैं। "चंदा मामा दूर के, पुए पकाएं बूर के!" कबीर ने आकाश की ओर उंगली उठाकर पूछा, "दादी माँ, कभी चंदा मामा चांदी की थाली जैसे गोल-मटोल दिखते हैं, और कभी पतली सी हंसिया जैसे मुड़े हुए क्यों हो जाते हैं?" दादी माँ ने मुस्कुराते हुए समझाया: "बेटा, चंद्रमा का अपना कोई प्रकाश नहीं होता; वह सूरज की सुनहरी किरणों से चमकता है। जैसे-जैसे चंद्रमा पृथ्वी के चारों ओर चक्कर लगाता है, उसका धूप वाला हिस्सा हमें अलग-अलग आकारों में दिखाई देता है। जब पूरा गोल चांद दिखाई दे, तो उसे पूर्णिमा कहते हैं, और जब आकाश में चांद बिल्कुल न दिखे, तो उस रात को अमावस्या कहते हैं।" कबीर ने रात के शांत आकाश में तारों और चांद की मधुर शीतलता को निहारा।',
              activity: 'अगले 7 दिनों तक रोज़ रात को आकाश में चांद का आकार देखें और अपनी कॉपी में उसका स्केच बनाएं कि वह घट रहा है या बढ़ रहा है।',
              guidedSteps: [
                'पूर्णिमा (Full Moon) और अमावस्या (New Moon) में अंतर समझें।',
                'चंद्रमा की शीतलता और सूर्य की ऊष्मा की तुलना करें।',
                'चंद्रमा से जुड़ी कोई लोक-कथा या लोरी घर के बड़ों से सुनें।'
              ],
              teacherPrompt: 'खगोल विज्ञान की बुनियादी समझ को बाल-साहित्य और काव्यमय दृष्टिकोण से जोड़कर समझाएं।',
              visualScene: {
                kind: 'lunar-phases-sky',
                elements: [
                  { id: 'fullMoon', label: 'पूर्णिमा का पूर्ण चंद्र', color: '#f8fafc' },
                  { id: 'crescent', label: 'दोज का बाल चंद्र (हंसिया)', color: '#fef08a' },
                  { id: 'stars', label: 'टिमटिमाते तारे', color: '#e2e8f0' }
                ]
              },
              questions: [
                {
                  prompt: 'उस रात को क्या कहते हैं जब आकाश में पूरा गोल और चमकदार चांद दिखाई देता है?',
                  options: ['पूर्णिमा', 'अमावस्या', 'दोपहर', 'संध्या'],
                  answerIndex: 0,
                  explanation: 'पूर्णिमा की रात को चंद्रमा अपनी पूर्ण गोल आकृति में जगमगाता है।'
                },
                {
                  prompt: 'चंद्रमा को अपना प्रकाश कहाँ से मिलता है?',
                  options: ['सूर्य के प्रकाश से परावर्तित होकर', 'बिजली के बल्ब से', 'तारों से चुराकर'],
                  answerIndex: 0,
                  explanation: 'चंद्रमा पर पड़ने वाला सूर्य का प्रकाश परावर्तित होकर हम तक पहुँचता है।'
                },
                {
                  prompt: 'अमावस्या की रात को आकाश कैसा दिखाई देता है?',
                  options: ['चांद नहीं दिखता और रात बहुत घनी अंधेरी होती है', 'चांद दोपहर जैसा चमकता है', 'आकाश लाल हो जाता है'],
                  answerIndex: 0,
                  explanation: 'अमावस्या को चंद्रमा का प्रदीप्त भाग पृथ्वी के सामने नहीं होता, इसलिए चांद नहीं दिखता।'
                },
                {
                  prompt: 'हिंदी व्याकरण में "चंदा" शब्द का समानार्थी (पर्यायवाची) शब्द कौन सा है?',
                  options: ['शशि, चंद्रमा, राकेश', 'सूरज, दिनकर', 'पवन, वायु'],
                  answerIndex: 0,
                  explanation: 'शशि, राकेश, इंदु और चंद्रमा सभी चांद के पर्यायवाची शब्द हैं।'
                }
              ]
            },
            {
              chapterNumber: 4,
              chapterTitle: 'मीना का परिवार',
              conceptKey: 'meena-family-cooperation-values',
              title: 'मीना का परिवार: पारिवारिक सहयोग और रिश्तों की मिठास',
              objective: 'संयुक्त परिवार के महत्व, पारस्परिक स्नेह, तथा घर के छोटे-मोटे कार्यों में हाथ बँटाने की प्रेरणा।',
              story: 'मीना के घर में छह सदस्य रहते हैं: उसके दादा-दादी, माता-पिता, मीना और उसका छोटा भाई सोनू। मीना के दादाजी सवेरे उठकर बागीचे में पौधों को पानी देते हैं और दादी माँ तुलसी के पास दीपक जलाती हैं। पिताजी रसोई में माँ के साथ मिलकर नाश्ता तैयार करते हैं। मीना अपने भाई सोनू को स्कूल के लिए तैयार होने में मदद करती है और दोनों अपने बस्ते रात को ही सजाकर रखते हैं। शाम को जब सब एक साथ बैठकर भोजन करते हैं, तो दादाजी पुराने दिनों की मजेदार कहानियाँ सुनाते हैं। मीना कहती है, "हमारा परिवार एक सुंदर गुलदस्ते की तरह है, जहाँ हर फूल अलग रंग का है लेकिन सब मिलकर पूरे घर को खुशबू से भर देते हैं।" एक दूसरे की सहायता करने से घर का हर काम आसान और आनंदमय बन जाता है।',
              activity: 'अपने परिवार के सभी सदस्यों के नाम और उनके पसंदीदा शौक की एक सुंदर सूची अपनी अभ्यास पुस्तिका में तैयार कीजिए।',
              guidedSteps: [
                'परिवार के सदस्यों के आपसी रिश्तों को पहचानें: चाचा, बुआ, मामा, मौसी।',
                'घर में माता-पिता की सहायता के लिए 2 छोटे कार्य चुनें (जैसे जूते सही जगह रखना, खिलौने समेटना)।',
                'बड़ों के चरण स्पर्श कर उनका आशीर्वाद लेने की आदत डालें।'
              ],
              teacherPrompt: 'नैतिक शिक्षा, पारिवारिक संस्कारों और लिंग-भेदभाव से रहित समान सहयोग की भावना को बढ़ावा दें।',
              visualScene: {
                kind: 'happy-family-home',
                elements: [
                  { id: 'elders', label: 'स्नेही दादा-दादी', color: '#64748b' },
                  { id: 'parents', label: 'परिश्रमी माता-पिता', color: '#0284c7' },
                  { id: 'children', label: 'हंसते-खेलते मीना और सोनू', color: '#f59e0b' }
                ]
              },
              questions: [
                {
                  prompt: 'मीना के परिवार में सवेरे पौधों को पानी कौन देता है?',
                  options: ['दादाजी', 'पड़ोसी', 'माली'],
                  answerIndex: 0,
                  explanation: 'दादाजी सवेरे उठकर बागीचे के पेड़-पौधों की देखभाल और सिंचाई करते हैं।'
                },
                {
                  prompt: 'मीना ने अपने परिवार की तुलना किस सुंदर वस्तु से की है?',
                  options: ['एक रंग-बिरंगे खुशबूदार गुलदस्ते से', 'एक बंद बक्से से', 'एक पुरानी किताब से'],
                  answerIndex: 0,
                  explanation: 'मीना कहती है कि उसका परिवार एक सुंदर गुलदस्ते की तरह एकजुट और खुशहाल है।'
                },
                {
                  prompt: 'घर के कामों में एक-दूसरे की सहायता करने से क्या लाभ होता है?',
                  options: ['काम जल्दी पूरा होता है और आपसी प्रेम बढ़ता है', 'सब आपस में लड़ते हैं', 'कोई फायदा नहीं होता'],
                  answerIndex: 0,
                  explanation: 'सहयोग से कार्य सुगम हो जाता है और पारिवारिक आत्मीयता प्रगाढ़ होती है।'
                },
                {
                  prompt: 'शब्द "परिवार" का शुद्ध वर्ण-विच्छेद क्या है?',
                  options: ['प् + अ + र् + इ + व् + आ + र् + अ', 'प् + आ + र् + ई + व् + अ', 'प् + र् + व् + र्'],
                  answerIndex: 0,
                  explanation: 'प् + अ (प) + र् + इ (रि) + व् + आ (वा) + र् + अ (र) मिलकर "परिवार" बनता है।'
                }
              ]
            },
            {
              chapterNumber: 5,
              chapterTitle: 'सीख',
              conceptKey: 'seekh-honesty-perseverance',
              title: 'सच्ची सीख: ईमानदारी, विनम्रता और समय का मूल्य',
              objective: 'सदाचार, सत्यनिष्ठा तथा संकट के समय धैर्य बनाए रखने के जीवन-मूल्यों को आत्मसात करना।',
              story: 'एक बार एक गाँव में गुरुजी अपने गुरुकुल के शिष्यों को जीवन की सबसे बड़ी सीख दे रहे थे। उन्होंने मेज पर पानी से भरा एक मिट्टी का घड़ा रखा और पूछा, "यदि इस घड़े में एक छोटा सा छेद हो, तो क्या इसमें पानी टिक पाएगा?" एक शिष्य ने तुरंत उत्तर दिया, "नहीं गुरुजी! धीरे-धीरे सारा पानी रिसकर बह जाएगा।" गुरुजी ने मुस्कुराकर समझाया: "बिल्कुल ठीक! इसी प्रकार मनुष्य का चरित्र भी एक घड़े के समान है। यदि उसमें झूठ, कपट या बेईमानी का एक भी छोटा छेद हो जाए, तो उसके सारे गुण और मान-सम्मान धीरे-धीरे नष्ट हो जाते हैं। सदा सत्य बोलो, अपने वचनों के पक्के रहो, और किसी निर्बल को कभी कष्ट मत पहुँचाओ।" गुरुजी की यह अमूल्य सीख शिष्यों ने अपने हृदय में सदा के लिए धारण कर ली।',
              activity: 'आज पूरे दिन केवल सच बोलने और किसी से भी कटु वचन न बोलने का एक दिन का सत्य-संकल्प लीजिए।',
              guidedSteps: [
                'सत्य और ईमानदारी का अपने दैनिक जीवन में उदाहरण खोजें।',
                'गलती हो जाने पर उसे छुपाने के बजाय साहसपूर्वक स्वीकार करने का अभ्यास करें।',
                'विनम्र भाषा के प्रयोग से मित्र बनाने की कला सीखें।'
              ],
              teacherPrompt: 'कक्षा में बच्चों को सत्यनिष्ठा और नैतिक साहस के वास्तविक उदाहरणों से प्रेरित करें।',
              visualScene: {
                kind: 'gurukula-wisdom',
                elements: [
                  { id: 'clayPot', label: 'सद्गुणों का मिट्टी का घड़ा', color: '#b45309' },
                  { id: 'guruji', label: 'प्रबुद्ध गुरुजी', color: '#ea580c' },
                  { id: 'water', label: 'पवित्र ज्ञान की निर्मल धारा', color: '#0284c7' }
                ]
              },
              questions: [
                {
                  prompt: 'गुरुजी ने मनुष्य के चरित्र की तुलना किस वस्तु से की?',
                  options: ['पानी से भरे मिट्टी के घड़े से', 'लोहे की संदूक से', 'कांच की चूड़ी से'],
                  answerIndex: 0,
                  explanation: 'गुरुजी ने समझाया कि चरित्र पानी से भरे घड़े की तरह अनमोल होता है।'
                },
                {
                  prompt: 'यदि घड़े में छोटा सा छेद हो, तो क्या होता है?',
                  options: ['सारा पानी रिसकर बह जाता है', 'पानी और बढ़ जाता है', 'घड़ा सोने का बन जाता है'],
                  answerIndex: 0,
                  explanation: 'एक छोटे से छेद से भी धीरे-धीरे सारा संचित जल बहकर खाली हो जाता है।'
                },
                {
                  prompt: 'जब हमसे कोई अनजानी भूल या गलती हो जाए, तो हमें क्या करना चाहिए?',
                  options: ['सच्चाई से अपनी भूल मानकर क्षमा मांगनी चाहिए', 'दूसरों पर झूठा दोष मढ़ना चाहिए', 'झूठ बोलकर भागना चाहिए'],
                  answerIndex: 0,
                  explanation: 'नैतिक साहस का अर्थ है अपनी गलती स्वीकार करना और उसे सुधारना।'
                },
                {
                  prompt: 'विलोम शब्द बताइए: "सत्य" का विलोम क्या होगा?',
                  options: ['असत्य (झूठ)', 'पुण्य', 'धर्म', 'सरल'],
                  answerIndex: 0,
                  explanation: 'सत्य का विपरीतार्थक शब्द असत्य अथवा झूठ होता है।'
                }
              ]
            }
          ]
        },
        {
          name: 'Kannada',
          book: 'Savirudi ಸಾವಿರುಚಿ / Nali Kali (KTBS Class 3)',
          source: 'https://ktbs.kar.nic.in/New/index.html#!/textbook',
          status: 'source_chapters_verified',
          chapters: [
            'ಕನ್ನಡ ಅಕ್ಷರಮಾಲೆ ಮತ್ತು ಗಿಳಿ',
            'ಪ್ರಕೃತಿಯ ಚೆಲುವು',
            'ನಾವೆಲ್ಲರೂ ಒಂದೇ',
            'ಪ್ರಾಣಿ-ಪಕ್ಷಿಗಳ ಲೋಕ',
            'ಹಬ್ಬಗಳ ಸಂಭ್ರಮ'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'ಕನ್ನಡ ಅಕ್ಷರಮಾಲೆ ಮತ್ತು ಗಿಳಿ',
              conceptKey: 'kannada-aksharamale-swara-vyanjana',
              title: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆ: ಸ್ವರಗಳು, ವ್ಯಂಜನಗಳು ಮತ್ತು ಮುದ್ದಾದ ಗಿಳಿ',
              objective: 'ಕನ್ನಡ ಅಕ್ಷರಮಾಲೆಯ ಸ್ವರ (ಅ-ಔ), ಯೋಗವಾಹ (ಅಂ, ಅಃ) ಮತ್ತು ವ್ಯಂಜನಗಳ ಸರಿಯಾದ ಉಚ್ಚಾರಣೆ ಮತ್ತು ಬರವಣಿಗೆಯನ್ನು ಕಲಿಯುವುದು.',
              story: 'ಹಚ್ಚಹಸಿರಾದ ಮಲೆನಾಡಿನ ತೋಟದಲ್ಲಿ ರವಿ ಮತ್ತು ಅವನ ಪುಟ್ಟ ತಂಗಿ ಶ್ರುತಿ ಅಜ್ಜನ ಜೊತೆ ಕುಳಿತಿದ್ದರು. ಅಡಿಕೆ ಮರದ ತುದಿಯಲ್ಲಿ ಒಂದು ಸುಂದರವಾದ ಹಸಿರು ಗಿಳಿ ಕುಳಿತು "ಚಿಂವ್ ಚಿಂವ್" ಎಂದು ಕಲರವ ಮಾಡುತ್ತಿತ್ತು. ಅಜ್ಜ ಹೇಳಿದರು: "ಮಕ್ಕಳೇ, ನಮ್ಮ ಕನ್ನಡ ಭಾಷೆ ಜೇನಿನಂತೆ ಮಧುರವಾದದ್ದು. ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ೧೪ ಸ್ವರಗಳು, ೨ ಯೋಗವಾಹಗಳು ಮತ್ತು ೩೪ ವ್ಯಂಜನಗಳಿವೆ. \'ಅ\' ಎಂದರೆ ಅಮ್ಮ, \'ಆ\' ಎಂದರೆ ಆನೆ, \'ಇ\' ಎಂದರೆ ಇಲಿ, \'ಈ\' ಎಂದರೆ ಈಜು!" ಗಿಳಿಯು ಅಜ್ಜನ ಮಾತುಗಳನ್ನು ಕೇಳಿ ತನ್ನ ಕೆಂಪು ಕೊಕ್ಕಿನಿಂದ ಮರದ ಹಣ್ಣನ್ನು ಕುಕ್ಕುತ್ತಾ ಮುದ್ದಾಗಿ ತಲೆಯಾಡಿಸಿತು. ಮಕ್ಕಳು ಅಜ್ಜನೊಡನೆ ಸ್ವರಗಳನ್ನು ಹಾಡುತ್ತಾ ಅಕ್ಷರಗಳನ್ನು ಮರಳಿನ ಮೇಲೆ ಬೆರಳಿನಿಂದ ತಿದ್ದಿ ಅಭ್ಯಾಸ ಮಾಡಿದರು.',
              activity: 'ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಸಿಗುವ ಬೀಜಗಳಿಂದ ಅಥವಾ ಹೂವಿನ ದಳಗಳಿಂದ \'ಅ\', \'ಆ\', \'ಕ\', \'ರ\' ಅಕ್ಷರಗಳ ಆಕಾರವನ್ನು ನೆಲದ ಮೇಲೆ ರಂಗೋಲಿಯಂತೆ ರಚಿಸಿ.',
              guidedSteps: [
                'ಸ್ವರಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಉಚ್ಚರಿಸಿ: ಅ, ಆ, ಇ, ಈ, ಉ, ಊ, ಋ, ಎ, ಏ, ಐ, ಒ, ಓ, ಔ.',
                'ಯೋಗವಾಹಗಳನ್ನು ಗುರುತಿಸಿ: ಅಂ (ಅನುಸ್ವಾರ), ಅಃ (ವಿಸರ್ಗ).',
                'ಕನ್ನಡದ ಮೊದಲ ವ್ಯಂಜನ \'ಕ\'ದಿಂದ ಪ್ರಾರಂಭವಾಗುವ ಮೂರು ಪದಗಳನ್ನು ಹೇಳಿ (ಕಮಲ, ಕಾಗೆ, ಕಣ್ಣು).'
              ],
              teacherPrompt: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆಯ ಅಕ್ಷರ ಸಂಯೋಜನೆ ಮತ್ತು ಅಕ್ಷರಗಳನ್ನು ಸ್ಪಷ್ಟ ಸ್ವರಭೇದದೊಂದಿಗೆ ಉಚ್ಚರಿಸುವುದನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿಸಿ.',
              visualScene: {
                kind: 'kannada-alphabet-garden',
                elements: [
                  { id: 'parrot', label: 'ಹಸಿರು ಬಣ್ಣದ ಮುದ್ದಾದ ಗಿಳಿ', color: '#16a34a' },
                  { id: 'akshara', label: 'ಕನ್ನಡ ಸ್ವರಾಕ್ಷರಗಳು (ಅ, ಆ, ಇ, ಈ)', color: '#d97706' },
                  { id: 'areca', label: 'ತಂಪಾದ ಮಲೆನಾಡಿನ ಅಡಿಕೆ ತೋಟ', color: '#15803d' }
                ]
              },
              questions: [
                {
                  prompt: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಒಟ್ಟು ಎಷ್ಟು ಸ್ವರಾಕ್ಷರಗಳಿವೆ?',
                  options: ['೧೪ (ಹದಿನಾಲ್ಕು)', '೧೦', '೨೬', '೫೦'],
                  answerIndex: 0,
                  explanation: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಅ ದಿಂದ ಔ ವರೆಗೆ ಒಟ್ಟು ೧೪ ಸ್ವರಗಳಿವೆ.'
                },
                {
                  prompt: '\'ಅಂ\' ಮತ್ತು \'ಅಃ\' ಅಕ್ಷರಗಳನ್ನು ವ್ಯಾಕರಣದಲ್ಲಿ ಏನೆಂದು ಕರೆಯುತ್ತಾರೆ?',
                  options: ['ಯೋಗವಾಹಗಳು (ಅನುಸ್ವಾರ ಮತ್ತು ವಿಸರ್ಗ)', 'ವ್ಯಂಜನಗಳು', 'ಗುಣಿತಾಕ್ಷರಗಳು'],
                  answerIndex: 0,
                  explanation: 'ಅಂ (ಅನುಸ್ವಾರ) ಮತ್ತು ಅಃ (ವಿಸರ್ಗ) ಇವೆರಡನ್ನು ಯೋಗವಾಹಗಳು ಎನ್ನಲಾಗುತ್ತದೆ.'
                },
                {
                  prompt: '\'ಕ\' ಅಕ್ಷರದಿಂದ ಶುರುವಾಗುವ ಸರಿಯಾದ ಪದ ಯಾವುದು?',
                  options: ['ಕಮಲ', 'ಆನೆ', 'ಊಟ', 'ಇಲಿ'],
                  answerIndex: 0,
                  explanation: 'ಕಮಲ ಪದವು ಮೊದಲ ವ್ಯಂಜನ \'ಕ\'ದಿಂದ ಆರಂಭವಾಗುತ್ತದೆ.'
                },
                {
                  prompt: 'ನಮ್ಮ ರಾಜ್ಯದ ಅಧಿಕೃತ ಮಾತೃಭಾಷೆ ಯಾವುದು?',
                  options: ['ಕನ್ನಡ', 'ತೆಲುಗು', 'ಇಂಗ್ಲಿಷ್', 'ಮರಾಠಿ'],
                  answerIndex: 0,
                  explanation: 'ಕರ್ನಾಟಕದ ಅಧಿಕೃತ ಭಾಷೆ ಕನ್ನಡವಾಗಿದ್ದು, ಇದು ಅತ್ಯಂತ ಪ್ರಾಚೀನ ಶಾಸ್ತ್ರೀಯ ಭಾಷೆಯಾಗಿದೆ.'
                }
              ]
            },
            {
              chapterNumber: 2,
              chapterTitle: 'ಪ್ರಕೃತಿಯ ಚೆಲುವು',
              conceptKey: 'prakruti-cheluvu-nature-trees',
              title: 'ಪ್ರಕೃತಿಯ ಚೆಲುವು: ಹಸಿರು ವನಸಿರಿ, ಗಿಡಮರಗಳು ಮತ್ತು ಜಲಧಾರೆ',
              objective: 'ಕರ್ನಾಟಕದ ಪ್ರಾಕೃತಿಕ ಸಂಪತ್ತು, ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಅರಣ್ಯ, ನದಿಗಳು ಮತ್ತು ಪರಿಸರ ಸಂರಕ್ಷಣೆಯ ಮಹತ್ವವನ್ನು ಅರಿಯುವುದು.',
              story: 'ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆಯ ಜೋಗ ಜಲಪಾತದ ಬಳಿ ಪ್ರವಾಸಕ್ಕೆ ಹೋದಾಗ ಚೇತನ್ ಮತ್ತು ಕಾವ್ಯ ಬೆರಗುಗಣ್ಣಿನಿಂದ ನೋಡಿದರು. ಶರಾವತಿ ನದಿಯ ನೀರು ರಾಜ, ರೋರರ್, ರಾಕೆಟ್ ಮತ್ತು ರಾಣಿ ಎಂಬ ನಾಲ್ಕು ಕವಲುಗಳಾಗಿ ಭೋರ್ಗರೆಯುತ್ತಾ ಆಳವಾದ ಕಣಿವೆಗೆ ಧುಮುಕುತ್ತಿತ್ತು! ಸುತ್ತಲೂ ಹರಡಿದ್ದ ದಟ್ಟವಾದ ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಕಾಡುಗಳಲ್ಲಿ ಹಕ್ಕಿಗಳು ಮಧುರವಾಗಿ ಹಾಡುತ್ತಿದ್ದವು. ಶಿಕ್ಷಕಿ ಪೂರ್ಣಿಮಾ ಮೇಡಂ ಹೇಳಿದರು: "ಮಕ್ಕಳೇ, ಮರಗಳು ನಮಗೆ ಉಸಿರಾಡಲು ಶುದ್ಧ ಆಮ್ಲಜನಕ, ಮಳೆ, ನೆರಳು ಮತ್ತು ಸಿಹಿಯಾದ ಹಣ್ಣುಗಳನ್ನು ನೀಡುತ್ತವೆ. ಪ್ರಕೃತಿಯನ್ನು ಪ್ರೀತಿಸುವುದು ಎಂದರೆ ನಮ್ಮ ಜೀವವನ್ನು ಕಾಪಾಡಿಕೊಂಡಂತೆ. ಪ್ರತಿಯೊಬ್ಬರೂ ತಮ್ಮ ಜನ್ಮದಿನದಂದು ಕನಿಷ್ಠ ಒಂದು ಸಸಿಯನ್ನು ನೆಟ್ಟು ಪೋಷಿಸಬೇಕು." ಮಕ್ಕಳು ಕೈಮುಗಿದು ಪರಿಸರವನ್ನು ಎಂದಿಗೂ ಹಾಳುಗೆಡವುವುದಿಲ್ಲವೆಂದು ಪ್ರತಿಜ್ಞೆ ಮಾಡಿದರು.',
              activity: 'ನಿಮ್ಮ ಶಾಲೆಯ ಅಥವಾ ಮನೆಯ ಕೈತೋಟದಲ್ಲಿ ಒಂದು ಸಣ್ಣ ಹೂವಿನ ಸಸಿಯನ್ನು ನೆಟ್ಟು ಅದಕ್ಕೆ ಪ್ರತಿದಿನ ನೀರೆರೆಯಿರಿ.',
              guidedSteps: [
                'ಜಲಪಾತ ಮತ್ತು ನದಿಗಳ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ತಿಳಿಯಿರಿ.',
                'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು ಕರ್ನಾಟಕಕ್ಕೆ ತರುವ ಮಳೆಯ ಮಹತ್ವವನ್ನು ಚರ್ಚಿಸಿ.',
                'ಪ್ಲಾಸ್ಟಿಕ್ ಕಸವನ್ನು ನದಿ ಅಥವಾ ಕಾಡುಗಳಲ್ಲಿ ಎಸೆಯಬಾರದು ಎಂಬ ನಿಯಮವನ್ನು ಪಾಲಿಸಿ.'
              ],
              teacherPrompt: 'ಮಕ್ಕಳಿಗೆ ನೈಸರ್ಗಿಕ ಜಲಮೂಲಗಳ ರಕ್ಷಣೆ ಮತ್ತು ಕರ್ನಾಟಕದ ಜೀವವೈವಿಧ್ಯದ ಬಗ್ಗೆ ಹೆಮ್ಮೆ ಮೂಡಿಸಿ.',
              visualScene: {
                kind: 'jog-falls-karnataka',
                elements: [
                  { id: 'waterfall', label: 'ಜೋಗದ ಭೋರ್ಗರೆವ ಜಲಧಾರೆ', color: '#38bdf8' },
                  { id: 'westernGhats', label: 'ಹಚ್ಚಹಸಿರಿನ ಸಹ್ಯಾದ್ರಿ ಪರ್ವತ', color: '#166534' },
                  { id: 'rainbow', label: 'ನೀರಿನ ತುಂತುರಿನಲ್ಲಿ ಮೂಡಿದ ಕಾಮನಬಿಲ್ಲು', color: '#ec4899' }
                ]
              },
              questions: [
                {
                  prompt: 'ವಿಶ್ವಪ್ರಸಿದ್ಧ ಜೋಗ ಜಲಪಾತವು ಕರ್ನಾಟಕದ ಯಾವ ನದಿಯಿಂದ ಸೃಷ್ಟಿಯಾಗಿದೆ?',
                  options: ['ಶರಾವತಿ ನದಿ', 'ಕಾವೇರಿ ನದಿ', 'ತುಂಗಭದ್ರಾ ನದಿ', 'ಕೃಷ್ಣಾ ನದಿ'],
                  answerIndex: 0,
                  explanation: 'ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆಯ ಶರಾವತಿ ನದಿಯು ಜೋಗದಲ್ಲಿ ಭವ್ಯ ಜಲಪಾತವನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.'
                },
                {
                  prompt: 'ಮರಗಳು ನಮಗೆ ಉಸಿರಾಡಲು ನೀಡುವ ಅತ್ಯಮೂಲ್ಯ ಅನಿಲ ಯಾವುದು?',
                  options: ['ಆಮ್ಲಜನಕ (Oxygen)', 'ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್', 'ಹೊಗೆ', 'ಧೂಳು'],
                  answerIndex: 0,
                  explanation: 'ಸಸ್ಯಗಳು ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯ ಮೂಲಕ ನಮಗೆ ಜೀವವಾಯುವಾದ ಆಮ್ಲಜನಕವನ್ನು ನೀಡುತ್ತವೆ.'
                },
                {
                  prompt: '\'ಗಿಡ\' ಪದದ ಬಹುವಚನ ರೂಪ ಯಾವುದು?',
                  options: ['ಗಿಡಗಳು', 'ಗಿಡನು', 'ಗಿಡದ', 'ಗಿಡಕ್ಕೆ'],
                  answerIndex: 0,
                  explanation: 'ಕನ್ನಡ ವ್ಯಾಕರಣದಲ್ಲಿ ನಾಮಪದಕ್ಕೆ \'ಗಳು\' ಪ್ರತ್ಯಯ ಸೇರಿ ಬಹುವಚನವಾಗುತ್ತದೆ (ಗಿಡ + ಗಳು = ಗಿಡಗಳು).'
                },
                {
                  prompt: 'ಪರಿಸರ ದಿನಾಚರಣೆಯನ್ನು ಪ್ರತಿ ವರ್ಷ ಯಾವ ದಿನಾಂಕದಂದು ಆಚರಿಸಲಾಗುತ್ತದೆ?',
                  options: ['ಜೂನ್ ೫', 'ಆಗಸ್ಟ್ ೧೫', 'ಜನವರಿ ೨೬', 'ನವೆಂಬರ್ ೧'],
                  answerIndex: 0,
                  explanation: 'ವಿಶ್ವ ಪರಿಸರ ದಿನವನ್ನು ಜೂನ್ ೫ ರಂದು ಪರಿಸರ ಜಾಗೃತಿಗಾಗಿ ಆಚರಿಸಲಾಗುತ್ತದೆ.'
                }
              ]
            },
            {
              chapterNumber: 3,
              chapterTitle: 'ನಾವೆಲ್ಲರೂ ಒಂದೇ',
              conceptKey: 'navellaru-onde-unity-equality',
              title: 'ನಾವೆಲ್ಲರೂ ಒಂದೇ: ಸೌಹಾರ್ದತೆ, ಸಮಾನತೆ ಮತ್ತು ಸಹಬಾಳ್ವೆ',
              objective: 'ಜಾತಿ, ಮತ, ಭೇದವಿಲ್ಲದೆ ಎಲ್ಲ ಮಾನವರೂ ಸಮಾನರೆಂಬ ಬಸವಣ್ಣನವರ ವಚನ ಸಂದೇಶ ಮತ್ತು ಸಹೋದರತ್ವವನ್ನು ಅರಿಯುವುದು.',
              story: 'ಕೂಡಲಸಂಗಮದ ಐತಿಹಾಸಿಕ ನೆಲೆಯಲ್ಲಿ ಶಾಲಾ ಮಕ್ಕಳ ಸಾಂಸ್ಕೃತಿಕ ಸಮ್ಮೇಳನ ನಡೆಯುತ್ತಿತ್ತು. ವಿವಿಧ ಊರುಗಳಿಂದ ಬಂದಿದ್ದ ಆನಂದ್, ಫಾತಿಮಾ, ಜೋಸೆಫ್ ಮತ್ತು ಮಂಜುಳಾ ಒಟ್ಟಿಗೆ ಕುಳಿತು ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಯೂಟವನ್ನು ಹಂಚಿಕೊಂಡು ಸವಿಯುತ್ತಿದ್ದರು. ಅಧ್ಯಾಪಕ ಬಸವರಾಜ್ ಸರ್ ಬಸವಣ್ಣನವರ ಪ್ರಸಿದ್ಧ ವಚನವನ್ನು ಹಾಡಿದರು: "ಇವನಾರವ ಇವನಾರವ ಇವನಾರವನೆಂದೆನಿಸದಿರಯ್ಯ; ಇವ ನಮ್ಮವ ಇವ ನಮ್ಮವ ಇವ ನಮ್ಮವನೆಂದೆನಿಸಯ್ಯ." ಈ ವಚನದ ಅರ್ಥವನ್ನು ವಿವರಿಸುತ್ತಾ: "ಯಾರನ್ನೂ ಪರಕೀಯರೆಂದು ಭಾವಿಸದೆ, ಎಲ್ಲರನ್ನೂ ನಮ್ಮವರೆಂದು ಅಪ್ಪಿಕೊಳ್ಳುವುದೇ ನಿಜವಾದ ಧರ್ಮ. ನಾವೆಲ್ಲರೂ ಒಂದೇ ತಾಯಿಯ ಮಕ್ಕಳಂತೆ ಸ್ನೇಹ ಮತ್ತು ಸೌಹಾರ್ದತೆಯಿಂದ ಬಾಳಬೇಕು." ಮಕ್ಕಳು ಒಬ್ಬರನ್ನೊಬ್ಬರು ಪ್ರೀತಿಯಿಂದ ಅಪ್ಪಿಕೊಂಡು ನಾವೆಲ್ಲರೂ ಒಂದೇ ಎಂದು ಘೋಷಿಸಿದರು.',
              activity: 'ನಿಮ್ಮ ತರಗತಿಯ ಎಲ್ಲ ಸ್ನೇಹಿತರ ಹೆಸರುಗಳನ್ನು ಬರೆದು, ಅವರಲ್ಲಿರುವ ಒಂದೊಂದು ಉತ್ತಮ ಗುಣವನ್ನು ಗುರುತಿಸಿ ಪಟ್ಟಿ ಮಾಡಿ.',
              guidedSteps: [
                'ಬಸವಣ್ಣನವರ "ಇವ ನಮ್ಮವ" ವಚನದ ಸರಳ ಭಾವಾರ್ಥವನ್ನು ಕಂಠಪಾಠ ಮಾಡಿ.',
                'ತರಗತಿಯಲ್ಲಿ ಎಲ್ಲರೊಂದಿಗೆ ಭೇದಭಾವವಿಲ್ಲದೆ ಬೆರೆಯುವ ಮನೋಭಾವ ಬೆಳೆಸಿಕೊಳ್ಳಿ.',
                'ಯಾವುದೇ ಸ್ನೇಹಿತನಿಗೆ ಕಷ್ಟ ಬಂದಾಗ ಬೆಂಬಲವಾಗಿ ನಿಲ್ಲುವ ಸಂಕಲ್ಪ ಮಾಡಿ.'
              ],
              teacherPrompt: 'ಶರಣರ ಸಮಾನತೆಯ ಸಂದೇಶ ಮತ್ತು ಸಂವಿಧಾನದ ಭ್ರಾತೃತ್ವದ ಮೌಲ್ಯಗಳನ್ನು ಕಥೆಯ ಮೂಲಕ ತಿಳಿಸಿಕೊಡಿ.',
              visualScene: {
                kind: 'harmony-sangama',
                elements: [
                  { id: 'children', label: 'ಸಂತಸದಿಂದ ಊಟ ಹಂಚಿಕೊಳ್ಳುವ ಮಕ್ಕಳು', color: '#f59e0b' },
                  { id: 'vachana', label: 'ಬಸವಣ್ಣನವರ ವಚನದ ಫಲಕ', color: '#b45309' },
                  { id: 'riverSangama', label: 'ಕೃಷ್ಣಾ-ಮಲಪ್ರಭಾ ನದಿಗಳ ಸಂಗಮ', color: '#0284c7' }
                ]
              },
              questions: [
                {
                  prompt: '"ಇವ ನಮ್ಮವ ಇವ ನಮ್ಮವ" ಎಂಬ ಸುಪ್ರಸಿದ್ಧ ವಚನವನ್ನು ರಚಿಸಿದ ಕ್ರಾಂತಿಕಾರಿ ಸಂತ ಯಾರು?',
                  options: ['ಜಗದ್ಜ್ಯೋತಿ ಬಸವಣ್ಣನವರು', 'ಕುಮಾರವ್ಯಾಸ', 'ಪಂಪ', 'ರನ್ನ'],
                  answerIndex: 0,
                  explanation: '೧೨ನೇ ಶತಮಾನದ ಸಮಾಜ ಸುಧಾರಕ ಬಸವಣ್ಣನವರು ಸಮಾನತೆಯ ಈ ವಚನವನ್ನು ರಚಿಸಿದರು.'
                },
                {
                  prompt: 'ಈ ಪಾಠದಿಂದ ಮಕ್ಕಳಿಗೆ ಸಿಗುವ ಶ್ರೇಷ್ಠ ಸಂದೇಶವೇನು?',
                  options: ['ನಾವೆಲ್ಲರೂ ಒಂದೇ, ಭೇದಭಾವವಿಲ್ಲದೆ ಪ್ರೀತಿಯಿಂದ ಬಾಳಬೇಕು', 'ಸ್ನೇಹಿತರೊಂದಿಗೆ ಜಗಳವಾಡಬೇಕು', 'ಒಬ್ಬರೇ ಊಟ ಮಾಡಬೇಕು'],
                  answerIndex: 0,
                  explanation: 'ಎಲ್ಲ ಮಾನವರೂ ಸಮಾನರು ಮತ್ತು ಸೌಹಾರ್ದತೆಯಿಂದ ಜೀವಿಸಬೇಕು ಎಂಬುದು ಮುಖ್ಯ ಆಶಯ.'
                },
                {
                  prompt: '\'ಸ್ನೇಹ\' ಪದದ ಅರ್ಥವೇನು?',
                  options: ['ಗೆಳೆತನ / ಮೈತ್ರಿ', 'ಕೋಪ', 'ಹಗೆತನ', 'ಭಯ'],
                  answerIndex: 0,
                  explanation: 'ಸ್ನೇಹ ಎಂದರೆ ಗೆಳೆತನ, ಪ್ರೀತಿ ಮತ್ತು ಪರಸ್ಪರ ವಿಶ್ವಾಸ.'
                },
                {
                  prompt: 'ಶಾಲೆಯಲ್ಲಿ ನಾವು ಸ್ನೇಹಿತರೊಂದಿಗೆ ಹೇಗೆ ವರ್ತಿಸಬೇಕು?',
                  options: ['ಗೌರವ, ಪ್ರೀತಿ ಮತ್ತು ಸಹಕಾರದಿಂದ', 'ಕೀಟಲೆ ಮಾಡುತ್ತಾ', 'ಅವಮಾನಿಸುತ್ತಾ'],
                  answerIndex: 0,
                  explanation: 'ಪರಸ್ಪರ ಗೌರವ ಮತ್ತು ಸ್ನೇಹಪರತೆಯು ತರಗತಿಯ ವಾತಾವರಣವನ್ನು ಆನಂದದಾಯಕವಾಗಿಸುತ್ತದೆ.'
                }
              ]
            },
            {
              chapterNumber: 4,
              chapterTitle: 'ಪ್ರಾಣಿ-ಪಕ್ಷಿಗಳ ಲೋಕ',
              conceptKey: 'prani-pakshi-loka-habitats',
              title: 'ಪ್ರಾಣಿ-ಪಕ್ಷಿಗಳ ವಿಸ್ಮಯ ಲೋಕ: ವಾಸಸ್ಥಾನ ಮತ್ತು ಆಹಾರ ಪದ್ಧತಿ',
              objective: 'ಕರ್ನಾಟಕದ ಕಾಡುಗಳಲ್ಲಿರುವ ಪ್ರಾಣಿ-ಪಕ್ಷಿಗಳು (ಆನೆ, ಹುಲಿ, ಕರಡಿ, ನವಿಲು), ಅವುಗಳ ವಾಸಸ್ಥಾನ ಮತ್ತು ಆಹಾರ ವೈವಿಧ್ಯವನ್ನು ಅರಿಯುವುದು.',
              story: 'ಬಂಡೀಪುರ ರಾಷ್ಟ್ರೀಯ ಉದ್ಯಾನವನದಲ್ಲಿ ಸಫಾರಿ ಜೀಪಿನಲ್ಲಿ ಹೋಗುತ್ತಿದ್ದಾಗ ಅರಣ್ಯಾಧಿಕಾರಿ ಸೋಮಣ್ಣ ಮಕ್ಕಳಿಗೆ ವನ್ಯಜೀವಿಗಳ ಪರಿಚಯ ಮಾಡಿಕೊಟ್ಟರು. ಮುಂಭಾಗದ ಬಿದಿರು ಮೆಳೆಯಲ್ಲಿ ಗಜರಾಜ ಆನೆಗಳ ಹಿಂಡು ಪ್ರಶಾಂತವಾಗಿ ಎಲೆಗಳನ್ನು ತಿನ್ನುತ್ತಿತ್ತು. ಸ್ವಲ್ಪ ದೂರದಲ್ಲಿ ಬಂಡೆಯ ಮೇಲೆ ನಮ್ಮ ರಾಷ್ಟ್ರಪಕ್ಷಿ ನವಿಲು ತನ್ನ ವರ್ಣರಂಜಿತ ಗರಿಗಳನ್ನು ಬಿಚ್ಚಿ ನಾಟ್ಯವಾಡುತ್ತಿತ್ತು! ಸೋಮಣ್ಣ ವಿವರಿಸಿದರು: "ನೋಡಿ ಮಕ್ಕಳೇ, ಪ್ರಾಣಿಗಳಲ್ಲಿ ಸಸ್ಯಾಹಾರಿ (ಗಿಡ-ಮರ ತಿನ್ನುವ ಜಿಂಕೆ, ಆನೆ) ಮತ್ತು ಮಾಂಸಾಹಾರಿ (ಹುಲಿ, ಚಿರತೆ) ಎಂಬ ವಿಭಾಗಗಳಿವೆ. ಕಾಡು ಪ್ರಾಣಿಗಳು ಕಾಡಿನ ಸಮತೋಲನವನ್ನು ಕಾಪಾಡುತ್ತವೆ. ಹುಲಿಯು ಕಾಡಿನ ಆರೋಗ್ಯದ ಸಂಕೇತವಾಗಿದೆ. ಕಾಡುಗಳನ್ನು ಕಡಿದರೆ ವನ್ಯಜೀವಿಗಳಿಗೆ ಮನೆ ಇಲ್ಲದಂತಾಗುತ್ತದೆ." ಮಕ್ಕಳು ಪ್ರಾಣಿಗಳ ಸ್ವಾತಂತ್ರ್ಯವನ್ನು ನೋಡಿ ಸಂಭ್ರಮಿಸಿದರು.',
              activity: 'ನಿಮ್ಮ ಮನೆಯ ಹತ್ತಿರ ಕಾಣಸಿಗುವ ೪ ಸಾಕುಪ್ರಾಣಿಗಳು ಮತ್ತು ೪ ಕಾಡುಪ್ರಾಣಿಗಳ ಹೆಸರುಗಳನ್ನು ಪ್ರತ್ಯೇಕ ಕಾಲಮ್‌ಗಳಲ್ಲಿ ಬರೆಯಿರಿ.',
              guidedSteps: [
                'ಸಸ್ಯಾಹಾರಿ ಮತ್ತು ಮಾಂಸಾಹಾರಿ ಪ್ರಾಣಿಗಳ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.',
                'ನಮ್ಮ ರಾಷ್ಟ್ರೀಯ ಪ್ರಾಣಿ ಹುಲಿ ಮತ್ತು ರಾಷ್ಟ್ರೀಯ ಪಕ್ಷಿ ನವಿಲು ಎಂದು ನೆನಪಿಡಿ.',
                'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ರಾಷ್ಟ್ರೀಯ ಉದ್ಯಾನಗಳ ಹೆಸರುಗಳನ್ನು ತಿಳಿಯಿರಿ (ಬಂಡೀಪುರ, ನಾಗರಹೊಳೆ).'
              ],
              teacherPrompt: 'ವನ್ಯಜೀವಿ ಸಂರಕ್ಷಣೆ ಮತ್ತು ಕಾಡುಗಳನ್ನು ರಕ್ಷಿಸುವ ತುರ್ತು ಅಗತ್ಯವನ್ನು ಮಕ್ಕಳಿಗೆ ಮನದಟ್ಟು ಮಾಡಿ.',
              visualScene: {
                kind: 'bandipur-wildlife-safari',
                elements: [
                  { id: 'elephant', label: 'ಏಷ್ಯನ್ ಬೃಹತ್ ಆನೆ', color: '#475569' },
                  { id: 'peacock', label: 'ಗರಿಬಿಚ್ಚಿ ನರ್ತಿಸುವ ನವಿಲು', color: '#0284c7' },
                  { id: 'tiger', label: 'ಗಾಂಭೀರ್ಯದ ಬಂಗಾಳ ಹುಲಿ', color: '#ea580c' }
                ]
              },
              questions: [
                {
                  prompt: 'ಭಾರತದ ರಾಷ್ಟ್ರೀಯ ಪಕ್ಷಿ ಯಾವುದು?',
                  options: ['ನವಿಲು', 'ಗಿಳಿ', 'ಕಾಗೆ', 'ಗುಬ್ಬಚ್ಚಿ'],
                  answerIndex: 0,
                  explanation: 'ನವಿಲು ತನ್ನ ಭವ್ಯ ಗರಿಗಳು ಮತ್ತು ಸೌಂದರ್ಯದಿಂದಾಗಿ ಭಾರತದ ರಾಷ್ಟ್ರಪಕ್ಷಿಯಾಗಿದೆ.'
                },
                {
                  prompt: 'ಬಂಡೀಪುರ ಮತ್ತು ನಾಗರಹೊಳೆ ಅಭಯಾರಣ್ಯಗಳು ಕರ್ನಾಟಕದ ಯಾವ ಪ್ರಸಿದ್ಧ ಪ್ರಾಣಿಗಳಿಗೆ ಆವಾಸಸ್ಥಾನವಾಗಿವೆ?',
                  options: ['ಆನೆ ಮತ್ತು ಹುಲಿ', 'ಹಿಮಕರಡಿ', 'ಪೆಂಗ್ವಿನ್', 'ಕಾಂಗರೂ'],
                  answerIndex: 0,
                  explanation: 'ಕರ್ನಾಟಕದ ಬಂಡೀಪುರವು ಆನೆಗಳು ಮತ್ತು ಹುಲಿಗಳ ಸಂರಕ್ಷಣೆಗೆ ಜಗತ್ಪ್ರಸಿದ್ಧವಾಗಿದೆ.'
                },
                {
                  prompt: 'ಸಸ್ಯಾಹಾರಿ ಪ್ರಾಣಿಗೆ ಸೂಕ್ತ ಉದಾಹರಣೆ ಯಾವುದು?',
                  options: ['ಜಿಂಕೆ ಮತ್ತು ಆನೆ', 'ಹುಲಿ', 'ಚಿರತೆ', 'ಸಿಂಹ'],
                  answerIndex: 0,
                  explanation: 'ಜಿಂಕೆ ಮತ್ತು ಆನೆಗಳು ಹುಲ್ಲು ಮತ್ತು ಸಸ್ಯಗಳನ್ನು ಮಾತ್ರ ತಿನ್ನುವ ಸಸ್ಯಾಹಾರಿಗಳು.'
                },
                {
                  prompt: '\'ಕಾಡು\' ಪದಕ್ಕೆ ಸಮಾನಾರ್ಥಕ ಪದ ಯಾವುದು?',
                  options: ['ಅರಣ್ಯ / ವನ', 'ನಗರ', 'ಸಮುದ್ರ', 'ಮನೆ'],
                  answerIndex: 0,
                  explanation: 'ಕಾಡು ಎಂದರೆ ಅರಣ್ಯ, ವನ ಅಥವಾ ಕಾನನ.'
                }
              ]
            },
            {
              chapterNumber: 5,
              chapterTitle: 'ಹಬ್ಬಗಳ ಸಂಭ್ರಮ',
              conceptKey: 'habbagala-sambhrama-festivals',
              title: 'ನಾಡಹಬ್ಬ ದಸರಾ, ಯುಗಾದಿ ಮತ್ತು ದೀಪಾವಳಿ: ಸಂಸ್ಕೃತಿ ಮತ್ತು ಸಡಗರ',
              objective: 'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಹಬ್ಬಗಳು, ಅವುಗಳ ಹಿಂದಿನ ಸಾಂಸ್ಕೃತಿಕ ಆಚರಣೆ, ಬೇವು-ಬೆಲ್ಲದ ಸಂದೇಶ ಮತ್ತು ಸಾಮರಸ್ಯವನ್ನು ಅರಿಯುವುದು.',
              story: 'ಮೈಸೂರಿನಲ್ಲಿ ನವರಾತ್ರಿಯ ದಸರಾ ಸಂಭ್ರಮ ಮುಗಿಲುಮುಟ್ಟಿತ್ತು. ಅಂಬಾವಿಲಾಸ ಅರಮನೆಯು ಲಕ್ಷಾಂತರ ಚಿನ್ನದ ದೀಪಗಳಿಂದ ಜಗಮಗಿಸುತ್ತಿತ್ತು. ಅರ್ಜುನ ಆನೆಯು ೭೫೦ ಕೆಜಿ ತೂಕದ ಚಿನ್ನದ ಅಂಬಾರಿಯಲ್ಲಿ ಚಾಮುಂಡೇಶ್ವರಿ ದೇವಿಯ ಮೂರ್ತಿಯನ್ನು ಹೊತ್ತು ಸಾಗುವ ಜಂಬೂಸವಾರಿಯನ್ನು ನೋಡಲು ಲಕ್ಷಾಂತರ ಜನ ನೆರೆದಿದ್ದರು. ಅಜ್ಜಿ ಮಕ್ಕಳಿಗೆ ಹೇಳಿದರು: "ಮಕ್ಕಳೇ, ದಸರಾ ನಮ್ಮ ನಾಡಹಬ್ಬ. ದುಷ್ಟತನದ ಮೇಲೆ ಒಳ್ಳೆಯತನದ ವಿಜಯದ ಸಂಕೇತವಿದು. ಹಾಗೆಯೇ ಯುಗಾದಿ ಹಬ್ಬದಲ್ಲಿ ನಾವು ಬೇವು-ಬೆಲ್ಲ ತಿನ್ನುತ್ತೇವೆ. ಬೇವಿನ ಕಹಿ ಮತ್ತು ಬೆಲ್ಲದ ಸಿಹಿ—ಇವೆರಡೂ ಜೀವನದಲ್ಲಿ ಸಮನಾಗಿ ಬರುತ್ತವೆ; ಕಷ್ಟ-ಸುಖ ಎರಡನ್ನೂ ನಗುಮುಖದಿಂದ ಸ್ವೀಕರಿಸಬೇಕೆಂಬುದೇ ನಮ್ಮ ಹಬ್ಬಗಳ ಪರಮ ಸಂದೇಶ." ಮಕ್ಕಳು ಮನೆಗೆ ಬಂದು ಸಿಹಿ ಹೋಳಿಗೆಯನ್ನು ಸವಿದು ಹಬ್ಬದ ಸೊಬಗನ್ನು ಕೊಂಡಾಡಿದರು.',
              activity: 'ಯುಗಾದಿ ಹಬ್ಬದಲ್ಲಿ ಬೇವು-ಬೆಲ್ಲ ತಯಾರಿಸುವ ವಿಧಾನವನ್ನು ಅಮ್ಮನಿಂದ ತಿಳಿದುಕೊಂಡು ನಿಮ್ಮ ನೋಟ್‌ಬುಕ್‌ನಲ್ಲಿ ಬರೆಯಿರಿ.',
              guidedSteps: [
                'ಕರ್ನಾಟಕದ ನಾಡಹಬ್ಬ ಯಾವುದು ಎಂದು ನೆನಪಿಡಿ (ಮೈಸೂರು ದಸರಾ).',
                'ಯುಗಾದಿಯ ಬೇವು-ಬೆಲ್ಲದ ತಾತ್ವಿಕ ಸಂದೇಶವನ್ನು ಗ್ರಹಿಸಿ (ಕಷ್ಟ-ಸುಖಗಳ ಸಮನ್ವಯ).',
                'ಹಬ್ಬಗಳಲ್ಲಿ ಪರಿಸರಸ್ನೇಹಿ ಜೇಡಿಮಣ್ಣಿನ ಮೂರ್ತಿಗಳು ಮತ್ತು ಹೂವುಗಳನ್ನು ಬಳಸುವ ಮಹತ್ವ ತಿಳಿಯಿರಿ.'
              ],
              teacherPrompt: 'ಕರ್ನಾಟಕದ ಜಾನಪದ ಕಲೆಗಳು (ಡೊಳ್ಳು ಕುಣಿತ, ಯಕ್ಷಗಾನ) ಮತ್ತು ಹಬ್ಬಗಳ ಸಾಂಸ್ಕೃತಿಕ ಸೌಂದರ್ಯವನ್ನು ಪರಿಚಯಿಸಿ.',
              visualScene: {
                kind: 'mysuru-dasara-ambari',
                elements: [
                  { id: 'palace', label: 'ದೀಪಾಲಂಕೃತ ಮೈಸೂರು ಅರಮನೆ', color: '#facc15' },
                  { id: 'ambari', label: 'ಚಿನ್ನದ ಅಂಬಾರಿ ಹೊತ್ತ ಗಜರಾಜ', color: '#334155' },
                  { id: 'bevubella', label: 'ಯುಗಾದಿಯ ಬೇವು-ಬೆಲ್ಲದ ಪ್ರಸಾದ', color: '#84cc16' }
                ]
              },
              questions: [
                {
                  prompt: 'ಕರ್ನಾಟಕದ ಅಧಿಕೃತ \'ನಾಡಹಬ್ಬ\' ಎಂದು ಯಾವ ಉತ್ಸವವನ್ನು ಆಚರಿಸಲಾಗುತ್ತದೆ?',
                  options: ['ಮೈಸೂರು ದಸರಾ', 'ಹೋಳಿ', 'ಕ್ರಿಸ್‌ಮಸ್', 'ರಂಜಾನ್'],
                  answerIndex: 0,
                  explanation: 'ಮೈಸೂರು ದಸರಾ ಉತ್ಸವವನ್ನು ಕರ್ನಾಟಕದ ನಾಡಹಬ್ಬವೆಂದು ವಿಜೃಂಭಣೆಯಿಂದ ಆಚರಿಸಲಾಗುತ್ತದೆ.'
                },
                {
                  prompt: 'ಯುಗಾದಿ ಹಬ್ಬದಲ್ಲಿ ಸೇವಿಸುವ \'ಬೇವು-ಬೆಲ್ಲ\' ಜೀವನದ ಯಾವ ಸತ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ?',
                  options: ['ಜೀವನದಲ್ಲಿ ಸುಖ ಮತ್ತು ಕಷ್ಟ ಎರಡನ್ನೂ ಸಮಾನವಾಗಿ ಸ್ವೀಕರಿಸಬೇಕು', 'ಕೇವಲ ಸಿಹಿಯನ್ನು ಮಾತ್ರ ಬಯಸಬೇಕು', 'ಬೇವಿನ ಮರ ಬೆಳೆಸಬಾರದು'],
                  answerIndex: 0,
                  explanation: 'ಬೇವು ಕಷ್ಟದ ಸಂಕೇತ, ಬೆಲ್ಲ ಸುಖದ ಸಂಕೇತ; ಎರಡನ್ನೂ ಸಮಚಿತ್ತದಿಂದ ಎದುರಿಸಬೇಕು ಎಂಬುದು ಯುಗಾದಿ ಸಂದೇಶ.'
                },
                {
                  prompt: 'ದಸರಾ ಜಂಬೂಸವಾರಿಯಲ್ಲಿ ತಾಯಿ ಚಾಮುಂಡೇಶ್ವರಿಯ ಉತ್ಸವ ಮೂರ್ತಿಯನ್ನು ಹೊರುವ ಚಿನ್ನದ ಅಂಬಾರಿಯ ತೂಕ ಎಷ್ಟು?',
                  options: ['೭೫೦ ಕಿಲೋಗ್ರಾಂ (750 kg)', '೧೦೦ ಕೆಜಿ', '೨೦೦೦ ಕೆಜಿ', '೫೦ ಕೆಜಿ'],
                  answerIndex: 0,
                  explanation: 'ಮೈಸೂರು ರಾಜಮನೆತನದ ಚಿನ್ನದ ಅಂಬಾರಿಯು ಬರೋಬ್ಬರಿ ೭೫೦ ಕೆಜಿ ತೂಕವಿದೆ.'
                },
                {
                  prompt: 'ದೀಪಾವಳಿ ಹಬ್ಬವನ್ನು ಮುಖ್ಯವಾಗಿ ಏನೆಂದು ಕರೆಯುತ್ತಾರೆ?',
                  options: ['ದೀಪಗಳ ಹಬ್ಬ (ಬೆಳಕಿನ ಹಬ್ಬ)', 'ಬಣ್ಣಗಳ ಹಬ್ಬ', 'ನೀರಿನ ಹಬ್ಬ', 'ಗಾಳಿಪಟದ ಹಬ್ಬ'],
                  answerIndex: 0,
                  explanation: 'ದೀಪಾವಳಿಯು ಕತ್ತಲೆಯನ್ನು ಓಡಿಸಿ ಬೆಳಕನ್ನು ತರುವ ದೀಪಗಳ ಹಬ್ಬವಾಗಿದೆ.'
                }
              ]
            }
          ]
        },
        {
          name: 'Environmental Studies',
          book: 'Our Wondrous World (NCERT Class 3)',
          source: 'https://ncert.nic.in/textbook.php?geev1=0-14',
          status: 'source_chapters_verified',
          chapters: [
            'Our Wonderful Family',
            'Plants Around Us',
            'Animal Friends',
            'Food and Water in Our Lives',
            'Shelter and Neighborhood',
            'Moving Around and Transport'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'Our Wonderful Family',
              conceptKey: 'family-structures-heredity-cooperation',
              title: 'Family Roots & Household Harmony',
              objective: 'Identify diverse family structures (nuclear and joint), kinship relationships, and shared household responsibilities.',
              story: 'In an eco-friendly apartment in Bengaluru, young Ananya lives with her father, mother, and grandmother. Her cousins live next door with their uncle and aunt. On Sunday mornings, the whole extended family gathers on the terrace garden. Grandmother waters the mint and coriander planters, Father prepares steaming idlis and filter coffee, Mother sets the plates, and Ananya helps her little cousin tie his shoelaces. Ananya\'s teacher asked her to draw a "Family Tree." At the base of the sturdy trunk are the grandparents who provide deep roots of wisdom and traditions. The branches represent parents, aunts, and uncles, while the fresh green leaves at the top are the children. No two families look exactly alike, but every healthy family is bonded by mutual love, safety, and care.',
              activity: 'Draw your own Family Tree on chart paper. Write the names of your grandparents, parents, siblings, and pets on the branches.',
              guidedSteps: [
                'Understand the difference between a Nuclear Family (parents and children) and a Joint Family (grandparents, uncles, aunts, cousins living together).',
                'Identify physical traits passed down in families (like wavy hair, eye color, or dimples).',
                'List three daily household chores you can do independently to assist your parents.'
              ],
              teacherPrompt: 'Emphasize inclusivity and respect for all family types, fostering empathy and shared responsibility.',
              visualScene: {
                kind: 'family-tree-diagram',
                elements: [
                  { id: 'roots', label: 'Grandparent Roots (Heritage)', color: '#78350f' },
                  { id: 'branches', label: 'Parent & Guardian Branches', color: '#16a34a' },
                  { id: 'leaves', label: 'Children Leaves (Future)', color: '#22c55e' }
                ]
              },
              questions: [
                {
                  prompt: 'What do we call a family where grandparents, parents, aunts, uncles, and cousins live together under one roof?',
                  options: ['A Joint Family', 'A Nuclear Family', 'A Solo Team'],
                  answerIndex: 0,
                  explanation: 'A joint family includes multiple generations living collaboratively together.'
                },
                {
                  prompt: 'What is the purpose of a genealogical "Family Tree"?',
                  options: ['To visualize family generations and kinship relationships across time', 'To pick fresh mangoes', 'To build a wooden shelf'],
                  answerIndex: 0,
                  explanation: 'A family tree charts ancestry and how different members are related.'
                },
                {
                  prompt: 'How can young children contribute to family harmony at home?',
                  options: ['By putting away their toys, tidying books, and speaking politely', 'By shouting loudly', 'By refusing to eat'],
                  answerIndex: 0,
                  explanation: 'Small helpful acts and polite speech build an affectionate, tidy home.'
                },
                {
                  prompt: 'Your mother\'s brother is called your:',
                  options: ['Maternal Uncle (Mama)', 'Paternal Uncle (Chacha)', 'Grandfather (Dada)', 'Cousin'],
                  answerIndex: 0,
                  explanation: 'In Indian kinship terms, a mother\'s brother is your maternal uncle (Mama).'
                }
              ]
            },
            {
              chapterNumber: 2,
              chapterTitle: 'Plants Around Us',
              conceptKey: 'plant-parts-functions-photosynthesis',
              title: 'Roots, Stems & Leaves: The Miraculous Green Factory',
              objective: 'Classify plant anatomy: taproots vs fibrous roots, stem functions, leaf stomata, and basic photosynthetic food making.',
              story: 'In the school herbarium in Hassan, science teacher Sridhar pulled a young mustard weed gently from loose soil to demonstrate plant anatomy. "Look closely at these two distinct zones," he said. The subterranean zone below the soil consists of a thick, tapering main root called a taproot with fine root hairs that drink water and dissolved minerals from the soil. The aerial zone above the soil features a sturdy upright green stem, carrying that water upward like a plumbing pipe to the flat green leaves. "Leaves are nature\'s solar-powered kitchens," explained Sridhar. "Leaves contain green pigment called chlorophyll that captures sunlight. They inhale carbon dioxide from the air through microscopic pores called stomata, combine it with water, and cook sweet glucose to nourish the entire plant, while breathing out fresh oxygen for us!"',
              activity: 'Take a fallen green banyan or peepal leaf. Place a piece of white paper over it and rub gently with a pencil to reveal the intricate network of veins.',
              guidedSteps: [
                'Identify Root: anchors plant firmly and absorbs groundwater.',
                'Identify Stem: supports branches and transports fluids like a straw.',
                'Identify Leaf: solar kitchen that produces food through photosynthesis.',
                'Identify Flower & Fruit: reproductive organs that produce seeds for the next generation.'
              ],
              teacherPrompt: 'Connect plant physiology to environmental oxygen generation and atmospheric moisture balance.',
              visualScene: {
                kind: 'plant-anatomy-schematic',
                elements: [
                  { id: 'roots', label: 'Taproot & Lateral Root Hairs', color: '#854d0e' },
                  { id: 'stem', label: 'Vascular Stem (Xylem/Phloem)', color: '#16a34a' },
                  { id: 'leaf', label: 'Chlorophyll Leaf & Stomata', color: '#22c55e' },
                  { id: 'sun', label: 'Sunlight Energy Input', color: '#f59e0b' }
                ]
              },
              questions: [
                {
                  prompt: 'Which part of the plant functions like a solar kitchen, synthesizing food from sunlight and water?',
                  options: ['The green leaves', 'The underground roots', 'The dry bark', 'The flower petals'],
                  answerIndex: 0,
                  explanation: 'Leaves perform photosynthesis, using sunlight and chlorophyll to make food.'
                },
                {
                  prompt: 'What are the microscopic pores on the underside of leaves called?',
                  options: ['Stomata', 'Spiracles', 'Gills', 'Pores'],
                  answerIndex: 0,
                  explanation: 'Stomata are tiny openings through which plants exchange gases (CO2 and O2).'
                },
                {
                  prompt: 'What is the primary function of the root system?',
                  options: ['To anchor the plant in soil and absorb water and minerals', 'To catch butterflies', 'To make flower seeds'],
                  answerIndex: 0,
                  explanation: 'Roots provide structural anchoring and draw moisture from deep in the soil.'
                },
                {
                  prompt: 'Which green pigment captures sunlight inside plant leaves?',
                  options: ['Chlorophyll', 'Melanin', 'Hemoglobin', 'Carotene'],
                  answerIndex: 0,
                  explanation: 'Chlorophyll is the green pigment responsible for absorbing solar energy.'
                }
              ]
            },
            {
              chapterNumber: 3,
              chapterTitle: 'Animal Friends',
              conceptKey: 'animal-habitats-shelters-food-chain',
              title: 'Creatures of Land, Water & Air: Habitats & Animal Homes',
              objective: 'Classify animals into terrestrial, aquatic, and aerial groups, and understand natural food chains.',
              story: 'During a field study at Karanji Lake in Mysuru, naturalist Deepa guided young learners with binoculars. She pointed to a marshy island: "Every animal builds or finds a shelter perfectly matched to its body and survival needs." In the tall reed beds, weaver birds had suspended woven straw nests away from predatory snakes. In the hollow trunk of an ancient rain tree, a spotted owlet blinked softly, sheltered from the blazing noon heat. Beneath the water\'s surface, freshwater catla fish breathed oxygen through delicate feathery gills, while on the sandy shore, a pond terrapin sunbathed to warm its cold-blooded shell. Deepa explained: "Grass grows using sunlight. Grasshoppers eat the grass. Frogs eat the grasshoppers. Snakes eat the frogs. And eagles soar above to hunt snakes. This interconnected web of life is called a Food Chain. When every animal has a safe habitat, the entire web remains healthy and balanced."',
              activity: 'Draw a 4-step food chain in your notebook: Sun -> Plant/Grass -> Herbivore (Deer) -> Carnivore (Tiger).',
              guidedSteps: [
                'Identify Terrestrial animals (live on land: elephant, tiger, dog).',
                'Identify Aquatic animals (live in water: fish, whale, dolphin).',
                'Identify Aerial creatures (fly in the air: pigeon, eagle, bat).',
                'Understand that herbivores eat plants, carnivores eat other animals, and omnivores eat both.'
              ],
              teacherPrompt: 'Discuss biodiversity conservation and explain why disturbing one link in a food chain affects all organisms.',
              visualScene: {
                kind: 'food-chain-diagram',
                elements: [
                  { id: 'sunPlant', label: 'Sunlight & Grass (Producers)', color: '#22c55e' },
                  { id: 'herbivore', label: 'Grasshopper (Primary Consumer)', color: '#84cc16' },
                  { id: 'carnivore', label: 'Frog & Snake (Consumers)', color: '#0ea5e9' },
                  { id: 'apex', label: 'Soaring Eagle (Apex Predator)', color: '#b45309' }
                ]
              },
              questions: [
                {
                  prompt: 'How do fish breathe underwater?',
                  options: ['Through gills that absorb dissolved oxygen from water', 'Through lungs with a snorkel', 'They do not breathe'],
                  answerIndex: 0,
                  explanation: 'Fish use gills to filter dissolved oxygen from flowing water.'
                },
                {
                  prompt: 'What do we call animals that eat only plants, grass, and fruits?',
                  options: ['Herbivores', 'Carnivores', 'Parasites', 'Scavengers'],
                  answerIndex: 0,
                  explanation: 'Herbivores (like cows, deer, and elephants) consume plant vegetation.'
                },
                {
                  prompt: 'In a simple food chain, which organism is the primary "Producer" that makes food from sunlight?',
                  options: ['Green plants and grass', 'The hungry tiger', 'The eagle', 'The mushroom'],
                  answerIndex: 0,
                  explanation: 'Green plants produce organic energy directly from sunlight via photosynthesis.'
                },
                {
                  prompt: 'Why do spotted owlets sleep during the daytime in hollow tree trunks?',
                  options: ['They are nocturnal creatures that hunt at night and need daytime shelter', 'They are afraid of daylight', 'They cannot open their eyes'],
                  answerIndex: 0,
                  explanation: 'Nocturnal animals are active at night and rest safely during daylight hours.'
                }
              ]
            },
            {
              chapterNumber: 4,
              chapterTitle: 'Food and Water in Our Lives',
              conceptKey: 'nutrition-water-conservation-hygiene',
              title: 'Nutritious Meals & The Precious Gift of Pure Water',
              objective: 'Identify energy-giving, body-building, and protective foods, and learn rooftop rainwater harvesting methods.',
              story: 'At the community dining hall during the harvest festival, Dr. Rekha gave a lively talk to children about eating a balanced rainbow plate. "Look at your traditional thali," she said smiling. "Brown rice and ragi provide carbohydrates that give you energy to run and play. Dal, sprouts, and paneer provide proteins that build strong muscles and repair cuts. Fresh greens like palak, carrots, and oranges provide vitamins and minerals that protect your body from colds and fevers. This is called a Balanced Diet!" Next, she pointed to the school\'s rooftop rainwater collection pipes: "Every drop of water that falls from the monsoon clouds is precious. Our underground filtration tank stores 50,000 litres of clean rainwater, recharging our local well. Never leave a tap dripping, because fresh drinking water is one of the most vital treasures on Earth."',
              activity: 'Audit your home for water leaks. Put a small cup under any dripping tap for 15 minutes to measure how much water is wasted.',
              guidedSteps: [
                'Energy-giving foods: Cereals, rice, wheat, potatoes, healthy oils.',
                'Body-building foods: Pulses, lentils, milk, eggs, beans.',
                'Protective foods: Leafy greens, fresh fruits, vegetables rich in vitamins.',
                'Water-saving habits: Turn off tap while brushing teeth; fix leaking washers immediately.'
              ],
              teacherPrompt: 'Connect nutritional wellness to traditional Indian diets (millets, pulses) and promote water conservation ethics.',
              visualScene: {
                kind: 'balanced-thali-water',
                elements: [
                  { id: 'energy', label: 'Ragi & Rice (Energy Giving)', color: '#d97706' },
                  { id: 'protein', label: 'Sprouted Dal (Body Building)', color: '#16a34a' },
                  { id: 'protective', label: 'Palak & Fruits (Protective)', color: '#22c55e' },
                  { id: 'rainwater', label: 'Rainwater Harvesting Tank', color: '#0284c7' }
                ]
              },
              questions: [
                {
                  prompt: 'Which nutrient group is primarily responsible for repairing cuts and building strong muscles?',
                  options: ['Proteins (pulses, milk, lentils)', 'Fats and sugars', 'Carbonated water'],
                  answerIndex: 0,
                  explanation: 'Proteins provide the building blocks necessary for muscle growth and cellular repair.'
                },
                {
                  prompt: 'Why are green leafy vegetables and fresh fruits called "protective foods"?',
                  options: ['They contain vitamins and minerals that protect our immune system from illnesses', 'They wear tiny helmets', 'They make bones heavy like rocks'],
                  answerIndex: 0,
                  explanation: 'Vitamins and minerals defend the body against infections and maintain organ health.'
                },
                {
                  prompt: 'What is rainwater harvesting?',
                  options: ['Collecting and storing rainwater from rooftops for drinking and groundwater recharge', 'Washing cars during heavy rain', 'Playing with paper boats'],
                  answerIndex: 0,
                  explanation: 'Rainwater harvesting captures precipitation to replenish aquifers and conserve water.'
                },
                {
                  prompt: 'What simple habit saves litres of water every single morning?',
                  options: ['Turning off the tap while brushing your teeth', 'Leaving the hose on all day', 'Letting buckets overflow'],
                  answerIndex: 0,
                  explanation: 'Turning off the tap while brushing saves up to 10 litres of clean water each time.'
                }
              ]
            },
            {
              chapterNumber: 5,
              chapterTitle: 'Shelter and Neighborhood',
              conceptKey: 'shelters-houses-community-helpers',
              title: 'From Mud to Terraces: Houses & Community Helpers',
              objective: 'Compare climate-responsive houses (sloping roofs, stilt houses, kutcha/pucca) and appreciate community helpers.',
              story: 'In an architecture workshop for children in Dharwad, civil engineer Rajesh showed miniature models of houses across India. "Humans build homes that match their climate and locally available materials," he explained. In snowy Kashmir and rainy Coorg, houses have steeply sloping roofs so snow and rainwater slide off quickly without leaking into ceilings. In flood-prone regions of Assam, houses are built on tall bamboo stilts above the muddy water. In arid Rajasthan, traditional houses have thick mud walls and small windows to keep interiors cool during scorching days. Next, Rajesh highlighted the neighborhood helpers who keep our communities safe and livable: "The sanitation workers who sweep our streets before sunrise, the electricians who fix damaged power cables, the firefighters who bravely rescue pets, and the primary health nurses. A true neighborhood is not just bricks and mortar; it is a circle of mutual care and civic respect."',
              activity: 'Draw two contrasting houses: one with a sloping tiled roof in a rainy forest, and one multi-story brick apartment in a city.',
              guidedSteps: [
                'Understand Kutcha houses (built of mud, thatch, bamboo; eco-friendly, need frequent maintenance).',
                'Understand Pucca houses (built of cement, bricks, steel; permanent and durable).',
                'Name five essential community helpers: Doctor, Firefighter, Sanitation Worker, Postperson, Electrician.'
              ],
              teacherPrompt: 'Foster civic gratitude towards municipal workers and explain how vernacular architecture respects local climates.',
              visualScene: {
                kind: 'shelters-neighborhood-models',
                elements: [
                  { id: 'slopingRoof', label: 'Sloping Roof House (Rainy Zones)', color: '#b45309' },
                  { id: 'stiltHouse', label: 'Bamboo Stilt House (Flood Zones)', color: '#78350f' },
                  { id: 'puccaFlat', label: 'Engineered Pucca Apartment', color: '#475569' }
                ]
              },
              questions: [
                {
                  prompt: 'Why do houses in heavy rainfall regions like Coorg and Kerala have steeply sloping roofs?',
                  options: ['So rainwater runs off swiftly without pooling on the roof', 'To slide down like a playground slide', 'Because flat roofs are illegal'],
                  answerIndex: 0,
                  explanation: 'Sloping pitch prevents water stagnation, dampness, and ceiling leaks.'
                },
                {
                  prompt: 'Why are houses built on elevated wooden or bamboo stilts in flood-prone areas?',
                  options: ['To keep the living rooms high above swirling floodwaters', 'To see birds in the trees', 'To hide under the floor'],
                  answerIndex: 0,
                  explanation: 'Stilt houses safeguard inhabitants and belongings from rising water levels.'
                },
                {
                  prompt: 'What materials are used to build permanent, durable "Pucca" houses?',
                  options: ['Bricks, cement, steel, and stone', 'Dry leaves and grass', 'Paper and glue'],
                  answerIndex: 0,
                  explanation: 'Pucca houses are constructed using robust masonry, steel, and concrete.'
                },
                {
                  prompt: 'How should we treat sanitation workers and security guards in our neighborhood?',
                  options: ['With profound respect, courteous greetings, and civic appreciation', 'By ignoring them', 'By littering in front of them'],
                  answerIndex: 0,
                  explanation: 'Community workers maintain public health and security, deserving our deepest dignity.'
                }
              ]
            },
            {
              chapterNumber: 6,
              chapterTitle: 'Moving Around and Transport',
              conceptKey: 'transport-modes-traffic-safety-environment',
              title: 'Wheels, Rails & Wings: Modes of Transport & Road Safety',
              objective: 'Classify transport modes (land, water, air), compare energy efficiency, and master pedestrian road safety rules.',
              story: 'At the Kempegowda Bus Station in Bengaluru, traffic police inspector Kavitha conducted an interactive safety workshop for school students. She pointed to the different transit vehicles: "Think about how humanity learned to travel. First we walked on foot. Then we tamed bullocks and horses. Then came the bicycle, steam engines, buses, aeroplanes, and electric metro trains!" Kavitha showed that an electric train carrying 1,000 commuters uses vastly less fuel and creates zero street exhaust compared to 1,000 single cars on the road. Next, she walked the children to the zebra crossing: "Remember the Golden Traffic Safety Creed: Always cross at the black-and-white Zebra Crossing. Look right, look left, and look right again before stepping onto the tarmac. Never run across roads, and always wear a helmet on two-wheelers and a seatbelt in cars. Your safety is precious to everyone who loves you."',
              activity: 'Stand near a safe footpath with an adult for 10 minutes. Count how many bicycles, electric buses, cars, and auto-rickshaws pass by.',
              guidedSteps: [
                'Land Transport: Bicycle, Bus, Car, Train, Metro.',
                'Water Transport: Ferry, Ship, Boat, Cargo Carrier.',
                'Air Transport: Aeroplane, Helicopter (fastest mode over long distances).',
                'Road Safety Rules: Zebra crossing, red-amber-green traffic light signals, footpath walking.'
              ],
              teacherPrompt: 'Advocate public transit, walking, and cycling for cleaner city air, while instilling lifelong road discipline.',
              visualScene: {
                kind: 'traffic-safety-junction',
                elements: [
                  { id: 'metro', label: 'Electric Namma Metro Train', color: '#9333ea' },
                  { id: 'zebra', label: 'Pedestrian Zebra Crossing', color: '#f8fafc' },
                  { id: 'signals', label: 'Red-Amber-Green Signals', color: '#22c55e' }
                ]
              },
              questions: [
                {
                  prompt: 'Where is the safest place for pedestrians to cross a busy city street?',
                  options: ['At a designated black-and-white Zebra Crossing when vehicles stop', 'In the middle of moving highway traffic', 'Under a parked lorry'],
                  answerIndex: 0,
                  explanation: 'Zebra crossings provide safe pedestrian corridors recognized by traffic laws.'
                },
                {
                  prompt: 'What does the AMBER (Yellow) traffic light indicate to oncoming drivers?',
                  options: ['Slow down and prepare to stop safely', 'Speed up as fast as possible', 'Close your eyes'],
                  answerIndex: 0,
                  explanation: 'Yellow signifies that the signal is about to turn red; drivers should decelerate.'
                },
                {
                  prompt: 'Why are electric metro trains and city buses better for urban environments than hundreds of private cars?',
                  options: ['They carry hundreds of people together, reducing road traffic and tailpipe pollution', 'They are painted purple', 'They take up more parking spaces'],
                  answerIndex: 0,
                  explanation: 'Mass transit minimizes fuel consumption per passenger and slashes urban emissions.'
                },
                {
                  prompt: 'What essential safety gear must everyone wear when riding a two-wheeler (scooter or motorcycle)?',
                  options: ['A certified protective helmet with chinstrap fastened', 'Sunglasses only', 'A woolen scarf'],
                  answerIndex: 0,
                  explanation: 'Helmets dramatically reduce the risk of head injury in collisions.'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      board: 'STATE',
      subjects: [
        {
          name: 'English',
          book: 'Savirudi State English (Class 3)',
          source: 'https://ktbs.kar.nic.in',
          status: 'source_chapters_verified',
          chapters: [
            'Colours',
            'Two Friends',
            'The Wooden Bowl',
            'The Magic Seed',
            'Animals and Birds'
          ],
          lessons: [] // Inherits CBSE Santoor canonical lessons for bilingual state English curriculum
        },
        {
          name: 'Mathematics',
          book: 'Joyful Mathematics State Edition (Class 3)',
          source: 'https://ktbs.kar.nic.in',
          status: 'source_chapters_verified',
          chapters: [
            'Where to Look (Spatial Perspectives)',
            'Fun with Numbers (3-Digit Place Value)',
            'Give and Take (Addition & Subtraction Strategies)',
            'Long and Short (Measurement of Length)',
            'Shapes and Designs (2D & 3D Geometry)',
            'Fun with Giving and Sharing (Multiplication & Division)',
            'Time Goes On (Clocks & Timelines)',
            'Who is Heavier? (Weight & Balance)'
          ],
          lessons: []
        },
        {
          name: 'Kannada',
          book: 'Savirudi ಸಾವಿರುಚಿ (KTBS Class 3)',
          source: 'https://ktbs.kar.nic.in',
          status: 'source_chapters_verified',
          chapters: [
            'ಕನ್ನಡ ಅಕ್ಷರಮಾಲೆ ಮತ್ತು ಗಿಳಿ',
            'ಪ್ರಕೃತಿಯ ಚೆಲುವು',
            'ನಾವೆಲ್ಲರೂ ಒಂದೇ',
            'ಪ್ರಾಣಿ-ಪಕ್ಷಿಗಳ ಲೋಕ',
            'ಹಬ್ಬಗಳ ಸಂಭ್ರಮ'
          ],
          lessons: []
        },
        {
          name: 'Environmental Studies',
          book: 'Namma Parisara ನಮ್ಮ ಪರಿಸರ (KTBS Class 3)',
          source: 'https://ktbs.kar.nic.in',
          status: 'source_chapters_verified',
          chapters: [
            'Our Wonderful Family',
            'Plants Around Us',
            'Animal Friends',
            'Food and Water in Our Lives',
            'Shelter and Neighborhood',
            'Moving Around and Transport'
          ],
          lessons: []
        },
        {
          name: 'Hindi',
          book: 'Sarangi / Veena State Edition (Class 3)',
          source: 'https://ktbs.kar.nic.in',
          status: 'source_chapters_verified',
          chapters: [
            'देश हमारा',
            'बया हमारी चिड़िया रानी',
            'चंदा मामा',
            'मीना का परिवार',
            'सीख'
          ],
          lessons: []
        }
      ]
    }
  ],
  enrichment: [
    {
      name: 'AI & Digital Thinking',
      description: 'Vayentra original enrichment: Computational sequences, input devices, pattern logic, and child-safe digital boundaries.',
      modules: [
        {
          slug: 'step-by-step-algorithms',
          title: 'Algorithms: The Mango Milkshake Robot & Sequential Logic',
          objective: 'Understand algorithms as precise, ordered instructions that computers follow without ambiguity.',
          story: 'In the computer lab at Gurukula, teacher Anita asked students to pretend she was a friendly robot named "Robo-Chef." Anita said: "Robo-Chef can make delicious mango milkshakes, but robots do not have human intuition. You must give me exact step-by-step instructions called an Algorithm." Kabir gave the first instruction: "Pour milk into the blender!" Anita, acting like a robot, picked up the sealed milk carton and poured it against the closed blender lid! The milk splashed everywhere, and the children burst into laughter. "What went wrong?" Anita asked with a smile. "You forgot to tell Robo-Chef to open the lid first!" realization dawned on Kabir. An algorithm must have every single step in correct sequential order: 1. Remove the blender lid. 2. Peel the mango and drop slices into the jar. 3. Open the milk packet and pour. 4. Secure the lid tightly. 5. Press the blend button for 30 seconds. Computers follow instructions with literal precision.',
          activity: 'Write down a 5-step algorithm for how you brush your teeth every morning. Swap with a friend to check if you missed opening the toothpaste cap!',
          guidedSteps: [
            'An Algorithm is a step-by-step sequence of instructions to solve a problem.',
            'Step order matters: putting on shoes before socks causes a bug!',
            'Debugging means finding and fixing incorrect steps in your algorithm.'
          ],
          questions: [
            {
              prompt: 'What is an "Algorithm" in computer science?',
              options: ['A clear, step-by-step list of instructions to complete a task', 'A physical computer mouse', 'A video game score'],
              answerIndex: 0,
              explanation: 'An algorithm is a precise recipe or procedure followed in sequence.'
            },
            {
              prompt: 'What happens if you execute instructions in the wrong sequential order?',
              options: ['The program produces errors or unexpected outcomes (bugs)', 'The computer becomes faster', 'Nothing changes'],
              answerIndex: 0,
              explanation: 'Correct execution order is vital for algorithmic success.'
            },
            {
              prompt: 'What does "Debugging" mean when writing code or algorithms?',
              options: ['Finding, diagnosing, and correcting mistakes in instructions', 'Wiping dust off the screen', 'Buying a new monitor'],
              answerIndex: 0,
              explanation: 'Debugging is the process of identifying and fixing flaws in instructions.'
            },
            {
              prompt: 'Which step must come FIRST when writing an algorithm to make a glass of lemonade?',
              options: ['Wash hands and gather lemon, water, and spoon', 'Drink the lemonade', 'Throw away the peel'],
              answerIndex: 0,
              explanation: 'Preparation and gathering materials is always the initial prerequisite step.'
            }
          ]
        },
        {
          slug: 'digital-devices-inputs-outputs',
          title: 'Inputs, Brains & Outputs: How Digital Machines Work',
          objective: 'Classify computer hardware into Input units (keyboard, microphone, touchscreen), Processing unit (CPU), and Output units (monitor, speaker, printer).',
          story: 'Young Milo looked at the school computer desktop and asked: "How does a computer know what I am thinking?" Teacher Kiran held up three objects: a microphone, a small silver microprocessor chip, and a pair of colorful headphones. "A computer has three main parts," Kiran explained. "First are INPUT devices—these are the machine\'s sensory organs! When you type on a keyboard, touch a screen, or speak into a microphone, you send signals INTO the machine. Second is the CPU or Central Processing Unit—this is the computer\'s silicon brain that calculates, sorts, and decides what to do with that data. Third are OUTPUT devices—like the screen that shows colorful images or the speakers that play music. Data goes IN through inputs, is processed by the BRAIN, and comes OUT through outputs!"',
          activity: 'Make a three-column table in your notebook labelled "Input", "Processor", and "Output". Sort: Keyboard, Monitor, Speaker, Mouse, CPU, Microphone, Printer.',
          guidedSteps: [
            'Input: delivers data to the computer (Keyboard, Mouse, Touchpad, Camera, Mic).',
            'Processing: the CPU chip crunches numbers and executes logic.',
            'Output: displays or produces results (Screen/Monitor, Speaker, Headphones, Printer).'
          ],
          questions: [
            {
              prompt: 'Which of the following is an INPUT device that sends information into a computer?',
              options: ['Microphone and Keyboard', 'Printer', 'Computer Monitor', 'Loudspeaker'],
              answerIndex: 0,
              explanation: 'Microphones capture sound waves and keyboards record keystrokes as input.'
            },
            {
              prompt: 'What is the role of the CPU (Central Processing Unit)?',
              options: ['It acts as the computer\'s brain, processing data and executing instructions', 'It stores paper prints', 'It shines like a flashlight'],
              answerIndex: 0,
              explanation: 'The CPU processes logic, coordinates hardware, and performs mathematical calculations.'
            },
            {
              prompt: 'When you listen to an educational story through your tablet\'s speakers, the speakers are functioning as:',
              options: ['An Output device', 'An Input device', 'A Battery', 'A Keyboard'],
              answerIndex: 0,
              explanation: 'Speakers convert processed audio signals into sound waves for our ears (output).'
            },
            {
              prompt: 'Can a smartphone touchscreen serve as both an input and an output device?',
              options: ['Yes: you touch it to input choices, and it displays images as output', 'No, only one is possible', 'Only on weekends'],
              answerIndex: 0,
              explanation: 'Touchscreens combine touch sensors (input) and display panels (output) into one surface.'
            }
          ]
        },
        {
          slug: 'pattern-detective',
          title: 'Pattern Detective: Repetition, Loops & Symmetry in Code',
          objective: 'Identify repeating patterns in numbers, shapes, and musical rhythms, and understand programming "Loops".',
          story: 'During coding play hour, eight-year-old Diya noticed how tile floors and rangoli patterns repeat with rhythmic symmetry. Teacher Kiran showed her a visual block-coding screen where a digital turtle draws shapes. Diya wanted the turtle to draw a square. She wrote: "Move forward 100 steps, turn right 90 degrees. Move forward 100 steps, turn right 90 degrees. Move forward 100 steps, turn right 90 degrees. Move forward 100 steps, turn right 90 degrees." Kiran smiled: "Diya, notice how you repeated the exact same two commands four times? In coding, whenever a computer needs to repeat a pattern, we use a magic command called a LOOP! Instead of writing 8 lines of code, you can simply say: Repeat 4 times [Move forward 100, Turn right 90]. Loops save time, prevent typing mistakes, and help computers create intricate visual patterns in milliseconds!"',
          activity: 'Clap a 4-beat rhythm with your hands: Clap, Clap, Tap, Pause. Repeat the loop 5 times without missing a beat.',
          guidedSteps: [
            'Spot the repeating unit in a pattern (e.g., Red, Blue, Red, Blue).',
            'In programming, a Loop executes instructions repeatedly until a target condition is met.',
            'Using loops keeps code concise, clean, and bug-free.'
          ],
          questions: [
            {
              prompt: 'What is a "Loop" in computer programming?',
              options: ['A structure that repeats a set of instructions multiple times', 'A tangled wire behind the computer', 'A circle drawn on paper'],
              answerIndex: 0,
              explanation: 'Loops automate repetitive tasks without rewriting identical instructions.'
            },
            {
              prompt: 'If you want a robot to take 10 steps forward, what is the cleanest loop code?',
              options: ['Repeat 10 times [Step Forward]', 'Write "Step Forward" 100 times', 'Ask the robot to guess'],
              answerIndex: 0,
              explanation: 'A "Repeat 10 times" loop is concise, legible, and mathematically precise.'
            },
            {
              prompt: 'What comes next in the geometric pattern: Circle, Square, Triangle, Circle, Square, _____?',
              options: ['Triangle', 'Star', 'Hexagon', 'Circle'],
              answerIndex: 0,
              explanation: 'The repeating core unit is (Circle, Square, Triangle).'
            },
            {
              prompt: 'Why do computer programmers love using loops for patterns?',
              options: ['Loops save time, reduce code length, and prevent typing errors', 'Loops make computers overheat', 'Loops delete the code'],
              answerIndex: 0,
              explanation: 'Loops make programs efficient, maintainable, and elegant.'
            }
          ]
        },
        {
          slug: 'safe-browsing-digital-boundaries',
          title: 'Digital Guardians: Screen Time Balance & Privacy Shields',
          objective: 'Learn child-safe internet practices: protecting personal privacy, balanced screen time, and seeking trusted adult guidance.',
          story: 'In the Vayentra digital wellbeing seminar, counselor Sunita introduced the concept of the "Digital Castle." Sunita asked: "If a stranger knocked on your front door at home, would you hand them your home address, your school name, and your family photographs?" "Never!" shouted all the children together. "Exactly," said Sunita. "The internet connects millions of computers worldwide. Just like you keep your house door locked to strangers, you must keep your personal information shielded online. Never share your real full name, phone number, school name, or passwords on any website or game. If you ever see a pop-up, a strange message, or a button that makes you feel uncomfortable, don\'t try to solve it alone—immediately pause and show it to a trusted adult, like your parent or teacher. And remember, screens are tools for learning, but outdoor sports, fresh air, and real friends build your strongest muscles!"',
          activity: 'Create a "Screen-Free Hour" chart for your home. Agree on one hour every evening where all family members put away screens to read, draw, or play board games.',
          guidedSteps: [
            'Keep personal data private: never share passwords, home address, or school names.',
            'If you see something confusing or distressing online: Stop, Close the tab, and Tell a trusted adult.',
            'Balance screen use with outdoor physical activity and restful sleep.'
          ],
          questions: [
            {
              prompt: 'Which information should you NEVER share with anyone on an internet game or website?',
              options: ['Your home address, phone number, school name, and passwords', 'Your favorite color', 'The names of fruits you like'],
              answerIndex: 0,
              explanation: 'Personal identifiable information must be safeguarded to protect child safety.'
            },
            {
              prompt: 'What is the best action to take if an online pop-up or message makes you feel uncomfortable?',
              options: ['Immediately pause and show it to a trusted parent or teacher', 'Click on random buttons', 'Keep it a secret'],
              answerIndex: 0,
              explanation: 'Always alert a trusted adult when encountering suspicious or unsettling online content.'
            },
            {
              prompt: 'Why is it important to have screen-free hours every day?',
              options: ['To rest our eyes, exercise our bodies, and spend quality time with family', 'Because computers get lonely', 'Because batteries never recharge'],
              answerIndex: 0,
              explanation: 'Balanced screen hygiene supports physical fitness, eyesight, and emotional wellbeing.'
            },
            {
              prompt: 'Who should know your account passwords?',
              options: ['Only you and your parents or trusted guardians', 'All your classmates', 'Strangers in chat rooms'],
              answerIndex: 0,
              explanation: 'Passwords should be kept strictly confidential within the family.'
            }
          ]
        },
        {
          slug: 'smart-assistants-voice-recognition',
          title: 'Voice Detectives: How Smart Devices Understand Speech',
          objective: 'Explore speech recognition: sound wave digitization, phonetic pattern matching, and why computers don\'t actually "think" like humans.',
          story: 'At home, young Arjun asked his smart speaker: "What is the weather in Bengaluru today?" The speaker lit up with a blue ring and answered in a friendly voice: "Bengaluru is 24 degrees with gentle afternoon showers." Arjun wondered: "Is there a tiny person living inside the speaker?" His elder sister laughed kindly: "No, Arjun! When you speak, your vocal cords create vibrations in the air called sound waves. The speaker has a microphone that converts those physical waves into digital numbers. Computer software compares those numbers against thousands of recorded word patterns—like \'weather\' and \'Bengaluru\'. Once it matches the words, it retrieves the weather report from the internet and uses text-to-speech to read the answer. The machine isn\'t actually thinking or feeling; it is simply matching patterns at lightning speed!"',
          activity: 'Speak a sentence very clearly, and then whisper the same sentence into a phone recorder with a parent. Notice how clear pronunciation helps people and voice tools understand words.',
          guidedSteps: [
            'Microphones translate vocal air vibrations into digital numerical code.',
            'Pattern matching software identifies phonemes and word boundaries.',
            'Computers follow mathematical algorithms; they do not have feelings, consciousness, or personal thoughts.'
          ],
          questions: [
            {
              prompt: 'How do voice-activated devices understand spoken questions?',
              options: ['They convert speech sound waves into digital numbers and match them against word patterns', 'A tiny human sits inside the speaker', 'They read your mind with magic'],
              answerIndex: 0,
              explanation: 'Speech recognition software digitizes acoustics and matches phonemes to text dictionaries.'
            },
            {
              prompt: 'Do smart assistants and AI devices have genuine feelings, happiness, or sadness?',
              options: ['No, they are programmed machines without emotions or consciousness', 'Yes, they cry when turned off', 'Yes, they have feelings like dogs'],
              answerIndex: 0,
              explanation: 'AI systems simulate language using algorithms; they possess no consciousness or emotions.'
            },
            {
              prompt: 'What physical hardware inside a smart device captures your voice?',
              options: ['A microphone sensor', 'A glass screen', 'A plastic button', 'A cooling fan'],
              answerIndex: 0,
              explanation: 'Microphones are acoustic sensors that detect sound pressure waves.'
            },
            {
              prompt: 'Why might a voice assistant sometimes misunderstand a word you spoke?',
              options: ['Background noise or indistinct pronunciation can blur the sound wave pattern', 'Because it is being stubborn', 'Because the room is dark'],
              answerIndex: 0,
              explanation: 'Acoustic clarity is essential for pattern matching algorithms to accurately decode words.'
            }
          ]
        },
        {
          slug: 'creative-digital-canvas',
          title: 'Pixels, Grids & Digital Art: Creative Expression with Technology',
          objective: 'Understand pixels as tiny illuminated squares on screens, coordinate grids, and symmetrical computer illustration.',
          story: 'In the art studio, students zoomed in closely on a digital drawing tablet with a magnifying glass. To their amazement, a smooth curved line broke apart into tiny, glowing squares of light! Teacher Anita explained: "Every picture you see on a phone, tablet, or television is made of millions of tiny colored squares called Pixels (picture elements). When these pixels are packed tightly together, your eye blends them into seamless photographs and cartoon animations. In digital art, each pixel has an address on a coordinate grid, and three color values: Red, Green, and Blue (RGB). By blending different intensities of red, green, and blue light, screens can produce over 16 million radiant colors!" The children used symmetrical grid tools to paint vibrant butterflies whose left and right wings mirrored each other with pixel perfection.',
          activity: 'Take a sheet of square grid graph paper. Color in the small squares to design an 8-bit retro character (like a heart or a friendly robot face).',
          guidedSteps: [
            'A Pixel is the smallest controllable element of a picture represented on a screen.',
            'Screens mix Red, Green, and Blue (RGB) light to generate every color.',
            'Zooming in reveals the grid structure of digital raster images.'
          ],
          questions: [
            {
              prompt: 'What is the tiny, colored square of light that makes up screen images called?',
              options: ['A Pixel (Picture Element)', 'A Pebble', 'A Particle', 'A Paintbrush'],
              answerIndex: 0,
              explanation: 'Screens display visuals through grids composed of millions of microscopic pixels.'
            },
            {
              prompt: 'What are the three primary light colors that computer displays mix together to create millions of shades?',
              options: ['Red, Green, and Blue (RGB)', 'Black, White, and Grey', 'Yellow, Pink, and Purple'],
              answerIndex: 0,
              explanation: 'Additive color displays combine Red, Green, and Blue light beams.'
            },
            {
              prompt: 'What happens when you zoom in extremely close to a low-resolution digital picture?',
              options: ['You can see the individual square pixels forming a mosaic grid', 'The image turns into real water', 'The screen cracks'],
              answerIndex: 0,
              explanation: 'Pixelation becomes visible when pixel grids are enlarged beyond native resolution.'
            },
            {
              prompt: 'How does digital symmetry help artists draw balanced butterfly wings or buildings?',
              options: ['Drawing on one side automatically mirrors identical lines on the other side', 'It turns the screen upside down', 'It erases the drawing'],
              answerIndex: 0,
              explanation: 'Symmetry tools reflect strokes across a central axis to ensure balanced geometry.'
            }
          ]
        }
      ]
    },
    {
      name: 'Financial Literacy & Money Management',
      description: 'Vayentra original enrichment: Needs vs Wants, Indian currency identification, piggy bank savings, and smart budgeting.',
      modules: [
        {
          slug: 'needs-vs-wants-daily-life',
          title: 'Needs vs Wants: Making Thoughtful Choices with Money',
          objective: 'Distinguish between essential human Needs (food, clean water, shelter, medicine, books) and discretionary Wants (toys, designer gadgets, candy).',
          story: 'On Saturday afternoon, Rohan went to the neighborhood supermarket with his mother with a ₹500 grocery budget. As they walked down the brightly lit aisles, Rohan saw a shiny remote-controlled race car on the toy rack. "Amma! Can we buy this race car? It is only ₹400!" Rohan pleaded. Mother crouched down and looked at their handwritten shopping list: whole wheat flour, lentils, milk, and Rohan\'s school notebooks. "Rohan, let us understand the difference between a Need and a Want," Mother explained patiently. "A Need is something essential that we must have to survive, stay healthy, and learn—like nutritious food, clean clothes, and schoolbooks. A Want is something pleasant that is nice to have, but we can live happily without it. If we spend ₹400 on the race car today, we won\'t have enough money left for our family\'s food and your notebooks." Rohan thought carefully, nodded with maturity, and put the toy car back. "Let us take care of our Needs first, Amma!" he said proudly.',
          activity: 'Look at five items in your room. Categorize each one as a "Need" or a "Want" on two separate sticky notes.',
          guidedSteps: [
            'Needs: Essential for health, survival, safety, and education (dal, rice, housing, school supplies).',
            'Wants: Luxuries, novelties, and entertainment that enhance comfort but aren\'t essential.',
            'Smart financial planning means fulfilling family Needs first before spending on Wants.'
          ],
          questions: [
            {
              prompt: 'Which of the following items is an essential "Need" for a Class 3 student?',
              options: ['Nutritious food, clean drinking water, and school notebooks', 'A third video game console', 'Five packs of bubblegum'],
              answerIndex: 0,
              explanation: 'Food, hydration, shelter, and educational supplies are indispensable basic needs.'
            },
            {
              prompt: 'What is a "Want"?',
              options: ['Something desirable that is enjoyable to have, but not essential for survival', 'Medicine when you have a fever', 'A winter jacket in freezing snow'],
              answerIndex: 0,
              explanation: 'Wants are non-essential desires that provide comfort or amusement.'
            },
            {
              prompt: 'Why should families always budget for Needs before spending money on Wants?',
              options: ['To ensure essential food, shelter, healthcare, and education are always secure', 'Because spending money is forbidden', 'To make everyone sad'],
              answerIndex: 0,
              explanation: 'Prioritizing needs prevents debt and ensures household stability and security.'
            },
            {
              prompt: 'If you receive pocket money and want both a required drawing notebook (₹40) and an extra candy bar (₹40), but have only ₹50, what is the wiser choice?',
              options: ['Buy the drawing notebook first because it is an educational need', 'Buy only the candy and go to school without the notebook', 'Tear the money in half'],
              answerIndex: 0,
              explanation: 'Prioritizing school supplies fulfills essential responsibilities over temporary treats.'
            }
          ]
        },
        {
          slug: 'indian-coins-and-notes',
          title: 'Indian Currency: Recognizing Coins, Notes & Security Features',
          objective: 'Identify Indian coins (₹1, ₹2, ₹5, ₹10, ₹20) and banknotes (₹10, ₹20, ₹50, ₹100, ₹200, ₹500), and appreciate the Reserve Bank of India guarantee.',
          story: 'In his social studies class, teacher Raghav showed students real Indian currency notes and coins under a magnifying glass. "Look at this crisp lavender-colored ₹100 note," Raghav pointed out. "Notice the official currency symbol ₹, designed by Indian typographer D. Udaya Kumar. Look at the three-headed Lion Capital of Ashoka on the right—our national emblem of truth and strength! And look at the portrait of Mahatma Gandhi. Near the center runs a shiny security thread that glints with colors when tilted under the light. Every official note bears the solemn promise signed by the Governor of the Reserve Bank of India: \'I promise to pay the bearer the sum of one hundred rupees\'. Currency notes are not just pieces of paper; they represent the economic trust and labor of our entire nation!"',
          activity: 'Take a coin (₹1, ₹2, or ₹5) and place it under a sheet of paper. Rub gently with a pencil to make a coin rubbing. Identify the national emblem and the minting year.',
          guidedSteps: [
            'Recognize the official Indian Rupee symbol: ₹.',
            'Common Coins: ₹1, ₹2, ₹5, ₹10, ₹20.',
            'Banknotes: ₹10 (Brown), ₹20 (Greenish-Yellow), ₹50 (Cyan), ₹100 (Lavender), ₹200 (Bright Orange), ₹500 (Stone Grey).',
            'Handle currency with clean hands and respect; never write on or deface banknotes.'
          ],
          questions: [
            {
              prompt: 'What official symbol represents the Indian Rupee on prices and bank notes?',
              options: ['₹', '$', '€', '¥'],
              answerIndex: 0,
              explanation: 'The ₹ symbol combines the Devanagari letter "Ra" and the Roman capital "R".'
            },
            {
              prompt: 'Which national emblem is printed on all genuine Indian coins and banknotes?',
              options: ['The Lion Capital of Ashoka (Four Lions)', 'A tiger paw', 'A peacock feather', 'A palm tree'],
              answerIndex: 0,
              explanation: 'The Lion Capital from the Sarnath Ashoka pillar is India\'s official state emblem.'
            },
            {
              prompt: 'Which institution issues and guarantees all currency banknotes across India?',
              options: ['The Reserve Bank of India (RBI)', 'The local toy shop', 'The post office', 'The railway station'],
              answerIndex: 0,
              explanation: 'The Reserve Bank of India is the central monetary authority of the country.'
            },
            {
              prompt: 'How many 10-rupee coins are needed to make an equal sum of ₹50?',
              options: ['Five ₹10 coins (5 × 10 = 50)', 'Two coins', 'Ten coins', 'Fifty coins'],
              answerIndex: 0,
              explanation: '5 coins of ₹10 equal ₹50 in total value.'
            }
          ]
        },
        {
          slug: 'earning-and-pocket-money',
          title: 'Where Money Comes From: Work, Skills & Earning',
          objective: 'Understand that money is earned through work, dedication, and problem-solving, not created automatically by ATM machines.',
          story: 'Little Shreya accompanied her father to an ATM machine in Mysuru. Father inserted a plastic debit card, typed his 4-digit PIN, and the machine counted notes with a whirring sound before dispensing five ₹500 notes. Shreya clapped: "Appa! That magic machine has free money for everyone!" Father smiled and gently explained: "Shreya, the ATM does not create money out of thin air. For the last 30 days, I have worked as a civil engineer designing water pipelines for the city. My company deposits my monthly salary into our bank account as compensation for my engineering skills and daily hours of work. The ATM only gives us back the money that was already earned and stored there! Money is always the fruit of honest work, education, and helpful skills that serve other people in society."',
          activity: 'Ask three adult relatives or neighbors what kind of service or job they do every day to earn their livelihood.',
          guidedSteps: [
            'Money represents value exchanged for time, skills, labor, and problem-solving.',
            'ATM cards draw money that has already been earned and deposited in a bank.',
            'Developing knowledge, good work habits, and practical skills enables people to earn and support their families.'
          ],
          questions: [
            {
              prompt: 'Where does the money dispensed by an ATM machine originally come from?',
              options: ['It comes from the bank account where earned wages and salary were deposited', 'The machine makes free money for anyone', 'From the sky'],
              answerIndex: 0,
              explanation: 'ATMs distribute funds previously earned and deposited into bank accounts.'
            },
            {
              prompt: 'How do adults earn money to support their households?',
              options: ['By providing useful services, making products, or working skilled jobs', 'By wishing on stars', 'By sleeping all day'],
              answerIndex: 0,
              explanation: 'Income is earned through employment, entrepreneurship, and skilled services.'
            },
            {
              prompt: 'Why are education and learning important for your future financial wellbeing?',
              options: ['They build valuable skills and knowledge that enable you to solve real problems and earn a livelihood', 'They only teach you how to sit still', 'They have no connection'],
              answerIndex: 0,
              explanation: 'Education cultivates problem-solving capabilities that are rewarded in the economy.'
            },
            {
              prompt: 'If a farmer grows organic tomatoes and sells them at the market, what is he earning money for?',
              options: ['His labor, agricultural knowledge, and caring for the crops', 'Doing nothing', 'Just owning the land'],
              answerIndex: 0,
              explanation: 'The farmer is compensated for his hard work, investment, and harvest yields.'
            }
          ]
        },
        {
          slug: 'piggy-bank-and-saving',
          title: 'The Magic of Saving: Small Drops Fill the Clay Pot',
          objective: 'Learn delayed gratification, short-term vs long-term saving goals, and the benefits of keeping emergency savings.',
          story: 'On his eighth birthday, grandfather gave Kabir an unpainted terracotta piggy bank shaped like a pot. "Kabir," said Grandfather, "every time you receive a ₹10 coin as a reward or have leftover change, drop it into this pot. Don\'t break it open to buy cheap plastic trinkets. Watch what happens after six months." Kabir followed grandfather\'s advice faithfully. When he helped wash the bicycle, grandfather gave him ₹10. When his uncle visited, he received ₹20. Whenever Kabir felt like buying unneeded candy at the corner store, he paused and remembered his dream: a sturdy blue telescope to view the craters on the moon. After six months, grandfather helped him carefully open the base of the clay pot. When they counted the coins on the carpet, Kabir had accumulated ₹640! He had enough to purchase the telescope and still had ₹140 left to start his next savings goal. "Patience and small savings turn big dreams into reality," beamed Kabir.',
          activity: 'Set a savings goal for yourself (like a book or a badminton racket). Calculate how many ₹10 coins you would need to save each week to reach it in two months.',
          guidedSteps: [
            'Delayed Gratification: waiting and resisting short-term temptations to achieve a larger future goal.',
            'Track your savings: write down every deposit in a small notebook.',
            'Keep an emergency reserve: never spend 100% of your money at once.'
          ],
          questions: [
            {
              prompt: 'What does "Delayed Gratification" mean when managing money?',
              options: ['Resisting buying small unneeded items right now in order to save for a bigger, meaningful future goal', 'Spending all your money immediately', 'Hiding money under a rock forever'],
              answerIndex: 0,
              explanation: 'Delayed gratification prioritizes meaningful future rewards over impulsive treats.'
            },
            {
              prompt: 'If you save two ₹10 coins every week, how much money will you accumulate in 8 weeks?',
              options: ['₹160 (8 × ₹20 = ₹160)', '₹80', '₹200', '₹50'],
              answerIndex: 0,
              explanation: '2 × ₹10 = ₹20 per week. Over 8 weeks: 8 × ₹20 = ₹160.'
            },
            {
              prompt: 'Why is it wise to keep some emergency savings rather than spending every single rupee?',
              options: ['Unexpected needs or repairs can happen anytime, and savings protect you', 'Money spoils if not hidden', 'To boast to friends'],
              answerIndex: 0,
              explanation: 'Savings provide resilience against unforeseen emergencies and disruptions.'
            },
            {
              prompt: 'What is the old Indian proverb about small consistent savings?',
              options: ['"ಹನಿ ಹನಿ ಸೇರಿದರೆ ಹಳ್ಳ" / "बूंद-बूंद से घड़ा भरता है" (Drop by drop fills the pot)', '"Spend today, worry tomorrow"', '"Money grows on neem trees"'],
              answerIndex: 0,
              explanation: 'Consistent small efforts accumulate into substantial financial security over time.'
            }
          ]
        },
        {
          slug: 'smart-shopping-santhe',
          title: 'The Santhe Market: Comparing Prices & Calculating Change',
          objective: 'Develop smart consumer habits: creating shopping lists, comparing unit prices, and verifying change returned by shopkeepers.',
          story: 'Every Tuesday, the vibrant open-air Santhe (weekly market) sets up in Ramanagara. Maya and her elder brother Aryan were given a shopping basket, a shopping list (1 kg carrots, 1 kg onions, 500g ginger), and a single ₹200 note. At the first vegetable stall, a vendor offered carrots for ₹40 per kg. Aryan noticed a farmer two stalls down selling fresh, crisp carrots straight from his farm for ₹30 per kg! "Look Maya, by walking just ten extra steps and comparing prices, we save ₹10 on the exact same quality carrots!" Aryan noted. They bought the carrots for ₹30, onions for ₹40, and ginger for ₹30. "Total cost: 30 + 40 + 30 = ₹100," calculated Maya. Aryan handed the ₹200 note to the farmer, who handed back two ₹50 notes. "₹200 paid minus ₹100 cost equals ₹100 change—correct!" Maya confirmed with a smile. Smart shoppers compare prices, respect hard-working farmers, and always verify their change.',
          activity: 'Set up a pretend grocery store at home with empty boxes. Practice calculating the total cost of 3 items and computing the exact change from a ₹100 note.',
          guidedSteps: [
            'Always make a shopping list before visiting the market to avoid impulsive purchases.',
            'Compare prices and quality across different vendors before buying.',
            'Calculate the sum mentally before paying.',
            'Verify the change handed back before leaving the counter.'
          ],
          questions: [
            {
              prompt: 'Why should you prepare a shopping list before visiting a grocery store or market?',
              options: ['It keeps you focused on buying what you actually need and prevents overspending', 'To practice your handwriting only', 'Because the shopkeeper demands it'],
              answerIndex: 0,
              explanation: 'Lists prevent impulse purchases and keep household expenditure within budget.'
            },
            {
              prompt: 'If your shopping bill comes to ₹65 and you hand the shopkeeper a ₹100 note, how much change should you receive back?',
              options: ['₹35 (100 - 65 = 35)', '₹45', '₹25', '₹50'],
              answerIndex: 0,
              explanation: '₹100 - ₹65 = ₹35 in change.'
            },
            {
              prompt: 'What does "Comparing Prices" mean when shopping for essentials?',
              options: ['Checking the cost of the same quality item across different sellers to find fair value', 'Always picking the most expensive item', 'Buying everything at the first shop you see'],
              answerIndex: 0,
              explanation: 'Comparing prices ensures you pay a fair market rate without overpaying.'
            },
            {
              prompt: 'Why is it important to count your change immediately at the counter?',
              options: ['To ensure the shopkeeper made no honest mistake in calculation', 'To show off your math skills', 'To take pictures of the coins'],
              answerIndex: 0,
              explanation: 'Checking change immediately allows any discrepancy to be resolved courteously on the spot.'
            }
          ]
        },
        {
          slug: 'sharing-and-giving',
          title: 'The Joy of Daan: Sharing, Community Care & Giving Back',
          objective: 'Understand charitable giving, sharing resources with those in need, and the ethical responsibility of community stewardship.',
          story: 'During the harvest season in their village, ten-year-old Tanvi and her family sorted their home library. Tanvi had five beautifully illustrated storybooks and a set of color pencils that she had outgrown. Instead of letting them gather dust on a shelf, Tanvi neatly cleaned the book covers and packed them in a clean cotton bag. Together with her parents, she visited the local community learning center where children from nearby farming hamlets gathered after school. When Tanvi handed the storybooks to little Meera, Meera\'s eyes sparkled with joy as she turned the colorful pages. "Giving does not mean giving away things you don\'t care about," Grandmother reminded Tanvi. "Daan means sharing with dignity and love. When we share our books, our time, our knowledge, and our surplus food, we strengthen the whole community. True wealth is not measured by how much you hold in your fists, but by how many lives you touch with open hands."',
          activity: 'Identify one storybook or toy in good condition that you have outgrown. With your parents\' permission, gift it to a community library or younger child.',
          guidedSteps: [
            'Sharing strengthens community bonds and brings deep inner happiness.',
            'Always ensure donated items are clean, complete, and in good condition.',
            'You can share more than money: your time, your kindness, and your knowledge are precious gifts.'
          ],
          questions: [
            {
              prompt: 'What is the true spirit of giving (Daan) in Gurukula tradition?',
              options: ['Sharing resources, knowledge, and kindness with dignity and love', 'Throwing away trash', 'Showing off to get praise'],
              answerIndex: 0,
              explanation: 'Giving is rooted in empathy, respect, and mutual community support.'
            },
            {
              prompt: 'Before donating an outgrown book or toy to another child, what should you do?',
              options: ['Clean it and ensure all pages or pieces are in good, safe condition', 'Scribble inside it', 'Break the covers'],
              answerIndex: 0,
              explanation: 'Donations should always be respectful, complete, and well cared for.'
            },
            {
              prompt: 'Can someone share and give back to society if they don\'t have a lot of money?',
              options: ['Yes: they can share their time, help clean, teach younger kids, and speak kind words', 'No, only rich people can help', 'No, money is the only thing that matters'],
              answerIndex: 0,
              explanation: 'Service, empathy, and voluntary time are among the most valuable forms of sharing.'
            },
            {
              prompt: 'How does sharing books and educational tools benefit the entire community?',
              options: ['It gives more children access to learning and helps everyone grow together', 'It makes fewer books available', 'It has no effect'],
              answerIndex: 0,
              explanation: 'Shared knowledge elevates literacy and mutual empowerment across society.'
            }
          ]
        }
      ]
    }
  ]
};
