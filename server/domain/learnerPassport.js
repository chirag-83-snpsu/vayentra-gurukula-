/**
 * Learner Passport domain policies: pure, backend-independent validation.
 * No PII, DB updates or pricing assumptions live here.
 * The server MUST authorise guardian/staff and run grade promotions transactionally.
 */
export const BOARDS=Object.freeze(['CBSE','STATE']);
export const GRADE_MIN=1;
export const GRADE_MAX=10;
export const PLAN_INTERVALS=Object.freeze(['one_time','monthly','annual','academic_year']);

export function validateEnrolmentDraft(input){
 if(!input || typeof input!=='object')return {valid:false,reason:'ENROLMENT_REQUIRED'};
 if(!Number.isInteger(input.grade)||input.grade<1||input.grade>10)
  return {valid:false,reason:'GRADE_OUT_OF_RANGE'};
 if(!BOARDS.includes(input.board))return {valid:false,reason:'UNSUPPORTED_BOARD'};
 if(typeof input.academicYearId!=='string'||input.academicYearId.trim().length===0)
  return {valid:false,reason:'ACADEMIC_YEAR_REQUIRED'};
 return {valid:true};
}
export function planGradeTransition(current,proposal){
 const a=validateEnrolmentDraft(current), b=validateEnrolmentDraft(proposal);
 if(!a.valid)return {allowed:false,reason:'INVALID_CURRENT_'+a.reason};
 if(!b.valid)return {allowed:false,reason:'INVALID_NEW_'+b.reason};
 if(current.academicYearId===proposal.academicYearId)
  return {allowed:false,reason:'YEAR_MUST_CHANGE'};
 if(typeof current.learnerId!=='string'||!current.learnerId.trim())
  return {allowed:false,reason:'LEARNER_ID_REQUIRED'};
 if(proposal.learnerId!==current.learnerId)
  return {allowed:false,reason:'LEARNER_ID_CANNOT_CHANGE'};
 if(current.status!=='active')return {allowed:false,reason:'CURRENT_NOT_ACTIVE'};
 if(proposal.grade===current.grade+1)return {allowed:true,kind:'promotion'};
 if(proposal.grade===current.grade)return {allowed:true,kind:'repeat_requires_staff_review',requiresReview:true};
 if(proposal.grade>current.grade+1)return {allowed:false,reason:'SKIPPED_GRADE_REQUIRES_SEPARATE_VERIFICATION'};
 return {allowed:false,reason:'GRADE_REGRESSION_REQUIRES_SEPARATE_CORRECTION'};
}
export function validatePrivatePricePlan(plan){
 if(!plan||typeof plan!=='object')return {valid:false,reason:'PLAN_REQUIRED'};
 if(!Number.isInteger(plan.amountPaise)||plan.amountPaise<=0)return {valid:false,reason:'AMOUNT_REQUIRED'};
 if(!PLAN_INTERVALS.includes(plan.interval))return {valid:false,reason:'EXPLICIT_INTERVAL_REQUIRED'};
 if(typeof plan.termsVersion!=='string'||plan.termsVersion.trim().length<3)
  return {valid:false,reason:'TERMS_VERSION_REQUIRED'};
 if(plan.grandfatheredUntilGrade!==undefined&&(!Number.isInteger(plan.grandfatheredUntilGrade)||plan.grandfatheredUntilGrade<1||plan.grandfatheredUntilGrade>10))
  return {valid:false,reason:'INVALID_GRADE_CEILING'};
 return {valid:true};
}
export function calculateAcademicResult(entries){
 if(!Array.isArray(entries)||entries.length===0)return {valid:false,reason:'NO_MARKS'};
 let achieved=0,possible=0;
 for(const item of entries){
  if(item?.verified!==true)return {valid:false,reason:'UNVERIFIED_SUBJECT_MARKS'};
  if(!Number.isFinite(item.scored)||!Number.isFinite(item.maximum)||item.maximum<=0||item.scored<0||item.scored>item.maximum)
   return {valid:false,reason:'INVALID_MARKS'};
  achieved+=item.scored;possible+=item.maximum;
 }
 return {valid:true,scored:achieved,maximum:possible,percentage:Number((achieved/possible*100).toFixed(2))};
}
/** Never infer entitlement solely from enrollment state or a client Boolean. */
export function canAccessPaidLesson({membershipState,entitlementEndsAt,now}){
 if(membershipState!=='active'||typeof entitlementEndsAt!=='string')return false;
 const ends=Date.parse(entitlementEndsAt),current=Date.parse(now);
 return Number.isFinite(ends)&&Number.isFinite(current)&&ends>current;
}
