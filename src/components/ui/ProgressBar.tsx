import { AppSettings } from '../../db/schema';

interface ProgressBarProps {
    value: number; // 0-100
    max?: number;
    color?: string;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    animate?: boolean;
    className?: string;
    settings?: AppSettings | null;
}

const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
};

export function ProgressBar({
    value,
    max = 100,
    color = '#6366f1',
    showLabel = false,
    size = 'md',
    animate = true,
    className = '',
    settings,
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    // Determine color based on percentage if using default color
    const getStatusColor = () => {
        if (color !== '#6366f1') return color;
        if (percentage >= 100) return '#ef4444'; // Red - over budget
        if (percentage >= 80) return '#f59e0b'; // Amber - warning
        return '#6366f1'; // Default accent
    };

    return (
        <div className={className}>
            <div className={`progress-bar ${sizeClasses[size]}`}>
                <div
                    className={`progress-bar-fill ${animate ? 'transition-all duration-700' : ''}`}
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: getStatusColor(),
                    }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{settings?.hideFinancialValues ? '****' : value.toLocaleString()}</span>
                    <span>{percentage.toFixed(0)}%</span>
                </div>
            )}
        </div>
    );
}

// Circular Progress
interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    showValue?: boolean;
    label?: string;
}

export function CircularProgress({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    color = '#6366f1',
    showValue = true,
    label,
}: CircularProgressProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-700"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={color}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700"
                />
            </svg>
            {(showValue || label) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {showValue && (
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            {percentage.toFixed(0)}%
                        </span>
                    )}
                    {label && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
