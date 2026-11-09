/**
 * CBSE Class 1–10 initial subject navigation.
 * NOT an official NCERT textbook inventory. Academic reviewers must confirm
 * the current titles, edition and chapters for the academic year.
 * Every entry refers to the same official publisher lookup (not a licensed copy).
 */
export const CBSE_SUBJECTS_BY_GRADE = Object.freeze({
  1: ['Mathematics', 'English', 'Hindi'],
  2: ['Mathematics', 'English', 'Hindi'],
  3: ['Mathematics', 'English', 'Hindi', 'Environmental Studies'],
  4: ['Mathematics', 'English', 'Hindi', 'Environmental Studies'],
  5: ['Mathematics', 'English', 'Hindi', 'Environmental Studies'],
  6: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
  7: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
  8: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
  9: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
  10: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit']
});
export const OFFICIAL_NCERT_REFERENCES = Object.freeze([
  {id:'ncert-textbooks',publisher:'NCERT',name:'Official NCERT Textbooks (I–XII)',domain:'ncert.nic.in',url:'https://ncert.nic.in/textbook.php',kind:'textbook_catalogue'},
  {id:'ncert-epathshala',publisher:'NCERT / CIET',name:'ePathshala',domain:'epathshala.ncert.gov.in',url:'https://epathshala.ncert.gov.in/',kind:'educational_resources'},
  {id:'diksha-ncert',publisher:'NCERT / Ministry of Education',name:'DIKSHA Educational Resources',domain:'diksha.gov.in',url:'https://diksha.gov.in/',kind:'digital_learning'}
]);
export const classGrades=Array.from({length:10},(_,i)=>i+1);
export const classSubjectCatalogue=()=>classGrades.map(grade=>({
  grade,board:'CBSE',subjects:CBSE_SUBJECTS_BY_GRADE[grade],
  mappingStatus:'pending_academic_verification',
  sourcePublisher:'NCERT',
  sourceStatus:'reference_only_permission_pending'
}));
