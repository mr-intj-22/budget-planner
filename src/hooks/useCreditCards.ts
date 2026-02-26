import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { CreditCard } from '../db/schema';

export interface CreditCardWithUsage extends CreditCard {
    currentUsage: number;
}

export function useCreditCards() {
    const cards = useLiveQuery(() => db.creditCards.orderBy('name').toArray());

    const cardsWithUsage = useLiveQuery(async () => {
        if (!cards) return undefined;

        const enhancedCards: CreditCardWithUsage[] = [];

        for (const card of cards) {
            // Calculate usage based on expenses linked to this credit card.
            // A more complex implementation would calculate this based on billing cycles
            // and include payments made. For now, we sum up all time expenses.
            // Or we just sum up this month's expenses? The prompt asks for "track limit, current usage, pay time".
            // Let's compute overall lifetime usage (expenses - payments) by looking at transactions.
            // Expenses increase usage, Income (like cashback/refund) or Transfer (payment) decreases it.
            const transactions = await db.transactions
                .where('creditCardId')
                .equals(card.id!)
                .toArray();

            let usage = 0;
            for (const tx of transactions) {
                if (tx.type === 'expense') {
                    usage += tx.amount;
                } else if (tx.type === 'income') {
                    usage -= tx.amount;
                }
                // If we treat savings as transfers: if a transfer is made paying the card, we could handle it here.
                // But normally users might just add an 'income' to the card or 'expense' to the checking account 
                // We'll keep it simple for now and rely on expenses and incomes linked to the card.
            }

            enhancedCards.push({
                ...card,
                currentUsage: usage > 0 ? usage : 0 // Ensure usage doesn't go below 0 visually
            });
        }

        return enhancedCards;
    }, [cards]);

    return {
        creditCards: cardsWithUsage ?? [],
        isLoading: cardsWithUsage === undefined,
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

    return {
        addCard,
        updateCard,
        deleteCard,
    };
}
