/**
 * Vayentra Gurukula — Class 2 Foundation Years Curriculum Data
 * Official CBSE (NCERT 2026–27 reference edition) & Karnataka State Board alignment.
 * Covers:
 * 1. English (Mridang Class 2)
 * 2. Mathematics (Joyful Mathematics Class 2)
 * 3. Hindi (Sarangi Class 2) for CBSE / Kannada (Savirudi Class 2) for Karnataka State
 * 4. Environmental Studies / The World Around Us (Class 2 EVS)
 * 5. Artificial Intelligence & Digital Literacy (Class 2 Vayentra Original Enrichment)
 * 6. Financial Literacy & Money Management (Class 2 Vayentra Original Enrichment)
 */

export const GRADE2_CURRICULUM = {
  grade: 2,
  edition: '2026-27',
  pedagogy: 'Concept-first, experiential, multilingual support, tactile offline discovery; strictly child-safe (no generative chatbots).',
  official: [
    {
      board: 'CBSE',
      subjects: [
        {
          name: 'English',
          book: 'Mridang (Class 2)',
          source: 'https://www.ciet.ncert.gov.in/audio-book/class2/english',
          status: 'source_chapters_verified',
          chapters: [
            'My Bicycle',
            'Picture Reading',
            'It is Fun',
            'Seeing without Seeing',
            'Come Back, Cat!',
            'Between Home and School',
            'This is My Town',
            'A Show of Hands',
            'Out in the Garden',
            'The Elephant and the Dog'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'My Bicycle',
              conceptKey: 'bicycle-rhyme-parts',
              title: 'My Shiny Bicycle & Action Rhymes',
              objective: 'Identify parts of a bicycle, rhyming words, and build action vocabulary.',
              story: 'Aarav has a bright red bicycle. It has two round wheels, shiny silver handlebars, a little bell that goes tring-tring, and two pedals. When Aarav pushes the pedals with his feet, the chain turns and the wheels roll forward! "Tring-tring!" rings the bell to tell people on the path to make way safely. Aarav always wears his helmet before sitting on the seat. Bicycles are wonderful machines because they use pedal power instead of petrol or smoke. What sounds does your cycle or toy make when it moves?',
              activity: 'Draw a bicycle on paper with two round wheels, a seat, and handlebars. Count how many circular parts you can find.',
              guidedSteps: [
                'Say the words: Bell, Pedal, Wheel, Helmet.',
                'Find two words that rhyme: Ring and Sing, Red and Bed.',
                'Trace the circles of the two wheels in the air with both pointer fingers.'
              ],
              teacherPrompt: 'Encourage children to name each part and explain why safety helmets are essential.',
              visualScene: {
                kind: 'bicycle-explore',
                elements: [
                  { id: 'wheels', label: 'Two Round Wheels', color: '#1e293b' },
                  { id: 'bell', label: 'Ringing Bell (Tring!)', color: '#f59e0b' },
                  { id: 'pedals', label: 'Pedals for Foot Power', color: '#3b82f6' },
                  { id: 'helmet', label: 'Safety Helmet', color: '#ef4444' }
                ]
              },
              questions: [
                {
                  prompt: 'How many wheels does a bicycle have?',
                  options: ['One', 'Two', 'Four'],
                  answerIndex: 1,
                  explanation: 'Bi-cycle means two circles or two wheels!'
                },
                {
                  prompt: 'Which word rhymes with "ring"?',
                  options: ['Sing', 'Car', 'Run'],
                  answerIndex: 0,
                  explanation: 'Ring and Sing end with the exact same sound: -ing.'
                },
                {
                  prompt: 'What safety gear should we wear before riding a bicycle?',
                  options: ['A helmet', 'A party cap', 'Sunglasses only'],
                  answerIndex: 0,
                  explanation: 'A safety helmet protects our head from bumps.'
                },
                {
                  prompt: 'What makes the bicycle wheels move forward?',
                  options: ['Pushing the pedals with our feet', 'Blowing air on it', 'Waiting silently'],
                  answerIndex: 0,
                  explanation: 'Our feet push the pedals, which turns the chain and wheels.'
                }
              ]
            },
            {
              chapterNumber: 2,
              chapterTitle: 'Picture Reading',
              conceptKey: 'describing-pictures',
              title: 'Looking Closely: The Busy Park Scene',
              objective: 'Observe fine details in a picture, describe actions, and answer who/what/where questions.',
              story: 'In the morning park, sunlight filters through the tall neem trees. Look closely at the picture: an elder sister is helping her younger brother tie his shoe laces. Near the bench, a friendly puppy wags its tail, watching a little bird drink water from a shallow clay bowl. On the paved path, two children are skipping with a rope. When we look at a picture, our eyes can discover many little stories. Describing pictures helps us use naming words (nouns) and doing words (verbs) in happy sentences!',
              activity: 'Look out of your window for two minutes. Name three things that are still and three things that are moving.',
              guidedSteps: [
                'Name three living things in the park picture.',
                'What is the puppy doing? Say the action word aloud.',
                'Tell an adult one complete sentence about the sunny day.'
              ],
              teacherPrompt: 'Prompt the child with open questions: "What do you think the children will do next?"',
              visualScene: {
                kind: 'park-detail',
                elements: [
                  { id: 'puppy', label: 'Playful Puppy', color: '#b45309' },
                  { id: 'bowl', label: 'Bird Water Bowl', color: '#0284c7' },
                  { id: 'skipping', label: 'Children Skipping', color: '#10b981' }
                ]
              },
              questions: [
                {
                  prompt: 'Where was the little bird drinking water from?',
                  options: ['A shallow clay bowl', 'A plastic bottle', 'A deep swimming pool'],
                  answerIndex: 0,
                  explanation: 'Kind people leave shallow clay bowls so birds can drink safely.'
                },
                {
                  prompt: 'Which of these is an action word (verb) from the park story?',
                  options: ['Skipping', 'Bench', 'Tree'],
                  answerIndex: 0,
                  explanation: 'Skipping is an action that someone does.'
                },
                {
                  prompt: 'What does "picture reading" mean?',
                  options: ['Looking carefully and describing what we see', 'Tearing the page', 'Colouring with black only'],
                  answerIndex: 0,
                  explanation: 'Picture reading means observing details and narrating the story in words.'
                },
                {
                  prompt: 'How many children were skipping with the rope in the story?',
                  options: ['Two', 'Five', 'Ten'],
                  answerIndex: 0,
                  explanation: 'Two children were skipping rope together on the path.'
                }
              ]
            }
          ]
        },
        {
          name: 'Mathematics',
          book: 'Joyful Mathematics (Class 2)',
          source: 'https://www.ciet.ncert.gov.in/audio-book/class2/maths',
          status: 'source_chapters_verified',
          chapters: [
            'A Day at the Beach',
            'Shapes Around Us',
            'Fun with Numbers',
            'Shadow Story (Togalu Gombeyaata)',
            'Playing with Lines',
            'Decoration for Festival',
            'Rani\'s Gift',
            'Grouping and Sharing',
            'Which Season is It?',
            'Fun at the Fair',
            'Data Handling'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'A Day at the Beach',
              conceptKey: 'counting-bundles-of-ten',
              title: 'Shells on the Sand: Bundles of Ten & Loose Ones',
              objective: 'Group objects in bundles of 10 and count two-digit numbers up to 50.',
              story: 'Meera and Vikram are walking along the sandy beach. They collect shiny white sea shells. Soon, their basket is full! Meera says, "Counting one by one takes a long time. Let us make groups of 10!" They place 10 shells in the first circle: that is 1 Ten. They make another group of 10: that is 2 Tens (20). A third group of 10 makes 3 Tens (30). Beside the three groups, there are 4 loose shells left over. "Look!" Vikram smiles, "3 Tens and 4 Ones is 34!" Bundling by tens makes counting fast and accurate.',
              activity: 'Take 25 rajma or chana seeds from the kitchen. Group them into bowls of 10. How many tens and loose seeds do you have?',
              guidedSteps: [
                'Count 10 items together to make 1 bundle of Ten.',
                'Count how many bundles: 10, 20, 30.',
                'Add the single ones to find the total number.'
              ],
              teacherPrompt: 'Emphasize that 10 ones together form 1 ten. Use real stones, sticks, or beads.',
              visualScene: {
                kind: 'bundles-beach',
                elements: [
                  { id: 'bundle1', label: '10 Shells (Ten)', color: '#3b82f6' },
                  { id: 'bundle2', label: '10 Shells (Twenty)', color: '#3b82f6' },
                  { id: 'bundle3', label: '10 Shells (Thirty)', color: '#3b82f6' },
                  { id: 'loose', label: '4 Loose Shells (Ones)', color: '#f59e0b' }
                ]
              },
              questions: [
                {
                  prompt: 'What number is made by 2 Tens and 5 Ones?',
                  options: ['25', '52', '7'],
                  answerIndex: 0,
                  explanation: '2 tens is 20, plus 5 ones equals 25.'
                },
                {
                  prompt: 'If you have 4 bundles of 10 pencils, how many pencils is that?',
                  options: ['40', '14', '4'],
                  answerIndex: 0,
                  explanation: '10 + 10 + 10 + 10 = 40 pencils.'
                },
                {
                  prompt: 'Why do Meera and Vikram make groups of 10?',
                  options: ['To count quickly without losing track', 'To hide the shells', 'To throw them back into the water'],
                  answerIndex: 0,
                  explanation: 'Grouping by 10 makes counting big collections easy.'
                },
                {
                  prompt: 'What number comes immediately after 29?',
                  options: ['30', '28', '31'],
                  answerIndex: 0,
                  explanation: '29 is 2 tens and 9 ones. Adding one more gives 3 tens (30).'
                }
              ]
            },
            {
              chapterNumber: 2,
              chapterTitle: 'Shapes Around Us',
              conceptKey: 'roll-slide-stack',
              title: 'Roll, Slide, and Stack: 3D Shapes at Play',
              objective: 'Distinguish between objects that roll, slide, or can be stacked.',
              story: 'Vikram places a round lemon on the sloping wooden plank. Wheee! It rolls smoothly all the way down! Next, Meera places her flat wooden pencil box on the slope. It does not roll; it slides down flatly. Then Vikram tries with a battery cell. If he places it on its curved side, it rolls! If he stands it on its flat circular face, it slides! Vikram and Meera discover that round, curved surfaces roll, while flat faces slide. Things with flat faces can also be stacked one on top of another to build a tall tower!',
              activity: 'Find three things in your room: one that rolls (like a ball), one that slides (like an eraser), and one that can stack (like books).',
              guidedSteps: [
                'Touch the curved surface of a ball: does it roll?',
                'Touch the flat face of a book: does it slide?',
                'Try stacking 3 coin pieces or 3 square blocks: do they stand steady?'
              ],
              teacherPrompt: 'Let the child physically test rolling and sliding using a slanted cardboard plank.',
              visualScene: {
                kind: 'roll-slide-ramp',
                elements: [
                  { id: 'ball', label: 'Round Ball (Rolls)', color: '#ef4444' },
                  { id: 'box', label: 'Flat Box (Slides)', color: '#3b82f6' },
                  { id: 'tin', label: 'Can / Tin (Rolls & Slides)', color: '#10b981' }
                ]
              },
              questions: [
                {
                  prompt: 'Which of these objects will roll smoothly down a ramp?',
                  options: ['A round orange', 'A flat matchbox', 'A postcard'],
                  answerIndex: 0,
                  explanation: 'Round objects with curved surfaces roll.'
                },
                {
                  prompt: 'Which of these objects can easily be stacked to make a tower?',
                  options: ['Flat square blocks', 'Round glass marbles', 'Footballs'],
                  answerIndex: 0,
                  explanation: 'Flat surfaces rest steadily on top of each other.'
                },
                {
                  prompt: 'Can a cylinder tin roll AND slide?',
                  options: ['Yes, it rolls on its curved side and slides on its flat face', 'No, never', 'It can only fly'],
                  answerIndex: 0,
                  explanation: 'A cylinder has both a curved surface (rolls) and flat circular faces (slides).'
                },
                {
                  prompt: 'What kind of surface helps an object slide?',
                  options: ['A flat surface', 'A spiky surface', 'A completely round surface'],
                  answerIndex: 0,
                  explanation: 'Flat surfaces glide along slopes without rolling.'
                }
              ]
            }
          ]
        },
        {
          name: 'Hindi',
          book: 'Sarangi (Class 2)',
          source: 'https://www.ciet.ncert.gov.in/audio-book/class2/hindi',
          status: 'source_chapters_verified',
          chapters: [
            'नीमा की दादी',
            'घर',
            'माला की चाँदी की पायल',
            'बारिश',
            'तितली',
            'चींटी और कबूतर',
            'हमारे त्योहार',
            'आसमान का तारा'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'नीमा की दादी',
              conceptKey: 'family-care-hindi',
              title: 'नीमा और उसकी प्यारी दादी: आदर और सहयोग',
              objective: 'परिवार के सदस्यों के प्रति आदर, प्रेम और सहयोग की भावना विकसित करना।',
              story: 'नीमा की दादी बहुत प्यारी हैं। जब नीमा स्कूल से घर लौटती है, तो दादी मुस्कुराकर उसका स्वागत करती हैं। दादी की आँखों पर चश्मा है और उनके बाल सफ़ेद हैं। नीमा रोज़ अपनी दादी को स्कूल की सारी बातें बताती है कि आज उसने कौन सी कविता सीखी और खेल के मैदान में क्या हुआ। कभी-कभी दादी का चश्मा मेज़ पर छूट जाता है, तो नीमा झटपट चश्मा लाकर दादी के हाथ में देती है। दादी प्यार से नीमा की पीठ थपथपाती हैं। घर में बड़े-बुज़ुर्गों का ध्यान रखना और उनकी मदद करना हम सभी का कर्तव्य है।',
              activity: 'आज शाम अपने घर में दादा-दादी या माता-पिता के लिए पानी का एक गिलास लाएँ और उनसे कोई पुरानी कहानी सुनाने को कहें।',
              guidedSteps: [
                'कहानी में नीमा ने दादी की क्या मदद की? सोचकर बताएं।',
                'अपने परिवार के सदस्यों के नाम आदरपूर्वक बोलें।',
                'दादी, नानी, पिता और माता—इन शब्दों को स्पष्ट रूप से दोहराएँ।'
              ],
              teacherPrompt: 'बच्चों को बड़ों का आदर करने और छोटे-छोटे घरेलू कामों में हाथ बँटाने के लिए प्रेरित करें।',
              visualScene: {
                kind: 'hindi-family',
                elements: [
                  { id: 'grandma', label: 'प्यारी दादी', color: '#f59e0b' },
                  { id: 'neema', label: 'हँसमुख नीमा', color: '#ec4899' },
                  { id: 'glasses', label: 'दादी का चश्मा', color: '#6366f1' }
                ]
              },
              questions: [
                {
                  prompt: 'नीमा ने दादी की क्या चीज़ ढूंढकर दी?',
                  options: ['उनका चश्मा', 'उनकी घड़ी', 'उनकी किताब'],
                  answerIndex: 0,
                  explanation: 'नीमा ने मेज़ से दादी का चश्मा लाकर दिया।'
                },
                {
                  prompt: 'स्कूल से आकर नीमा दादी को क्या बताती थी?',
                  options: ['स्कूल की कविताएँ और दिन भर की बातें', 'बाज़ार की कीमतें', 'कुछ भी नहीं'],
                  answerIndex: 0,
                  explanation: 'नीमा दादी से अपनी हर बात साझा करती थी।'
                },
                {
                  prompt: 'घर के बड़े-बुज़ुर्गों के साथ हमारा व्यवहार कैसा होना चाहिए?',
                  options: ['आदर और प्यार भरा', 'गुस्से वाला', 'लापरवाह'],
                  answerIndex: 0,
                  explanation: 'हमें अपने बड़ों का हमेशा आदर और सहयोग करना चाहिए।'
                },
                {
                  prompt: '‘दादी’ शब्द का क्या अर्थ है?',
                  options: ['पिताजी की माँ', 'माताजी की बहन', 'मामा की बेटी'],
                  answerIndex: 0,
                  explanation: 'पिताजी की माँ को दादी कहते हैं।'
                }
              ]
            },
            {
              chapterNumber: 2,
              chapterTitle: 'घर',
              conceptKey: 'ghar-home-safety',
              title: 'हमारा प्यारा घर: सुरक्षा और अपनत्व',
              objective: 'घर की अवधारणा, उसके विभिन्न कमरों की उपयोगिता और घर को साफ़-सुथरा रखने की आदत।',
              story: 'घर केवल ईंट और सीमेंट की दीवारें नहीं होता, घर बनता है परिवार के प्रेम, सुरक्षा और अपनत्व से! हमारा घर हमें सर्दी, गर्मी, आँधी और बारिश से बचाता है। घर में रसोई होती है जहाँ ताज़ा और पौष्टिक भोजन बनता है, सोने के लिए शांत कमरा होता है और पढ़ने के लिए एक मेज़ होती है। आर्यन और उसकी बहन रोज़ अपने खिलौने और किताबें पढ़ाई के बाद सही जगह पर रखते हैं। जब घर साफ़-सुथरा रहता है, तो वहाँ स्वास्थ्य और प्रसन्नता का वास होता है।',
              activity: 'अपने घर का सुंदर चित्र बनाएँ और उसमें अपनी मनपसंद खिड़की और दरवाज़े पर रंग भरें।',
              guidedSteps: [
                'घर हमें किन-किन चीज़ों से सुरक्षा प्रदान करता है?',
                'अपने घर को साफ़ और व्यवस्थित रखने के लिए आप क्या करते हैं?',
                '‘आश्रय’, ‘सुरक्षा’ और ‘अपनत्व’ शब्दों को बोलकर अभ्यास करें।'
              ],
              teacherPrompt: 'बच्चों को अपने घर की सफ़ाई में हाथ बँटाने और अपनी चीज़ें व्यवस्थित रखने के लिए प्रेरित करें।',
              visualScene: {
                kind: 'sweet-home',
                elements: [
                  { id: 'house', label: 'प्यारा घर', color: '#f59e0b' },
                  { id: 'roof', label: 'मज़बूत छत', color: '#dc2626' },
                  { id: 'garden', label: 'हरा बगीचा', color: '#16a34a' }
                ]
              },
              questions: [
                {
                  prompt: 'घर हमें किन चीज़ों से बचाता है?',
                  options: ['धूप, बारिश, सर्दी और आँधी से', 'अच्छी चीज़ों से', 'खुशियों से'],
                  answerIndex: 0,
                  explanation: 'घर हमें मौसम के दुष्प्रभावों और बाहरी खतरों से सुरक्षित आश्रय देता है।'
                },
                {
                  prompt: 'पढ़ाई करने के बाद किताबों को कहाँ रखना चाहिए?',
                  options: ['अपनी सही जगह पर व्यवस्थित', 'फर्श पर फेंक देना चाहिए', 'सोफे के नीचे'],
                  answerIndex: 0,
                  explanation: 'किताबों और खिलौनों को हमेशा उपयोग के बाद सही जगह पर रखना चाहिए।'
                },
                {
                  prompt: '‘घर’ का पर्यायवाची शब्द क्या है?',
                  options: ['गृह या सदन', 'जंगल', 'सड़क'],
                  answerIndex: 0,
                  explanation: 'घर को गृह, आवास या सदन भी कहा जाता है।'
                },
                {
                  prompt: 'घर में स्वच्छता रखने से क्या लाभ होता है?',
                  options: ['बीमारियाँ दूर रहती हैं और मन प्रसन्न रहता है', 'कमरे गंदे लगते हैं', 'कोई फायदा नहीं होता'],
                  answerIndex: 0,
                  explanation: 'स्वच्छ घर में स्वास्थ्य, ऊर्जा और शांति का वास होता है।'
                }
              ]
            },
            {
              chapterNumber: 3,
              chapterTitle: 'माला की चाँदी की पायल',
              conceptKey: 'mala-ki-payal',
              title: 'माला की पायल: सजगता, ईमानदारी और मधुर ध्वनि',
              objective: 'ध्वनि की पहचान, अपनी वस्तुओं की देखभाल और ईमानदारी का महत्व।',
              story: 'माला की नानी ने उसे जन्मदिन पर चाँदी की सुंदर घुंघरूदार पायल भेंट की थी। जब माला चलती, तो छन-छन, छन-छन की मधुर ध्वनि गूँज उठती। एक दिन पार्क में झूला झूलते समय माला की एक पायल घास में खुल गई। माला बहुत उदास हो गई। तभी उसके मित्र रोहन ने घास में कोई चमकती हुई चीज़ देखी। रोहन ने देखा कि वह माला की पायल है। उसने तुरंत दौड़कर माला को पायल वापस कर दी। माला ने खुश होकर रोहन को धन्यवाद दिया। ईमानदारी सबसे बड़ा आभूषण है।',
              activity: 'विभिन्न वस्तुओं (जैसे चम्मच, घंटी, चाबी) की आवाज़ सुनकर पहचानें कि किसकी आवाज़ कैसी है।',
              guidedSteps: [
                'पायल से कैसी ध्वनि निकलती है? (छन-छन)।',
                'जब हमें किसी की खोई हुई चीज़ मिले, तो हमें क्या करना चाहिए? (उसे तुरंत लौटाना चाहिए)।',
                '‘ईमानदारी’, ‘पायल’ और ‘धन्यवाद’ शब्दों का शुद्ध उच्चारण करें।'
              ],
              teacherPrompt: 'कक्षा में बच्चों को ईमानदारी और दूसरों की अमानत वापस करने के महत्व पर चर्चा करवाएँ।',
              visualScene: {
                kind: 'anklet-sound',
                elements: [
                  { id: 'anklet', label: 'चाँदी की पायल', color: '#94a3b8' },
                  { id: 'mala', label: 'प्रसन्न माला', color: '#ec4899' },
                  { id: 'grass', label: 'हरी घास', color: '#22c55e' }
                ]
              },
              questions: [
                {
                  prompt: 'माला की पायल से कैसी आवाज़ आती थी?',
                  options: ['छन-छन, छन-छन', 'धम-धम', 'पीं-पीं'],
                  answerIndex: 0,
                  explanation: 'पायल के घुंघरुओं से छन-छन की मधुर झंकार निकलती है।'
                },
                {
                  prompt: 'रोहन ने पायल मिलने पर क्या किया?',
                  options: ['ईमानदारी से माला को लौटा दी', 'अपनी जेब में छिपा ली', 'फेंक दी'],
                  answerIndex: 0,
                  explanation: 'रोहन ने ईमानदारी दिखाते हुए तुरंत माला को उसकी खोई हुई पायल वापस दी।'
                },
                {
                  prompt: 'चाँदी किस रंग की धातु होती है?',
                  options: ['चमकदार सफ़ेद/धुंधली धूसर', 'हरी', 'लाल'],
                  answerIndex: 0,
                  explanation: 'चाँदी एक चमकदार सफ़ेद धातु है जिससे आभूषण बनते हैं।'
                },
                {
                  prompt: 'जब कोई हमारी मदद करे या खोई चीज़ लौटाए, तो हमें क्या कहना चाहिए?',
                  options: ['"धन्यवाद" या शुक्रिया', 'मुँह फेर लेना', 'डाँटना'],
                  answerIndex: 0,
                  explanation: 'दूसरों की सहायता के लिए हमेशा कृतज्ञतापूर्वक "धन्यवाद" कहना चाहिए।'
                }
              ]
            },
            {
              chapterNumber: 4,
              chapterTitle: 'बारिश',
              conceptKey: 'barish-monsoon',
              title: 'रिमझिम बारिश: जल चक्र और प्रकृति का उल्लास',
              objective: 'वर्षा ऋतु, जल चक्र का प्राथमिक ज्ञान और वर्षा में सावधानी।',
              story: 'गर्मी के बाद जब आसमान में काले-कजरारे बादल घिरते हैं, तो धरती की प्यास बुझाने के लिए बारिश आती है। टिप-टिप, टिप-टिप बूँदें गिरती हैं और मिट्टी से सोंधी-सोंधी महक उठने लगती है। मोर अपने पंख फैलाकर नाचने लगते हैं और मेढक टर्र-टर्र की तान छेड़ते हैं। कबीर ने छाता खोला और रेनकोट पहनकर कागज़ की नाव पानी में छोड़ी। दादाजी ने समझाया, "सूरज की गर्मी से नदियों और समुद्र का पानी भाप बनकर ऊपर उड़ता है, जिससे बादल बनते हैं और फिर वही पानी बारिश बनकर बरसता है।" यही सुंदर जल-चक्र है।',
              activity: 'एक कटोरी में थोड़ा सा पानी धूप में रखें और 3 घंटे बाद देखें कि पानी कम हुआ या नहीं। भाप बनने की क्रिया समझें।',
              guidedSteps: [
                'बारिश का पानी कहाँ से आता है? (बादलों से)।',
                'बारिश के समय हम किन चीज़ों का उपयोग करते हैं? (छाता और रेनकोट)।',
                '‘वर्षा’, ‘जल-चक्र’, ‘मेघ’ और ‘सोंधी’ शब्दों का उच्चारण करें।'
              ],
              teacherPrompt: 'बच्चों को जल-चक्र की सरल प्रक्रिया समझाएँ और पानी की हर बूँद को बचाने की प्रेरणा दें।',
              visualScene: {
                kind: 'rain-peacock',
                elements: [
                  { id: 'peacock', label: 'नाचता मोर', color: '#0284c7' },
                  { id: 'rain', label: 'वर्षा की बूँदें', color: '#38bdf8' },
                  { id: 'umbrella', label: 'रंग-बिरंगा छाता', color: '#f59e0b' }
                ]
              },
              questions: [
                {
                  prompt: 'बारिश आने पर कौन सा सुंदर पक्षी पंख फैलाकर नाचता है?',
                  options: ['हमारा राष्ट्रीय पक्षी मोर', 'कौआ', 'चील'],
                  answerIndex: 0,
                  explanation: 'बारिश के सुहावने मौसम में मोर अपने पंख फैलाकर आनंद से नाचता है।'
                },
                {
                  prompt: 'पानी भाप बनकर ऊपर क्यों उठता है?',
                  options: ['सूरज की तेज़ गर्मी से', 'ठंड के कारण', 'रात के अंधेरे से'],
                  answerIndex: 0,
                  explanation: 'सूर्य की ऊष्मा से जल वाष्प बनकर ऊपर उठता है और बादल बनाता है।'
                },
                {
                  prompt: 'बारिश में भीगने से बचने के लिए हम क्या प्रयोग करते हैं?',
                  options: ['छाता या बरसाती (रेनकोट)', 'धूप का चश्मा', 'ऊनी टोपी'],
                  answerIndex: 0,
                  explanation: 'बारिश से सुरक्षा के लिए छाता या रेनकोट का प्रयोग किया जाता है।'
                },
                {
                  prompt: 'भारत का राष्ट्रीय पक्षी कौन सा है?',
                  options: ['मोर', 'तोता', 'कबूतर'],
                  answerIndex: 0,
                  explanation: 'मोर भारत का गौरवशाली राष्ट्रीय पक्षी है।'
                }
              ]
            },
            {
              chapterNumber: 5,
              chapterTitle: 'तितली',
              conceptKey: 'titli-butterfly',
              title: 'रंग-बिरंगी तितली: फूलों की सहेली और परागण',
              objective: 'कीट-पतंगों का जीवन, फूलों के साथ उनका संबंध और तितलियों को न पकड़ने की दयालुता।',
              story: 'बगीचे में लाल गुलाब, पीले गेंदे और सफ़ेद चमेली के फूल खिले थे। तभी वहाँ एक सुंदर तितली उड़ती हुई आई। उसके पंखों पर सुनहरे, नीले और नारंगी रंग के अद्भुत डिज़ाइन बने थे। नन्ही रिया तितली को पकड़ने के लिए आगे बढ़ी। माँ ने प्यार से हाथ पकड़कर समझाया, "रिया, तितली को छूना नहीं चाहिए। इसके पंख बहुत नाज़ुक होते हैं। यह एक फूल से दूसरे फूल पर बैठकर उनका रस पीती है और पौधों में नए बीज व फल बनने में मदद करती है।" रिया ने हाथ पीछे कर लिया और दूर से ही तितली को उड़ते देखकर ताली बजाई।',
              activity: 'रंग-बिरंगे कागज़ को मोड़कर एक सुंदर तितली बनाएँ और उसे अपने कमरे में सजाएँ।',
              guidedSteps: [
                'तितली के पंख कैसे होते हैं? (रंगीन और नाज़ुक)।',
                'हमें तितलियों को क्यों नहीं पकड़ना चाहिए? (उनके पंख खराब हो सकते हैं)।',
                '‘तितली’, ‘परागण’, ‘नाज़ुक’ और ‘बगीचा’ शब्दों का उच्चारण करें।'
              ],
              teacherPrompt: 'बच्चों को वन्यजीवों और कीटों का अवलोकन दूर से करने और उन्हें हानि न पहुँचाने की शिक्षा दें।',
              visualScene: {
                kind: 'butterfly-garden',
                elements: [
                  { id: 'butterfly', label: 'रंग-बिरंगी तितली', color: '#f43f5e' },
                  { id: 'rose', label: 'लाल गुलाब', color: '#e11d48' },
                  { id: 'sun', label: 'गुनगुनी धूप', color: '#facc15' }
                ]
              },
              questions: [
                {
                  prompt: 'तितली फूलों पर बैठकर क्या करती है?',
                  options: ['मीठा पराग-रस पीती है', 'सोती है', 'झगड़ा करती है'],
                  answerIndex: 0,
                  explanation: 'तितलियाँ फूलों का मीठा मकरंद पीती हैं और परागण में मदद करती हैं।'
                },
                {
                  prompt: 'माँ ने रिया को तितली पकड़ने से क्यों मना किया?',
                  options: ['क्योंकि तितली के पंख बहुत नाज़ुक होते हैं', 'क्योंकि तितली काटती है', 'क्योंकि माँ को पसंद नहीं था'],
                  answerIndex: 0,
                  explanation: 'तितली के नाज़ुक पंखों को छूने से उन्हें चोट लग सकती है।'
                },
                {
                  prompt: 'तितली का जन्म किस रूप से शुरू होता है?',
                  options: ['अंडे और छोटी इल्ली (कैटरपिलर) से', 'पेड़ के बीज से', 'मिट्टी से'],
                  answerIndex: 0,
                  explanation: 'तितली का जीवन चक्र अंडे, इल्ली, प्यूपा और फिर सुंदर तितली के रूप में होता है।'
                },
                {
                  prompt: 'प्रकृति में सुंदर तितलियों को देखकर हमें क्या करना चाहिए?',
                  options: ['दूर से देखकर उनका आनंद लेना चाहिए', 'डिब्बे में बंद कर देना चाहिए', 'पत्थर मारना चाहिए'],
                  answerIndex: 0,
                  explanation: 'प्रकृति के जीवों को मुक्त रखकर दूर से उनका सौंदर्य देखना चाहिए।'
                }
              ]
            },
            {
              chapterNumber: 6,
              chapterTitle: 'चींटी और कबूतर',
              conceptKey: 'chinti-aur-kabootar',
              title: 'चींटी और कबूतर: परोपकार का बदला परोपकार',
              objective: 'परोपकार, कृतज्ञता, संकट में मदद करना और यह समझना कि छोटा प्राणी भी बड़ा काम कर सकता है।',
              story: 'एक दिन एक नन्ही चींटी नदी किनारे पानी पीते समय तेज़ धार में बह गई। पेड़ पर बैठे एक दयालु कबूतर ने देखा कि चींटी डूब रही है। कबूतर ने तुरंत एक बड़ा पत्ता तोड़कर चींटी के पास पानी में गिरा दिया। चींटी पत्ते पर चढ़ गई और सुरक्षित किनारे पहुँच गई। कुछ दिन बाद उसी जंगल में एक शिकारी कबूतर पर तीर साध रहा था। चींटी ने यह देख लिया। उसने तुरंत जाकर शिकारी के पैर में ज़ोर से काट लिया। शिकारी का निशाना चूक गया और कबूतर फुर्र से उड़कर बच गया। भलाई का फल हमेशा भलाई होता है।',
              activity: 'अपने किसी दोस्त या सहपाठी की छोटी सी मदद करें और देखें कि उन्हें कितनी खुशी मिलती है।',
              guidedSteps: [
                'कबूतर ने डूबती चींटी की जान कैसे बचाई? (पत्ता गिराकर)।',
                'चींटी ने कबूतर की जान कैसे बचाई? (शिकारी के पैर में काटकर)।',
                '‘परोपकार’, ‘कृतज्ञता’, ‘सहायता’ और ‘कबूतर’ शब्दों को स्पष्ट बोलें।'
              ],
              teacherPrompt: 'बच्चों को समझाएँ कि कोई भी प्राणी छोटा या बड़ा नहीं होता, हर कोई किसी न किसी की सहायता कर सकता है।',
              visualScene: {
                kind: 'dove-ant-river',
                elements: [
                  { id: 'dove', label: 'सफ़ेद कबूतर', color: '#e2e8f0' },
                  { id: 'ant', label: 'नन्ही चींटी', color: '#78350f' },
                  { id: 'leaf', label: 'तैरता पत्ता', color: '#16a34a' }
                ]
              },
              questions: [
                {
                  prompt: 'कबूतर ने चींटी को बचाने के लिए पानी में क्या गिराया?',
                  options: ['पेड़ का हरा पत्ता', 'भारी पत्थर', 'काँटा'],
                  answerIndex: 0,
                  explanation: 'कबूतर ने समझदारी से सूखा पत्ता पानी में गिराया जिस पर चींटी चढ़ गई।'
                },
                {
                  prompt: 'चींटी ने शिकारी के साथ क्या किया?',
                  options: ['पैर में काट लिया जिससे उसका निशाना चूक गया', 'डरकर भाग गई', 'हँसने लगी'],
                  answerIndex: 0,
                  explanation: 'चींटी ने शिकारी के पैर में काटा और कबूतर की जान बचा ली।'
                },
                {
                  prompt: 'इस प्रसिद्ध प्रेरक कहानी से हमें क्या सीख मिलती है?',
                  options: ['कर भला तो हो भला (परोपकार का फल अच्छा होता है)', 'किसी की मदद नहीं करनी चाहिए', 'शिकार करना चाहिए'],
                  answerIndex: 0,
                  explanation: 'दूसरों की भलाई करने से समय आने पर हमें भी मदद मिलती है।'
                },
                {
                  prompt: 'चींटियाँ किस प्रकार काम करती हैं?',
                  options: ['एक कतार में मिलकर और अनुशासन से', 'अकेले बिना नियम के', 'लड़कर'],
                  answerIndex: 0,
                  explanation: 'चींटियाँ अनुशासन और एकता का सबसे उत्तम उदाहरण हैं।'
                }
              ]
            },
            {
              chapterNumber: 7,
              chapterTitle: 'हमारे त्योहार',
              conceptKey: 'hamare-tyohar',
              title: 'हमारे पावन त्योहार: अनेकता में एकता की सुगंध',
              objective: 'भारतीय त्योहारों (दिवाली, ईद, क्रिसमस, पोंगल) का ज्ञान, सांस्कृतिक सद्भाव और सौहार्द।',
              story: 'हमारा भारत देश त्योहारों का देश है! यहाँ हर ऋतु में खुशियों के पर्व मनाए जाते हैं। दीपावली पर दीयों की रोशनी से अंधकार दूर होता है और सब मिठाइयाँ बाँटते हैं। ईद पर गले मिलकर "ईद मुबारक" कहा जाता है और मीठी सेवइयाँ खाई जाती हैं। क्रिसमस पर सांता क्लॉस उपहार लाते हैं और गिरजाघरों में प्रार्थना होती है। पोंगल और बैसाखी पर किसान अपनी नई फसल की खुशी मनाते हैं। अमन, कबीर, मैरी और ज़ीनत सब मिलकर हर त्योहार उल्लास से मनाते हैं। त्योहार हमें आपस में जोड़ते हैं और एकता का पाठ पढ़ाते हैं।',
              activity: 'एक कागज़ पर अपने प्रिय त्योहार का सुंदर चित्र बनाएँ और उस त्योहार की दो खास मिठाइयों के नाम लिखें।',
              guidedSteps: [
                'दीपावली, ईद और क्रिसमस पर क्या-क्या विशेष काम किए जाते हैं?',
                'सभी त्योहार हमें क्या संदेश देते हैं? (प्रेम, भाईचारा और सेवा)।',
                '‘सद्भाव’, ‘त्योहार’, ‘दीपावली’ और ‘एकता’ शब्दों का उच्चारण करें।'
              ],
              teacherPrompt: 'कक्षा में सभी त्योहारों के प्रति सम्मान और सांप्रदायिक सौहार्द की भावना पर परिचर्चा कराएँ।',
              visualScene: {
                kind: 'festival-unity',
                elements: [
                  { id: 'diya', label: 'जलता दीया', color: '#f59e0b' },
                  { id: 'crescent', label: 'ईद का चाँद', color: '#fef08a' },
                  { id: 'tree', label: 'क्रिसमस ट्री', color: '#15803d' }
                ]
              },
              questions: [
                {
                  prompt: 'दीपावली का त्योहार किस चीज़ का प्रतीक है?',
                  options: ['अंधकार पर प्रकाश और बुराई पर अच्छाई की विजय', 'शोर मचाने का', 'कचरा फैलाने का'],
                  answerIndex: 0,
                  explanation: 'दीपावली ज्ञान, प्रकाश और अच्छाई के विजय का पावन पर्व है।'
                },
                {
                  prompt: 'ईद के अवसर पर कौन सा स्वादिष्ट व्यंजन विशेष रूप से बनता है?',
                  options: ['मीठी सेवइयाँ और शीर-खुरमा', 'कड़वी चाय', 'समोसा'],
                  answerIndex: 0,
                  explanation: 'ईद पर प्रेम और सौहार्द के साथ मीठी सेवइयाँ बाँटी जाती हैं।'
                },
                {
                  prompt: 'त्योहार मनाने का मुख्य उद्देश्य क्या है?',
                  options: ['आपसी प्रेम, खुशियाँ और भाईचारा बढ़ाना', 'अकेले रहना', 'दिखावा करना'],
                  answerIndex: 0,
                  explanation: 'त्योहार समाज में मेलजोल, करुणा और आनंद का संचार करते हैं।'
                },
                {
                  prompt: 'फसल कटाई के समय दक्षिण भारत में कौन सा त्योहार मनाया जाता है?',
                  options: ['पोंगल', 'होली', 'रक्षाबंधन'],
                  answerIndex: 0,
                  explanation: 'पोंगल प्रकृति और सूर्य देव के प्रति कृतज्ञता व्यक्त करने का फसल उत्सव है।'
                }
              ]
            },
            {
              chapterNumber: 8,
              chapterTitle: 'आसमान का तारा',
              conceptKey: 'aasman-ka-tara',
              title: 'आसमान का चमकता तारा: वैज्ञानिक जिज्ञासा और ब्रह्मांड',
              objective: 'खगोलीय पिंडों (तारे, सूर्य, ग्रह) का प्राथमिक परिचय और वैज्ञानिक सोच का विकास।',
              story: 'रात को छत पर लेटे हुए नन्हें कबीर ने आसमान में एक बहुत चमकीला तारा देखा। वह तारा हीरे की तरह टिमटिमा रहा था। कबीर ने पूछा, "दीदी, यह तारा इतना छोटा क्यों दिखता है?" दीदी ने समझाया, "कबीर, तारे बहुत बड़े आग के गोले होते हैं, हमारे सूरज की तरह! लेकिन वे हमसे लाखों किलोमीटर दूर हैं, इसलिए नन्हे बिंदुओं जैसे दिखाई देते हैं। हमारा सूर्य भी एक तारा ही है, जो हमारे सबसे पास है और हमें धूप व जीवन देता है।" कबीर ने तारों को निहारा और मन ही मन सोचा कि बड़ा होकर वह भी अंतरिक्ष की यात्रा करेगा। जिज्ञासा ही ज्ञान का पहला क़दम है।',
              activity: 'रात में आकाश की ओर देखें और गिनने की कोशिश करें कि आपको कितने तारे स्पष्ट दिखाई दे रहे हैं। ध्रुव तारे की दिशा खोजें।',
              guidedSteps: [
                'हमारा सूरज वास्तव में क्या है? (एक बड़ा तारा)।',
                'तारे छोटे क्यों दिखाई देते हैं? (क्योंकि वे पृथ्वी से बहुत दूर हैं)।',
                '‘ब्रह्मांड’, ‘नक्षत्र’, ‘अंतरिक्ष’ और ‘जिज्ञासा’ शब्दों का उच्चारण करें।'
              ],
              teacherPrompt: 'बच्चों में खगोल विज्ञान और अंतरिक्ष अन्वेषण के प्रति प्रारंभिक रुचि और जिज्ञासा जगाएँ।',
              visualScene: {
                kind: 'twinkling-stars',
                elements: [
                  { id: 'bright-star', label: 'चमकता तारा', color: '#fde047' },
                  { id: 'telescope', label: 'दूरबीन', color: '#38bdf8' },
                  { id: 'cosmos', label: 'गहरा नीला आकाश', color: '#0f172a' }
                ]
              },
              questions: [
                {
                  prompt: 'तारे आकाश में छोटे क्यों दिखाई देते हैं?',
                  options: ['क्योंकि वे पृथ्वी से बहुत-बहुत दूर हैं', 'क्योंकि वे सचमुच कंकड़ जितने हैं', 'क्योंकि वे दिन में सो जाते हैं'],
                  answerIndex: 0,
                  explanation: 'अत्यधिक दूरी के कारण विशालकाय तारे भी नन्हें चमकदार बिंदुओं जैसे दिखते हैं।'
                },
                {
                  prompt: 'हमारा सूर्य वास्तव में क्या है?',
                  options: ['पृथ्वी के सबसे नज़दीक का तारा', 'एक ठंडी चट्टान', 'काँच का गोला'],
                  answerIndex: 0,
                  explanation: 'सूर्य हमारा सबसे निकटतम तारा है जो हमें ऊर्जा और जीवन देता है।'
                },
                {
                  prompt: 'आसमान के तारों और ग्रहों को बड़ा देखने के लिए किस यंत्र का उपयोग होता है?',
                  options: ['दूरबीन (टेलीस्कोप)', 'घड़ी', 'कैमरा'],
                  answerIndex: 0,
                  explanation: 'दूरबीन की सहायता से दूरस्थ खगोलीय पिंडों को स्पष्ट देखा जाता है।'
                },
                {
                  prompt: 'वैज्ञानिक बनने के लिए सबसे ज़रूरी गुण क्या है?',
                  options: ['हर बात पर सवाल पूछना और सीखना (जिज्ञासा)', 'रट लेना', 'चुप रहना'],
                  answerIndex: 0,
                  explanation: 'नयी बातें जानने की उत्सुकता और जिज्ञासा ही विज्ञान की जननी है।'
                }
              ]
            }
          ]
        },
        {
          name: 'Environmental Studies',
          book: 'The World Around Us (Class 2 EVS)',
          source: 'https://ncert.nic.in/textbook.php?beev1=0-7',
          status: 'source_chapters_verified',
          chapters: [
            'My Amazing Body & Senses',
            'My Family and Neighbours',
            'Plants: From Tiny Seed to Sturdy Tree',
            'Animal Friends & Their Habitats',
            'Water in Our Everyday World',
            'Air, Weather and Seasons',
            'Safe Habits & Neighbourhood Walks'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'My Amazing Body & Senses',
              conceptKey: 'five-senses',
              title: 'The Five Super Senses: How We Explore Our World',
              objective: 'Identify the five sense organs and how they help us see, hear, smell, taste, and feel.',
              story: 'We explore everything around us using five wonderful helpers called sense organs! Our two Eyes see bright colours, the blue sky, and read storybooks. Our Ears hear chirping birds, musical tunes, and vehicle horns. Our Nose smells fragrant jasmine flowers and fresh food cooking in the kitchen. Our Tongue tastes sweet mangoes, salty snacks, and tangy lemons. Our Skin feels soft cotton, warm sunlight, or cool rain splashes. Together, our senses keep us safe, curious, and connected to the world around us!',
              activity: 'Close your eyes. Have an adult hold three safe kitchen items (like an orange peel, cinnamon stick, or mint leaf) near your nose. Guess each one by smell alone!',
              guidedSteps: [
                'Touch your ears: what sound can you hear right now?',
                'Name something sweet and something salty.',
                'Explain how our skin helps us know if bath water is too hot.'
              ],
              teacherPrompt: 'Discuss safety: never put sharp pencils or small objects inside ears or nose.',
              visualScene: {
                kind: 'senses-body',
                elements: [
                  { id: 'eyes', label: 'Eyes: Sight', color: '#3b82f6' },
                  { id: 'ears', label: 'Ears: Sound', color: '#10b981' },
                  { id: 'nose', label: 'Nose: Smell', color: '#f59e0b' },
                  { id: 'tongue', label: 'Tongue: Taste', color: '#ec4899' },
                  { id: 'skin', label: 'Skin: Touch & Feel', color: '#8b5cf6' }
                ]
              },
              questions: [
                {
                  prompt: 'Which sense organ tells us that a song is playing on the radio?',
                  options: ['Our Ears', 'Our Nose', 'Our Tongue'],
                  answerIndex: 0,
                  explanation: 'Our ears receive sound vibrations and help us listen.'
                },
                {
                  prompt: 'Which sense organ tells us whether a lemon is sour?',
                  options: ['Our Tongue', 'Our Eyes', 'Our Hair'],
                  answerIndex: 0,
                  explanation: 'Taste buds on our tongue identify sweet, salty, sour, and bitter tastes.'
                },
                {
                  prompt: 'Why should we never insert sharp objects into our ears?',
                  options: ['It can hurt our delicate ear drum', 'It makes the pencil blunt', 'It creates funny sounds'],
                  answerIndex: 0,
                  explanation: 'Our ear drums are delicate; keep sharp things away from ears.'
                },
                {
                  prompt: 'How many sense organs do we have?',
                  options: ['Five', 'Two', 'Ten'],
                  answerIndex: 0,
                  explanation: 'We have 5 sense organs: eyes, ears, nose, tongue, and skin.'
                }
              ]
            },
            {
              chapterNumber: 3,
              chapterTitle: 'Plants: From Tiny Seed to Sturdy Tree',
              conceptKey: 'plant-parts-growth',
              title: 'Seed to Sprout: The Life of a Green Plant',
              objective: 'Describe what seeds need to germinate and name the main parts of a plant.',
              story: 'Under the cool brown soil lies a sleepy little bean seed. To wake up, it needs three friends: moist water, warm sunlight, and fresh air! First, a tiny root reaches down into the earth to drink water and hold the plant firmly. Then, a tender green shoot pushes up toward the sunshine. Green leaves unfold like open hands to capture light and make food. Slowly, stems grow strong, buds bloom into flowers, and flowers form sweet fruits holding new seeds inside. Plants give us fresh oxygen, shade, and food.',
              activity: 'Soak three green gram (moong) seeds in a damp cotton ball inside a small bowl. Observe every day for three days as tiny white roots emerge!',
              guidedSteps: [
                'Name the three things a seed needs to grow: Water, Air, Sunlight.',
                'Point out the roots, stem, leaf, and flower on a potted home plant.',
                'Water a home plant gently with a small cup.'
              ],
              teacherPrompt: 'Help children understand that plants are living beings that need daily care and clean water.',
              visualScene: {
                kind: 'plant-growth',
                elements: [
                  { id: 'roots', label: 'Roots under soil', color: '#78350f' },
                  { id: 'stem', label: 'Stem standing tall', color: '#15803d' },
                  { id: 'leaves', label: 'Green Leaves making food', color: '#22c55e' },
                  { id: 'sun', label: 'Golden Sunlight', color: '#eab308' }
                ]
              },
              questions: [
                {
                  prompt: 'What three things does a seed need to sprout into a healthy plant?',
                  options: ['Water, air, and sunlight', 'Juice, milk, and dark closets', 'Cold ice, sugar, and salt'],
                  answerIndex: 0,
                  explanation: 'Seeds require moisture (water), oxygen (air), and warm sunlight to germinate.'
                },
                {
                  prompt: 'Which part of the plant stays hidden under the soil to drink water?',
                  options: ['The Roots', 'The Flowers', 'The Fruits'],
                  answerIndex: 0,
                  explanation: 'Roots spread underground to anchor the plant and absorb moisture.'
                },
                {
                  prompt: 'What gas do green leaves release that helps all humans and animals breathe?',
                  options: ['Oxygen', 'Smoke', 'Dust'],
                  answerIndex: 0,
                  explanation: 'Plants release clean oxygen into the air during daylight.'
                },
                {
                  prompt: 'Where do new seeds usually grow inside a plant?',
                  options: ['Inside the fruits', 'On top of the stones', 'Under the water tap'],
                  answerIndex: 0,
                  explanation: 'Fruits protect seeds so new plants can grow.'
                }
              ]
            }
          ]
        },
        {
          name: 'Kannada',
          book: 'Savirudi / Nali Kali (Class 2)',
          source: 'https://textbooks.karnataka.gov.in/',
          status: 'source_chapters_verified',
          chapters: [
            'ನಮ್ಮ ಊರು',
            'ಗಿಳಿ ಮತ್ತು ಕಾಗೆ',
            'ಬಣ್ಣ ಬಣ್ಣದ ಹೂವುಗಳು',
            'ಆಟ ಮತ್ತು ಪಾಠ',
            'ಗುಬ್ಬಚ್ಚಿಯ ಗೂಡು',
            'ಸ್ನೇಹದ ಮಾತು'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'ನಮ್ಮ ಊರು',
              conceptKey: 'kannada-village-community-cbse',
              title: 'ನಮ್ಮ ಸುಂದರ ಊರು: ಪರಿಸರ ಮತ್ತು ಜನಜೀವನ',
              objective: 'ನಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಪರಿಸರ, ಊರಿನ ಪ್ರಮುಖ ಸ್ಥಳಗಳು ಮತ್ತು ಕನ್ನಡ ಪದಗಳ ಪರಿಚಯ.',
              story: 'ನಮ್ಮ ಊರು ಸುಂದರವಾಗಿದೆ. ಊರಿನ ನಡುವೆ ದೊಡ್ಡ ಅರಳಿ ಮರವಿದೆ. ಮರದ ನೆರಳಿನಲ್ಲಿ ಹಿರಿಯರು ಕುಳಿತು ಮಾತನಾಡುತ್ತಾರೆ. ಊರಿನಲ್ಲಿ ಒಂದು ಸುಂದರವಾದ ಕೆರೆ ಇದೆ. ಕೆರೆಯಲ್ಲಿ ಬಿಳಿ ಬಣ್ಣದ ಬಾತುಕೋಳಿಗಳು ಈಜುತ್ತವೆ. ಊರಿನ ಶಾಲೆಗೆ ಮಕ್ಕಳು ಸಂತೋಷದಿಂದ ಹೋಗುತ್ತಾರೆ. ಅಂಚೆ ಕಚೇರಿ, ಆಸ್ಪತ್ರೆ ಮತ್ತು ಸಂತೆ ನಮ್ಮ ಊರಿನ ಮುಖ್ಯ ಸ್ಥಳಗಳು. ನಾವೆಲ್ಲರೂ ಒಟ್ಟಾಗಿ ನಮ್ಮ ಊರನ್ನು ಸ್ವಚ್ಛವಾಗಿ ಮತ್ತು ಸುಂದರವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳಬೇಕು. ಹಸಿರು ಗಿಡಗಳನ್ನು ನೆಡುವುದು ನಮ್ಮೆಲ್ಲರ ಕರ್ತವ್ಯ.',
              activity: 'ನಿಮ್ಮ ಮನೆಯ ಹತ್ತಿರವಿರುವ ಮೂರು ಸ್ಥಳಗಳ ಹೆಸರುಗಳನ್ನು (ಉದಾ: ಶಾಲೆ, ಅಂಗಡಿ, ಉದ್ಯಾನವನ) ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ ಅಥವಾ ಪೋಷಕರಿಗೆ ಹೇಳಿ.',
              guidedSteps: [
                'ಊರಿನ ಕೆರೆಯಲ್ಲಿ ಯಾವ ಪಕ್ಷಿಗಳು ಈಜುತ್ತಿದ್ದವು?',
                'ಅರಳಿ ಮರ, ಕೆರೆ, ಶಾಲೆ—ಈ ಪದಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಉಚ್ಚರಿಸಿ.',
                'ನಿಮ್ಮ ಊರು ಅಥವಾ ಬಡಾವಣೆಯ ಹೆಸರನ್ನು ಹೇಳಿ.'
              ],
              teacherPrompt: 'ಮಕ್ಕಳಿಗೆ ತಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಪರಿಸರವನ್ನು ಗೌರವಿಸಲು ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ವಾಕ್ಯಗಳನ್ನು ರಚಿಸಲು ಪ್ರೋತ್ಸಾಹಿಸಿ.',
              visualScene: {
                kind: 'kannada-village',
                elements: [
                  { id: 'tree', label: 'ದೊಡ್ಡ ಅರಳಿ ಮರ', color: '#15803d' },
                  { id: 'lake', label: 'ಶಾಂತವಾದ ಕೆರೆ', color: '#0284c7' },
                  { id: 'school', label: 'ನಮ್ಮ ಶಾಲೆ', color: '#f59e0b' }
                ]
              },
              questions: [
                {
                  prompt: 'ಊರಿನ ನಡುವೆ ಯಾವ ದೊಡ್ಡ ಮರವಿತ್ತು?',
                  options: ['ಅರಳಿ ಮರ', 'ತೆಂಗಿನ ಮರ', 'ಬಾಳೆ ಗಿಡ'],
                  answerIndex: 0,
                  explanation: 'ಊರಿನ ನಡುವೆ ನೆರಳು ನೀಡುವ ದೊಡ್ಡ ಅರಳಿ ಮರವಿತ್ತು.'
                },
                {
                  prompt: 'ಕೆರೆಯಲ್ಲಿ ಯಾವ ಪಕ್ಷಿಗಳು ಈಜುತ್ತಿದ್ದವು?',
                  options: ['ಬಿಳಿ ಬಾತುಕೋಳಿಗಳು', 'ಗಿಳಿಗಳು', 'ಕೋಗಿಲೆಗಳು'],
                  answerIndex: 0,
                  explanation: 'ಕೆರೆಯಲ್ಲಿ ಬಿಳಿ ಬಾತುಕೋಳಿಗಳು ಸಂತೋಷದಿಂದ ಈಜುತ್ತಿದ್ದವು.'
                },
                {
                  prompt: 'ನಮ್ಮ ಊರನ್ನು ನಾವು ಹೇಗೆ ಇಟ್ಟುಕೊಳ್ಳಬೇಕು?',
                  options: ['ಸ್ವಚ್ಛವಾಗಿ ಮತ್ತು ಹಸಿರಾಗಿ', 'ಕಸದಿಂದ ತುಂಬಿ', 'ಗದ್ದಲದಿಂದ'],
                  answerIndex: 0,
                  explanation: 'ನಾವೆಲ್ಲರೂ ನಮ್ಮ ಪರಿಸರವನ್ನು ಸದಾ ಸ್ವಚ್ಛವಾಗಿಡಬೇಕು.'
                },
                {
                  prompt: 'ಮಕ್ಕಳು ಸಂತೋಷದಿಂದ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಾರೆ?',
                  options: ['ಶಾಲೆಗೆ', 'ಕಾಡಿಗೆ', 'ನಿದ್ದೆಗೆ'],
                  answerIndex: 0,
                  explanation: 'ಮಕ್ಕಳು ವಿದ್ಯೆ ಕಲಿಯಲು ಶಾಲೆಗೆ ಹೋಗುತ್ತಾರೆ.'
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
          name: 'Kannada',
          book: 'Savirudi / Nali Kali (Class 2)',
          source: 'https://textbooks.karnataka.gov.in/',
          status: 'source_chapters_verified',
          chapters: [
            'ನಮ್ಮ ಊರು',
            'ಗಿಳಿ ಮತ್ತು ಕಾಗೆ',
            'ಬಣ್ಣ ಬಣ್ಣದ ಹೂವುಗಳು',
            'ಆಟ ಮತ್ತು ಪಾಠ',
            'ಗುಬ್ಬಚ್ಚಿಯ ಗೂಡು',
            'ಸ್ನೇಹದ ಮಾತು'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'ನಮ್ಮ ಊರು',
              conceptKey: 'kannada-village-community',
              title: 'ನಮ್ಮ ಸುಂದರ ಊರು: ಪರಿಸರ ಮತ್ತು ಜನಜೀವನ',
              objective: 'ನಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಪರಿಸರ, ಊರಿನ ಪ್ರಮುಖ ಸ್ಥಳಗಳು ಮತ್ತು ಕನ್ನಡ ಪದಗಳ ಪರಿಚಯ.',
              story: 'ನಮ್ಮ ಊರು ಸುಂದರವಾಗಿದೆ. ಊರಿನ ನಡುವೆ ದೊಡ್ಡ ಅರಳಿ ಮರವಿದೆ. ಮರದ ನೆರಳಿನಲ್ಲಿ ಹಿರಿಯರು ಕುಳಿತು ಮಾತನಾಡುತ್ತಾರೆ. ಊರಿನಲ್ಲಿ ಒಂದು ಸುಂದರವಾದ ಕೆರೆ ಇದೆ. ಕೆರೆಯಲ್ಲಿ ಬಿಳಿ ಬಣ್ಣದ ಬಾತುಕೋಳಿಗಳು ಈಜುತ್ತವೆ. ಊರಿನ ಶಾಲೆಗೆ ಮಕ್ಕಳು ಸಂತೋಷದಿಂದ ಹೋಗುತ್ತಾರೆ. ಅಂಚೆ ಕಚೇರಿ, ಆಸ್ಪತ್ರೆ ಮತ್ತು ಸಂತೆ ನಮ್ಮ ಊರಿನ ಮುಖ್ಯ ಸ್ಥಳಗಳು. ನಾವೆಲ್ಲರೂ ಒಟ್ಟಾಗಿ ನಮ್ಮ ಊರನ್ನು ಸ್ವಚ್ಛವಾಗಿ ಮತ್ತು ಸುಂದರವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳಬೇಕು. ಹಸಿರು ಗಿಡಗಳನ್ನು ನೆಡುವುದು ನಮ್ಮೆಲ್ಲರ ಕರ್ತವ್ಯ.',
              activity: 'ನಿಮ್ಮ ಮನೆಯ ಹತ್ತಿರವಿರುವ ಮೂರು ಸ್ಥಳಗಳ ಹೆಸರುಗಳನ್ನು (ಉದಾ: ಶಾಲೆ, ಅಂಗಡಿ, ಉದ್ಯಾನವನ) ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ ಅಥವಾ ಪೋಷಕರಿಗೆ ಹೇಳಿ.',
              guidedSteps: [
                'ಊರಿನ ಕೆರೆಯಲ್ಲಿ ಯಾವ ಪಕ್ಷಿಗಳು ಈಜುತ್ತಿದ್ದವು?',
                'ಅರಳಿ ಮರ, ಕೆರೆ, ಶಾಲೆ—ಈ ಪದಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಉಚ್ಚರಿಸಿ.',
                'ನಿಮ್ಮ ಊರು ಅಥವಾ ಬಡಾವಣೆಯ ಹೆಸರನ್ನು ಹೇಳಿ.'
              ],
              teacherPrompt: 'ಮಕ್ಕಳಿಗೆ ತಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಪರಿಸರವನ್ನು ಗೌರವಿಸಲು ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ವಾಕ್ಯಗಳನ್ನು ರಚಿಸಲು ಪ್ರೋತ್ಸಾಹಿಸಿ.',
              visualScene: {
                kind: 'kannada-village',
                elements: [
                  { id: 'tree', label: 'ದೊಡ್ಡ ಅರಳಿ ಮರ', color: '#15803d' },
                  { id: 'lake', label: 'ಶಾಂತವಾದ ಕೆರೆ', color: '#0284c7' },
                  { id: 'school', label: 'ನಮ್ಮ ಶಾಲೆ', color: '#f59e0b' }
                ]
              },
              questions: [
                {
                  prompt: 'ಊರಿನ ನಡುವೆ ಯಾವ ದೊಡ್ಡ ಮರವಿತ್ತು?',
                  options: ['ಅರಳಿ ಮರ', 'ತೆಂಗಿನ ಮರ', 'ಬಾಳೆ ಗಿಡ'],
                  answerIndex: 0,
                  explanation: 'ಊರಿನ ನಡುವೆ ನೆರಳು ನೀಡುವ ದೊಡ್ಡ ಅರಳಿ ಮರವಿತ್ತು.'
                },
                {
                  prompt: 'ಕೆರೆಯಲ್ಲಿ ಯಾವ ಪಕ್ಷಿಗಳು ಈಜುತ್ತಿದ್ದವು?',
                  options: ['ಬಿಳಿ ಬಾತುಕೋಳಿಗಳು', 'ಗಿಳಿಗಳು', 'ಕೋಗಿಲೆಗಳು'],
                  answerIndex: 0,
                  explanation: 'ಕೆರೆಯಲ್ಲಿ ಬಿಳಿ ಬಾತುಕೋಳಿಗಳು ಸಂತೋಷದಿಂದ ಈಜುತ್ತಿದ್ದವು.'
                },
                {
                  prompt: 'ನಮ್ಮ ಊರನ್ನು ನಾವು ಹೇಗೆ ಇಟ್ಟುಕೊಳ್ಳಬೇಕು?',
                  options: ['ಸ್ವಚ್ಛವಾಗಿ ಮತ್ತು ಹಸಿರಾಗಿ', 'ಕಸದಿಂದ ತುಂಬಿ', 'ಗದ್ದಲದಿಂದ'],
                  answerIndex: 0,
                  explanation: 'ನಾವೆಲ್ಲರೂ ನಮ್ಮ ಪರಿಸರವನ್ನು ಸದಾ ಸ್ವಚ್ಛವಾಗಿಡಬೇಕು.'
                },
                {
                  prompt: 'ಮಕ್ಕಳು ಸಂತೋಷದಿಂದ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಾರೆ?',
                  options: ['ಶಾಲೆಗೆ', 'ಕಾಡಿಗೆ', 'ನಿದ್ದೆಗೆ'],
                  answerIndex: 0,
                  explanation: 'ಮಕ್ಕಳು ವಿದ್ಯೆ ಕಲಿಯಲು ಶಾಲೆಗೆ ಹೋಗುತ್ತಾರೆ.'
                }
              ]
            }
          ]
        },
        {
          name: 'English',
          book: 'Karnataka State English Reader (Class 2)',
          source: 'https://textbooks.karnataka.gov.in/',
          status: 'source_chapters_verified',
          chapters: [
            'My Family & Pet',
            'Bengaluru Gardens',
            'Action Rhymes',
            'Helping Hands'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'My Family & Pet',
              conceptKey: 'family-pet-karnataka',
              title: 'Meet Appu the Pup & My Loving Family',
              objective: 'Build conversational English sentences about family members and caring for animal pets.',
              story: 'In our home in Bengaluru, we have a small brown puppy named Appu. Appu has floppy ears and a wagging tail. Every morning, father fills Appu\'s water bowl with clean water. Sister Priya brushes Appu\'s soft fur gently. When grandfather sits in the garden chair, Appu sits faithfully near his feet. We love our pets because they are part of our family. Treating animals with kindness makes our hearts gentle and happy.',
              activity: 'Tell your family three kind actions we can do for animals around us (like leaving water in summer).',
              guidedSteps: [
                'Say aloud: "My puppy has floppy ears and a kind heart."',
                'Name three family members in English: Father, Mother, Grandfather.',
                'Act out walking gently with a playful pup.'
              ],
              teacherPrompt: 'Foster empathy for domestic pets and stray animals in local neighbourhoods.',
              visualScene: {
                kind: 'pet-family',
                elements: [
                  { id: 'appu', label: 'Appu the Friendly Pup', color: '#b45309' },
                  { id: 'water', label: 'Clean Water Bowl', color: '#38bdf8' },
                  { id: 'chair', label: 'Grandpa in Garden Chair', color: '#16a34a' }
                ]
              },
              questions: [
                {
                  prompt: 'What is the name of the puppy in the story?',
                  options: ['Appu', 'Sheru', 'Tommy'],
                  answerIndex: 0,
                  explanation: 'The little puppy is named Appu.'
                },
                {
                  prompt: 'Who filled Appu\'s bowl with clean water every morning?',
                  options: ['Father', 'A stranger', 'Nobody'],
                  answerIndex: 0,
                  explanation: 'Father takes care to give Appu fresh water every morning.'
                },
                {
                  prompt: 'How should we treat animal pets at home?',
                  options: ['With love, clean food, and gentle care', 'By pulling their tail', 'By ignoring them'],
                  answerIndex: 0,
                  explanation: 'Kindness and proper food keep our pets healthy and safe.'
                },
                {
                  prompt: 'Which word describes Appu\'s ears in the story?',
                  options: ['Floppy', 'Spiky', 'Square'],
                  answerIndex: 0,
                  explanation: 'The story mentions Appu has soft, floppy ears.'
                }
              ]
            }
          ]
        },
        {
          name: 'Mathematics',
          book: 'Karnataka State Mathematics (Class 2)',
          source: 'https://textbooks.karnataka.gov.in/',
          status: 'source_chapters_verified',
          chapters: [
            'Numbers up to 100',
            'Shapes and Spatial Play',
            'Addition & Subtraction',
            'Measurement and Money'
          ],
          lessons: [
            {
              chapterNumber: 1,
              chapterTitle: 'Numbers up to 100',
              conceptKey: 'tens-ones-karnataka',
              title: 'Count with Coconuts: Tens and Units up to 100',
              objective: 'Represent two-digit numbers using bundles of 10 and single units up to 100.',
              story: 'At the village coconut grove in Mandya, farmer Somanna is tying tender coconuts into stacks. He ties exactly 10 coconuts into one neat cluster. If Somanna has 4 clusters, that is 40 coconuts. Beside the clusters, 7 loose coconuts sit on the grass. 4 Tens and 7 Ones makes 47! Somanna\'s daughter Deepa helps write the number on the jute bag: "47 Coconuts". Grouping into tens makes large market counts simple and clear.',
              activity: 'Collect 32 small dried leaves or pebbles. Make three groups of 10 and see how many are left as single ones.',
              guidedSteps: [
                'Group 10 objects: say "1 Ten".',
                'Count 4 tens: 10, 20, 30, 40.',
                'Add 7 units: 40 + 7 = 47.'
              ],
              teacherPrompt: 'Connect abstract place-value notation with tangible agricultural and market examples.',
              visualScene: {
                kind: 'coconuts-tens',
                elements: [
                  { id: 'c1', label: '10 Coconuts', color: '#15803d' },
                  { id: 'c2', label: '10 Coconuts', color: '#15803d' },
                  { id: 'c3', label: '10 Coconuts', color: '#15803d' },
                  { id: 'c4', label: '10 Coconuts', color: '#15803d' },
                  { id: 'ones', label: '7 Loose Coconuts', color: '#84cc16' }
                ]
              },
              questions: [
                {
                  prompt: 'How many coconuts are in 4 bundles of 10?',
                  options: ['40', '14', '4'],
                  answerIndex: 0,
                  explanation: '4 groups of 10 equals 40.'
                },
                {
                  prompt: 'What number has 5 Tens and 3 Ones?',
                  options: ['53', '35', '8'],
                  answerIndex: 0,
                  explanation: '5 tens (50) + 3 ones (3) = 53.'
                },
                {
                  prompt: 'What comes right before the number 50?',
                  options: ['49', '51', '40'],
                  answerIndex: 0,
                  explanation: 'Counting back one from 50 gives 49.'
                },
                {
                  prompt: 'How many tens are needed to make 100?',
                  options: ['10 Tens', '5 Tens', '2 Tens'],
                  answerIndex: 0,
                  explanation: '10 bundles of 10 make one hundred (100).'
                }
              ]
            }
          ]
        },
        {
          name: 'Environmental Studies',
          book: 'Karnataka State EVS (Class 2)',
          source: 'https://textbooks.karnataka.gov.in/',
          status: 'source_chapters_verified',
          chapters: [
            'Our Senses & Health',
            'Water in Our Homes',
            'Plants and Trees in Karnataka',
            'Festivals and Joy'
          ],
          lessons: [
            {
              chapterNumber: 2,
              chapterTitle: 'Water in Our Homes',
              conceptKey: 'water-conservation-karnataka',
              title: 'Every Drop Counts: Clean Water & Daily Care',
              objective: 'Identify clean water sources, everyday household uses, and simple conservation habits.',
              story: 'Water is our greatest gift of nature. In our kitchen, mother uses clean water to wash vegetables, cook rice, and fill the steel drinking pot. We brush our teeth, take baths, and water our garden plants using water. But clean water does not come from magic; it comes from rain, lakes, and rivers. When brushing our teeth, we must always close the tap instead of letting clean water run away into the drain. Every drop saved is a drop for tomorrow!',
              activity: 'Walk around your house with an adult. Check if any tap is dripping slowly. Count how many drops fall in one minute!',
              guidedSteps: [
                'List three daily activities where we use clean water.',
                'Show how you turn off the tap completely after washing hands.',
                'Explain why animals and birds need clean water too.'
              ],
              teacherPrompt: 'Instill conscious water conservation habits early in child development.',
              visualScene: {
                kind: 'water-pot',
                elements: [
                  { id: 'tap', label: 'Closed Tap (No Waste)', color: '#0284c7' },
                  { id: 'pot', label: 'Steel Drinking Water Pot', color: '#94a3b8' },
                  { id: 'plant', label: 'Plant receiving water', color: '#16a34a' }
                ]
              },
              questions: [
                {
                  prompt: 'What should we do with the tap while brushing our teeth?',
                  options: ['Keep it turned off until needed', 'Leave it running fully', 'Break the tap'],
                  answerIndex: 0,
                  explanation: 'Keeping the tap closed while brushing saves buckets of clean water.'
                },
                {
                  prompt: 'Where does natural fresh water come from?',
                  options: ['Rain, rivers, and lakes', 'Plastic bags', 'Television screens'],
                  answerIndex: 0,
                  explanation: 'Rain fills our lakes, ground wells, and rivers.'
                },
                {
                  prompt: 'Why should drinking water always be covered in a clean vessel?',
                  options: ['To keep dust and germs away', 'To hide the water', 'To make it heavy'],
                  answerIndex: 0,
                  explanation: 'Covered water stays clean and safe for drinking.'
                },
                {
                  prompt: 'Who needs water to live?',
                  options: ['All humans, animals, and green plants', 'Only big trucks', 'Only stones'],
                  answerIndex: 0,
                  explanation: 'Every living being requires clean water to survive.'
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  enrichment: [
    {
      name: 'AI & Digital Thinking',
      kind: 'Vayentra Original Enrichment',
      notes: 'Class 2 foundational digital thinking. Strictly screen-safe, no generative AI chatbots, no child personal-data collection.',
      modules: [
        {
          slug: 'pattern-detectives-2',
          title: 'Pattern Detectives 2.0: Shapes & Sounds',
          objective: 'Recognise repeating audio and visual rules and predict the missing step in complex sequences.',
          story: 'Kiran is playing a drum rhythm with his hands: Clap, Tap-Tap, Clap, Tap-Tap! His sister Sneha listens with her eyes closed. Right away, she says: "The next beat is Clap!" Sneha is a rhythm detective. Just like music has patterns, drawings and numbers also follow rules: Circle, Square, Triangle, Circle, Square... What comes next? A computer uses patterns to recognise pictures of handwritten numbers or songs, but human thinkers are the ones who design the rules. Spotting patterns helps us solve puzzles with confidence.',
          activity: 'Clap a 3-part rhythm for an adult at home and ask them to repeat the next two beats without guessing.',
          questions: [
            {
              prompt: 'Square, Triangle, Circle, Square, Triangle, ... What comes next?',
              options: ['Circle', 'Star', 'Square'],
              answerIndex: 0,
              explanation: 'The pattern repeats the three shapes: Square, Triangle, Circle.'
            },
            {
              prompt: 'What does a computer look for when searching through a big collection of pictures?',
              options: ['Patterns and features like edges and colours', 'Loud noises', 'Magic spells'],
              answerIndex: 0,
              explanation: 'Computers examine patterns such as colours, lines, and shapes.'
            },
            {
              prompt: 'If a pattern breaks, what should a careful thinker do?',
              options: ['Look back and find where the rule changed', 'Close the book in frustration', 'Ignore it'],
              answerIndex: 0,
              explanation: 'Checking back step-by-step helps us find and fix mistakes.'
            },
            {
              prompt: 'Which number continues the pattern: 2, 4, 6, 8, ...?',
              options: ['10', '9', '7'],
              answerIndex: 0,
              explanation: 'Each number adds 2 (skip-counting by 2): 8 + 2 = 10.'
            }
          ]
        },
        {
          slug: 'multi-rule-sorting',
          title: 'Sorting by Two Rules: Colour AND Shape',
          objective: 'Classify items using two simultaneous attributes (e.g., Red AND Round).',
          story: 'Teacher Ananya places a basket of coloured cardboard shapes on the low table. "Today," she says, "we will not sort by colour alone. We have a double rule! Place all shapes that are BOTH Red AND Round into the hoop!" Rohan picks up a red square: it is red, but not round, so it stays out. Diya picks up a blue circle: it is round, but not red, so it stays out. Finally, Aarav picks up a red circle: it fits BOTH rules! In computer science, we call this the "AND" rule. Both conditions must be true together.',
          activity: 'Pick out toys from your toy box that are BOTH soft AND small. Notice which toys fit only one rule.',
          questions: [
            {
              prompt: 'If the rule is "Blue AND Square", which item belongs in the box?',
              options: ['A blue square block', 'A blue round marble', 'A yellow square card'],
              answerIndex: 0,
              explanation: 'Only an item that satisfies BOTH conditions (blue colour AND square shape) qualifies.'
            },
            {
              prompt: 'Does a red circle fit the rule "Red AND Square"?',
              options: ['No, because it is circular, not square', 'Yes, perfectly', 'Only in the rain'],
              answerIndex: 0,
              explanation: 'Even though it is red, it fails the square requirement.'
            },
            {
              prompt: 'Why are clear rules important when sorting information?',
              options: ['So everyone groups the items the exact same reliable way', 'To make it confusing', 'To hide the objects'],
              answerIndex: 0,
              explanation: 'Clear rules ensure fairness, accuracy, and predictability.'
            },
            {
              prompt: 'What is the "AND" rule in logic?',
              options: ['Both conditions must be satisfied', 'Only one condition matters', 'Neither condition is checked'],
              answerIndex: 0,
              explanation: 'An "AND" condition requires every rule to be fulfilled.'
            }
          ]
        },
        {
          slug: 'robot-step-directions',
          title: 'Directing the Toy Robot: Precise Steps',
          objective: 'Write and sequence clear, unambiguous instructions to reach a target.',
          story: 'Meera has a toy robotic mouse. She wants the mouse to reach the toy cheese across the chequered play mat. Meera tells her friend: "Just go over there!" But the toy mouse cannot understand vague words! Meera must write exact steps: 1. Move forward 2 squares. 2. Turn right 90 degrees. 3. Move forward 1 square. Click! The little mouse follows each step in order and stops right at the cheese! When we write exact steps in the correct order, that is called an algorithm.',
          activity: 'Pretend an adult is a robot. Give them exact step commands (e.g. "Take 2 steps forward, turn left") to walk from the bedroom door to the desk.',
          questions: [
            {
              prompt: 'What is a list of step-by-step instructions called in computing?',
              options: ['An Algorithm', 'A Mystery', 'A Random guess'],
              answerIndex: 0,
              explanation: 'An algorithm is a clear, ordered set of steps to solve a specific problem.'
            },
            {
              prompt: 'If a robot misses the target because step 2 was wrong, what should we do?',
              options: ['Debug and fix step 2', 'Throw the robot away', 'Cry loudly'],
              answerIndex: 0,
              explanation: 'Finding and fixing an error in instructions is called debugging.'
            },
            {
              prompt: 'Why must instructions for machines be very clear and precise?',
              options: ['Machines only follow exact steps without guessing our thoughts', 'Machines can read minds', 'Machines don\'t need steps'],
              answerIndex: 0,
              explanation: 'Computers do exactly what the code tells them, step by step.'
            },
            {
              prompt: 'What happens if we swap the order of putting on socks and shoes?',
              options: ['The sequence fails because shoes cannot go under socks', 'It works the same', 'Nothing happens'],
              answerIndex: 0,
              explanation: 'Order matters! Socks must go on before shoes.'
            }
          ]
        },
        {
          slug: 'smart-machines-sensors',
          title: 'Sensors Around Us: How Doors Open Automatically',
          objective: 'Understand how simple sensors detect light, motion, and sound.',
          story: 'When Vikram walks into the metro station with his mother, the glass door slides open automatically before they even touch it! Vikram asks: "Amma, did the door know we were coming?" Mother smiles and points to a small dark oval above the door frame: "That is a motion sensor! It sends an invisible beam of light. When you walk into the beam, the sensor detects movement and signals the electric motor to open the door." Sensors are like a machine\'s eyes and ears.',
          activity: 'Count how many sensors or smart switches you can spot at a train station, grocery store, or in home appliances.',
          questions: [
            {
              prompt: 'What device helps an automatic door notice that a person is walking near it?',
              options: ['A motion sensor', 'A magic mirror', 'A telescope'],
              answerIndex: 0,
              explanation: 'Motion sensors detect movement and trigger actions automatically.'
            },
            {
              prompt: 'Which human organ works like a camera sensor on a phone?',
              options: ['Our Eyes', 'Our Knees', 'Our Elbows'],
              answerIndex: 0,
              explanation: 'Our eyes capture light, just like camera sensors do.'
            },
            {
              prompt: 'Do smart machines have feelings or emotions like humans?',
              options: ['No, machines only follow instructions and sensor signals', 'Yes, they feel sleepy', 'Yes, they get angry'],
              answerIndex: 0,
              explanation: 'Machines process signals and code; only living humans have feelings.'
            },
            {
              prompt: 'What powers most electronic sensors in buildings?',
              options: ['Electricity from batteries or mains', 'Fresh air only', 'Water drops'],
              answerIndex: 0,
              explanation: 'Sensors and circuits require electric power to operate.'
            }
          ]
        },
        {
          slug: 'safe-screen-habits',
          title: 'Safe Screen Habits: The 20-20-20 Rule & Family Care',
          objective: 'Practise healthy screen posture, eye care, time boundaries, and seeking adult support.',
          story: 'After finishing her 15-minute digital story lesson, Priya closes the tablet. She looks out of the window at a green coconut tree far away for 20 seconds. This is the 20-20-20 healthy eyes rule! Priya also remembers three important online safety rules: 1. Always use digital devices sitting beside a trusted adult. 2. Never type your home address, school name, or passwords into any website. 3. If a pop-up appears or something makes you feel uncomfortable, call mummy or papa immediately!',
          activity: 'Practise the 20-20-20 eye stretch right now: look at something at least 20 feet away for 20 seconds and blink gently.',
          questions: [
            {
              prompt: 'What should you do if an unfamiliar message or pop-up appears on a screen?',
              options: ['Show it to a trusted adult immediately', 'Click every button', 'Hide the tablet under a pillow'],
              answerIndex: 0,
              explanation: 'Always alert an adult whenever something unfamiliar or strange appears.'
            },
            {
              prompt: 'Should young children share their home address or phone number on the internet?',
              options: ['No, never share private personal details', 'Yes, with anyone who asks', 'Only on weekends'],
              answerIndex: 0,
              explanation: 'Personal information must always remain private and protected.'
            },
            {
              prompt: 'Why is it important to take breaks away from screens and play outdoors?',
              options: ['To rest our eyes and keep our bodies strong and healthy', 'Because screens get tired', 'It is not important'],
              answerIndex: 0,
              explanation: 'Outdoor physical play and eye rest are essential for growing children.'
            },
            {
              prompt: 'What does the 20-20-20 eye care rule suggest?',
              options: ['Every 20 minutes, look at something 20 feet away for 20 seconds', 'Look at 20 screens at once', 'Blink 20 times per second'],
              answerIndex: 0,
              explanation: 'Looking at distant objects relaxes the eye muscles.'
            }
          ]
        },
        {
          slug: 'how-machines-learn',
          title: 'Teaching with Examples: How Computers Spot a Mango',
          objective: 'Understand that machine learning requires many varied examples to recognise objects.',
          story: 'How does a smart photo app know that a picture contains a mango? You cannot just write one sentence: "A mango is yellow." What if the mango is green? What if it is cut into slices? Instead, computer scientists show the computer hundreds of different pictures of mangoes: yellow mangoes, green mangoes, ripe Alphonso mangoes, mangoes hanging on branches, and slices on a plate! By looking at many examples, the computer learns to notice common features: the oval curve, the smooth skin, and the stem shape.',
          activity: 'Draw three different mangoes on paper: one ripe yellow, one raw green, and one sliced. Show how variety helps us recognize them all as mangoes.',
          questions: [
            {
              prompt: 'How do computer systems learn to identify an object like an apple or cat?',
              options: ['By analysing many diverse photographic examples', 'By guessing in the dark', 'By sleeping overnight'],
              answerIndex: 0,
              explanation: 'Computers learn patterns by inspecting many labelled examples.'
            },
            {
              prompt: 'If a computer has only seen green mangoes, what might happen if you show it a ripe yellow mango?',
              options: ['It might not recognise it as a mango at first', 'It will delete itself', 'It will turn yellow'],
              answerIndex: 0,
              explanation: 'If training examples lack variety, the system might not recognize new variations.'
            },
            {
              prompt: 'Who decides what examples are fed into a computer system?',
              options: ['Human developers and scientists', 'The computer itself', 'The screen glass'],
              answerIndex: 0,
              explanation: 'Human engineers choose and verify the training data responsibly.'
            },
            {
              prompt: 'Is a computer truly thinking on its own when it recognizes a picture?',
              options: ['No, it is matching mathematical patterns learned from examples', 'Yes, it is dreaming', 'Yes, it has a brain'],
              answerIndex: 0,
              explanation: 'Computers compute mathematical pattern matches; they do not possess conscious thought.'
            }
          ]
        }
      ]
    },
    {
      name: 'Financial Literacy & Money Management',
      kind: 'Vayentra Original Enrichment',
      notes: 'Class 2 foundational financial literacy. Real Indian rupee currency, responsible spending, savings habits, and community ethics.',
      modules: [
        {
          slug: 'indian-currency-notes-coins',
          title: 'Indian Rupee Notes & Coins: Identifying Values',
          objective: 'Identify Indian currency coins (₹1, ₹2, ₹5, ₹10) and notes (₹10, ₹20, ₹50, ₹100).',
          story: 'Grandfather opens his cotton coin pouch to show Kabir the currency of India. "Look at the symbol," grandfather points to ₹, "This is the Indian Rupee symbol, designed by D. Udaya Kumar." Kabir examines a shiny round ₹5 coin with the Lion Capital emblem of Ashoka. Next, grandfather shows a crisp lavender-coloured ₹100 note and a chocolate-brown ₹10 note with the Sun Temple Konark wheel. Kabir notices that each note has numbers written in clear English and Hindi digits so anyone can easily read its value.',
          activity: 'With an adult\'s help, place paper over three different coins (₹1, ₹2, ₹5) and rub gently with a pencil to make a coin impression rubbing.',
          questions: [
            {
              prompt: 'What is the official currency symbol of India?',
              options: ['₹', '$', '€'],
              answerIndex: 0,
              explanation: 'The Indian Rupee symbol is ₹.'
            },
            {
              prompt: 'Which national emblem appears on all Indian coins?',
              options: ['The Lion Capital of Ashoka', 'A cricket bat', 'A railway train'],
              answerIndex: 0,
              explanation: 'The Lion Capital with four lions is our proud national emblem.'
            },
            {
              prompt: 'If you have two ₹5 coins, how much money do you have in total?',
              options: ['₹10', '₹7', '₹25'],
              answerIndex: 0,
              explanation: '5 + 5 = 10 rupees.'
            },
            {
              prompt: 'Why should we never write or scribble on currency notes?',
              options: ['Notes are national currency and must be kept clean and respectful', 'Pencils break on paper', 'Ink is expensive'],
              answerIndex: 0,
              explanation: 'Keeping currency notes clean protects their longevity and honours national currency.'
            }
          ]
        },
        {
          slug: 'needs-vs-wants',
          title: 'Needs vs. Wants: Making Thoughtful Choices',
          objective: 'Differentiate between essential needs (food, books, warm clothing) and optional wants (fancy toys, candies).',
          story: 'Kabir and his mother make a shopping list before visiting the market. Mother draws a vertical line down the paper. On the left side, she writes "NEEDS": vegetables, milk, rice, and Kabir\'s school notebook. On the right side, she writes "WANTS": a colourful spinning top and fruit lollipops. "Needs," mother explains, "are things we must have to live healthy and study well. Wants are fun extras that we can enjoy sometimes, but only after our needs are satisfied." Kabir smiles and agrees that healthy food comes first!',
          activity: 'Look at five things in your room. Classify each one as either a NEED or a WANT.',
          questions: [
            {
              prompt: 'Which of these is a basic NEED for every human being?',
              options: ['Nutritious food and clean water', 'A fifth video game', 'Glitter stickers'],
              answerIndex: 0,
              explanation: 'Food, water, clothing, and shelter are essential needs.'
            },
            {
              prompt: 'What is a "WANT"?',
              options: ['Something fun that is nice to have, but not essential to live', 'Something we cannot survive without', 'Medicine when we are sick'],
              answerIndex: 0,
              explanation: 'Wants are pleasant extras; needs are necessities.'
            },
            {
              prompt: 'What should a family buy first when managing household money?',
              options: ['Essential needs like groceries and school books', 'Expensive party toys', 'Fireworks'],
              answerIndex: 0,
              explanation: 'Needs always take first priority in responsible budgeting.'
            },
            {
              prompt: 'If you really want a toy but need a school geometry box, which should you choose?',
              options: ['The geometry box for school lessons', 'The toy only', 'Neither'],
              answerIndex: 0,
              explanation: 'Educational needs come before discretionary toys.'
            }
          ]
        },
        {
          slug: 'piggy-bank-savings',
          title: 'The Clay Piggy Bank: How Small Drops Fill an Ocean',
          objective: 'Understand delayed gratification and regular weekly savings habits.',
          story: 'For his seventh birthday, Kabir received a small painted terracotta gullak (piggy bank) from his aunt. "Whenever you receive a coin or pocket money, do not spend it immediately," aunt advised. Kabir started dropping a ₹2 or ₹5 coin into the slot every Sunday. Clink! Clink! Month after month, the gullak grew heavier. By Diwali, Kabir asked father to help him open it. Inside were forty coins totaling ₹160! Kabir used his savings to buy a beautiful storybook and still had ₹60 left over to start his next savings goal.',
          activity: 'Decorate an empty, clean cardboard box with stickers to make your own "Goal Savings Box". Set one modest goal with your parents.',
          questions: [
            {
              prompt: 'What is the main benefit of putting coins into a savings piggy bank regularly?',
              options: ['Small amounts accumulate over time into helpful savings', 'The coins turn into gold', 'The box makes music'],
              answerIndex: 0,
              explanation: 'Consistent saving builds substantial funds over weeks and months.'
            },
            {
              prompt: 'What is "delayed gratification"?',
              options: ['Waiting and saving today so you can achieve something better tomorrow', 'Spending money the minute you get it', 'Losing your wallet'],
              answerIndex: 0,
              explanation: 'Delayed gratification means resisting immediate impulses for greater future rewards.'
            },
            {
              prompt: 'If you save ₹10 every week, how much will you save in 4 weeks?',
              options: ['₹40', '₹14', '₹100'],
              answerIndex: 0,
              explanation: '10 + 10 + 10 + 10 = 40 rupees.'
            },
            {
              prompt: 'Who should help a Class 2 child keep their savings safe?',
              options: ['A parent or trusted guardian', 'A stranger on the street', 'Nobody'],
              answerIndex: 0,
              explanation: 'Parents and trusted guardians guide safe child savings habits.'
            }
          ]
        },
        {
          slug: 'bengaluru-bakery-change',
          title: 'At the Bakery: Paying and Calculating Change',
          objective: 'Calculate total purchase price and determine correct balance change.',
          story: 'Kabir and his father visit the beloved Iyengar Bakery in Malleshwaram. They select a warm loaf of whole-wheat bread costing ₹35 and two fresh vegetable buns costing ₹15 each. The baker says: "Bread is ₹35, and two buns are ₹30. That is ₹65 in total." Father hands over a crisp ₹100 note. Kabir quickly calculates: ₹100 minus ₹65 leaves ₹35! The baker hands back a ₹20 note, a ₹10 note, and a ₹5 coin. Kabir counts: 20 + 10 + 5 = ₹35. "Correct change, uncle! Thank you!" he beams.',
          activity: 'Play "Bakery Shop" at home using paper slips as price tags and toy money to practise paying and returning change.',
          questions: [
            {
              prompt: 'If a storybook costs ₹40 and you give a ₹50 note, how much change should you get back?',
              options: ['₹10', '₹5', '₹20'],
              answerIndex: 0,
              explanation: '50 - 40 = 10 rupees.'
            },
            {
              prompt: 'What coins or notes can combine to make exact change of ₹15?',
              options: ['One ₹10 note and one ₹5 coin', 'Three ₹2 coins', 'One ₹20 note'],
              answerIndex: 0,
              explanation: '10 + 5 = 15 rupees.'
            },
            {
              prompt: 'Why should we always count the change given by a shopkeeper before leaving?',
              options: ['To ensure the calculation was accurate and fair for both sides', 'To show off', 'Shopkeepers always make mistakes'],
              answerIndex: 0,
              explanation: 'Checking change politely confirms the transaction was completed correctly.'
            },
            {
              prompt: 'If two pencils cost ₹10 each, what is the total cost?',
              options: ['₹20', '₹12', '₹10'],
              answerIndex: 0,
              explanation: '10 + 10 = 20 rupees.'
            }
          ]
        },
        {
          slug: 'sharing-and-giving',
          title: 'Sharing with Kindness: Donating Books and Toys',
          objective: 'Recognise the value of community support, charity, and sharing good fortune with those in need.',
          story: 'At the end of the school term, Kabir notices that he has outgrown several picture storybooks and wooden building blocks from Class 1. Rather than throwing them away or letting them collect dust, Kabir cleans the book covers carefully. Together with mother, they visit the community learning centre in their neighbourhood and gift the books to younger children. Seeing the bright smiles on their faces makes Kabir feel warm inside. True wealth is not just what we have, but what we can kindly share with others.',
          activity: 'Find one storybook or toy that you have outgrown, wipe it clean, and ask an adult how you can donate it to a local library or child.',
          questions: [
            {
              prompt: 'What is a thoughtful way to use storybooks you have outgrown?',
              options: ['Donate them to a library or younger children to read', 'Throw them in the trash bin', 'Scribble on all pages'],
              answerIndex: 0,
              explanation: 'Donating books gives them a second life and helps other children learn.'
            },
            {
              prompt: 'How does sharing and kindness help our community?',
              options: ['It builds friendship, trust, and helps everyone grow together', 'It makes people jealous', 'It has no effect'],
              answerIndex: 0,
              explanation: 'Sharing strengthens our community and fosters mutual care.'
            },
            {
              prompt: 'Is money the only thing a person can share with others?',
              options: ['No, we can share books, time, smiles, knowledge, and kind words', 'Yes, only paper notes count', 'Yes, nothing else matters'],
              answerIndex: 0,
              explanation: 'Kindness, time, and knowledge are precious gifts anyone can give.'
            },
            {
              prompt: 'Before gifting an outgrown toy or book, what should we do?',
              options: ['Clean it and make sure it is in good, safe condition', 'Break it in half', 'Hide the pieces'],
              answerIndex: 0,
              explanation: 'Donated items should be clean, complete, and respectful.'
            }
          ]
        },
        {
          slug: 'receipts-and-bills',
          title: 'The Printed Receipt: Why Records Matter',
          objective: 'Understand why shopkeepers issue receipts and how records protect consumer rights.',
          story: 'When Kabir\'s father buys a new school bag at the stationery shop, the shopkeeper prints a small slip of paper from the machine and hands it over with the change. "Why do we take this paper slip, Appa?" Kabir asks. Father shows the paper: "This is a bill or receipt. It lists the shop\'s name, today\'s date, the bag\'s price of ₹250, and proves that we paid for it. If the bag has a torn zip tomorrow, we can show this receipt and the shopkeeper will replace it fairly." Receipts create trust and accountability between buyers and sellers.',
          activity: 'Ask an adult to show you a grocery or electricity receipt. Find the date and the total amount printed on it.',
          questions: [
            {
              prompt: 'What is the purpose of a shop receipt or bill?',
              options: ['It proves what was purchased, the price paid, and the date', 'It is wrapping paper', 'It is a toy to draw on'],
              answerIndex: 0,
              explanation: 'A receipt provides official proof of purchase and pricing.'
            },
            {
              prompt: 'If an item you bought has a defect, what paper helps you request a repair or replacement?',
              options: ['The purchase receipt or invoice', 'A comic strip', 'A cinema ticket'],
              answerIndex: 0,
              explanation: 'The purchase receipt serves as proof that you bought the product there.'
            },
            {
              prompt: 'Why do governments encourage every shop to issue proper bills?',
              options: ['It ensures honest business records and fair tax accounting', 'To create more paper waste', 'To slow down shoppers'],
              answerIndex: 0,
              explanation: 'Official billing ensures honesty, consumer rights, and transparent records.'
            },
            {
              prompt: 'What key information can you always find on a printed store receipt?',
              options: ['Date, item name, and total amount paid', 'The weather forecast', 'The names of all customers'],
              answerIndex: 0,
              explanation: 'Receipts always feature the transaction date, items, and total cost.'
            }
          ]
        }
      ]
    }
  ]
};
