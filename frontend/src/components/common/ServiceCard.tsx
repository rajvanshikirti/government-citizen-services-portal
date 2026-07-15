import { Link } from 'react-router-dom';
import { Clock, IndianRupee, Building2, ArrowRight, Info } from 'lucide-react';
import { Button } from './Button';
import { ServiceIcon } from '../../utils/serviceIcons';
import type { GovernmentService } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface ServiceCardProps {
  service: GovernmentService;
  showActions?: boolean;
}

export function ServiceCard({ service, showActions = true }: ServiceCardProps) {
  return (
    <article className="gov-card group transition-all duration-200 hover:shadow-gov-md hover:border-gov-blue/30 flex flex-col h-full">
      <div className="p-5 flex-1">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-md bg-gov-blue-light dark:bg-gov-blue/20 flex items-center justify-center text-gov-blue group-hover:bg-gov-blue group-hover:text-white transition-colors duration-200">
            <ServiceIcon slug={service.slug} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-gov-green bg-gov-green-light dark:bg-gov-green/20 dark:text-green-300 px-2 py-0.5 rounded">
              {service.category}
            </span>
            <h3 className="text-base font-semibold text-gov-text dark:text-white mt-2 group-hover:text-gov-blue transition-colors">
              {service.name}
            </h3>
            <p className="text-sm text-gov-muted mt-1.5 line-clamp-2 leading-relaxed">{service.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gov-border dark:border-slate-700 text-sm text-gov-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gov-blue" aria-hidden="true" />
            {service.processingDays} days
          </span>
          <span className="flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-gov-blue" aria-hidden="true" />
            {service.fee > 0 ? formatCurrency(service.fee) : 'Free'}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-gov-blue" aria-hidden="true" />
            Govt. of India
          </span>
        </div>
      </div>

      {showActions && (
        <div className="px-5 py-4 bg-gov-bg/50 dark:bg-slate-800/50 border-t border-gov-border dark:border-slate-700 flex gap-2">
          <Link to={`/services/${service.slug}/apply`} className="flex-1">
            <Button className="w-full" size="sm">Apply Now</Button>
          </Link>
          <Link to={`/services`} className="flex-shrink-0">
            <Button variant="outline" size="sm" aria-label={`Learn more about ${service.name}`}>
              <Info className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </article>
  );
}

export function ServiceCardCompact({ service }: { service: GovernmentService }) {
  return (
    <Link
      to={`/services/${service.slug}/apply`}
      className="gov-card p-4 flex items-center gap-3 hover:shadow-gov-md hover:border-gov-blue/30 transition-all duration-200 group"
    >
      <div className="w-10 h-10 rounded-md bg-gov-blue-light dark:bg-gov-blue/20 flex items-center justify-center text-gov-blue">
        <ServiceIcon slug={service.slug} className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gov-text dark:text-white truncate">{service.name}</p>
        <p className="text-xs text-gov-muted">{service.processingDays} days processing</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gov-muted group-hover:text-gov-blue transition-colors" />
    </Link>
  );
}
