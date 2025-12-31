/**
 * React hooks for debt data access and operations
 */

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Debt } from '../db/schema';
import { useSettings } from './useSettings';
import { fetchExchangeRates } from '../utils/exchangeRates';

/**
 * Hook to get all debts
 */
export function useDebts() {
    const debts = useLiveQuery(() => db.debts.toArray(), []);
    const { settings } = useSettings();
    const [rates, setRates] = useState<Record<string, number>>({});
    const [isRatesLoading, setIsRatesLoading] = useState(false);

    useEffect(() => {
        const loadRates = async () => {
            if (!settings?.currency) return;

            setIsRatesLoading(true);
            const data = await fetchExchangeRates(settings.currency);
            if (data) {
                setRates(data.rates);
            }
            setIsRatesLoading(false);
        };

        loadRates();
    }, [settings?.currency]);

    const totalInLocalCurrency = (debts ?? []).reduce((sum, debt) => {
        if (debt.isPaid) return sum;

        const rate = rates[debt.originalCurrency];
        const remainingAmount = debt.originalAmount - (debt.paidAmount || 0);
        const localAmount = rate ? remainingAmount / rate : remainingAmount;
        return sum + localAmount;
    }, 0);

    return {
        debts,
        rates,
        totalInLocalCurrency,
        isLoading: debts === undefined || isRatesLoading,
    };
}

/**
 * Hook for debt operations
 */
export function useDebtOperations() {
    const addDebt = async (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date();
        return await db.debts.add({
            ...debt,
            createdAt: now,
            updatedAt: now,
        });
    };

    const updateDebt = async (id: number, updates: Partial<Debt>) => {
        return await db.debts.update(id, {
            ...updates,
            updatedAt: new Date(),
        });
    };

    const deleteDebt = async (id: number) => {
        return await db.debts.delete(id);
    };

    const togglePaid = async (id: number, currentStatus: boolean) => {
        return await updateDebt(id, { isPaid: !currentStatus });
    };

    const recordPayment = async (
        id: number,
        currentPaid: number,
        debtAmount: number,
        localAmount: number,
        totalAmount: number,
        description: string = ''
    ) => {
        const newPaid = currentPaid + debtAmount;
        const updates: Partial<Debt> = {
            paidAmount: newPaid,
            isPaid: newPaid >= totalAmount
        };

        return db.transaction('rw', [db.debts, db.transactions, db.categories], async () => {
            // 1. Update Debt status
            await db.debts.update(id, {
                ...updates,
                updatedAt: new Date(),
            });

            // 2. Find Debt Payback category
            const paybackCategory = await db.categories.where('name').equals('Debt Payback').first();

            // 3. Create associated transaction
            const debt = await db.debts.get(id);
            await db.transactions.add({
                amount: localAmount,
                type: 'expense',
                categoryId: paybackCategory?.id,
                date: new Date(),
                description: description || `Repayment: ${debt?.name || 'Debt'}`,
                paymentMethod: 'bank_transfer',
                isRecurring: false,
                debtId: id,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        });
    };

    return {
        addDebt,
        updateDebt,
        deleteDebt,
        togglePaid,
        recordPayment,
    };
}
