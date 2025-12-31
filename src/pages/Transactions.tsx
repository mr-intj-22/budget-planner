import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TransactionList } from '../components/transactions/TransactionList';
import { useDateStore } from '../stores/dateStore';
import { useAppStore } from '../stores/appStore';
import { useMonthlyTotals } from '../hooks/useTransactions';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency } from '../utils/currency';

export function Transactions() {
    const { getMonthYearString } = useDateStore();
    const { openTransactionModal } = useAppStore();
    const { income, expenses, net } = useMonthlyTotals();
    const { settings } = useSettings();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Transactions
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {getMonthYearString()}
                    </p>
                </div>
                <Button icon={Plus} onClick={() => openTransactionModal()}>
                    Add Transaction
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="card p-4 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Income</p>
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(income, settings)}
                    </p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Expenses</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(expenses, settings)}
                    </p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Net</p>
                    <p className={`text-lg font-semibold ${net >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}>
                        {formatCurrency(net, settings)}
                    </p>
                </div>
            </div>

            {/* Transaction List */}
            <TransactionList />
        </div>
    );
}
