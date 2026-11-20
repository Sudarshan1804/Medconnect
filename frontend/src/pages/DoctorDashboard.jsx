import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  X,
  ClipboardList,
  ThumbsUp,
  TimerOff,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorDashboard() {
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotForm, setSlotForm] = useState({ day_of_week: '0', start_time: '09:00', end_time: '10:00' });
  const [addingSlot, setAddingSlot] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [recordModal, setRecordModal] = useState(null);
  const [recordForm, setRecordForm] = useState({ diagnosis: '', prescription: '', notes: '' });
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    try {
      const [slotsRes, apptsRes] = await Promise.all([
        api.get('/slots/'),
        api.get('/appointments/'),
      ]);
      setSlots(slotsRes.data.results || slotsRes.data);
      setAppointments(apptsRes.data.results || apptsRes.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeSlots = slots.filter((s) => s.is_active);

  const filteredAppointments = statusFilter
    ? appointments.filter((a) => a.status === statusFilter)
    : appointments;

  // Slot management
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setAddingSlot(true);
    try {
      await api.post('/slots/', slotForm);
      toast.success('Availability slot added successfully');
      fetchData();
      setSlotForm({ day_of_week: '0', start_time: '09:00', end_time: '10:00' });
    } catch (err) {
      toast.error(err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(' ') || 'Failed to add slot');
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Deactivate this availability slot?')) return;
    try {
      await api.delete(`/slots/${slotId}/`);
      toast.success('Slot deactivated');
      fetchData();
    } catch {
      toast.error('Failed to delete slot');
    }
  };

  // Appointment actions
  const appointmentAction = async (id, action, label) => {
    setActionLoading(`${id}-${action}`);
    try {
      await api.post(`/appointments/${id}/${action}/`);
      toast.success(`Appointment ${label}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || `Failed to ${label}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Add medical record
  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!recordForm.diagnosis.trim()) {
      toast.error('Diagnosis is required');
      return;
    }
    setActionLoading('record');
    try {
      await api.post('/records/', {
        appointment_id: recordModal.id,
        ...recordForm,
      });
      toast.success('Medical record & prescription created');
      setRecordModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create record');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="py-32" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold tracking-wider text-teal-600 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
          Physician Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Doctor Clinical Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Manage recurring 10-minute availability slots, review patient requests, and write EHR diagnoses</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: Slot Manager */}
        <div className="space-y-6">
          {/* Add Slot */}
          <div className="card p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Configure Slot Windows
            </h2>

            <form onSubmit={handleAddSlot} className="space-y-3">
              <div>
                <label className="label">Day of Week</label>
                <select
                  value={slotForm.day_of_week}
                  onChange={(e) => setSlotForm({ ...slotForm, day_of_week: e.target.value })}
                  className="input cursor-pointer"
                >
                  {DAYS.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Time</label>
                  <input
                    type="time"
                    value={slotForm.start_time}
                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">End Time</label>
                  <input
                    type="time"
                    value={slotForm.end_time}
                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <button type="submit" disabled={addingSlot} className="btn-primary w-full btn-sm">
                {addingSlot ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Open Availability Slot
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Current Slots */}
          <div className="card p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Active Recurring Slots ({activeSlots.length})</h3>
            {activeSlots.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No availability slots opened yet</p>
            ) : (
              <div className="space-y-2">
                {activeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {DAYS[slot.day_of_week]}
                      </p>
                      <p className="text-xs text-teal-700 font-medium">
                        {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)} (10-min intervals)
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Deactivate slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Appointments */}
        <div className="lg:col-span-2">
          <div className="card p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Patient Consultations ({filteredAppointments.length})
              </h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-auto py-1.5 text-xs sm:text-sm cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending Acceptance</option>
                <option value="CONFIRMED">Confirmed / Upcoming</option>
                <option value="COMPLETED">Attended / Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired / No-Show</option>
              </select>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium text-sm">No consultations found in this category</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appt) => {
                  const isPending = appt.status === 'PENDING';
                  const isConfirmed = appt.status === 'CONFIRMED';
                  const isCompleted = appt.status === 'COMPLETED';
                  return (
                    <div key={appt.id} className="border border-slate-200/80 rounded-2xl p-4 hover:border-teal-200 transition-colors bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-slate-900 text-sm">
                              {appt.patient_name || appt.patient_email || 'Patient'}
                            </p>
                            <StatusBadge status={appt.status} />
                            {appt.payment_status === 'PAID' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ Fee Paid (₹{parseFloat(appt.doctor_fee || 0).toFixed(0)})
                              </span>
                            ) : appt.payment_status === 'REFUND_PENDING' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                ⏳ 50% Refund Pending (₹{parseFloat(appt.refund_amount || (appt.doctor_fee || 0) * 0.5).toFixed(0)})
                              </span>
                            ) : appt.payment_status === 'REFUNDED' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-300">
                                ✓ 50% Refunded (₹{parseFloat(appt.refund_amount || (appt.doctor_fee || 0) * 0.5).toFixed(0)})
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Fee Unpaid
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-teal-600" />
                              {appt.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-teal-600" />
                              {appt.appointment_time?.slice(0, 5) || appt.slot?.start_time?.slice(0, 5)} (10 min)
                            </span>
                          </div>
                          {appt.reason && (
                            <p className="text-xs text-slate-500 mt-1 truncate">Reason: {appt.reason}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {/* PENDING: Doctor can Accept or Decline */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => appointmentAction(appt.id, 'confirm', 'confirmed')}
                                disabled={actionLoading === `${appt.id}-confirm`}
                                className="btn-sm bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 transition-colors"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                Accept
                              </button>
                              <button
                                onClick={() => appointmentAction(appt.id, 'cancel', 'declined')}
                                disabled={actionLoading === `${appt.id}-cancel`}
                                className="btn-sm bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Decline
                              </button>
                            </>
                          )}

                          {/* CONFIRMED: Doctor can mark Attended, Expired, or Cancel */}
                          {isConfirmed && (
                            <>
                              <button
                                onClick={() => appointmentAction(appt.id, 'complete', 'marked as attended')}
                                disabled={actionLoading === `${appt.id}-complete`}
                                className="btn-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Attended
                              </button>
                              <button
                                onClick={() => appointmentAction(appt.id, 'expire', 'marked as expired')}
                                disabled={actionLoading === `${appt.id}-expire`}
                                className="btn-sm bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 transition-colors"
                              >
                                <TimerOff className="w-3.5 h-3.5" />
                                Expired
                              </button>
                              <button
                                onClick={() => appointmentAction(appt.id, 'cancel', 'cancelled')}
                                disabled={actionLoading === `${appt.id}-cancel`}
                                className="btn-sm bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </>
                          )}

                          {/* COMPLETED: Add medical record */}
                          {isCompleted && !appt.has_medical_record && (
                            <button
                              onClick={() => {
                                setRecordModal(appt);
                                setRecordForm({ diagnosis: '', prescription: '', notes: '' });
                              }}
                              className="btn-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 transition-colors shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Write EHR Record
                            </button>
                          )}
                          {isCompleted && appt.has_medical_record && (
                            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Record Filed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medical Record Modal */}
      {recordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-scale-in border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Write Digital Medical Record
              </h3>
              <button onClick={() => setRecordModal(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="text-xs text-slate-600 mb-4 p-3 bg-teal-50/50 rounded-xl border border-teal-100/60">
              Patient: <strong>{recordModal.patient_name || recordModal.patient_email}</strong> · Consultation on{' '}
              <strong>{recordModal.date}</strong> at{' '}
              <strong>{recordModal.appointment_time?.slice(0, 5) || recordModal.slot?.start_time?.slice(0, 5)}</strong>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div>
                <label className="label">Diagnosis Findings *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter medical assessment and diagnosis..."
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Prescription & Medication</label>
                <textarea
                  rows={3}
                  placeholder="Enter medications, dosage, and intake timings..."
                  value={recordForm.prescription}
                  onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Doctor Follow-up Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any dietary advice or follow-up instructions..."
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecordModal(null)}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'record'}
                  className="btn-primary btn-sm"
                >
                  {actionLoading === 'record' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save Medical Record'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
