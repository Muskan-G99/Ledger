import { LayoutDashboard, CreditCard, Gift, TrendingUp, Wallet, PieChart } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'rewards', label: 'Rewards & Cashback', icon: Gift },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'paycheck', label: 'Paycheck', icon: Wallet },
  { id: 'spending', label: 'Spending Summary', icon: PieChart },
]

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 sm:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
          $
        </div>
        <span className="text-lg font-semibold text-slate-900">Finch</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active === id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>
      <div className="rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-500">
        All data is mock / local. Nothing leaves your browser.
      </div>
    </aside>
  )
}
