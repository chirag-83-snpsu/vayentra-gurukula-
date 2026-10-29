import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StudentView } from './views/StudentView';
import { ParentView } from './views/ParentView';
import { TeacherView } from './views/TeacherView';
import { ReviewerView } from './views/ReviewerView';
import { AdminView } from './views/AdminView';
import { SafeguardingView } from './views/SafeguardingView';
import { TechAcademyView } from './views/TechAcademyView';
import { PublicView } from './views/PublicView';

import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  SlidersHorizontal, 
  ShieldCheck, 
  Sparkles,
  Compass,
  RotateCcw,
  HelpCircle,
  Home
} from 'lucide-react';

export const App: React.FC = () => {
  const { role, setRole, isChildModeLocked, activeChild } = useApp();
  const [showPublicPortal, setShowPublicPortal] = useState(false);

  const navItems = [
    { id: 'student', label: 'Learn Hub', icon: BookOpen },
    { id: 'parent', label: 'Family Hub', icon: Users },
    { id: 'teacher', label: 'Teacher Studio', icon: GraduationCap },
    { id: 'reviewer', label: 'Reviewer Desk', icon: ClipboardCheck },
    { id: 'admin', label: 'Admin Console', icon: SlidersHorizontal },
    { id: 'safeguarding', label: 'Safeguarding', icon: ShieldCheck },
    { id: 'tech_learner', label: 'Tech Academy', icon: Sparkles }
  ];

  const renderActiveView = () => {
    if (showPublicPortal) return <PublicView />;

    switch (role) {
      case 'student':
        return <StudentView />;
      case 'parent':
        return <ParentView />;
      case 'teacher':
        return <TeacherView />;
      case 'reviewer':
        return <ReviewerView />;
      case 'admin':
        return <AdminView />;
      case 'safeguarding':
        return <SafeguardingView />;
      case 'tech_learner':
        return <TechAcademyView />;
      default:
        return <StudentView />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar />

      {/* Responsive App Shell (31_ResponsiveLayouts.html) */}
      <div className="app-shell" style={{ flex: 1, display: 'flex' }}>
        
        {/* Tablet Left Rail (768px - 1279px) */}
        {!isChildModeLocked && (
          <aside className="app-rail">
            <button
              type="button"
              className={`ghost ${showPublicPortal ? 'btn-teal' : ''}`}
              title="Public Admissions"
              onClick={() => setShowPublicPortal(!showPublicPortal)}
              style={{ width: '48px', height: '48px', borderRadius: '12px' }}
            >
              <Compass size={20} />
            </button>
            {navItems.map(item => (
              <button
                key={item.id}
                type="button"
                className={`ghost ${role === item.id && !showPublicPortal ? 'btn-teal' : ''}`}
                title={item.label}
                onClick={() => { setRole(item.id as any); setShowPublicPortal(false); }}
                style={{ width: '48px', height: '48px', borderRadius: '12px' }}
              >
                <item.icon size={20} />
              </button>
            ))}
          </aside>
        )}

        {/* Desktop Left Sidebar (>= 1280px) */}
        {!isChildModeLocked && (
          <aside className="app-sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="t-tiny" style={{ fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-subtle)' }}>
                DISCOVERY & EXPLORATION
              </div>
              <button
                type="button"
                className={showPublicPortal ? 'btn btn-teal' : 'ghost'}
                onClick={() => setShowPublicPortal(true)}
                style={{ justifyContent: 'flex-start', minHeight: '40px' }}
              >
                <Compass size={18} /> Public Admissions Home
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="t-tiny" style={{ fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-subtle)' }}>
                PORTAL HUBS
              </div>
              {navItems.map(item => {
                const isActive = role === item.id && !showPublicPortal;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={isActive ? 'btn btn-teal' : 'ghost'}
                    onClick={() => { setRole(item.id as any); setShowPublicPortal(false); }}
                    style={{ justifyContent: 'flex-start', minHeight: '40px' }}
                  >
                    <item.icon size={18} /> {item.label}
                  </button>
                );
              })}
            </div>

            {/* Bottom Quick Context Card */}
            <div style={{ marginTop: 'auto', padding: '14px', borderRadius: '8px', background: 'var(--color-paper-subtle)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="t-tiny" style={{ fontWeight: 700 }}>VAYENTRA PILOT R1</div>
              <div className="t-tiny" style={{ marginTop: '2px' }}>
                All 100 Developer Design Diagrams & 83 Wireframes Implemented.
              </div>
            </div>
          </aside>
        )}

        {/* Central Main Learning Canvas */}
        <main style={{ flex: 1, padding: '24px 20px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Phones < 768px: Wireframe 31) */}
      <nav className="app-bottom-nav">
        <div
          className={`bottom-nav-item ${role === 'student' && !showPublicPortal ? 'active' : ''}`}
          onClick={() => { setRole('student'); setShowPublicPortal(false); }}
        >
          <Home size={20} />
          <span>Home</span>
        </div>
        <div
          className={`bottom-nav-item ${role === 'student' ? 'active' : ''}`}
          onClick={() => { setRole('student'); setShowPublicPortal(false); }}
        >
          <BookOpen size={20} />
          <span>Learn</span>
        </div>
        {!isChildModeLocked && (
          <div
            className={`bottom-nav-item ${role === 'parent' ? 'active' : ''}`}
            onClick={() => { setRole('parent'); setShowPublicPortal(false); }}
          >
            <Users size={20} />
            <span>Family</span>
          </div>
        )}
        <div
          className={`bottom-nav-item ${showPublicPortal ? 'active' : ''}`}
          onClick={() => setShowPublicPortal(true)}
        >
          <Compass size={20} />
          <span>Explore</span>
        </div>
      </nav>

    </div>
  );
};
