import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Type, Info, Percent, CheckCircle2 } from 'lucide-react';
import { useDebtOperations, useDebts } from '../../hooks/useDebts';
import { useSettings } from '../../hooks/useSettings';
import { useAppStore } from '../../stores/appStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { availableCurrencies } from '../../db/seeds';

interface DebtModalProps {
    isOpen: boolean;
    onClose: () => void;
    debtId?: number | null;
}

export function DebtModal({ isOpen, onClose, debtId }: DebtModalProps) {
    const { debts, rates } = useDebts();
    const { addDebt, updateDebt } = useDebtOperations();
    const { settings } = useSettings();
    const { showToast } = useAppStore();

    interface DebtFormData {
        name: string;
        description: string;
        originalAmount: string;
        paidAmount: string;
        originalCurrency: string;
        interestRate: string;
        dueDate: string;
        isPaid: boolean;
    }

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<DebtFormData>({
        name: '',
        description: '',
        originalAmount: '',
        paidAmount: '0',
        originalCurrency: settings?.currency || 'USD',
        interestRate: '',
        dueDate: '',
        isPaid: false,
    });

    useEffect(() => {
        if (debtId && debts) {
            const debt = debts.find(d => d.id === debtId);
            if (debt) {
                setFormData({
                    name: debt.name,
                    description: debt.description || '',
                    originalAmount: debt.originalAmount.toString(),
                    paidAmount: (debt.paidAmount || 0).toString(),
                    originalCurrency: debt.originalCurrency || settings?.currency || 'USD',
                    interestRate: debt.interestRate?.toString() ?? '',
                    dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] || '' : '',
                    isPaid: debt.isPaid,
                });
            }
        } else {
            setFormData({
                name: '',
                description: '',
                originalAmount: '',
                paidAmount: '0',
                originalCurrency: settings?.currency || 'USD',
                interestRate: '',
                dueDate: '',
                isPaid: false,
            });
        }
    }, [debtId, debts, settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.originalAmount) {
            showToast('Please fill in required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const data = {
                name: formData.name,
                description: formData.description,
                originalAmount: parseFloat(formData.originalAmount),
                paidAmount: parseFloat(formData.paidAmount) || 0,
                originalCurrency: formData.originalCurrency,
                interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                isPaid: formData.isPaid || (parseFloat(formData.paidAmount) >= parseFloat(formData.originalAmount)),
            };

            if (debtId) {
                await updateDebt(debtId, data);
                showToast('Debt updated successfully', 'success');
            } else {
                await addDebt(data);
                showToast('Debt added successfully', 'success');
            }
            onClose();
        } catch (error) {
            showToast('An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    const currencyOptions = availableCurrencies.map(c => ({
        value: c.code,
        label: `${c.symbol} ${c.code} - ${c.name}`
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={debtId ? 'Edit Debt' : 'Add New Debt'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Debt Name"
                    placeholder="e.g., Student Loan, Credit Card"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    leftIcon={<Type className="w-4 h-4" />}
                />

                <Input
                    label="Description (Optional)"
                    placeholder="Brief details about this liability"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    leftIcon={<Info className="w-4 h-4" />}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.originalAmount}
                        onChange={e => setFormData({ ...formData, originalAmount: e.target.value })}
                        required
                        leftIcon={<DollarSign className="w-4 h-4" />}
                    />
                    <Select
                        label="Currency"
                        options={currencyOptions}
                        value={formData.originalCurrency}
                        onChange={value => setFormData({ ...formData, originalCurrency: value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Paid Amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.paidAmount}
                        onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    />
                    <Input
                        label="Interest Rate % (Optional)"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={formData.interestRate}
                        onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                        leftIcon={<Percent className="w-4 h-4" />}
                    />
                </div>
                <Input
                    label="Due Date (Optional)"
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    leftIcon={<Calendar className="w-4 h-4" />}
                />

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Convert to local:</span>
                        <div className="text-right">
                            <p className="text-lg font-bold text-accent-600 dark:text-accent-400">
                                {settings?.currencySymbol} {
                                    (() => {
                                        const amount = parseFloat(formData.originalAmount) || 0;
                                        const rate = rates[formData.originalCurrency];
                                        return (rate ? amount / rate : amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                    })()
                                }
                            </p>
                            <p className="text-[10px] text-slate-400">Live conversion active</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={loading}>
                        {debtId ? 'Save Changes' : 'Add Debt'}
                    </Button>
                </div>
            </form>
        </Modal >
    );
}
