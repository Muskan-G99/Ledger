// Bank accounts (checking/savings) are tracked separately from credit cards:
// they don't earn rewards, and their CSV/PDF exports use signed amounts
// (positive = deposit, negative = withdrawal) instead of charge-only amounts.
export const BANK_ACCOUNTS = [
  {
    id: 'chase-checking',
    name: 'Chase Total Checking',
    shortName: 'Chase',
    issuer: 'Chase',
    last4: '0000',
    color: '#117aca',
  },
]

export const getAccount = (id) => BANK_ACCOUNTS.find((a) => a.id === id)
