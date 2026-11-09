// Vayentra ORIGINAL Class 10 review drafts. Full synthetic narration, slides, MP4 and SRT
// files are delivered as a separate teacher-review video pack, NOT hosted in GitHub.
// Editorial sources: CBSE Class X 2026-27; NCERT textbook publisher reference only.
export const CLASS10_NEXT_LESSON_BATCH = [
 {
  id:'vg-cbse10-maths-arithmetic-progressions',
  sourceId:'cbse-10-mathematics',
  chapter:'Arithmetic Progressions',
  topic:'Nth Term of an Arithmetic Progression',
  objective:'Identify the first term and common difference, then calculate the nth term using a+(n-1)d.',
  videoPackName:'maths_arithmetic_progressions_TEACHER_REVIEW.mp4',
  durationDraftSeconds:160,
  storyboard:[
   'Opening: seats in auditorium grow by 3 each row: 12, 15, 18, 21.',
   'Understand a = 12 and d = 3; verify the difference between successive terms.',
   'Derive a_n = a + (n−1)d by counting jumps from the first term.',
   'Worked example: a_8 = 12 + 7×3 = 33.',
   'Explain negative common difference using 25, 23, 21, 19.',
   'Check sixth term: 25 + 5(−2) = 15; verify by listing terms.',
   'Misconception: a+nd is wrong; there are n−1 jumps.',
   'Pause-and-try: 4, 9, 14, 19... find the tenth term.'
  ],
  questions:[
   {id:'vg-c10-ap-q1',question:'For 4, 9, 14, 19, ... what is the 10th term?',options:['45','49','54','50'],correctIndex:1,explanation:'a=4, d=5. The 10th term is 4+9×5=49.',misconceptionCode:'OFF_BY_ONE'},
   {id:'vg-c10-ap-q2',question:'What is the 6th term of 25, 23, 21, ...?',options:['13','15','17','35'],correctIndex:1,explanation:'a=25, d=−2; a6=25+5(−2)=15.',misconceptionCode:'NEGATIVE_DIFFERENCE'},
   {id:'vg-c10-ap-q3',question:'What is the nth-term expression of an arithmetic progression?',options:['a+nd','a+(n−1)d','an+d','a+(n+1)d'],correctIndex:1,explanation:'From the first term a to the nth term, the difference d is applied n−1 times.',misconceptionCode:'FORMULA_REASONING'}
  ]
 },
 {
  id:'vg-cbse10-maths-trigonometric-ratios',
  sourceId:'cbse-10-mathematics',
  chapter:'Introduction to Trigonometry',
  topic:'Sine, Cosine and Tangent of an Acute Angle',
  objective:'Use opposite, adjacent and hypotenuse correctly for a selected acute angle in a right triangle.',
  videoPackName:'maths_trigonometry_ratios_TEACHER_REVIEW.mp4',
  durationDraftSeconds:150,
  storyboard:[
   'Hook: estimate a height using an angle and lengths.',
   'First select the acute reference angle theta in a right triangle.',
   'With 3-4-5 triangle label opposite=3, adjacent=4 and hypotenuse=5.',
   'Compute sin theta=3/5 as opposite divided by hypotenuse.',
   'Compute cos theta=4/5 as adjacent divided by hypotenuse.',
   'Compute tan theta=3/4 as opposite divided by adjacent.',
   'Misconception: switching acute angles changes opposite and adjacent but not hypotenuse.',
   'Practice: use 5-12-13 right triangle to find all three ratios.'
  ],
  questions:[
   {id:'vg-c10-trig-q1',question:'In a 3-4-5 right triangle with opposite=3, what is sin(theta)?',options:['3/4','4/5','3/5','5/3'],correctIndex:2,explanation:'Sine = opposite/hypotenuse = 3/5.',misconceptionCode:'RATIO_DENOMINATOR'},
   {id:'vg-c10-trig-q2',question:'For the same chosen angle, what is tan(theta)?',options:['3/5','4/5','3/4','4/3'],correctIndex:2,explanation:'Tangent = opposite/adjacent = 3/4.',misconceptionCode:'TAN_RATIO'},
   {id:'vg-c10-trig-q3',question:'If the opposite side is 5, adjacent is 12 and hypotenuse is 13, what is cos(theta)?',options:['5/13','12/13','5/12','13/12'],correctIndex:1,explanation:'Cosine = adjacent/hypotenuse = 12/13.',misconceptionCode:'COS_RATIO'}
  ]
 },
 {
  id:'vg-cbse10-science-ohms-law',
  sourceId:'cbse-10-science',
  chapter:'Electricity',
  topic:'Ohm’s Law and Simple Circuit Calculations',
  objective:'Explain current, potential difference and resistance, and calculate I, V or R using V=IR.',
  videoPackName:'science_ohms_law_TEACHER_REVIEW.mp4',
  durationDraftSeconds:156,
  storyboard:[
   'Introduce current, potential difference and resistance in a simple circuit.',
   'Define I=Q/t and units amperes; ammeter placed in series.',
   'Define potential difference and volts; voltmeter across component in parallel.',
   'Define resistance and when Ohm’s law applies (constant physical conditions).',
   'Express V=IR and rearrange to I=V/R or R=V/I.',
   'Worked example: 12 V across 4 ohms gives 3 amperes.',
   'Simple series pair: 2 ohms + 3 ohms = 5 ohms; 10 V gives 2 A.',
   'Practice: calculate current for 9 V and 3 ohms, and resistance for 6 V and 2 A.'
  ],
  questions:[
   {id:'vg-c10-ohm-q1',question:'What is the current through a 4 ohm resistor when 12 V is applied?',options:['3 A','48 A','8 A','1/3 A'],correctIndex:0,explanation:'I=V/R=12/4=3 A.',misconceptionCode:'FORMULA_REARRANGEMENT'},
   {id:'vg-c10-ohm-q2',question:'What resistance gives 2 A of current when the potential difference is 6 V?',options:['12 ohms','4 ohms','3 ohms','1/3 ohm'],correctIndex:2,explanation:'R=V/I=6/2=3 ohms.',misconceptionCode:'RATIO_DIRECTION'},
   {id:'vg-c10-ohm-q3',question:'What is the combined resistance of 2 ohms and 3 ohms connected in series?',options:['1.2 ohms','6 ohms','5 ohms','0.5 ohm'],correctIndex:2,explanation:'Series resistances add: R=2+3=5 ohms.',misconceptionCode:'SERIES_VS_PARALLEL'}
  ]
 },
 {
  id:'vg-cbse10-science-photosynthesis',
  sourceId:'cbse-10-science',
  chapter:'Life Processes',
  topic:'Photosynthesis and How Green Plants Make Food',
  objective:'Identify carbon dioxide, water, light and chlorophyll roles in photosynthesis, and distinguish mineral nutrition from food manufacture.',
  videoPackName:'science_photosynthesis_TEACHER_REVIEW.mp4',
  durationDraftSeconds:165,
  storyboard:[
   'Hook: green plants do not absorb ready-made sugars from the soil.',
   'Carbon dioxide enters leaves through stomata; roots obtain water.',
   'Chlorophyll absorbs light energy inside chloroplasts.',
   'Conceptual summary: CO2 + water + light yields organic food and oxygen.',
   'Products: sugars support metabolism and may be stored as starch.',
   'Gas exchange: guard cells regulate stomata; water vapour may leave.',
   'Misconception: soil provides minerals and water, not ready-made carbohydrate.',
   'Practice identifying inputs, chlorophyll function and gas exchange.'
  ],
  questions:[
   {id:'vg-c10-photo-q1',question:'Which pair provides raw materials for photosynthesis?',options:['Oxygen and glucose','Carbon dioxide and water','Nitrogen and starch','Soil minerals and oxygen'],correctIndex:1,explanation:'Green plants use carbon dioxide from the air and water to synthesize organic substances.',misconceptionCode:'RAW_MATERIALS'},
   {id:'vg-c10-photo-q2',question:'What is the main role of chlorophyll in photosynthesis?',options:['Absorbing light energy','Transporting water through xylem','Opening stomata','Storing protein in roots'],correctIndex:0,explanation:'Chlorophyll is the light-absorbing pigment in chloroplasts.',misconceptionCode:'CHLOROPHYLL_FUNCTION'},
   {id:'vg-c10-photo-q3',question:'Where does most of the carbon in newly synthesized plant carbohydrates originate?',options:['Soil minerals','Carbon dioxide in the air','Oxygen molecules','Groundwater only'],correctIndex:1,explanation:'Carbon fixed into plant carbohydrates is derived from carbon dioxide.',misconceptionCode:'CARBON_SOURCE'}
  ]
 }
];
