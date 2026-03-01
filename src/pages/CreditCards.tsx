import { useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Calendar, DollarSign, X } from 'lucide-react';
import { useCreditCards, useCreditCardOperations } from '../hooks/useCreditCards';
import { CreditCardForm } from '../components/credit-cards/CreditCardForm';
import { useSettings } from '../hooks/useSettings';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { formatCurrency } from '../utils/currency';
import type { CreditCard } from '../db/schema';
import * as Icons from 'lucide-react';

export function CreditCards() {
    const { creditCards, isLoading } = useCreditCards();
    const { addCard, updateCard, deleteCard, settleCard } = useCreditCardOperations();
    const { settings } = useSettings();
    const { paymentMethods } = usePaymentMethods();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CreditCard | undefined>();
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const [settleCardId, setSettleCardId] = useState<number | null>(null);
    const [settleAmount, setSettleAmount] = useState<string>('');
    const [settlePaymentMethodId, setSettlePaymentMethodId] = useState<number | undefined>(undefined);
    const [settleDate, setSettleDate] = useState<string>(new Date().toISOString().split('T')[0] || '');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const handleAddClick = () => {
        setEditingCard(undefined);
        setIsFormOpen(true);
    };

    const handleEditClick = (card: CreditCard) => {
        setEditingCard(card);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingCard?.id) {
            await updateCard(editingCard.id, data);
        } else {
            await addCard(data);
        }
        setIsFormOpen(false);
    };

    const toggleStatus = async (card: CreditCard) => {
        if (card.id) {
            await updateCard(card.id, { isActive: !card.isActive });
        }
    };

    const handleSettleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settleCardId || !settlePaymentMethodId) return;
        await settleCard(settleCardId, Number(settleAmount), settlePaymentMethodId, new Date(settleDate));
        setSettleCardId(null);
        setSettleAmount('');
    };

    const IconComponent = ({ name, className }: { name: string; className?: string }) => {
        const Icon = (Icons as any)[name] || Icons.CreditCard;
        return <Icon className={className} />;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Credit Cards</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track limits and balances across your cards</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow"
                >
                    <Plus className="w-5 h-5" />
                    Add Credit Card
                </button>
            </div>

            {creditCards.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icons.CreditCard className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No credit cards added</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                        Add your credit cards to track their usage, limits, and easily assign expenses.
                    </p>
                    <button
                        onClick={handleAddClick}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Add Your First Card
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creditCards.map(card => {
                        const usagePercentage = card.limit > 0 ? Math.min((card.currentUsage / card.limit) * 100, 100) : 0;
                        const isNearingLimit = usagePercentage >= 80;

                        return (
                            <div
                                key={card.id}
                                className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-800 ${!card.isActive ? 'opacity-60 grayscale' : ''
                                    } ${deleteConfirmId === card.id ? 'border-red-500 shadow-sm' : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'}`}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                                                style={{ backgroundColor: card.color }}
                                            >
                                                <IconComponent name={card.icon} className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                                    {card.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    {card.network}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 relative">
                                            <button
                                                onClick={() => handleEditClick(card)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                title="Edit card"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(card.id!)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete card"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            {/* Delete Confirmation Popup */}
                                            {deleteConfirmId === card.id && (
                                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-red-100 dark:border-red-900 p-4 z-10 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full shrink-0">
                                                            <AlertCircle className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold border-red-600 dark:text-red-400 text-sm mb-1">Delete Card?</h4>
                                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                                Linked transactions will lose their card assignment. This cannot be undone.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                await deleteCard(card.id!);
                                                                setDeleteConfirmId(null);
                                                            }}
                                                            className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Balance</span>
                                                <span className={`text-xl font-bold ${isNearingLimit ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                                    {formatCurrency(card.currentUsage, settings)}
                                                </span>
                                            </div>
                                            {(card.statementBalance > 0) && (
                                                <div className="flex justify-between items-start text-xs text-amber-600 dark:text-amber-500 mb-1">
                                                    <span>Statement Balance</span>
                                                    <span>{formatCurrency(card.statementBalance, settings)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                <span>Limit {formatCurrency(card.limit, settings)}</span>
                                                <span>{card.limit > 0 ? `${usagePercentage.toFixed(1)}%` : ''}</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                                <div
                                                    className={`transition-all duration-500 h-full rounded-r-full ${isNearingLimit ? 'bg-red-500' : 'bg-indigo-500'
                                                        }`}
                                                    style={{ width: `${usagePercentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                            {card.parentCardId ? (
                                                <div className="col-span-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Icons.Link className="w-4 h-4" />
                                                    <span>Linked to: {creditCards.find(c => c.id === card.parentCardId)?.name || 'Unknown'}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Statement: {card.statementDate}th</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span>Due: {card.dueDate}th</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick action toggle */}
                                    <div className="mt-4 flex justify-between items-center text-xs">
                                        <button
                                            onClick={() => toggleStatus(card)}
                                            className={`font-medium ${card.isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                            {card.isActive ? 'Mark as Inactive' : 'Mark as Active'}
                                        </button>
                                        {!card.parentCardId && (
                                            <button
                                                onClick={() => {
                                                    setSettleCardId(card.id!);
                                                    setSettleAmount(card.statementBalance > 0 ? String(card.statementBalance) : String(card.currentUsage));
                                                    if (paymentMethods.length > 0 && !settlePaymentMethodId) {
                                                        setSettlePaymentMethodId(paymentMethods[0]?.id);
                                                    }
                                                }}
                                                className="font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                                            >
                                                <DollarSign className="w-3 h-3" />
                                                Settle Balance
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isFormOpen && (
                <CreditCardForm
                    initialData={editingCard}
                    onSubmit={handleFormSubmit}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingCard(undefined);
                    }}
                />
            )}

            {settleCardId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-500" />
                                Settle Credit Card
                            </h2>
                            <button
                                onClick={() => setSettleCardId(null)}
                                className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSettleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Payment Method
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={settlePaymentMethodId || ''}
                                    onChange={(e) => setSettlePaymentMethodId(Number(e.target.value))}
                                >
                                    <option value="" disabled>Select payment method</option>
                                    {paymentMethods.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                        <DollarSign className="w-4 h-4 text-slate-400" />
                                        Amount to Pay
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        value={settleAmount}
                                        onChange={(e) => setSettleAmount(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={settleDate}
                                        onChange={(e) => setSettleDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setSettleCardId(null)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                                >
                                    Settle Amount
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
