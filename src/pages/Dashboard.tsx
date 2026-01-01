import { useDateStore } from '../stores/dateStore';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import { SpendingLineChart } from '../components/dashboard/SpendingLineChart';
import { BudgetProgressList } from '../components/dashboard/BudgetProgressList';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { HealthScoreDial } from '../components/dashboard/HealthScoreDial';

export function Dashboard() {
    const { getMonthYearString } = useDateStore();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Overview for {getMonthYearString()}
                </p>
            </div>

            {/* Summary Cards */}
            <SummaryCards />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendingLineChart />
                <ExpensePieChart />
            </div>

            {/* Secondary Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BudgetProgressList />
                <RecentTransactions limit={5} />
            </div>

            {/* Full-width Health Score at the bottom */}
            <HealthScoreDial />
        </div>
    );
}
