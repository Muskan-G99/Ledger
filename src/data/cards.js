export const CARDS = [
  {
    id: 'csp',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    last4: '4821',
    color: '#0f4c81',
    rates: { Food: 3, Travel: 3, Groceries: 1, Shopping: 1, Entertainment: 1, Utilities: 1, Other: 1 },
  },
  {
    id: 'amex-gold',
    name: 'Amex Gold',
    issuer: 'American Express',
    last4: '1003',
    color: '#c9a86a',
    rates: { Food: 4, Groceries: 4, Travel: 1, Shopping: 1, Entertainment: 1, Utilities: 1, Other: 1 },
  },
  {
    id: 'citi-cc',
    name: 'Citi Custom Cash',
    issuer: 'Citi',
    last4: '7740',
    color: '#1f7a8c',
    rates: { Groceries: 5, Food: 1, Travel: 1, Shopping: 1, Entertainment: 1, Utilities: 1, Other: 1 },
  },
  {
    id: 'discover-it',
    name: 'Discover it',
    issuer: 'Discover',
    last4: '5566',
    color: '#ff6000',
    rates: { Shopping: 5, Food: 1, Travel: 1, Groceries: 1, Entertainment: 1, Utilities: 1, Other: 1 },
  },
  {
    id: 'cap1-qs',
    name: 'Capital One Quicksilver',
    issuer: 'Capital One',
    last4: '9912',
    color: '#7a1f3d',
    rates: { Food: 1.5, Travel: 1.5, Groceries: 1.5, Shopping: 1.5, Entertainment: 1.5, Utilities: 1.5, Other: 1.5 },
  },
]

export const getCard = (id) => CARDS.find((c) => c.id === id)

export const bestCardForCategory = (category) =>
  CARDS.reduce((best, card) => (card.rates[category] > (best?.rates[category] ?? 0) ? card : best), null)
