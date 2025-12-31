/**
 * React hooks for transaction data access
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Transaction } from '../db/schema';
import { useDateStore } from '../stores/dateStore';

/**
 * Hook to get transactions for the selected month
 */
export function useMonthlyTransactions() {
    const { selectedYear, selectedMonth } = useDateStore();

    const transactions = useLiveQuery(
        async () => {
            const start = new Date(selectedYear, selectedMonth, 1);
            const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

            return db.transactions
                .where('date')
                .between(start, end, true, true)
                .reverse()
                .sortBy('date');
        },
        [selectedYear, selectedMonth]
    );

    return {
        transactions: transactions ?? [],
        isLoading: transactions === undefined,
    };
}

/**
 * Hook to get all transactions (for reports)
 */
export function useAllTransactions() {
    const transactions = useLiveQuery(
        () => db.transactions.orderBy('date').reverse().toArray(),
        []
    );

    return {
        transactions: transactions ?? [],
        isLoading: transactions === undefined,
    };
}

/**
 * Hook to get a single transaction by ID
 */
export function useTransaction(id: number | null) {
    const transaction = useLiveQuery(
        () => (id ? db.transactions.get(id) : undefined),
        [id]
    );

    return {
        transaction,
        isLoading: id !== null && transaction === undefined,
    };
}

/**
 * Hook to get monthly totals for the selected month
 */
export function useMonthlyTotals() {
    const { selectedYear, selectedMonth } = useDateStore();

    const totals = useLiveQuery(
        async () => {
            const { income, expenses } = await db.getMonthlyTotals(selectedYear, selectedMonth);
            return {
                income,
                expenses,
                net: income - expenses,
            };
        },
        [selectedYear, selectedMonth]
    );

    return {
        income: totals?.income ?? 0,
        expenses: totals?.expenses ?? 0,
        net: totals?.net ?? 0,
        isLoading: totals === undefined,
    };
}

/**
 * Hook to get spending by category for the selected month
 */
export function useCategorySpending() {
    const { selectedYear, selectedMonth } = useDateStore();

    const spending = useLiveQuery(
        () => db.getCategorySpendingForMonth(selectedYear, selectedMonth),
        [selectedYear, selectedMonth]
    );

    return {
        spending: spending ?? new Map<number, number>(),
        isLoading: spending === undefined,
    };
}

/**
 * Hook for transaction CRUD operations
 */
export function useTransactionOperations() {
    const addTransaction = async (
        transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
        const now = new Date();
        return db.transactions.add({
            ...transaction,
            createdAt: now,
            updatedAt: now,
        });
    };

    const updateTransaction = async (id: number, updates: Partial<Transaction>) => {
        return db.transactions.update(id, {
            ...updates,
            updatedAt: new Date(),
        });
    };

    const deleteTransaction = async (id: number) => {
        return db.transactions.delete(id);
    };

    const duplicateTransaction = async (id: number) => {
        const original = await db.transactions.get(id);
        if (!original) throw new Error('Transaction not found');

        const now = new Date();
        const { id: _id, ...rest } = original;
        return db.transactions.add({
            ...rest,
            date: now,
            createdAt: now,
            updatedAt: now,
        });
    };

    return {
        addTransaction,
        updateTransaction,
        deleteTransaction,
        duplicateTransaction,
    };
}

/**
 * Hook to get recent transactions (for dashboard)
 */
export function useRecentTransactions(limit: number = 5) {
    const transactions = useLiveQuery(
        () => db.transactions.orderBy('date').reverse().limit(limit).toArray(),
        [limit]
    );

    return {
        transactions: transactions ?? [],
        isLoading: transactions === undefined,
    };
}
