import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './locales/en.json';
import translationVI from './locales/vi.json';

const resources = {
  en: translationEN,
  vi: translationVI
};

i18n
  .use(LanguageDetector) // Tự động nhận diện ngôn ngữ
  .use(initReactI18next) // Kết nối với React
  .init({
    resources,
    fallbackLng: 'vi', // Ngôn ngữ mặc định nếu không phát hiện được
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;