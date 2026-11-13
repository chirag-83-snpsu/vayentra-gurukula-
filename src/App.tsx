import React, { useEffect, useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { StudentView } from './views/StudentView';
import { ParentView } from './views/ParentView';
import { OneGuardianAdmission } from './components/OneGuardianAdmission';
import { TeacherView } from './views/TeacherView';
import { ReviewerView } from './views/ReviewerView';
import { AdminView } from './views/AdminView';
import { SafeguardingView } from './views/SafeguardingView';
import { TechAcademyView } from './views/TechAcademyView';
import { PublicView } from './views/PublicView';
import { LandingPage } from './views/LandingPage';
import { StudentLoginPage } from './views/StudentLoginPage';
import { AdmissionsPage } from './views/AdmissionsPage';

import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  SlidersHorizontal, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles,
  Home,
  Lock,
  WifiOff,
  RefreshCw
} from 'lucide-react';

const AccessDeniedCard: React.FC<{
  title: string;
  description: string;
  requiredRole: string;
  onSignIn: () => void;
}> = ({ title, description, requiredRole, onSignIn }) => (
  <div className="b" style={{
    maxWidth: '520px',
    margin: '60px auto',
    padding: '36px 32px',
    textAlign: 'center',
    background: 'var(--color-paper-card)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  }}>
    <div style={{
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      background: 'rgba(239, 68, 68, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-error)'
    }}>
      <ShieldAlert size={32} />
    </div>
    <div className="h2" style={{ fontSize: '22px', fontWeight: 800 }}>
      {title}
    </div>
    <p className="t-muted" style={{ fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
      {description}
    </p>
    <div className="chip chip-saffron" style={{ fontSize: '11px', fontWeight: 700 }}>
      REQUIRED PERMISSION: {requiredRole.toUpperCase()}
    </div>
    <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
      <button
        type="button"
        className="btn btn-navy"
        onClick={onSignIn}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        Sign In with Authorized Account
      </button>
    </div>
  </div>
);

export const App: React.FC = () => {
  const {
    role,
    setRole,
    currentUser,
    parent,
    isAuthenticated,
    isChildModeLocked,
    isOfflineMode,
    toggleOfflineMode
  } = useApp();

  const [showAuthModal, setShowAuthModal] = useState(false);
  // Public routes are distinct from the authenticated application shell.
  // Never grant portal access based only on a URL parameter or class selector.
  const [page, setPage] = useState<'home'|'login'|'explore'|'portal'|'admissions'>(() => {
    const path = window.location.pathname;
    if (path === '/login') return 'login';
    if (path === '/admissions') return 'admissions';
    if (path === '/explore') return 'explore';
    if (path === '/app') return 'portal';
    return 'home';
  });
  const navigate = (next: 'home'|'login'|'explore'|'portal'|'admissions', grade?: number) => {
    const path = next === 'home' ? '/' : next === 'portal' ? '/app' : '/' + next;
    const search = next === 'admissions' && grade && grade >= 1 && grade <= 10 ? '?class='+grade : '';
    window.history.pushState({}, '', path+search);
    setPage(next);
    window.scrollTo({top:0});
  };
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      setPage(path === '/login' ? 'login' : path === '/explore' ? 'explore' : path === '/app' ? 'portal' : path === '/admissions' ? 'admissions' : 'home');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);


  const navItems = [
    { id: 'student', label: 'Learn Hub', icon: BookOpen },
    { id: 'parent', label: 'Family Hub', icon: Users },
    { id: 'teacher', label: 'Teacher Studio', icon: GraduationCap },
    { id: 'reviewer', label: 'Reviewer Desk', icon: ClipboardCheck },
    { id: 'admin', label: 'Admin Console', icon: SlidersHorizontal },
    { id: 'safeguarding', label: 'Safeguarding', icon: ShieldCheck },
    { id: 'tech_learner', label: 'Tech Academy', icon: Sparkles }
  ];

  const hasAccess = (allowedRoles: string[]) => {
    if (!isAuthenticated || !currentUser) return false;
    return allowedRoles.includes(currentUser.role);
  };

  const renderActiveView = () => {
    switch (role) {
      case 'student':
        if (!hasAccess(['student'])) {
          return <AccessDeniedCard
            title="Learning Universe Access Restricted"
            description="Sign in with a verified and explicitly linked student account. Selecting a class or role in the browser never grants learner access."
            requiredRole="student"
            onSignIn={() => setShowAuthModal(true)}
          />;
        }
        return <StudentView />;
      case 'parent':
        if (!hasAccess(['parent', 'admin'])) {
          return (
            <AccessDeniedCard
              title="Parent Family Portal Restricted"
              description="Access to family settings, progress analytics, and child screen-time locks requires a verified Parent or Guardian account."
              requiredRole="parent"
              onSignIn={() => setShowAuthModal(true)}
            />
          );
        }
        // A new guardian with no linked children should see admission, not a demo child dashboard.
        if (!parent.children.length) return <OneGuardianAdmission />;
        return <ParentView />;
      case 'teacher':
        if (!hasAccess(['teacher', 'admin'])) {
          return (
            <AccessDeniedCard
              title="Teacher Studio Access Restricted"
              description="The Teacher Studio is restricted to certified faculty members for curriculum sequencing and student mastery reviews."
              requiredRole="teacher"
              onSignIn={() => setShowAuthModal(true)}
            />
          );
        }
        return <TeacherView />;
      case 'reviewer':
        if (!hasAccess(['reviewer', 'admin'])) {
          return (
            <AccessDeniedCard
              title="Editorial Review Desk Restricted"
              description="The Editorial Review Desk requires Board Examiner credentials to verify syllabus alignment and AI checkpoints."
              requiredRole="reviewer"
              onSignIn={() => setShowAuthModal(true)}
            />
          );
        }
        return <ReviewerView />;
      case 'admin':
        if (!hasAccess(['admin'])) {
          return (
            <AccessDeniedCard
              title="Admin & Finance Console Restricted"
              description="Access to the institution's financial ledger, plan configuration, and user audits requires Principal or Administrator clearance."
              requiredRole="admin"
              onSignIn={() => setShowAuthModal(true)}
            />
          );
        }
        return <AdminView />;
      case 'safeguarding':
        if (!hasAccess(['safeguarding', 'admin'])) {
          return (
            <AccessDeniedCard
              title="Safeguarding Vault Restricted"
              description="Confidential child welfare reports and legal escalation dossiers are restricted to designated Safeguarding Officers."
              requiredRole="safeguarding"
              onSignIn={() => setShowAuthModal(true)}
            />
          );
        }
        return <SafeguardingView />;
      case 'tech_learner':
        return <TechAcademyView />;
      default:
        return <AccessDeniedCard
          title="Account Access Restricted"
          description="This area is not available to your authenticated role."
          requiredRole="student"
          onSignIn={() => setShowAuthModal(true)}
        />;
    }
  };

  if (page === 'home') return <LandingPage onLogin={() => navigate('login')} onExplore={() => navigate('explore')} onAdmissions={grade => navigate('admissions',grade)} />;
  if (page === 'admissions') return <AdmissionsPage onBack={() => navigate('home')} onLogin={() => navigate('login')} />;
  if (page === 'login') return <StudentLoginPage onBack={() => navigate('home')} onSuccess={() => navigate('portal')} />;
  if (page === 'explore') return <div className="vg-public-explore">
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:15,padding:'18px 28px',borderBottom:'1px solid #e4e8f1',background:'#fff'}}>
      <button className="ghost" onClick={() => navigate('home')}><Home size={17}/> Back to Home</button>
      <button className="btn btn-navy" onClick={() => navigate('login')}>Student Login</button>
    </header>
    <PublicView />
  </div>;
  // The existing portal shell remains private, including during local development.
  if (!isAuthenticated || !currentUser) return <StudentLoginPage onBack={() => navigate('home')} onSuccess={() => navigate('portal')} />;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar />

      {/* Truthful Global Offline State Indicator */}
      {isOfflineMode && (
        <div className="global-offline-banner" role="status">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WifiOff size={16} color="var(--color-gold-bright)" />
            <span>Low-Bandwidth Offline Mode: Showing cached materials. Attendance commits and server actions require connectivity.</span>
          </div>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.onLine) {
                toggleOfflineMode();
              } else {
                window.location.reload();
              }
            }}
            style={{ color: '#ffffff', borderColor: '#475569', fontSize: '11px', padding: '3px 8px', minHeight: '28px' }}
          >
            <RefreshCw size={12} /> Sync Status
          </button>
        </div>
      )}

      {/* Responsive App Shell */}
      <div className="app-shell" style={{ flex: 1 }}>
        
        {/* Tablet Left Rail (768px - 1279px) */}
        {!isChildModeLocked && (
          <aside className="app-rail">
            {navItems.map(item => (
              <button
                key={item.id}
                type="button"
                className={`ghost ${role === item.id ? 'btn-teal' : ''}`}
                title={item.label}
                onClick={() => setRole(item.id as any)}
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
                PORTAL HUBS
              </div>
              {navItems.map(item => {
                const isActive = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={isActive ? 'btn btn-teal' : 'ghost'}
                    onClick={() => setRole(item.id as any)}
                    style={{ justifyContent: 'flex-start', minHeight: '40px' }}
                  >
                    <item.icon size={18} /> {item.label}
                  </button>
                );
              })}
            </div>

            {/* Bottom Platform Info Card */}
            <div style={{ marginTop: 'auto', padding: '14px', borderRadius: '8px', background: 'var(--color-paper-subtle)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="t-tiny" style={{ fontWeight: 700, color: 'var(--color-navy-primary)' }}>VAYENTRA GURUKULA</div>
              <div className="t-tiny" style={{ marginTop: '2px', color: 'var(--color-text-muted)' }}>
                Concept-Based Academic Coaching & Learning Platform
              </div>
            </div>
          </aside>
        )}

        {/* Central Main Learning Canvas */}
        <main className="app-canvas">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="app-bottom-nav" aria-label="Mobile Navigation">
        {/* Dynamic Role Primary Tab */}
        {role === 'teacher' ? (
          <div
            className={`bottom-nav-item ${role === 'teacher' ? 'active' : ''}`}
            onClick={() => setRole('teacher')}
          >
            <GraduationCap size={20} />
            <span>Faculty</span>
          </div>
        ) : role === 'admin' ? (
          <div
            className={`bottom-nav-item ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            <SlidersHorizontal size={20} />
            <span>Admin</span>
          </div>
        ) : role === 'reviewer' ? (
          <div
            className={`bottom-nav-item ${role === 'reviewer' ? 'active' : ''}`}
            onClick={() => setRole('reviewer')}
          >
            <ClipboardCheck size={20} />
            <span>Review</span>
          </div>
        ) : (
          <div
            className={`bottom-nav-item ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            <BookOpen size={20} />
            <span>Learn</span>
          </div>
        )}

        {/* Family Portal Tab */}
        {!isChildModeLocked && (
          <div
            className={`bottom-nav-item ${role === 'parent' ? 'active' : ''}`}
            onClick={() => setRole('parent')}
          >
            <Users size={20} />
            <span>Family</span>
          </div>
        )}

        {/* Tech Academy or Student Tab */}
        <div
          className={`bottom-nav-item ${role === 'tech_learner' ? 'active' : ''}`}
          onClick={() => setRole('tech_learner')}
        >
          <Sparkles size={20} />
          <span>Academy</span>
        </div>
      </nav>

      {/* Auth Modal Triggered by Access Denied Card or Actions */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

    </div>
  );
};
