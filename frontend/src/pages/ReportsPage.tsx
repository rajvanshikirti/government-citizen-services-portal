import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingSpinner } from '../components/common/Badge';
import { reportsApi } from '../services/endpoints';

const COLORS = ['#0F4C81', '#1B5E20', '#FF9933', '#C62828', '#2E7D32', '#6B7280'];

const chartTooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #D9E2EC', borderRadius: '6px', fontSize: '13px' },
};

export default function ReportsPage() {
  const [byService, setByService] = useState<{ service: string; count: number }[]>([]);
  const [byStatus, setByStatus] = useState<{ status: string; count: number }[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportsApi.getByService(), reportsApi.getByStatus(), reportsApi.getMonthlyTrend(6)])
      .then(([s, st, t]) => { setByService(s.data.data); setByStatus(st.data.data); setMonthlyTrend(t.data.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Application statistics and service performance metrics"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Applications by Service" subtitle="Volume across government services">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byService}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D9E2EC" />
              <XAxis dataKey="service" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-35} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="count" fill="#0F4C81" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Applications by Status" subtitle="Current application pipeline">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={95} label={({ status, count }) => `${status}: ${count}`}>
                {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Monthly Application Trend" subtitle="Applications received over the last 6 months">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D9E2EC" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
            <Tooltip {...chartTooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="#0F4C81" strokeWidth={2} dot={{ r: 4, fill: '#0F4C81' }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
