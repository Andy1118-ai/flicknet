import React, { useState, useEffect } from 'react';
import {
  FaDatabase,
  FaServer,
  FaMemory,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSync,
  FaDownload,
  FaCog,
  FaChartLine,
  FaUsers,
  FaHdd,
  FaNetworkWired,
  FaUserCog
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const AdminDatabase = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    setLoading(true);
    try {
      const result = await authService.getDatabaseStats();
      if (result.success) {
        setStats(result.stats);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to load database stats:', result.error);
      }
    } catch (error) {
      console.error('Error loading database stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionStatus = () => {
    if (!stats) return { icon: FaTimesCircle, color: 'text-gray-400', text: 'Unknown' };

    if (stats.database.connected) {
      return { icon: FaCheckCircle, color: 'text-green-600', text: 'Connected' };
    } else {
      return { icon: FaExclamationTriangle, color: 'text-yellow-600', text: 'Mock Data' };
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin database.</p>
        </div>
      </div>
    );
  }

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaUserCog className="text-3xl text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Database</h1>
              <p className="text-gray-600">Database administration and monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={loadDatabaseStats}
              className="btn-outline flex items-center gap-2"
              disabled={loading}
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <FaDatabase className="text-2xl text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Database Status</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner mr-3"></div>
            <span className="text-gray-600">Loading database information...</span>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <StatusIcon className={`text-3xl ${connectionStatus.color} mx-auto mb-2`} />
              <div className="font-medium text-gray-900">Connection</div>
              <div className="text-sm text-gray-600">{connectionStatus.text}</div>
            </div>

            <div className="text-center">
              <FaServer className="text-3xl text-blue-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Type</div>
              <div className="text-sm text-gray-600">{stats.database.type}</div>
            </div>

            <div className="text-center">
              <FaNetworkWired className="text-3xl text-green-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Host</div>
              <div className="text-sm text-gray-600">{stats.database.host}</div>
            </div>

            <div className="text-center">
              <FaCheckCircle className="text-3xl text-purple-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Status</div>
              <div className="text-sm text-gray-600">{stats.database.status}</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load database information</p>
          </div>
        )}
      </div>

      {/* System Statistics */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Statistics */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaUsers className="text-2xl text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">User Statistics</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold text-gray-900">{stats.users.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold text-gray-900">{stats.users.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Admin Users</span>
                <span className="font-semibold text-gray-900">{stats.users.admins}</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Subscription Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Free</span>
                    <span className="text-sm font-medium text-gray-900">{stats.users.bySubscription.free}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Basic</span>
                    <span className="text-sm font-medium text-gray-900">{stats.users.bySubscription.basic}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Premium</span>
                    <span className="text-sm font-medium text-gray-900">{stats.users.bySubscription.premium}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaServer className="text-2xl text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Environment</span>
                <span className="font-semibold text-gray-900 capitalize">{stats.system.environment}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Node.js Version</span>
                <span className="font-semibold text-gray-900">{stats.system.nodeVersion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Uptime</span>
                <span className="font-semibold text-gray-900">{formatUptime(stats.system.uptime)}</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Memory Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">RSS</span>
                    <span className="text-sm font-medium text-gray-900">{formatBytes(stats.system.memory.rss)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Heap Used</span>
                    <span className="text-sm font-medium text-gray-900">{formatBytes(stats.system.memory.heapUsed)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Heap Total</span>
                    <span className="text-sm font-medium text-gray-900">{formatBytes(stats.system.memory.heapTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaCog className="text-2xl text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Database Administration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn-outline flex items-center gap-2 justify-center">
            <FaDownload />
            Backup Database
          </button>
          <button className="btn-outline flex items-center gap-2 justify-center">
            <FaChartLine />
            Performance Metrics
          </button>
          <button className="btn-outline flex items-center gap-2 justify-center">
            <FaHdd />
            Storage Analysis
          </button>
          <button className="btn-outline flex items-center gap-2 justify-center">
            <FaCog />
            Database Settings
          </button>
        </div>

        {!stats?.database.connected && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="text-yellow-600" />
              <span className="font-medium text-yellow-800">Mock Data Mode</span>
            </div>
            <p className="text-sm text-yellow-700">
              The system is currently running with mock data. To enable full database functionality,
              please configure a MongoDB connection.
            </p>
            <button className="mt-3 btn-primary btn-sm">
              Configure Database
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDatabase;
