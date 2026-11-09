/**
 * ORIGINAL Vayentra Class 10 lesson scripts, built for educator review.
 * Curriculum reference: CBSE Class X 2026–27 mathematics and science.
 * No NCERT textbook text, art, pages or third-party video are reproduced.
 * These lessons are drafts; publication requires human academic review.
 */
export const CLASS10_PILOT_LESSONS = [
  {
    topicId:'vg-cbse10-maths-quadratic-factorisation',
    sourceId:'cbse-10-mathematics',
    subject:'Mathematics',
    chapterTitle:'Quadratic Equations',
    topicTitle:'Solving Quadratic Equations by Factorisation',
    learningObjective:'Identify roots of a quadratic equation by factorisation and verify solutions by substitution.',
    sourceReference:{
      publisher:'CBSE Academic / NCERT',
      curriculumYear:'2026-27',
      officialCurriculum:'https://cbseacademic.nic.in/curriculum_2027.html',
      publisherPortal:'https://ncert.nic.in/textbook.php',
      status:'reference_only_teacher_validation_required'
    },
    scenes:[
      {title:'Can two numbers solve one equation?',visual:'x² − 5x + 6 = 0',caption:'FIND THE VALUES OF x',
       narration:'Welcome to Vayentra Gurukula. Today we will solve quadratic equations by factorisation. A quadratic equation contains an x squared term. It can have two real solutions, one repeated solution, or no real solutions. Let us discover the roots by thinking about factors.'},
      {title:'What does a root mean?',visual:'x² − 5x + 6 = 0',caption:'A ROOT MAKES THE LEFT SIDE ZERO',
       narration:'A root is a value of x that makes the equation true. For example, when x equals two, four minus ten plus six is zero. When x equals three, nine minus fifteen plus six is also zero. We will now find both roots systematically, without guessing.'},
      {title:'Find the factor pair',visual:'6 = (−2) × (−3)',caption:'MULTIPLY TO +6  •  ADD TO −5',
       narration:'Look at the constant six and the coefficient minus five. We need two numbers that multiply to positive six and add to negative five. Negative two and negative three work. Their product is positive six, and their sum is negative five.'},
      {title:'Write the factorised form',visual:'(x − 2)(x − 3) = 0',caption:'TWO LINEAR FACTORS',
       narration:'Now write x squared minus five x plus six as the product x minus two and x minus three. You can expand these brackets to check the middle term. Since the product equals zero, at least one of the two factors must be zero.'},
      {title:'Apply the zero-product rule',visual:'x − 2 = 0   OR   x − 3 = 0',caption:'ROOTS: x = 2 AND x = 3',
       narration:'This gives two smaller equations: x minus two equals zero, or x minus three equals zero. Therefore x equals two or x equals three. Both values solve the original quadratic equation. Remember that each factor gives a possible root.'},
      {title:'A second worked example',visual:'2x² − 7x + 3 = 0',caption:'SPLIT −7x INTO −6x − x',
       narration:'Let us solve two x squared minus seven x plus three equals zero. Multiply the leading coefficient two by the constant three to get six. We need two terms multiplying to positive six and adding to negative seven: minus six and minus one.'},
      {title:'Factor by grouping',visual:'(2x − 1)(x − 3) = 0',caption:'ROOTS: x = ½ AND x = 3',
       narration:'Rewrite the middle term as minus six x minus x. Group the expression as two x times x minus three, minus one times x minus three. Take the common bracket. We obtain two x minus one times x minus three. The roots are one half and three.'},
      {title:'Avoid the sign trap',visual:'(x + 2)(x + 3) ≠ x² − 5x + 6',caption:'CHECK THE MIDDLE TERM',
       narration:'A common mistake is choosing positive two and positive three only because their product is six. That gives a positive five x term, not negative five x. Always check both the product and the sum. Finally, substitute each root into the original equation to confirm it.'},
      {title:'Your three-question concept check',visual:'x² − 7x + 10 = 0',caption:'PAUSE • SOLVE • EXPLAIN',
       narration:'Now pause and solve x squared minus seven x plus ten equals zero. Which two numbers multiply to ten and add to minus seven? Explain why your answer is correct. Then try x squared plus three x plus two equals zero, and x squared minus nine equals zero. Discuss any errors with your teacher.'},
      {title:'Recap and Learning Compass',visual:'FACTORS → ROOTS → CHECK',caption:'LEARN THE REASON, NOT JUST THE RULE',
       narration:'Today you learned to choose the factor pair, apply the zero-product rule, and verify both roots. If finding the correct signs was difficult, ask your Vayentra teacher for a sign-pattern exercise. Your next step is a short diagnostic and targeted practice, not more memorisation.'}
    ],
    quiz:[
      {id:'vg-c10-m-q1',question:'Solve x² − 7x + 10 = 0.',options:['x = 2 or 5','x = −2 or −5','x = 1 or 10','x = −1 or −10'],correctIndex:0,
       explanation:'(x − 2)(x − 5) = 0, so x = 2 or x = 5.',misconceptionCode:'FACTOR_SIGN'},
      {id:'vg-c10-m-q2',question:'What are the roots of x² + 3x + 2 = 0?',options:['1 and 2','−1 and −2','−1 and 2','1 and −2'],correctIndex:1,
       explanation:'(x + 1)(x + 2) = 0, so the roots are −1 and −2.',misconceptionCode:'ROOT_SIGN'},
      {id:'vg-c10-m-q3',question:'Which equation has roots 3 and ½?',options:['(2x − 1)(x − 3) = 0','(2x + 1)(x + 3) = 0','(x − 1)(x − 3) = 0','(2x − 3)(x − 1) = 0'],correctIndex:0,
       explanation:'2x − 1 = 0 gives x = ½, and x − 3 = 0 gives x = 3.',misconceptionCode:'FACTOR_ROOT_LINK'}
    ],
    followUp:'Teacher: ask the student to explain product/sum signs, solve two new factorizations and verify with substitution.',
    rights:'Original script. No NCERT textbook pages, diagrams or copyrighted media are used.'
  },
  {
    topicId:'vg-cbse10-science-balancing-equations',
    sourceId:'cbse-10-science',
    subject:'Science',
    chapterTitle:'Chemical Reactions and Equations',
    topicTitle:'Balancing Chemical Equations',
    learningObjective:'Balance common chemical equations by conserving each type of atom, without changing chemical formulae.',
    sourceReference:{
      publisher:'CBSE Academic / NCERT',
      curriculumYear:'2026-27',
      officialCurriculum:'https://cbseacademic.nic.in/curriculum_2027.html',
      publisherPortal:'https://ncert.nic.in/textbook.php',
      status:'reference_only_teacher_validation_required'
    },
    scenes:[
      {title:'Why balance an equation?',visual:'H₂ + O₂ → H₂O',caption:'COUNT ATOMS ON BOTH SIDES',
       narration:'Welcome to Vayentra Gurukula Science. A chemical equation tells us which reactants become products. But written formulae alone may not show the correct number of particles involved. We balance equations because atoms are conserved in ordinary chemical reactions. Let us use simple coloured atom models.'},
      {title:'Count hydrogen and oxygen',visual:'LEFT: H = 2, O = 2',caption:'RIGHT: H = 2, O = 1',
       narration:'Start with hydrogen gas plus oxygen gas making water. On the left there are two hydrogen atoms and two oxygen atoms. On the right a single water molecule has two hydrogen atoms and one oxygen atom. Oxygen is not balanced. We must change the coefficients, not the substance.'},
      {title:'Put a 2 before water',visual:'H₂ + O₂ → 2H₂O',caption:'RIGHT: H = 4, O = 2',
       narration:'Put the coefficient two in front of water. That means two entire water molecules. Now the right side has four hydrogen atoms and two oxygen atoms. Oxygen is balanced, but hydrogen is not. Remember that a coefficient multiplies the whole formula after it.'},
      {title:'Balance hydrogen',visual:'2H₂ + O₂ → 2H₂O',caption:'LEFT AND RIGHT: H = 4, O = 2',
       narration:'Place a two before hydrogen gas on the left. Both sides now have four hydrogen atoms and two oxygen atoms. The equation is balanced. Say it clearly: two molecules of hydrogen react with one molecule of oxygen to form two molecules of water, as represented in this model.'},
      {title:'Never change the subscripts',visual:'2H₂O  ≠  H₂O₂',caption:'COEFFICIENTS CHANGE AMOUNT, NOT IDENTITY',
       narration:'Here is the most important warning. Two H two O means two water molecules. H two O two is a different substance, hydrogen peroxide. Changing the small subscript numbers changes the chemical identity. To balance equations, adjust the large coefficients in front of complete formulae.'},
      {title:'A second reaction: magnesium',visual:'Mg + O₂ → MgO',caption:'CHECK THE OXYGEN FIRST',
       narration:'Consider magnesium reacting with oxygen to form magnesium oxide. On the left the oxygen molecule contains two oxygen atoms. On the right magnesium oxide contains one oxygen atom per unit. Put a two before magnesium oxide so there are two oxygen atoms on the product side.'},
      {title:'Finish magnesium balancing',visual:'2Mg + O₂ → 2MgO',caption:'Mg = 2, O = 2 ON BOTH SIDES',
       narration:'Now the right side has two magnesium atoms, but the left has only one. Place a two before magnesium. The balanced equation is two M G plus O two gives two M G O. Count again: two magnesium atoms and two oxygen atoms on each side.'},
      {title:'Use a conservation checklist',visual:'ELEMENT → LEFT COUNT → RIGHT COUNT',caption:'RECOUNT AFTER EACH COEFFICIENT',
       narration:'When an equation feels difficult, list each element in a small table. Count the atoms on the left and the right. Adjust one coefficient, then recount every element because a change can affect several atom totals. For more complex equations, balance elements that appear in fewer substances first.'},
      {title:'Your three-question concept check',visual:'Fe + O₂ → Fe₂O₃',caption:'PAUSE • BALANCE • EXPLAIN',
       narration:'Pause and try balancing iron with oxygen to make iron three oxide. Then balance sodium with chlorine to make sodium chloride. Finally, explain why changing H two O into H two O two is not an acceptable balancing step. Your teacher will check your reasoning, not only your coefficients.'},
      {title:'Recap and learning intervention',visual:'COUNT → COEFFICIENTS → RECOUNT',caption:'ATOM CONSERVATION BUILDS UNDERSTANDING',
       narration:'To balance a chemical equation, count each kind of atom on both sides, adjust the coefficients, and check again. Never change a formula subscript. If you are unsure, draw particle circles before doing any arithmetic. Your next Learning Compass check will identify which step needs more practice.'}
    ],
    quiz:[
      {id:'vg-c10-s-q1',question:'Choose the balanced equation for hydrogen and oxygen forming water.',options:['H₂ + O₂ → H₂O','2H₂ + O₂ → 2H₂O','H₂ + 2O₂ → H₂O','2H₂ + 2O₂ → H₂O'],correctIndex:1,
       explanation:'2H₂ + O₂ → 2H₂O has H = 4 and O = 2 on both sides.',misconceptionCode:'ATOM_COUNT'},
      {id:'vg-c10-s-q2',question:'Balance Mg + O₂ → MgO.',options:['Mg + O₂ → 2MgO','2Mg + O₂ → 2MgO','2Mg + 2O₂ → MgO','Mg + O₂ → Mg₂O'],correctIndex:1,
       explanation:'2Mg + O₂ → 2MgO conserves 2 Mg atoms and 2 O atoms.',misconceptionCode:'COEFFICIENT_COUNT'},
      {id:'vg-c10-s-q3',question:'Why must we not replace H₂O with H₂O₂ when balancing?',options:['It increases temperature','It creates a different chemical substance','It changes water into a gas','It removes the need for coefficients'],correctIndex:1,
       explanation:'Subscripts specify the chemical formula. H₂O₂ is hydrogen peroxide, not water.',misconceptionCode:'COEFFICIENT_VS_SUBSCRIPT'}
    ],
    followUp:'Teacher: use coloured counters for H and O, then ask for a particle-count table and two new equations.',
    rights:'Original script. No NCERT textbook pages, diagrams or copyrighted media are used.'
  }
];
