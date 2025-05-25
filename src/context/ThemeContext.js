import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [systemPreference, setSystemPreference] = useState('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load saved theme or use system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('flicknet-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(systemPreference);
    }
  }, [systemPreference]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'cinematic' : 'light';
    setTheme(newTheme);
    localStorage.setItem('flicknet-theme', newTheme);
  };

  const setSpecificTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('flicknet-theme', newTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'cinematic':
        return '🎬';
      default:
        return '☀️';
    }
  };

  const getThemeName = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'cinematic':
        return 'Cinematic';
      default:
        return 'Light';
    }
  };

  const value = {
    theme,
    systemPreference,
    toggleTheme,
    setSpecificTheme,
    getThemeIcon,
    getThemeName,
    isDark: theme === 'dark' || theme === 'cinematic',
    isCinematic: theme === 'cinematic'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
