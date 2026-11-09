import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  Award, 
  User, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TeacherBatch {
  id: string;
  name: string;
  grade: number;
  board: string;
  subject: string;
  enrolledCount: number;
}

interface TeacherHomework {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  isOverdue: boolean;
  batchId: string | null;
  batchName: string;
  targetStudentId: string | null;
  targetStudentName: string | null;
  learningResources: { title: string; url: string; type: string }[];
  totalTargeted: number;
  submittedCount: number;
  reviewedCount: number;
  createdAt: string;
}

interface SubmissionRecord {
  studentId: string;
  name: string;
  enrollmentNumber: string;
  avatar?: string;
  hasSubmitted: boolean;
  submissionId: string | null;
  submissionText: string | null;
  attachmentUrl: string | null;
  status: string;
  score: number | null;
  maxScore: number;
  teacherFeedback: string;
  submittedAt: string | null;
  reviewedAt: string | null;
}

interface WeeklyAssessment {
  id: string;
  batch_id: string;
  title: string;
  subject: string;
  assessment_date: string;
  max_score: number;
  passing_score: number;
  topicsCovered: string[];
  scores_recorded_count: number;
  total_enrolled: number;
}

export const TeacherAssignmentsDesk: React.FC = () => {
  const { authToken } = useApp();
  const token = authToken || localStorage.getItem('vayentra_token');

  const [activeSection, setActiveSection] = useState<'create' | 'review' | 'assessments'>('review');
  const [batches, setBatches] = useState<TeacherBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  
  // Create Homework State
  const [targetType, setTargetType] = useState<'batch' | 'student'>('batch');
  const [targetStudentId, setTargetStudentId] = useState<string>('');
  const [studentsInBatch, setStudentsInBatch] = useState<{ id: string; name: string }[]>([]);
  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('Mathematics');
  const [hwDescription, setHwDescription] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');
  const [selectedResources, setSelectedResources] = useState<{ title: string; url: string; type: string }[]>([
    { title: 'Chapter 1: Integers & Real-World Operations', url: '/school/chapters', type: 'concept_notes' }
  ]);
  const [isSubmittingHw, setIsSubmittingHw] = useState(false);

  // Review Submissions State
  const [teacherHomeworkList, setTeacherHomeworkList] = useState<TeacherHomework[]>([]);
  const [isLoadingHw, setIsLoadingHw] = useState(false);
  const [expandedHwId, setExpandedHwId] = useState<string | null>(null);
  const [currentSubmissions, setCurrentSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [gradingDraft, setGradingDraft] = useState<Record<string, { score: string; feedback: string }>>({});
  const [isSavingGrade, setIsSavingGrade] = useState<Record<string, boolean>>({});

  // Weekly Assessments State
  const [assessments, setAssessments] = useState<WeeklyAssessment[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [showCreateAssessment, setShowCreateAssessment] = useState(false);
  const [newAssessTitle, setNewAssessTitle] = useState('');
  const [newAssessSubject, setNewAssessSubject] = useState('Mathematics');
  const [newAssessDate, setNewAssessDate] = useState('');
  const [newAssessMaxScore, setNewAssessMaxScore] = useState('50');
  const [newAssessTopics, setNewAssessTopics] = useState('Negative Integers, Distributive Law');
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);

  // Assessment Score Entry State
  const [expandedAssessId, setExpandedAssessId] = useState<string | null>(null);
  const [assessStudentScores, setAssessStudentScores] = useState<Record<string, { score: string; feedback: string; revisions: string; nextRec: string }>>({});
  const [isSavingScores, setIsSavingScores] = useState(false);

  // Notification Banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. Load Batches
  useEffect(() => {
    async function loadBatches() {
      try {
        const res = await fetch('/api/v1/attendance/batches', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setBatches(data.batches || []);
          if (data.batches && data.batches.length > 0) {
            setSelectedBatchId(data.batches[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadBatches();
  }, [token]);

  // 2. Load students in selected batch
  useEffect(() => {
    if (!selectedBatchId) return;
    async function loadBatchStudents() {
      try {
        const res = await fetch(`/api/v1/attendance/batches/${selectedBatchId}/sessions`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const sData = await res.json();
          if (sData.sessions && sData.sessions.length > 0) {
            const rosterRes = await fetch(`/api/v1/attendance/sessions/${sData.sessions[0].id}/roster`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (rosterRes.ok) {
              const rData = await rosterRes.json();
              const list = (rData.roster || []).map((r: any) => ({ id: r.studentId, name: r.name }));
              setStudentsInBatch(list);
              if (list.length > 0) setTargetStudentId(list[0].id);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadBatchStudents();
  }, [selectedBatchId, token]);

  // 3. Load Homework List for Review
  const fetchTeacherHomework = async () => {
    setIsLoadingHw(true);
    try {
      const res = await fetch('/api/v1/assignments/homework/teacher', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setTeacherHomeworkList(data.homework || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHw(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'review') {
      fetchTeacherHomework();
    }
  }, [activeSection, token]);

  // 4. Load Submissions for expanded homework
  const loadSubmissions = async (hwId: string) => {
    setIsLoadingSubs(true);
    try {
      const res = await fetch(`/api/v1/assignments/homework/${hwId}/submissions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        const subs: SubmissionRecord[] = data.submissions || [];
        setCurrentSubmissions(subs);
        const draft: Record<string, { score: string; feedback: string }> = {};
        subs.forEach(s => {
          draft[s.studentId] = {
            score: s.score !== null ? String(s.score) : '',
            feedback: s.teacherFeedback || ''
          };
        });
        setGradingDraft(draft);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSubs(false);
    }
  };

  const toggleExpandHomework = (hwId: string) => {
    if (expandedHwId === hwId) {
      setExpandedHwId(null);
    } else {
      setExpandedHwId(hwId);
      loadSubmissions(hwId);
    }
  };

  // 5. Submit Grade / Review
  const handleSaveReview = async (hwId: string, studentId: string) => {
    const draft = gradingDraft[studentId];
    if (!draft || draft.score === '') {
      setNotice({ type: 'error', message: 'Please specify a score before saving review.' });
      return;
    }

    setIsSavingGrade(prev => ({ ...prev, [studentId]: true }));
    try {
      const res = await fetch(`/api/v1/assignments/homework/${hwId}/submissions/${studentId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          score: Number(draft.score),
          teacherFeedback: draft.feedback
        })
      });
      if (!res.ok) throw new Error('Failed to commit review');
      setNotice({ type: 'success', message: 'Evaluation and constructive feedback committed to student file.' });
      loadSubmissions(hwId);
      fetchTeacherHomework();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Error saving review.' });
    } finally {
      setIsSavingGrade(prev => ({ ...prev, [studentId]: false }));
    }
  };

  // 6. Create Homework Handler
  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim() || !hwDescription.trim() || !hwDueDate) {
      setNotice({ type: 'error', message: 'Please complete all required fields (title, instructions, due date).' });
      return;
    }

    setIsSubmittingHw(true);
    try {
      const payload = {
        batchId: targetType === 'batch' ? selectedBatchId : null,
        targetStudentId: targetType === 'student' ? targetStudentId : null,
        title: hwTitle.trim(),
        subject: hwSubject,
        description: hwDescription.trim(),
        dueDate: hwDueDate,
        chapterId: 'chap-math-01',
        learningResources: selectedResources
      };

      const res = await fetch('/api/v1/assignments/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create homework.');

      setNotice({ type: 'success', message: `Homework "${hwTitle}" published to learners with authorized resources.` });
      setHwTitle('');
      setHwDescription('');
      setHwDueDate('');
      setActiveSection('review');
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to publish homework.' });
    } finally {
      setIsSubmittingHw(false);
    }
  };

  // 7. Load Weekly Assessments
  const fetchAssessments = async () => {
    if (!selectedBatchId) return;
    setIsLoadingAssessments(true);
    try {
      const res = await fetch(`/api/v1/assignments/assessments/batch/${selectedBatchId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.assessments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAssessments(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'assessments' && selectedBatchId) {
      fetchAssessments();
    }
  }, [activeSection, selectedBatchId, token]);

  // 8. Create Weekly Assessment
  const handleCreateWeeklyAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessTitle.trim() || !newAssessDate) {
      setNotice({ type: 'error', message: 'Please provide assessment title and date.' });
      return;
    }

    setIsCreatingAssessment(true);
    try {
      const topics = newAssessTopics.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/v1/assignments/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          batchId: selectedBatchId,
          title: newAssessTitle.trim(),
          subject: newAssessSubject,
          assessmentDate: newAssessDate,
          maxScore: Number(newAssessMaxScore) || 50,
          passingScore: Math.round((Number(newAssessMaxScore) || 50) * 0.7),
          topicsCovered: topics
        })
      });

      if (!res.ok) throw new Error('Failed to create assessment checkpoint.');

      setNotice({ type: 'success', message: 'Weekly concept assessment checkpoint scheduled.' });
      setShowCreateAssessment(false);
      setNewAssessTitle('');
      fetchAssessments();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Error creating assessment.' });
    } finally {
      setIsCreatingAssessment(false);
    }
  };

  // 9. Load Student Scores for Assessment
  const handleExpandAssessment = async (assessId: string) => {
    if (expandedAssessId === assessId) {
      setExpandedAssessId(null);
      return;
    }

    setExpandedAssessId(assessId);
    const initialDraft: Record<string, { score: string; feedback: string; revisions: string; nextRec: string }> = {};

    studentsInBatch.forEach(st => {
      initialDraft[st.id] = {
        score: '45',
        feedback: 'Good conceptual comprehension.',
        revisions: 'Double negative signs',
        nextRec: 'Complete 3 word problems on number lines.'
      };
    });
    setAssessStudentScores(initialDraft);
  };

  // 10. Commit Assessment Scores
  const handleSaveAssessmentScores = async (assessId: string) => {
    setIsSavingScores(true);
    try {
      const scoresPayload = Object.entries(assessStudentScores).map(([studentId, data]) => ({
        studentId,
        score: Number(data.score) || 0,
        teacherFeedback: data.feedback,
        areasNeedingRevision: data.revisions.split(',').map(s => s.trim()).filter(Boolean),
        nextLearningRecommendation: data.nextRec
      }));

      const res = await fetch(`/api/v1/assignments/assessments/${assessId}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ scores: scoresPayload })
      });

      if (!res.ok) throw new Error('Failed to record assessment scores.');
      setNotice({ type: 'success', message: `Scores and next-learning recommendations committed for ${scoresPayload.length} learners.` });
      fetchAssessments();
      setExpandedAssessId(null);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Error saving assessment scores.' });
    } finally {
      setIsSavingScores(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Sub Header & Section Navigation */}
      <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} color="var(--color-teal-primary)" />
            Faculty Homework & Concept Assessment Studio
          </div>
          <div className="t-muted">
            Assign curriculum homework, review submissions, attach learning resources, and record weekly concept mastery.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--color-paper-subtle)', borderRadius: '8px', padding: '4px' }}>
          <button
            type="button"
            className={activeSection === 'review' ? 'btn btn-teal' : 'ghost'}
            onClick={() => setActiveSection('review')}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            Review Submissions
          </button>
          <button
            type="button"
            className={activeSection === 'create' ? 'btn btn-teal' : 'ghost'}
            onClick={() => setActiveSection('create')}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            + Assign Homework
          </button>
          <button
            type="button"
            className={activeSection === 'assessments' ? 'btn btn-teal' : 'ghost'}
            onClick={() => setActiveSection('assessments')}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            Weekly Assessments
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
          {notice.type === 'success' ? <CheckCircle2 size={18} color="var(--color-success)" /> : <AlertCircle size={18} />}
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

      {/* SECTION 1: CREATE HOMEWORK */}
      {activeSection === 'create' && (
        <form onSubmit={handleCreateHomework} className="b" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '780px' }}>
          <div className="h3">Assign Homework & Attach Concept Resources</div>

          {/* Target Selector */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <strong>Assignment Target</strong>
              <select
                className="in"
                value={targetType}
                onChange={e => setTargetType(e.target.value as 'batch' | 'student')}
              >
                <option value="batch">Entire Tuition Batch</option>
                <option value="student">Individual Student (Personalized)</option>
              </select>
            </label>

            <label style={{ flex: '2 1 260px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <strong>Tuition Batch</strong>
              <select
                className="in"
                value={selectedBatchId}
                onChange={e => setSelectedBatchId(e.target.value)}
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.enrolledCount} learners)
                  </option>
                ))}
              </select>
            </label>

            {targetType === 'student' && (
              <label style={{ flex: '2 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <strong>Specific Student</strong>
                <select
                  className="in"
                  value={targetStudentId}
                  onChange={e => setTargetStudentId(e.target.value)}
                >
                  {studentsInBatch.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {/* Homework Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <strong>Homework Title</strong>
              <input
                type="text"
                className="in"
                placeholder="e.g. Integer Multiplication & Word Problems Drill"
                value={hwTitle}
                onChange={e => setHwTitle(e.target.value)}
                required
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <strong>Due Date</strong>
              <input
                type="date"
                className="in"
                value={hwDueDate}
                onChange={e => setHwDueDate(e.target.value)}
                required
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <strong>Instructions & Problem Set</strong>
            <textarea
              rows={4}
              className="in"
              style={{ resize: 'vertical' }}
              placeholder="Specify questions, working step requirements, and concept checkpoints..."
              value={hwDescription}
              onChange={e => setHwDescription(e.target.value)}
              required
            />
          </label>

          {/* Authorized Learning Resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <strong>Authorized Learning Resources Attached:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedResources.map((res, i) => (
                <span key={i} className="chip chip-teal" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <BookOpen size={14} /> {res.title}
                  <button
                    type="button"
                    onClick={() => setSelectedResources(prev => prev.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px' }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="ghost"
                onClick={() => setSelectedResources(prev => [
                  ...prev,
                  { title: 'Interactive Sign Rules Flashcards', url: '/school/practice/flashcards', type: 'flashcards' }
                ])}
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                + Attach Flashcards
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-teal" disabled={isSubmittingHw}>
              <Plus size={16} /> {isSubmittingHw ? 'Publishing Assignment...' : 'Publish Homework'}
            </button>
            <button type="button" className="ghost" onClick={() => setActiveSection('review')}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: REVIEW SUBMISSIONS */}
      {activeSection === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h3">Active Homework Assignments</div>
              <div className="t-muted" style={{ fontSize: '13px' }}>Monitor student submissions, view submitted work, and provide graded feedback</div>
            </div>
            <button type="button" className="ghost" onClick={fetchTeacherHomework} disabled={isLoadingHw}>
              ↻ Refresh
            </button>
          </div>

          {isLoadingHw ? (
            <div className="b" style={{ padding: '32px', textAlign: 'center' }}>Loading assigned homework...</div>
          ) : teacherHomeworkList.length === 0 ? (
            <div className="b t-muted" style={{ padding: '32px', textAlign: 'center' }}>
              No homework assignments created yet. Click "+ Assign Homework" to get started.
            </div>
          ) : (
            teacherHomeworkList.map(hw => {
              const isExpanded = expandedHwId === hw.id;
              return (
                <div key={hw.id} className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px' }}>{hw.title}</span>
                        {hw.isOverdue ? (
                          <span className="chip" style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px' }}>OVERDUE</span>
                        ) : (
                          <span className="chip chip-teal" style={{ fontSize: '11px' }}>ACTIVE</span>
                        )}
                      </div>
                      <div className="t-tiny" style={{ marginTop: '2px' }}>
                        {hw.batchName} · Due: {hw.dueDate} · {hw.subject}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right', fontSize: '12px' }}>
                        <div><strong>{hw.submittedCount}</strong> / {hw.totalTargeted} Submitted</div>
                        <div className="t-tiny" style={{ color: 'var(--color-teal-primary)' }}>{hw.reviewedCount} Reviewed</div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-teal"
                        onClick={() => toggleExpandHomework(hw.id)}
                        style={{ fontSize: '13px', padding: '6px 14px' }}
                      >
                        {isExpanded ? 'Hide Submissions ▲' : 'Review Submissions ▼'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Submissions Roster */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '14px', marginTop: '6px' }}>
                      {isLoadingSubs ? (
                        <div style={{ padding: '20px', textAlign: 'center' }} className="t-muted">Loading submissions...</div>
                      ) : currentSubmissions.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center' }} className="t-muted">No learners assigned to this homework.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {currentSubmissions.map(sub => (
                            <div
                              key={sub.studentId}
                              style={{
                                padding: '14px',
                                background: 'var(--color-paper-subtle)',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border-subtle)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong>{sub.name}</strong>
                                  <span className="t-tiny">({sub.enrollmentNumber || sub.studentId})</span>
                                  {sub.status === 'reviewed' ? (
                                    <span className="chip chip-teal" style={{ fontSize: '11px' }}>Reviewed (Score: {sub.score})</span>
                                  ) : sub.hasSubmitted ? (
                                    <span className="chip chip-gold" style={{ fontSize: '11px' }}>Submitted — Needs Review</span>
                                  ) : (
                                    <span className="chip" style={{ fontSize: '11px' }}>Not Yet Submitted</span>
                                  )}
                                </div>
                                {sub.submittedAt && (
                                  <span className="t-tiny">Submitted {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                )}
                              </div>

                              {sub.hasSubmitted ? (
                                <>
                                  <div style={{
                                    padding: '10px 12px',
                                    background: '#ffffff',
                                    borderRadius: '6px',
                                    border: '1px solid var(--color-border-subtle)',
                                    fontSize: '13px',
                                    lineHeight: 1.5
                                  }}>
                                    <strong>Submitted Solution:</strong>
                                    <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{sub.submissionText}</div>
                                  </div>

                                  {/* Grading Form */}
                                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                    <input
                                      type="number"
                                      className="in"
                                      placeholder="Score (0-100)"
                                      value={gradingDraft[sub.studentId]?.score || ''}
                                      onChange={e => setGradingDraft(prev => ({
                                        ...prev,
                                        [sub.studentId]: { ...prev[sub.studentId], score: e.target.value }
                                      }))}
                                      min={0}
                                      max={100}
                                    />
                                    <input
                                      type="text"
                                      className="in"
                                      placeholder="Constructive feedback for learner and parent..."
                                      value={gradingDraft[sub.studentId]?.feedback || ''}
                                      onChange={e => setGradingDraft(prev => ({
                                        ...prev,
                                        [sub.studentId]: { ...prev[sub.studentId], feedback: e.target.value }
                                      }))}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-teal"
                                      onClick={() => handleSaveReview(hw.id, sub.studentId)}
                                      disabled={isSavingGrade[sub.studentId]}
                                      style={{ fontSize: '12px', padding: '8px 14px' }}
                                    >
                                      {isSavingGrade[sub.studentId] ? 'Saving...' : 'Save Review'}
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="t-tiny" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                  Learner has not submitted their work yet.
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SECTION 3: WEEKLY CONCEPT ASSESSMENTS */}
      {activeSection === 'assessments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="h3">Weekly Concept Mastery Checkpoints</div>
              <div className="t-muted" style={{ fontSize: '13px' }}>
                Batch-level concept assessments. Record genuine scores, areas needing revision, and actionable recommendations.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                className="in"
                value={selectedBatchId}
                onChange={e => setSelectedBatchId(e.target.value)}
                style={{ minWidth: '180px' }}
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-teal"
                onClick={() => setShowCreateAssessment(!showCreateAssessment)}
                style={{ fontSize: '13px' }}
              >
                <Plus size={16} /> Schedule Checkpoint
              </button>
            </div>
          </div>

          {/* Create Assessment Form */}
          {showCreateAssessment && (
            <form onSubmit={handleCreateWeeklyAssessment} className="b" style={{ background: 'var(--color-paper-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="h3">Schedule Weekly Concept Checkpoint</div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <input
                  type="text"
                  className="in"
                  placeholder="Assessment Title (e.g. Week 4 Checkpoint: Rational Numbers Basics)"
                  value={newAssessTitle}
                  onChange={e => setNewAssessTitle(e.target.value)}
                  required
                />
                <input
                  type="date"
                  className="in"
                  value={newAssessDate}
                  onChange={e => setNewAssessDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <input
                  type="number"
                  className="in"
                  placeholder="Max Score (default 50)"
                  value={newAssessMaxScore}
                  onChange={e => setNewAssessMaxScore(e.target.value)}
                />
                <input
                  type="text"
                  className="in"
                  placeholder="Topics Covered (comma separated, e.g. Absolute Value, Number Line)"
                  value={newAssessTopics}
                  onChange={e => setNewAssessTopics(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-teal" disabled={isCreatingAssessment}>
                  {isCreatingAssessment ? 'Saving...' : 'Confirm Assessment'}
                </button>
                <button type="button" className="ghost" onClick={() => setShowCreateAssessment(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Existing Assessments List */}
          {isLoadingAssessments ? (
            <div className="b" style={{ padding: '32px', textAlign: 'center' }}>Loading assessments...</div>
          ) : assessments.length === 0 ? (
            <div className="b t-muted" style={{ padding: '32px', textAlign: 'center' }}>
              No weekly assessments recorded for this batch yet.
            </div>
          ) : (
            assessments.map(a => {
              const isExpanded = expandedAssessId === a.id;
              return (
                <div key={a.id} className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>{a.title}</div>
                      <div className="t-tiny" style={{ marginTop: '2px' }}>
                        Date: {a.assessment_date} · Max: {a.max_score} pts · Pass: {a.passing_score} pts
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {a.topicsCovered.map((t, i) => (
                          <span key={i} className="chip chip-navy" style={{ fontSize: '11px' }}>{t}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="chip chip-teal">{a.scores_recorded_count} Scores Recorded</span>
                      <button
                        type="button"
                        className="btn btn-teal"
                        onClick={() => handleExpandAssessment(a.id)}
                        style={{ fontSize: '13px', padding: '6px 14px' }}
                      >
                        {isExpanded ? 'Close Score Form ▲' : 'Enter / Edit Scores ▼'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Score Form */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '14px', marginTop: '4px' }}>
                      <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
                        Learner Scores & Actionable Pedagogy Recommendations:
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {studentsInBatch.map(st => {
                          const sDraft = assessStudentScores[st.id] || { score: '', feedback: '', revisions: '', nextRec: '' };
                          return (
                            <div
                              key={st.id}
                              style={{
                                padding: '12px',
                                background: 'var(--color-paper-subtle)',
                                borderRadius: '8px',
                                display: 'grid',
                                gridTemplateColumns: '180px 100px 1fr',
                                gap: '10px',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 600 }}>{st.name}</div>
                                <div className="t-tiny">{st.id}</div>
                              </div>

                              <input
                                type="number"
                                className="in"
                                placeholder={`/ ${a.max_score}`}
                                value={sDraft.score}
                                onChange={e => setAssessStudentScores(prev => ({
                                  ...prev,
                                  [st.id]: { ...prev[st.id], score: e.target.value }
                                }))}
                              />

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input
                                  type="text"
                                  className="in"
                                  placeholder="Teacher Feedback (e.g. Mastered integer subtraction with ease)"
                                  value={sDraft.feedback}
                                  onChange={e => setAssessStudentScores(prev => ({
                                    ...prev,
                                    [st.id]: { ...prev[st.id], feedback: e.target.value }
                                  }))}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                  <input
                                    type="text"
                                    className="in"
                                    placeholder="Areas needing revision (comma separated)"
                                    value={sDraft.revisions}
                                    onChange={e => setAssessStudentScores(prev => ({
                                      ...prev,
                                      [st.id]: { ...prev[st.id], revisions: e.target.value }
                                    }))}
                                  />
                                  <input
                                    type="text"
                                    className="in"
                                    placeholder="Actionable Next-Learning Recommendation"
                                    value={sDraft.nextRec}
                                    onChange={e => setAssessStudentScores(prev => ({
                                      ...prev,
                                      [st.id]: { ...prev[st.id], nextRec: e.target.value }
                                    }))}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ textAlign: 'right', marginTop: '14px' }}>
                        <button
                          type="button"
                          className="btn btn-teal"
                          onClick={() => handleSaveAssessmentScores(a.id)}
                          disabled={isSavingScores}
                        >
                          {isSavingScores ? 'Persisting...' : 'Commit Assessment Scores & Prescriptions'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
