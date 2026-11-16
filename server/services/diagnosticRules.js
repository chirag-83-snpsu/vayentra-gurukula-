// Transparent, deterministic diagnostic aggregation. Never label a learner by ability.
export function summarizeConceptEvidence(rows) {
  if (!Array.isArray(rows)) throw new TypeError('rows must be an array');
  const groups = new Map();
  for (const row of rows) {
    if (!row || typeof row.concept_id !== 'string' || row.concept_id.length === 0)
      throw new TypeError('Every response needs a concept id');
    if (row.is_correct !== 0 && row.is_correct !== 1)
      throw new TypeError('is_correct must be 0 or 1');
    if (!groups.has(row.concept_id)) groups.set(row.concept_id, {
      conceptId: row.concept_id, correct: 0, total: 0, misconceptions: {}
    });
    const group = groups.get(row.concept_id);
    group.total += 1;
    group.correct += row.is_correct;
    if (!row.is_correct && typeof row.misconception_code === 'string' && row.misconception_code) {
      group.misconceptions[row.misconception_code] = (group.misconceptions[row.misconception_code] || 0) + 1;
    }
  }
  return [...groups.values()].map(group => ({
    ...group,
    accuracy: Math.round(100 * group.correct / group.total),
    // Fewer than four distinct items provide limited evidence. This is NOT a psychometric diagnosis.
    evidence: group.total < 4 ? 'insufficient_items_for_confident_inference' : 'requires_teacher_review',
    pathway: group.correct === group.total ? 'consider_extension_after_review' : 'teacher_review_required'
  }));
}
