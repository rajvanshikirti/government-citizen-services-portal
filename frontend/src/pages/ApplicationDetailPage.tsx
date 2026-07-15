import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge, LoadingSpinner } from '../components/common/Badge';
import { ApplicationTimeline } from '../components/common/Timeline';
import { applicationsApi } from '../services/endpoints';
import type { Application } from '../types';
import { formatDate } from '../utils/helpers';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      applicationsApi.getById(id)
        .then((res) => setApplication(res.data.data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!application) return <p className="text-gov-error">Application not found</p>;

  const progressPercent = {
    DRAFT: 10, SUBMITTED: 25, UNDER_REVIEW: 50, APPROVED: 80, COMPLETED: 100, REJECTED: 100,
  }[application.status] || 0;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title={application.applicationNo}
        subtitle={application.service?.name}
        badge={<StatusBadge status={application.status} />}
        breadcrumbs={[
          { label: 'Applications', href: '/applications' },
          { label: application.applicationNo },
        ]}
      />

      {/* Progress bar */}
      <div className="gov-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gov-text dark:text-white">Application Progress</span>
          <span className="text-sm font-bold text-gov-blue">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-gov-border dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${application.status === 'REJECTED' ? 'bg-gov-error' : 'bg-gov-blue'}`}
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Application Timeline" subtitle="Track your application status">
            <ApplicationTimeline
              currentStatus={application.status}
              statusHistory={application.statusHistory}
              remarks={application.remarks}
            />
          </Card>

          <Card title="Application Details">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <DetailItem label="Submitted" value={application.submittedAt ? formatDate(application.submittedAt) : 'Not submitted'} />
              <DetailItem label="Last Updated" value={formatDate(application.updatedAt)} />
              {application.certificateNo && (
                <DetailItem label="Certificate No" value={application.certificateNo} highlight />
              )}
              {application.remarks && (
                <div className="sm:col-span-2">
                  <DetailItem label="Officer Remarks" value={application.remarks} />
                </div>
              )}
            </dl>
          </Card>

          <Card title="Form Data">
            <dl className="divide-y divide-gov-border dark:divide-slate-700">
              {Object.entries(application.formData).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 text-sm">
                  <dt className="text-gov-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                  <dd className="font-medium text-gov-text dark:text-slate-200 text-right max-w-[60%]">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <div className="space-y-6">
          {application.qrCode && (
            <Card title="Certificate QR Code">
              <div className="flex flex-col items-center">
                <img src={application.qrCode} alt="Certificate verification QR code" className="w-36 h-36 border border-gov-border rounded-md p-2" />
                <p className="text-xs text-gov-muted mt-3 text-center">Scan to verify certificate authenticity</p>
              </div>
            </Card>
          )}

          {application.documents && application.documents.length > 0 && (
            <Card title="Uploaded Documents">
              <ul className="space-y-2">
                {application.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3 p-3 bg-gov-bg dark:bg-slate-800 rounded-md text-sm">
                    <FileText className="w-4 h-4 text-gov-blue flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.originalName}</p>
                      <p className="text-xs text-gov-muted">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-gov-muted text-xs font-medium uppercase tracking-wide">{label}</dt>
      <dd className={`font-semibold mt-1 ${highlight ? 'text-gov-success' : 'text-gov-text dark:text-slate-200'}`}>{value}</dd>
    </div>
  );
}
