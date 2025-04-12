'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import {
  loginUser,
  logoutUser,
  registerUser,
  isAdmin as checkIsAdmin,
} from '../auth';
import { AuthContextType } from '@/types';

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component that wraps the app
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Log auth state for debugging
  useEffect(() => {
    console.log('Auth state:', {
      user: user?.email || null,
      loading,
      error,
      isAuthReady,
    });

    // Mark auth as ready when loading completes (either with user or without)
    if (!loading) {
      setIsAuthReady(true);
    }
  }, [user, loading, error, isAuthReady]);

  // Check if user is admin whenever user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await checkIsAdmin(user);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  // Login function - returning promise to allow better error handling
  const login = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function - returning promise to allow better error handling
  const register = async (email: string, password: string) => {
    try {
      const result = await registerUser(email, password);
      return result;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Value object for the context provider
  const value: AuthContextType = {
    user: user as User | null,
    isAdmin,
    loading: loading || !isAuthReady,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
