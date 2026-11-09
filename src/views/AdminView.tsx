import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CbseVideoStudio } from '../components/CbseVideoStudio';
import { AdmissionsInbox } from '../components/AdmissionsInbox';
import { OneJourneyAdmin } from '../components/OneJourneyAdmin';
import { OneCurriculumStudio } from '../components/OneCurriculumStudio';
import { OneAdmissionReview } from '../components/OneAdmissionReview';
import { 
  SlidersHorizontal, 
  Upload, 
  FileSpreadsheet, 
  DollarSign, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  UserPlus, 
  GraduationCap, 
  Calendar, 
  Clock, 
  ArrowRightLeft, 
  UserX, 
  UserCheck, 
  Eye, 
  X, 
  BookOpen, 
  Layers,
  MapPin,
  ShieldCheck,
  Check
} from 'lucide-react';

interface StudentData {
  id: string;
  enrollmentNumber: string;
  name: string;
  avatar: string;
  grade: number;
  board: string;
  medium: string;
  schoolName: string;
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
  dob?: string;
  notes?: string;
  activeBatchesCount: number;
  guardian: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    emergencyPhone?: string;
    subscriptionStatus: string;
    planName: string;
  };
}

interface BatchData {
  id: string;
  name: string;
  grade: number;
  board: string;
  subject: string;
  teacherId?: string;
  teacherName: string;
  teacherEmail?: string;
  maxCapacity: number;
  enrolledCount: number;
  availableSeats: number;
  isFull: boolean;
  status: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  room: string;
}

interface TeacherData {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  qualification: string;
  specialization: string;
  phone?: string;
  status: string;
  activeBatchCount: number;
}

