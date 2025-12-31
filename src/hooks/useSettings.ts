/**
 * React hooks for settings data access
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { AppSettings } from '../db/schema';

/**
 * Hook to get and update app settings
 */
export function useSettings() {
    const settings = useLiveQuery(
        () => db.appSettings.toCollection().first(),
        []
    );

    const updateSettings = async (updates: Partial<AppSettings>) => {
        const current = await db.appSettings.toCollection().first();
        if (current?.id) {
            await db.appSettings.update(current.id, {
                ...updates,
                updatedAt: new Date(),
            });
        }
    };

    return {
        settings,
        updateSettings,
        isLoading: settings === undefined,
    };
}
