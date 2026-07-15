import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchBar } from '../components/common/SearchBar';
import { StatusBadge, LoadingSpinner, EmptyState } from '../components/common/Badge';
import { GovernmentTable, Pagination } from '../components/common/Table';
import { useLanguage } from '../contexts/LanguageContext';
import { applicationsApi } from '../services/endpoints';
import type { Application, ApplicationStatus } from '../types';
import { formatDate } from '../utils/helpers';

const STATUS_OPTIONS: ApplicationStatus[] = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'];

export default function ApplicationsPage() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    applicationsApi
      .list({ page, search: search || undefined, status: (status as ApplicationStatus) || undefined })
      .then((res) => {
        setApplications(res.data.data.data);
        setTotalPages(res.data.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, search, status]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('applications')}
        subtitle={t('trackApplication')}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: t('applications') }]}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by application number..." className="flex-1" />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gov-muted" aria-hidden="true" />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="gov-input min-w-[160px]" aria-label="Filter by status">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="gov-card" >
        {loading ? (
          <LoadingSpinner />
        ) : applications.length === 0 ? (
          <EmptyState message={t('noData')} />
        ) : (
          <>
            <GovernmentTable
              data={applications}
              keyExtractor={(app) => app.id}
              columns={[
                { key: 'no', header: t('applicationNo'), render: (app) => <span className="font-semibold">{app.applicationNo}</span> },
                { key: 'service', header: t('serviceName'), render: (app) => app.service?.name },
                { key: 'status', header: t('status'), render: (app) => <StatusBadge status={app.status} /> },
                { key: 'date', header: t('date'), render: (app) => formatDate(app.createdAt) },
                {
                  key: 'actions', header: t('actions'),
                  render: (app) => (
                    <Link to={`/applications/${app.id}`} className="text-sm font-semibold text-gov-blue hover:underline">
                      {t('viewDetails')}
                    </Link>
                  ),
                },
              ]}
            />
            <div className="p-4 border-t border-gov-border dark:border-slate-700">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
