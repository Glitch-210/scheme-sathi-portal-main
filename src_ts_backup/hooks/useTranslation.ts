import { useAuthStore } from '@/lib/store';
import { translations, Language } from '@/lib/translations';

export const useTranslation = () => {
  const { language } = useAuthStore();
  
  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };
  
  const setLanguage = useAuthStore((state) => state.setLanguage);
  
  return { t, language, setLanguage };
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  bn: 'বাংলা',
  mr: 'मराठी',
  pa: 'ਪੰਜਾਬੀ',
  or: 'ଓଡ଼ିଆ',
  as: 'অসমীয়া',
  ur: 'اردو',
};
