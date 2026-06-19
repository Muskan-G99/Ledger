import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import Card from '../ui/Card'
import StatCard from '../ui/StatCard'
import ImportButton from '../ui/ImportButton'
import { parseInvestmentsCSV } from '../../lib/csv'
import { formatCurrency, formatPercent } from '../../lib/format'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

const ASSET_COLORS = { Stock: '#3b82f6', ETF: '#22c55e', Crypto: '#f97316', Bond: '#a855f7' }

export default function InvestmentsModule({ holdings, onImport }) {
  const enriched = useMemo(
    () =>
      holdings.map((h) => {
        const marketValue = h.shares * h.currentPrice
        const costBasis = h.shares * h.avgCost
        const gain = marketValue - costBasis
        const gainPct = costBasis === 0 ? 0 : (gain / costBasis) * 100
        return { ...h, marketValue, costBasis, gain, gainPct }
      }),
    [holdings],
  )

  const totalValue = enriched.reduce((sum, h) => sum + h.marketValue, 0)
  const totalCost = enriched.reduce((sum, h) => sum + h.costBasis, 0)
  const totalGain = totalValue - totalCost
  const totalGainPct = totalCost === 0 ? 0 : (totalGain / totalCost) * 100

  const allocation = useMemo(() => {
    const totals = {}
    enriched.forEach((h) => (totals[h.assetType] = (totals[h.assetType] ?? 0) + h.marketValue))
    return Object.entries(totals).map(([name, value]) => ({ name, value }))
  }, [enriched])

  const handleFile = (file) => {
    parseInvestmentsCSV(file, (rows) => onImport(rows))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Portfolio Value" value={formatCurrency(totalValue)} icon={DollarSign} />
        <StatCard
          label="Total Gain / Loss"
          value={formatCurrency(totalGain)}
          sublabel={formatPercent(totalGainPct)}
          icon={totalGain >= 0 ? TrendingUp : TrendingDown}
          tone={totalGain >= 0 ? 'positive' : 'negative'}
        />
        <StatCard label="Cost Basis" value={formatCurrency(totalCost)} icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="Holdings"
          className="lg:col-span-2"
          action={<ImportButton label="Import Robinhood CSV" onFile={handleFile} />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-4">Symbol</th>
                  <th className="py-2 pr-4">Shares</th>
                  <th className="py-2 pr-4">Avg Cost</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4 text-right">Value</th>
                  <th className="py-2 text-right">Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((h) => (
                  <tr key={h.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-4">
                      <p className="font-semibold text-slate-800">{h.symbol}</p>
                      <p className="text-xs text-slate-400">{h.name}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">{h.shares}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatCurrency(h.avgCost)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatCurrency(h.currentPrice)}</td>
                    <td className="py-2.5 pr-4 text-right font-medium text-slate-800">
                      {formatCurrency(h.marketValue)}
                    </td>
                    <td
                      className={`py-2.5 text-right font-medium ${h.gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      {formatCurrency(h.gain)} ({formatPercent(h.gainPct)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Allocation by Asset Type">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {allocation.map((entry) => (
                  <Cell key={entry.name} fill={ASSET_COLORS[entry.name] ?? '#64748b'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
