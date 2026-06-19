export const CARDS = [
  {
    id: 'amex-gold',
    name: 'Amex Gold',
    shortName: 'Amex Gold',
    issuer: 'American Express',
    last4: '1003',
    color: '#c9a86a',
    // 4x restaurants, 4x US supermarkets, 3x flights booked direct/Amex Travel, 1x other
    rates: { Food: 4, Groceries: 4, Travel: 3, Gas: 1, Shopping: 1, Entertainment: 1, Utilities: 1, Other: 1 },
  },
  {
    id: 'robinhood-gold',
    name: 'Robinhood Gold Card',
    shortName: 'Robinhood',
    issuer: 'Robinhood',
    last4: '2299',
    color: '#00c805',
    // flat 3% cash back on everything, uncapped
    rates: { Food: 3, Travel: 3, Groceries: 3, Gas: 3, Shopping: 3, Entertainment: 3, Utilities: 3, Other: 3 },
  },
  {
    id: 'citi-costco',
    name: 'Citi Costco Anywhere Visa',
    shortName: 'Costco Citi',
    issuer: 'Citi',
    last4: '6630',
    color: '#1f7a8c',
    // 3x restaurants & travel, 4x gas anywhere (5x at Costco), 2x Costco warehouse/Costco.com, 1x everything else
    rates: { Food: 3, Travel: 3, Gas: 4, Groceries: 1, Shopping: 1, Entertainment: 1, Utilities: 1, Other: 1 },
    merchantRules: [
      { label: 'Gas at Costco', rate: 5, test: (t) => t.category === 'Gas' && /costco/i.test(t.merchant) },
      {
        label: 'Costco Warehouse / Costco.com',
        rate: 2,
        test: (t) => (t.category === 'Groceries' || t.category === 'Shopping') && /costco/i.test(t.merchant),
      },
    ],
  },
  {
    id: 'discover-it',
    name: 'Discover it',
    shortName: 'Discover it',
    issuer: 'Discover',
    last4: '5566',
    color: '#ff6000',
    // 5% rotating quarterly category (currently Shopping), 1x everything else
    rates: { Shopping: 5, Food: 1, Travel: 1, Groceries: 1, Gas: 1, Entertainment: 1, Utilities: 1, Other: 1 },
  },
  {
    id: 'apple-card',
    name: 'Apple Card',
    shortName: 'Apple Card',
    issuer: 'Apple / Goldman Sachs',
    last4: '4471',
    color: '#8e8e93',
    // 3% Apple Pay select partners (Uber/Lyft -> Travel), 2% Apple Pay everywhere else
    rates: { Travel: 3, Food: 2, Groceries: 2, Gas: 2, Shopping: 2, Entertainment: 2, Utilities: 2, Other: 2 },
  },
]

export const getCard = (id) => CARDS.find((c) => c.id === id)

// Effective rate for a specific transaction, accounting for merchant-specific
// bonuses (e.g. Citi Costco's gas-at-Costco and warehouse/online overrides)
// that a flat per-category rate can't express.
export const getEffectiveRate = (card, transaction) => {
  const rule = card.merchantRules?.find((r) => r.test(transaction))
  if (rule) return rule.rate
  return card.rates[transaction.category] ?? 0
}

export const bestCardForCategory = (category) =>
  CARDS.reduce((best, card) => (card.rates[category] > (best?.rates[category] ?? 0) ? card : best), null)

export const bestCardForTransaction = (transaction) =>
  CARDS.reduce((best, card) => {
    if (!best) return card
    return getEffectiveRate(card, transaction) > getEffectiveRate(best, transaction) ? card : best
  }, null)
