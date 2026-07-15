import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Clock, IndianRupee, FileText, CheckCircle } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { StepWizard } from '../components/common/Timeline';
import { LoadingSpinner } from '../components/common/Badge';
import { ServiceIcon } from '../utils/serviceIcons';
import { servicesApi, applicationsApi, documentsApi } from '../services/endpoints';
import type { GovernmentService } from '../types';
import { formatCurrency } from '../utils/helpers';

const WIZARD_STEPS = ['Personal Details', 'Documents', 'Review & Submit'];

export default function ApplyServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<GovernmentService | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (slug) {
      servicesApi.getBySlug(slug)
        .then((res) => setService(res.data.data))
        .catch(() => setError('Service not found'))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!service) return;
    setSubmitting(true);
    setError('');
    try {
      const appRes = await applicationsApi.create({ serviceId: service.id, formData });
      const applicationId = appRes.data.data.id;
      for (const file of files) await documentsApi.upload(file, applicationId);
      await applicationsApi.submit(applicationId);
      navigate(`/applications/${applicationId}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!service) return <p className="text-gov-error text-center py-12">{error || 'Service not found'}</p>;

  const formFields = getFormFields(service.slug);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        title={`Apply for ${service.name}`}
        subtitle="Complete the application form and upload required documents"
        breadcrumbs={[{ label: 'Services', href: '/services' }, { label: service.name }]}
        badge={
          <div className="flex items-center gap-2">
            <ServiceIcon slug={service.slug} className="w-5 h-5 text-gov-blue" />
          </div>
        }
      />

      {/* Service info strip */}
      <div className="gov-card p-4 mb-6 flex flex-wrap gap-6 text-sm">
        <span className="flex items-center gap-2 text-gov-muted"><Clock className="w-4 h-4 text-gov-blue" /> {service.processingDays} days processing</span>
        <span className="flex items-center gap-2 text-gov-muted"><IndianRupee className="w-4 h-4 text-gov-blue" /> {service.fee > 0 ? formatCurrency(service.fee) : 'Free'}</span>
        <span className="flex items-center gap-2 text-gov-muted"><FileText className="w-4 h-4 text-gov-blue" /> {service.category}</span>
      </div>

      <StepWizard steps={WIZARD_STEPS} currentStep={step} />

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-md text-gov-error text-sm" role="alert">{error}</div>
        )}

        {step === 0 && (
          <Card title="Personal & Application Details" className="mb-6">
            <div className="space-y-4">
              {formFields.map((field) =>
                field.type === 'textarea' ? (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-gov-text dark:text-slate-200 mb-1.5">{field.label}</label>
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={handleChange(field.name)}
                      required={field.required}
                      rows={3}
                      className="gov-input resize-none"
                    />
                  </div>
                ) : (
                  <Input key={field.name} label={field.label} type={field.type} value={formData[field.name] || ''} onChange={handleChange(field.name)} required={field.required} floating />
                )
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => setStep(1)}>Continue to Documents</Button>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card title="Required Documents" subtitle="Upload supporting documents in PDF, JPEG, or PNG format" className="mb-6">
            <ul className="mb-5 space-y-2">
              {service.requiredDocs.map((doc) => (
                <li key={doc} className="flex items-center gap-2 text-sm text-gov-muted">
                  <CheckCircle className="w-4 h-4 text-gov-green flex-shrink-0" /> {doc}
                </li>
              ))}
            </ul>
            <div className="border-2 border-dashed border-gov-border dark:border-slate-600 rounded-md p-8 text-center hover:border-gov-blue/50 transition-colors">
              <Upload className="w-10 h-10 text-gov-muted mx-auto mb-3" />
              <p className="text-sm font-medium text-gov-text dark:text-slate-200 mb-1">Upload Documents</p>
              <p className="text-xs text-gov-muted mb-4">PDF, JPEG, PNG — Max 5MB per file</p>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="text-sm" aria-label="Upload documents" />
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((f) => (
                    <p key={f.name} className="text-sm text-gov-success font-medium">{f.name}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button type="button" onClick={() => setStep(2)}>Review Application</Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card title="Review & Submit" className="mb-6">
            <dl className="divide-y divide-gov-border dark:divide-slate-700 mb-6">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 text-sm">
                  <dt className="text-gov-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                  <dd className="font-medium text-gov-text">{value}</dd>
                </div>
              ))}
              <div className="flex justify-between py-3 text-sm">
                <dt className="text-gov-muted">Documents</dt>
                <dd className="font-medium text-gov-text">{files.length} file(s) attached</dd>
              </div>
            </dl>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" isLoading={submitting}>Submit Application</Button>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}

function getFormFields(slug: string) {
  const common = [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true },
    { name: 'fatherName', label: "Father's Name", type: 'text', required: true },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
    { name: 'address', label: 'Address', type: 'textarea', required: true },
    { name: 'pincode', label: 'Pincode', type: 'text', required: true },
  ];
  const specific: Record<string, typeof common> = {
    'property-tax': [
      { name: 'propertyId', label: 'Property ID', type: 'text', required: true },
      { name: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      { name: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
      { name: 'taxYear', label: 'Tax Year', type: 'text', required: true },
    ],
    'water-connection': [
      { name: 'connectionType', label: 'Connection Type', type: 'text', required: true },
      { name: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
      { name: 'meterSize', label: 'Meter Size', type: 'text', required: true },
    ],
    'electricity-connection': [
      { name: 'connectionType', label: 'Connection Type', type: 'text', required: true },
      { name: 'loadRequired', label: 'Load Required (kW)', type: 'text', required: true },
      { name: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
    ],
    'driving-licence-renewal': [
      { name: 'licenceNumber', label: 'Licence Number', type: 'text', required: true },
      { name: 'expiryDate', label: 'Current Expiry Date', type: 'date', required: true },
      { name: 'vehicleClass', label: 'Vehicle Class', type: 'text', required: true },
    ],
  };
  return specific[slug] || common;
}
