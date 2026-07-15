import { useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { authApi } from '../services/endpoints';
import { getInitials } from '../utils/helpers';
import { maskAadhaar } from '../utils/aadhaar';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '', address: user?.address || '',
    city: user?.city || '', state: user?.state || '', pincode: user?.pincode || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.data.data);
      setMessage('Profile updated successfully');
    } catch {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader title={t('profile')} subtitle="Manage your citizen account information" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: t('profile') }]} />

      <div className="gov-card p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-gov-blue rounded-md flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {getInitials(user.firstName, user.lastName)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gov-text dark:text-white">{user.firstName} {user.lastName}</h2>
          <p className="text-sm text-gov-muted">{user.email}</p>
          <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide bg-gov-green-light text-gov-green dark:bg-gov-green/20 dark:text-green-300 rounded">
            {user.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Personal Information" subtitle="Update your contact and address details">
          {message && (
            <div className={`mb-5 p-3 rounded-md text-sm border ${message.includes('success') ? 'bg-gov-green-light border-gov-green/20 text-gov-success' : 'bg-red-50 border-red-200 text-gov-error'}`}>
              {message}
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" value={form.firstName} onChange={handleChange('firstName')} required floating />
              <Input label="Last Name" value={form.lastName} onChange={handleChange('lastName')} required floating />
            </div>
            <Input label="Email Address" value={user.email} disabled />
            <Input label="Mobile Number" value={form.phone} onChange={handleChange('phone')} floating />
            <Input label="Aadhaar Number" value={user.aadhaarNumber ? maskAadhaar(user.aadhaarNumber) : 'Not provided'} disabled />
            <Input label="Address" value={form.address} onChange={handleChange('address')} floating />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="City" value={form.city} onChange={handleChange('city')} floating />
              <Input label="State" value={form.state} onChange={handleChange('state')} floating />
              <Input label="Pincode" value={form.pincode} onChange={handleChange('pincode')} floating />
            </div>
          </div>
          <div className="mt-6">
            <Button type="submit" isLoading={saving}><Save className="w-4 h-4 mr-2" />{t('save')}</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