export const AdminView: React.FC = () => {
  const { authToken } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'batches' | 'teachers' | 'attendance' | 'import' | 'finance' | 'ai_gov' | 'video_library' | 'enquiries' | 'one_journey' | 'curriculum_one' | 'one_applications'>('students');

  // Students State
  const [students, setStudents] = useState<StudentData[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentGradeFilter, setStudentGradeFilter] = useState('');
  const [studentBoardFilter, setStudentBoardFilter] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Batches State
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [batchSearch, setBatchSearch] = useState('');
  const [batchGradeFilter, setBatchGradeFilter] = useState('');
  const [batchBoardFilter, setBatchBoardFilter] = useState('');
  const [batchesLoading, setBatchesLoading] = useState(false);

  // Teachers State
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  // Guardians list for dropdown
  const [guardians, setGuardians] = useState<{ id: string; name: string; email: string; mobile: string }[]>([]);

  // Attendance Reporting State
  const [batchReports, setBatchReports] = useState<{
    batchId: string;
    name: string;
    grade: number;
    board: string;
    subject: string;
    completedSessionsCount: number;
    enrolledCount: number;
    batchAttendancePercent: number | null;
    students: {
      studentId: string;
      name: string;
      enrollmentNumber: string;
      recordedSessions: number;
      attended: number;
      absent: number;
      excused: number;
      percentage: number | null;
    }[];
  }[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<{
    month: string;
    sessionsHeld: number;
    totalMarks: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    attended: number;
    attendancePercent: number | null;
  }[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceViewMode, setAttendanceViewMode] = useState<'batch' | 'monthly'>('batch');
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  // Modals State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState<StudentData | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ status: string; uptime: number; db: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then(r => r.json())
      .then(d => {
        if (d.status) setHealthStatus({ status: d.status, uptime: d.uptimeSeconds, db: d.database });
      })
      .catch(() => setHealthStatus(null));
  }, []);

  // Registration Form
  const [regName, setRegName] = useState('');
  const [regGrade, setRegGrade] = useState('7');
  const [regBoard, setRegBoard] = useState('CBSE');
  const [regMedium, setRegMedium] = useState('English');
  const [regSchool, setRegSchool] = useState('Vayentra Gurukula Academy');
  const [guardianMode, setGuardianMode] = useState<'existing' | 'new'>('new');
  const [regGuardianId, setRegGuardianId] = useState('');
  const [regGuardianName, setRegGuardianName] = useState('');
  const [regGuardianEmail, setRegGuardianEmail] = useState('');
  const [regGuardianPhone, setRegGuardianPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regNotes, setRegNotes] = useState('');
  const [regSelectedBatches, setRegSelectedBatches] = useState<string[]>([]);
  const [submittingReg, setSubmittingReg] = useState(false);

  // Batch Form
  const [batchName, setBatchName] = useState('');
  const [batchGrade, setBatchGrade] = useState('7');
  const [batchBoard, setBatchBoard] = useState('CBSE');
  const [batchSubject, setBatchSubject] = useState('Mathematics');
  const [batchTeacherId, setBatchTeacherId] = useState('');
  const [batchCapacity, setBatchCapacity] = useState('30');
  const [batchStartTime, setBatchStartTime] = useState('17:30');
  const [batchEndTime, setBatchEndTime] = useState('18:30');
  const [batchDays, setBatchDays] = useState<string[]>(['MON', 'WED', 'FRI']);
  const [batchRoom, setBatchRoom] = useState('Gurukula Ramanujan Hall');
  const [submittingBatch, setSubmittingBatch] = useState(false);

  // Teacher Form
  const [tchName, setTchName] = useState('');
  const [tchEmail, setTchEmail] = useState('');
  const [tchQual, setTchQual] = useState('M.Sc., B.Ed., State Board Examiner');
  const [tchSpec, setTchSpec] = useState('Mathematics & Mental Maths');
  const [tchPhone, setTchPhone] = useState('');
  const [submittingTch, setSubmittingTch] = useState(false);

  // Enrollment / Transfer Modal Form
  const [enrollBatchId, setEnrollBatchId] = useState('');
  const [transferSourceBatchId, setTransferSourceBatchId] = useState('');
  const [transferTargetBatchId, setTransferTargetBatchId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  // Import Sim
  const [importProcessed, setImportProcessed] = useState(false);

  const fetchHeaders = {
    'Authorization': `Bearer ${authToken || localStorage.getItem('vayentra_token')}`,
    'Content-Type': 'application/json'
  };

  const showNotification = (success: string | null, error: string | null = null) => {
    if (success) {
      setSuccessMsg(success);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
    if (error) {
      setErrorMsg(error);
      setTimeout(() => setErrorMsg(null), 6000);
    }
  };

  // Fetch Students
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const params = new URLSearchParams();
      if (studentSearch) params.append('search', studentSearch);
      if (studentGradeFilter) params.append('grade', studentGradeFilter);
      if (studentBoardFilter) params.append('board', studentBoardFilter);
      if (studentStatusFilter) params.append('status', studentStatusFilter);

      const res = await fetch(`/api/v1/admin/students?${params.toString()}`, { headers: fetchHeaders });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch Batches
  const fetchBatches = async () => {
    setBatchesLoading(true);
    try {
      const params = new URLSearchParams();
      if (batchSearch) params.append('search', batchSearch);
      if (batchGradeFilter) params.append('grade', batchGradeFilter);
      if (batchBoardFilter) params.append('board', batchBoardFilter);

      const res = await fetch(`/api/v1/admin/batches?${params.toString()}`, { headers: fetchHeaders });
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setBatchesLoading(false);
    }
  };

  // Fetch Teachers
  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const res = await fetch('/api/v1/admin/teachers', { headers: fetchHeaders });
      const data = await res.json();
      if (data.success) {
        setTeachers(data.teachers);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setTeachersLoading(false);
    }
  };

  // Fetch Guardians
  const fetchGuardians = async () => {
    try {
      const res = await fetch('/api/v1/admin/guardians', { headers: fetchHeaders });
      const data = await res.json();
      if (data.success) {
        setGuardians(data.guardians);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  // Fetch Attendance Reports
  const fetchAttendanceReports = async () => {
    setAttendanceLoading(true);
    try {
      const [batchRes, monthRes] = await Promise.all([
        fetch('/api/v1/attendance/reports/batches', { headers: fetchHeaders }),
        fetch('/api/v1/attendance/reports/monthly', { headers: fetchHeaders })
      ]);
      if (batchRes.ok) {
        const bData = await batchRes.json();
        setBatchReports(bData.report || []);
      }
      if (monthRes.ok) {
        const mData = await monthRes.json();
        setMonthlyReports(mData.report || []);
      }
    } catch (e: any) {
      console.error('Error fetching attendance reports:', e);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchBatches();
    fetchTeachers();
    fetchGuardians();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendanceReports();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchStudents();
  }, [studentSearch, studentGradeFilter, studentBoardFilter, studentStatusFilter]);

  useEffect(() => {
    fetchBatches();
  }, [batchSearch, batchGradeFilter, batchBoardFilter]);

  // Handle Student Status Toggle
  const handleToggleStudentStatus = async (student: StudentData) => {
    const nextStatus = student.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/v1/admin/students/${student.id}/status`, {
        method: 'PATCH',
        headers: fetchHeaders,
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update student status');
      }
      showNotification(`Student ${student.name} marked ${nextStatus.toUpperCase()}`);
      fetchStudents();
    } catch (err: any) {
      showNotification(null, err.message);
    }
  };

  // Open Manage Batches Modal for Student
  const handleOpenEnrollModal = async (student: StudentData) => {
    setSelectedStudentForEnroll(student);
    setEnrollBatchId('');
    setTransferSourceBatchId('');
    setTransferTargetBatchId('');
    setShowEnrollModal(true);

    // Fetch this student's current enrollments
    try {
      const res = await fetch(`/api/v1/admin/students/${student.id}`, { headers: fetchHeaders });
      const data = await res.json();
      if (data.success) {
        setStudentEnrollments(data.enrollments || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Enroll Student in Batch
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEnroll || !enrollBatchId) return;

    setEnrollSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/batches/${enrollBatchId}/enroll`, {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({ studentId: selectedStudentForEnroll.id, notes: 'Enrolled via Admin Console' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Enrollment failed.');
      }

      showNotification(data.message);
      // Refresh enrollments
      handleOpenEnrollModal(selectedStudentForEnroll);
      fetchStudents();
      fetchBatches();
    } catch (err: any) {
      showNotification(null, err.message);
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // Transfer Student Batch
  const handleTransferStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEnroll || !transferSourceBatchId || !transferTargetBatchId) return;

    setEnrollSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/batches/${transferSourceBatchId}/transfer`, {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({
          studentId: selectedStudentForEnroll.id,
          targetBatchId: transferTargetBatchId,
          reason: transferReason || 'Batch realignment by Admin'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Transfer failed.');
      }

      showNotification(data.message);
      handleOpenEnrollModal(selectedStudentForEnroll);
      fetchStudents();
      fetchBatches();
    } catch (err: any) {
      showNotification(null, err.message);
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // Register Student Submit
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName) {
      showNotification(null, 'Student name is required');
      return;
    }

    setSubmittingReg(true);
    try {
      const payload: any = {
        name: regName,
        grade: Number(regGrade),
        board: regBoard,
        medium: regMedium,
        schoolName: regSchool,
        dob: regDob,
        notes: regNotes,
        initialBatchIds: regSelectedBatches
      };

      if (guardianMode === 'existing') {
        if (!regGuardianId) throw new Error('Please select an existing guardian');
        payload.guardianId = regGuardianId;
      } else {
        if (!regGuardianName || (!regGuardianEmail && !regGuardianPhone)) {
          throw new Error('Guardian Name and either an email or mobile phone are required');
        }
        payload.guardianName = regGuardianName;
        payload.guardianEmail = regGuardianEmail;
        payload.guardianPhone = regGuardianPhone;
      }

      const res = await fetch('/api/v1/admin/students', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      showNotification(data.message);
      setShowRegisterModal(false);
      // Reset form
      setRegName('');
      setRegGuardianName('');
      setRegGuardianEmail('');
      setRegGuardianPhone('');
      setRegSelectedBatches([]);
      fetchStudents();
      fetchBatches();
      fetchGuardians();
    } catch (err: any) {
      showNotification(null, err.message);
    } finally {
      setSubmittingReg(false);
    }
  };

  // Create Batch Submit
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName || !batchSubject) {
      showNotification(null, 'Batch name and subject are required');
      return;
    }

    setSubmittingBatch(true);
    try {
      const payload = {
        name: batchName,
        grade: Number(batchGrade),
        board: batchBoard,
        subject: batchSubject,
        teacherId: batchTeacherId || undefined,
        maxCapacity: Number(batchCapacity),
        startTime: batchStartTime,
        endTime: batchEndTime,
        daysOfWeek: batchDays,
        room: batchRoom
      };

      const res = await fetch('/api/v1/admin/batches', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Batch creation failed');
      }

      showNotification(data.message);
      setShowBatchModal(false);
      setBatchName('');
      fetchBatches();
    } catch (err: any) {
      showNotification(null, err.message);
    } finally {
      setSubmittingBatch(false);
    }
  };

  // Create Teacher Submit
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tchName || !tchEmail) {
      showNotification(null, 'Faculty name and institutional email are required');
      return;
    }

    setSubmittingTch(true);
    try {
      const res = await fetch('/api/v1/admin/teachers', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({
          name: tchName,
          email: tchEmail,
          qualification: tchQual,
          specialization: tchSpec,
          phone: tchPhone
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Teacher creation failed');
      }

      showNotification(data.message);
      setShowTeacherModal(false);
      setTchName('');
      setTchEmail('');
      setTchPhone('');
      fetchTeachers();
    } catch (err: any) {
      showNotification(null, err.message);
    } finally {
      setSubmittingTch(false);
    }
  };

  const handleSimulateImport = () => {
    setImportProcessed(true);
    setTimeout(() => setImportProcessed(false), 6000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Admin Header */}
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
            <SlidersHorizontal size={26} />
          </div>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div className="h1" style={{ fontSize: 'clamp(18px, 4vw, 22px)', wordBreak: 'break-word' }}>Super Admin & Operations Console</div>
            <div className="t-muted" style={{ fontSize: '13px' }}>Vayentra Gurukula • Student Enrollment, Faculty & Batch Management (Classes 1–10)</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span className={`chip ${healthStatus ? 'chip-teal' : 'chip-saffron'}`}>
            {healthStatus ? `Gateway: ${healthStatus.status} (${healthStatus.db})` : 'Gateway: Offline'}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="b" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--color-success)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="b" style={{ background: 'var(--color-error-bg)', borderColor: 'var(--color-error)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
        <button
          type="button"
          className={activeTab === 'students' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('students')}
        >
          <Users size={16} /> Students Roster & Admissions
        </button>
        <button
          type="button"
          className={activeTab === 'batches' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('batches')}
        >
          <Layers size={16} /> Batches & Timetable
        </button>
        <button
          type="button"
          className={activeTab === 'teachers' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('teachers')}
        >
          <GraduationCap size={16} /> Faculty Staff
        </button>
        <button
          type="button"
          className={activeTab === 'attendance' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('attendance')}
        >
          <Clock size={16} /> Attendance Overview
        </button>
        <button
          type="button"
          className={activeTab === 'import' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('import')}
        >
          <Upload size={16} /> Bulk Roster Import
        </button>
        <button
          type="button"
          className={activeTab === 'finance' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('finance')}
        >
          <DollarSign size={16} /> Collections & Ledger
        </button>
        <button
          type="button"
          className={activeTab === 'ai_gov' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('ai_gov')}
        >
          <Cpu size={16} /> AI Governance
        </button>
        <button type="button" className={activeTab === 'video_library' ? 'btn btn-teal' : 'ghost'} onClick={() => setActiveTab('video_library')}>
          <BookOpen size={16} /> CBSE Video Library
        </button>
        <button type="button" className={activeTab === 'enquiries' ? 'btn btn-teal' : 'ghost'} onClick={() => setActiveTab('enquiries')}>
          <UserPlus size={16} /> Admissions Enquiries
        </button>
        <button type="button" className={activeTab === 'one_journey' ? 'btn btn-teal' : 'ghost'} onClick={() => setActiveTab('one_journey')}>
          <GraduationCap size={16} /> Vayentra ONE
        </button>
        <button type="button" className={activeTab === 'curriculum_one' ? 'btn btn-teal' : 'ghost'} onClick={() => setActiveTab('curriculum_one')}>
          <BookOpen size={16} /> ONE Curriculum Studio
        </button>
        <button type="button" className={activeTab === 'one_applications' ? 'btn btn-teal' : 'ghost'} onClick={() => setActiveTab('one_applications')}><UserPlus size={16}/> ONE Enrolment Applications</button>
      </div>

      {/* ======================================================== */}
      {/* 1. STUDENTS TAB */}
      {/* ======================================================== */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar */}
          <div className="b" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <input
                  type="text"
                  placeholder="Search by student name, VG enrollment number, or guardian..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '34px', fontSize: '13px' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--color-text-subtle)' }} />
              </div>

              {/* Grade Filter */}
              <select
                value={studentGradeFilter}
                onChange={e => setStudentGradeFilter(e.target.value)}
                style={{ fontSize: '13px', minHeight: '38px', padding: '6px 12px' }}
              >
                <option value="">All Classes (1–10)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                  <option key={g} value={g}>Class {g}</option>
                ))}
              </select>

              {/* Board Filter */}
              <select
                value={studentBoardFilter}
                onChange={e => setStudentBoardFilter(e.target.value)}
                style={{ fontSize: '13px', minHeight: '38px', padding: '6px 12px' }}
              >
                <option value="">All Boards</option>
                <option value="CBSE">CBSE</option>
                <option value="STATE_KARNATAKA">Karnataka State Board</option>
                <option value="ICSE">ICSE</option>
              </select>

              {/* Status Filter */}
              <select
                value={studentStatusFilter}
                onChange={e => setStudentStatusFilter(e.target.value)}
                style={{ fontSize: '13px', minHeight: '38px', padding: '6px 12px' }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-teal"
              onClick={() => setShowRegisterModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={16} /> Register Student
            </button>
          </div>

          {/* Students Table */}
          <div className="b" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ background: 'var(--color-paper-subtle)', borderBottom: '1.5px solid var(--color-border-subtle)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Student Profile</th>
                    <th style={{ padding: '12px 16px' }}>Curriculum</th>
                    <th style={{ padding: '12px 16px' }}>Linked Guardian</th>
                    <th style={{ padding: '12px 16px' }}>Batches</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-subtle)' }}>
                        Loading student records...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-subtle)' }}>
                        No students found matching your criteria. Click "Register Student" to admit a learner.
                      </td>
                    </tr>
                  ) : (
                    students.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'var(--color-paper-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px'
                            }}>
                              {s.avatar || '🦊'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{s.name}</div>
                              <div className="t-tiny" style={{ color: 'var(--color-teal-primary)', fontWeight: 600 }}>
                                {s.enrollmentNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div className="chip chip-navy" style={{ fontWeight: 600 }}>
                            Class {s.grade} · {s.board === 'STATE_KARNATAKA' ? 'State Board' : s.board}
                          </div>
                          <div className="t-tiny" style={{ marginTop: '2px', color: 'var(--color-text-subtle)' }}>
                            {s.medium} Medium
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{s.guardian.name}</div>
                          <div className="t-tiny" style={{ color: 'var(--color-text-subtle)' }}>
                            {s.guardian.mobile || s.guardian.email}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`chip ${s.activeBatchesCount > 0 ? 'chip-teal' : 'chip-saffron'}`}>
                            {s.activeBatchesCount} Active {s.activeBatchesCount === 1 ? 'Batch' : 'Batches'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`chip ${s.status === 'active' ? 'chip-teal' : 'chip-saffron'}`} style={{ textTransform: 'capitalize' }}>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => handleOpenEnrollModal(s)}
                              title="Manage batch enrollments & transfers"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            >
                              <ArrowRightLeft size={14} /> Batches
                            </button>
                            <button
                              type="button"
                              className={`ghost ${s.status === 'active' ? '' : 'btn-teal'}`}
                              onClick={() => handleToggleStudentStatus(s)}
                              title={s.status === 'active' ? 'Mark student as Inactive' : 'Restore student as Active'}
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            >
                              {s.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                          </div>
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

      {/* ======================================================== */}
      {/* 2. BATCHES & TIMETABLE TAB */}
      {/* ======================================================== */}
      {activeTab === 'batches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar */}
          <div className="b" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <input
                  type="text"
                  placeholder="Search batches by name, subject, or faculty..."
                  value={batchSearch}
                  onChange={e => setBatchSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '34px', fontSize: '13px' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--color-text-subtle)' }} />
              </div>

              <select
                value={batchGradeFilter}
                onChange={e => setBatchGradeFilter(e.target.value)}
                style={{ fontSize: '13px', minHeight: '38px', padding: '6px 12px' }}
              >
                <option value="">All Classes (1–10)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                  <option key={g} value={g}>Class {g}</option>
                ))}
              </select>

              <select
                value={batchBoardFilter}
                onChange={e => setBatchBoardFilter(e.target.value)}
                style={{ fontSize: '13px', minHeight: '38px', padding: '6px 12px' }}
              >
                <option value="">All Boards</option>
                <option value="CBSE">CBSE</option>
                <option value="STATE_KARNATAKA">Karnataka State Board</option>
                <option value="ICSE">ICSE</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-teal"
              onClick={() => setShowBatchModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Create Tuition Batch
            </button>
          </div>

          {/* Batches Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {batchesLoading ? (
              <div className="b" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px' }}>
                Loading tuition batches...
              </div>
            ) : batches.length === 0 ? (
              <div className="b" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px' }}>
                No batches found. Create one with the "+ Create Tuition Batch" button.
              </div>
            ) : (
              batches.map(b => (
                <div key={b.id} className="b" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="chip chip-navy" style={{ fontWeight: 700, marginBottom: '6px' }}>
                        Class {b.grade} · {b.board === 'STATE_KARNATAKA' ? 'State Board' : b.board}
                      </div>
                      <div className="h3" style={{ fontSize: '16px' }}>{b.name}</div>
                      <div className="t-tiny" style={{ color: 'var(--color-teal-primary)', fontWeight: 600 }}>
                        Subject: {b.subject}
                      </div>
                    </div>
                    <span className={`chip ${b.isFull ? 'chip-saffron' : 'chip-teal'}`}>
                      {b.isFull ? 'Full' : `${b.availableSeats} Open`}
                    </span>
                  </div>

                  {/* Schedule Details */}
                  <div style={{
                    background: 'var(--color-paper-subtle)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="var(--color-teal-primary)" />
                      <span style={{ fontWeight: 600 }}>{b.daysOfWeek.join(' • ')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="var(--color-teal-primary)" />
                      <span>{b.startTime} – {b.endTime} IST</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--color-teal-primary)" />
                      <span>{b.room}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <GraduationCap size={14} color="var(--color-teal-primary)" />
                      <span>Faculty: <strong>{b.teacherName}</strong></span>
                    </div>
                  </div>

                  {/* Capacity Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span>Enrolled Students</span>
                      <strong>{b.enrolledCount} / {b.maxCapacity}</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--color-border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, Math.round((b.enrolledCount / b.maxCapacity) * 100))}%`,
                        height: '100%',
                        background: b.isFull ? 'var(--color-saffron)' : 'var(--color-teal-primary)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. FACULTY & TEACHERS TAB */}
      {/* ======================================================== */}
      {activeTab === 'teachers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="b" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="h2" style={{ fontSize: '18px' }}>Faculty Staff & Mentors</div>
              <div className="t-muted">Certified Gurukula teachers assigned to tuition batches and concept doubt resolution.</div>
            </div>
            <button
              type="button"
              className="btn btn-teal"
              onClick={() => setShowTeacherModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={16} /> Add Faculty Member
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {teachersLoading ? (
              <div className="b" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px' }}>
                Loading faculty profiles...
              </div>
            ) : teachers.length === 0 ? (
              <div className="b" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px' }}>
                No faculty members registered yet.
              </div>
            ) : (
              teachers.map(t => (
                <div key={t.id} className="b" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--color-paper-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-teal-primary)',
                      fontWeight: 700
                    }}>
                      <GraduationCap size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{t.name}</div>
                      <div className="t-tiny" style={{ color: 'var(--color-text-subtle)' }}>{t.email}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', background: 'var(--color-paper-subtle)', padding: '10px', borderRadius: '8px' }}>
                    <div><strong>Specialization:</strong> {t.specialization}</div>
                    <div style={{ marginTop: '2px' }}><strong>Qualifications:</strong> {t.qualification}</div>
                    {t.phone && <div style={{ marginTop: '2px' }}><strong>Contact:</strong> {t.phone}</div>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: 'auto' }}>
                    <span className="chip chip-teal">{t.activeBatchCount} Active Batches</span>
                    <span className="chip chip-navy" style={{ textTransform: 'capitalize' }}>{t.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. ATTENDANCE OVERVIEW TAB */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Header & Controls */}
          <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={22} color="var(--color-teal-primary)" />
                Institutional Attendance Analytics & Registry
              </div>
              <div className="t-muted">
                Persistent database records compiled from verified faculty registers. Excludes cancelled and future sessions.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: 'var(--color-paper-subtle)', borderRadius: '8px', padding: '4px' }}>
                <button
                  type="button"
                  className={attendanceViewMode === 'batch' ? 'btn btn-teal' : 'ghost'}
                  onClick={() => setAttendanceViewMode('batch')}
                  style={{ minHeight: '34px', padding: '4px 12px', fontSize: '13px' }}
                >
                  Batch-Wise Cohorts
                </button>
                <button
                  type="button"
                  className={attendanceViewMode === 'monthly' ? 'btn btn-teal' : 'ghost'}
                  onClick={() => setAttendanceViewMode('monthly')}
                  style={{ minHeight: '34px', padding: '4px 12px', fontSize: '13px' }}
                >
                  Monthly Breakdowns
                </button>
              </div>

              <button
                type="button"
                className="ghost"
                onClick={fetchAttendanceReports}
                disabled={attendanceLoading}
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                {attendanceLoading ? 'Refreshing...' : '↻ Refresh'}
              </button>
            </div>
          </div>

          {/* Institutional KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="b">
              <div className="t-muted">Tracked Batches</div>
              <div className="h1" style={{ color: 'var(--color-navy-primary)', marginTop: '4px' }}>
                {batchReports.length}
              </div>
              <div className="t-tiny">Active academic cohorts</div>
            </div>

            <div className="b">
              <div className="t-muted">Completed Sessions Held</div>
              <div className="h1" style={{ color: 'var(--color-teal-primary)', marginTop: '4px' }}>
                {batchReports.reduce((sum, b) => sum + b.completedSessionsCount, 0)}
              </div>
              <div className="t-tiny">Excludes cancelled & scheduled</div>
            </div>

            <div className="b">
              <div className="t-muted">Enrolled Learners</div>
              <div className="h1" style={{ color: 'var(--color-saffron)', marginTop: '4px' }}>
                {batchReports.reduce((sum, b) => sum + b.enrolledCount, 0)}
              </div>
              <div className="t-tiny">Active student profiles</div>
            </div>

            <div className="b">
              <div className="t-muted">Institutional Average</div>
              <div className="h1" style={{ marginTop: '4px' }}>
                {(() => {
                  const withPct = batchReports.filter(b => b.batchAttendancePercent !== null);
                  if (withPct.length === 0) return 'N/A';
                  const avg = Math.round(withPct.reduce((sum, b) => sum + (b.batchAttendancePercent || 0), 0) / withPct.length);
                  return `${avg}%`;
                })()}
              </div>
              <div className="t-tiny">Verified across all active cohorts</div>
            </div>
          </div>

          {/* View Mode 1: Batch-Wise Reporting */}
          {attendanceViewMode === 'batch' && (
            <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="h3">Batch-Wise Attendance Performance</div>
                  <div className="t-muted" style={{ fontSize: '12px' }}>Click a batch to expand individual student attendance records</div>
                </div>
              </div>

              {attendanceLoading ? (
                <div style={{ padding: '32px', textAlign: 'center' }} className="t-muted">
                  Loading institutional attendance data...
                </div>
              ) : batchReports.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center' }} className="t-muted">
                  No active batch attendance records available.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {batchReports.map(b => {
                    const isExpanded = expandedBatchId === b.batchId;
                    return (
                      <div key={b.batchId} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <div
                          style={{
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                            cursor: 'pointer',
                            background: isExpanded ? 'var(--color-paper-subtle)' : 'transparent'
                          }}
                          onClick={() => setExpandedBatchId(isExpanded ? null : b.batchId)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              background: 'var(--color-teal-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              color: 'var(--color-teal-primary)'
                            }}>
                              C{b.grade}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '15px' }}>{b.name}</div>
                              <div className="t-tiny">
                                {b.board} · {b.subject} · {b.enrolledCount} learners · {b.completedSessionsCount} sessions completed
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Cohort Attendance</div>
                              <strong style={{
                                fontSize: '16px',
                                color: (b.batchAttendancePercent || 0) >= 80 ? 'var(--color-teal-primary)' : 'var(--color-saffron)'
                              }}>
                                {b.batchAttendancePercent === null ? 'No data' : `${b.batchAttendancePercent}%`}
                              </strong>
                            </div>
                            <button
                              type="button"
                              className="ghost"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                            >
                              {isExpanded ? 'Hide Roster ▲' : 'View Roster ▼'}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Student Breakdown Table */}
                        {isExpanded && (
                          <div style={{ padding: '0 20px 16px 20px', background: 'var(--color-paper-subtle)' }}>
                            <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                <thead>
                                  <tr style={{ background: 'var(--color-paper-subtle)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                                    <th style={{ padding: '10px 14px' }}>Learner</th>
                                    <th style={{ padding: '10px 14px' }}>Enrollment No.</th>
                                    <th style={{ padding: '10px 14px' }}>Attended</th>
                                    <th style={{ padding: '10px 14px' }}>Absent</th>
                                    <th style={{ padding: '10px 14px' }}>Excused</th>
                                    <th style={{ padding: '10px 14px' }}>Calculated Attendance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {b.students.length === 0 ? (
                                    <tr>
                                      <td colSpan={6} style={{ padding: '16px', textAlign: 'center' }} className="t-muted">
                                        No learners currently enrolled in this batch.
                                      </td>
                                    </tr>
                                  ) : (
                                    b.students.map(st => (
                                      <tr key={st.studentId} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{st.name}</td>
                                        <td style={{ padding: '10px 14px' }} className="t-tiny">{st.enrollmentNumber || st.studentId}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--color-teal-primary)' }}>{st.attended}</td>
                                        <td style={{ padding: '10px 14px', color: '#e11d48' }}>{st.absent}</td>
                                        <td style={{ padding: '10px 14px', color: '#3b82f6' }}>{st.excused}</td>
                                        <td style={{ padding: '10px 14px' }}>
                                          <strong style={{
                                            color: st.percentage === null ? 'inherit' : st.percentage >= 80 ? 'var(--color-teal-primary)' : 'var(--color-saffron)'
                                          }}>
                                            {st.percentage === null ? 'Not recorded' : `${st.percentage}%`}
                                          </strong>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* View Mode 2: Monthly Breakdown */}
          {attendanceViewMode === 'monthly' && (
            <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div className="h3">Monthly Institutional Attendance Aggregates</div>
                <div className="t-muted" style={{ fontSize: '12px' }}>System-wide attendance rates categorized by academic calendar month</div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-paper-subtle)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <th style={{ padding: '12px 16px' }}>Month</th>
                      <th style={{ padding: '12px 16px' }}>Sessions Held</th>
                      <th style={{ padding: '12px 16px' }}>Total Marks</th>
                      <th style={{ padding: '12px 16px' }}>On-Time Present</th>
                      <th style={{ padding: '12px 16px' }}>Late</th>
                      <th style={{ padding: '12px 16px' }}>Absent</th>
                      <th style={{ padding: '12px 16px' }}>Excused</th>
                      <th style={{ padding: '12px 16px' }}>Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLoading ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '32px', textAlign: 'center' }} className="t-muted">
                          Loading monthly attendance metrics...
                        </td>
                      </tr>
                    ) : monthlyReports.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '32px', textAlign: 'center' }} className="t-muted">
                          No monthly session records found.
                        </td>
                      </tr>
                    ) : (
                      monthlyReports.map(m => (
                        <tr key={m.month} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{m.month}</td>
                          <td style={{ padding: '12px 16px' }}>{m.sessionsHeld}</td>
                          <td style={{ padding: '12px 16px' }}>{m.totalMarks}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--color-teal-primary)' }}>{m.present}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--color-saffron)' }}>{m.late}</td>
                          <td style={{ padding: '12px 16px', color: '#e11d48' }}>{m.absent}</td>
                          <td style={{ padding: '12px 16px', color: '#3b82f6' }}>{m.excused}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <strong style={{
                              fontSize: '15px',
                              color: m.attendancePercent === null ? 'inherit' : m.attendancePercent >= 80 ? 'var(--color-teal-primary)' : 'var(--color-saffron)'
                            }}>
                              {m.attendancePercent === null ? 'N/A' : `${m.attendancePercent}%`}
                            </strong>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* 5. BULK ROSTER IMPORT TAB */}
      {/* ======================================================== */}
      {activeTab === 'import' && (
        <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
          <div className="h2">Atomic Bulk Student & Teacher Onboarding</div>
          <div className="t-muted">
            Upload CSV/Excel spreadsheets. Automated 2-pass validation checks mobile formats, board configurations, and relational duplicates before commit.
          </div>

          <div style={{
            border: '2px dashed var(--color-border)',
            borderRadius: '10px',
            padding: '36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--color-paper-subtle)'
          }}>
            <FileSpreadsheet size={40} color="var(--color-teal-primary)" />
            <div style={{ fontWeight: 600 }}>student_roster_class7_2026.xlsx</div>
            <div className="t-tiny">File Size: 142 KB • 48 Student Records Detected</div>
            <button type="button" className="btn btn-teal" onClick={handleSimulateImport}>
              <Upload size={16} /> Validate & Import Transactionally
            </button>
          </div>

          {importProcessed && (
            <div className="b" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--color-success)' }}>
              <strong>Import Successful!</strong> 48 student profiles and guardian links inserted in one atomic database transaction. Welcome SMS and WhatsApp invites queued.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. COLLECTIONS & LEDGER TAB */}
      {/* ======================================================== */}
      {activeTab === 'finance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="h2">Collections & Fee Settlement Reconciliation</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="b">
              <div className="t-muted">Total Collections Today</div>
              <div className="h1" style={{ color: 'var(--color-teal-primary)' }}>₹4,82,500</div>
              <div className="t-tiny">32 Settlements via Razorpay</div>
            </div>
            <div className="b">
              <div className="t-muted">Pending Ageing Dues</div>
              <div className="h1" style={{ color: 'var(--color-saffron)' }}>₹36,000</div>
              <div className="t-tiny">3 Accounts in Grace Period</div>
            </div>
            <div className="b">
              <div className="t-muted">GST Remittance (18%)</div>
              <div className="h1">₹73,600</div>
              <div className="t-tiny">SAC 9992 Educational Tech</div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. AI GOVERNANCE TAB */}
      {/* ======================================================== */}
      {activeTab === 'ai_gov' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="h2">AI Prompt & Token Expenditure Controls</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div className="b">
              <div className="t-muted">Daily Token Quota</div>
              <div className="h1">1.2M / 5.0M</div>
              <div className="t-tiny">Current spend: ₹480 / ₹2,000 budget</div>
            </div>
            <div className="b">
              <div className="t-muted">Ungrounded Queries Blocked</div>
              <div className="h1" style={{ color: 'var(--color-teal-primary)' }}>14</div>
              <div className="t-tiny">Redirected to Teacher Queue</div>
            </div>
            <div className="b">
              <div className="t-muted">Active Model Version</div>
              <div className="h3" style={{ marginTop: '4px' }}>Claude 3.7 / Gemini 2.0</div>
              <div className="t-tiny">Golden evaluation set score: 98.4%</div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Video production and verified lesson question review */}
      {activeTab === 'video_library' && <CbseVideoStudio />}
      {activeTab === 'enquiries' && <AdmissionsInbox />}
      {activeTab === 'one_journey' && <OneJourneyAdmin />}
      {activeTab === 'curriculum_one' && <OneCurriculumStudio />}
      {activeTab === 'one_applications' && <OneAdmissionReview />}

      {/* MODAL: REGISTER STUDENT & LINK GUARDIAN */}
      {/* ======================================================== */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="b" style={{
            background: 'var(--color-paper-card)',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              type="button"
              className="ghost"
              onClick={() => setShowRegisterModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px' }}
            >
              <X size={20} />
            </button>

            <div className="h2" style={{ marginBottom: '4px' }}>Admissions & Student Registration</div>
            <div className="t-muted" style={{ marginBottom: '16px', fontSize: '13px' }}>
              Assign unique enrollment IDs, link certified guardian custody, and select initial curriculum batches.
            </div>

            <form onSubmit={handleRegisterStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Student Basics */}
              <div>
                <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Full Student Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya Patel"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  style={{ width: '100%', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Class / Grade *
                  </label>
                  <select
                    value={regGrade}
                    onChange={e => setRegGrade(e.target.value)}
                    style={{ width: '100%', fontSize: '13px', minHeight: '38px' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Curriculum Board *
                  </label>
                  <select
                    value={regBoard}
                    onChange={e => setRegBoard(e.target.value)}
                    style={{ width: '100%', fontSize: '13px', minHeight: '38px' }}
                  >
                    <option value="CBSE">CBSE Board</option>
                    <option value="STATE_KARNATAKA">Karnataka State Board</option>
                    <option value="ICSE">ICSE Council</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Instruction Medium
                  </label>
                  <select
                    value={regMedium}
                    onChange={e => setRegMedium(e.target.value)}
                    style={{ width: '100%', fontSize: '13px', minHeight: '38px' }}
                  >
                    <option value="English">English</option>
                    <option value="Kannada">Kannada</option>
                  </select>
                </div>

                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={regDob}
                    onChange={e => setRegDob(e.target.value)}
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Guardian Linking Section */}
              <div style={{
                background: 'var(--color-paper-subtle)',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid var(--color-border-subtle)',
                marginTop: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="t-tiny" style={{ fontWeight: 700 }}>Guardian Relationship Custody</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      className={guardianMode === 'new' ? 'btn btn-teal' : 'ghost'}
                      onClick={() => setGuardianMode('new')}
                      style={{ fontSize: '11px', padding: '3px 8px', minHeight: '26px' }}
                    >
                      New Guardian
                    </button>
                    <button
                      type="button"
                      className={guardianMode === 'existing' ? 'btn btn-teal' : 'ghost'}
                      onClick={() => setGuardianMode('existing')}
                      style={{ fontSize: '11px', padding: '3px 8px', minHeight: '26px' }}
                    >
                      Existing Guardian
                    </button>
                  </div>
                </div>

                {guardianMode === 'new' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      required={guardianMode === 'new'}
                      placeholder="Guardian Full Name *"
                      value={regGuardianName}
                      onChange={e => setRegGuardianName(e.target.value)}
                      style={{ width: '100%', fontSize: '13px' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input
                        type="email"
                        placeholder="Guardian Email"
                        value={regGuardianEmail}
                        onChange={e => setRegGuardianEmail(e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                      <input
                        type="tel"
                        placeholder="10-digit Phone (+91)"
                        value={regGuardianPhone}
                        onChange={e => setRegGuardianPhone(e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <select
                      value={regGuardianId}
                      onChange={e => setRegGuardianId(e.target.value)}
                      style={{ width: '100%', fontSize: '13px', minHeight: '38px' }}
                    >
                      <option value="">Select Existing Verified Guardian</option>
                      {guardians.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.mobile || g.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Initial Batches Selection */}
              <div>
                <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Enroll in Active Batches (Optional)
                </label>
                <div style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {batches.filter(b => Number(b.grade) === Number(regGrade) && (b.board === regBoard || regBoard === 'CBSE')).map(b => (
                    <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={regSelectedBatches.includes(b.id)}
                        onChange={e => {
                          if (e.target.checked) setRegSelectedBatches([...regSelectedBatches, b.id]);
                          else setRegSelectedBatches(regSelectedBatches.filter(id => id !== b.id));
                        }}
                      />
                      <span><strong>{b.name}</strong> ({b.startTime}–{b.endTime} on {b.daysOfWeek.join(',')})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setShowRegisterModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal" style={{ flex: 1 }} disabled={submittingReg}>
                  {submittingReg ? 'Admitting Student...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE BATCH */}
      {/* ======================================================== */}
      {showBatchModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="b" style={{
            background: 'var(--color-paper-card)',
            width: '100%',
            maxWidth: '520px',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              type="button"
              className="ghost"
              onClick={() => setShowBatchModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px' }}
            >
              <X size={20} />
            </button>

            <div className="h2" style={{ marginBottom: '4px' }}>Create Tuition Batch</div>
            <div className="t-muted" style={{ marginBottom: '16px', fontSize: '13px' }}>
              Define timetable slots, classroom capacity, and assign authorized faculty with overlap protection.
            </div>

            <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 7-A · CBSE Mathematics"
                  value={batchName}
                  onChange={e => setBatchName(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Class</label>
                  <select value={batchGrade} onChange={e => setBatchGrade(e.target.value)} style={{ width: '100%', fontSize: '13px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Board</label>
                  <select value={batchBoard} onChange={e => setBatchBoard(e.target.value)} style={{ width: '100%', fontSize: '13px' }}>
                    <option value="CBSE">CBSE</option>
                    <option value="STATE_KARNATAKA">State Board</option>
                    <option value="ICSE">ICSE</option>
                  </select>
                </div>
                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Max Seats</label>
                  <input type="number" min={5} max={60} value={batchCapacity} onChange={e => setBatchCapacity(e.target.value)} style={{ width: '100%', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Subject *</label>
                  <input type="text" required placeholder="e.g. Mathematics" value={batchSubject} onChange={e => setBatchSubject(e.target.value)} style={{ width: '100%', fontSize: '13px' }} />
                </div>
                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Assigned Faculty</label>
                  <select value={batchTeacherId} onChange={e => setBatchTeacherId(e.target.value)} style={{ width: '100%', fontSize: '13px' }}>
                    <option value="">Unassigned</option>
                    {teachers.filter(t => t.status === 'active').map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slot & Days */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Start Time (24h)</label>
                  <input type="time" required value={batchStartTime} onChange={e => setBatchStartTime(e.target.value)} style={{ width: '100%', fontSize: '13px' }} />
                </div>
                <div>
                  <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>End Time (24h)</label>
                  <input type="time" required value={batchEndTime} onChange={e => setBatchEndTime(e.target.value)} style={{ width: '100%', fontSize: '13px' }} />
                </div>
              </div>

              <div>
                <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Days of the Week</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`ghost ${batchDays.includes(day) ? 'btn-teal' : ''}`}
                      onClick={() => {
                        if (batchDays.includes(day)) setBatchDays(batchDays.filter(d => d !== day));
                        else setBatchDays([...batchDays, day]);
                      }}
                      style={{ fontSize: '11px', padding: '4px 8px', minHeight: '28px' }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Classroom / Room</label>
                <input type="text" value={batchRoom} onChange={e => setBatchRoom(e.target.value)} style={{ width: '100%', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setShowBatchModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal" style={{ flex: 1 }} disabled={submittingBatch}>
                  {submittingBatch ? 'Creating Batch...' : 'Save & Publish Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD TEACHER */}
      {/* ======================================================== */}
      {showTeacherModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="b" style={{
            background: 'var(--color-paper-card)',
            width: '100%',
            maxWidth: '480px',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              type="button"
              className="ghost"
              onClick={() => setShowTeacherModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px' }}
            >
              <X size={20} />
            </button>

            <div className="h2" style={{ marginBottom: '4px' }}>Add Certified Faculty Member</div>
            <div className="t-muted" style={{ marginBottom: '16px', fontSize: '13px' }}>
              Create teacher account credentials with verified certifications and batch assignment rights.
            </div>

            <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Faculty Full Name *</label>
                <input type="text" required placeholder="e.g. Dr. Raghavendra Rao, M.Sc." value={tchName} onChange={e => setTchName(e.target.value)} style={{ width: '100%', fontSize: '13px' }} />
              </div>

              <div>
                <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Institutional Email *</label>
                <input type="email" required placeholder="faculty@vayentra.org" value={tchEmail} onChange={e => setTchEmail(e.target.value)} style={{ width: '100%', fontSize: '13px' }} />
              </div>

              <div>
                <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Subject Specialization</label>
                <input type="text" placeholder="e.g. High School Physics & Mathematics" value={tchSpec} onChange={e => setTchSpec(e.target.value)} style={{ width: '100%', fontSize: '13px' }} />
              </div>

              <div>
                <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Degrees & Certifications</label>
                <input type="text" placeholder="e.g. M.Sc. Physics, Karnataka TET, B.Ed." value={tchQual} onChange={e => setTchQual(e.target.value)} style={{ width: '100%', fontSize: '13px' }} />
              </div>

              <div>
                <label className="t-tiny" style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Phone Number (Optional)</label>
                <input type="tel" placeholder="+91 98450 11111" value={tchPhone} onChange={e => setTchPhone(e.target.value)} style={{ width: '100%', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setShowTeacherModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal" style={{ flex: 1 }} disabled={submittingTch}>
                  {submittingTch ? 'Creating Account...' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MANAGE STUDENT ENROLLMENTS & TRANSFERS */}
      {/* ======================================================== */}
      {showEnrollModal && selectedStudentForEnroll && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="b" style={{
            background: 'var(--color-paper-card)',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              type="button"
              className="ghost"
              onClick={() => setShowEnrollModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>{selectedStudentForEnroll.avatar}</span>
              <div>
                <div className="h2" style={{ fontSize: '18px' }}>{selectedStudentForEnroll.name}</div>
                <div className="t-tiny" style={{ color: 'var(--color-teal-primary)' }}>
                  {selectedStudentForEnroll.enrollmentNumber} · Class {selectedStudentForEnroll.grade} {selectedStudentForEnroll.board}
                </div>
              </div>
            </div>

            {/* Current Active Enrollments */}
            <div style={{ marginTop: '14px', marginBottom: '16px' }}>
              <div className="t-tiny" style={{ fontWeight: 700, marginBottom: '6px' }}>
                CURRENTLY ENROLLED BATCHES:
              </div>
              {studentEnrollments.length === 0 ? (
                <div className="t-muted" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                  No batch enrollments currently active for this student.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {studentEnrollments.map(e => (
                    <div key={e.enrollmentId} style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--color-paper-subtle)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px'
                    }}>
                      <div>
                        <strong>{e.batch.name}</strong>
                        <div className="t-tiny" style={{ color: 'var(--color-text-subtle)' }}>
                          {e.batch.daysOfWeek.join(' • ')} · {e.batch.startTime}–{e.batch.endTime}
                        </div>
                      </div>
                      <span className={`chip ${e.status === 'active' ? 'chip-teal' : 'chip-saffron'}`}>
                        {e.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action 1: Enroll into Additional Batch */}
            <div style={{
              background: 'var(--color-paper-subtle)',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid var(--color-border-subtle)',
              marginBottom: '14px'
            }}>
              <div className="t-tiny" style={{ fontWeight: 700, marginBottom: '8px' }}>
                ENROLL IN AN ADDITIONAL BATCH:
              </div>
              <form onSubmit={handleEnrollStudent} style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={enrollBatchId}
                  onChange={e => setEnrollBatchId(e.target.value)}
                  style={{ flex: 1, fontSize: '12px' }}
                >
                  <option value="">Select Target Batch...</option>
                  {batches.filter(b => b.status === 'active' && !studentEnrollments.some(e => e.batch.id === b.id && e.status === 'active')).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.startTime}–{b.endTime} on {b.daysOfWeek.join(',')})
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-teal" disabled={enrollSubmitting || !enrollBatchId} style={{ fontSize: '12px' }}>
                  Enroll
                </button>
              </form>
            </div>

            {/* Action 2: Transfer Between Batches */}
            {studentEnrollments.filter(e => e.status === 'active').length > 0 && (
              <div style={{
                background: 'var(--color-paper-subtle)',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid var(--color-border-subtle)'
              }}>
                <div className="t-tiny" style={{ fontWeight: 700, marginBottom: '8px' }}>
                  TRANSFER BATCH:
                </div>
                <form onSubmit={handleTransferStudent} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <select
                      value={transferSourceBatchId}
                      onChange={e => setTransferSourceBatchId(e.target.value)}
                      style={{ fontSize: '12px' }}
                    >
                      <option value="">Transfer From...</option>
                      {studentEnrollments.filter(e => e.status === 'active').map(e => (
                        <option key={e.batch.id} value={e.batch.id}>{e.batch.name}</option>
                      ))}
                    </select>

                    <select
                      value={transferTargetBatchId}
                      onChange={e => setTransferTargetBatchId(e.target.value)}
                      style={{ fontSize: '12px' }}
                    >
                      <option value="">Transfer To...</option>
                      {batches.filter(b => b.status === 'active' && b.id !== transferSourceBatchId).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Reason for transfer (e.g. Schedule adjustment requested by parent)"
                    value={transferReason}
                    onChange={e => setTransferReason(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />

                  <button
                    type="submit"
                    className="btn btn-navy"
                    disabled={enrollSubmitting || !transferSourceBatchId || !transferTargetBatchId}
                    style={{ justifyContent: 'center', fontSize: '12px', minHeight: '34px' }}
                  >
                    Execute Batch Transfer
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
