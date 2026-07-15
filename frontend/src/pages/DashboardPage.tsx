import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, XCircle, ArrowRight,
  Award, RefreshCw, User,
} from 'lucide-react';
import { StatCard, Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingSpinner } from '../components/common/Badge';
import { StatusBadge } from '../components/common/Badge';
import { ServiceCardCompact } from '../components/common/ServiceCard';
import { GovernmentTable } from '../components/common/Table';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { reportsApi, applicationsApi, servicesApi, notificationsApi } from '../services/endpoints';
import type { DashboardStats, Application, GovernmentService, Notification } from '../types';
import { formatDate, getInitials } from '../utils/helpers';
import { maskAadhaar } from '../utils/aadhaar';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [quickServices, setQuickServices] = useState<GovernmentService[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsApi.getDashboardStats(),
      applicationsApi.list({ limit: 5 }),
      servicesApi.list({ limit: 4 }),
      notificationsApi.list({ limit: 3, unreadOnly: true }),
    ])
      .then(([statsRes, appsRes, servicesRes, notifRes]) => {
        setStats(statsRes.data.data);
        setRecentApps(appsRes.data.data.data);
        setQuickServices(servicesRes.data.data.data);
        setNotifications(notifRes.data.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  const isCitizen = user?.role === 'CITIZEN';

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${t('welcome')}, ${user?.firstName}!`}
        subtitle={isCitizen ? 'Manage your applications, certificates, and government services' : `${user?.role} — System Overview`}
      />

      {/* Profile summary + notifications */}
      {isCitizen && user && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <Card className="lg:col-span-2" noPadding>
            <div className="p-5 flex items-start gap-4">
              <div className="w-14 h-14 bg-gov-blue rounded-md flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {getInitials(user.firstName, user.lastName)}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gov-text dark:text-white">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-gov-muted">{user.email}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gov-muted">
                  {user.phone && <span>{user.phone}</span>}
                  {user.aadhaarNumber && <span>Aadhaar: {maskAadhaar(user.aadhaarNumber)}</span>}
                  <span className="text-gov-green font-semibold">{user.role}</span>
                </div>
              </div>
              <Link to="/profile" className="text-sm font-semibold text-gov-blue hover:underline flex items-center gap-1">
                <User className="w-4 h-4" /> Profile
              </Link>
            </div>
          </Card>
          <Card title="Notifications" action={
            <Link to="/notifications" className="text-xs font-semibold text-gov-blue hover:underline">View All</Link>
          } noPadding>
            <div className="divide-y divide-gov-border dark:divide-slate-700">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gov-muted">No new notifications</p>
              ) : notifications.map((n) => (
                <div key={n.id} className="p-3 hover:bg-gov-bg dark:hover:bg-slate-800/50">
                  <p className="text-sm font-medium text-gov-text dark:text-slate-200">{n.title}</p>
                  <p className="text-xs text-gov-muted mt-0.5 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isCitizen ? (
          <>
            <StatCard title={t('totalApplications')} value={stats?.total || 0} icon={<FileText className="w-5 h-5" />} accent="blue" />
            <StatCard title={t('pending')} value={stats?.pending || 0} icon={<Clock className="w-5 h-5" />} accent="saffron" />
            <StatCard title={t('approved')} value={stats?.approved || 0} icon={<CheckCircle className="w-5 h-5" />} accent="green" />
            <StatCard title={t('rejected')} value={stats?.rejected || 0} icon={<XCircle className="w-5 h-5" />} accent="error" />
          </>
        ) : (
          <>
            <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<FileText className="w-5 h-5" />} accent="blue" />
            <StatCard title="Total Applications" value={stats?.totalApplications || 0} icon={<FileText className="w-5 h-5" />} accent="blue" />
            <StatCard title="Pending Review" value={stats?.pendingApplications || 0} icon={<Clock className="w-5 h-5" />} accent="saffron" />
            <StatCard title="Completed" value={stats?.completedApplications || 0} icon={<CheckCircle className="w-5 h-5" />} accent="green" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent applications */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Applications"
            subtitle="Track your latest application activity"
            action={
              <Link to="/applications" className="text-sm font-semibold text-gov-blue hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            }
            noPadding
          >
            {recentApps.length === 0 ? (
              <p className="p-8 text-center text-gov-muted text-sm">{t('noData')}</p>
            ) : (
              <GovernmentTable
                data={recentApps}
                keyExtractor={(app) => app.id}
                columns={[
                  {
                    key: 'no',
                    header: t('applicationNo'),
                    render: (app) => (
                      <Link to={`/applications/${app.id}`} className="font-semibold text-gov-blue hover:underline">
                        {app.applicationNo}
                      </Link>
                    ),
                  },
                  { key: 'service', header: t('serviceName'), render: (app) => app.service?.name },
                  { key: 'status', header: t('status'), render: (app) => <StatusBadge status={app.status} /> },
                  { key: 'date', header: t('date'), render: (app) => formatDate(app.createdAt) },
                ]}
              />
            )}
          </Card>
        </div>

        {/* Quick services + schemes */}
        <div className="space-y-5">
          <Card title="Quick Services" noPadding>
            <div className="p-3 space-y-2">
              {quickServices.map((s) => <ServiceCardCompact key={s.id} service={s} />)}
            </div>
          </Card>
          {isCitizen && (
            <Card title="Upcoming Renewals" subtitle="Services requiring renewal">
              <div className="flex items-center gap-3 text-sm text-gov-muted">
                <RefreshCw className="w-5 h-5 text-gov-blue flex-shrink-0" />
                <p>No renewals due at this time. Driving licence and property tax renewals will appear here.</p>
              </div>
            </Card>
          )}
          <Card title="Government Schemes">
            <div className="space-y-3">
              {['PM-KISAN Direct Benefit Transfer', 'Ayushman Bharat Health Coverage', 'Digital India Literacy Mission'].map((scheme) => (
                <div key={scheme} className="flex items-start gap-2 text-sm">
                  <Award className="w-4 h-4 text-gov-green mt-0.5 flex-shrink-0" />
                  <span className="text-gov-text dark:text-slate-300">{scheme}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
