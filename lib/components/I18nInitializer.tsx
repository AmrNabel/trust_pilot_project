'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress } from '@mui/material';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface I18nInitializerProps {
  children: ReactNode;
}

export default function I18nInitializer({ children }: I18nInitializerProps) {
  const { i18n } = useTranslation();
  const { isInitialized } = useLanguage();
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClientSide(true);
  }, []);

  // Wait for both client-side rendering and i18n initialization
  if (!isClientSide || !isInitialized || !i18n.isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
