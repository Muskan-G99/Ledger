const TITLES = {
  overview: ['Overview', 'A snapshot of your full financial picture'],
  transactions: ['Transactions', 'Credit card activity, categorized automatically'],
  rewards: ['Rewards & Cashback', 'Track earnings and find the optimal card per category'],
  investments: ['Investments', 'Holdings, performance, and allocation'],
  paycheck: ['Paycheck Breakdown', 'Estimate your net take-home pay'],
  spending: ['Spending Summary', 'Monthly trends across categories'],
}

export default function TopBar({ active }) {
  const [title, subtitle] = TITLES[active] ?? ['Dashboard', '']
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        June 2026
      </div>
    </header>
  )
}
