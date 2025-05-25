import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFilm,
  FaBars,
  FaSearch,
  FaUser,
  FaSignOutAlt,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import ThemeToggle from '../ui/ThemeToggle';

const Header = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, disableAutoLogin, clearAllAuthData } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would navigate to search results
      console.log('Searching for:', searchQuery);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/'); // Navigate to root (public dashboard) to maintain freemium pattern
  };

  const handleDisableAutoLogin = () => {
    disableAutoLogin();
    setUserMenuOpen(false);
    navigate('/'); // Navigate to root (public dashboard)
  };

  const handleClearAllData = () => {
    if (window.confirm('This will clear all authentication data and log you out. Continue?')) {
      clearAllAuthData();
      setUserMenuOpen(false);
      navigate('/'); // Navigate to root (public dashboard)
    }
  };

  const navigateToSettings = () => {
    navigate('/settings');
    setUserMenuOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-primary-600 to-secondary-600 shadow-md sticky top-0 z-50 h-[70px]">
      <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            className="text-white text-xl p-2 rounded-md hover:bg-white/10 transition-colors duration-200"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>

          <div
            className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => navigate('/')}
          >
            <FaFilm className="text-white text-2xl" />
            <span className="text-white text-xl font-bold tracking-tight hidden sm:block">FlickNet</span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8 hidden sm:block">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search movies, actors, directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white/90 text-gray-900 text-sm transition-all duration-200 focus:outline-none focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-white/30 placeholder-gray-500"
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle variant="dropdown" />

          {isAuthenticated ? (
            <>
              <NotificationBell />

              <div className="relative">
                <button
                  className="flex items-center gap-3 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors duration-200"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <span className="font-medium text-sm hidden md:block">
                    {user?.firstName || 'User'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl min-w-[200px] z-60 animate-slideDown">
                    <div className="p-4 border-b border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{user?.email}</div>
                      <div className="text-xs text-primary-600 uppercase font-medium tracking-wide">
                        {user?.role}
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 text-sm hover:bg-gray-50 transition-colors duration-200"
                        onClick={navigateToSettings}
                      >
                        <FaCog />
                        Settings
                      </button>

                      {/* Debug Options - Only show in development */}
                      {process.env.NODE_ENV === 'development' && (
                        <>
                          <button
                            className="flex items-center gap-3 w-full px-4 py-3 text-orange-600 text-sm hover:bg-orange-50 transition-colors duration-200 border-t border-gray-200"
                            onClick={handleDisableAutoLogin}
                            title="Disable automatic login on page refresh"
                          >
                            <FaSignOutAlt />
                            Disable Auto-Login
                          </button>

                          <button
                            className="flex items-center gap-3 w-full px-4 py-3 text-purple-600 text-sm hover:bg-purple-50 transition-colors duration-200"
                            onClick={handleClearAllData}
                            title="Clear all authentication data and tokens"
                          >
                            <FaCog />
                            Clear All Auth Data
                          </button>
                        </>
                      )}

                      <button
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 text-sm hover:bg-red-50 transition-colors duration-200 border-t border-gray-200"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                className="px-6 py-2 text-white border-2 border-white/30 rounded-lg font-medium text-sm hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                onClick={handleLogin}
              >
                Login
              </button>
              <button
                className="px-6 py-2 bg-white text-primary-600 border-2 border-white rounded-lg font-medium text-sm hover:bg-primary-50 hover:transform hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setUserMenuOpen(false)}
        />
      )}


    </header>
  );
};

export default Header;
