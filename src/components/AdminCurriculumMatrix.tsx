import React, { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  Award,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface MatrixItem {
  class: number;
  board: string;
  trackId: string;
  editionYear: string;
  catalogueStatus: string;
  subjectId: string;
  subject: string;
  subjectReviewStatus: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  textbookEdition: string;
  reviewStatus: string;
  publicationStatus: string;
  conceptsCount: number;
  publishedConceptsCount: number;
  unitsCount: number;
  publishedUnitsCount: number;
  questionsCount: number;
  contentCompletion: number;
  assessmentReadiness: 'ready' | 'partial' | 'no_questions';
  isMissing: boolean;
}

export interface MatrixSummary {
  totalChapters: number;
  publishedChapters: number;
  missingLessons: number;
  assessmentReadyChapters: number;
}

export const AdminCurriculumMatrix: React.FC = () => {
  const { authToken } = useApp();
  const [matrix, setMatrix] = useState<MatrixItem[]>([]);
  const [summary, setSummary] = useState<MatrixSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyChapterId, setBusyChapterId] = useState<string | null>(null);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [missingOnly, setMissingOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchMatrix = useCallback(async () => {
    if (!authToken) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedGrade !== 'all') params.set('grade', selectedGrade);
      if (selectedBoard !== 'all') params.set('board', selectedBoard);
      if (missingOnly) params.set('missingOnly', 'true');

      const res = await fetch(`/api/v1/admin/curriculum/matrix?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load curriculum matrix.');
      setMatrix(data.matrix || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching matrix data.');
    } finally {
      setLoading(false);
    }
  }, [authToken, selectedGrade, selectedBoard, missingOnly]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  const handlePublishChapter = async (chapterId: string, chapterTitle: string) => {
    if (!authToken) return;
    setBusyChapterId(chapterId);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/v1/admin/curriculum/publish-chapter', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chapterId,
          academicReviewReference: `ACAD-ADMIN-VERIFIED-${Date.now()}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to publish chapter.');
      setNotice(`✅ Chapter "${chapterTitle}" successfully reviewed and published!`);
      await fetchMatrix();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusyChapterId(null);
    }
  };

  const filteredMatrix = matrix.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.subject.toLowerCase().includes(term) ||
      item.chapterTitle.toLowerCase().includes(term) ||
      `class ${item.class}`.includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-navy, #1e293b)', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
            <Layers size={24} color="#0d9488" /> Curriculum Administration & Publishing Matrix
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
            Longitudinal Class 1–10 syllabus oversight. Monitor chapter completion, assessment readiness, and execute verified 1-click publishing.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-teal"
          onClick={fetchMatrix}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}
        >
          <RefreshCw size={16} className={loading ? 'vg-spin' : ''} /> Refresh Matrix
        </button>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Chapters
            </span>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {summary.totalChapters}
            </div>
            <small style={{ color: '#64748b' }}>Across all verified classes & boards</small>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Published Chapters
            </span>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#15803d', marginTop: 4 }}>
              {summary.publishedChapters}
            </div>
            <small style={{ color: '#166534' }}>
              {summary.totalChapters > 0 ? Math.round((summary.publishedChapters / summary.totalChapters) * 100) : 0}% of total curriculum
            </small>
          </div>

          <div style={{ background: summary.missingLessons > 0 ? '#fffbeb' : '#f0fdf4', border: `1px solid ${summary.missingLessons > 0 ? '#fde68a' : '#bbf7d0'}`, borderRadius: 12, padding: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: summary.missingLessons > 0 ? '#b45309' : '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Missing / Draft Lessons
            </span>
            <div style={{ fontSize: 28, fontWeight: 800, color: summary.missingLessons > 0 ? '#d97706' : '#15803d', marginTop: 4 }}>
              {summary.missingLessons}
            </div>
            <small style={{ color: summary.missingLessons > 0 ? '#b45309' : '#166534' }}>
              {summary.missingLessons > 0 ? 'Requires authored units or questions' : 'Zero missing lessons!'}
            </small>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Assessment Readiness
            </span>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
              {summary.assessmentReadyChapters}
            </div>
            <small style={{ color: '#1e40af' }}>Chapters with ≥ 3 practice questions</small>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      {notice && (
        <div role="status" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={18} /> {notice}
        </div>
      )}

      {/* Filters Bar */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="#64748b" />
          <strong style={{ fontSize: 14, color: '#334155' }}>Filters:</strong>
        </div>

        <div>
          <label htmlFor="matrix-grade" style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginRight: 6 }}>Class:</label>
          <select
            id="matrix-grade"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
          >
            <option value="all">All Classes (1 to 10)</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>Class {g}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="matrix-board" style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginRight: 6 }}>Board:</label>
          <select
            id="matrix-board"
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
          >
            <option value="all">All Boards</option>
            <option value="CBSE">CBSE (NCERT)</option>
            <option value="STATE">Karnataka State</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', color: '#334155', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={missingOnly}
            onChange={(e) => setMissingOnly(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#d97706' }}
          />
          Show Missing / Draft Only
        </label>

        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 10 }} />
          <input
            type="text"
            placeholder="Search subject or chapter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '6px 10px 6px 32px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Curriculum Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 14px' }}>Class / Board</th>
              <th style={{ padding: '12px 14px' }}>Subject</th>
              <th style={{ padding: '12px 14px' }}>Chapter</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Concepts</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Content %</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Assessment</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Review Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Publication</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Admin Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={24} className="vg-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  Loading curriculum matrix...
                </td>
              </tr>
            ) : filteredMatrix.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  <BookOpen size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                  No chapters matched your filter criteria.
                </td>
              </tr>
            ) : (
              filteredMatrix.map((item) => (
                <tr
                  key={item.chapterId}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: item.isMissing ? '#fffdf7' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>Class {item.class}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: item.board === 'CBSE' ? '#e0f2fe' : '#fef3c7',
                          color: item.board === 'CBSE' ? '#0369a1' : '#b45309'
                        }}
                      >
                        {item.board}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#334155' }}>
                    {item.subject.replace('Vayentra Original: ', '⭐ ')}
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>
                      {String(item.chapterNumber).padStart(2, '0')}. {item.chapterTitle}
                    </div>
                    <small style={{ color: '#94a3b8' }}>Edition: {item.textbookEdition}</small>
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: item.conceptsCount > 0 ? '#0f172a' : '#ef4444' }}>
                      {item.conceptsCount}
                    </span>
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 50, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${item.contentCompletion}%`,
                            height: '100%',
                            background: item.contentCompletion === 100 ? '#22c55e' : item.contentCompletion > 0 ? '#3b82f6' : '#ef4444'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{item.contentCompletion}%</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    {item.assessmentReadiness === 'ready' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        <Check size={12} /> {item.questionsCount} Qs (Ready)
                      </span>
                    ) : item.assessmentReadiness === 'partial' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        <AlertTriangle size={12} /> {item.questionsCount} Qs (Partial)
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        0 Qs (Missing)
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        background: item.reviewStatus === 'reviewed' ? '#f0fdf4' : '#fff7ed',
                        color: item.reviewStatus === 'reviewed' ? '#166534' : '#c2410c'
                      }}
                    >
                      {item.reviewStatus === 'reviewed' ? 'Reviewed' : 'Draft'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 700,
                        background: item.publicationStatus === 'published' ? '#ecfdf5' : '#f1f5f9',
                        color: item.publicationStatus === 'published' ? '#047857' : '#64748b'
                      }}
                    >
                      {item.publicationStatus === 'published' ? <CheckCircle2 size={12} /> : null}
                      {item.publicationStatus === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    {item.publicationStatus !== 'published' || item.reviewStatus !== 'reviewed' ? (
                      <button
                        type="button"
                        className="btn btn-teal"
                        disabled={busyChapterId === item.chapterId}
                        onClick={() => handlePublishChapter(item.chapterId, item.chapterTitle)}
                        style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer' }}
                      >
                        {busyChapterId === item.chapterId ? 'Publishing...' : 'Publish'}
                      </button>
                    ) : (
                      <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={14} /> Approved
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
