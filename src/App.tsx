import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Categories } from './pages/Categories';
import { MonthlyBudget } from './pages/MonthlyBudget';
import { YearlyOverview } from './pages/YearlyOverview';
import { SavingsGoals } from './pages/SavingsGoals';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Debts } from './pages/Debts';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="monthly-budget" element={<MonthlyBudget />} />
                    <Route path="yearly-overview" element={<YearlyOverview />} />
                    <Route path="savings-goals" element={<SavingsGoals />} />
                    <Route path="debts" element={<Debts />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
