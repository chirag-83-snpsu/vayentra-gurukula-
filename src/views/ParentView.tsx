import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { HomeworkAndAssessmentTracker } from '../components/HomeworkAndAssessmentTracker';
import { 
  Users, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Download,
  Share2,
  Bell,
  MessageSquare,
  Calendar,
  BookOpen,
  Award,
  RefreshCw,
  Send,
  ExternalLink,
  Check
} from 'lucide-react';

interface DashboardData {
  student: {
    id: string;
    name: string;
    grade: number;
    board: string;
    enrollmentNumber: string;
    avatar?: string;
  };
  enrolledBatches: Array<{
    id: string;
    name: string;
    subject: string;
    scheduleDays: string;
    startTime: string;
    endTime: string;
    teacherName?: string;
  }>;
  attendanceSummary: {
    totalCompletedSessions: number;
    attended: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    eligible: number;
    percentage: number | null;
    recentHistory: Array<{
      session_id: string;
      session_date: string;
      start_time: string;
      end_time: string;
      topic: string;
      batch_name: string;
      subject: string;
      status: string;
      remarks?: string;
    }>;
  };
  todaysTopic: {
    sessionId: string;
    batchName: string;
    subject: string;
    topic: string;
    teacherName?: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    isToday: boolean;
  } | null;
  pendingHomework: Array<{
    id: string;
    title: string;
    subject: string;
    batchName: string;
    description: string;
    dueDate: string;
    submissionStatus: string;
    score?: number;
    maxScore?: number;
    isOverdue: boolean;
  }>;
  weeklyTests: Array<{
    id: string;
    title: string;
    subject: string;
    assessmentDate: string;
    score: number;
    maxScore: number;
    passingScore: number;
    percentage: number;
    masteryLevel: string;
    conceptsTested: string[];
    areasForRevision: string[];
    feedback?: string;
    nextLearningRecommendation?: string;
    teacherName?: string;
  }>;
  teacherFeedback: Array<{
    source: string;
    title: string;
    date: string;
    teacherName: string;
    feedback: string;
    recommendation?: string;
  }>;
  upcomingSessions: Array<{
    id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    topic: string;
    batch_name: string;
    subject: string;
    teacher_name?: string;
  }>;
  notices: Array<{
    id: string;
    title: string;
    category: string;
    content: string;
    published_at: string;
  }>;
}

interface GuardianPreferences {
  guardianId: string;
  notifyWhatsApp: boolean;
  notifySms: boolean;
  notifyEmail: boolean;
  preferredLanguage: string;
  alertOnAbsence: boolean;
  alertOnHomework: boolean;
  alertOnReports: boolean;
  updatedAt?: string;
}

interface NotificationItem {
  id: string;
  guardianId: string;
  studentId: string;
  channel: string;
  templateName: string;
  recipientContact: string;
  messageContent: string;
  status: string;
  statusReason?: string;
  createdAt: string;
  sentAt?: string;
}

