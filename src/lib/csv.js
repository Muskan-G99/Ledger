import Papa from 'papaparse'
import { CATEGORIES, CATEGORY_KEYWORDS } from './constants'
import { getCard } from '../data/cards'

// Bill payments (autopay, "thank you for your payment", etc.) aren't spend or
// anti-spend - they're just you paying down what you owe - so they're dropped
// entirely rather than counted as either a charge or a refund.
const SKIP_RE = /autopay|payment.*thank you|electronic payment|statement credit/i

export const guessCategory = (description = '') => {
  const desc = description.toLowerCase()
  for (const category of Object.keys(CATEGORY_KEYWORDS)) {
    if (CATEGORY_KEYWORDS[category].some((kw) => desc.includes(kw))) return category
  }
  return 'Other'
}

const pick = (row, keys) => {
  for (const key of keys) {
    const found = Object.keys(row).find((k) => k.toLowerCase().trim() === key)
    if (found && row[found] !== undefined && row[found] !== '') return row[found]
  }
  return undefined
}

export const importId = (i) => `import-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`

export const parseTransactionsCSV = (file, cardId, onComplete) => {
  // Credit card exports use a single signed "amount" column: charges are
  // positive, payments/credits are negative. Bank exports tend to do the
  // opposite for ordinary debits, so for those we keep the existing
  // always-positive behavior and rely on description-based Income detection
  // instead. Preserving the credit-card sign convention lets genuine
  // merchant refunds net back out of the category they were spent in,
  // rather than getting counted as a duplicate charge.
  const isCreditCard = Boolean(getCard(cardId))
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data
        .map((row, i) => {
          const date = pick(row, ['transaction date', 'date', 'posted date', 'posting date'])
          const description = pick(row, ['description', 'merchant', 'name'])
          const amountRaw = pick(row, ['amount', 'debit'])
          const categoryRaw = pick(row, ['category'])
          if (!date || !description || amountRaw === undefined || SKIP_RE.test(description)) return null
          const parsed = parseFloat(String(amountRaw).replace(/[^0-9.-]/g, ''))
          const amount = isCreditCard ? parsed : Math.abs(parsed)
          if (!amount) return null
          const category = CATEGORIES.includes(categoryRaw) ? categoryRaw : guessCategory(description)
          return {
            id: importId(i),
            date,
            merchant: description,
            amount,
            category,
            card: cardId || 'imported',
          }
        })
        .filter(Boolean)
      onComplete(rows)
    },
  })
}

export const parseInvestmentsCSV = (file, onComplete) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data
        .map((row, i) => {
          const symbol = pick(row, ['symbol', 'instrument', 'ticker'])
          const shares = pick(row, ['quantity', 'shares'])
          const avgCost = pick(row, ['average cost', 'avg cost', 'cost basis per share'])
          const price = pick(row, ['price', 'last price', 'current price'])
          if (!symbol || shares === undefined) return null
          return {
            id: importId(i),
            symbol: symbol.toUpperCase(),
            name: symbol.toUpperCase(),
            shares: parseFloat(shares),
            avgCost: parseFloat(String(avgCost).replace(/[^0-9.-]/g, '')) || 0,
            currentPrice: parseFloat(String(price).replace(/[^0-9.-]/g, '')) || 0,
            assetType: 'Stock',
          }
        })
        .filter(Boolean)
      onComplete(rows)
    },
  })
}
