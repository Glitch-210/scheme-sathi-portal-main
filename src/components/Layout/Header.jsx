import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { useTranslation, languageNames } from '@/hooks/useTranslation';
import VoiceSearchInput from '@/components/VoiceSearchInput';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setIsLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 h-[72px] flex items-center transition-all duration-300">
      <div className="container flex h-full items-center justify-between gap-4">

        {/* Zone 1: Logo & Main Navigation */}
        <div className="flex items-center gap-8 lg:gap-10">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-lg shadow-primary/20">
              <span className="text-xl font-bold text-primary-foreground">स</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">{t('appName')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {isAuthenticated && (
              <>
                <Link to="/dashboard" id="dashboard-link" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                  {t('dashboard')}
                </Link>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                  {t('services')}
                </Link>
                <Link to="/eligibility" id="eligibility-link" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                  Check Eligibility
                </Link>
                <Link to="/applications" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                  {t('myApplications')}
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Zone 2: Search (Central Area) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6 transition-all duration-300" id="voice-search-input">
          <VoiceSearchInput className="w-full" />
        </div>

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-3 lg:gap-4">

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-border/60 mx-1"></div>

          {/* Language Selector */}
          <div className="relative hidden sm:block" id="language-selector">
            <Button variant="ghost" size="sm" onClick={() => setIsLangOpen(!isLangOpen)} className="gap-2 px-2 hover:bg-muted/60">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{languageNames[language]}</span>
            </Button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card border shadow-xl py-1 ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-200">
                {Object.keys(languageNames).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full px-4 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors ${language === lang ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
                      }`}
                  >
                    {languageNames[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 lg:gap-3">
              <NotificationBell />

              <Link to="/profile" className="hidden md:block">
                <Button variant="ghost" size="icon" className="group relative hover:bg-primary/10 transition-colors">
                  <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hidden md:flex hover:bg-destructive/10 hover:text-destructive transition-colors"
                title={t('logout')}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="font-medium hover:bg-primary/5 hover:text-primary">{t('login')}</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="px-5 shadow-md shadow-primary/20">{t('register')}</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden -mr-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 w-full border-t bg-card/95 backdrop-blur-lg shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="container py-4 flex flex-col gap-1.5">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-3 text-sm font-medium text-muted-foreground border-b mb-2">
                  {t('welcomeBack')}, <span className="text-foreground">{user?.fullName}</span>
                </div>

                <Link to="/dashboard" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                  {t('dashboard')}
                </Link>
                <Link to="/services" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                  {t('services')}
                </Link>
                <Link to="/eligibility" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                  Check Eligibility
                </Link>
                <Link to="/applications" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                  {t('myApplications')}
                </Link>
                <Link to="/notifications" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                  {t('notifications')}
                </Link>
                <Link to="/profile" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                  {t('profile')}
                </Link>

                <div className="h-px bg-border my-2 mx-4" />

                <button onClick={handleLogout} className="mobile-nav-item text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout')}
                </button>
              </>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">{t('login')}</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center shadow-lg shadow-primary/20">{t('register')}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      <style>{`
        .mobile-nav-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          margin: 0 0.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          color: hsl(var(--foreground));
          transition: all 0.2s;
        }
        .mobile-nav-item:hover {
          background-color: hsl(var(--muted));
          transform: translateX(4px);
        }
      `}</style>
    </header>
  );
};

export default Header;
