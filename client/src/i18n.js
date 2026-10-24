import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import faTranslation from './locales/fa.json';

const SUPPORTED_LOCALES = ['en', 'fa'];
const DEFAULT_LOCALE = 'en';

// Determine initial locale from storage or user preference
const getInitialLocale = () => {
  try {
    const saved = localStorage.getItem('preferredLocale') || localStorage.getItem('i18nextLng');
    if (saved && SUPPORTED_LOCALES.includes(saved)) {
      return saved;
    }
    // Also inspect stored user object if available
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.preferredLocale && SUPPORTED_LOCALES.includes(user.preferredLocale)) {
        return user.preferredLocale;
      }
    }
  } catch {
    // Fall back safely
  }
  return DEFAULT_LOCALE;
};

const initialLocale = getInitialLocale();

// Set initial document attributes immediately to prevent hydration or render flicker
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLocale;
  document.documentElement.dir = initialLocale === 'fa' ? 'rtl' : 'ltr';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      fa: { translation: faTranslation },
    },
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'preferredLocale',
      caches: ['localStorage'],
    },
  });

// Synchronize document direction and language on runtime language change
i18n.on('languageChanged', (lng) => {
  const safeLng = SUPPORTED_LOCALES.includes(lng) ? lng : DEFAULT_LOCALE;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = safeLng;
    document.documentElement.dir = safeLng === 'fa' ? 'rtl' : 'ltr';
  }
  try {
    localStorage.setItem('preferredLocale', safeLng);
  } catch {
    // ignore local storage errors
  }
});

export default i18n;
