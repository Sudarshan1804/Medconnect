import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar,
  Stethoscope,
  Pill,
  ClipboardList,
} from 'lucide-react';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api
      .get('/records/')
      .then((r) => setRecords(r.data.results || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="py-32" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold tracking-wider text-teal-600 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
          Electronic Health Records (EHR)
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Clinical Consultation Records</h1>
        <p className="text-sm text-slate-500 mt-1">Review your official diagnoses, doctor prescriptions, and post-visit medical notes</p>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-700">No medical records yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Clinical summaries and digital prescriptions appear here immediately after your doctor marks a consultation as completed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => {
            const isOpen = expanded === rec.id;
            return (
              <div key={rec.id} className="card overflow-hidden animate-fade-in border border-slate-200/80 shadow-xs hover:border-teal-200">
                {/* Header — always visible */}
                <button
                  onClick={() => setExpanded(isOpen ? null : rec.id)}
                  className="w-full flex items-center gap-4 p-6 text-left hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 truncate">
                        {rec.diagnosis?.slice(0, 60)}
                        {rec.diagnosis?.length > 60 ? '...' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {rec.appointment?.date || rec.created_at?.slice(0, 10)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" />
                        Dr. {rec.created_by?.full_name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>

                {/* Expanded details */}
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-4 animate-slide-down">
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1">
                        <ClipboardList className="w-4 h-4 text-primary-500" />
                        Diagnosis
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        {rec.diagnosis}
                      </p>
                    </div>

                    {rec.prescription && (
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1">
                          <Pill className="w-4 h-4 text-accent-500" />
                          Prescription
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl whitespace-pre-line">
                          {rec.prescription}
                        </p>
                      </div>
                    )}

                    {rec.notes && (
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1">
                          <FileText className="w-4 h-4 text-amber-500" />
                          Notes
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl whitespace-pre-line">
                          {rec.notes}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 pt-2">
                      Patient: {rec.appointment?.patient?.name || '—'} · Created:{' '}
                      {new Date(rec.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
