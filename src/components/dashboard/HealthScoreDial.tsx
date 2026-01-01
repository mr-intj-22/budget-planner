import { TrendingUp, TrendingDown, Info, ShieldCheck, Target, Zap, Activity, Heart } from 'lucide-react';
import { Card } from '../ui/Card';
import { useHealthScore } from '../../hooks/useHealthScore';

export function HealthScoreDial() {
    const { score, isLoading } = useHealthScore();

    if (isLoading || !score) {
        return (
            <Card className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500" />
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
        if (val >= 90) return 'bg-emerald-50 dark:bg-emerald-900/20';
        if (val >= 75) return 'bg-blue-50 dark:bg-blue-900/20';
        if (val >= 60) return 'bg-amber-50 dark:bg-amber-900/20';
        return 'bg-red-50 dark:bg-red-900/20';
    };

    const trend = prevScore !== null ? totalScore - prevScore : null;

    // SVG Circle constants - using 100x100 viewBox coords
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (totalScore / 100) * circumference;

    const componentIcons: Record<string, any> = {
        savingsRate: Target,
        budgetAdherence: ShieldCheck,
        debtProgress: Zap,
        spendingStability: Activity,
        emergencyFund: Heart
    };

    return (
        <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900/40">
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12">

                {/* Left Section: Big Dial */}
                <div className="relative flex-shrink-0 group">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.05)]" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: totalScore >= 90 ? '#10b981' : totalScore >= 75 ? '#3b82f6' : totalScore >= 60 ? '#f59e0b' : '#ef4444' }} />
                                    <stop offset="100%" style={{ stopColor: totalScore >= 90 ? '#059669' : totalScore >= 75 ? '#2563eb' : totalScore >= 60 ? '#d97706' : '#dc2626' }} />
                                </linearGradient>
                            </defs>
                            {/* Outer Track */}
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                className="fill-none stroke-slate-50 dark:stroke-slate-800/40"
                                strokeWidth="10"
                            />
                            {/* Inner Decorative Circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r={radius - 8}
                                className="fill-none stroke-slate-100/30 dark:stroke-slate-800/20"
                                strokeWidth="1"
                                strokeDasharray="2 4"
                            />
                            {/* Main Progress Circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                stroke="url(#scoreGradient)"
                                className="fill-none transition-all duration-1000 ease-out"
                                strokeWidth="10"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                filter={`drop-shadow(0 0 6px ${totalScore >= 90 ? '#10b98140' : totalScore >= 75 ? '#3b82f640' : totalScore >= 60 ? '#f59e0b40' : '#ef444440'})`}
                            />
                            {/* Handle Dot at the end of progress */}
                            {totalScore > 0 && (
                                <circle
                                    cx={50 + radius * Math.cos((totalScore / 100) * 2 * Math.PI)}
                                    cy={50 + radius * Math.sin((totalScore / 100) * 2 * Math.PI)}
                                    r="3"
                                    className="fill-white shadow-lg transition-all duration-1000 ease-out"
                                />
                            )}
                        </svg>
                        {/* Centered Text Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                            <div className="relative group-hover:scale-110 transition-transform duration-500 flex flex-col items-center">
                                <span className={`text-5xl font-black tracking-tighter leading-none ${getColor(totalScore).split(' ')[0] || 'text-slate-600'}`}>
                                    {totalScore}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase mt-1">
                                    Score
                                </span>
                                <div className="absolute -top-1 -right-3">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${(getColor(totalScore).split(' ')[0] || 'text-slate-400').replace('text-', 'bg-')}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Section: Summary & Trend */}
                <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Financial Health Score</h3>
                        <div className={`p-1.5 rounded-full ${getBgColor(totalScore)}`}>
                            <Info className={`w-4 h-4 ${getColor(totalScore).split(' ')[0]}`} />
                        </div>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md leading-relaxed">
                        Evaluated across savings, budgeting, debt repayment, spending patterns, and safety nest.
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                        {trend !== null && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${trend >= 0
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'
                                : 'bg-red-50 text-red-600 dark:bg-red-900/30'
                                }`}>
                                {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span>{Math.abs(trend)} points {trend >= 0 ? 'gain' : 'drop'} from last month</span>
                            </div>
                        )}
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-xs font-bold">
                            Level: {totalScore >= 90 ? 'Excellent' : totalScore >= 75 ? 'Healthy' : totalScore >= 60 ? 'Stable' : 'Risk'}
                        </div>
                    </div>
                </div>

                {/* Right Section: Component Grid */}
                <div className="w-full md:w-auto flex-shrink-0 grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-6 md:pt-0 md:pl-8 lg:pl-12">
                    {Object.entries(components).map(([key, comp]) => {
                        const Icon = componentIcons[key] || Target;
                        const scoreColorClass = getColor(comp.score).split(' ')[0] || 'text-slate-500';
                        return (
                            <div key={key} className="flex flex-col gap-2 min-w-[100px]">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${getBgColor(comp.score)}`}>
                                        <Icon className={`w-3.5 h-3.5 ${scoreColorClass}`} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                                        {comp.label.split(' ')[0]}
                                    </span>
                                </div>
                                <div className="flex items-end justify-between gap-2">
                                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                        {Math.round(comp.score)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100/30 dark:bg-slate-800/20 rounded-full relative overflow-hidden backdrop-blur-sm shadow-inner">
                                    <div
                                        className={`h-full opacity-90 transition-all duration-1000 ease-out relative rounded-full ${scoreColorClass.replace('text-', 'bg-')}`}
                                        style={{
                                            width: `${comp.score || 0}%`,
                                            filter: `drop-shadow(0 0 4px ${scoreColorClass === 'text-emerald-500' ? '#10b981' : scoreColorClass === 'text-blue-500' ? '#3b82f6' : scoreColorClass === 'text-amber-500' ? '#f59e0b' : '#ef4444'})`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent mix-blend-overlay" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
