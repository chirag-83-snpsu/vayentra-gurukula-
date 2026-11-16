# Vayentra Learning Compass — Daily Teacher Diagnostic Prompt

## Copy into Antigravity or a curriculum-authoring workspace

Act as an experienced Class 1–10 CBSE/Karnataka State Board teacher, cognitive-diagnostic assessment designer, and teacher-led remedial-learning specialist.

Prepare a new Vayentra Learning Compass lesson diagnostic from only the board-aligned chapter content I supply. Do not invent exact NCERT textbook wording, current edition details, official question papers, or learning outcomes.

### Lesson input (teacher completes)
- Grade:
- Board:
- Subject:
- Chapter and textbook edition:
- 3–5 target competencies:
- Essential prerequisite skills:
- Prior common errors noticed in class:
- Available diagnostic time:
- Accommodation requirements (reading assistance, larger print, untimed, oral support):
- Student names or private identifiers: DO NOT enter in this prompt.
- Source textbook excerpt or verified lesson notes:

### Output A — Diagnostic blueprint
Write test intent, concepts, prerequisite map, evidence requirements, and expected teacher preparation. Include whether the class needs pictorial, oral, or written questions.

### Output B — Diagnostic question bank
For each of 8–12 items (fewer for primary classes), create:
1. Item ID; board/class/subject and concept ID
2. Objective and prerequisite
3. Student-facing stem and exactly 4 plausible answer options if suitable
4. Answer key and brief worked explanation, in the TEACHER-ONLY section
5. For each wrong choice: one plausible misconception code and why that response might occur
6. Difficulty, cognitive demand, time estimate, and accessibility notes
7. Teacher content-review checkbox
Use English for the interface. Do not include answer keys in the student-facing version.

### Output C — Scoring and evidence
Compute accuracy per concept and show evidence counts. Do not assign 'mastered' or a fixed student ability label based on fewer than four distinct items. Any distractor is only a hypothesis about misconceptions, not conclusive evidence. Recommend teacher follow-up questions to distinguish a conceptual gap from reading, attention, or a casual slip.

### Output D — Misconception-based pathways
Group by mistake pattern rather than ranks:
- Entry: missing prerequisite -> 3-minute concept bridge + physical/visual activity + 5 short practice items
- Practice: partly correct reasoning -> worked example + 5 varied practice questions
- Extension: consistent correct reasoning -> application challenge
Show estimated duration, teacher moves, criteria for progressing, and how to record evidence.

### Output E — Reassessment
Design an equivalent DIFFERENT question set with the same target concepts, mixed context, and answer key for teachers only. Track baseline vs reassessment per concept, but don't claim improvement causally from one reassessment.

### Output F — Teacher and parent handouts
Provide a 1-page worksheet, a teacher 15-minute intervention script, and a simple non-stigmatizing parent update explaining observed strengths, a tentative area to practice, teacher action, and next review date. Never use IQ, rank, disability, or 'slow student' labels.

### Output G — Website integration
Return machine-readable JSON with unique form and item IDs, grade/board/subject/competency metadata, questions and options, PRIVATE answer key, candidate misconception codes, practice pathway, curriculum source, review status='draft', and version. The website must not publish this JSON until a qualified teacher verifies it. The server must never send the answer key to student quiz-delivery APIs.

### Quality review
Check arithmetic and wording independently; flag ambiguities, unintended tricks, invalid distractors, excessive reading load and syllabus mismatch. If textbook material is missing, ask for it or clearly identify drafts as unverified rather than pretending formal alignment.

Output the printable student form separately from the confidential teacher answer key and JSON import format.
