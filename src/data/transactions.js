// Seeded mock transaction history so the dashboard works fully offline.
let seed = 42
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const range = (min, max) => Math.round((min + rand() * (max - min)) * 100) / 100

const MERCHANTS = {
  Food: ['Chipotle', 'Starbucks', 'Sushi Yama', "Chick-fil-A", 'DoorDash', 'Local Bistro', 'Pizza Place'],
  Travel: ['United Airlines', 'Airbnb', 'Marriott Hotels', 'Uber', 'Delta Air Lines', 'Hertz Rental Car'],
  Groceries: ['Whole Foods', 'Trader Joe\'s', 'Costco', 'Sprouts Market', 'Safeway'],
  Shopping: ['Amazon', 'Target', 'Best Buy', 'Nike', 'Sephora', 'Nordstrom'],
  Entertainment: ['Netflix', 'Spotify', 'AMC Theatres', 'Ticketmaster', 'Steam'],
  Utilities: ['PG&E', 'Comcast Xfinity', 'AT&T Wireless', 'City Water Dept'],
  Other: ['Venmo Transfer', 'CVS Pharmacy', 'Local ATM Fee', 'Misc Purchase'],
}

const CARD_IDS = ['csp', 'amex-gold', 'citi-cc', 'discover-it', 'cap1-qs']
const CATEGORIES = Object.keys(MERCHANTS)

const AMOUNT_RANGES = {
  Food: [8, 65],
  Travel: [60, 650],
  Groceries: [25, 180],
  Shopping: [20, 250],
  Entertainment: [10, 90],
  Utilities: [40, 160],
  Other: [5, 100],
}

const generateTransactions = () => {
  const txns = []
  const today = new Date('2026-06-19')
  let id = 1
  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1)
    const txnsThisMonth = 10 + Math.floor(rand() * 6)
    for (let i = 0; i < txnsThisMonth; i++) {
      const category = pick(CATEGORIES)
      const merchant = pick(MERCHANTS[category])
      const [min, max] = AMOUNT_RANGES[category]
      const day = 1 + Math.floor(rand() * 27)
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
      if (date > today) continue
      txns.push({
        id: `t${id++}`,
        date: date.toISOString().slice(0, 10),
        merchant,
        category,
        amount: range(min, max),
        card: pick(CARD_IDS),
      })
    }
  }
  return txns.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export const MOCK_TRANSACTIONS = generateTransactions()
