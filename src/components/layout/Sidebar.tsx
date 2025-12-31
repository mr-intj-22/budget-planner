import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    Calendar,
    CalendarRange,
    FolderOpen,
    PiggyBank,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    Wallet,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/monthly-budget', icon: Calendar, label: 'Monthly Budget' },
    { path: '/yearly-overview', icon: CalendarRange, label: 'Yearly Overview' },
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/categories', icon: FolderOpen, label: 'Categories' },
    { path: '/savings-goals', icon: PiggyBank, label: 'Savings Goals' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
    const { sidebarCollapsed, toggleSidebar } = useAppStore();

    return (
        <aside
            className={`
        fixed left-0 top-0 h-full z-30
        bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
      `}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-5 h-5 text-white" />
                    </div>
                    {!sidebarCollapsed && (
                        <span className="font-bold text-lg text-slate-900 dark:text-white">
                            Budget<span className="text-accent-500">Pro</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              sidebar-item
              ${isActive ? 'sidebar-item-active' : ''}
              ${sidebarCollapsed ? 'justify-center px-3' : ''}
            `}
                        title={sidebarCollapsed ? item.label : undefined}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse Button */}
            <button
                onClick={toggleSidebar}
                className="
          absolute -right-3 top-20
          w-6 h-6 rounded-full
          bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600
          flex items-center justify-center
          text-slate-500 hover:text-slate-700 dark:hover:text-slate-300
          shadow-sm hover:shadow-md
          transition-all duration-200
        "
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {sidebarCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                ) : (
                    <ChevronLeft className="w-4 h-4" />
                )}
            </button>

            {/* Footer */}
            {!sidebarCollapsed && (
                <div className="absolute bottom-4 left-0 right-0 px-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-accent-500/10 to-purple-500/10 dark:from-accent-500/20 dark:to-purple-500/20">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            100% Local Storage
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Your data never leaves your device
                        </p>
                    </div>
                </div>
            )}
        </aside>
    );
}
