'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TranslatedTextProps {
  textKey: string;
  fallback?: string;
  children?: (text: string) => ReactNode;
}

export default function TranslatedText({
  textKey,
  fallback = '',
  children,
}: TranslatedTextProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Only render the translated text on the client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use the fallback on server or during hydration
  const text = mounted ? t(textKey) : fallback;

  // Render with the function children or as text
  return <>{children ? children(text) : text}</>;
}
