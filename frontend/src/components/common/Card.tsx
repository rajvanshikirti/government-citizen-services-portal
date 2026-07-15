import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className = '', title, subtitle, action, noPadding }: CardProps) {
  return (
    <div className={`gov-card animate-fade-in ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gov-border dark:border-slate-700">
          <div>
            {title && <h3 className="gov-section-title">{title}</h3>}
            {subtitle && <p className="text-sm text-gov-muted mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'blue' | 'green' | 'saffron' | 'error';
  trend?: string;
}

const accentStyles = {
  blue: 'bg-gov-blue-light text-gov-blue dark:bg-gov-blue/20 dark:text-blue-300',
  green: 'bg-gov-green-light text-gov-green dark:bg-gov-green/20 dark:text-green-300',
  saffron: 'bg-gov-saffron-light text-gov-saffron dark:bg-gov-saffron/20 dark:text-orange-300',
  error: 'bg-red-50 text-gov-error dark:bg-red-900/30 dark:text-red-300',
};

export function StatCard({ title, value, icon, accent = 'blue', trend }: StatCardProps) {
  return (
    <div className="gov-card p-5 transition-shadow duration-200 hover:shadow-gov-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gov-muted">{title}</p>
          <p className="text-2xl font-bold text-gov-text dark:text-white mt-1 tabular-nums">{value}</p>
          {trend && <p className="text-xs text-gov-muted mt-1">{trend}</p>}
        </div>
        <div className={`p-2.5 rounded-md ${accentStyles[accent]}`}>{icon}</div>
      </div>
    </div>
  );
}
