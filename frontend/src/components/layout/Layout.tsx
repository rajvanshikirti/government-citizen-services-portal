import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  Shield,
  BarChart3,
  Users,
  ClipboardList,
  Search,
  Type,
  Minus,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getInitials } from '../../utils/helpers';
import type { TranslationKey } from '../../i18n/translations';
import { notificationsApi } from '../../services/endpoints';

function GovLogo() {
  return (
    <div className="flex items-center gap-3" aria-label="Government of India">
      <div className="w-10 h-10 rounded-md bg-gov-blue flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor" aria-hidden="true">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.08 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z" />
        </svg>
      </div>
      <div className="hidden sm:block leading-tight">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gov-muted">Government of India</p>
        <p className="text-sm font-bold text-gov-blue dark:text-blue-300">Citizen Services Portal</p>
      </div>
    </div>
  );
}

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi.getUnreadCount()
        .then((res) => setUnreadCount(res.data.data.count))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
  }, [fontScale]);

  const navLinks = isAuthenticated
    ? getNavLinks(user?.role || 'CITIZEN', t)
    : [
        { to: '/', label: t('home'), icon: LayoutDashboard },
        { to: '/services', label: t('services'), icon: FileText },
        { to: '/verify', label: t('verifyCertificate'), icon: Shield },
      ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gov-border dark:border-slate-700 shadow-gov">
      <div className="gov-tricolor" role="presentation" />
      
      {/* Top utility bar */}
      <div className="bg-gov-bg dark:bg-slate-950 border-b border-gov-border dark:border-slate-800">
        <div className="gov-container flex items-center justify-between h-8 text-xs text-gov-muted">
          <span className="hidden md:inline">भारत सरकार | Government of India</span>
          <div className="flex items-center gap-1 ml-auto">
            <div className="flex items-center border border-gov-border dark:border-slate-700 rounded-md overflow-hidden" role="group" aria-label="Font size controls">
              <button onClick={() => setFontScale((s) => Math.max(0.875, s - 0.0625))} className="px-2 py-0.5 hover:bg-white dark:hover:bg-slate-800" aria-label="Decrease font size">
                <Minus className="w-3 h-3" />
              </button>
              <button onClick={() => setFontScale(1)} className="px-2 py-0.5 hover:bg-white dark:hover:bg-slate-800 border-x border-gov-border dark:border-slate-700" aria-label="Reset font size">
                <Type className="w-3 h-3" />
              </button>
              <button onClick={() => setFontScale((s) => Math.min(1.25, s + 0.0625))} className="px-2 py-0.5 hover:bg-white dark:hover:bg-slate-800" aria-label="Increase font size">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button onClick={toggleTheme} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 ml-1" aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}>
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-800 font-semibold"
              aria-label={t('language')}
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'en' ? 'हिंदी' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="gov-container">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex-shrink-0">
            <GovLogo />
          </Link>

          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-6" role="search">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gov-muted" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search government services..."
                className="gov-input pl-10 py-2 text-sm"
                aria-label="Search government services"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            {isAuthenticated && user && (
              <>
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-md hover:bg-gov-bg dark:hover:bg-slate-800 transition-colors"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                  <Bell className="w-5 h-5 text-gov-text dark:text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gov-saffron text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="hidden md:flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gov-bg dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gov-blue rounded-md flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-semibold text-gov-text dark:text-white leading-tight">{user.firstName}</p>
                    <p className="text-xs text-gov-muted">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gov-muted hidden xl:block" />
                </Link>
                <button
                  onClick={logout}
                  className="hidden md:flex p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gov-error transition-colors"
                  aria-label={t('logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <span className="px-4 py-2 text-sm font-semibold text-gov-blue hover:text-gov-blue-dark transition-colors">
                    {t('login')}
                  </span>
                </Link>
                <Link to="/register">
                  <span className="px-4 py-2 text-sm font-semibold bg-gov-blue text-white rounded-md hover:bg-gov-blue-dark transition-colors shadow-sm">
                    {t('register')}
                  </span>
                </Link>
              </div>
            )}

            <button
              className="lg:hidden p-2 rounded-md hover:bg-gov-bg dark:hover:bg-slate-800"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="border-t border-gov-border dark:border-slate-700 bg-gov-blue dark:bg-gov-blue-dark" aria-label="Main navigation">
        <div className="gov-container">
          <div className="hidden lg:flex items-center gap-1 h-11 overflow-x-auto">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} label={link.label} />
            ))}
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gov-border dark:border-slate-700 bg-white dark:bg-slate-900 animate-slide-up">
          <form onSubmit={handleSearch} className="p-4 border-b border-gov-border dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gov-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="gov-input pl-10"
              />
            </div>
          </form>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gov-text dark:text-slate-200 hover:bg-gov-bg dark:hover:bg-slate-800 border-b border-gov-border/50 dark:border-slate-800"
              onClick={() => setMobileOpen(false)}
            >
              <link.icon className="w-4 h-4 text-gov-blue" />
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="p-4 flex gap-2">
              <Link to="/login" className="flex-1 text-center py-2 text-sm font-semibold border border-gov-blue text-gov-blue rounded-md" onClick={() => setMobileOpen(false)}>{t('login')}</Link>
              <Link to="/register" className="flex-1 text-center py-2 text-sm font-semibold bg-gov-blue text-white rounded-md" onClick={() => setMobileOpen(false)}>{t('register')}</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(`${to}/`) || location.pathname.startsWith(`${to}?`));

  return (
    <Link
      to={to}
      className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
        isActive
          ? 'text-white border-gov-saffron bg-white/10'
          : 'text-blue-100 border-transparent hover:text-white hover:bg-white/5'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </Link>
  );
}

