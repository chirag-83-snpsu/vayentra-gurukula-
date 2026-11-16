import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeConceptEvidence } from '../services/diagnosticRules.js';

test('groups by underlying concept rather than total student score', () => {
  const result = summarizeConceptEvidence([
    { concept_id: 'integer-signs', is_correct: 0, misconception_code: 'DOUBLE_NEGATIVE' },
    { concept_id: 'integer-signs', is_correct: 1, misconception_code: null },
    { concept_id: 'equation-formation', is_correct: 1, misconception_code: null }
  ]);
  assert.equal(result.length, 2);
  assert.deepEqual(result[0].misconceptions, { DOUBLE_NEGATIVE: 1 });
  assert.equal(result[0].accuracy, 50);
  assert.equal(result[0].pathway, 'teacher_review_required');
});

test('insufficient items are clearly flagged rather than called mastery', () => {
  const result = summarizeConceptEvidence([
    { concept_id: 'integer-signs', is_correct: 1 },
    { concept_id: 'integer-signs', is_correct: 1 }
  ]);
  assert.equal(result[0].accuracy, 100);
  assert.equal(result[0].evidence, 'insufficient_items_for_confident_inference');
  assert.equal(result[0].pathway, 'consider_extension_after_review');
});

test('incorrect response does not count empty misconception code', () => {
  const result = summarizeConceptEvidence([
    { concept_id: 'order-of-operations', is_correct: 0, misconception_code: '' }
  ]);
  assert.deepEqual(result[0].misconceptions, {});
});

test('empty input produces an empty summary', () => {
  assert.deepEqual(summarizeConceptEvidence([]), []);
});

test('malformed correctness values are rejected', () => {
  assert.throws(() => summarizeConceptEvidence([{ concept_id: 'x', is_correct: 2 }]), TypeError);
});
