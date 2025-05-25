import React, { useState } from 'react';
import { FaSun, FaMoon, FaFilm } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';

const ThemeToggle = ({ showLabel = false, variant = 'button' }) => {
  const { theme, toggleTheme, setSpecificTheme, getThemeIcon, getThemeName } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      id: 'light',
      name: 'Light',
      icon: FaSun,
      emoji: '☀️',
      description: 'Clean and bright',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: FaMoon,
      emoji: '🌙',
      description: 'Easy on the eyes',
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      id: 'cinematic',
      name: 'Cinematic',
      icon: FaFilm,
      emoji: '🎬',
      description: 'Movie theater vibes',
      gradient: 'from-red-600 to-purple-800'
    }
  ];

  const currentTheme = themes.find(t => t.id === theme);

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <span className="text-lg">{getThemeIcon()}</span>
          {showLabel && <span className="text-sm font-medium">{getThemeName()}</span>}
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <GlassCard className="absolute top-full right-0 mt-2 w-48 p-2 z-50">
              <div className="space-y-1">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isActive = theme === themeOption.id;
                  
                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => {
                        setSpecificTheme(themeOption.id);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-primary-500 text-white' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <span className="text-lg">{themeOption.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{themeOption.name}</div>
                        <div className="text-xs opacity-75">{themeOption.description}</div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </>
        )}
      </div>
    );
  }

  // Simple toggle button
  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
        bg-white/10 hover:bg-white/20 text-white hover:scale-105
        ${showLabel ? 'min-w-[120px]' : ''}
      `}
      title={`Switch to ${themes.find(t => t.id !== theme)?.name} theme`}
    >
      <span className="text-lg animate-pulse">{getThemeIcon()}</span>
      {showLabel && (
        <span className="text-sm font-medium">{getThemeName()}</span>
      )}
    </button>
  );
};

export default ThemeToggle;