function getNavLinks(role: string, t: (key: TranslationKey) => string) {
  const base = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/services', label: t('services'), icon: FileText },
  ];

  if (role === 'CITIZEN') {
    return [...base,
      { to: '/applications', label: t('applications'), icon: ClipboardList },
      { to: '/notifications', label: t('notifications'), icon: Bell },
      { to: '/verify', label: t('verifyCertificate'), icon: Shield },
    ];
  }
  if (role === 'OFFICER') {
    return [...base,
      { to: '/officer', label: 'Officer Panel', icon: ClipboardList },
      { to: '/reports', label: t('reports'), icon: BarChart3 },
      { to: '/notifications', label: t('notifications'), icon: Bell },
    ];
  }
  return [...base,
    { to: '/admin', label: 'Admin Panel', icon: Users },
    { to: '/officer', label: 'Officer Panel', icon: ClipboardList },
    { to: '/reports', label: t('reports'), icon: BarChart3 },
    { to: '/notifications', label: t('notifications'), icon: Bell },
  ];
}

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto bg-gov-blue-dark text-blue-100">
      <div className="gov-tricolor" role="presentation" />
      <div className="gov-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <GovLogo />
            <p className="text-sm text-blue-200/80 mt-4 max-w-md leading-relaxed">
              Official digital platform for accessing government services online. Apply for certificates, track applications, and verify documents securely.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/services" className="hover:text-white transition-colors">{t('services')}</Link></li>
              <li><Link to="/verify" className="hover:text-white transition-colors">{t('verifyCertificate')}</Link></li>
              <li><Link to="/applications" className="hover:text-white transition-colors">{t('applications')}</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">{t('login')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">{t('contact')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li>Helpline: 1800-XXX-XXXX</li>
              <li>Email: support@govportal.gov</li>
              <li>Hours: Mon–Sat, 9 AM – 6 PM</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/60">
          <p>&copy; {new Date().getFullYear()} Government of India. All rights reserved.</p>
          <p>Designed &amp; Developed for Citizen Services</p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children, fullWidth }: { children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-gov-bg dark:bg-slate-950">
      <Navbar />
      <main className={`flex-1 py-8 ${fullWidth ? '' : 'gov-container'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
