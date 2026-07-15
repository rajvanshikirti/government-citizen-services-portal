import { useState } from 'react';
import { Shield, CheckCircle, XCircle, Search } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { applicationsApi } from '../services/endpoints';
import { formatDate } from '../utils/helpers';

interface VerificationResult {
  valid: boolean;
  certificateNo: string;
  applicationNo: string;
  serviceName: string;
  citizenName: string;
  issuedDate: string;
}

export default function VerifyPage() {
  const { t } = useLanguage();
  const [certificateNo, setCertificateNo] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await applicationsApi.verifyCertificate(certificateNo.trim());
      setResult(res.data.data);
    } catch {
      setError('Certificate not found or invalid. Please verify the certificate number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <PageHeader
        title={t('verifyCertificate')}
        subtitle="Enter the certificate number to verify its authenticity with the Government database"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: t('verifyCertificate') }]}
      />

      <Card>
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gov-blue-light dark:bg-gov-blue/20 rounded-md flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-gov-blue" />
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="Certificate Number"
            value={certificateNo}
            onChange={(e) => setCertificateNo(e.target.value)}
            placeholder="CERT-2026-XXXXXXXX"
            required
            floating
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            <Search className="w-4 h-4 mr-2" /> Verify Certificate
          </Button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-md flex items-start gap-3" role="alert">
            <XCircle className="w-5 h-5 text-gov-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gov-error">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 border border-gov-green/30 bg-gov-green-light dark:bg-gov-green/10 rounded-md overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-gov-green/10 dark:bg-gov-green/20 border-b border-gov-green/20">
              <CheckCircle className="w-6 h-6 text-gov-success" />
              <p className="font-semibold text-gov-success">Certificate Verified Successfully</p>
            </div>
            <dl className="p-4 space-y-3 text-sm">
              {[
                ['Certificate No', result.certificateNo],
                ['Application No', result.applicationNo],
                ['Service', result.serviceName],
                ['Issued To', result.citizenName],
                ['Issue Date', result.issuedDate ? formatDate(result.issuedDate) : '-'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-gov-muted">{label}</dt>
                  <dd className="font-semibold text-gov-text dark:text-slate-200">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Card>
    </div>
  );
}
