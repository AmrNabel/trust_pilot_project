'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  Theme,
  PaletteMode,
} from '@mui/material';
import { Inter } from 'next/font/google';

// Load Inter font
const inter = Inter({ subsets: ['latin'] });

// Define the theme context type
interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
  theme: Theme;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
  theme: createTheme(),
});

// Hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Use state to track the current theme mode
  const [mode, setMode] = useState<PaletteMode>('light');

  // Load saved theme from localStorage on initial render
  useEffect(() => {
    // Get the saved theme or use system preference
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme-mode');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setMode(savedTheme as PaletteMode);
      } else {
        // Check for system preference
        const prefersDarkMode = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        setMode(prefersDarkMode ? 'dark' : 'light');
      }
    };

    initializeTheme();

    // Listen for changes in system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no user preference is saved
      if (!localStorage.getItem('theme-mode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Function to toggle the theme
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  // Create a theme object based on current mode
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#00838f',
      },
      secondary: {
        main: '#ff6d00',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
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

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
