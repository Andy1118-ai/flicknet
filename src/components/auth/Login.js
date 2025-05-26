import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import { FaEye, FaEyeSlash, FaFilm } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { login, logout, isAuthenticated, user, enableAutoLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Show a notice if already authenticated but allow staying on login page
  const showAlreadyLoggedIn = isAuthenticated;

  const onSubmit = async (data) => {
    // Skip reCAPTCHA validation in development
    if (!recaptchaValue && process.env.NODE_ENV === 'production') {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    // For development, always allow login without reCAPTCHA
    console.log('🔧 Login attempt:', { username: data.username, env: process.env.NODE_ENV });

    setIsLoading(true);
    setError('');

    try {
      const result = await login({
        username: data.username,
        password: data.password,
        recaptchaToken: recaptchaValue
      });

      if (result.success) {
        // Enable auto-login if "Remember me" is checked
        if (rememberMe) {
          enableAutoLogin();
        }
        // Always redirect to dashboard after successful login
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Login failed');
        setRecaptchaValue(null);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setRecaptchaValue(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
    if (error && error.includes('reCAPTCHA')) {
      setError('');
    }
  };

  const handleLogoutFromLogin = () => {
    logout();
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 space-y-6">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaFilm className="text-3xl text-primary-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">FlickNet</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your movie paradise</p>
          </div>

          {/* Already Logged In Notice */}
          {showAlreadyLoggedIn && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              <div className="mb-2">
                <span>You are already logged in as <strong>{user?.firstName}</strong></span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleLogoutFromLogin}
                  className="text-red-600 hover:text-red-800 font-medium underline"
                >
                  Logout & Login as Different User
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                className={`input-field ${errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your username or email"
                {...register('username', {
                  required: 'Username or email is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  }
                })}
              />
              {errors.username && (
                <span className="text-sm text-red-600">{errors.username.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className="text-sm text-red-600">{errors.password.message}</span>
              )}
            </div>

            {/* reCAPTCHA - Only show in production */}
            {process.env.NODE_ENV === 'production' && (
              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                  onChange={handleRecaptchaChange}
                  onExpired={() => setRecaptchaValue(null)}
                  theme="light"
                />
              </div>
            )}

            {/* Development mode notice */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="text-center text-sm text-gray-500">
                Development mode - reCAPTCHA disabled
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me (stay logged in)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Demo Credentials:</h4>
            <p className="text-sm text-blue-800"><strong>Admin:</strong> admin / admin123</p>
            <p className="text-sm text-blue-800"><strong>User:</strong> moviefan / password123</p>

            {/* Quick Login Buttons for Testing */}
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => onSubmit({ username: 'admin@flicknet.com', password: 'admin123' })}
                className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                🚀 Quick Admin Login (Test)
              </button>
              <button
                type="button"
                onClick={() => onSubmit({ username: 'fan@example.com', password: 'password123' })}
                className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                disabled={isLoading}
              >
                👤 Quick User Login (Test)
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
