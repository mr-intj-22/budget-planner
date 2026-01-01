import { TrendingUp, TrendingDown, ShieldCheck, Target, Zap, Activity, Heart, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { useHealthScore } from '../../hooks/useHealthScore';

export function HealthScoreDial() {
    const { score, isLoading } = useHealthScore();

    if (isLoading || !score) {
        return (
            <Card className="h-48 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 border-dashed border-2">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-500" />
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Analyzing...</span>
                </div>
            </Card>
        );
    }

    const { totalScore, components, prevScore } = score;

    // Determine color based on score
    const getColor = (val: number) => {
        if (val >= 90) return 'text-emerald-500 stroke-emerald-500';
        if (val >= 75) return 'text-blue-500 stroke-blue-500';
        if (val >= 60) return 'text-amber-500 stroke-amber-500';
        return 'text-red-500 stroke-red-500';
    };

    const getBgColor = (val: number) => {
        if (val >= 90) return 'bg-emerald-500/10 dark:bg-emerald-500/10';
        if (val >= 75) return 'bg-blue-500/10 dark:bg-blue-500/10';
        if (val >= 60) return 'bg-amber-500/10 dark:bg-amber-500/10';
        return 'bg-red-500/10 dark:bg-red-500/10';
    };

    const trend = prevScore !== null ? totalScore - prevScore : null;

    // SVG Circle constants - using 100x100 viewBox coords
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (totalScore / 100) * circumference;

    const componentIcons: Record<string, any> = {
        savingsRate: Target,
        budgetAdherence: ShieldCheck,
        debtProgress: Zap,
        spendingStability: Activity,
        emergencyFund: Heart
    };

    const scoreColor = getColor(totalScore).split(' ')[0] || 'text-slate-500';

    return (
        <Card className="relative overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900/60 backdrop-blur-xl group/card">
            {/* Background Decorative Elements */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-10 transition-colors duration-1000 ${scoreColor.replace('text-', 'bg-')}`} />

            <div className="relative p-6 md:p-8 flex flex-col xl:flex-row items-center gap-8 xl:gap-12">

                {/* Left Section: Hero Dial */}
                <div className="relative flex-shrink-0">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: totalScore >= 90 ? '#10b981' : totalScore >= 75 ? '#3b82f6' : totalScore >= 60 ? '#f59e0b' : '#ef4444' }} />
                                    <stop offset="100%" style={{ stopColor: totalScore >= 90 ? '#059669' : totalScore >= 75 ? '#2563eb' : totalScore >= 60 ? '#d97706' : '#dc2626' }} />
                                </linearGradient>
                            </defs>

                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                className="fill-none stroke-slate-100 dark:stroke-slate-800/40"
                                strokeWidth="8"
                            />

                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                stroke="url(#scoreGradient)"
                                className="fill-none transition-all duration-1000 ease-in-out"
                                strokeWidth="8"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-20">
                            <span className={`text-5xl font-black tracking-tighter leading-none ${scoreColor}`}>
                                {totalScore}
                            </span>
                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-[0.3em] uppercase mt-1">
                                Rating
                            </span>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Insights */}
                <div className="flex-1 space-y-4 text-center xl:text-left">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Health</h3>
                        <div className="flex items-center justify-center xl:justify-start gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            <Sparkles className="w-3 h-3" />
                            Monthly AI Analysis
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3">
                        <div className={`px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 border border-slate-200/50 dark:border-slate-700/50`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${scoreColor.replace('text-', 'bg-')}`} />
                            {totalScore >= 90 ? 'Excellent' : totalScore >= 75 ? 'Optimal' : totalScore >= 60 ? 'Stable' : 'Vulnerable'}
                        </div>
                        {trend !== null && trend !== 0 && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ${trend > 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                                }`}>
                                {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {Math.abs(trend)} PTS {trend > 0 ? 'Up' : 'Down'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section: Simplified Component Cards */}
                <div className="w-full xl:w-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                    {Object.entries(components).map(([key, comp]) => {
                        const Icon = componentIcons[key] || Target;
                        const compColor = getColor(comp.score).split(' ')[0] || 'text-slate-500';
                        return (
                            <div
                                key={key}
                                className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 min-w-[120px]"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className={`p-1.5 rounded-lg ${getBgColor(comp.score)}`}>
                                        <Icon className={`w-3.5 h-3.5 ${compColor}`} />
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">
                                        {Math.round(comp.score)}%
                                    </span>
                                </div>

                                <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
                                    {comp.label.replace(' Adherence', '').replace(' Progress', '').replace(' Stability', '').replace(' Fund', '').replace(' Rate', '')}
                                </span>

                                <div className="h-1 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out rounded-full ${compColor.replace('text-', 'bg-')}`}
                                        style={{ width: `${comp.score || 0}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
