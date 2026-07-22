import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gov-blue rounded-md flex items-center justify-center mx-auto mb-4 shadow-gov">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gov-text dark:text-white">{t('login')}</h1>
          <p className="text-gov-muted mt-2 text-sm">Secure access to Government Citizen Services</p>
        </div>

        <div className="gov-card p-6 md:p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-gov-error text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" floating />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" floating />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t('login')}
            </Button>
          </form>

          <p className="text-center text-sm text-gov-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-gov-blue font-semibold hover:underline">{t('register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
