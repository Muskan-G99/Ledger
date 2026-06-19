export const CARDS = [
  {
    id: 'amex-gold',
    name: 'Amex Gold',
    shortName: 'Amex Gold',
    issuer: 'American Express',
    last4: '1003',
    color: '#c9a86a',
    // 4x restaurants, 4x US supermarkets, 3x flights booked direct/Amex Travel, 1x other
    rates: { Food: 4, Groceries: 4, Travel: 3, Shopping: 1, Entertainment: 1, Utilities: 1, Other: 1 },
  },
  {
    id: 'robinhood-gold',
    name: 'Robinhood Gold Card',
    shortName: 'Robinhood',
    issuer: 'Robinhood',
    last4: '2299',
    color: '#00c805',
    // flat 3% cash back on everything, uncapped
    rates: { Food: 3, Travel: 3, Groceries: 3, Shopping: 3, Entertainment: 3, Utilities: 3, Other: 3 },
  },
  {
    id: 'citi-costco',
    name: 'Citi Costco Anywhere Visa',
    shortName: 'Costco Citi',
    issuer: 'Citi',
    last4: '6630',
    color: '#1f7a8c',
    // 3x restaurants & travel, 2x Costco/Costco.com, 1x everything else
    rates: { Food: 3, Travel: 3, Groceries: 2, Shopping: 1, Entertainment: 1, Utilities: 1, Other: 1 },
  },
  {
    id: 'discover-it',
    name: 'Discover it',
    shortName: 'Discover it',
    issuer: 'Discover',
    last4: '5566',
    color: '#ff6000',
    // 5% rotating quarterly category (currently Shopping), 1x everything else
    rates: { Shopping: 5, Food: 1, Travel: 1, Groceries: 1, Entertainment: 1, Utilities: 1, Other: 1 },
  },
  {
    id: 'apple-card',
    name: 'Apple Card',
    shortName: 'Apple Card',
    issuer: 'Apple / Goldman Sachs',
    last4: '4471',
    color: '#8e8e93',
    // 3% Apple Pay select partners (Uber/Lyft -> Travel), 2% Apple Pay everywhere else
    rates: { Travel: 3, Food: 2, Groceries: 2, Shopping: 2, Entertainment: 2, Utilities: 2, Other: 2 },
  },
]

export const getCard = (id) => CARDS.find((c) => c.id === id)

export const bestCardForCategory = (category) =>
  CARDS.reduce((best, card) => (card.rates[category] > (best?.rates[category] ?? 0) ? card : best), null)
