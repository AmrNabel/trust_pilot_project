'use client';

import React, { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import Navbar from '@/app/components/Navbar';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { LanguageProvider } from '@/lib/contexts/LanguageContext';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import useEnsureLanguage from '@/lib/i18n/ensure-language';
import { useTranslation } from 'react-i18next';
import I18nInitializer from '@/lib/components/I18nInitializer';

// Import i18n configuration
import '@/lib/i18n/i18n';

const inter = Inter({ subsets: ['latin'] });

// Language sync component
const LanguageSynchronizer = ({ children }: { children: React.ReactNode }) => {
  useEnsureLanguage();
  return <>{children}</>;
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);

  // This effect ensures the app doesn't render until hydration is complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show loading until hydration is complete
  if (!isHydrated) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <CssBaseline />
          <I18nInitializer>
            <LanguageSynchronizer>
              <Navbar />
              <main
                className='container'
                style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}
              >
                {children}
              </main>
            </LanguageSynchronizer>
          </I18nInitializer>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
