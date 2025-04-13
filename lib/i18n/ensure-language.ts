// This script ensures language initialization happens properly
// It runs on the client side to make sure language selection is maintained

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export const useEnsureLanguage = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    // Check if the language in i18n matches what we have in context
    const currentI18nLang = i18n.language.substring(0, 2);
    if (currentI18nLang !== language) {
      console.log(
        `Syncing language: i18n=${currentI18nLang}, context=${language}`
      );

      // If there's a mismatch, update our context with what i18n has
      // (since i18n manages the localStorage)
      if (currentI18nLang === 'en' || currentI18nLang === 'ar') {
        setLanguage(currentI18nLang as 'en' | 'ar');
      } else {
        // Default to English if there's an unknown language code
        setLanguage('en');
      }
    }
  }, [i18n.language, language, setLanguage]);
};

export default useEnsureLanguage;
