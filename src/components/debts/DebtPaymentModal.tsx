import { useState, useEffect } from 'react';
import { DollarSign, FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useDebtOperations } from '../../hooks/useDebts';
import { useAppStore } from '../../stores/appStore';
import { Debt } from '../../db/schema';

interface DebtPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    debt: Debt | null;
    rates: Record<string, number>;
    localCurrency: string;
}

export function DebtPaymentModal({ isOpen, onClose, debt, rates, localCurrency }: DebtPaymentModalProps) {
    const { recordPayment } = useDebtOperations();
    const { showToast } = useAppStore();

    const [debtAmount, setDebtAmount] = useState('');
    const [localAmount, setLocalAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const isDifferentCurrency = debt && debt.originalCurrency !== localCurrency;

    useEffect(() => {
        if (!isOpen) {
            setDebtAmount('');
            setLocalAmount('');
            setDescription('');
        }
    }, [isOpen]);

    // Handle debt amount change -> auto calculate local amount
    const handleDebtAmountChange = (val: string) => {
        setDebtAmount(val);
        const amount = parseFloat(val);
        if (!isNaN(amount) && debt) {
            const rate = rates[debt.originalCurrency];
            if (rate) {
                setLocalAmount((amount / rate).toFixed(2));
            } else if (!isDifferentCurrency) {
                setLocalAmount(val);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!debt || !debtAmount || !localAmount) {
            showToast('Please fill in the payment amount', 'error');
            return;
        }

        setLoading(true);
        try {
            await recordPayment(
                debt.id!,
                debt.paidAmount || 0,
                parseFloat(debtAmount),
                parseFloat(localAmount),
                debt.originalAmount,
                description
            );
            showToast('Payment recorded successfully', 'success');
            onClose();
        } catch (error) {
            showToast('Failed to record payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!debt) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Record Payment: ${debt.name}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label={`Payment Amount (${debt.originalCurrency})`}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={debtAmount}
                    onChange={e => handleDebtAmountChange(e.target.value)}
                    required
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    autoFocus
                />

                {isDifferentCurrency && (
                    <Input
                        label={`Equivalent in Local Currency (${localCurrency})`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={localAmount}
                        onChange={e => setLocalAmount(e.target.value)}
                        required
                        leftIcon={<DollarSign className="w-4 h-4" />}
                        helperText="Based on current exchange rates. Adjust if your bank used a different rate."
                    />
                )}

                <Input
                    label="Description (Optional)"
                    placeholder="e.g., Monthly installment, Early repayment"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    leftIcon={<FileText className="w-4 h-4" />}
                />

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={loading}>
                        Record Payment
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
