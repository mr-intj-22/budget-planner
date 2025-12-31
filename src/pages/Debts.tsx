import { useState } from 'react';
import { Plus, Calendar, CheckCircle2, Trash2, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { IconButton } from '../components/ui/Button';
import { useDebts, useDebtOperations } from '../hooks/useDebts';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dateUtils';
import { useAppStore } from '../stores/appStore';
import { DebtModal } from '../components/debts/DebtModal';
import { DebtPaymentModal } from '../components/debts/DebtPaymentModal';
import { ProgressBar } from '../components/ui/ProgressBar';

export function Debts() {
    const { debts, totalInLocalCurrency, rates, isLoading } = useDebts();
    const { togglePaid } = useDebtOperations();
    const { settings } = useSettings();
    const { openDeleteConfirmation } = useAppStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [paymentDebt, setPaymentDebt] = useState<any | null>(null);

    const activeDebts = debts?.filter(d => !d.isPaid) ?? [];
    const paidDebts = debts?.filter(d => d.isPaid) ?? [];

    const handleEdit = (id: number) => {
        setEditingId(id);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleRecordPayment = (debt: any) => {
        setPaymentDebt(debt);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card h-48 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Debt Tracker
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage your loans and liabilities
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Active Debt</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(totalInLocalCurrency, settings)}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-red-500" />
                    </div>
                </div>
            </div>

            {/* Active Debts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDebts.map(debt => {
                    const rate = rates[debt.originalCurrency];
                    const localAmount = rate ? debt.originalAmount / rate : debt.originalAmount;

                    return (
                        <Card key={debt.id} className="relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{debt.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{debt.description}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleRecordPayment(debt)}
                                        className="text-[10px] bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400 px-2 py-1 rounded hover:bg-accent-100 transition-colors mr-1"
                                    >
                                        Pay
                                    </button>
                                    <IconButton
                                        icon={CheckCircle2}
                                        size="sm"
                                        onClick={() => togglePaid(debt.id!, false)}
                                        className="text-slate-400 hover:text-emerald-500"
                                        title="Mark as paid"
                                        aria-label="Mark as paid"
                                    />
                                    <IconButton
                                        icon={Trash2}
                                        size="sm"
                                        onClick={() => openDeleteConfirmation('debt', debt.id!, debt.name)}
                                        className="text-slate-400 hover:text-red-500"
                                        title="Delete"
                                        aria-label="Delete debt"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] uppercase text-slate-500 font-medium">Repayment Progress</span>
                                        <span className="text-[10px] text-slate-400">
                                            {Math.round(((debt.paidAmount || 0) / debt.originalAmount) * 100)}%
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={debt.paidAmount || 0}
                                        max={debt.originalAmount}
                                        color="#10b981"
                                        size="sm"
                                    />
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Paid / Total</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {new Intl.NumberFormat(undefined, { style: 'currency', currency: debt.originalCurrency }).format(debt.paidAmount || 0)}
                                                <span className="text-slate-400 font-normal"> / {new Intl.NumberFormat(undefined, { style: 'currency', currency: debt.originalCurrency }).format(debt.originalAmount)}</span>
                                            </p>
                                            <button
                                                onClick={() => handleEdit(debt.id!)}
                                                className="text-[10px] text-accent-500 hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Remaining (Local)</p>
                                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                            {formatCurrency(localAmount, settings)}
                                        </p>
                                    </div>
                                </div>

                                {debt.dueDate && (
                                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                                        <Calendar className="w-4 h-4" />
                                        <span>Due: {formatDate(new Date(debt.dueDate))}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}

                {/* Add Debt Card */}
                <button
                    onClick={handleAdd}
                    className="h-full min-h-[180px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-accent-500 hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/10 transition-all group"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-accent-100 dark:group-hover:bg-accent-900/30 transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-medium">Add New Debt</span>
                </button>
            </div>

            {/* Paid Debts */}
            {paidDebts.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Paid Liabilities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                        {paidDebts.map(debt => (
                            <Card key={debt.id} className="bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-700 dark:text-slate-300 line-through">{debt.name}</h3>
                                            <p className="text-xs text-slate-500">Paid on {formatDate(new Date(debt.updatedAt))}</p>
                                        </div>
                                    </div>
                                    <IconButton
                                        icon={Trash2}
                                        size="sm"
                                        onClick={() => openDeleteConfirmation('debt', debt.id!, debt.name)}
                                        className="text-slate-400 hover:text-red-500"
                                        aria-label="Delete debt"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <DebtModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                debtId={editingId}
            />

            <DebtPaymentModal
                isOpen={!!paymentDebt}
                onClose={() => setPaymentDebt(null)}
                debt={paymentDebt}
                rates={rates}
                localCurrency={settings?.currency || 'USD'}
            />
        </div>
    );
}
