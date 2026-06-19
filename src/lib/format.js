export const formatCurrency = (value, opts = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...opts,
  }).format(value)

export const formatPercent = (value, digits = 1) => `${value.toFixed(digits)}%`

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const formatMonth = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
