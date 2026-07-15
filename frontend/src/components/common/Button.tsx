import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variants = {
  primary:
    'bg-gov-blue text-white hover:bg-gov-blue-dark focus:ring-gov-blue/40 shadow-sm',
  secondary:
    'bg-gov-green text-white hover:bg-[#144a18] focus:ring-gov-green/40 shadow-sm',
  outline:
    'border border-gov-blue text-gov-blue bg-white hover:bg-gov-blue-light dark:bg-transparent dark:text-blue-300 dark:border-gov-blue dark:hover:bg-gov-blue/10',
  danger:
    'bg-gov-error text-white hover:bg-[#a31f1f] focus:ring-gov-error/40 shadow-sm',
  ghost:
    'text-gov-text dark:text-slate-200 hover:bg-gov-bg dark:hover:bg-slate-800',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm font-medium',
  md: 'px-4 py-2 text-sm font-semibold',
  lg: 'px-5 py-2.5 text-base font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className = '', children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
