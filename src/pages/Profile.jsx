import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import { useTranslation, languageNames } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import { PlayCircle } from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAuthChecking, updateProfile, setLanguage } = useAuthStore();
  const { restartTour } = useOnboarding();
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [mpinData, setMpinData] = useState({
    currentMpin: '',
    newMpin: '',
    confirmMpin: '',
  });

  if (isAuthChecking) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  const handleProfileUpdate = () => {
    if (formData.fullName.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    updateProfile({
      fullName: formData.fullName,
      email: formData.email || undefined,
    });
    toast.success('Profile updated successfully');
  };
  const handleMpinChange = () => {
    if (mpinData.currentMpin !== user.mpin) {
      toast.error('Current MPIN is incorrect');
      return;
    }
    if (!/^\d{4,6}$/.test(mpinData.newMpin)) {
      toast.error('New MPIN must be 4-6 digits');
      return;
    }
    if (mpinData.newMpin !== mpinData.confirmMpin) {
      toast.error('MPINs do not match');
      return;
    }
    updateProfile({ mpin: mpinData.newMpin });
    setMpinData({ currentMpin: '', newMpin: '', confirmMpin: '' });
    toast.success('MPIN changed successfully');
  };
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    toast.success(`Language changed to ${languageNames[lang]}`);
  };
  return (<Layout>
    <div className="container py-6 md:py-10 max-w-2xl">
      <div className="mb-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('profile')}
        </h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button variant={activeSection === 'profile' ? 'default' : 'secondary'} onClick={() => setActiveSection('profile')} className="gap-2">
          <User className="h-4 w-4" />
          {t('editProfile')}
        </Button>
        <Button variant={activeSection === 'mpin' ? 'default' : 'secondary'} onClick={() => setActiveSection('mpin')} className="gap-2">
          <Lock className="h-4 w-4" />
          {t('changeMpin')}
        </Button>
        <Button variant={activeSection === 'language' ? 'default' : 'secondary'} onClick={() => setActiveSection('language')} className="gap-2">
          <Globe className="h-4 w-4" />
          {t('languagePreference')}
        </Button>
      </div>

      {/* Profile Section */}
      {activeSection === 'profile' && (<Card>
        <CardHeader>
          <CardTitle>{t('editProfile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('fullName')}
            </label>
            <Input value={formData.fullName} onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Enter full name" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('mobileNumber')}
            </label>
            <Input value={user.mobile} readOnly className="bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">
              Mobile number cannot be changed
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('email')}
            </label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" />
          </div>

          <Button onClick={handleProfileUpdate} className="w-full">
            {t('save')} Changes
          </Button>
        </CardContent>
      </Card>)}

      {/* MPIN Section */}
      {activeSection === 'mpin' && (<Card>
        <CardHeader>
          <CardTitle>{t('changeMpin')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Current MPIN
            </label>
            <Input type="password" value={mpinData.currentMpin} onChange={(e) => setMpinData((prev) => ({ ...prev, currentMpin: e.target.value }))} placeholder="Enter current MPIN" maxLength={6} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              New MPIN
            </label>
            <Input type="password" value={mpinData.newMpin} onChange={(e) => setMpinData((prev) => ({ ...prev, newMpin: e.target.value }))} placeholder="4-6 digit new MPIN" maxLength={6} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Confirm New MPIN
            </label>
            <Input type="password" value={mpinData.confirmMpin} onChange={(e) => setMpinData((prev) => ({ ...prev, confirmMpin: e.target.value }))} placeholder="Confirm new MPIN" maxLength={6} />
          </div>

          <Button onClick={handleMpinChange} className="w-full">
            {t('changeMpin')}
          </Button>
        </CardContent>
      </Card>)}

      {/* Language Section */}
      {activeSection === 'language' && (<Card>
        <CardHeader>
          <CardTitle>{t('languagePreference')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.keys(languageNames).map((lang) => (<button key={lang} onClick={() => handleLanguageChange(lang)} className={`w-full p-4 rounded-lg border-2 text-left transition-all ${user.language === lang
            ? 'border-primary bg-primary/5'
            : 'border-input hover:border-primary/50'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {languageNames[lang]}
              </span>
              {user.language === lang && (<span className="text-primary text-sm font-medium">✓ Selected</span>)}
            </div>
          </button>))}
        </CardContent>
      </Card>)}
    </div>
  </Layout>);
};
export default Profile;
