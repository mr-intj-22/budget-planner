import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { CreditCard } from '../db/schema';

export function useCreditCards() {
    const cards = useLiveQuery(() => db.creditCards.orderBy('name').toArray());

    return {
        creditCards: cards ?? [],
        isLoading: cards === undefined,
    };
}

export function useCreditCardOperations() {
    const addCard = async (cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date();
        return db.creditCards.add({
            ...cardData,
            createdAt: now,
            updatedAt: now,
        });
    };

    const updateCard = async (id: number, cardData: Partial<CreditCard>) => {
        return db.creditCards.update(id, {
            ...cardData,
            updatedAt: new Date(),
        });
    };

    const deleteCard = async (id: number) => {
        // Option to handle linked transactions: either un-link them or delete.
        // We will just un-link them by removing creditCardId from them.
        await db.transactions.where('creditCardId').equals(id).modify({ creditCardId: undefined });
        return db.creditCards.delete(id);
    };

    const settleCard = async (id: number, amount: number, paymentMethodId: number, date: Date) => {
        return db.transaction('rw', [db.creditCards, db.transactions, db.categories], async () => {
            const card = await db.creditCards.get(id);
            if (!card) throw new Error('Credit card not found');

            // Deduct from current usage and statement balance
            await db.creditCards.update(id, {
                currentUsage: Math.max(0, card.currentUsage - amount),
                statementBalance: Math.max(0, card.statementBalance - amount),
                updatedAt: new Date()
            });

            // Proportionally reduce child cards' usage
            if (card.currentUsage > 0) {
                const reductionRatio = amount / card.currentUsage;
                const childCards = await db.creditCards.where('parentCardId').equals(id).toArray();
                for (const child of childCards) {
                    const childReduction = child.currentUsage * reductionRatio;
                    await db.creditCards.update(child.id!, {
                        currentUsage: Math.max(0, child.currentUsage - childReduction),
                        updatedAt: new Date()
                    });
                }
            }

            // Find a category for the payment (fallback to first available)
            let category = await db.categories.where('name').equals('Debt Payback').first();
            if (!category) {
                category = await db.categories.toCollection().first();
            }

            // Log a global expense
            await db.transactions.add({
                categoryId: category?.id ?? 0,
                amount: amount,
                date: date,
                description: `Payment to ${card.name}`,
                type: 'expense',
                isRecurring: false,
                paymentMethodId: paymentMethodId > 0 ? paymentMethodId : undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });
    };

    return {
        addCard,
        updateCard,
        deleteCard,
        settleCard,
    };
}
