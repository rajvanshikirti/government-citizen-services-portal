import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, UserPlus } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatAadhaar, getAadhaarValidationError, isValidAadhaar } from '../utils/aadhaar';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', aadhaarNumber: '' });
  const [aadhaarError, setAadhaarError] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhaar(e.target.value);
    setForm((prev) => ({ ...prev, aadhaarNumber: formatted }));
    setAadhaarVerified(false);
    if (!formatted) { setAadhaarError(''); return; }
    const err = getAadhaarValidationError(formatted);
    setAadhaarError(err || '');
    setAadhaarVerified(!err && isValidAadhaar(formatted));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.aadhaarNumber) {
      const err = getAadhaarValidationError(form.aadhaarNumber);
      if (err) { setAadhaarError(err); return; }
    }
    setIsLoading(true);
    try {
      await register({
        email: form.email, password: form.password,
        firstName: form.firstName, lastName: form.lastName,
        phone: form.phone || undefined,
        aadhaarNumber: form.aadhaarNumber ? form.aadhaarNumber.replace(/\s/g, '') : undefined,
      });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fade-in py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gov-green rounded-md flex items-center justify-center mx-auto mb-4 shadow-gov">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gov-text dark:text-white">{t('register')}</h1>
          <p className="text-gov-muted mt-2 text-sm">Create your official citizen account</p>
        </div>

        <div className="gov-card p-6 md:p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-md text-gov-error text-sm" role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" value={form.firstName} onChange={handleChange('firstName')} required floating />
              <Input label="Last Name" value={form.lastName} onChange={handleChange('lastName')} required floating />
            </div>
            <Input label="Email Address" type="email" value={form.email} onChange={handleChange('email')} required floating />
            <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} required helperText="Min 8 chars, uppercase, lowercase, number" floating />
            <Input label="Mobile Number" value={form.phone} onChange={handleChange('phone')} placeholder="10-digit number" floating />
            <div>
              <Input label="Aadhaar Number" value={form.aadhaarNumber} onChange={handleAadhaarChange} placeholder="XXXX XXXX XXXX" inputMode="numeric" maxLength={14} error={aadhaarError} floating />
              {aadhaarVerified && !aadhaarError && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-gov-success font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Aadhaar verified
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>{t('register')}</Button>
          </form>

          <p className="text-center text-sm text-gov-muted mt-6">
            Already registered? <Link to="/login" className="text-gov-blue font-semibold hover:underline">{t('login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
