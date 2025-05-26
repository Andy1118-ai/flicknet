import React, { useState, useEffect } from 'react';
import {
  FaShieldAlt,
  FaFlag,
  FaTicketAlt,
  FaUsers,
  FaChartBar,
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
  FaEye,
  FaBan
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { moderationService } from '../../services/moderationService';
import GlassCard from '../ui/GlassCard';
import ContentReports from './ContentReports';
import SupportTickets from './SupportTickets';
import UserManagement from './UserManagement';
import ContentManagement from './ContentManagement';

const ModeratorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartBar },
    { id: 'reports', label: 'Content Reports', icon: FaFlag },
    { id: 'tickets', label: 'Support Tickets', icon: FaTicketAlt },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'content', label: 'Content Management', icon: FaEye }
  ];

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      // Use mock data for now - replace with real API call when backend is ready
      const result = moderationService.getMockDashboardStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not moderator or admin
  useEffect(() => {
    if (user && !['moderator', 'admin'].includes(user.role)) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  if (!user || !['moderator', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <GlassCard className="p-8 text-center max-w-md">
          <FaBan className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the moderator dashboard.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FaShieldAlt className="text-3xl text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moderator Dashboard</h1>
            <p className="text-gray-600">Content moderation and user management</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Welcome back, {user?.firstName}! You have moderator privileges.
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors duration-200 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-600 border-transparent hover:text-primary-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="text-base" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaFlag className="text-2xl text-red-600" />
                  <h3 className="font-semibold text-gray-900">Pending Reports</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? '...' : stats?.pendingReports || 0}
                </div>
                <div className="text-sm text-red-600 font-medium">Requires attention</div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaTicketAlt className="text-2xl text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Open Tickets</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? '...' : stats?.openTickets || 0}
                </div>
                <div className="text-sm text-blue-600 font-medium">Support requests</div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaUsers className="text-2xl text-green-600" />
                  <h3 className="font-semibold text-gray-900">Total Users</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? '...' : stats?.totalUsers?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-green-600 font-medium">Active accounts</div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaBan className="text-2xl text-orange-600" />
                  <h3 className="font-semibold text-gray-900">Suspended Users</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? '...' : stats?.suspendedUsers || 0}
                </div>
                <div className="text-sm text-orange-600 font-medium">Temporary suspensions</div>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <GlassCard className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  className="btn-primary flex items-center gap-2 justify-center"
                  onClick={() => setActiveTab('reports')}
                >
                  <FaFlag />
                  Review Reports
                </button>
                <button
                  className="btn-outline flex items-center gap-2 justify-center"
                  onClick={() => setActiveTab('tickets')}
                >
                  <FaTicketAlt />
                  Handle Tickets
                </button>
                <button
                  className="btn-outline flex items-center gap-2 justify-center"
                  onClick={() => setActiveTab('users')}
                >
                  <FaUsers />
                  Manage Users
                </button>
                <button
                  className="btn-outline flex items-center gap-2 justify-center"
                  onClick={() => setActiveTab('content')}
                >
                  <FaEye />
                  Review Content
                </button>
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaCheckCircle className="text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Report resolved</div>
                    <div className="text-sm text-gray-600">Inappropriate content removed</div>
                  </div>
                  <div className="text-sm text-gray-500">2 hours ago</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaTicketAlt className="text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Ticket assigned</div>
                    <div className="text-sm text-gray-600">Billing inquiry from user</div>
                  </div>
                  <div className="text-sm text-gray-500">4 hours ago</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaBan className="text-orange-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">User suspended</div>
                    <div className="text-sm text-gray-600">24-hour suspension for policy violation</div>
                  </div>
                  <div className="text-sm text-gray-500">6 hours ago</div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Content Reports Tab */}
        {activeTab === 'reports' && <ContentReports />}

        {/* Support Tickets Tab */}
        {activeTab === 'tickets' && <SupportTickets />}

        {/* User Management Tab */}
        {activeTab === 'users' && <UserManagement />}

        {/* Content Management Tab */}
        {activeTab === 'content' && <ContentManagement />}
      </div>
    </div>
  );
};

export default ModeratorDashboard;
