import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

// Define types
type Direction = 'ltr' | 'rtl';
type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  isInitialized: boolean;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Create cache for styling
const createDirectionCache = (direction: Direction) => {
  return createCache({
    key: `mui-${direction}`,
    stylisPlugins: direction === 'rtl' ? [prefixer, rtlPlugin] : [prefixer],
    prepend: true,
  });
};

// Cache instances
const ltrCache = createDirectionCache('ltr');
const rtlCache = createDirectionCache('rtl');

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>('en');
  const [direction, setDirection] = useState<Direction>('ltr');
  const [cache, setCache] = useState(ltrCache);
  const [isInitialized, setIsInitialized] = useState(false);
  // Track if component is mounted to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initial setup - only run in browser and after mounting
  useEffect(() => {
    if (isBrowser && isMounted) {
      // Use a timeout to ensure this happens after hydration
      const timer = setTimeout(() => {
        const savedLanguage = localStorage.getItem('i18nextLng');
        if (savedLanguage) {
          const lang = savedLanguage.substring(0, 2) as Language;
          if (lang === 'en' || lang === 'ar') {
            setLanguage(lang);
          } else {
            setLanguage('en');
          }
        } else {
          // Default to English if no language is set
          setLanguage('en');
        }
        setIsInitialized(true);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  // Set language and direction
  const setLanguage = (lang: Language) => {
    // Only make changes in the browser
    if (!isBrowser) return;

    setLanguageState(lang);
    i18n.changeLanguage(lang);

    // Update direction based on language
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    setDirection(dir);
    setCache(dir === 'rtl' ? rtlCache : ltrCache);

    // Set HTML dir attribute
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  // Toggle between languages
  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        toggleLanguage,
        setLanguage,
        isInitialized,
      }}
    >
      <CacheProvider value={cache}>{children}</CacheProvider>
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
