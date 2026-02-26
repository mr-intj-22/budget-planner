import { CreditCard as CardIcon } from 'lucide-react';
import { useCreditCards } from '../../hooks/useCreditCards';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { useNavigate } from 'react-router-dom';

export function CreditCardWidget() {
    const { creditCards } = useCreditCards();
    const { settings } = useSettings();
    const navigate = useNavigate();

    const activeCards = creditCards.filter(c => c.isActive);

    if (activeCards.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[250px]">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mb-3">
                    <CardIcon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No Credit Cards</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] mb-4">
                    Track your credit card spending and limits here.
                </p>
                <button
                    onClick={() => navigate('/credit-cards')}
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
                >
                    Add a card
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/credit-cards')}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <CardIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Credit Cards</h2>
                </div>
            </div>

            <div className="space-y-4 flex-1">
                {activeCards.slice(0, 3).map(card => {
                    const usagePercentage = card.limit > 0 ? Math.min((card.currentUsage / card.limit) * 100, 100) : 0;
                    const isNearingLimit = usagePercentage >= 80;

                    return (
                        <div key={card.id}>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {card.name}
                                </span>
                                <span className={`text-sm font-bold ${isNearingLimit ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                    {formatCurrency(card.currentUsage, settings)}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                <div
                                    className={`transition-all duration-500 h-full rounded-r-full ${isNearingLimit ? 'bg-red-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${usagePercentage}%`, backgroundColor: isNearingLimit ? undefined : card.color }}
                                />
                            </div>
                        </div>
                    );
                })}
                {activeCards.length > 3 && (
                    <div className="text-center pt-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            +{activeCards.length - 3} more cards
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
