import React, { useState } from 'react';
import { CreditCard as CreditCardIcon, Calendar, DollarSign, X } from 'lucide-react';
import type { CreditCard } from '../../db/schema';

interface CreditCardFormProps {
    initialData?: CreditCard;
    onSubmit: (data: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onClose: () => void;
}

const NETWORKS = ['Visa', 'Mastercard', 'Amex', 'Discover', 'Other'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function CreditCardForm({ initialData, onSubmit, onClose }: CreditCardFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [network, setNetwork] = useState(initialData?.network || 'Visa');
    const [limit, setLimit] = useState(initialData?.limit ? String(initialData.limit) : '');
    const [statementDate, setStatementDate] = useState(initialData?.statementDate ? String(initialData.statementDate) : '1');
    const [dueDate, setDueDate] = useState(initialData?.dueDate ? String(initialData.dueDate) : '15');
    const [color, setColor] = useState<string>(initialData?.color ?? '#6366f1');
    const [icon] = useState<string>(initialData?.icon ?? 'CreditCard');
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({
                name,
                network,
                limit: Number(limit) || 0,
                statementDate: Number(statementDate) || 1,
                dueDate: Number(dueDate) || 15,
                color,
                icon,
                isActive,
            });
            onClose();
        } catch (error) {
            console.error('Failed to save credit card:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <CreditCardIcon className="w-5 h-5 text-indigo-500" />
                        {initialData ? 'Edit Credit Card' : 'Add Credit Card'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Card Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Sapphire Preferred"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Network
                            </label>
                            <select
                                value={network}
                                onChange={(e) => setNetwork(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {NETWORKS.map(net => (
                                    <option key={net} value={net}>{net}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-slate-400" />
                                Limit
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="100"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="5000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1" title="Day of the month the statement closes">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                Statement Date
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="31"
                                value={statementDate}
                                onChange={(e) => setStatementDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1" title="Day of the month the payment is due">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                Due Date
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="31"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Card Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-800' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                        />
                        <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                            Card is active and usable
                        </label>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? 'Saving...' : initialData ? 'Update Card' : 'Save Card'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
