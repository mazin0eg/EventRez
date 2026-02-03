'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, authApi, userApi, setToken, removeToken, getToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const userData = await userApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      removeToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Check if user is already logged in on mount
    const initAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authApi.login({ email, password });
    setToken(response.access_token);
    // Fetch user data after login
    const userData = await userApi.getMe();
    setUser(userData);
    return userData;
  };

  const register = async (email: string, password: string) => {
    const response = await authApi.register({ email, password });
    setToken(response.access_token);
    // Fetch user data after registration
    const userData = await userApi.getMe();
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
