import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, GraduationCap, LockKeyhole, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OneConceptStudio } from './OneConceptStudio';
import { OneGrade1Explorer } from './OneGrade1Explorer';
import { OneGrade2Explorer } from './OneGrade2Explorer';
import { OneUniversalGradeExplorer } from './OneUniversalGradeExplorer';
import '../styles/one-enrolment.css';

type Subject = { id: string; name: string; approved_chapters: number; published_concepts: number };
type Learner = {
  learnerId: string;
  learnerNumber: string;
  studentName: string;
  currentYear: { grade: number; board: string; academicYear: string; status: string };
  membershipStatus: string;
  entitlementStatus: string;
  conceptStudio: { available: boolean; publishedUnits: number; pilotGranted: boolean };
  catalogue: { status: string; editionYear: string | null };
  subjects: Subject[];
  notice: string;
};

export const OneLearnerLaunchpad: React.FC<{ onExplore?: () => void; parentPreviewStudentId?: string }> = ({
  parentPreviewStudentId
}) => {
  const { authToken } = useApp();
  const [learner, setLearner] = useState<Learner | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStudio, setShowStudio] = useState(false);
  const [showGradeOne, setShowGradeOne] = useState(false);
  const [showGradeTwo, setShowGradeTwo] = useState(false);
  const [showUniversalGrade, setShowUniversalGrade] = useState(false);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setLearner(null);
    if (!authToken) {
      setLoading(false);
      setError('Please sign in with your linked learner account.');
      return () => controller.abort();
    }
    fetch(
      parentPreviewStudentId
        ? '/api/v1/one-onboarding/guardian/learners/' + encodeURIComponent(parentPreviewStudentId) + '/home'
        : '/api/v1/one-onboarding/learner/me',
      { signal: controller.signal, headers: { Authorization: 'Bearer ' + authToken } }
    )
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw Error(data.message || data.code || 'Learning profile unavailable.');
        return data.learner as Learner;
      })
      .then((data) => {
        if (!controller.signal.aborted) setLearner(data);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load your learning space.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [authToken, parentPreviewStudentId]);

  if (showGradeOne)
    return (
      <div className="vg-one">
        <button
          type="button"
          className="vg-one-minibutton"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setShowGradeOne(false)}
        >
          ← Back to Learning Universe
        </button>
        <OneGrade1Explorer parentPreviewStudentId={parentPreviewStudentId} />
      </div>
    );

  if (showGradeTwo)
    return (
      <div className="vg-one">
        <button
          type="button"
          className="vg-one-minibutton"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setShowGradeTwo(false)}
        >
          ← Back to Learning Universe
        </button>
        <OneGrade2Explorer parentPreviewStudentId={parentPreviewStudentId} />
      </div>
    );

  if (showUniversalGrade && learner)
    return (
      <div className="vg-one">
        <button
          type="button"
          className="vg-one-minibutton"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setShowUniversalGrade(false)}
        >
          ← Back to Learning Universe
        </button>
        <OneUniversalGradeExplorer
          grade={learner.currentYear.grade}
          board={learner.currentYear.board}
          initialSubjectName={selectedSubjectName}
          onBack={() => setShowUniversalGrade(false)}
        />
      </div>
    );

  if (showStudio)
    return (
      <div className="vg-one">
        <button
          type="button"
          className="vg-one-minibutton"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setShowStudio(false)}
        >
          ← Back to Learning Universe
        </button>
        <OneConceptStudio parentPreviewStudentId={parentPreviewStudentId} />
      </div>
    );

  return (
    <section className="vg-one">
      <div className="vg-one-hero vg-one-learner-hero">
        <div>
          <span className="vg-one-kicker">
            <Sparkles size={17} /> {parentPreviewStudentId ? 'GUARDIAN-SUPERVISED LEARNING' : 'MY LEARNING UNIVERSE'}
          </span>
          <h2>
            {learner ? (
              <>
                Welcome, {learner.studentName.split(' ')[0]}.<br />
                <em>Learn the why.</em>
              </>
            ) : (
              <>
                Your learning,
                <br />
                <em>built around you.</em>
              </>
            )}
          </h2>
          <p>
            Concepts become clear when we build them from the beginning. Your verified school year and board guide the
            concept classes available here.
          </p>
        </div>
        <div className="vg-one-pass">
          <span>MY LEARNING PASSPORT</span>
          <GraduationCap size={33} />
          <strong>{learner ? 'CLASS ' + learner.currentYear.grade : 'VAYENTRA ONE'}</strong>
          <small>{learner?.learnerNumber || 'PERMANENT LEARNER ID'}</small>
        </div>
      </div>
      {loading && <p role="status">Opening your learning journey…</p>}
      {error && (
        <div className="vg-one-card">
          <LockKeyhole size={24} />
          <h3>Learning journey not yet activated</h3>
          <p role="alert">{error}</p>
          <p>
            Your academic year and learner-account link must be approved by the academy. Do not try to select another
            student ID to gain access.
          </p>
          <button
            type="button"
            className="vg-one-primary"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={17} /> Retry Loading Learning Space
          </button>
        </div>
      )}
      {learner && (
        <div className="vg-one-learner-body">
          <div className="vg-one-learner-stats">
            <div>
              <small>ACADEMIC YEAR</small>
              <strong>{learner.currentYear.academicYear}</strong>
            </div>
            <div>
              <small>MY CLASS</small>
              <strong>Class {learner.currentYear.grade}</strong>
            </div>
            <div>
              <small>SCHOOL BOARD</small>
              <strong>{learner.currentYear.board === 'STATE' ? 'Karnataka State' : 'CBSE'}</strong>
            </div>
          </div>
          <article className="vg-one-card">
            <span className="vg-one-eyebrow">
              <BookOpen size={15} /> YOUR VERIFIED SUBJECT SPACES
            </span>
            <h3>Choose what you want to understand.</h3>
            {learner.subjects.length > 0 ? (
              <div className="vg-one-subject-grid">
                {learner.subjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="vg-one-subject"
                    style={{ cursor: 'pointer', textAlign: 'left', border: 'none', background: 'transparent', padding: 0 }}
                    onClick={() => {
                      if (learner.currentYear.grade === 1) setShowGradeOne(true);
                      else if (learner.currentYear.grade === 2) setShowGradeTwo(true);
                      else {
                        setSelectedSubjectName(s.name);
                        setShowUniversalGrade(true);
                      }
                    }}
                  >
                    <BookOpen size={22} />
                    <strong>{s.name}</strong>
                    <p>
                      {s.approved_chapters} reviewed chapters · {s.published_concepts} published concepts
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="vg-one-empty">
                <BookOpen size={32} />
                <strong>Your curriculum is being reviewed</strong>
                <p>{learner.notice}</p>
              </div>
            )}
            {learner.entitlementStatus !== 'enabled' && (
              <div className="vg-one-warning">
                <ShieldCheck size={18} />
                <span>
                  Your permanent Learner ID is active. Paid access is not configured. Separately approved, temporary
                  pilot access may be available without payment.
                </span>
              </div>
            )}
            
            {/* Primary Explore Class Actions for Every Class (1 to 10) */}
            {learner.currentYear.grade === 1 && (
              <button type="button" className="vg-one-primary" onClick={() => setShowGradeOne(true)}>
                <BookOpen size={17} /> Explore Class 1 Subjects · AI · Money Skills <ArrowRight size={17} />
              </button>
            )}
            {learner.currentYear.grade === 2 && (
              <button type="button" className="vg-one-primary" onClick={() => setShowGradeTwo(true)}>
                <BookOpen size={17} /> Explore Class 2 Subjects · EVS · AI · Money Skills <ArrowRight size={17} />
              </button>
            )}
            {learner.currentYear.grade >= 3 && (
              <button
                type="button"
                className="vg-one-primary"
                onClick={() => {
                  setSelectedSubjectName('');
                  setShowUniversalGrade(true);
                }}
              >
                <BookOpen size={17} /> Explore Class {learner.currentYear.grade} Subjects & Concept Classes <ArrowRight size={17} />
              </button>
            )}
            {learner.conceptStudio.available && (
              <button type="button" className="vg-one-primary" onClick={() => setShowStudio(true)}>
                <BookOpen size={17} /> Study {learner.conceptStudio.publishedUnits} approved shape concepts <ArrowRight size={17} />
              </button>
            )}
          </article>
        </div>
      )}
    </section>
  );
};
