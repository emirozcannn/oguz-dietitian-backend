import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import trTranslations from './translations/tr.json';
import enTranslations from './translations/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: {
        translation: trTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    lng: 'tr', // default language
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
