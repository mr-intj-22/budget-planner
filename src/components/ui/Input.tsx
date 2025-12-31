import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Input({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="label">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
            input
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'input-error' : ''}
          `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {helperText}
                </p>
            )}
        </div>
    );
}

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({
    label,
    error,
    className = '',
    id,
    ...props
}: TextareaProps) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="label">
                    {label}
                </label>
            )}
            <textarea
                id={inputId}
                className={`input min-h-[100px] resize-y ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}

// Checkbox
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
}

export function Checkbox({ label, className = '', id, ...props }: CheckboxProps) {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
        <label
            htmlFor={inputId}
            className={`flex items-center gap-3 cursor-pointer ${className}`}
        >
            <input
                type="checkbox"
                id={inputId}
                className="
          w-5 h-5 rounded border-slate-300 dark:border-slate-600
          text-accent-500 focus:ring-accent-500 focus:ring-offset-0
          bg-slate-50 dark:bg-slate-900
        "
                {...props}
            />
            <span className="text-slate-700 dark:text-slate-300">{label}</span>
        </label>
    );
}

// Toggle Switch
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2
          ${checked ? 'bg-accent-500' : 'bg-slate-300 dark:bg-slate-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <span
                    className={`
            inline-block h-4 w-4 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
                />
            </button>
            {label && (
                <span className="text-slate-700 dark:text-slate-300">{label}</span>
            )}
        </label>
    );
}
