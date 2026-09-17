import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, TokenResponse, ApiResponse } from '../types';
import { tokenStore } from './tokenStore';
import { client } from '../api/client';
import { refreshClient } from '../api/refreshClient';
import { ENDPOINTS } from '../api/endpoints';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string, role?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Re-hydrate session on app boot via HttpOnly refresh cookie
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await refreshClient.post<ApiResponse<TokenResponse>>(ENDPOINTS.AUTH.REFRESH);
      const { access_token, user: userData } = response.data.data;
      tokenStore.set(access_token);
      setUser(userData);
      return true;
    } catch {
      tokenStore.clear();
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    // Listen to 401 unrecoverable session expiry from Axios interceptor
    const handleUnauthorized = () => {
      tokenStore.clear();
      setUser(null);
    };

    window.addEventListener('docutrace:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('docutrace:unauthorized', handleUnauthorized);
  }, [refreshSession]);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await client.post<ApiResponse<TokenResponse>>(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    const { access_token, user: userData } = response.data.data;
    tokenStore.set(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role: string = 'member'
  ): Promise<User> => {
    const response = await client.post<ApiResponse<User>>(ENDPOINTS.AUTH.REGISTER, {
      full_name: fullName,
      email,
      password,
      role,
    });
    // Automatically log in after registration
    return login(email, password);
  };

  const logout = async (): Promise<void> => {
    try {
      await refreshClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore network failures on logout
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
