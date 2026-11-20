import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Stethoscope,
  Calendar,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Send,
  Bell,
  TrendingUp,
  RotateCcw,
  Clock,
  Search,
  UserX,
  Phone,
  Mail,
  Droplets,
  Building2,
  RefreshCw,
  Sparkles,
  HeartPulse,
  Activity,
  Layers,
  X,
} from 'lucide-react';

const QUICK_ANNOUNCEMENT_TEMPLATES = [
  {
    label: 'Holiday Schedule',
    title: 'Upcoming Public Holiday — Modified Outpatient OPD Schedule',
    message:
      'Please note that outpatient consultations on the upcoming public holiday will operate under emergency staff coverage from 09:00 AM to 02:00 PM. Scheduled slots have been notified accordingly.',
    roles: ['PATIENT', 'DOCTOR'],
  },
  {
    label: 'New Department',
    title: 'Announcement: Expanded Clinical Care Facilities Now Open',
    message:
      'CityCare Health System has expanded its clinical operations with newly board-certified specialists. Precision 10-minute slot booking is now live in the medical directory.',
    roles: ['PATIENT'],
  },
  {
    label: 'Clinical Protocol',
    title: 'Physician Advisory: 10-Minute Punctuality & Digital EHR Records',
    message:
      'All attending physicians are requested to complete patient consultation notes and digital prescriptions within the portal immediately following patient appointments.',
    roles: ['DOCTOR'],
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Search & filter states
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL'); // ALL, PENDING, VERIFIED
  const [patientSearch, setPatientSearch] = useState('');

  // Specialty form
  const [newSpecialty, setNewSpecialty] = useState({ name: '', description: '' });
  const [addingSpec, setAddingSpec] = useState(false);

  // Announcement form
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    roles: ['PATIENT', 'DOCTOR'],
  });
  const [sending, setSending] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  const fetchAll = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [statsRes, docsRes, specsRes, refundsRes, patientsRes] = await Promise.all([
        api.get('/admin/stats/'),
        api.get('/doctors/'),
        api.get('/specialties/'),
        api.get('/appointments/pending-refunds/'),
        api.get('/patients/'),
      ]);
      setStats(statsRes.data);
      setDoctors(docsRes.data.results || docsRes.data || []);
      setSpecialties(specsRes.data.results || specsRes.data || []);
      setPendingRefunds(refundsRes.data.results || refundsRes.data || []);
      setPatients(patientsRes.data.results || patientsRes.data || []);
    } catch {
      toast.error('Failed to synchronize admin data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Process and initiate 50% refund for cancelled appointment
  const handleProcessRefund = async (appt) => {
    const patientName = appt.patient_name || appt.patient_email || 'Patient';
    const refundAmt =
      appt.payment?.refund_amount || (parseFloat(appt.doctor_fee || 0) * 0.5).toFixed(0);

    if (
      !window.confirm(
        `Are you sure you want to approve and initiate the 50% refund of ₹${refundAmt} for ${patientName}?`
      )
    ) {
      return;
    }

    setActionLoading(`refund-${appt.id}`);
    try {
      const { data } = await api.post(`/appointments/${appt.id}/process-refund/`);
      toast.success(
        `50% refund (₹${data.refund_amount}) initiated successfully! Ref: ${data.refund_transaction_id}`
      );
      fetchAll(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to initiate refund');
    } finally {
      setActionLoading(null);
    }
  };

  // Verify doctor
  const verifyDoctor = async (docId) => {
    setActionLoading(`verify-${docId}`);
    try {
      await api.post(`/doctors/${docId}/verify/`);
      toast.success('Doctor verified and activated on clinical roster');
      fetchAll(true);
    } catch {
      toast.error('Failed to verify doctor');
    } finally {
      setActionLoading(null);
    }
  };

  // Remove / delete doctor
  const handleDeleteDoctor = async (doc) => {
    const docName = doc.full_name || doc.email;
    if (
      !window.confirm(
        `Are you sure you want to permanently remove Dr. ${docName} and their associated user account? All corresponding slots and records will be deleted.`
      )
    ) {
      return;
    }

    setActionLoading(`del-doc-${doc.id}`);
    try {
      await api.delete(`/doctors/${doc.id}/`);
      toast.success(`Dr. ${docName} removed from hospital roster`);
      fetchAll(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove doctor');
    } finally {
      setActionLoading(null);
    }
  };

  // Remove / delete patient
  const handleDeletePatient = async (pat) => {
    const patName = pat.full_name || pat.email;
    if (
      !window.confirm(
        `Are you sure you want to permanently remove patient ${patName} and their associated user account? All corresponding appointments and records will be deleted.`
      )
    ) {
      return;
    }

    setActionLoading(`del-pat-${pat.id}`);
    try {
      await api.delete(`/patients/${pat.id}/`);
      toast.success(`Patient ${patName} removed successfully`);
      fetchAll(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove patient');
    } finally {
      setActionLoading(null);
    }
  };

  // Add specialty
  const handleAddSpecialty = async (e) => {
    e.preventDefault();
    if (!newSpecialty.name.trim()) return;
    setAddingSpec(true);
    try {
      await api.post('/specialties/', newSpecialty);
      toast.success(`Department '${newSpecialty.name}' added`);
      setNewSpecialty({ name: '', description: '' });
      fetchAll(true);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          Object.values(err.response?.data || {})
            .flat()
            .join(' ') ||
          'Failed to add specialty'
      );
    } finally {
      setAddingSpec(false);
    }
  };

  const deleteSpecialty = async (id, name) => {
    if (!window.confirm(`Delete clinical department '${name || 'Specialty'}'?`)) return;
    try {
      await api.delete(`/specialties/${id}/`);
      toast.success('Clinical department deleted');
      fetchAll(true);
    } catch {
      toast.error('Failed to delete specialty department');
    }
  };

  // Send announcement
  const handleAnnounce = async (e) => {
    e.preventDefault();
    if (!announcement.title.trim() || !announcement.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post('/admin/announce/', announcement);
      toast.success(`Announcement dispatched to ${data.notified_users} hospital users!`);
      setAnnouncement({ title: '', message: '', roles: ['PATIENT', 'DOCTOR'] });
    } catch {
      toast.error('Failed to dispatch broadcast');
    } finally {
      setSending(false);
    }
  };

  const toggleRole = (role) => {
    setAnnouncement((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const applyTemplate = (tpl) => {
    setAnnouncement({
      title: tpl.title,
      message: tpl.message,
      roles: tpl.roles,
    });
    toast.success(`Loaded "${tpl.label}" template`);
  };

  // Derived filtered doctors
  const unverifiedDocs = useMemo(() => doctors.filter((d) => !d.is_verified), [doctors]);
  const verifiedDocs = useMemo(() => doctors.filter((d) => d.is_verified), [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = doctorSearch.toLowerCase();
      const matchesSearch =
        (doc.full_name || '').toLowerCase().includes(q) ||
        (doc.email || '').toLowerCase().includes(q) ||
        (doc.specialty?.name || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (doctorFilter === 'PENDING') return !doc.is_verified;
      if (doctorFilter === 'VERIFIED') return doc.is_verified;
      return true;
    });
  }, [doctors, doctorSearch, doctorFilter]);

  // Derived filtered patients
  const filteredPatients = useMemo(() => {
    const q = patientSearch.toLowerCase();
    return patients.filter((pat) => {
      return (
        (pat.full_name || '').toLowerCase().includes(q) ||
        (pat.email || '').toLowerCase().includes(q) ||
        (pat.phone || '').toLowerCase().includes(q) ||
        (pat.blood_group || '').toLowerCase().includes(q)
      );
    });
  }, [patients, patientSearch]);

  if (loading) return <LoadingSpinner size="lg" className="py-32" />;

  // Unified clinical stat cards data
  const statCards = [
    {
      label: 'Total Users',
      value: stats?.users?.total || 0,
      sub: 'All portal accounts',
      icon: Users,
      gradient: 'from-teal-600 to-teal-800',
    },
    {
      label: 'Patients Registered',
      value: patients.length || stats?.users?.patients || 0,
      sub: 'Active medical records',
      icon: HeartPulse,
      gradient: 'from-emerald-600 to-teal-700',
    },
    {
      label: 'Attending Doctors',
      value: doctors.length || stats?.users?.doctors || 0,
      sub: `${verifiedDocs.length} verified`,
      icon: Stethoscope,
      gradient: 'from-cyan-600 to-teal-800',
    },
    {
      label: 'Appointments',
      value: stats?.appointments?.total || 0,
      sub: '10-min slot bookings',
      icon: Calendar,
      gradient: 'from-sky-600 to-teal-700',
    },
    {
      label: 'Pending Verification',
      value: unverifiedDocs.length,
      sub: unverifiedDocs.length > 0 ? 'Requires attention' : 'All verified',
      icon: ShieldCheck,
      gradient: unverifiedDocs.length > 0 ? 'from-rose-600 to-rose-800' : 'from-slate-600 to-slate-800',
      highlight: unverifiedDocs.length > 0,
    },
    {
      label: 'Pending Refunds',
      value: pendingRefunds.length,
      sub: '50% policy queue',
      icon: RotateCcw,
      gradient: pendingRefunds.length > 0 ? 'from-amber-600 to-amber-800' : 'from-slate-600 to-slate-800',
      highlight: pendingRefunds.length > 0,
    },
  ];

  const apptCounts = stats?.appointments || {};
  const totalAppts = apptCounts.total || 1;
  const confirmedCount = apptCounts.confirmed || 0;
  const completedCount = apptCounts.completed || 0;
  const pendingCount = apptCounts.pending || 0;
  const cancelledCount = apptCounts.cancelled || 0;

  return (
    <div className="min-h-screen bg-[#f0f4f6] dark:bg-[#0b1120] py-8 sm:py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================================================================= */}
        {/* EXECUTIVE HEADER                                                  */}
        {/* ================================================================= */}
        <div className="card p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {/* Subtle decorative background gradient */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-teal-500/10 to-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100/70 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60">
                  <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Executive Administration
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  MongoDB Atlas Connected
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
                Hospital Command Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Centralized hospital oversight for medical staff credentialing, patient demographics,
                consultation velocity, 50% refund approvals, and institution-wide broadcasts.
              </p>
            </div>

            {/* Quick Actions / Sync */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => fetchAll(true)}
                disabled={isRefreshing}
                className="btn-secondary btn-sm flex items-center gap-2 text-xs font-semibold px-4 py-2.5"
                title="Synchronize latest hospital data"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-teal-600 dark:text-teal-400 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Live Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* KPI / STAT CARDS GRID                                             */}
        {/* ================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`card p-4 sm:p-5 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                s.highlight
                  ? 'border-amber-300/80 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/20'
                  : 'border-slate-200/90 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">
                    {s.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                    {s.value}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                    {s.sub}
                  </p>
                </div>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}
                >
                  <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================================================================= */}
        {/* NAVIGATION SEGMENTED TABS                                         */}
        {/* ================================================================= */}
        <div className="card p-1.5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overview & Analytics</span>
              {pendingRefunds.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold">
                  {pendingRefunds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'doctors'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Physicians Roster ({doctors.length})</span>
              {unverifiedDocs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-bold">
                  {unverifiedDocs.length} pending
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'patients'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Patients Directory ({patients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('operations')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'operations'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Departments & Broadcast</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW & REFUNDS                                         */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Top row: Velocity Chart & Pipeline Status */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Velocity Chart */}
              <div className="lg:col-span-2 card p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      Consultation Booking Velocity (Last 30 Days)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Daily tracking of patient appointments scheduled across all hospital departments
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                    Live Telemetry
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full pt-2">
                  {stats?.appointments_per_day?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={stats.appointments_per_day}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          tickFormatter={(d) => d.slice(5)}
                          axisLine={{ stroke: '#94a3b833' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          allowDecimals={false}
                          axisLine={{ stroke: '#94a3b833' }}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            color: '#f8fafc',
                            fontSize: '12px',
                            padding: '8px 12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#0d9488"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Calendar className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm font-medium">No booking activity recorded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Pipeline Status Widget */}
              <div className="card p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                    <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    Consultations Status Pipeline
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                    Distribution of all hospital appointments
                  </p>

                  <div className="space-y-4">
                    {/* Confirmed */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Confirmed & Active
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold">
                          {confirmedCount} ({Math.round((confirmedCount / totalAppts) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (confirmedCount / totalAppts) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Pending */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Pending Doctor Confirmation
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold">
                          {pendingCount} ({Math.round((pendingCount / totalAppts) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (pendingCount / totalAppts) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Completed */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                          Completed Consultations
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold">
                          {completedCount} ({Math.round((completedCount / totalAppts) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (completedCount / totalAppts) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Cancelled */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          Cancelled / Refund Queued
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold">
                          {cancelledCount} ({Math.round((cancelledCount / totalAppts) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (cancelledCount / totalAppts) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Hospital Database Pipeline</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {stats?.appointments?.total || 0} Total Bookings
                  </span>
                </div>
              </div>
            </div>

            {/* Refund Queue Section */}
            <div className="card p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Cancelled Appointments Awaiting 50% Refund ({pendingRefunds.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    CityCare cancellation policy automatically refunds 50% of the consultation fee upon admin review.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800/60">
                  Automated Fiscal Ledger
                </span>
              </div>

              {pendingRefunds.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-teal-500 dark:text-teal-400" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    All patient refunds are currently cleared
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    No pending cancellation claims are awaiting administrative approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRefunds.map((appt) => {
                    const patientName = appt.patient_name || appt.patient_email || 'Patient';
                    const doctorName = appt.slot?.doctor?.full_name || '';
                    const origFee = parseFloat(appt.payment?.amount || appt.doctor_fee || 0).toFixed(0);
                    const refundDue = parseFloat(
                      appt.payment?.refund_amount || parseFloat(origFee) * 0.5
                    ).toFixed(0);

                    return (
                      <div
                        key={appt.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-amber-50/20 dark:bg-amber-950/10 rounded-2xl border border-amber-200 dark:border-amber-800/50 shadow-xs gap-4 hover:border-amber-300 dark:hover:border-amber-700 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {patientName}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              ({appt.patient_email})
                            </span>
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span>50% Refund Approval</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Cancelled consultation with{' '}
                            <strong className="text-slate-900 dark:text-slate-200">Dr. {doctorName}</strong> on{' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-300">{appt.date}</span> at{' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-300">
                              {appt.appointment_time?.slice(0, 5) || appt.slot?.start_time?.slice(0, 5)}
                            </span>
                          </p>

                          <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                            <span className="text-slate-500 dark:text-slate-400">
                              Paid Fee: <strong className="text-slate-900 dark:text-white">₹{origFee}</strong>
                            </span>
                            <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                              Refund Due: ₹{refundDue}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500">
                              Hospital Retained (50%): ₹{origFee - refundDue}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => handleProcessRefund(appt)}
                            disabled={actionLoading === `refund-${appt.id}`}
                            className="text-xs font-bold py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition"
                          >
                            {actionLoading === `refund-${appt.id}` ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve & Initiate ₹{refundDue} Refund</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: PHYSICIANS ROSTER & REMOVAL                                */}
        {/* ================================================================= */}
        {activeTab === 'doctors' && (
          <div className="card p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Hospital Medical Staff Directory ({doctors.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Physician credentialing verification, active duty roster, and doctor account deletion
                </p>
              </div>

              {/* Search & Filter pills */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search doctor or department..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="input pl-9 pr-8 py-1.5 text-xs w-60 rounded-xl"
                  />
                  {doctorSearch && (
                    <button
                      onClick={() => setDoctorSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setDoctorFilter('ALL')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      doctorFilter === 'ALL'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    All ({doctors.length})
                  </button>
                  <button
                    onClick={() => setDoctorFilter('PENDING')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      doctorFilter === 'PENDING'
                        ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Pending ({unverifiedDocs.length})
                  </button>
                  <button
                    onClick={() => setDoctorFilter('VERIFIED')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      doctorFilter === 'VERIFIED'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Verified ({verifiedDocs.length})
                  </button>
                </div>
              </div>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-30 text-teal-600" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No physicians found matching &quot;{doctorSearch}&quot;
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Try adjusting your search criteria or resetting filters.
                </p>
                <button
                  onClick={() => {
                    setDoctorSearch('');
                    setDoctorFilter('ALL');
                  }}
                  className="btn-secondary btn-sm mt-3 text-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-850">
                      <th className="py-3 px-4">Physician Details</th>
                      <th className="py-3 px-4">Specialty</th>
                      <th className="py-3 px-4">Consultation Fee</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800">
                    {filteredDoctors.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                              {(doc.full_name?.[0] || doc.email?.[0] || 'D').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">
                                Dr. {doc.full_name || 'Medical Specialist'}
                              </p>
                              <p className="text-xs text-slate-400 font-mono">{doc.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60">
                            {doc.specialty?.name || 'General Medicine'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          ₹{doc.fee || 0}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                          {doc.experience_years ? `${doc.experience_years} years` : '1+ years'}
                        </td>
                        <td className="py-3.5 px-4">
                          {doc.is_verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!doc.is_verified && (
                              <button
                                onClick={() => verifyDoctor(doc.id)}
                                disabled={actionLoading === `verify-${doc.id}`}
                                className="px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-lg border border-teal-200 dark:border-teal-800/60 transition flex items-center gap-1"
                                title="Approve physician credentials"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {actionLoading === `verify-${doc.id}` ? 'Verifying...' : 'Verify'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteDoctor(doc)}
                              disabled={actionLoading === `del-doc-${doc.id}`}
                              className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-800/60 transition flex items-center gap-1.5"
                              title="Permanently remove doctor from hospital roster"
                            >
                              {actionLoading === `del-doc-${doc.id}` ? (
                                <div className="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: PATIENTS DIRECTORY & REMOVAL                               */}
        {/* ================================================================= */}
        {activeTab === 'patients' && (
          <div className="card p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Registered Patient Directory ({patients.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Hospital patient registry, clinical record linkages, and account removal authority
                </p>
              </div>

              {/* Search patients */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, blood group..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="input pl-9 pr-8 py-1.5 text-xs w-72 rounded-xl"
                />
                {patientSearch && (
                  <button
                    onClick={() => setPatientSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-teal-600" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No patients found matching &quot;{patientSearch}&quot;
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Check the spelling or clear search filters.
                </p>
                <button
                  onClick={() => setPatientSearch('')}
                  className="btn-secondary btn-sm mt-3 text-xs"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-850">
                      <th className="py-3 px-4">Patient Profile</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Blood Group</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800">
                    {filteredPatients.map((pat) => (
                      <tr
                        key={pat.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                              {(pat.full_name?.[0] || pat.email?.[0] || 'P').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">
                                {pat.full_name || 'Registered Patient'}
                              </p>
                              <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {pat.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 text-xs">
                          {pat.phone ? (
                            <a
                              href={`tel:${pat.phone}`}
                              className="flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition"
                            >
                              <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              {pat.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Not provided</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {pat.blood_group ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                              <Droplets className="w-3 h-3 text-rose-500" />
                              {pat.blood_group}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Unknown</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {pat.date_joined
                            ? new Date(pat.date_joined).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Active'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeletePatient(pat)}
                            disabled={actionLoading === `del-pat-${pat.id}`}
                            className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-800/60 transition inline-flex items-center gap-1.5"
                            title="Permanently remove patient from hospital system"
                          >
                            {actionLoading === `del-pat-${pat.id}` ? (
                              <div className="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Remove Patient</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: DEPARTMENTS & BROADCAST                                    */}
        {/* ================================================================= */}
        {activeTab === 'operations' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Add & Manage Specialties */}
              <div className="card p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    Clinical Specialties Catalog ({specialties.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure medical departments visible to patients during doctor booking
                  </p>
                </div>

                {/* Creation form */}
                <form
                  onSubmit={handleAddSpecialty}
                  className="space-y-3.5 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800"
                >
                  <div>
                    <label className="label">Department Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Neurology, Oncology, Nephrology..."
                      value={newSpecialty.name}
                      onChange={(e) => setNewSpecialty({ ...newSpecialty, name: e.target.value })}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">Department Scope / Clinical Description</label>
                    <textarea
                      rows={2}
                      placeholder="Specialized clinical procedures, treated conditions..."
                      value={newSpecialty.description}
                      onChange={(e) =>
                        setNewSpecialty({ ...newSpecialty, description: e.target.value })
                      }
                      className="input text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addingSpec}
                    className="btn-primary w-full btn-sm font-semibold"
                  >
                    {addingSpec ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Department</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Specialties list */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {specialties.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                    >
                      <div className="pr-3">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {s.name}
                        </span>
                        {s.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
                            {s.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSpecialty(s.id, s.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                        title="Remove clinical department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Broadcast Hospital Announcement */}
              <div className="card p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    Broadcast Hospital Announcement
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dispatches instant in-app notifications and background emails to registered hospital groups
                  </p>
                </div>

                {/* Quick Templates */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Dispatch Templates
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {QUICK_ANNOUNCEMENT_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 transition"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAnnounce} className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Target Audience:
                    </span>
                    {['PATIENT', 'DOCTOR'].map((r) => (
                      <label
                        key={r}
                        className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={announcement.roles.includes(r)}
                          onChange={() => toggleRole(r)}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        {r === 'PATIENT' ? 'All Patients' : 'All Doctors'}
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="label">Announcement Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Scheduled Maintenance, New Specialty Unit..."
                      value={announcement.title}
                      onChange={(e) =>
                        setAnnouncement({ ...announcement, title: e.target.value })
                      }
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="label">Message Body *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Type hospital announcement message details..."
                      value={announcement.message}
                      onChange={(e) =>
                        setAnnouncement({ ...announcement, message: e.target.value })
                      }
                      className="input text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-primary w-full font-semibold py-3"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Dispatch Broadcast to Selected Users</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
