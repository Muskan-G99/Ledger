import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import OverviewModule from './components/overview/OverviewModule'
import TransactionsModule from './components/transactions/TransactionsModule'
import RewardsModule from './components/rewards/RewardsModule'
import InvestmentsModule from './components/investments/InvestmentsModule'
import PaycheckModule from './components/paycheck/PaycheckModule'
import SpendingModule from './components/spending/SpendingModule'
import { MOCK_TRANSACTIONS } from './data/transactions'
import { MOCK_HOLDINGS } from './data/investments'

function App() {
  const [active, setActive] = useState('overview')
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS)
  const [holdings, setHoldings] = useState(MOCK_HOLDINGS)

  const handleImportTransactions = (rows) => setTransactions((prev) => [...rows, ...prev])
  const handleImportHoldings = (rows) => setHoldings((prev) => [...prev, ...rows])

  const renderModule = () => {
    switch (active) {
      case 'transactions':
        return <TransactionsModule transactions={transactions} onImport={handleImportTransactions} />
      case 'rewards':
        return <RewardsModule transactions={transactions} />
      case 'investments':
        return <InvestmentsModule holdings={holdings} onImport={handleImportHoldings} />
      case 'paycheck':
        return <PaycheckModule />
      case 'spending':
        return <SpendingModule transactions={transactions} />
      default:
        return <OverviewModule transactions={transactions} holdings={holdings} onNavigate={setActive} />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active={active} onSelect={setActive} />
      <div className="flex flex-1 flex-col">
        <TopBar active={active} />
        <main className="flex-1 overflow-y-auto p-6">{renderModule()}</main>
      </div>
    </div>
  )
}

export default App
