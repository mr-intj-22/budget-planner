import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

/**
 * Hook to get all payment methods
 */
export function usePaymentMethods() {
    const paymentMethods = useLiveQuery(
        () => db.paymentMethods.orderBy('name').toArray(),
        []
    );

    return {
        paymentMethods: paymentMethods ?? [],
        isLoading: paymentMethods === undefined,
    };
}

/**
 * Hook for payment method CRUD operations
 */
export function usePaymentMethodOperations() {
    const addPaymentMethod = async (name: string) => {
        const now = new Date();
        return db.paymentMethods.add({
            name,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
        });
    };

    const deletePaymentMethod = async (id: number) => {
        const method = await db.paymentMethods.get(id);
        if (method?.isDefault) {
            throw new Error('Cannot delete default payment method');
        }

        // Check if used by transactions
        const count = await db.transactions.where('paymentMethodId').equals(id).count();
        if (count > 0) {
            throw new Error(`Cannot delete payment method used in ${count} transactions`);
        }

        return db.paymentMethods.delete(id);
    };

    return {
        addPaymentMethod,
        deletePaymentMethod,
    };
}
