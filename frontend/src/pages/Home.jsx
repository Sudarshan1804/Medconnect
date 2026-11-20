import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Star,
  Clock,
  Award,
  Heart,
  Users,
  Activity,
  HeartPulse,
  CalendarCheck,
  CheckCircle2,
  Search,
  Phone,
  Building2,
  FileText,
  BadgeCheck,
  Sparkles,
  ChevronRight,
  Zap,
  HeartHandshake,
} from 'lucide-react';
import api from '../api/axios';

const SAMPLE_SLOTS = ['09:00 AM', '09:10 AM', '09:20 AM', '09:30 AM', '09:40 AM', '09:50 AM'];

const STATS = [
  { icon: Users, value: '15,000+', label: 'Patients Treated' },
  { icon: Stethoscope, value: '25+', label: 'Verified Specialists' },
  { icon: Clock, value: '10 Min', label: 'Precision Slot Windows' },
  { icon: Award, value: '99.2%', label: 'On-Time Consultation' },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Select Your Specialist',
    desc: 'Browse verified doctors across cardiology, dermatology, pediatrics, and orthopedics.',
    icon: Stethoscope,
    tag: 'Board Certified',
  },
  {
    step: '02',
    title: 'Choose a 10-Min Window',
    desc: 'Select an exact 10-minute appointment interval designed to eliminate waiting room delays.',
    icon: CalendarCheck,
    tag: 'Zero Wait Policy',
  },
  {
    step: '03',
    title: 'Consult & Access Records',
    desc: 'Attend your consultation and immediately view your digital prescriptions and health records.',
    icon: FileText,
    tag: 'Instant EHR',
  },
];

