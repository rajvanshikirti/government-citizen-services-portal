import type { ApplicationStatus } from '../../types';
import { statusColors } from '../../utils/helpers';

interface BadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: BadgeProps) {
  const colorClass = statusColors[status as ApplicationStatus] || 'bg-slate-100 text-slate-700 border border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${colorClass} ${className}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function LoadingSpinner({ size = 'md', label = 'Loading' }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center p-12" role="status" aria-label={label}>
      <svg className={`animate-spin text-gov-blue ${sizes[size]}`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function EmptyState({ message, icon, action }: { message: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gov-muted animate-fade-in">
      {icon && <div className="mb-4 text-gov-blue opacity-60">{icon}</div>}
      <p className="text-base font-medium">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
