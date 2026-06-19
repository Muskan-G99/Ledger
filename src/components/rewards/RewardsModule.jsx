import { useMemo } from 'react'
import Card from '../ui/Card'
import StatCard from '../ui/StatCard'
import { CARDS, getCard, getEffectiveRate, bestCardForCategory, bestCardForTransaction } from '../../data/cards'
import { CATEGORIES } from '../../lib/constants'
import { formatCurrency, formatPercent } from '../../lib/format'
import { Gift, Sparkles, TrendingUp } from 'lucide-react'

export default function RewardsModule({ transactions }) {
  const { earnedTotal, optimalTotal, perCard } = useMemo(() => {
    let earnedTotal = 0
    let optimalTotal = 0
    const perCard = {}
    CARDS.forEach((c) => (perCard[c.id] = 0))

    transactions.forEach((t) => {
      const card = getCard(t.card)
      if (card) {
        const earned = t.amount * (getEffectiveRate(card, t) / 100)
        earnedTotal += earned
        perCard[card.id] += earned
      }
      const best = bestCardForTransaction(t)
      optimalTotal += t.amount * (getEffectiveRate(best, t) / 100)
    })

    return { earnedTotal, optimalTotal, perCard }
  }, [transactions])

  const missedSavings = Math.max(optimalTotal - earnedTotal, 0)
  const topCard = Object.entries(perCard).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Rewards Earned (YTD)" value={formatCurrency(earnedTotal)} icon={Gift} tone="positive" />
        <StatCard
          label="Top Earning Card"
          value={topCard ? getCard(topCard[0])?.name : '—'}
          sublabel={topCard ? formatCurrency(topCard[1]) : ''}
          icon={TrendingUp}
        />
        <StatCard
          label="Missed Savings"
          value={formatCurrency(missedSavings)}
          sublabel="If optimal card was used every time"
          icon={Sparkles}
          tone={missedSavings > 0 ? 'negative' : 'positive'}
        />
      </div>

      <Card title="Card Configuration">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div key={card.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{card.name}</p>
                  <p className="text-xs text-slate-400">•••• {card.last4}</p>
                </div>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: card.color }} />
              </div>
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                {Object.values(card.rates).every((r) => r === card.rates.Other) ? (
                  <div className="flex justify-between">
                    <span>Everything</span>
                    <span className="font-medium text-slate-700">{card.rates.Other}%</span>
                  </div>
                ) : (
                  Object.entries(card.rates)
                    .filter(([, rate]) => rate > 1)
                    .map(([cat, rate]) => (
                      <div key={cat} className="flex justify-between">
                        <span>{cat}</span>
                        <span className="font-medium text-slate-700">{rate}%</span>
                      </div>
                    ))
                )}
                {card.merchantRules?.map((rule) => (
                  <div key={rule.label} className="flex justify-between text-cyan-700">
                    <span>{rule.label}</span>
                    <span className="font-medium">{rule.rate}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-slate-100 pt-2 text-xs">
                <span className="text-slate-400">Earned: </span>
                <span className="font-semibold text-emerald-600">{formatCurrency(perCard[card.id])}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Optimal Card by Category">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Best Card</th>
                <th className="py-2 text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => {
                const best = bestCardForCategory(cat)
                return (
                  <tr key={cat} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-slate-800">{cat}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{best.name}</td>
                    <td className="py-2.5 text-right font-semibold text-emerald-600">
                      {formatPercent(best.rates[cat])}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
