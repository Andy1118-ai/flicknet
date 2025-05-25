import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      try {
        // For freemium pattern: disable auto-login by default
        // Only auto-login if explicitly enabled by user
        const autoLoginEnabled = localStorage.getItem('autoLoginEnabled') === 'true';
        const token = localStorage.getItem('authToken');

        if (token && autoLoginEnabled) {
          console.log('Auto-login enabled, attempting to validate existing token...');
          const userData = await authService.validateToken(token);
          if (userData) {
            console.log('Token validated successfully, logging in user:', userData.username);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            console.log('Token validation failed, clearing stored token');
            localStorage.removeItem('authToken');
          }
        } else if (token && !autoLoginEnabled) {
          console.log('Auto-login disabled, keeping token but staying logged out for freemium experience');
          // Keep the token but don't auto-login - user can manually login
        } else {
          console.log('No token found, starting as unauthenticated user');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.token);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.signup(userData);

      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.token);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user...');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    authService.logout();
    console.log('User logged out successfully');
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };

  // Utility function to disable auto-login (useful for testing/debugging)
  const disableAutoLogin = () => {
    console.log('Disabling auto-login...');
    localStorage.setItem('autoLoginEnabled', 'false');
    logout();
  };

  // Utility function to enable auto-login
  const enableAutoLogin = () => {
    console.log('Enabling auto-login...');
    localStorage.setItem('autoLoginEnabled', 'true');
  };

  // Utility function to clear all authentication data
  const clearAllAuthData = () => {
    console.log('Clearing all authentication data...');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('autoLoginEnabled');
    authService.logout();
    console.log('All authentication data cleared');
  };

  // Utility function to force freemium mode (clear auto-login but keep token)
  const forceFreemiumMode = () => {
    console.log('Forcing freemium mode - disabling auto-login...');
    localStorage.removeItem('autoLoginEnabled');
    setUser(null);
    setIsAuthenticated(false);
    console.log('Freemium mode activated - user must manually login');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser,
    disableAutoLogin,
    enableAutoLogin,
    clearAllAuthData,
    forceFreemiumMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
