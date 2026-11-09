import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  Award, 
  Send, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  Target,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LearningResource {
  title: string;
  url: string;
  type: string;
}

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  batchName: string;
  teacherName: string;
  chapterId?: string;
  learningResources: LearningResource[];
  status: 'assigned' | 'completed' | 'overdue';
  submission: {
    id: string;
    submissionText: string;
    attachmentUrl?: string;
    status: string;
    score: number | null;
    maxScore: number;
    teacherFeedback: string | null;
    submittedAt: string;
    reviewedAt: string | null;
  } | null;
}

interface SubjectMastery {
  subject: string;
  assessmentCount: number;
  averageScorePercent: number;
  masteryLevel: string;
  areasNeedingRevision: string[];
  latestRecommendation: string;
}

interface AssessmentRecord {
  id: string;
  assessmentId: string;
  title: string;
  subject: string;
  assessmentDate: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  teacherFeedback: string;
  areasNeedingRevision: string[];
  nextLearningRecommendation: string;
  teacherName: string;
  topicsCovered: string[];
  recordedAt: string;
}

interface TrackerProps {
  studentId: string;
  isStudent?: boolean;
}

export const HomeworkAndAssessmentTracker: React.FC<TrackerProps> = ({ studentId, isStudent = false }) => {
  const { authToken } = useApp();
  const token = authToken || localStorage.getItem('vayentra_token');

  const [activeTab, setActiveTab] = useState<'homework' | 'assessments'>('homework');
  const [hwFilter, setHwFilter] = useState<'all' | 'assigned' | 'completed' | 'overdue'>('all');

  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, assigned: 0, completed: 0, overdue: 0 });
  const [isLoadingHw, setIsLoadingHw] = useState(true);

  const [subjectProgress, setSubjectProgress] = useState<SubjectMastery[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentRecord[]>([]);
  const [isLoadingAssess, setIsLoadingAssess] = useState(true);

  // Submit Modal State
  const [submittingHw, setSubmittingHw] = useState<HomeworkItem | null>(null);
  const [solutionText, setSolutionText] = useState('');
  const [attachmentLink, setAttachmentLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch Student Homework
  const fetchHomework = async () => {
    if (!studentId) return;
    setIsLoadingHw(true);
    try {
      const res = await fetch(`/api/v1/assignments/homework/student/${studentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setHomeworkList(data.homework || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHw(false);
    }
  };

  // Fetch Assessment & Concept Mastery Report
  const fetchAssessments = async () => {
    if (!studentId) return;
    setIsLoadingAssess(true);
    try {
      const res = await fetch(`/api/v1/assignments/assessments/student/${studentId}/report`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setSubjectProgress(data.subjectProgress || []);
        setAssessmentHistory(data.assessmentHistory || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAssess(false);
    }
  };

  useEffect(() => {
    fetchHomework();
    fetchAssessments();
  }, [studentId, token]);

  // Submit Homework Solution
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw || !solutionText.trim()) return;

    setIsSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/v1/assignments/homework/${submittingHw.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studentId,
          submissionText: solutionText.trim(),
          attachmentUrl: attachmentLink.trim() || undefined
        })
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Submission failed.');
      }

      setNotice({ type: 'success', message: 'Solution submitted successfully for faculty review.' });
      setSubmittingHw(null);
      setSolutionText('');
      setAttachmentLink('');
      fetchHomework();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to submit.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHw = homeworkList.filter(h => {
    if (hwFilter === 'all') return true;
    return h.status === hwFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Main Switcher */}
      <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} color="var(--color-teal-primary)" />
            Homework, Assessments & Concept Mastery
          </div>
          <div className="t-muted">
            Genuine student work, teacher reviews, concept mastery ratings, and actionable next-learning recommendations.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--color-paper-subtle)', borderRadius: '8px', padding: '4px' }}>
          <button
            type="button"
            className={activeTab === 'homework' ? 'btn btn-teal' : 'ghost'}
            onClick={() => setActiveTab('homework')}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            Curriculum Homework ({summary.total})
          </button>
          <button
            type="button"
            className={activeTab === 'assessments' ? 'btn btn-teal' : 'ghost'}
            onClick={() => setActiveTab('assessments')}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            Weekly Concept Mastery ({assessmentHistory.length})
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          role="status"
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: notice.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg, #fee2e2)',
            border: `1px solid ${notice.type === 'success' ? 'var(--color-success)' : '#ef4444'}`,
            color: notice.type === 'error' ? '#b91c1c' : 'inherit'
          }}
        >
          {notice.type === 'success' ? <CheckCircle2 size={18} color="var(--color-success)" /> : <AlertTriangle size={18} />}
          <div style={{ flex: 1, fontSize: '14px' }}>{notice.message}</div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
          >
            ×
          </button>
        </div>
      )}

      {/* TAB 1: HOMEWORK LEDGER */}
      {activeTab === 'homework' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Summary Metric Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <div className="b" style={{ textAlign: 'center', padding: '12px' }}>
              <div className="t-muted" style={{ fontSize: '12px' }}>Total Assigned</div>
              <div className="h2" style={{ marginTop: '4px' }}>{summary.total}</div>
            </div>
            <div className="b" style={{ textAlign: 'center', padding: '12px' }}>
              <div className="t-muted" style={{ fontSize: '12px' }}>To Do (Pending)</div>
              <div className="h2" style={{ marginTop: '4px', color: 'var(--color-teal-primary)' }}>{summary.assigned}</div>
            </div>
            <div className="b" style={{ textAlign: 'center', padding: '12px' }}>
              <div className="t-muted" style={{ fontSize: '12px' }}>Completed Work</div>
              <div className="h2" style={{ marginTop: '4px', color: 'var(--color-success)' }}>{summary.completed}</div>
            </div>
            <div className="b" style={{ textAlign: 'center', padding: '12px' }}>
              <div className="t-muted" style={{ fontSize: '12px' }}>Overdue Tasks</div>
              <div className="h2" style={{ marginTop: '4px', color: summary.overdue > 0 ? '#e11d48' : 'inherit' }}>{summary.overdue}</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {(['all', 'assigned', 'completed', 'overdue'] as const).map(f => (
              <button
                key={f}
                type="button"
                className={hwFilter === f ? 'btn btn-teal' : 'ghost'}
                onClick={() => setHwFilter(f)}
                style={{ fontSize: '12px', padding: '6px 12px', textTransform: 'capitalize' }}
              >
                {f} {f === 'all' ? `(${summary.total})` : `(${summary[f]})`}
              </button>
            ))}
          </div>

          {/* Homework Items */}
          {isLoadingHw ? (
            <div className="b" style={{ padding: '32px', textAlign: 'center' }}>Loading assigned tasks...</div>
          ) : filteredHw.length === 0 ? (
            <div className="b t-muted" style={{ padding: '32px', textAlign: 'center' }}>
              No homework items match the selected filter.
            </div>
          ) : (
            filteredHw.map(hw => (
              <div key={hw.id} className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '16px' }}>{hw.title}</span>
                      {hw.status === 'completed' ? (
                        <span className="chip chip-success" style={{ fontSize: '11px' }}>
                          <CheckCircle2 size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          COMPLETED
                        </span>
                      ) : hw.status === 'overdue' ? (
                        <span className="chip" style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px' }}>
                          <AlertTriangle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          OVERDUE
                        </span>
                      ) : (
                        <span className="chip chip-teal" style={{ fontSize: '11px' }}>
                          <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          ASSIGNED (PENDING)
                        </span>
                      )}
                    </div>
                    <div className="t-tiny" style={{ marginTop: '2px' }}>
                      {hw.subject} · {hw.batchName} · Due: <strong>{hw.dueDate}</strong> · Teacher: {hw.teacherName}
                    </div>
                  </div>

                  {/* Action or Grade Badge */}
                  <div>
                    {hw.status === 'completed' && hw.submission?.score !== null && hw.submission?.score !== undefined ? (
                      <span className="chip chip-gold" style={{ fontSize: '14px', fontWeight: 800 }}>
                        Score: {hw.submission.score} / {hw.submission.maxScore}
                      </span>
                    ) : hw.status === 'completed' ? (
                      <span className="chip chip-teal" style={{ fontSize: '12px' }}>Submitted (Under Review)</span>
                    ) : isStudent ? (
                      <button
                        type="button"
                        className="btn btn-teal"
                        onClick={() => {
                          setSubmittingHw(hw);
                          setSolutionText('');
                        }}
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                      >
                        <Send size={14} /> Submit Work
                      </button>
                    ) : (
                      <span className="t-tiny" style={{ color: hw.status === 'overdue' ? '#b91c1c' : 'inherit' }}>
                        Awaiting student submission
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div style={{ fontSize: '14px', lineHeight: 1.5, background: 'var(--color-paper-subtle)', padding: '10px 14px', borderRadius: '6px' }}>
                  {hw.description}
                </div>

                {/* Attached Learning Resources */}
                {hw.learningResources.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="t-tiny" style={{ fontWeight: 600 }}>Authorized Study Resources:</span>
                    {hw.learningResources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        className="chip chip-navy"
                        style={{ fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <BookOpen size={12} /> {res.title} <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                )}

                {/* Completed Submission Review Box */}
                {hw.status === 'completed' && hw.submission && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--color-paper-card)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '13px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Your Submitted Solution:</strong>
                      <span className="t-tiny">Submitted on {new Date(hw.submission.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-ink)' }}>{hw.submission.submissionText}</div>

                    {hw.submission.teacherFeedback && (
                      <div style={{
                        marginTop: '6px',
                        padding: '8px 12px',
                        background: 'var(--color-success-bg)',
                        borderLeft: '3px solid var(--color-success)',
                        borderRadius: '4px'
                      }}>
                        <strong style={{ color: 'var(--color-success)' }}>Teacher Evaluation & Guidance:</strong>
                        <div style={{ marginTop: '2px' }}>{hw.submission.teacherFeedback}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: WEEKLY CONCEPT ASSESSMENTS & ACTIONABLE MASTERY */}
      {activeTab === 'assessments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Subject-Wise Mastery Progress Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="h3" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={18} color="var(--color-teal-primary)" />
              Subject-Wise Concept Mastery Progress
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {isLoadingAssess ? (
                <div className="b" style={{ padding: '24px', textAlign: 'center' }}>Evaluating concept checkpoints...</div>
              ) : subjectProgress.length === 0 ? (
                <div className="b t-muted" style={{ padding: '24px', textAlign: 'center' }}>
                  No weekly concept checkpoints recorded yet.
                </div>
              ) : (
                subjectProgress.map(sp => (
                  <div key={sp.subject} className="b" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>{sp.subject}</div>
                      <span className={`chip ${sp.masteryLevel === 'Concept Mastered' ? 'chip-success' : sp.masteryLevel === 'Developing Proficiency' ? 'chip-teal' : 'chip-gold'}`}>
                        {sp.masteryLevel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <div className="h1" style={{ fontSize: '28px', color: 'var(--color-teal-primary)' }}>
                        {sp.averageScorePercent}%
                      </div>
                      <span className="t-tiny">Average Across {sp.assessmentCount} Weekly Checkpoints</span>
                    </div>

                    {/* Areas Needing Revision */}
                    {sp.areasNeedingRevision.length > 0 && (
                      <div style={{ fontSize: '12px' }}>
                        <div style={{ color: 'var(--color-saffron)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <RotateCcw size={13} /> Target Revision Topics:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {sp.areasNeedingRevision.map((rev, idx) => (
                            <span key={idx} className="chip" style={{ fontSize: '11px', background: 'var(--color-paper-subtle)' }}>
                              {rev}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actionable Next-Learning Recommendation */}
                    <div style={{
                      marginTop: 'auto',
                      padding: '10px 12px',
                      background: 'var(--color-gold-light)',
                      border: '1px solid var(--color-gold-border)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-navy-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={14} color="var(--color-gold-primary)" /> Actionable Next-Learning Prescription:
                      </div>
                      <div style={{ marginTop: '2px', color: 'var(--color-ink)' }}>{sp.latestRecommendation}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chronological Preserved Assessment History */}
          <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div className="h3">Preserved Assessment History & Genuine Scores</div>
              <div className="t-muted" style={{ fontSize: '12px' }}>Chronological timeline of faculty-evaluated weekly checkpoints</div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--color-paper-subtle)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <th style={{ padding: '12px 16px' }}>Assessment Date</th>
                    <th style={{ padding: '12px 16px' }}>Checkpoint Title</th>
                    <th style={{ padding: '12px 16px' }}>Subject</th>
                    <th style={{ padding: '12px 16px' }}>Score</th>
                    <th style={{ padding: '12px 16px' }}>Evaluation & Feedback</th>
                    <th style={{ padding: '12px 16px' }}>Prescription</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingAssess ? (
                    <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center' }} className="t-muted">Loading history...</td></tr>
                  ) : assessmentHistory.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center' }} className="t-muted">No assessment records found.</td></tr>
                  ) : (
                    assessmentHistory.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{a.assessmentDate}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{a.title}</div>
                          <div className="t-tiny">{a.topicsCovered.join(', ')}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{a.subject}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <strong style={{ color: a.passed ? 'var(--color-teal-primary)' : 'var(--color-saffron)' }}>
                            {a.score} / {a.maxScore} ({a.percentage}%)
                          </strong>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>{a.teacherFeedback}</div>
                          {a.areasNeedingRevision.length > 0 && (
                            <div className="t-tiny" style={{ color: '#e11d48', marginTop: '2px' }}>
                              Needs work: {a.areasNeedingRevision.join(', ')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="t-tiny" style={{ fontStyle: 'italic' }}>
                            {a.nextLearningRecommendation}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* STUDENT SUBMIT WORK MODAL */}
      {submittingHw && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <form
            onSubmit={handleSubmitWork}
            className="b"
            style={{
              background: 'var(--color-paper-card)',
              maxWidth: '600px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="h3">Submit Solution: {submittingHw.title}</div>
              <button
                type="button"
                className="ghost"
                onClick={() => setSubmittingHw(null)}
                style={{ padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '13px', background: 'var(--color-paper-subtle)', padding: '10px', borderRadius: '6px' }}>
              <strong>Instructions:</strong> {submittingHw.description}
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <strong>Your Working Steps & Answers</strong>
              <textarea
                rows={5}
                className="in"
                placeholder="Type your complete solution steps, proofs, and working equations here..."
                value={solutionText}
                onChange={e => setSolutionText(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <strong>Optional Notebook Photo / Document Link</strong>
              <input
                type="text"
                className="in"
                placeholder="https://drive.google.com/... or uploaded work link"
                value={attachmentLink}
                onChange={e => setAttachmentLink(e.target.value)}
              />
            </label>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="button" className="ghost" onClick={() => setSubmittingHw(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-teal" disabled={isSubmitting || !solutionText.trim()}>
                <Send size={16} /> {isSubmitting ? 'Submitting Solution...' : 'Submit to Faculty'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
