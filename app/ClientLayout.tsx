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
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/lib/contexts/AuthContext';

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
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
      </ThemeProvider>
    </AuthProvider>
  );
}
