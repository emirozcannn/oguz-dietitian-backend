import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import trTranslations from './i18n/translations/tr.json';
import enTranslations from './i18n/translations/en.json';

const resources = {
  tr: {
    translation: trTranslations
  },
  en: {
    translation: enTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
