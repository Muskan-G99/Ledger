import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import Card from '../ui/Card'
import StatCard from '../ui/StatCard'
import { formatCurrency } from '../../lib/format'
import { Wallet } from 'lucide-react'

const FREQUENCIES = {
  weekly: { label: 'Weekly', periods: 52 },
  biweekly: { label: 'Bi-weekly', periods: 26 },
  semimonthly: { label: 'Semi-monthly', periods: 24 },
  monthly: { label: 'Monthly', periods: 12 },
}

const ALLOCATION_COLORS = { 'Take-home': '#22c55e', '401k': '#3b82f6', Taxes: '#ef4444', 'Other deductions': '#a855f7' }

function Field({ label, suffix, value, onChange, step = '1' }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="flex items-center rounded-lg border border-slate-200 px-3 py-2">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full outline-none"
        />
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
      </div>
    </label>
  )
}

export default function PaycheckModule() {
  const [grossSalary, setGrossSalary] = useState(95000)
  const [frequency, setFrequency] = useState('biweekly')
  const [contribution401k, setContribution401k] = useState(6)
  const [taxRate, setTaxRate] = useState(24)
  const [preTaxDeductions, setPreTaxDeductions] = useState(150)
  const [postTaxDeductions, setPostTaxDeductions] = useState(40)

  const breakdown = useMemo(() => {
    const periods = FREQUENCIES[frequency].periods
    const grossPerPaycheck = grossSalary / periods
    const k401Amount = grossPerPaycheck * (contribution401k / 100)
    const taxableIncome = grossPerPaycheck - k401Amount - preTaxDeductions
    const taxes = taxableIncome * (taxRate / 100)
    const netPay = taxableIncome - taxes - postTaxDeductions
    return { periods, grossPerPaycheck, k401Amount, taxableIncome, taxes, netPay }
  }, [grossSalary, frequency, contribution401k, taxRate, preTaxDeductions, postTaxDeductions])

  const allocation = [
    { name: 'Take-home', value: breakdown.netPay },
    { name: '401k', value: breakdown.k401Amount },
    { name: 'Taxes', value: breakdown.taxes },
    { name: 'Other deductions', value: preTaxDeductions + postTaxDeductions },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Net Pay / Paycheck" value={formatCurrency(breakdown.netPay)} icon={Wallet} tone="positive" />
        <StatCard label="Annual Net (est.)" value={formatCurrency(breakdown.netPay * breakdown.periods)} icon={Wallet} />
        <StatCard
          label="401k Contributions / Year"
          value={formatCurrency(breakdown.k401Amount * breakdown.periods)}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Inputs" className="lg:col-span-1">
          <div className="flex flex-col gap-4">
            <Field label="Gross Annual Salary" suffix="USD" value={grossSalary} onChange={setGrossSalary} step="500" />
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500">Pay Frequency</span>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {Object.entries(FREQUENCIES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Field label="401(k) Contribution" suffix="%" value={contribution401k} onChange={setContribution401k} step="0.5" />
            <Field label="Effective Tax Rate" suffix="%" value={taxRate} onChange={setTaxRate} step="0.5" />
            <Field label="Pre-tax Deductions (health, etc.)" suffix="USD/paycheck" value={preTaxDeductions} onChange={setPreTaxDeductions} />
            <Field label="Post-tax Deductions" suffix="USD/paycheck" value={postTaxDeductions} onChange={setPostTaxDeductions} />
          </div>
        </Card>

        <Card title="Per-Paycheck Breakdown" className="lg:col-span-1">
          <dl className="flex flex-col gap-3 text-sm">
            {[
              ['Gross Pay', breakdown.grossPerPaycheck],
              ['401(k) Contribution', -breakdown.k401Amount],
              ['Pre-tax Deductions', -preTaxDeductions],
              ['Taxable Income', breakdown.taxableIncome],
              ['Estimated Taxes', -breakdown.taxes],
              ['Post-tax Deductions', -postTaxDeductions],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-slate-50 pb-2">
                <dt className="text-slate-500">{label}</dt>
                <dd className={`font-medium ${value < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {value < 0 ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <dt className="font-semibold text-slate-900">Net Take-Home</dt>
              <dd className="text-lg font-bold text-emerald-600">{formatCurrency(breakdown.netPay)}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Allocation" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {allocation.map((entry) => (
                  <Cell key={entry.name} fill={ALLOCATION_COLORS[entry.name]} />
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
