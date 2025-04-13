'use client';

import React, { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  Box,
} from '@mui/material';
import Navbar from '@/app/components/Navbar';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { LanguageProvider } from '@/lib/contexts/LanguageContext';
import useEnsureLanguage from '@/lib/i18n/ensure-language';

// Import i18n configuration
import '@/lib/i18n/i18n';

const inter = Inter({ subsets: ['latin'] });

// Create a custom MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#00838f',
    },
    secondary: {
      main: '#ff6d00',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

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
  // to avoid hydration mismatch errors with authentication
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LanguageSynchronizer>
            <Navbar />
            <main
              className='container'
              style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}
            >
              {!isHydrated ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                children
              )}
            </main>
          </LanguageSynchronizer>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
