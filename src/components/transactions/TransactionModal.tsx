import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Input';
import { useAppStore } from '../../stores/appStore';
import { useDateStore } from '../../stores/dateStore';
import { useCategories } from '../../hooks/useCategories';
import { useTransaction, useTransactionOperations } from '../../hooks/useTransactions';
import type { TransactionFormData, PaymentMethod, RecurringType } from '../../db/schema';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { formatDateForInput, parseDateInput } from '../../utils/dateUtils';

const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'debit', label: 'Debit Card' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'other', label: 'Other' },
];

const recurringTypes: { value: RecurringType; label: string }[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

const initialFormData: TransactionFormData = {
    amount: '',
    type: 'expense',
    categoryId: 0,
    date: formatDateForInput(new Date()),
    description: '',
    paymentMethod: 'debit',
    cardName: '',
    isRecurring: false,
    savingsGoalId: undefined,
};

export function TransactionModal() {
    const { isTransactionModalOpen, editingTransactionId, closeTransactionModal, showToast, transactionModalInitialData } = useAppStore();
    const { setSelectedDate } = useDateStore();
    const { categories } = useCategories();
    const { goals } = useSavingsGoals();
    const { transaction: editingTransaction } = useTransaction(editingTransactionId);
    const { addTransaction, updateTransaction } = useTransactionOperations();

    const [formData, setFormData] = useState<TransactionFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if payment method requires card name
    const isCardPayment = formData.paymentMethod === 'credit' || formData.paymentMethod === 'debit';
    const isIncome = formData.type === 'income';

    // Reset form when modal opens/closes or when editing different transaction
    useEffect(() => {
        if (isTransactionModalOpen) {
            if (editingTransaction) {
                setFormData({
                    amount: editingTransaction.amount.toString(),
                    type: editingTransaction.type,
                    categoryId: editingTransaction.categoryId,
                    date: formatDateForInput(new Date(editingTransaction.date)),
                    description: editingTransaction.description,
                    paymentMethod: editingTransaction.paymentMethod,
                    cardName: editingTransaction.cardName ?? '',
                    isRecurring: editingTransaction.isRecurring,
                    recurringType: editingTransaction.recurringType,
                    savingsGoalId: editingTransaction.savingsGoalId,
                });
            } else {
                // Set default for new transaction
                const defaultCategory = categories.find(c => c.name === 'Miscellaneous');
                setFormData({
                    ...initialFormData,
                    categoryId: defaultCategory?.id ?? categories[0]?.id ?? 0,
                    date: formatDateForInput(new Date()),
                    ...transactionModalInitialData // Merge initial data if present (e.g. from Savings Goal card)
                });
            }
            setErrors({});
        }
    }, [isTransactionModalOpen, editingTransaction, categories, transactionModalInitialData]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};

        const amount = parseFloat(formData.amount);
        if (!formData.amount || isNaN(amount) || amount <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Please select a category';
        }

        if (!formData.date) {
            newErrors.date = 'Please select a date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            // Ensure date is parsed correctly in local time
            const txDate = parseDateInput(formData.date);

            const transactionData = {
                amount: parseFloat(formData.amount),
                type: formData.type,
                categoryId: formData.categoryId,
                date: txDate,
                description: formData.description,
                paymentMethod: isIncome ? 'bank_transfer' as PaymentMethod : formData.paymentMethod,
                cardName: isCardPayment && !isIncome ? formData.cardName : undefined,
                isRecurring: formData.isRecurring,
                recurringType: formData.isRecurring ? formData.recurringType : undefined,
                savingsGoalId: formData.savingsGoalId,
            };

            if (editingTransactionId) {
                await updateTransaction(editingTransactionId, transactionData);
                showToast('Transaction updated successfully', 'success');
            } else {
                await addTransaction(transactionData);

                // Automatically switch view to the month of the added transaction
                // This ensures the user sees the transaction even if they were viewing a different month
                setSelectedDate(
                    transactionData.date.getFullYear(),
                    transactionData.date.getMonth()
                );

                showToast('Transaction added successfully', 'success');
            }

            closeTransactionModal();
        } catch (error) {
            console.error('Failed to save transaction:', error);
            showToast('Failed to save transaction', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categoryOptions = categories.map((c) => ({
        value: c.id?.toString() ?? '',
        label: c.name,
    }));

    return (
        <Modal
            isOpen={isTransactionModalOpen}
            onClose={closeTransactionModal}
            title={editingTransactionId ? 'Edit Transaction' : 'Add Transaction'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Toggle */}
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className={`
                            flex-1 py-2 px-4 rounded-lg font-medium transition-all
                            ${formData.type === 'expense'
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }
                        `}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className={`
                            flex-1 py-2 px-4 rounded-lg font-medium transition-all
                            ${formData.type === 'income'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }
                        `}
                    >
                        Income
                    </button>
                </div>

                {/* Amount */}
                <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    error={errors.amount}
                    autoFocus
                />

                {/* Category - Required for both types now */}
                <Select
                    label="Category"
                    options={categoryOptions}
                    value={formData.categoryId.toString()}
                    onChange={(value) => {
                        const categoryId = parseInt(value);
                        setFormData({
                            ...formData,
                            categoryId,
                            // Reset savings goal if changing away from Savings category
                            savingsGoalId: undefined
                        });
                    }}
                    placeholder="Select category"
                    error={errors.categoryId}
                />

                {/* Savings Goal Selection - Only if category is named "Savings" */}
                {categories.find(c => c.id === formData.categoryId)?.name === 'Savings' && (
                    <Select
                        label="Savings Goal (Optional)"
                        options={[
                            { value: '', label: 'General Savings' },
                            ...goals.map(g => ({ value: g.id?.toString() ?? '', label: g.name }))
                        ]}
                        value={formData.savingsGoalId?.toString() ?? ''}
                        onChange={(value) => setFormData({
                            ...formData,
                            savingsGoalId: value ? parseInt(value) : undefined
                        })}
                        placeholder="Select a goal"
                    />
                )}

                {/* Date */}
                <Input
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    error={errors.date}
                />

                {/* Description */}
                <Input
                    label="Description"
                    placeholder={isIncome ? "Income source (e.g., Salary, Freelance)" : "What was this for?"}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                {/* Payment Method - Only for expenses */}
                {!isIncome && (
                    <Select
                        label="Payment Method"
                        options={paymentMethods}
                        value={formData.paymentMethod}
                        onChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                    />
                )}

                {/* Card Name - Only when using card */}
                {!isIncome && isCardPayment && (
                    <Input
                        label="Card Name"
                        placeholder="e.g., Chase Freedom, Amex Gold"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        helperText="Identify which card you used"
                    />
                )}

                {/* Recurring Toggle */}
                <div className="space-y-3">
                    <Toggle
                        checked={formData.isRecurring}
                        onChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                        label="Recurring transaction"
                    />

                    {formData.isRecurring && (
                        <Select
                            options={recurringTypes}
                            value={formData.recurringType ?? 'monthly'}
                            onChange={(value) => setFormData({ ...formData, recurringType: value as RecurringType })}
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={closeTransactionModal}
                        fullWidth
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        fullWidth
                    >
                        {editingTransactionId ? 'Update' : 'Add'} Transaction
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
