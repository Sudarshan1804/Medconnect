import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, Star, ArrowRight, Stethoscope, BadgeCheck } from 'lucide-react';

export default function DoctorList() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (isAuthenticated && role === 'DOCTOR') {
      navigate('/doctor/dashboard', { replace: true });
    } else if (isAuthenticated && role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialtyFilter, setSpecialtyFilter] = useState(searchParams.get('specialty') || '');

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (specialtyFilter) params.specialty = specialtyFilter;
      const { data } = await api.get('/doctors/', { params });
      setDoctors(data.results || data);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [search, specialtyFilter]);

  useEffect(() => {
    api.get('/specialties/').then((r) => setSpecialties(r.data.results || r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDoctors();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchDoctors]);

  const handleSearch = (val) => {
    setSearch(val);
    const params = {};
    if (val) params.search = val;
    if (specialtyFilter) params.specialty = specialtyFilter;
    setSearchParams(params);
  };

  const handleSpecialty = (val) => {
    setSpecialtyFilter(val);
    const params = {};
    if (search) params.search = search;
    if (val) params.specialty = val;
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold tracking-wider text-teal-600 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
          Medical Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Find a Medical Specialist</h1>
        <p className="text-sm text-slate-500 mt-1">Browse verified hospital physicians and choose an exact 10-minute appointment slot</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="doctor-search"
              type="text"
              placeholder="Search by physician name or keyword..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="sm:w-64 relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              id="specialty-filter"
              value={specialtyFilter}
              onChange={(e) => handleSpecialty(e.target.value)}
              className="input pl-10 cursor-pointer"
            >
              <option value="">All Departments</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-700">No specialists found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search criteria or department filter</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <Link
              key={doc.id}
              to={`/doctors/${doc.id}`}
              className="card-hover p-6 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-slate-800 flex items-center justify-center shrink-0 shadow-md text-white font-bold text-xl">
                    {(doc.full_name || 'D')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                        Dr. {doc.full_name}
                      </h3>
                      <BadgeCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    </div>
                    <p className="text-xs text-teal-700 font-semibold mt-0.5">
                      {doc.specialty?.name || 'General Medicine'}
                    </p>
                  </div>
                </div>

                {doc.bio && (
                  <p className="text-xs text-slate-500 mt-4 line-clamp-2 leading-relaxed">{doc.bio}</p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {doc.experience_years}y exp
                  </span>
                  <span>•</span>
                  <span className="font-bold text-slate-900">₹{doc.fee}</span>
                </div>
                <span className="text-xs font-semibold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View 10-Min Slots <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
