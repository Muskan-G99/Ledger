export default function StatCard({ label, value, sublabel, tone = 'default', icon: Icon }) {
  const toneClasses = {
    default: 'text-slate-900',
    positive: 'text-emerald-600',
    negative: 'text-rose-600',
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>
      <p className={`mt-2 text-2xl font-semibold ${toneClasses[tone]}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
    </div>
  )
}
