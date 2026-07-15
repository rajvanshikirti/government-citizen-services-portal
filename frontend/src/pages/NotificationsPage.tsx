import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingSpinner, EmptyState } from '../components/common/Badge';
import { useLanguage } from '../contexts/LanguageContext';
import { notificationsApi } from '../services/endpoints';
import type { Notification } from '../types';
import { formatDate } from '../utils/helpers';

const typeStyles = {
  INFO: 'border-l-gov-blue',
  SUCCESS: 'border-l-gov-success',
  WARNING: 'border-l-gov-saffron',
  ERROR: 'border-l-gov-error',
};

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    notificationsApi.list({ limit: 50 }).then((res) => setNotifications(res.data.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead();
    fetchNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        title={t('notifications')}
        subtitle="Stay updated on your application status and government announcements"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: t('notifications') }]}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
            </Button>
          ) : undefined
        }
      />

      <Card noPadding>
        {loading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <EmptyState message="No notifications" icon={<Bell className="w-12 h-12" />} />
        ) : (
          <div className="divide-y divide-gov-border dark:divide-slate-700">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 border-l-4 ${typeStyles[n.type]} ${n.isRead ? 'opacity-70' : 'bg-gov-blue-light/30 dark:bg-gov-blue/5'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gov-text dark:text-white text-sm">{n.title}</h3>
                    <p className="text-sm text-gov-muted mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gov-muted mt-2">{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => handleMarkRead(n.id)} className="text-xs font-semibold text-gov-blue hover:underline whitespace-nowrap">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
