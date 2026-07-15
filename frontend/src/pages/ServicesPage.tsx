import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchBar } from '../components/common/SearchBar';
import { ServiceCard } from '../components/common/ServiceCard';
import { LoadingSpinner, EmptyState } from '../components/common/Badge';
import { useLanguage } from '../contexts/LanguageContext';
import { servicesApi } from '../services/endpoints';
import type { GovernmentService } from '../types';

export default function ServicesPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesApi.getCategories().then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    servicesApi
      .list({ search: search || undefined, category: category || undefined, limit: 50 })
      .then((res) => setServices(res.data.data.data))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('allServices')}
        subtitle="Browse and apply for government services online. All services are provided by authorized government departments."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: t('services') }]}
      />

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={`${t('search')} services by name or category...`}
          size="lg"
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gov-muted flex-shrink-0" aria-hidden="true" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="gov-input min-w-[180px]"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : services.length === 0 ? (
        <EmptyState message={t('noData')} />
      ) : (
        <>
          <p className="text-sm text-gov-muted mb-4">{services.length} service{services.length !== 1 ? 's' : ''} available</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
