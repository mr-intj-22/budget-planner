import { ShieldCheck, Target, Zap, Heart, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { useHealthScore } from '../../hooks/useHealthScore';

export function HealthScoreDial() {
    const { score, isLoading } = useHealthScore();

    if (isLoading || !score) {
        return (
            <Card className="relative overflow-hidden">
                <div className="h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500/30" />
                        <span className="text-xs font-medium tracking-widest text-slate-500 dark:text-slate-400 uppercase">Analyzing...</span>
                    </div>
                </div>
            </Card>
        );
    }

    const { totalScore, components } = score;

    // Status determination
    const getStatus = (val: number) => {
        if (val >= 75) return { label: 'HEALTHY', color: 'emerald', colorValue: '#10b981' };
        if (val >= 50) return { label: 'AT RISK', color: 'amber', colorValue: '#f59e0b' };
        return { label: 'VULNERABLE', color: 'red', colorValue: '#ef4444' };
    };

    const status = getStatus(totalScore);

    // Get score color
    const getScoreColor = (val: number) => {
        if (val >= 75) return '#10b981';
        if (val >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const scoreColor = getScoreColor(totalScore);

    // Generate insights
    const generateInsight = () => {
        if (totalScore >= 75) {
            return {
                headline: 'Your finances are in good shape',
                explanation: 'You\'re maintaining solid financial habits across key areas.',
                actionHint: null
            };
        } else if (totalScore >= 50) {
            return {
                headline: 'Your finances need attention',
                explanation: 'Some areas require focus to improve your overall financial resilience.',
                actionHint: null
            };
        } else {
            return {
                headline: 'Your finances are under pressure this month',
                explanation: 'Low savings progress and unresolved debt are reducing your overall financial resilience.',
                actionHint: null
            };
        }
    };

    const insight = generateInsight();

    // Get worst component for "Top impact area"
    const worstComponent = Object.entries(components).reduce((worst, [key, comp]) => {
        return comp.score < worst.score ? { key, ...comp } : worst;
    }, { key: '', score: 100, label: '' } as { key: string; score: number; label: string });

    const pillarNames: Record<string, string> = {
        savingsRate: 'Savings',
        budgetAdherence: 'Budget Discipline',
        debtProgress: 'Debt Management',
        emergencyFund: 'Emergency Fund'
    };

    // Component icons and labels
    const componentConfig: Record<string, { icon: any; label: string }> = {
        savingsRate: { icon: Target, label: 'Savings' },
        budgetAdherence: { icon: ShieldCheck, label: 'Budget Discipline' },
        debtProgress: { icon: Zap, label: 'Debt Management' },
        emergencyFund: { icon: Heart, label: 'Emergency Fund' }
    };

    // SVG Circle constants
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (totalScore / 100) * circumference;

    // Get component color
    const getComponentColor = (val: number) => {
        if (val >= 75) return '#10b981';
        if (val >= 50) return '#f59e0b';
        return '#ef4444';
    };

    // Find most critical pillar for pulse animation
    const criticalPillar = Object.entries(components).reduce((worst, [key, comp]) => {
        return comp.score < worst.score ? { key, score: comp.score } : worst;
    }, { key: '', score: 100 });

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Subtle gradient overlay */}
            <div 
                className="absolute inset-0 opacity-5 dark:opacity-5"
                style={{
                    background: `radial-gradient(circle at 30% 50%, ${scoreColor}40, transparent 60%)`
                }}
            />

            <div className="relative p-4 md:p-5 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-stretch">
                {/* Left Section: Health Score Focus */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-full lg:w-auto">
                    {/* Circular Radial Gauge */}
                    <div className="relative w-36 h-36 flex items-center justify-center mb-2">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background ring */}
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                className="stroke-slate-200 dark:stroke-slate-700/50"
                                fill="none"
                                strokeWidth="6"
                            />
                            {/* Progress ring */}
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                stroke={scoreColor}
                                fill="none"
                                strokeWidth="6"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                                style={{
                                    filter: `drop-shadow(0 0 8px ${scoreColor}40)`
                                }}
                            />
                        </svg>
                        {/* Score number and RATING label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span 
                                className="text-4xl font-bold tabular-nums leading-none"
                                style={{ color: scoreColor }}
                            >
                                {totalScore}
                            </span>
                            <span className="text-[10px] font-medium tracking-widest text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                                RATING
                            </span>
                        </div>
                    </div>

                    {/* MONTHLY FINANCIAL HEALTH Label */}
                    <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 mb-2.5">
                        MONTHLY FINANCIAL HEALTH
                    </p>

                    {/* Status pill */}
                    <div 
                        className="px-3 py-1 rounded-full border flex items-center gap-1.5 mb-3"
                        style={{
                            backgroundColor: `${status.colorValue}15`,
                            borderColor: `${status.colorValue}40`,
                            color: status.colorValue
                        }}
                    >
                        <div 
                            className={`w-2 h-2 rounded-full ${status.label === 'VULNERABLE' ? 'animate-pulse-alert' : ''}`}
                            style={{ backgroundColor: status.colorValue }}
                        />
                        <span className="text-xs font-semibold tracking-wide">
                            {status.label}
                        </span>
                    </div>

                    {/* Top impact area */}
                    {worstComponent.key && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-xs font-medium text-emerald-400">
                                Top impact area: {pillarNames[worstComponent.key] || 'Financial Planning'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Section: Insight Summary & Pillar Breakdown */}
                <div className="flex-1 w-full flex flex-col justify-center space-y-4">
                    {/* Insight Summary */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <AlertTriangle 
                                className="w-4 h-4 flex-shrink-0 mt-0.5" 
                                style={{ color: totalScore < 50 ? '#f59e0b' : '#10b981' }}
                            />
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1.5 leading-tight">
                                    {insight.headline}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {insight.explanation}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* MONTHLY FINANCIAL HEALTH Label (above pillars) */}
                    <div>
                        <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 mb-3">
                            MONTHLY FINANCIAL HEALTH
                        </p>

                        {/* Pillar Breakdown */}
                        <div className="space-y-3">
                            {Object.entries(components).map(([key, comp]) => {
                                const config = componentConfig[key] || { icon: Target, label: key };
                                const Icon = config.icon;
                                const compColor = getComponentColor(comp.score);
                                const isCritical = criticalPillar.key === key && comp.score < 50;

                                return (
                                    <div
                                        key={key}
                                        className="group relative"
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: `${compColor}20`
                                                    }}
                                                >
                                                    <Icon 
                                                        className="w-3.5 h-3.5" 
                                                        style={{ color: compColor }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {config.label}
                                                </span>
                                            </div>
                                            <span 
                                                className="text-sm font-semibold tabular-nums"
                                                style={{ color: compColor }}
                                            >
                                                {Math.round(comp.score)}%
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden relative">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                                                style={{
                                                    width: `${comp.score || 0}%`,
                                                    backgroundColor: compColor,
                                                    boxShadow: `0 0 8px ${compColor}40`,
                                                    animation: isCritical ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                                                }}
                                            >
                                                {/* Shine effect */}
                                                <div className="absolute inset-0 shine-animation" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
                
                @keyframes pulse-alert {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(1.2);
                    }
                }
                
                .animate-pulse-alert {
                    animation: pulse-alert 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes shine {
                    0% {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                .shine-animation {
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.4),
                        transparent
                    );
                    animation: shine 2s ease-in-out infinite;
                    width: 50%;
                    height: 100%;
                }
            `}</style>
        </Card>
    );
}
