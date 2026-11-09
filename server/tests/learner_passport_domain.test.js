import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEnrolmentDraft,planGradeTransition,validatePrivatePricePlan,calculateAcademicResult,canAccessPaidLesson} from '../domain/learnerPassport.js';

test('validates CBSE and Karnataka enrolments by year',()=>{
 assert.equal(validateEnrolmentDraft({grade:4,board:'CBSE',academicYearId:'2026-27'}).valid,true);
 assert.equal(validateEnrolmentDraft({grade:5,board:'STATE',academicYearId:'2026-27'}).valid,true);
 assert.equal(validateEnrolmentDraft({grade:11,board:'CBSE',academicYearId:'2026-27'}).valid,false);
 assert.equal(validateEnrolmentDraft({grade:4,board:'ICSE',academicYearId:'2026-27'}).valid,false);
});
const previous={learnerId:'student-A',grade:4,board:'CBSE',academicYearId:'2026-27',status:'active'};
test('grade promotion preserves learner identity and requires a new academic year',()=>{
 const r=planGradeTransition(previous,{learnerId:'student-A',grade:5,board:'CBSE',academicYearId:'2027-28'});
 assert.deepEqual(r,{allowed:true,kind:'promotion'});
 assert.equal(planGradeTransition(previous,{learnerId:'student-B',grade:5,board:'CBSE',academicYearId:'2027-28'}).allowed,false);
 assert.equal(planGradeTransition(previous,{learnerId:'student-A',grade:5,board:'CBSE',academicYearId:'2026-27'}).allowed,false);
});
test('repeat needs review; grade skipping or silent regression is blocked',()=>{
 const repeat=planGradeTransition(previous,{learnerId:'student-A',grade:4,board:'STATE',academicYearId:'2027-28'});
 assert.equal(repeat.requiresReview,true);
 assert.equal(planGradeTransition(previous,{learnerId:'student-A',grade:6,board:'STATE',academicYearId:'2027-28'}).allowed,false);
 assert.equal(planGradeTransition(previous,{learnerId:'student-A',grade:3,board:'STATE',academicYearId:'2027-28'}).allowed,false);
});
test('price must be private, explicitly intervalled and linked to approved terms',()=>{
 assert.equal(validatePrivatePricePlan({amountPaise:59900,termsVersion:'v1.0'}).valid,false);
 assert.equal(validatePrivatePricePlan({amountPaise:59900,interval:'annual',termsVersion:'v1.0'}).valid,true);
 assert.equal(validatePrivatePricePlan({amountPaise:-1,interval:'annual',termsVersion:'v1.0'}).valid,false);
});
test('mark card percentage only from validated, verified marks and correct denominators',()=>{
 assert.deepEqual(calculateAcademicResult([{scored:75,maximum:100,verified:true},{scored:40,maximum:50,verified:true}]),
 {valid:true,scored:115,maximum:150,percentage:76.67});
 assert.equal(calculateAcademicResult([{scored:90,maximum:100,verified:false}]).valid,false);
 assert.equal(calculateAcademicResult([{scored:110,maximum:100,verified:true}]).valid,false);
});
test('membership identity alone cannot unlock expired paid content',()=>{
 assert.equal(canAccessPaidLesson({membershipState:'active',entitlementEndsAt:'2026-12-01T00:00:00Z',now:'2026-11-09T00:00:00Z'}),true);
 assert.equal(canAccessPaidLesson({membershipState:'active',entitlementEndsAt:'2026-10-01T00:00:00Z',now:'2026-11-09T00:00:00Z'}),false);
 assert.equal(canAccessPaidLesson({membershipState:'expired',entitlementEndsAt:'2027-01-01T00:00:00Z',now:'2026-11-09T00:00:00Z'}),false);
});
