import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '../ui/EmptyState';
import { useAppStore } from '../../stores/appStore';
import { TransactionModal } from '../transactions/TransactionModal';
import { CategoryModal } from '../categories/CategoryModal';
import { SavingsGoalModal } from '../savings/SavingsGoalModal';
import { DeleteConfirmDialog } from '../common/DeleteConfirmDialog';

export function Layout() {
    const { sidebarCollapsed, toast, hideToast, theme } = useAppStore();

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