const CLINICAL_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Verified Medical Practitioners',
    desc: 'Every physician undergoes rigorous regulatory credentialing and hospital administrator verification.',
  },
  {
    icon: Zap,
    title: 'Precision 10-Minute Intervals',
    desc: 'Structured scheduling prevents clinic congestion, respects patient time, and guarantees focused consultations.',
  },
  {
    icon: HeartPulse,
    title: 'Complete Digital Health Records',
    desc: 'Consultation summaries, official diagnoses, and doctor prescriptions stored in your private patient portal.',
  },
  {
    icon: HeartHandshake,
    title: 'Fair & Transparent Policies',
    desc: 'Upfront consultation fees with official digital receipts and automated 50% refund support on cancellations.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The 10-minute time-slot system is a game changer. I walked into the clinic, was seen right on time by Dr. Smith, and my prescription was in my portal before I reached home.',
    author: 'Priya Sharma',
    role: 'Patient since 2024',
    rating: 5,
    specialty: 'Cardiology Care',
  },
  {
    quote:
      'Booking a specialist for my toddler used to take days. Here, I found Dr. Patel, booked a slot in under 60 seconds, and received clear follow-up notes online.',
    author: 'Rahul Verma',
    role: 'Parent & Patient',
    rating: 5,
    specialty: 'Pediatrics Care',
  },
  {
    quote:
      'As someone with a busy schedule, predictable healthcare appointments are rare. This hospital management system delivers exactly what it promises.',
    author: 'Ananya Deshmukh',
    role: 'Verified Patient',
    rating: 5,
    specialty: 'Dermatology Consultation',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState('');
  const [activeSlot, setActiveSlot] = useState('09:10 AM');

  useEffect(() => {
    api
      .get('/specialties/')
      .then((r) => setSpecialties((r.data.results || r.data).slice(0, 8)))
      .catch(() => {});
    api
      .get('/doctors/')
      .then((r) => setDoctors((r.data.results || r.data).slice(0, 4)))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedSpecialtyFilter) params.append('specialty', selectedSpecialtyFilter);
    navigate(`/doctors?${params.toString()}`);
  };

  const getSpecialtyIcon = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('cardio') || lower.includes('heart')) return HeartPulse;
    if (lower.includes('derma') || lower.includes('skin')) return Sparkles;
    if (lower.includes('pediatric') || lower.includes('child')) return Heart;
    if (lower.includes('ortho') || lower.includes('bone') || lower.includes('joint'))
      return Activity;
    return Stethoscope;
  };

  const featuredDoctor = doctors[0] || {
    id: 1,
    full_name: 'James Smith',
    specialty: { name: 'Cardiology' },
    fee: '800.00',
    experience_years: 15,
  };

  return (
    <div className="bg-[#f0f4f6] text-slate-800 selection:bg-teal-500 selection:text-white">
      {/* --------------------------------------------------------------------- */}
      {/* 1. HERO SECTION                                                      */}
      {/* --------------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle hospital-themed grid background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #5eead4 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Soft glowing hospital ambient orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & Search */}
            <div className="lg:col-span-7 space-y-6">
              {/* Clinical Trust Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/20 text-teal-300 text-xs sm:text-sm font-medium backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
                </span>
                <span>CityCare Clinical Network • 10-Minute Smart Booking</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                Precision Medical Care,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-cyan-300">
                  Zero Waiting Time.
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                Connect with board-certified physicians through our smart 10-minute interval
                scheduling. Instant doctor confirmations, transparent billing, and secure digital health records.
              </p>

              {/* Search Widget */}
              <form
                onSubmit={handleSearch}
                className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl shadow-black/20 flex flex-col sm:flex-row gap-2 max-w-2xl"
              >
                <div className="relative flex-1 flex items-center">
                  <Search className="w-5 h-5 text-teal-300 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctor, condition, or specialty..."
                    className="w-full pl-11 pr-3 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-slate-300/70 text-sm rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all"
                  />
                </div>

                <div className="sm:w-48">
                  <select
                    value={selectedSpecialtyFilter}
                    onChange={(e) => setSelectedSpecialtyFilter(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-sm rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-white">
                      All Departments
                    </option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 shrink-0"
                >
                  Find Doctors
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Trust Highlights */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300/90 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" /> 100% Board Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" /> Instant Acceptance Flow
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" /> Encrypted Health History
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Clinical Preview Card */}
            <div className="lg:col-span-5 relative">
              {/* Outer decorative glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500/30 to-cyan-500/30 blur-xl opacity-60" />

              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/40 text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Live OPD Desk</h3>
                      <p className="text-[11px] text-teal-400">Real-time availability</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Clinic
                  </span>
                </div>

                {/* Doctor Mini-Profile */}
                <div className="mt-5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
                    {featuredDoctor.full_name ? featuredDoctor.full_name[0] : 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-white truncate">
                        Dr. {featuredDoctor.full_name}
                      </p>
                      <BadgeCheck className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                    <p className="text-xs text-teal-300 font-medium">
                      {featuredDoctor.specialty?.name || 'Cardiology'} Specialist
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span>{featuredDoctor.experience_years || 12}+ yrs experience</span>
                      <span>•</span>
                      <span className="text-white font-medium">₹{featuredDoctor.fee || '800'} fee</span>
                    </div>
                  </div>
                </div>

                {/* Interactive 10-Minute Slot Selector */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-400" /> Next Available 10-Min Slots
                    </span>
                    <span className="text-[11px] text-slate-400">Today</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_SLOTS.map((slot) => {
                      const isSelected = activeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setActiveSlot(slot)}
                          className={`py-2 px-2 rounded-xl text-xs font-medium text-center transition-all duration-150 border ${
                            isSelected
                              ? 'bg-teal-500 text-slate-950 border-teal-400 font-semibold shadow-md shadow-teal-500/30'
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/70 hover:border-teal-500/40'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>

                  {/* Slot selection notice */}
                  <div className="mt-3.5 px-3 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                    <span>Selected: <b>{activeSlot}</b> (10-min focused consultation)</span>
                  </div>
                </div>

                {/* Booking CTA */}
                <div className="mt-5">
                  <Link
                    to={`/doctors/${featuredDoctor.id}`}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
                  >
                    <span>Proceed to Book Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Footer Assurance */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Hospital Verified
                  </span>
                  <span>Instant Status Email</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 2. EMERGENCY & HOSPITAL QUICK TRIAGE BAR                              */}
      {/* --------------------------------------------------------------------- */}
      <section className="border-y border-slate-200/90 bg-[#eaf1f3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 items-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Helpline */}
            <div className="flex items-center gap-3.5 pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">24/7 Hospital Helpline</p>
                <a
                  href="tel:+9118001234567"
                  className="text-sm font-semibold text-slate-900 hover:text-teal-600 transition-colors"
                >
                  +91 1800-123-4567 <span className="text-xs text-rose-600 font-normal">(Toll Free)</span>
                </a>
              </div>
            </div>

            {/* OPD Timings */}
            <div className="flex items-center gap-3.5 pt-4 md:pt-0 md:pl-6">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Outpatient (OPD) Hours</p>
                <p className="text-sm font-semibold text-slate-900">
                  Mon – Sat: 08:00 AM – 08:00 PM
                </p>
              </div>
            </div>

            {/* Hospital Campus */}
            <div className="flex items-center gap-3.5 pt-4 md:pt-0 md:pl-6">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Emergency Care Center</p>
                <p className="text-sm font-semibold text-slate-900">
                  CityCare Central Complex, Ward 4
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. CLINICAL IMPACT STATS                                              */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-12 bg-[#f0f4f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-teal-200 hover:shadow-sm transition-all"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-teal-50 text-teal-700 mb-3.5">
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. 10-MINUTE SMART WORKFLOW                                           */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-20 bg-[#edf3f5] border-t border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-wider text-teal-600 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              The 10-Minute Appointment Protocol
            </span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Designed to Eliminate Clinic Delays
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Standard appointments cause crowded waiting areas and unpredictable schedules. Our system
              breaks availability into dedicated 10-minute intervals for punctual, focused healthcare.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {WORKFLOW_STEPS.map((step) => (
              <div
                key={step.step}
                className="relative bg-slate-50/70 rounded-3xl p-8 border border-slate-200/80 hover:border-teal-300 hover:bg-white hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-slate-300 group-hover:text-teal-500 transition-colors">
                    {step.step}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-full border border-teal-100">
                    {step.tag}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-5 shadow-md shadow-teal-600/20">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 5. MEDICAL SPECIALTIES GRID                                           */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-20 bg-[#f0f4f6] border-t border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold tracking-wider text-teal-600 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                Hospital Departments
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Specialized Clinical Departments
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Browse our expert medical disciplines and book direct consultations with verified doctors.
              </p>
            </div>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
            >
              Explore all specialists <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {specialties.length > 0
              ? specialties.map((s) => {
                  const Icon = getSpecialtyIcon(s.name);
                  return (
                    <Link
                      key={s.id}
                      to={`/doctors?specialty=${s.id}`}
                      className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-base">
                          {s.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {s.description || 'Specialized clinical care, diagnostic reviews, and scheduled treatments.'}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-teal-700">
                        <span>View Available Slots</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })
              : [
                  { name: 'Cardiology', desc: 'Heart care, ECG monitoring, and cardiovascular management.' },
                  { name: 'Dermatology', desc: 'Skin health, dermatological diagnostics, and treatments.' },
                  { name: 'Pediatrics', desc: 'Comprehensive care and wellness for infants and children.' },
                  { name: 'Orthopedics', desc: 'Joint mobility, bone health, and musculoskeletal care.' },
                ].map((fallback) => (
                  <Link
                    key={fallback.name}
                    to="/doctors"
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-base">
                        {fallback.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{fallback.desc}</p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-teal-700">
                      <span>View Doctors</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 6. FEATURED VERIFIED DOCTORS                                          */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-20 bg-[#edf4f6] border-t border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-wider text-teal-600 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Verified Medical Staff
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Attending Physicians
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Consult with hospital-verified specialists accepting new patients for 10-minute intervals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50/60 rounded-3xl p-6 border border-slate-200/80 hover:border-teal-300 hover:bg-white hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Doctor Avatar / Initials */}
                  <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-600 to-slate-800 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-teal-700/10 mb-4">
                    {(doc.full_name || 'D')[0].toUpperCase()}
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center border-2 border-white shadow-xs">
                      <BadgeCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Doctor Details */}
                  <div className="text-center">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                      Dr. {doc.full_name}
                    </h3>
                    <p className="text-xs font-medium text-teal-700 mt-1">
                      {doc.specialty?.name || 'General Medicine'}
                    </p>

                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 5.0
                      </span>
                      <span>•</span>
                      <span>{doc.experience_years || 8}+ yrs exp</span>
                    </div>

                    <div className="mt-4 py-2 px-3 bg-white rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Consultation Fee</span>
                      <span className="font-bold text-slate-900">₹{doc.fee}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to={`/doctors/${doc.id}`}
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>View Slots & Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors shadow-md"
            >
              Browse All Verified Doctors
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 7. CLINICAL SAFETY & QUALITY STANDARDS                                */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-bold tracking-wider text-teal-400 uppercase bg-teal-500/10 px-3 py-1 rounded-full border border-teal-400/20">
              Institutional Quality
            </span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Built to Strict Healthcare Operational Standards
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Every appointment, medical record, and financial transaction adheres to stringent data
              protection and medical scheduling protocols.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CLINICAL_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-teal-500/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5 border border-teal-500/20">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{pillar.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 8. PATIENT TESTIMONIALS                                               */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-20 bg-[#f0f4f6] border-t border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-wider text-teal-600 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Patient Experiences
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Trusted by Over 15,000 Patients
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Read how our 10-minute appointment intervals transformed consultations for patients.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.author}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                  <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                    {t.specialty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 9. CALL TO ACTION                                                     */}
      {/* --------------------------------------------------------------------- */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Schedule Your Consultation in Under 2 Minutes
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience hospital care with exact time-slot bookings, verified specialists, and immediate doctor confirmation.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              to="/doctors"
              className="px-8 py-3.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2"
            >
              Book an Appointment
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm transition-all border border-white/20 backdrop-blur-sm"
            >
              Create Patient Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
