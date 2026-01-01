import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '../ui/EmptyState';
import { triggerAutoBackup } from '../../utils/exportImport';
import { useAppStore } from '../../stores/appStore';
import { useSettings } from '../../hooks/useSettings';
import { TransactionModal } from '../transactions/TransactionModal';
import { CategoryModal } from '../categories/CategoryModal';
import { SavingsGoalModal } from '../savings/SavingsGoalModal';
import { DeleteConfirmDialog } from '../common/DeleteConfirmDialog';

export function Layout() {
    const { sidebarCollapsed, toast, hideToast, theme } = useAppStore();
    const { settings } = useSettings();

    // Trigger auto-backup on app start
    useEffect(() => {
        triggerAutoBackup();
    }, []);

    // Apply theme on mount and changes
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            // System preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [theme]);

    // Apply accessibility settings
    useEffect(() => {
        const root = document.documentElement;

        if (settings?.largeTextMode) {
            root.classList.add('large-text');
        } else {
            root.classList.remove('large-text');
        }

        if (settings?.highContrastMode) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }
    }, [settings?.largeTextMode, settings?.highContrastMode]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />

            <div
                className={`
          transition-all duration-300
          ${sidebarCollapsed ? 'ml-20' : 'ml-64'}
        `}
            >
                <Header />

                <main className="p-6 min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>

            {/* Global Modals */}
            <TransactionModal />
            <CategoryModal />
            <SavingsGoalModal />
            <DeleteConfirmDialog />

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    );
}
