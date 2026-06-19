import { useMemo, useState } from 'react'
import Card from '../ui/Card'
import StatCard from '../ui/StatCard'
import Badge from '../ui/Badge'
import ImportButton from '../ui/ImportButton'
import { parseTransactionsCSV } from '../../lib/csv'
import { formatCurrency, formatDate } from '../../lib/format'
import { CATEGORIES } from '../../lib/constants'
import { getCard } from '../../data/cards'
import { CreditCard, Receipt, TrendingUp } from 'lucide-react'

export default function TransactionsModule({ transactions, onImport }) {
  const [categoryFilter, setCategoryFilter] = useState('All')

  const filtered = useMemo(
    () => (categoryFilter === 'All' ? transactions : transactions.filter((t) => t.category === categoryFilter)),
    [transactions, categoryFilter],
  )

  const totalSpent = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions])
  const topCategory = useMemo(() => {
    const totals = {}
    transactions.forEach((t) => (totals[t.category] = (totals[t.category] ?? 0) + t.amount))
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]
  }, [transactions])

  const handleFile = (file) => {
    parseTransactionsCSV(file, (rows) => onImport(rows))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Tracked Spend" value={formatCurrency(totalSpent)} icon={Receipt} />
        <StatCard label="Transactions" value={transactions.length} icon={CreditCard} />
        <StatCard
          label="Top Category"
          value={topCategory?.[0] ?? '—'}
          sublabel={topCategory ? formatCurrency(topCategory[1]) : ''}
          icon={TrendingUp}
        />
      </div>

      <Card
        title="All Transactions"
        action={
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600"
            >
              <option>All</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ImportButton label="Import CSV" onFile={handleFile} />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Merchant</th>
                <th className="py-2 pr-4">Card</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const card = getCard(t.card)
                return (
                  <tr key={t.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-4 text-slate-500">{formatDate(t.date)}</td>
                    <td className="py-2.5 pr-4 font-medium text-slate-800">{t.merchant}</td>
                    <td className="py-2.5 pr-4 text-slate-500">{card ? card.name : 'Imported'}</td>
                    <td className="py-2.5 pr-4">
                      <Badge category={t.category} />
                    </td>
                    <td className="py-2.5 text-right font-medium text-slate-800">{formatCurrency(t.amount)}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                    No transactions in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
