"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { User } from "@/types/kanban";
import { apiClient } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  signout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage keys
const TOKEN_KEY = "token";
const USER_KEY = "user_data";
const TOKEN_TIMESTAMP_KEY = "token_timestamp";

// Token validity period (7 days in milliseconds)
const TOKEN_VALIDITY_PERIOD = 7 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const extractUser = useCallback((payload: { user?: User } | User | undefined | null): User | null => {
    if (!payload) return null;
    if (typeof payload === "object" && "user" in payload) {
      const extracted = (payload as { user?: User }).user;
      return extracted ?? null;
    }
    return payload as User;
  }, []);

  // Check if token is still valid based on timestamp
  const isTokenValid = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const timestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY);
    
    if (!token || !timestamp) return false;
    
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    return tokenAge < TOKEN_VALIDITY_PERIOD;
  }, []);

  // Save user data to localStorage
  const saveUserData = useCallback((userData: User, token: string) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // Clear all auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Load user from localStorage or verify with backend
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const cachedUserData = localStorage.getItem(USER_KEY);
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Check token validity
        if (!isTokenValid()) {
          clearAuthData();
          setLoading(false);
          return;
        }

        // Try to use cached user data first for faster UI
        if (cachedUserData) {
          try {
            const userData = JSON.parse(cachedUserData);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Failed to parse cached user data", error);
          }
        }

        // Verify token with backend in the background
        try {
          const response = await apiClient.get<{ user?: User } | User>("/auth/me");
          const nextUser = extractUser(response);

          if (nextUser) {
            setUser(nextUser);
            setIsAuthenticated(true);
            localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
          } else {
            throw new Error("No user data returned from /auth/me");
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          clearAuthData();
        }
      } catch (error) {
        console.error("Error loading user:", error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [isTokenValid, clearAuthData, extractUser]);

  const signin = async (email: string, password: string) => {
    const response = await apiClient.post<{ token: string; user: User }>(
      "/auth/signin",
      { email, password }
    );
    
    apiClient.setToken(response.token);
    saveUserData(response.user, response.token);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const response = await apiClient.post<{ token: string; user: User }>(
      "/auth/signup",
      { email, password, name }
    );
    
    apiClient.setToken(response.token);
    saveUserData(response.user, response.token);
  };

  const signout = useCallback(() => {
    // Call backend signout endpoint (don't wait for response)
    apiClient.post("/auth/signout").catch(() => {
      // Ignore errors on signout
    });
    
    // Clear all local data
    apiClient.clearToken();
    clearAuthData();
    
    // Redirect to signin page
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  }, [clearAuthData]);

  // Set up unauthorized callback on mount
  useEffect(() => {
    apiClient.setUnauthorizedCallback(() => {
      signout();
    });
  }, [signout]);

  const refreshUser = useCallback(async () => {
    try {
      if (!isTokenValid()) {
        signout();
        return;
      }
      
      const response = await apiClient.get<{ user?: User } | User>("/auth/me");
      const nextUser = extractUser(response);

      if (nextUser) {
        setUser(nextUser);
        setIsAuthenticated(true);
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      } else {
        throw new Error("No user data returned from /auth/me");
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      signout();
    }
  }, [extractUser, isTokenValid, signout]);

  // Auto-refresh user data periodically (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshUser();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUser]);

  // Listen for storage events (login/logout from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        if (!e.newValue) {
          // Token removed in another tab
          clearAuthData();
        } else if (e.newValue !== e.oldValue) {
          // Token changed in another tab, reload user
          refreshUser();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearAuthData, refreshUser]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated,
      signin, 
      signup, 
      signout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
