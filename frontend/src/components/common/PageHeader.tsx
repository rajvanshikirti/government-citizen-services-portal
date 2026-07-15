import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, subtitle, badge, action, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-8 animate-fade-in">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-2 text-sm text-gov-muted">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-gov-blue transition-colors">{crumb.label}</a>
                ) : (
                  <span className="text-gov-text font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-gov-text dark:text-white tracking-tight">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-gov-muted mt-1.5 text-base max-w-2xl">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
