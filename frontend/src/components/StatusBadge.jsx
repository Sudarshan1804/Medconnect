const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   bg: 'bg-amber-50 border border-amber-200/80',   text: 'text-amber-800',  dot: 'bg-amber-500' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-teal-50 border border-teal-200/80',    text: 'text-teal-800',   dot: 'bg-teal-500' },
  COMPLETED: { label: 'Attended',  bg: 'bg-emerald-50 border border-emerald-200/80', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-50 border border-rose-200/80',     text: 'text-rose-800',   dot: 'bg-rose-500' },
  EXPIRED:   { label: 'Expired',   bg: 'bg-slate-100 border border-slate-200/80',  text: 'text-slate-700',  dot: 'bg-slate-400' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
