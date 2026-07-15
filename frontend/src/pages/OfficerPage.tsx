import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { SearchBar } from '../components/common/SearchBar';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { StatusBadge, LoadingSpinner, EmptyState } from '../components/common/Badge';
import { GovernmentTable } from '../components/common/Table';
import { applicationsApi } from '../services/endpoints';
import type { Application, ApplicationStatus } from '../types';
import { formatDate } from '../utils/helpers';

export default function OfficerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApplications = () => {
    setLoading(true);
    applicationsApi.list({ search: search || undefined, limit: 20 })
      .then((res) => setApplications(res.data.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(); }, [search]);

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      await applicationsApi.updateStatus(selectedApp.id, { status: newStatus, remarks });
      setSelectedApp(null);
      fetchApplications();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Officer Panel"
        subtitle="Review and process citizen applications"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Officer Panel' }]}
      />

      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by application number or citizen name..." />
      </div>

      <div className="gov-card">
        {loading ? (
          <LoadingSpinner />
        ) : applications.length === 0 ? (
          <EmptyState message="No applications to review" />
        ) : (
          <GovernmentTable
            data={applications}
            keyExtractor={(app) => app.id}
            columns={[
              { key: 'no', header: 'Application No', render: (app) => <span className="font-semibold">{app.applicationNo}</span> },
              { key: 'citizen', header: 'Citizen', render: (app) => `${app.user?.firstName} ${app.user?.lastName}` },
              { key: 'service', header: 'Service', render: (app) => app.service?.name },
              { key: 'status', header: 'Status', render: (app) => <StatusBadge status={app.status} /> },
              { key: 'date', header: 'Date', render: (app) => formatDate(app.createdAt) },
              {
                key: 'actions', header: 'Actions',
                render: (app) => (
                  <div className="flex gap-3">
                    <Link to={`/applications/${app.id}`} className="text-sm font-semibold text-gov-blue hover:underline">View</Link>
                    {['SUBMITTED', 'UNDER_REVIEW'].includes(app.status) && (
                      <button onClick={() => { setSelectedApp(app); setNewStatus('UNDER_REVIEW'); setRemarks(''); }} className="text-sm font-semibold text-gov-green hover:underline">
                        Process
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Update Application Status">
        {selectedApp && (
          <div className="space-y-4">
            <p className="text-sm text-gov-muted">Application: <strong className="text-gov-text">{selectedApp.applicationNo}</strong></p>
            <div>
              <label className="block text-sm font-semibold text-gov-text mb-1.5">New Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)} className="gov-input">
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gov-text mb-1.5">Officer Remarks</label>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="gov-input resize-none" placeholder="Add remarks for the citizen..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleUpdateStatus} isLoading={updating}>Update Status</Button>
              <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
