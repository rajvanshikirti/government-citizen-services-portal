import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, CheckCircle, FileText, ExternalLink } from 'lucide-react';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge, LoadingSpinner } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ApplicationTimeline } from '../components/common/Timeline';
import { DocumentReviewList } from '../components/common/DocumentReviewList';
import { applicationsApi } from '../services/endpoints';
import { useAuth } from '../contexts/AuthContext';
import type { Application } from '../types';
import { formatDate } from '../utils/helpers';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const canVerifyDocuments = user?.role === 'OFFICER' || user?.role === 'ADMIN';

  const loadApplication = () => {
    if (!id) return;
    setLoading(true);
    applicationsApi.getById(id)
      .then((res) => setApplication(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplication();
  }, [id]);

  const handleDocumentVerified = (documentId: string) => {
    setApplication((prev) => {
      if (!prev?.documents) return prev;
      return {
        ...prev,
        documents: prev.documents.map((doc) =>
          doc.id === documentId
            ? { ...doc, isVerified: true, verifiedAt: new Date().toISOString() }
            : doc
        ),
      };
    });
  };

  const handleDownloadCertificate = async () => {
    if (!id || downloading) return;
    setDownloading(true);
    try {
      const response = await applicationsApi.downloadCertificate(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${application?.certificateNo || application?.applicationNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download certificate:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!application) return <p className="text-gov-error">Application not found</p>;

  const isApproved = application.status === 'APPROVED' || application.status === 'COMPLETED';

  const progressPercent = {
    DRAFT: 10, SUBMITTED: 25, UNDER_REVIEW: 50, APPROVED: 100, COMPLETED: 100, REJECTED: 100,
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

      {/* Official Certificate Download Banner */}
      {isApproved && (
        <div className="mb-6 p-5 rounded-lg border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-600 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500 text-white rounded-full flex-shrink-0 mt-0.5">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-200">
                Official Certificate Issued!
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                Certificate No: <span className="font-mono font-semibold">{application.certificateNo}</span>
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Your application has been approved by the Government Officer. You can download your official PDF certificate below.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
            <Button
              onClick={handleDownloadCertificate}
              disabled={downloading}
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Downloading PDF...' : 'Download Certificate (PDF)'}
            </Button>
            {application.certificateNo && (
              <a
                href={`/verify/${application.certificateNo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 rounded-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Verify Certificate
              </a>
            )}
          </div>
        </div>
      )}

      <div className="gov-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gov-text dark:text-white">Application Progress</span>
          <span className="text-sm font-bold text-gov-blue">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-gov-border dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${application.status === 'REJECTED' ? 'bg-gov-error' : 'bg-emerald-500'}`}
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
                <img src={application.qrCode} alt="Certificate verification QR code" className="w-36 h-36 border border-gov-border rounded-md p-2 bg-white" />
                <p className="text-xs text-gov-muted mt-3 text-center">Scan to verify certificate authenticity online</p>
                <Button
                  onClick={handleDownloadCertificate}
                  disabled={downloading}
                  size="sm"
                  className="mt-4 w-full flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  {downloading ? 'Downloading...' : 'Download PDF'}
                </Button>
              </div>
            </Card>
          )}

          <Card
            title="Uploaded Documents"
            subtitle={canVerifyDocuments ? 'Review and verify citizen documents' : undefined}
          >
            <DocumentReviewList
              documents={application.documents || []}
              canVerify={canVerifyDocuments}
              onVerified={handleDocumentVerified}
            />
          </Card>
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
