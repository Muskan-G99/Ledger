import { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import Card from '../ui/Card'
import StatCard from '../ui/StatCard'
import { CATEGORIES, CATEGORY_COLORS } from '../../lib/constants'
import { formatCurrency, formatMonth } from '../../lib/format'
import { CalendarDays, TrendingDown, TrendingUp } from 'lucide-react'

export default function SpendingModule({ transactions }) {
  const monthly = useMemo(() => {
    const byMonth = {}
    transactions.forEach((t) => {
      const key = t.date.slice(0, 7)
      if (!byMonth[key]) {
        byMonth[key] = { key, month: formatMonth(t.date), total: 0 }
        CATEGORIES.forEach((c) => (byMonth[key][c] = 0))
      }
      byMonth[key][t.category] += t.amount
      byMonth[key].total += t.amount
    })
    return Object.values(byMonth).sort((a, b) => a.key.localeCompare(b.key))
  }, [transactions])

  const currentMonth = monthly[monthly.length - 1]
  const previousMonth = monthly[monthly.length - 2]
  const momChange =
    previousMonth && previousMonth.total > 0
      ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100
      : 0

  const currentMonthBreakdown = useMemo(
    () =>
      currentMonth
        ? CATEGORIES.map((c) => ({ name: c, value: currentMonth[c] })).filter((d) => d.value > 0)
        : [],
    [currentMonth],
  )

  const avgMonthly = useMemo(
    () => (monthly.length ? monthly.reduce((sum, m) => sum + m.total, 0) / monthly.length : 0),
    [monthly],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="This Month's Spend"
          value={formatCurrency(currentMonth?.total ?? 0)}
          sublabel={`${momChange >= 0 ? '+' : ''}${momChange.toFixed(1)}% vs last month`}
          icon={momChange >= 0 ? TrendingUp : TrendingDown}
          tone={momChange >= 0 ? 'negative' : 'positive'}
        />
        <StatCard label="6-Month Average" value={formatCurrency(avgMonthly)} icon={CalendarDays} />
        <StatCard label="Months Tracked" value={monthly.length} icon={CalendarDays} />
      </div>

      <Card title="Spending Over Time">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            {CATEGORIES.map((c) => (
              <Bar key={c} dataKey={c} stackId="spend" fill={CATEGORY_COLORS[c]} radius={[2, 2, 0, 0]} />
            ))}
            <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} name="Total" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="This Month by Category">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={currentMonthBreakdown}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
              >
                {currentMonthBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Category Totals (All Time)">
          <div className="flex flex-col gap-3">
            {CATEGORIES.map((cat) => {
              const total = transactions.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0)
              const max = Math.max(...CATEGORIES.map((c) => transactions.filter((t) => t.category === c).reduce((s, t) => s + t.amount, 0)))
              const pct = max === 0 ? 0 : (total / max) * 100
              return (
                <div key={cat}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-600">{cat}</span>
                    <span className="font-medium text-slate-800">{formatCurrency(total)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
