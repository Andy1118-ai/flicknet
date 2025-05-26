import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="loading-spinner mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false, moderatorOnly = false, moderatorOrAdmin = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if admin access is required
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if moderator access is required
  if (moderatorOnly && user?.role !== 'moderator') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if moderator or admin access is required
  if (moderatorOrAdmin && !['moderator', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
