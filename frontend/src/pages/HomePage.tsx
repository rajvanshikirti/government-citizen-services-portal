import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Shield, Clock, ArrowRight, Megaphone,
  Search, Award, Users, CheckCircle,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ServiceCardCompact } from '../components/common/ServiceCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { servicesApi } from '../services/endpoints';
import type { GovernmentService } from '../types';

const ANNOUNCEMENTS = [
  { date: '15 Jul 2026', title: 'Digital certificate verification now available nationwide', type: 'info' },
  { date: '10 Jul 2026', title: 'Income certificate processing time reduced to 5 days', type: 'update' },
  { date: '01 Jul 2026', title: 'New water connection applications open for urban areas', type: 'scheme' },
];

const QUICK_SERVICES = [
  { label: 'Birth Certificate', slug: 'birth-certificate' },
  { label: 'Income Certificate', slug: 'income-certificate' },
  { label: 'Property Tax', slug: 'property-tax' },
  { label: 'Verify Certificate', href: '/verify' },
];

export default function HomePage() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [popularServices, setPopularServices] = useState<GovernmentService[]>([]);

  useEffect(() => {
    servicesApi.list({ limit: 4 }).then((res) => setPopularServices(res.data.data.data));
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/services${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gov-blue dark:bg-gov-blue-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gov-saffron rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="gov-container relative py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-gov-saffron text-sm font-semibold uppercase tracking-widest mb-3">भारत सरकार | Government of India</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight text-balance">
              {t('appName')}
            </h1>
            <p className="text-blue-100 text-lg mt-4 max-w-xl leading-relaxed">
              Access government services digitally. Apply for certificates, track applications, and verify documents — securely and transparently.
            </p>

            <form onSubmit={handleHeroSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl" role="search">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gov-muted" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Government Services..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-md text-gov-text text-base border-0 shadow-gov-lg focus:outline-none focus:ring-2 focus:ring-gov-saffron"
                  aria-label="Search government services"
                />
              </div>
              <Button type="submit" variant="secondary" size="lg" className="sm:flex-shrink-0">
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-3 mt-6">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="md" className="bg-white text-gov-blue hover:bg-blue-50">
                    {t('dashboard')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="md" className="bg-gov-saffron text-white hover:bg-orange-600 border-0">
                      Register as Citizen
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="md" className="border-white/40 text-white hover:bg-white/10">
                      {t('login')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="h-1 bg-gov-saffron" />
      </section>

      {/* Quick services */}
      <section className="gov-container -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_SERVICES.map((qs) => (
            <Link
              key={qs.label}
              to={qs.href || `/services/${qs.slug}/apply`}
              className="gov-card p-4 text-center hover:shadow-gov-md hover:border-gov-blue/40 transition-all duration-200 group"
            >
              <p className="text-sm font-semibold text-gov-text dark:text-white group-hover:text-gov-blue transition-colors">{qs.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="gov-container mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FileText, value: '8+', label: 'Government Services' },
            { icon: Users, value: '10K+', label: 'Registered Citizens' },
            { icon: CheckCircle, value: '95%', label: 'Satisfaction Rate' },
            { icon: Award, value: '24/7', label: 'Certificate Verification' },
          ].map((stat) => (
            <div key={stat.label} className="gov-card p-5 text-center">
              <stat.icon className="w-6 h-6 text-gov-blue mx-auto mb-2" aria-hidden="true" />
              <p className="text-2xl font-bold text-gov-blue">{stat.value}</p>
              <p className="text-xs text-gov-muted mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="gov-container mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular services */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="gov-section-title">Popular Services</h2>
            <Link to="/services" className="text-sm font-semibold text-gov-blue hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularServices.map((service) => (
              <ServiceCardCompact key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Announcements */}
        <section>
          <h2 className="gov-section-title mb-5 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-gov-saffron" /> Latest Updates
          </h2>
          <div className="gov-card divide-y divide-gov-border dark:divide-slate-700">
            {ANNOUNCEMENTS.map((ann) => (
              <div key={ann.title} className="p-4 hover:bg-gov-bg dark:hover:bg-slate-800/50 transition-colors">
                <p className="text-xs text-gov-muted font-medium">{ann.date}</p>
                <p className="text-sm font-medium text-gov-text dark:text-slate-200 mt-1 leading-snug">{ann.title}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Features */}
      <section className="gov-container mt-12 mb-4">
        <h2 className="gov-section-title text-center mb-8">Why Use This Portal?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: FileText, title: 'Digital Applications', desc: 'Apply for 8+ government services online without visiting offices' },
            { icon: Clock, title: 'Real-time Tracking', desc: 'Track your application status with timeline updates and notifications' },
            { icon: Shield, title: 'Secure Verification', desc: 'Verify certificates instantly using QR codes and certificate numbers' },
          ].map((f) => (
            <div key={f.title} className="gov-card p-6 text-center">
              <div className="w-12 h-12 rounded-md bg-gov-blue-light dark:bg-gov-blue/20 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-gov-blue" />
              </div>
              <h3 className="text-base font-semibold text-gov-text dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gov-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