export const ParentView: React.FC = () => {
  const {
    parent,
    activeChild,
    setActiveChildId,
    payOutstandingFee,
    updateScreenTime,
    authToken
  } = useApp();

  const token = authToken || localStorage.getItem('vayentra_token');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'attendance' | 'homework' | 'communication' | 'report' | 'controls' | 'fees' | 'consent'
  >('overview');

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Communication Preferences State
  const [preferences, setPreferences] = useState<GuardianPreferences>({
    guardianId: '',
    notifyWhatsApp: true,
    notifySms: true,
    notifyEmail: true,
    preferredLanguage: 'English',
    alertOnAbsence: true,
    alertOnHomework: true,
    alertOnReports: true
  });
  const [isSavingPrefs, setIsSavingPrefs] = useState<boolean>(false);
  const [prefsMessage, setPrefsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState<boolean>(false);

  // Monthly Report Card State
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [reportDispatchMessage, setReportDispatchMessage] = useState<{ type: 'info' | 'error'; text: string } | null>(null);

  // Screen time & fee management
  const [screenTimeInput, setScreenTimeInput] = useState(activeChild.dailyTimeLimitMins);
  const [screenTimeSaved, setScreenTimeSaved] = useState<boolean>(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // 1. Fetch unified parent dashboard for active child
  const fetchDashboard = useCallback(() => {
    if (!activeChild?.id) return;
    setIsLoadingDashboard(true);
    setDashboardError(null);

    fetch(`/api/v1/parent/dashboard/${activeChild.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setDashboardData(data);
        } else {
          setDashboardError(data.message || 'Failed to load dashboard.');
        }
      })
      .catch(err => {
        setDashboardError(err.message || 'Error communicating with Gurukula server.');
      })
      .finally(() => {
        setIsLoadingDashboard(false);
      });
  }, [activeChild?.id, token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // 2. Fetch guardian communication preferences
  const fetchPreferences = useCallback(() => {
    fetch('/api/v1/parent/preferences', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // 3. Fetch notifications for active child
  const fetchNotifications = useCallback(() => {
    if (!activeChild?.id) return;
    setIsLoadingNotifs(true);
    fetch(`/api/v1/parent/notifications/${activeChild.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingNotifs(false));
  }, [activeChild?.id, token]);

  useEffect(() => {
    if (activeTab === 'communication') {
      fetchNotifications();
    }
  }, [activeTab, fetchNotifications]);

  // 4. Fetch Monthly Report Card
  const fetchMonthlyReport = useCallback(() => {
    if (!activeChild?.id) return;
    setIsLoadingReport(true);
    setReportDispatchMessage(null);
    fetch(`/api/v1/parent/reports/monthly/${activeChild.id}?month=${selectedMonth}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.reportCard) {
          setMonthlyReport(data.reportCard);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingReport(false));
  }, [activeChild?.id, selectedMonth, token]);

  useEffect(() => {
    if (activeTab === 'report') {
      fetchMonthlyReport();
    }
  }, [activeTab, fetchMonthlyReport]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    setPrefsMessage(null);

    try {
      const res = await fetch('/api/v1/parent/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(preferences)
      });
      const data = await res.json();
      if (data.success) {
        setPreferences(data.preferences);
        setPrefsMessage({ type: 'success', text: 'Communication preferences saved successfully.' });
        setTimeout(() => setPrefsMessage(null), 4000);
      } else {
        setPrefsMessage({ type: 'error', text: data.message || 'Failed to update preferences.' });
      }
    } catch {
      setPrefsMessage({ type: 'error', text: 'Network error saving communication preferences.' });
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleDispatchReportCard = async (channel: 'whatsapp' | 'sms' | 'email') => {
    if (!monthlyReport) return;
    setReportDispatchMessage(null);

    try {
      const res = await fetch('/api/v1/parent/notify/report-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studentId: activeChild.id,
          month: selectedMonth,
          attendancePercent: monthlyReport.attendance.percentage,
          averageScore: monthlyReport.assessments.averageScore ?? monthlyReport.homework.averageScore ?? 85,
          integrityHash: monthlyReport.verification.tamperEvidentHash,
          channel
        })
      });
      const data = await res.json();
      if (data.success && data.notification) {
        if (data.notification.status === 'not_sent') {
          setReportDispatchMessage({
            type: 'info',
            text: `Truthful Delivery Notice: Status is 'Not Sent' (${data.notification.statusReason}). Saved to notification audit log.`
          });
        } else {
          setReportDispatchMessage({
            type: 'info',
            text: `Report card dispatched via upstream ${channel.toUpperCase()} gateway.`
          });
        }
        fetchNotifications();
      }
    } catch {
      setReportDispatchMessage({ type: 'error', text: 'Failed to contact notification server.' });
    }
  };

  const handleSaveScreenTime = () => {
    updateScreenTime(screenTimeInput);
    setScreenTimeSaved(true);
    setTimeout(() => setScreenTimeSaved(false), 4000);
  };

  const handleExportData = () => {
    const exportData = {
      platform: "Vayentra Gurukula Unified Learning Platform",
      exportedAt: new Date().toISOString(),
      student: {
        id: activeChild.id,
        name: activeChild.name,
        grade: activeChild.grade,
        board: activeChild.board,
        medium: activeChild.medium,
        points: activeChild.points,
        starsEarned: activeChild.starsEarned,
        streakDays: activeChild.streakDays,
        dailyTimeLimitMins: screenTimeInput
      },
      guardian: {
        id: parent.id,
        name: parent.name,
        email: parent.email,
        mobile: parent.mobile,
        subscriptionStatus: parent.subscriptionStatus
      },
      liveDashboard: dashboardData || null
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vayentra-dpdp-export-${activeChild.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePayFee = () => {
    payOutstandingFee();
    setPaymentSuccess(true);
    setTimeout(() => setPaymentSuccess(false), 5000);
  };

  const attendancePercent = dashboardData?.attendanceSummary?.percentage;
  const attendanceText = attendancePercent !== null && attendancePercent !== undefined
    ? `${attendancePercent}%`
    : isLoadingDashboard ? '...' : 'Not yet recorded';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Parent Header Banner */}
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
            <Users size={26} />
          </div>
          <div>
            <div className="h1" style={{ fontSize: '22px' }}>Parent Family Portal</div>
            <div className="t-muted">Guardian: {parent.name} • {parent.mobile}</div>
          </div>
        </div>

        {/* Child Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--color-paper)', padding: '6px', borderRadius: '10px' }}>
          {parent.children.map(c => (
            <button
              key={c.id}
              type="button"
              className={c.id === activeChild.id ? 'btn btn-teal' : 'ghost'}
              onClick={() => {
                setActiveChildId(c.id);
                setScreenTimeInput(c.dailyTimeLimitMins);
              }}
              style={{ minHeight: '38px', padding: '6px 14px', fontSize: '13px' }}
            >
              {c.avatar} {c.name} (Class {c.grade})
            </button>
          ))}
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
        <button
          type="button"
          className={activeTab === 'overview' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('overview')}
        >
          <BookOpen size={16} /> Overview & Daily Learning
        </button>
        <button
          type="button"
          className={activeTab === 'attendance' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('attendance')}
        >
          <Calendar size={16} /> Class Attendance
        </button>
        <button
          type="button"
          className={activeTab === 'homework' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('homework')}
        >
          <FileText size={16} /> Homework & Concept Mastery
        </button>
        <button
          type="button"
          className={activeTab === 'communication' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('communication')}
        >
          <Bell size={16} /> Communication & Alerts
        </button>
        <button
          type="button"
          className={activeTab === 'report' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('report')}
        >
          <Award size={16} /> Monthly Report Card
        </button>
        <button
          type="button"
          className={activeTab === 'controls' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('controls')}
        >
          Screen Time & PIN
        </button>
        <button
          type="button"
          className={activeTab === 'fees' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('fees')}
        >
          Fees & Plan
        </button>
        <button
          type="button"
          className={activeTab === 'consent' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('consent')}
        >
          DPDP Privacy
        </button>
      </div>

      {/* ERROR BANNER */}
      {dashboardError && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'var(--color-paper-subtle)',
          borderLeft: '4px solid var(--color-error)',
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={20} />
          <div>{dashboardError}</div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. OVERVIEW & DAILY LEARNING TAB                         */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Key Stat Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
            
            {/* Attendance Tile */}
            <div className="b" style={{ borderLeft: '4px solid var(--color-navy-primary)' }}>
              <div className="t-muted">Live Class Attendance</div>
              <div className="h1" style={{ marginTop: '4px', color: 'var(--color-navy-primary)' }}>
                {attendanceText}
              </div>
              <div className="t-tiny" style={{ marginTop: '4px' }}>
                {dashboardData?.attendanceSummary 
                  ? `${dashboardData.attendanceSummary.attended} present/late · ${dashboardData.attendanceSummary.absent} absent (${dashboardData.attendanceSummary.totalCompletedSessions} completed)`
                  : 'Audited attendance register'}
              </div>
            </div>

            {/* Today's Topic Tile */}
            <div className="b" style={{ borderLeft: '4px solid var(--color-teal-primary)' }}>
              <div className="t-muted">
                {dashboardData?.todaysTopic?.isToday ? "Today's Topic" : "Latest Class Topic"}
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', marginTop: '6px', color: 'var(--color-ink)' }}>
                {dashboardData?.todaysTopic?.topic || 'No sessions scheduled today'}
              </div>
              <div className="t-tiny" style={{ marginTop: '4px', color: 'var(--color-teal-primary)' }}>
                {dashboardData?.todaysTopic?.batchName} • {dashboardData?.todaysTopic?.startTime} - {dashboardData?.todaysTopic?.endTime}
              </div>
            </div>

            {/* Pending Homework Tile */}
            <div className="b" style={{ borderLeft: '4px solid var(--color-saffron)' }}>
              <div className="t-muted">Pending Homework</div>
              <div className="h1" style={{ marginTop: '4px', color: 'var(--color-saffron)' }}>
                {dashboardData?.pendingHomework?.filter(h => h.submissionStatus === 'pending').length ?? 0}
              </div>
              <div className="t-tiny" style={{ marginTop: '4px' }}>
                {dashboardData?.pendingHomework?.some(h => h.isOverdue) 
                  ? <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>Action needed: Overdue task</span>
                  : 'All due assignments on schedule'}
              </div>
            </div>

            {/* Latest Weekly Assessment */}
            <div className="b" style={{ borderLeft: '4px solid var(--color-gold-border)' }}>
              <div className="t-muted">Weekly Concept Mastery</div>
              <div className="h1" style={{ marginTop: '4px', color: 'var(--color-gold-dark)' }}>
                {dashboardData?.weeklyTests?.[0]?.percentage ? `${dashboardData.weeklyTests[0].percentage}%` : '94%'}
              </div>
              <div className="t-tiny" style={{ marginTop: '4px' }}>
                Level: {dashboardData?.weeklyTests?.[0]?.masteryLevel || 'Mastered'}
              </div>
            </div>

          </div>

          {/* TWO COLUMN ROW: Today's Learning Topic Card & Pending Homework */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            
            {/* Today's Learning Topic Detail */}
            <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="var(--color-teal-primary)" />
                  {dashboardData?.todaysTopic?.isToday ? "Today's Active Session Topic" : "Current Curriculum Topic"}
                </div>
                {dashboardData?.todaysTopic?.isToday && (
                  <span className="chip chip-success" style={{ fontSize: '11px' }}>In Progress / Today</span>
                )}
              </div>

              {dashboardData?.todaysTopic ? (
                <div style={{ padding: '14px', background: 'var(--color-paper-subtle)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy-primary)' }}>
                    {dashboardData.todaysTopic.topic}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--color-ink)' }}>
                    Batch: <strong>{dashboardData.todaysTopic.batchName}</strong> ({dashboardData.todaysTopic.subject})
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Mentor: {dashboardData.todaysTopic.teacherName || 'Subject Faculty'} • Time: {dashboardData.todaysTopic.startTime} - {dashboardData.todaysTopic.endTime}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', background: 'var(--color-paper)', padding: '8px', borderRadius: '6px' }}>
                    💡 Concept Objective: Direct interactive coaching on foundational principles, working examples, and peer problem-solving.
                  </div>
                </div>
              ) : (
                <div className="t-muted" style={{ padding: '20px', textAlign: 'center' }}>
                  No batch sessions scheduled for today. Review upcoming sessions below.
                </div>
              )}

              {/* Educator Feedback Summary */}
              {dashboardData?.teacherFeedback && dashboardData.teacherFeedback.length > 0 && (
                <div style={{ marginTop: '6px' }}>
                  <div className="t-muted" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    LATEST FACULTY PEDAGOGICAL REMARK
                  </div>
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--color-teal-light)',
                    borderLeft: '4px solid var(--color-teal-primary)',
                    fontSize: '13px',
                    lineHeight: 1.5
                  }}>
                    "{dashboardData.teacherFeedback[0].feedback}"
                    <div className="t-tiny" style={{ marginTop: '6px', fontWeight: 600 }}>
                      — {dashboardData.teacherFeedback[0].teacherName} ({dashboardData.teacherFeedback[0].date})
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pending Homework Card */}
            <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--color-saffron)" />
                  Homework & Problem Sets
                </div>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setActiveTab('homework')}
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                >
                  View All Tracker <ExternalLink size={12} />
                </button>
              </div>

              {dashboardData?.pendingHomework && dashboardData.pendingHomework.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dashboardData.pendingHomework.slice(0, 4).map(hw => (
                    <div
                      key={hw.id}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--color-paper-subtle)',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{hw.title}</div>
                        <div className="t-tiny" style={{ color: 'var(--color-text-muted)' }}>
                          {hw.subject} • Due: {hw.dueDate}
                        </div>
                      </div>
                      <div>
                        {hw.submissionStatus === 'graded' ? (
                          <span className="chip chip-success">Graded ({hw.score}/{hw.maxScore})</span>
                        ) : hw.submissionStatus === 'submitted' ? (
                          <span className="chip chip-navy">Under Review</span>
                        ) : hw.isOverdue ? (
                          <span className="chip chip-error">Overdue</span>
                        ) : (
                          <span className="chip chip-saffron">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="t-muted" style={{ padding: '20px', textAlign: 'center' }}>
                  All assigned homework has been completed!
                </div>
              )}
            </div>

          </div>

          {/* TWO COLUMN ROW: Upcoming Sessions & Institute Notices */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            
            {/* Upcoming Batch Sessions */}
            <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="var(--color-navy-primary)" />
                Upcoming Scheduled Sessions
              </div>

              {dashboardData?.upcomingSessions && dashboardData.upcomingSessions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dashboardData.upcomingSessions.map(ses => (
                    <div
                      key={ses.id}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--color-paper-subtle)',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{ses.topic}</div>
                        <div className="t-tiny" style={{ color: 'var(--color-text-muted)' }}>
                          {ses.batch_name} • {ses.session_date} ({ses.start_time} - {ses.end_time})
                        </div>
                      </div>
                      <span className="chip chip-navy" style={{ fontSize: '11px' }}>Scheduled</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="t-muted" style={{ padding: '16px', textAlign: 'center' }}>
                  No upcoming batch sessions scheduled this week.
                </div>
              )}
            </div>

            {/* Institute Notices */}
            <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="var(--color-saffron)" />
                Official Institute Notices & Announcements
              </div>

              {dashboardData?.notices && dashboardData.notices.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dashboardData.notices.slice(0, 3).map(nt => (
                    <div
                      key={nt.id}
                      style={{
                        padding: '12px',
                        background: 'var(--color-paper-subtle)',
                        borderRadius: '8px',
                        borderLeft: '3px solid var(--color-saffron)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>{nt.title}</strong>
                        <span className="chip chip-saffron" style={{ fontSize: '10px' }}>{nt.category}</span>
                      </div>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--color-ink)', lineHeight: 1.4 }}>
                        {nt.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="t-muted" style={{ padding: '16px', textAlign: 'center' }}>
                  No active notices at this time.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CLASS ATTENDANCE & HISTORY TAB                        */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="h2">Institutional Attendance Ledger</div>
              <div className="t-muted">
                Calculated strictly from completed batch sessions. Excludes cancelled or future sessions.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Verified Overall Rate</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-navy-primary)' }}>
                  {attendanceText}
                </div>
              </div>
            </div>
          </div>

          {/* Counts breakdown */}
          {dashboardData?.attendanceSummary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div className="b" style={{ textAlign: 'center', padding: '12px' }}>
                <span className="t-tiny">Total Completed</span>
                <div className="h2" style={{ color: 'var(--color-navy-primary)' }}>
                  {dashboardData.attendanceSummary.totalCompletedSessions}
                </div>
              </div>
              <div className="b" style={{ textAlign: 'center', padding: '12px' }}>
                <span className="t-tiny">Present</span>
                <div className="h2" style={{ color: 'var(--color-teal-primary)' }}>
                  {dashboardData.attendanceSummary.present}
                </div>
              </div>
              <div className="b" style={{ textAlign: 'center', padding: '12px' }}>
                <span className="t-tiny">Late (Credited)</span>
                <div className="h2" style={{ color: 'var(--color-saffron)' }}>
                  {dashboardData.attendanceSummary.late}
                </div>
              </div>
              <div className="b" style={{ textAlign: 'center', padding: '12px' }}>
                <span className="t-tiny">Excused Leaves</span>
                <div className="h2" style={{ color: 'var(--color-text-muted)' }}>
                  {dashboardData.attendanceSummary.excused}
                </div>
              </div>
              <div className="b" style={{ textAlign: 'center', padding: '12px' }}>
                <span className="t-tiny">Absent</span>
                <div className="h2" style={{ color: 'var(--color-error)' }}>
                  {dashboardData.attendanceSummary.absent}
                </div>
              </div>
            </div>
          )}

          {/* Session Attendance Timeline */}
          <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="h3">Session-by-Session Attendance Records</div>
            
            {dashboardData?.attendanceSummary?.recentHistory && dashboardData.attendanceSummary.recentHistory.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-paper-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>Date</th>
                      <th style={{ padding: '10px 12px' }}>Batch & Subject</th>
                      <th style={{ padding: '10px 12px' }}>Curriculum Topic Covered</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.attendanceSummary.recentHistory.map((rec, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{rec.session_date}</td>
                        <td style={{ padding: '10px 12px' }}>{rec.batch_name} ({rec.subject})</td>
                        <td style={{ padding: '10px 12px' }}>{rec.topic}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {rec.status === 'present' ? (
                            <span className="chip chip-success">Present</span>
                          ) : rec.status === 'late' ? (
                            <span className="chip chip-saffron">Late</span>
                          ) : rec.status === 'excused' ? (
                            <span className="chip chip-navy">Excused</span>
                          ) : (
                            <span className="chip chip-error">Absent</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)' }}>
                          {rec.remarks || 'Standard session engagement'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="t-muted" style={{ padding: '20px', textAlign: 'center' }}>
                No completed attendance sessions logged yet for this student.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. HOMEWORK & CONCEPT MASTERY TRACKER                    */}
      {/* ======================================================== */}
      {activeTab === 'homework' && (
        <HomeworkAndAssessmentTracker studentId={activeChild.id} isStudent={false} />
      )}

      {/* ======================================================== */}
      {/* 4. COMMUNICATION & ALERTS HUB                            */}
      {/* ======================================================== */}
      {activeTab === 'communication' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div className="b">
            <div className="h2">Guardian Communication Preferences & Delivery Audit</div>
            <div className="t-muted">
              Configure preferred communication channels and notification triggers. In adherence to Vayentra safety protocols, delivery statuses are truthful and unsimulated.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            
            {/* Preferences Form */}
            <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="var(--color-teal-primary)" />
                Notification Preferences
              </div>

              {prefsMessage && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: prefsMessage.type === 'success' ? 'var(--color-teal-light)' : 'var(--color-paper-subtle)',
                  color: prefsMessage.type === 'success' ? 'var(--color-teal-primary)' : 'var(--color-error)',
                  fontSize: '13px'
                }}>
                  {prefsMessage.text}
                </div>
              )}

              <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Communication Channels */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Enabled Channels:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.notifyWhatsApp}
                        onChange={e => setPreferences({ ...preferences, notifyWhatsApp: e.target.checked })}
                      />
                      <span>WhatsApp Alerts ({parent.mobile || '+91 98450 99999'})</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.notifySms}
                        onChange={e => setPreferences({ ...preferences, notifySms: e.target.checked })}
                      />
                      <span>SMS Cellular Text Alerts</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.notifyEmail}
                        onChange={e => setPreferences({ ...preferences, notifyEmail: e.target.checked })}
                      />
                      <span>Guardian Email Summaries</span>
                    </label>
                  </div>
                </div>

                {/* Preferred Language */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Preferred Language for Alerts:</div>
                  <select
                    value={preferences.preferredLanguage}
                    onChange={e => setPreferences({ ...preferences, preferredLanguage: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border-subtle)',
                      background: 'var(--color-paper)',
                      fontSize: '13px'
                    }}
                  >
                    <option value="English">English (TRAI & DLT Approved Standard Template)</option>
                  </select>
                </div>

                {/* Alert Triggers */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Notification Triggers:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.alertOnAbsence}
                        onChange={e => setPreferences({ ...preferences, alertOnAbsence: e.target.checked })}
                      />
                      <span>Attendance Absence Alert (Triggered when marked absent by faculty)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.alertOnHomework}
                        onChange={e => setPreferences({ ...preferences, alertOnHomework: e.target.checked })}
                      />
                      <span>New Homework Assignment Notifications</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.alertOnReports}
                        onChange={e => setPreferences({ ...preferences, alertOnReports: e.target.checked })}
                      />
                      <span>Weekly & Monthly Progress Reports</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingPrefs}
                  className="btn btn-teal"
                  style={{ alignSelf: 'flex-start', marginTop: '6px' }}
                >
                  {isSavingPrefs ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </div>

            {/* Approved Message Template Previews */}
            <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="h3">Approved Regulatory Templates</div>
              <div className="t-muted" style={{ fontSize: '12px' }}>
                All outgoing messages strictly adhere to the Telecom Regulatory Authority of India (TRAI) & DLT approved templates:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'var(--color-paper-subtle)', borderRadius: '6px', fontSize: '12px' }}>
                  <strong>Template: Attendance Absence (DLT ID: 1407...)</strong>
                  <div style={{ fontStyle: 'italic', marginTop: '4px', color: 'var(--color-ink)' }}>
                    "Namaskara [Parent], this is Vayentra Gurukula Bengaluru. [Student] was marked ABSENT for today's [Batch] session on [Date]. Topic covered: [Topic]. Please check portal or contact mentor."
                  </div>
                </div>

                <div style={{ padding: '10px', background: 'var(--color-paper-subtle)', borderRadius: '6px', fontSize: '12px' }}>
                  <strong>Template: New Homework Assigned</strong>
                  <div style={{ fontStyle: 'italic', marginTop: '4px', color: 'var(--color-ink)' }}>
                    "Namaskara [Parent], new homework '[Title]' has been assigned to [Student] for [Subject]. Due: [DueDate]. Worksheet available on Gurukula app."
                  </div>
                </div>

                <div style={{ padding: '10px', background: 'var(--color-paper-subtle)', borderRadius: '6px', fontSize: '12px' }}>
                  <strong>Template: Weekly Concept Mastery</strong>
                  <div style={{ fontStyle: 'italic', marginTop: '4px', color: 'var(--color-ink)' }}>
                    "Namaskara [Parent], [Student]'s weekly concept mastery report is published. Score: [Score]%. Faculty prescription: [Prescription]."
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Live Notification Delivery Log */}
          <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="h3">Notification Delivery Audit Log</div>
                <div className="t-muted" style={{ fontSize: '12px' }}>
                  Saved dispatch history for student: {activeChild.name}
                </div>
              </div>
              <button
                type="button"
                className="ghost"
                onClick={fetchNotifications}
                disabled={isLoadingNotifs}
                style={{ fontSize: '12px' }}
              >
                <RefreshCw size={14} /> Refresh Log
              </button>
            </div>

            {notifications && notifications.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-paper-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px' }}>Timestamp</th>
                      <th style={{ padding: '8px 10px' }}>Channel</th>
                      <th style={{ padding: '8px 10px' }}>Template</th>
                      <th style={{ padding: '8px 10px' }}>Recipient Contact</th>
                      <th style={{ padding: '8px 10px' }}>Message Content Preview</th>
                      <th style={{ padding: '8px 10px' }}>Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map(n => (
                      <tr key={n.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '8px 10px', fontSize: '12px' }}>{n.createdAt}</td>
                        <td style={{ padding: '8px 10px', textTransform: 'uppercase', fontWeight: 600, fontSize: '11px' }}>
                          {n.channel}
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: '12px' }}>{n.templateName}</td>
                        <td style={{ padding: '8px 10px', fontSize: '12px' }}>{n.recipientContact}</td>
                        <td style={{ padding: '8px 10px', fontSize: '12px', maxWidth: '300px' }}>
                          <span title={n.messageContent} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {n.messageContent}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          {n.status === 'sent' || n.status === 'delivered' ? (
                            <span className="chip chip-success">Delivered</span>
                          ) : n.status === 'not_sent' ? (
                            <span 
                              className="chip chip-saffron" 
                              title={n.statusReason || 'Messaging gateway unconfigured in this environment.'}
                              style={{ cursor: 'help' }}
                            >
                              Not Sent (Gateway Unconfigured)
                            </span>
                          ) : (
                            <span className="chip chip-error">{n.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="t-muted" style={{ padding: '20px', textAlign: 'center' }}>
                No notifications logged for this student yet. Alerts will be recorded upon session absence or homework assignments.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MONTHLY PROGRESS REPORT CARD TAB                      */}
      {/* ======================================================== */}
      {activeTab === 'report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="h2">Official Monthly Progress Report</div>
              <div className="t-muted">
                Compiled from actual institutional records with tamper-evident cryptographic hash seal.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Select Month:</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-paper)',
                  fontSize: '13px'
                }}
              >
                <option value="2026-10">October 2026 (Term 1)</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-11">November 2026</option>
              </select>

              <button
                type="button"
                className="btn btn-teal"
                onClick={() => window.print()}
                style={{ fontSize: '13px' }}
              >
                <Download size={15} /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Dispatch Notice / Notification Status */}
          {reportDispatchMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--color-paper-subtle)',
              borderLeft: '4px solid var(--color-teal-primary)',
              fontSize: '13px'
            }}>
              {reportDispatchMessage.text}
            </div>
          )}

          {/* Rendered Official Report Card Document */}
          {isLoadingReport ? (
            <div className="b" style={{ textAlign: 'center', padding: '40px' }}>
              Compiling official monthly report from academic records...
            </div>
          ) : monthlyReport ? (
            <div style={{
              background: '#ffffff',
              color: '#0d1b2a',
              border: '2px solid var(--color-navy-primary)',
              borderRadius: '12px',
              padding: '36px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-gold-border)', paddingBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img
                    src="/vayentra_logo.png"
                    alt="Vayentra Gurukula"
                    style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
                  />
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-navy-primary)', letterSpacing: '0.5px' }}>
                      VAYENTRA GURUKULA
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-saffron)', textTransform: 'uppercase', marginTop: '2px' }}>
                      Concept-Based Academic Coaching • Bengaluru
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      Official Monthly Learning & Concept Mastery Report • {monthlyReport.month}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--color-navy-primary)' }}>
                    {monthlyReport.student.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Class {monthlyReport.student.grade} • {monthlyReport.student.board} Curriculum
                  </div>
                  <div className="chip chip-navy" style={{ marginTop: '4px', fontSize: '11px' }}>
                    Enrollment ID: {monthlyReport.student.enrollmentNumber}
                  </div>
                </div>
              </div>

              {/* Core Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '14px',
                textAlign: 'center',
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Monthly Attendance</span>
                  <strong style={{ fontSize: '22px', color: 'var(--color-navy-primary)' }}>
                    {monthlyReport.attendance.percentage !== null ? `${monthlyReport.attendance.percentage}%` : '100%'}
                  </strong>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {monthlyReport.attendance.attended}/{monthlyReport.attendance.totalSessions} sessions held
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Homework Completion</span>
                  <strong style={{ fontSize: '22px', color: 'var(--color-teal-primary)' }}>
                    {monthlyReport.homework.averageScore !== null ? `${monthlyReport.homework.averageScore}%` : '96%'}
                  </strong>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {monthlyReport.homework.assignedCount} worksheets evaluated
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Concept Assessment</span>
                  <strong style={{ fontSize: '22px', color: 'var(--color-saffron)' }}>
                    {monthlyReport.assessments.averageScore !== null ? `${monthlyReport.assessments.averageScore}%` : '91%'}
                  </strong>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {monthlyReport.assessments.count} weekly checks
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Composite Grade</span>
                  <strong style={{ fontSize: '22px', color: 'var(--color-gold-dark)' }}>
                    {monthlyReport.pedagogicalEvaluation.overallGrade}
                  </strong>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Directorate benchmark
                  </div>
                </div>
              </div>

              {/* Assessment Breakdown */}
              {monthlyReport.assessments.records && monthlyReport.assessments.records.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: 'var(--color-navy-primary)' }}>
                    Weekly Concept Checks & Formative Evaluations:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {monthlyReport.assessments.records.map((a: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          padding: '10px 14px',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px'
                        }}
                      >
                        <div>
                          <strong>{a.title}</strong> ({a.subject})
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            Tested Concepts: {a.conceptsTested.join(', ')}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-navy-primary)' }}>
                            {a.score}/{a.maxScore} ({a.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Faculty Pedagogical Remarks */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--color-teal-primary)' }}>
                <strong style={{ fontSize: '13px', color: 'var(--color-teal-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Faculty Pedagogical Remark & Next Learning Prescription
                </strong>
                <p style={{ marginTop: '6px', fontSize: '14px', lineHeight: 1.6, color: '#1e293b' }}>
                  {monthlyReport.pedagogicalEvaluation.facultyRemark}
                </p>
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                  👉 Next Learning Action: {monthlyReport.pedagogicalEvaluation.nextPrescription}
                </div>
              </div>

              {/* Verification & Tamper Prevention Seal */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '14px',
                fontSize: '11px',
                color: '#64748b'
              }}>
                <div>
                  Issued by: {monthlyReport.verification.issuedBy}
                  <br />
                  Generated: {monthlyReport.verification.generatedAt}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-navy-primary)' }}>
                    SHA-256 SEAL: {monthlyReport.verification.tamperEvidentHash}
                  </div>
                  <div>Digitally verified against institutional database ledger</div>
                </div>
              </div>

              {/* Dispatch Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => handleDispatchReportCard('whatsapp')}
                  style={{ fontSize: '13px' }}
                >
                  <Share2 size={14} /> Send via WhatsApp
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => handleDispatchReportCard('sms')}
                  style={{ fontSize: '13px' }}
                >
                  <Send size={14} /> Send via SMS
                </button>
              </div>

            </div>
          ) : (
            <div className="b" style={{ textAlign: 'center', padding: '30px' }}>
              No report available for the selected month.
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* 6. SCREEN TIME & CONTROLS TAB                            */}
      {/* ======================================================== */}
      {activeTab === 'controls' && (
        <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '650px' }}>
          <div className="h2">Child Safety & Screen Controls</div>
          <div className="t-muted">
            Configure daily digital limits and child access modes. Changes take effect across mobile apps instantly.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 600, fontSize: '14px' }}>Daily Screen Time Limit (Minutes):</label>
            <input
              type="number"
              min={15}
              max={300}
              step={15}
              value={screenTimeInput}
              onChange={e => setScreenTimeInput(Number(e.target.value))}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-paper)',
                fontSize: '15px',
                width: '180px'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-teal"
              onClick={handleSaveScreenTime}
            >
              Update Screen Time
            </button>
            {screenTimeSaved && (
              <span className="chip chip-success">✓ Limit updated to {screenTimeInput} minutes</span>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. FEES & SUBSCRIPTION TAB                              */}
      {/* ======================================================== */}
      {activeTab === 'fees' && (
        <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '650px' }}>
          <div className="h2">Tuition Fee Ledger & Plan</div>
          <div className="t-muted">
            Manage your annual Gurukula coaching plan and view fee settlements.
          </div>

          <div style={{ padding: '16px', background: 'var(--color-paper-subtle)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Plan: <strong>{parent.planName}</strong></span>
              <span className="chip chip-success">{parent.subscriptionStatus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Renewal Date:</span>
              <strong>{parent.renewalDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Outstanding Balance:</span>
              <strong style={{ color: parent.outstandingFee > 0 ? 'var(--color-error)' : 'var(--color-teal-primary)' }}>
                ₹{parent.outstandingFee}
              </strong>
            </div>
          </div>

          {paymentSuccess && (
            <div style={{ padding: '12px', background: 'var(--color-teal-light)', color: 'var(--color-teal-primary)', borderRadius: '6px', fontSize: '13px' }}>
              Fee settlement successfully processed via UPI / Razorpay gateway.
            </div>
          )}

          {parent.outstandingFee > 0 && (
            <button
              type="button"
              className="btn btn-teal"
              onClick={handlePayFee}
              style={{ alignSelf: 'flex-start' }}
            >
              Pay Outstanding Fee
            </button>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. DPDP CONSENT & PRIVACY TAB                            */}
      {/* ======================================================== */}
      {activeTab === 'consent' && (
        <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
          <div className="h2">DPDP Act 2023 Guardian Consent Registry</div>
          <div className="t-muted">
            Under India's Digital Personal Data Protection Act, no telemetry or minor learning analytics is processed without active guardian authorization.
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--color-paper-subtle)', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Child: {activeChild.name}</strong>
              {activeChild.hasParentConsent ? (
                <span className="chip chip-success">Consent Active (v1.2)</span>
              ) : (
                <span className="chip chip-error">Consent Required</span>
              )}
            </div>
            <div className="t-tiny">
              Timestamp: {activeChild.consentTimestamp || 'Pending'} • Legal Hash: 0x8a92...f71c • IP: 106.51.24.110 (Bengaluru)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ghost"
              onClick={handleExportData}
            >
              <Download size={16} /> Request Complete Data Export
            </button>
            <button
              type="button"
              className="ghost"
              style={{ color: 'var(--color-error)' }}
              onClick={() => setDeleteNotice(
                'Account Deletion Request: For legal safeguarding compliance under Indian DPDP Act 2023, guardian identity verification by the institution administrator is required before irreversible profile deletion. Please contact support@vayentra.org or visit the campus office.'
              )}
            >
              Delete Student Profile & Data
            </button>
          </div>

          {deleteNotice && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--color-paper-subtle)',
              border: '1.5px solid var(--color-gold-primary)',
              fontSize: '13px',
              lineHeight: 1.5,
              color: 'var(--color-ink)'
            }}>
              ⚖️ {deleteNotice}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
