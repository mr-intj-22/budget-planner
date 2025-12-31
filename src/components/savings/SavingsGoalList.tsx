import { PiggyBank, Plus } from 'lucide-react';
import { Card, StatCard } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SavingsGoalCard } from './SavingsGoalCard';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { useSettings } from '../../hooks/useSettings';
import { useAppStore } from '../../stores/appStore';
import { formatCurrency } from '../../utils/currency';

export function SavingsGoalList() {
    const { goals, totalTarget, totalSaved, totalRemaining, overallProgress, isLoading } = useSavingsGoals();
    const { settings } = useSettings();
    const { openSavingsGoalModal } = useAppStore();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <div className="animate-pulse flex items-center gap-5">
                            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div className="flex-1">
                                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (goals.length === 0) {
        return (
            <Card>
                <EmptyState
                    icon={<PiggyBank className="w-8 h-8 text-slate-400" />}
                    title="No savings goals yet"
                    description="Start building your financial future by creating your first savings goal"
                    action={{
                        label: 'Create Goal',
                        onClick: () => openSavingsGoalModal(),
                    }}
                />
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    title="Total Saved"
                    value={formatCurrency(totalSaved, settings)}
                    color="#10b981"
                    icon={<PiggyBank className="w-6 h-6 text-emerald-500" />}
                />
                <StatCard
                    title="Target Total"
                    value={formatCurrency(totalTarget, settings)}
                    color="#6366f1"
                />
                <StatCard
                    title="Remaining"
                    value={formatCurrency(totalRemaining, settings)}
                    change={{
                        value: `${overallProgress.toFixed(0)}% complete`,
                        type: overallProgress >= 50 ? 'positive' : 'neutral',
                    }}
                />
            </div>

            {/* Goals Header */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
                </p>
                <Button icon={Plus} onClick={() => openSavingsGoalModal()} size="sm">
                    New Goal
                </Button>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => (
                    <SavingsGoalCard key={goal.id} goal={goal} />
                ))}
            </div>
        </div>
    );
}
