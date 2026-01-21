import React, { useRef, useState } from 'react';
import {
    Moon,
    Sun,
    Monitor,
    Upload,
    Download,
    Trash2,
    AlertTriangle,
    FolderOpen,
    CreditCard,
    Plus,
} from 'lucide-react';
import { db } from '../db/database';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Toggle } from '../components/ui/Input';
import { useSettings } from '../hooks/useSettings';
import { useAppStore } from '../stores/appStore';
import { usePaymentMethods, usePaymentMethodOperations } from '../hooks/usePaymentMethods';
import { availableCurrencies } from '../db/seeds';
import { Input } from '../components/ui/Input';
import { downloadBackup, importBackup } from '../utils/exportImport';

export function Settings() {
    const { settings, updateSettings } = useSettings();
    const { theme, setTheme, openDeleteConfirmation, showToast } = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [newPaymentMethodName, setNewPaymentMethodName] = useState('');
    const { paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();
    const { addPaymentMethod, deletePaymentMethod } = usePaymentMethodOperations();

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);

        const root = document.documentElement;
        if (newTheme === 'dark') {
            root.classList.add('dark');
        } else if (newTheme === 'light') {
            root.classList.remove('dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }

        updateSettings({ theme: newTheme });
    };

    const handleCurrencyChange = (currencyCode: string) => {
        const currency = availableCurrencies.find(c => c.code === currencyCode);
        if (currency) {
            updateSettings({
                currency: currency.code,
                currencySymbol: currency.symbol,
                currencyLocale: currency.locale,
            });
            showToast('Currency updated', 'success');
        }
    };

    const handleExportBackup = async () => {
        setIsExporting(true);
        try {
            await downloadBackup();
            showToast('Backup exported successfully', 'success');
        } catch (error) {
            showToast('Failed to export backup', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const result = await importBackup(file);
            if (result.success) {
                showToast(result.message, 'success');
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Failed to import backup', 'error');
        } finally {
            setIsImporting(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleResetData = () => {
        openDeleteConfirmation('all-data', null, 'all data');
    };

    const handleSelectFolder = async () => {
        try {
            if ('showDirectoryPicker' in window) {
                const handle = await (window as any).showDirectoryPicker({
                    mode: 'readwrite'
                });

                // Store handle in extraState
                await db.extraState.put({ key: 'backupFolderHandle', value: handle });

                // Update setting path for display
                updateSettings({ autoBackupPath: handle.name });
                showToast(`Backup folder set to: ${handle.name}`, 'success');
            } else {
                showToast('Your browser does not support folder selection. Auto-backup will use standard downloads.', 'info');
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Folder selection failed:', error);
                showToast('Failed to select folder', 'error');
            }
        }
    };

    const handleAddPaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPaymentMethodName.trim()) return;

        try {
            await addPaymentMethod(newPaymentMethodName.trim());
            setNewPaymentMethodName('');
            showToast('Payment method added', 'success');
        } catch (error) {
            showToast('Failed to add payment method', 'error');
        }
    };

    const handleDeletePaymentMethod = async (id: number) => {
        try {
            await deletePaymentMethod(id);
            showToast('Payment method deleted', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to delete payment method', 'error');
        }
    };

    const currencyOptions = availableCurrencies.map(c => ({
        value: c.code,
        label: `${c.symbol} ${c.code} - ${c.name}`,
    }));

    const firstDayOptions = Array.from({ length: 28 }, (_, i) => ({
        value: (i + 1).toString(),
        label: (i + 1).toString(),
    }));

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Customize your budget planner
                </p>
            </div>

            {/* Appearance */}
            <Card>
                <CardHeader
                    title="Appearance"
                    subtitle="Customize how the app looks"
                />

                <div className="space-y-6">
                    {/* Theme Selector */}
                    <div>
                        <p className="label">Theme</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`
                  flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${theme === 'light'
                                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }
                `}
                            >
                                <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-accent-500' : 'text-slate-400'}`} />
                                <span className={`text-sm font-medium ${theme === 'light' ? 'text-accent-600 dark:text-accent-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                    Light
                                </span>
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`
                  flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${theme === 'dark'
                                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }
                `}
                            >
                                <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-accent-500' : 'text-slate-400'}`} />
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-accent-600 dark:text-accent-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                    Dark
                                </span>
                            </button>
                            <button
                                onClick={() => handleThemeChange('system')}
                                className={`
                  flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${theme === 'system'
                                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }
                `}
                            >
                                <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-accent-500' : 'text-slate-400'}`} />
                                <span className={`text-sm font-medium ${theme === 'system' ? 'text-accent-600 dark:text-accent-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                    System
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Accessibility Options */}
                    <div className="space-y-4">
                        <Toggle
                            checked={settings?.highContrastMode ?? false}
                            onChange={(checked) => updateSettings({ highContrastMode: checked })}
                            label="High contrast mode"
                        />
                        <Toggle
                            checked={settings?.largeTextMode ?? false}
                            onChange={(checked) => updateSettings({ largeTextMode: checked })}
                            label="Large text mode"
                        />
                        <Toggle
                            checked={settings?.hideFinancialValues ?? false}
                            onChange={(checked) => updateSettings({ hideFinancialValues: checked })}
                            label="Privacy mode (Hide financial values)"
                        />
                    </div>
                </div>
            </Card>

            {/* Currency & Regional */}
            <Card>
                <CardHeader
                    title="Currency & Regional"
                    subtitle="Set your preferred currency and date settings"
                />

                <div className="space-y-4">
                    <Select
                        label="Currency"
                        options={currencyOptions}
                        value={settings?.currency ?? 'USD'}
                        onChange={handleCurrencyChange}
                    />

                    <Select
                        label="First day of financial month"
                        options={firstDayOptions}
                        value={(settings?.firstDayOfMonth ?? 1).toString()}
                        onChange={(value) => updateSettings({ firstDayOfMonth: parseInt(value) })}
                        helperText="Some people prefer their budget month to start on payday"
                    />
                </div>
            </Card>

            {/* Payment Methods */}
            <Card>
                <CardHeader
                    title="Payment Methods"
                    subtitle="Manage your payment methods (e.g., Credit Card, Bank Account)"
                />

                <div className="space-y-6">
                    <form onSubmit={handleAddPaymentMethod} className="flex gap-2">
                        <Input
                            placeholder="Add new payment method..."
                            value={newPaymentMethodName}
                            onChange={(e) => setNewPaymentMethodName(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" icon={Plus} disabled={!newPaymentMethodName.trim()}>
                            Add
                        </Button>
                    </form>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
                        {isLoadingMethods ? (
                            <div className="py-4 text-center text-slate-500 animate-pulse">Loading...</div>
                        ) : paymentMethods.length === 0 ? (
                            <div className="py-4 text-center text-slate-500">No payment methods added.</div>
                        ) : (
                            paymentMethods.map((method) => (
                                <div key={method.id} className="py-3 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {method.name}
                                                {method.isDefault && (
                                                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-500">
                                                        Default
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {!method.isDefault && (
                                        <button
                                            onClick={() => handleDeletePaymentMethod(method.id!)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Delete payment method"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader
                    title="Data Management"
                    subtitle="Backup, restore, or reset your data"
                />

                <div className="space-y-4">
                    <div className="flex gap-3">
                        <Button
                            icon={Download}
                            variant="secondary"
                            onClick={handleExportBackup}
                            isLoading={isExporting}
                        >
                            Export Backup
                        </Button>
                        <Button
                            icon={Upload}
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            isLoading={isImporting}
                        >
                            Import Backup
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImportBackup}
                        />
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Backups include all transactions, categories, budgets, goals, and settings.
                    </p>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Automatic Backups</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Perform a backup every time the app starts</p>
                            </div>
                            <Toggle
                                checked={settings?.autoBackupEnabled ?? false}
                                onChange={(checked) => updateSettings({ autoBackupEnabled: checked })}
                            />
                        </div>

                        {settings?.autoBackupEnabled && (
                            <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FolderOpen className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Backup Folder</p>
                                            <p className="text-sm text-slate-900 dark:text-white truncate">
                                                {settings.autoBackupPath || 'No folder selected (Will fallback to Downloads)'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleSelectFolder}
                                    >
                                        Change
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Note: Browsers usually require permission to access folders each session.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-900/50">
                <CardHeader
                    title="Danger Zone"
                    subtitle="Irreversible actions"
                />

                <div className="flex items-center gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium text-red-700 dark:text-red-400">
                            Reset all data
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">
                            This will permanently delete all your data and cannot be undone.
                        </p>
                    </div>
                    <Button
                        icon={Trash2}
                        variant="danger"
                        onClick={handleResetData}
                    >
                        Reset
                    </Button>
                </div>
            </Card>
        </div>
    );
}
