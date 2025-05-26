import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { FaBug, FaEyeSlash, FaTrash, FaToggleOn, FaToggleOff, FaUserShield, FaShieldAlt, FaSignInAlt } from 'react-icons/fa';

const AuthDebugPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    disableAutoLogin,
    enableAutoLogin,
    clearAllAuthData,
    forceFreemiumMode
  } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const authToken = localStorage.getItem('authToken');
  const autoLoginEnabled = localStorage.getItem('autoLoginEnabled') === 'true';

  const handleToggleAutoLogin = () => {
    if (autoLoginEnabled) {
      disableAutoLogin();
    } else {
      enableAutoLogin();
    }
  };

  const handleQuickAdminLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await login({
        email: 'admin@flicknet.com',
        password: 'admin123'
      });

      if (result.success) {
        console.log('Quick admin login successful');
      } else {
        console.error('Quick admin login failed:', result.error);
        alert('Admin login failed. Make sure database is seeded.');
      }
    } catch (error) {
      console.error('Quick admin login error:', error);
      alert('Admin login error. Check console for details.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-gray-900 text-white rounded-lg shadow-xl transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-12'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-12 h-12 flex items-center justify-center text-yellow-400 hover:text-yellow-300 transition-colors"
          title="Auth Debug Panel"
        >
          <FaBug />
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 pt-0">
            <h3 className="text-sm font-bold mb-3 text-yellow-400">Auth Debug Panel</h3>

            {/* Auth Status */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Loading:</span>
                <span className={loading ? 'text-yellow-400' : 'text-gray-400'}>
                  {loading ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>User:</span>
                <span className="text-blue-400">
                  {user ? user.username : 'None'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Token:</span>
                <span className={authToken ? 'text-green-400' : 'text-red-400'}>
                  {authToken ? 'Present' : 'None'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Auto-Login:</span>
                <span className={autoLoginEnabled ? 'text-green-400' : 'text-orange-400'}>
                  {autoLoginEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Role:</span>
                <span className={user?.role === 'admin' ? 'text-red-400' : user?.role === 'moderator' ? 'text-yellow-400' : 'text-blue-400'}>
                  {user?.role || 'None'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleToggleAutoLogin}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
              >
                {autoLoginEnabled ? <FaToggleOff /> : <FaToggleOn />}
                {autoLoginEnabled ? 'Disable' : 'Enable'} Auto-Login
              </button>

              <button
                onClick={forceFreemiumMode}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
              >
                <FaToggleOff />
                Force Freemium Mode
              </button>

              {/* Quick Admin Login */}
              {!isAuthenticated && (
                <button
                  onClick={handleQuickAdminLogin}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded text-xs transition-colors"
                >
                  <FaSignInAlt />
                  {isLoggingIn ? 'Logging in...' : 'Quick Admin Login'}
                </button>
              )}

              {/* Quick Access Buttons for Admin/Moderator */}
              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                  >
                    <FaUserShield />
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors"
                  >
                    <FaUserShield />
                    User Database
                  </button>
                </>
              )}

              {isAuthenticated && ['admin', 'moderator'].includes(user?.role) && (
                <button
                  onClick={() => navigate('/moderator')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-xs transition-colors"
                >
                  <FaShieldAlt />
                  Moderator Panel
                </button>
              )}

              {isAuthenticated && (
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-xs transition-colors"
                >
                  <FaEyeSlash />
                  Logout
                </button>
              )}

              <button
                onClick={() => {
                  if (window.confirm('Clear all auth data?')) {
                    clearAllAuthData();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
              >
                <FaTrash />
                Clear All Data
              </button>
            </div>

            {/* Token Preview */}
            {authToken && (
              <div className="mt-3 p-2 bg-gray-800 rounded text-xs">
                <div className="text-gray-400 mb-1">Token (first 20 chars):</div>
                <div className="font-mono text-green-400 break-all">
                  {authToken.substring(0, 20)}...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebugPanel;
