// Class 1 Vayentra ONE curriculum blueprint. Original enrichment and original instructional drafts.
// Official chapter TITLES only; never package or reproduce NCERT or KTBS textbooks.
// Draft until a qualified teacher verifies academic-year, language, edition and media.
export const GRADE1_CURRICULUM = {
  "grade": 1,
  "edition": "2026-27",
  "status": "draft_teacher_review_required",
  "pedagogy": "Play-first, oral-language, physical manipulatives and guardian-supported digital use; no autonomous chatbot for young children.",
  "official": [
    {
      "board": "CBSE",
      "subjects": [
        {
          "name": "English",
          "book": "Mridang",
          "source": "https://www.ciet.ncert.gov.in/audio-book/115",
          "status": "source_chapters_verified",
          "chapters": [
            "Two Little Hands",
            "Greetings",
            "Picture Time",
            "The Cap Seller and the Monkeys",
            "A Farm",
            "Fun with Pictures",
            "The Food We Eat",
            "The Four Seasons",
            "Anandi's Rainbow"
          ]
        },
        {
          "name": "Hindi",
          "book": "Sarangi",
          "source": "https://www.ciet.ncert.gov.in/audio-book/117",
          "status": "source_chapters_verified",
          "chapters": [
            "मीना का परिवार",
            "दादा-दादी",
            "रीना का दिन",
            "रानी भी",
            "मिठाई",
            "तीन साथी",
            "वाह, मेरे घोड़े",
            "खतरे में साँप",
            "आलू की सड़क",
            "झूलम-झूली",
            "भुट्टे",
            "फूली रोटी",
            "मेला",
            "बरखा और मेघा",
            "होली",
            "जन्मदिवस पर पेड़ लगाओ",
            "हवा",
            "कितनी प्यारी है ये दुनिया",
            "चाँद का बच्चा"
          ]
        },
        {
          "name": "Mathematics",
          "book": "Joyful Mathematics",
          "source": "https://www.ciet.ncert.gov.in/audio-book/118",
          "status": "source_chapters_verified",
          "chapters": [
            "Finding the Furry Cat!",
            "What is Long?",
            "Mango Treat",
            "Making 10",
            "How Many?",
            "Vegetable Farm",
            "Lina's Family",
            "Fun with Numbers",
            "Utsav",
            "How do I Spend my Day?",
            "How Many Times?",
            "How Much Can We Spend?",
            "So Many Toys"
          ]
        },
        {
          "name": "Kannada",
          "book": "Kali Nali Kannada (ಕನ್ನಡ ಕಲಿ - ನಲಿ)",
          "source": "https://textbooks.karnataka.gov.in/",
          "status": "source_chapters_verified",
          "chapters": [
            "ಅಕ್ಷರ ಲೋಕ (Swaragalu - Vowels: ಅ, ಆ, ಇ, ಈ, ಉ, ಊ)",
            "ಸರಳ ಪದಗಳು ಮತ್ತು ವ್ಯಂಜನಗಳು (Consonants & Simple Words)",
            "ನನ್ನ ಕುಟುಂಬ ಮತ್ತು ಗೆಳೆಯರು (My Family & Friends)",
            "ಬಣ್ಣಗಳು ಮತ್ತು ಆಟಗಳು (Colours, Rhymes & Play)"
          ]
        }
      ]
    },
    {
      "board": "STATE",
      "subjects": [
        {
          "name": "Kannada",
          "book": "Savi Kannada (ಸವಿಗನ್ನಡ Class 1)",
          "source": "https://textbooks.karnataka.gov.in/",
          "status": "source_chapters_verified",
          "chapters": [
            "ಅಕ್ಷರ ಲೋಕ (Swaragalu - Vowels: ಅ, ಆ, ಇ, ಈ, ಉ, ಊ)",
            "ಸರಳ ಪದಗಳು ಮತ್ತು ವ್ಯಂಜನಗಳು (Consonants & Simple Words)",
            "ನನ್ನ ಕುಟುಂಬ ಮತ್ತು ಗೆಳೆಯರು (My Family & Friends)",
            "ಬಣ್ಣಗಳು ಮತ್ತು ಆಟಗಳು (Colours, Rhymes & Play)"
          ]
        },
        {
          "name": "English",
          "book": "Karnataka Textbook Society Class 1 English; first/second language depends on school",
          "source": "https://textbooks.karnataka.gov.in/",
          "status": "textbook_chapters_pending",
          "chapters": []
        },
        {
          "name": "Mathematics",
          "book": "Karnataka Textbook Society Class 1 Maths (medium-specific)",
          "source": "https://textbooks.karnataka.gov.in/",
          "status": "textbook_chapters_pending",
          "chapters": []
        },
        {
          "name": "Environmental Studies",
          "book": "Karnataka Textbook Society Class 1 EVS (medium-specific)",
          "source": "https://textbooks.karnataka.gov.in/",
          "status": "textbook_chapters_pending",
          "chapters": []
        }
      ]
    }
  ],
  "enrichment": [
    {
      "name": "AI & Digital Thinking",
      "kind": "Vayentra Original Enrichment",
      "notes": "Not CBSE-mandated AI for Class 1. No child chatbot, no uploading personal data.",
      "modules": [
        {
          "slug": "spot-patterns",
          "title": "The Pattern Detective",
          "objective": "Notice and continue simple colour, size and shape patterns.",
          "story": "Nila is making a necklace from paper shapes. First she uses a yellow circle. Next comes a blue square. Then a yellow circle, then a blue square. She stops and looks carefully. What comes next? Nila has discovered a pattern: something that repeats in an organised way. A computer can look for patterns in information too, but we can practise the thinking without a screen. Patterns help us predict what could happen next. Sometimes a pattern changes, so we should check rather than just guess. Try making your own colour pattern and asking a friend to explain it.",
          "activity": "Create a repeating pattern with four crayons or safe paper pieces. Ask an adult to change one piece and find what broke the rule.",
          "questions": [
            {
              "prompt": "Red, blue, red, blue. What comes next?",
              "options": [
                "Red",
                "Green",
                "Blue"
              ],
              "correctIndex": 0,
              "explanation": "The colours repeat red, blue."
            },
            {
              "prompt": "Which question helps us check a pattern?",
              "options": [
                "What repeats?",
                "What costs most?",
                "Who is tallest?"
              ],
              "correctIndex": 0,
              "explanation": "Look for the part that repeats."
            }
          ]
        },
        {
          "slug": "sort-and-group",
          "title": "Sort It Like a Thinker",
          "objective": "Classify familiar objects using one clear rule.",
          "story": "A box contains toy animals, blocks and paper stars. We can group these by colour, by size, or by what they are. One grouping rule at a time makes our choice easy to explain. If we group by colour, a red block and red star might belong together even though they are different objects. Computers sometimes sort information by a chosen rule. But we decide which rule is useful, and we can change it when the task changes. Good thinking means saying the rule aloud so another person can understand it.",
          "activity": "Sort six safe household objects by colour; then try sorting the same things by shape.",
          "questions": [
            {
              "prompt": "Which is a clear sorting rule?",
              "options": [
                "Put red objects together",
                "Pick favourites only",
                "Close your eyes"
              ],
              "correctIndex": 0,
              "explanation": "Grouping by colour follows a clear rule."
            },
            {
              "prompt": "Can one group of objects be sorted in more than one way?",
              "options": [
                "Yes",
                "No"
              ],
              "correctIndex": 0,
              "explanation": "We can change the rule."
            }
          ]
        },
        {
          "slug": "step-by-step",
          "title": "A Robot's Morning Instructions",
          "objective": "Put simple actions into a useful sequence.",
          "story": "Imagine a friendly toy robot that wants to wash its hands. It waits for instructions. If we say 'dry your hands' before 'turn on the tap', something is wrong! We need a sensible order. First, turn on the tap; next, wet your hands; then, use soap and rub; after rinsing, turn the tap off and dry. This is an example of step-by-step thinking. People use instructions every day, and computer programs also follow instructions. Our instructions should be clear, safe and in the right order. A real robot cannot always guess what we meant if we forget a step.",
          "activity": "Tell a grown-up three steps for packing a schoolbag. Switch two steps and see whether your plan still works.",
          "questions": [
            {
              "prompt": "What should we do before drying washed hands?",
              "options": [
                "Rinse off soap",
                "Put on socks",
                "Go to sleep"
              ],
              "correctIndex": 0,
              "explanation": "We rinse and turn off the tap before drying."
            },
            {
              "prompt": "Why does order matter?",
              "options": [
                "Some tasks need steps in a sequence",
                "It never matters"
              ],
              "correctIndex": 0,
              "explanation": "Correct order makes instructions work."
            }
          ]
        },
        {
          "slug": "find-the-mistake",
          "title": "Oops! Let's Debug",
          "objective": "Identify and fix a simple mistake in instructions.",
          "story": "A paper arrow game tells Mira to move forward, turn right and stop at the tree. But the arrow takes her to the pond instead! Mira does not get upset. She looks at the steps again, finds where the direction changed, and corrects it. Finding and fixing a mistake is called debugging. People debug recipes, schoolbag lists, maps and computer programs. A mistake is a chance to learn. The important thing is to compare what happened with what we expected and change one step at a time. We should always ask an adult before doing an outdoor direction game.",
          "activity": "Draw a path of four arrows on paper. Put one arrow the wrong way and let a friend find it.",
          "questions": [
            {
              "prompt": "What is debugging?",
              "options": [
                "Finding and fixing a mistake",
                "Throwing away the game",
                "Always choosing first"
              ],
              "correctIndex": 0,
              "explanation": "Debugging means checking steps and correcting an error."
            },
            {
              "prompt": "If a plan fails, what is a good next step?",
              "options": [
                "Check the steps",
                "Give up without looking"
              ],
              "correctIndex": 0,
              "explanation": "Review what happened first."
            }
          ]
        },
        {
          "slug": "smart-tools",
          "title": "People Think, Tools Help",
          "objective": "Recognise that digital tools help people but may make mistakes.",
          "story": "A calculator can help an adult add numbers quickly. A weather app can show a prediction. A camera can recognise some objects. Some computer tools use artificial intelligence, often called AI, to find patterns and make suggestions. But no tool understands everything. A tool can be wrong, and people must check important information. For Class 1 we do not need to chat with a robot or share personal details. We can ask a parent or teacher to show a safe example of a helpful digital tool and discuss what a human must still decide.",
          "activity": "Tell an adult about one tool that helps at home. What can the tool do? What must a person check?",
          "questions": [
            {
              "prompt": "Can a smart tool ever make a mistake?",
              "options": [
                "Yes",
                "Never"
              ],
              "correctIndex": 0,
              "explanation": "People need to check important results."
            },
            {
              "prompt": "Who should help young children use unfamiliar digital tools?",
              "options": [
                "A trusted adult",
                "An unknown online stranger"
              ],
              "correctIndex": 0,
              "explanation": "Adults should supervise digital experiences."
            }
          ]
        },
        {
          "slug": "fair-choices",
          "title": "Fair Rules for Everyone",
          "objective": "Recognise fairness in simple sorting and decision games.",
          "story": "Four children are picking a storybook. A game always gives the first choice to the same child. Is that fair? Maybe not. Everyone deserves a chance. Digital tools can also be unfair if the examples or rules they learn from leave people out. In Class 1 we can begin by asking, 'Does this rule treat people kindly? Is someone being forgotten?' A fair rule might rotate turns or let each child speak. Good technology should help people, not exclude them. These lessons are about kindness and careful thinking, not complicated machines.",
          "activity": "Invent a fair turn-taking rule for choosing a class game. Test it with family members.",
          "questions": [
            {
              "prompt": "What makes a turn-taking game fair?",
              "options": [
                "Everyone gets a turn",
                "Only one child chooses every time"
              ],
              "correctIndex": 0,
              "explanation": "Fair rules include everyone."
            },
            {
              "prompt": "Should we ask questions when a tool's choice looks unfair?",
              "options": [
                "Yes",
                "No"
              ],
              "correctIndex": 0,
              "explanation": "Questioning can help us notice unfair results."
            }
          ]
        },
        {
          "slug": "secret-and-safe",
          "title": "My Personal Information Is Private",
          "objective": "Practise safe digital boundaries and trusted-adult help.",
          "story": "Your name, photo, home address and school details are personal information. A friendly-looking character in an app might still be a stranger. Do not type private information into unknown games, chatbots or websites. If something asks for a password, a photo or an address, stop and ask a trusted adult. We can have fun learning about thinking tools without opening accounts or talking to strangers. When we learn to be safe early, we can enjoy technology with more confidence. Remember: you can always tell a parent or teacher if something online feels uncomfortable.",
          "activity": "Practise saying, 'I will ask my parent or teacher first,' when a pretend game asks for your address.",
          "questions": [
            {
              "prompt": "An unknown app asks for your home address. What should you do?",
              "options": [
                "Ask a trusted adult",
                "Share it right away"
              ],
              "correctIndex": 0,
              "explanation": "Do not share private information without adult guidance."
            },
            {
              "prompt": "Is a password something to tell strangers?",
              "options": [
                "No",
                "Yes"
              ],
              "correctIndex": 0,
              "explanation": "Passwords must be kept private."
            }
          ]
        },
        {
          "slug": "create-a-game",
          "title": "Design Your Own Thinking Game",
          "objective": "Combine patterns, rules and steps to invent a simple activity.",
          "story": "You are now the game designer! Place three coloured shapes on a page. Make a rule for how a player should move a counter. Explain the rule to someone else and watch them try it. Did they know what to do? If they looked confused, try using clearer words or changing a step. Good designers test their games, listen to others and improve them. This is similar to how people create useful computer programs, but today you do it with paper and imagination. A successful game is one where players understand the instructions and feel included.",
          "activity": "Make a three-step pattern game on paper. Ask a family member to try it, then change one unclear rule.",
          "questions": [
            {
              "prompt": "What is a good way to improve a game?",
              "options": [
                "Ask someone to test it",
                "Never listen to players"
              ],
              "correctIndex": 0,
              "explanation": "Testing helps us find confusing rules."
            },
            {
              "prompt": "What should a player know before starting?",
              "options": [
                "The rules",
                "A secret password"
              ],
              "correctIndex": 0,
              "explanation": "Clear rules help everyone play."
            }
          ]
        }
      ]
    },
    {
      "name": "Money & Life Skills",
      "kind": "Vayentra Original Enrichment",
      "notes": "Early financial literacy, not a formal bank, investment or stock-market course.",
      "modules": [
        {
          "slug": "what-is-money",
          "title": "What Do People Use Money For?",
          "objective": "Identify simple uses of money in everyday exchanges.",
          "story": "A family visits a fruit shop. They choose two bananas and pay the shopkeeper. Money is something people use to pay for many goods and services. But many important things, such as kindness, friendship and spending time with family, do not need to be bought. Different families have different amounts of money, and we should never make fun of anyone for that. You do not have to buy anything to learn about money. We can pretend to run a shop using drawings of coins, paper price tags and play vegetables. Grown-ups handle real payments and private payment information.",
          "activity": "Set up a pretend fruit stall using drawings and pretend coins. No real purchases needed.",
          "questions": [
            {
              "prompt": "We usually use money to…",
              "options": [
                "Pay for a banana",
                "Buy friendship",
                "Make rain"
              ],
              "correctIndex": 0,
              "explanation": "Money can help pay for goods."
            },
            {
              "prompt": "Do you need money to be kind?",
              "options": [
                "No",
                "Yes"
              ],
              "correctIndex": 0,
              "explanation": "Kindness is not something we buy."
            }
          ]
        },
        {
          "slug": "needs-and-wants",
          "title": "Needs or Wants?",
          "objective": "Recognise basic needs and optional wants with empathy.",
          "story": "Imagine you are packing a bag for a long school day. Drinking water is important. A healthy lunch is important. A shiny new toy might be fun, but you do not need it to stay safe and well at school. Needs are things that help us live, learn and stay healthy; wants are things we may enjoy but can sometimes wait for. Some items can be needs for one person and wants for another, so we should talk kindly rather than judge. Adults make household decisions and children can learn to notice the difference. Learning needs and wants helps us make thoughtful choices.",
          "activity": "Draw two circles: Things I Need and Things I Would Like. Add pictures and discuss with a trusted adult.",
          "questions": [
            {
              "prompt": "Which is usually an everyday need?",
              "options": [
                "Safe drinking water",
                "A new toy every day"
              ],
              "correctIndex": 0,
              "explanation": "Water is essential."
            },
            {
              "prompt": "Can we want something even when we do not need it?",
              "options": [
                "Yes",
                "No"
              ],
              "correctIndex": 0,
              "explanation": "Wants can be enjoyable but optional."
            }
          ]
        },
        {
          "slug": "coins-and-notes",
          "title": "Meet the Rupee",
          "objective": "Recognise Indian currency symbols and simple values without handling payments.",
          "story": "In India, our money is counted in rupees. We often write the rupee sign as ₹. A shop may show a price such as ₹5 or ₹10. Coins and notes come in different values. A coin that looks bigger is not always worth more, so we read the printed value instead of guessing from its size. For now, we can use colourful pictures of pretend coins and learn to match a number to a price. Do not put coins in your mouth and do not carry real money without an adult's permission. The important thinking skill is recognising that the number on a coin or price tag tells us its value.",
          "activity": "Draw pretend ₹1, ₹2, ₹5 and ₹10 tokens. Pair each token with matching price cards.",
          "questions": [
            {
              "prompt": "Which symbol represents Indian rupees?",
              "options": [
                "₹",
                "$"
              ],
              "correctIndex": 0,
              "explanation": "₹ is the Indian rupee symbol."
            },
            {
              "prompt": "How do we know a coin's value?",
              "options": [
                "Read its printed value",
                "Guess by its colour"
              ],
              "correctIndex": 0,
              "explanation": "Look for the value printed on it."
            }
          ]
        },
        {
          "slug": "count-a-shop",
          "title": "Our ₹10 Pretend Shop",
          "objective": "Practise adding small prices and comparing options.",
          "story": "A pretend class shop sells a pencil sticker for ₹3 and a paper star for ₹2. How much do both cost together? Three plus two makes five rupees. A simple number sentence helps us understand a shop label: ₹3 + ₹2 = ₹5. Now imagine we have only a pretend ₹5 token. We can choose those two items, but not another item without more tokens. This is a useful number game, not permission to spend real money. Try drawing three objects with small prices. Add their prices using fingers, counters or drawings. Celebrate careful counting, not spending more.",
          "activity": "Make a paper shop with three items priced ₹2, ₹3 and ₹5. Choose combinations that total ₹5.",
          "questions": [
            {
              "prompt": "A toy card costs ₹2 and a star card costs ₹3. Total?",
              "options": [
                "₹5",
                "₹6",
                "₹2"
              ],
              "correctIndex": 0,
              "explanation": "2 + 3 = 5."
            },
            {
              "prompt": "If we have ₹5 and choose ₹2 plus ₹3, how much is left?",
              "options": [
                "₹0",
                "₹5"
              ],
              "correctIndex": 0,
              "explanation": "The pretend total uses all five rupees."
            }
          ]
        },
        {
          "slug": "save-a-little",
          "title": "Saving for Later",
          "objective": "Explore waiting and setting a goal using imaginary tokens.",
          "story": "Ravi receives five pretend paper tokens in a learning game. He can choose a tiny sticker today for two tokens or keep the tokens for a larger drawing set in a later round. When we keep some money for later use, we call it saving. There is no one correct answer for every family; sometimes important needs come first. Saving helps us plan for something we care about. The idea is not to ask children to save from real household needs. It is to practise waiting, making plans and counting. A trusted adult can help us decide when saving is useful and when something is needed right now.",
          "activity": "Use paper tokens in two cups labelled Now and Later. Move tokens to practise choices.",
          "questions": [
            {
              "prompt": "Saving means…",
              "options": [
                "Keeping something for later",
                "Always spending everything"
              ],
              "correctIndex": 0,
              "explanation": "Saving sets something aside for the future."
            },
            {
              "prompt": "Should we skip necessary food to save for a toy?",
              "options": [
                "No",
                "Yes"
              ],
              "correctIndex": 0,
              "explanation": "Basic needs and health come first."
            }
          ]
        },
        {
          "slug": "share-and-care",
          "title": "Giving and Sharing",
          "objective": "Discuss sharing time or resources freely without pressure.",
          "story": "Friends are preparing a classroom display. One person has extra coloured paper, while another has none. They can share if they wish. Sharing does not always mean giving money. We can share knowledge, time, stories or safe materials. Some families choose to help others, but kindness should never be forced, and children should not be asked to donate or handle real payments. In a pretend classroom activity, a group might have ten paper stars and choose to share them fairly among classmates. We can learn both the maths of sharing and the values of respect and empathy. Everyone's situation is different, so we talk with care.",
          "activity": "Divide eight paper stars fairly among four toy characters. Explain your reasoning.",
          "questions": [
            {
              "prompt": "Sharing can include…",
              "options": [
                "Helping a friend learn",
                "Only giving cash"
              ],
              "correctIndex": 0,
              "explanation": "Time and help can be shared."
            },
            {
              "prompt": "Should children be forced to give away their possessions?",
              "options": [
                "No",
                "Yes"
              ],
              "correctIndex": 0,
              "explanation": "Sharing should be respectful and voluntary."
            }
          ]
        },
        {
          "slug": "careful-choices",
          "title": "Look Before You Choose",
          "objective": "Compare simple choices without advertising pressure.",
          "story": "Imagine two notebooks with similar paper. One has a bright picture and the other looks plain. Which one would work well for drawing? We can look at usefulness, the price in a pretend shop and whether we already have something suitable. Pictures and advertisements are meant to catch attention. They can be fun to see, but they do not tell us everything about a product. It is wise to pause and ask a parent or teacher before asking to buy something. Thinking before choosing helps us appreciate what we already have. Use drawings rather than real shopping apps for this lesson.",
          "activity": "Compare two pretend school supplies on paper. Say which would be useful and why.",
          "questions": [
            {
              "prompt": "A colourful advertisement says you must buy a toy. What is wise?",
              "options": [
                "Pause and ask a trusted adult",
                "Believe every advertisement"
              ],
              "correctIndex": 0,
              "explanation": "Advertisements are not instructions."
            },
            {
              "prompt": "What should we consider before choosing an item?",
              "options": [
                "Whether we need it",
                "Only the brightest box"
              ],
              "correctIndex": 0,
              "explanation": "Think about usefulness and needs."
            }
          ]
        },
        {
          "slug": "my-first-budget",
          "title": "Plan a Pretend Picnic",
          "objective": "Make a simple plan for limited imaginary resources.",
          "story": "Three friends are organising a pretend picnic. They have ten paper tokens. A drawing of fruit costs four tokens, a water picture costs three and a toy sticker costs five. Fruit and water together cost seven tokens. The group has three tokens left, so they cannot also choose the five-token sticker. This is what a simple budget helps us notice: we choose how to use a limited amount. In real life, adults carefully manage family budgets and children need not worry about household finances. The class game is only for learning addition, comparison and thoughtful decisions. Make a new picnic plan and explain why you chose each item.",
          "activity": "Draw three pretend picnic items with price tags and plan a combination under ten tokens.",
          "questions": [
            {
              "prompt": "With 10 tokens, fruit 4 and water 3 leave…",
              "options": [
                "3 tokens",
                "7 tokens",
                "10 tokens"
              ],
              "correctIndex": 0,
              "explanation": "10 − (4 + 3) = 3."
            },
            {
              "prompt": "Who should handle real household payments?",
              "options": [
                "A trusted responsible adult",
                "Any unknown app"
              ],
              "correctIndex": 0,
              "explanation": "Adults should manage real transactions."
            }
          ]
        }
      ]
    }
  ],
  "starterLessons": [
    {
      "board": "CBSE",
      "subject": "Mathematics",
      "chapter": 1,
      "title": "Where Is the Little Puppy?",
      "objective": "Use position words to describe where an object is.",
      "story": "A little puppy hides behind a chair, then sits beside a basket. We can describe the puppy's location using words like above, below, inside, outside, near and far. These words help us explain spaces clearly, even without counting. Point to a safe object and tell someone where it is.",
      "activity": "Place a soft toy beside and behind a box. Ask a parent to describe each location.",
      "questions": [
        [
          "The puppy is under the table. Where is it?",
          [
            "Below the table",
            "On the roof"
          ],
          0,
          "Under means below."
        ]
      ]
    },
    {
      "board": "CBSE",
      "subject": "English",
      "chapter": 1,
      "title": "My Helpful Hands",
      "objective": "Use familiar words and simple sentences to describe actions.",
      "story": "I have two hands. I can wave hello, draw a circle and help put toys away. Our hands can do many kind and useful things. Say one action aloud, then make a short sentence: 'I can draw.' Listen to a friend say another. Spoken language helps us prepare for reading and writing.",
      "activity": "Name three safe actions you can do with your hands and say a simple sentence about each.",
      "questions": [
        [
          "Which is a complete simple sentence?",
          [
            "I can wave.",
            "Blue dog"
          ],
          0,
          "A sentence expresses an idea."
        ]
      ]
    },
    {
      "board": "CBSE",
      "subject": "Hindi",
      "chapter": 1,
      "title": "मेरा परिवार, मेरी बातें",
      "objective": "Listen and speak about familiar family and trusted people in simple Hindi.",
      "story": "हम अलग-अलग परिवारों में रहते हैं। किसी बच्चे के घर में माता-पिता हैं, किसी के साथ दादा-दादी या दूसरे देखभाल करने वाले रहते हैं। हम प्यार से सबका परिचय करा सकते हैं। अपनी सुविधा से कहें: 'यह मेरा परिवार है।' किसी मित्र का परिवार अलग हो सकता है और हम उसका सम्मान करते हैं।",
      "activity": "घर के किसी भरोसेमंद व्यक्ति के साथ दो छोटे वाक्य बोलें।",
      "questions": [
        [
          "परिवार के बारे में बात करते समय क्या ज़रूरी है?",
          [
            "सबका सम्मान करना",
            "मज़ाक उड़ाना"
          ],
          0,
          "हर परिवार के साथ सम्मान से पेश आना चाहिए।"
        ]
      ]
    },
    {
      "board": "STATE",
      "subject": "Kannada",
      "chapter": null,
      "title": "ನನ್ನ ಹೆಸರು ಮತ್ತು ನನ್ನ ಮಾತು",
      "objective": "Practise speaking an introduction in Kannada; textbook linkage pending teacher review.",
      "story": "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ರವಿ. ನಾನು ನನ್ನ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಆಟ ಆಡುತ್ತೇನೆ. ನಾವು ಒಬ್ಬರ ಮಾತನ್ನು ಮತ್ತೊಬ್ಬರು ಕೇಳಬೇಕು. ಎಲ್ಲರೂ ಒಂದೇ ರೀತಿಯಾಗಿ ಮಾತನಾಡುವುದಿಲ್ಲ. ಆದರೂ ಎಲ್ಲರ ಮಾತಿಗೂ ಗೌರವ ಕೊಡಬೇಕು. ನಿನ್ನ ಹೆಸರನ್ನು ನಿಧಾನವಾಗಿ ಹೇಳು. ನಿನಗೆ ಇಷ್ಟವಾದ ಆಟದ ಹೆಸರನ್ನೂ ಹೇಳು.",
      "activity": "ಮನೆಯಲ್ಲಿ ಹಿರಿಯರೊಂದಿಗೆ ನಿಮ್ಮ ಹೆಸರು ಹಾಗೂ ಇಷ್ಟದ ಆಟವನ್ನು ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ.",
      "questions": [
        [
          "'ನಮಸ್ಕಾರ' ಎನ್ನುವುದು ಯಾವಾಗ?",
          [
            "ಶುಭಾಶಯ ಹೇಳುವಾಗ",
            "ಮಲಗುವಾಗ ಮಾತ್ರ"
          ],
          0,
          "ನಮಸ್ಕಾರ ಒಂದು ಶುಭಾಶಯ."
        ]
      ]
    },
    {
      "board": "STATE",
      "subject": "English",
      "chapter": null,
      "title": "Hello and My Name",
      "objective": "Speak a greeting and a simple self-introduction; textbook alignment pending.",
      "story": "Hello! My name is Tara. I like drawing stars. When I meet a friend, I can say hello and listen to their name. A friend might speak a different home language. We can be kind and patient as they share their words. Say your name clearly and try a simple sentence about what you enjoy.",
      "activity": "Practise a friendly greeting and one sentence with a trusted adult.",
      "questions": [
        [
          "Which is a greeting?",
          [
            "Hello",
            "Seven"
          ],
          0,
          "Hello is a common greeting."
        ]
      ]
    },
    {
      "board": "STATE",
      "subject": "Mathematics",
      "chapter": null,
      "title": "Where Is It?",
      "objective": "Explore positional language with familiar objects; textbook mapping pending.",
      "story": "The toy is on the table. Now it is under the table. Before we use numbers, we can talk about position and space. Put a paper square beside a book, then put it above the book. Words such as near, far, below and above help us describe our world. Try giving a parent one safe direction.",
      "activity": "Place a pencil next to a book and explain where it is.",
      "questions": [
        [
          "'Above' usually means…",
          [
            "Higher than",
            "Under"
          ],
          0,
          "Above describes a higher position."
        ]
      ]
    },
    {
      "board": "STATE",
      "subject": "Environmental Studies",
      "chapter": null,
      "title": "People Who Help Us",
      "objective": "Notice everyday care, safety and neighbourhood roles without ranking people's work.",
      "story": "Every community has many helpers. People grow food, teach children, repair things, keep places clean and care for those who need help. We can notice these jobs and say thank you. Our own family members help in different ways too. No job makes a person more important than someone else. Look around your school and name one way people work together.",
      "activity": "Draw two people who help in your community and discuss their work.",
      "questions": [
        [
          "Which is a kind way to speak about helpers?",
          [
            "Thank you for your work",
            "Your job is not important"
          ],
          0,
          "Every form of honest work deserves respect."
        ]
      ]
    }
  ],
  "refs": {
    "ncertMath": "https://www.ciet.ncert.gov.in/audio-book/118",
    "ncertEnglish": "https://www.ciet.ncert.gov.in/audio-book/115",
    "ncertHindi": "https://www.ciet.ncert.gov.in/audio-book/117",
    "cbse2026": "https://cbseacademic.nic.in/ct-ai.html",
    "karnataka": "https://textbooks.karnataka.gov.in/"
  }
};
