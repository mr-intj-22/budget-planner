import { Edit2, Copy, Trash2 } from 'lucide-react';
import type { Transaction, Category } from '../../db/schema';
import { CategoryBadge, TypeBadge } from '../ui/Badge';
import { IconButton } from '../ui/Button';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currency';
import { useSettings } from '../../hooks/useSettings';
import { useAppStore } from '../../stores/appStore';
import { useTransactionOperations } from '../../hooks/useTransactions';

interface TransactionRowProps {
    transaction: Transaction;
    category?: Category;
}

export function TransactionRow({ transaction, category }: TransactionRowProps) {
    const { settings } = useSettings();
    const { openTransactionModal, openDeleteConfirmation, showToast } = useAppStore();
    const { duplicateTransaction } = useTransactionOperations();

    const handleDuplicate = async () => {
        try {
            await duplicateTransaction(transaction.id!);
            showToast('Transaction duplicated', 'success');
        } catch (error) {
            showToast('Failed to duplicate', 'error');
        }
    };

    const handleEdit = () => {
        openTransactionModal(transaction.id);
    };

    const handleDelete = () => {
        openDeleteConfirmation(
            'transaction',
            transaction.id!,
            transaction.description || `${formatCurrency(transaction.amount, settings)} transaction`
        );
    };

    return (
        <div className="group flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
            {/* Category Icon/Color */}
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                    backgroundColor: transaction.type === 'income'
                        ? '#10b98120'
                        : `${category?.color ?? '#6b7280'}20`
                }}
            >
                <div
                    className="w-3 h-3 rounded-full"
                    style={{
                        backgroundColor: transaction.type === 'income'
                            ? '#10b981'
                            : category?.color ?? '#6b7280'
                    }}
                />
            </div>

            {/* Description & Category */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">
                    {transaction.description || 'No description'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    {transaction.type === 'income' ? (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Income
                        </span>
                    ) : (
                        category && <CategoryBadge category={category} showIcon={false} />
                    )}
                    <span className="text-xs text-slate-400">
                        {formatDate(new Date(transaction.date))}
                    </span>
                </div>
            </div>

            {/* Type Badge (Mobile) */}
            <div className="hidden sm:block">
                <TypeBadge type={transaction.type} />
            </div>

            {/* Amount */}
            <div className="text-right">
                <p className={`font-semibold ${transaction.type === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, settings)}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                    {transaction.type === 'income'
                        ? 'Income'
                        : transaction.cardName
                            ? transaction.cardName
                            : transaction.paymentMethod.replace('_', ' ')}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton
                    icon={Edit2}
                    size="sm"
                    onClick={handleEdit}
                    aria-label="Edit transaction"
                />
                <IconButton
                    icon={Copy}
                    size="sm"
                    onClick={handleDuplicate}
                    aria-label="Duplicate transaction"
                />
                <IconButton
                    icon={Trash2}
                    size="sm"
                    onClick={handleDelete}
                    aria-label="Delete transaction"
                    className="hover:text-red-500"
                />
            </div>
        </div>
    );
}
