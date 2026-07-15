import { type InputHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  floating?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, floating = false, className = '', id, value, placeholder, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    const [focused, setFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';

    if (floating && label) {
      return (
        <div className="relative w-full">
          <input
            ref={ref}
            id={inputId}
            value={value}
            placeholder=" "
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            className={`gov-input peer pt-5 pb-1.5 ${error ? 'border-gov-error focus:ring-gov-error/30 focus:border-gov-error' : ''} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={`absolute left-4 transition-all duration-200 pointer-events-none text-gov-muted
              peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm
              peer-focus:top-1 peer-focus:text-xs peer-focus:text-gov-blue
              ${hasValue || focused ? 'top-1 text-xs text-gov-blue' : 'top-2.5 text-sm'}`}
          >
            {label}
          </label>
          {error && <p id={`${inputId}-error`} className="mt-1.5 text-xs text-gov-error" role="alert">{error}</p>}
          {helperText && !error && <p className="mt-1.5 text-xs text-gov-muted">{helperText}</p>}
        </div>
      );
    }

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-gov-text dark:text-slate-200 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          value={value}
          placeholder={placeholder}
          className={`gov-input ${error ? 'border-gov-error focus:ring-gov-error/30 focus:border-gov-error' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && <p id={`${inputId}-error`} className="mt-1.5 text-xs text-gov-error" role="alert">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-xs text-gov-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
