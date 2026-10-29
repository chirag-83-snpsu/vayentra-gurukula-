import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Calendar, 
  CheckSquare, 
  Users, 
  HelpCircle, 
  Flame, 
  Sparkles, 
  Send,
  Plus
} from 'lucide-react';

export const TeacherView: React.FC = () => {
  const { doubts } = useApp();
  const [activeTab, setActiveTab] = useState<'today' | 'heatmap' | 'doubts' | 'assignments'>('heatmap');
  const [remedialPackCreated, setRemedialPackCreated] = useState(false);

  // Mock Heatmap Data for Class 7 CBSE Mathematics (Wireframe 03 / Diagram 28)
  const heatmapStudents = [
    { name: 'Aarav Varma', intAdd: 95, intMult: 66, bodmas: 80, fractions: 90 },
    { name: 'Diya Patel', intAdd: 90, intMult: 55, bodmas: 60, fractions: 85 },
    { name: 'Kavya Rao', intAdd: 100, intMult: 90, bodmas: 95, fractions: 90 },
    { name: 'Rohan Sharma', intAdd: 75, intMult: 50, bodmas: 65, fractions: 70 },
    { name: 'Zoya Khan', intAdd: 95, intMult: 85, bodmas: 90, fractions: 95 }
  ];

  const getCellColor = (val: number) => {
    if (val >= 85) return 'var(--color-success-bg)';
    if (val >= 70) return 'var(--color-teal-light)';
    return 'var(--color-saffron-light)';
  };

  const getTextColor = (val: number) => {
    if (val >= 85) return 'var(--color-success)';
    if (val >= 70) return 'var(--color-teal-primary)';
    return 'var(--color-saffron)';
  };

  const handleGenerateRemedialPack = () => {
    setRemedialPackCreated(true);
    setTimeout(() => setRemedialPackCreated(false), 6000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Teacher Header */}
      <div className="b" style={{
        background: 'linear-gradient(135deg, var(--color-paper-card) 0%, var(--color-paper-subtle) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--color-teal-light)',
            color: 'var(--color-teal-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div className="h1" style={{ fontSize: '22px' }}>Teacher Studio & Faculty Desk</div>
            <div className="t-muted">Assigned: Class 7-A (Mathematics) • Class 10-B (Physics)</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-teal" onClick={() => alert('Starting Live Classroom session...')}>
            <Calendar size={16} /> Launch Live Room
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
        <button
          type="button"
          className={activeTab === 'heatmap' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('heatmap')}
        >
          Class Mastery Heatmap (Diagram 28)
        </button>
        <button
          type="button"
          className={activeTab === 'today' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('today')}
        >
          Today Priority Checklist
        </button>
        <button
          type="button"
          className={activeTab === 'doubts' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('doubts')}
        >
          Student Doubt Queue ({doubts.length})
        </button>
        <button
          type="button"
          className={activeTab === 'assignments' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('assignments')}
        >
          Create Assignment
        </button>
      </div>

      {/* HEATMAP TAB (Wireframe 03 / Diagram 28) */}
      {activeTab === 'heatmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="h2">Concept Mastery Heatmap (Class 7-A Mathematics)</div>
              <div className="t-muted">
                Cohort Concept Matrix: Scores combine automated checkpoints and homework submissions.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-teal"
              onClick={handleGenerateRemedialPack}
            >
              <Sparkles size={16} /> 1-Click Generate Remedial Pack
            </button>
          </div>

          {remedialPackCreated && (
            <div className="b" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--color-success)' }}>
              <strong>Remedial Pack Dispatched!</strong> Auto-grouped 3 students struggling with <em>"Integer Sign Multiplication"</em> (Aarav, Diya, Rohan). Assigned targeted 5-question recap worksheet with instant parent WhatsApp alert.
            </div>
          )}

          {/* Matrix Table */}
          <div className="b" style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-ink)', color: '#ffffff' }}>
                  <th style={{ padding: '12px 16px' }}>Student Name</th>
                  <th style={{ padding: '12px 16px' }}>Integer Addition</th>
                  <th style={{ padding: '12px 16px' }}>Integer Multiplication (Weak Cluster)</th>
                  <th style={{ padding: '12px 16px' }}>BODMAS Operations</th>
                  <th style={{ padding: '12px 16px' }}>Fractions & Decimals</th>
                </tr>
              </thead>
              <tbody>
                {heatmapStudents.map((st, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{st.name}</td>
                    <td style={{ padding: '12px 16px', background: getCellColor(st.intAdd), color: getTextColor(st.intAdd), fontWeight: 700 }}>
                      {st.intAdd}%
                    </td>
                    <td style={{ padding: '12px 16px', background: getCellColor(st.intMult), color: getTextColor(st.intMult), fontWeight: 700 }}>
                      {st.intMult}% {st.intMult < 70 && '⚠️ Focus'}
                    </td>
                    <td style={{ padding: '12px 16px', background: getCellColor(st.bodmas), color: getTextColor(st.bodmas), fontWeight: 700 }}>
                      {st.bodmas}%
                    </td>
                    <td style={{ padding: '12px 16px', background: getCellColor(st.fractions), color: getTextColor(st.fractions), fontWeight: 700 }}>
                      {st.fractions}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="t-tiny">
            Legend: Green (85% and above Mastered) • Royal Navy (70–84% Competent) • Regal Gold (Below 70% Remediation Recommended). Color paired with numerical text per WCAG contrast requirements.
          </div>
        </div>
      )}

      {/* TODAY PRIORITY TAB (Wireframe 57) */}
      {activeTab === 'today' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div className="b">
            <div className="h3">Gradebook Items to Review (3)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <div style={{ padding: '10px', background: 'var(--color-paper-subtle)', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600 }}>Class 7 Homework: Word Problems</div>
                <div className="t-tiny">18 submitted • 4 pending grading</div>
              </div>
            </div>
          </div>

          <div className="b">
            <div className="h3">Upcoming Live Sessions</div>
            <div style={{ marginTop: '12px', padding: '10px', background: 'var(--color-paper-subtle)', borderRadius: '6px' }}>
              <div style={{ fontWeight: 600 }}>Algebra Prerequisite Clinic</div>
              <div className="t-tiny">Tomorrow at 5:00 PM IST • 24 Students Invited</div>
            </div>
          </div>
        </div>
      )}

      {/* DOUBTS QUEUE TAB */}
      {activeTab === 'doubts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="h2">Student Questions Awaiting Teacher Follow-Up</div>
          {doubts.map(d => (
            <div key={d.id} className="b">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{d.studentName}</strong>
                <span className="chip chip-teal">AI Draft Ready for Review</span>
              </div>
              <div style={{ margin: '8px 0', fontSize: '15px' }}>"{d.questionText}"</div>
              <button type="button" className="btn btn-teal" style={{ minHeight: '34px', fontSize: '12px' }}>
                Confirm & Send Teacher Voice Note
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CREATE ASSIGNMENT TAB */}
      {activeTab === 'assignments' && (
        <div className="b" style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="h2">Create Assignment for Class 7-A</div>
          <input type="text" placeholder="Assignment Title (e.g. Integer Multiplication Drill)" className="in" />
          <textarea rows={4} placeholder="Instructions and required problems..." style={{ resize: 'none' }} className="in" />
          <input type="date" className="in" />
          <button type="button" className="btn btn-teal" onClick={() => alert('Assignment Published to Class 7-A and Parents Notified via WhatsApp.')}>
            <Plus size={16} /> Publish & Alert Parents
          </button>
        </div>
      )}

    </div>
  );
};
