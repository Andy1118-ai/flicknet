import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaFilm,
  FaChartBar,
  FaCog,
  FaTrash,
  FaEdit,
  FaEye,
  FaBan,
  FaCheck,
  FaSearch,
  FaPlus,
  FaDownload
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userList = await authService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await authService.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const stats = {
    totalUsers: 2456,
    activeUsers: 1834,
    totalMovies: 12847,
    totalDiscussions: 1203,
    monthlyRevenue: 45678,
    subscriptions: {
      free: 1456,
      basic: 678,
      premium: 322
    }
  };

  const recentActivity = [
    {
      id: 1,
      type: 'user_signup',
      description: 'New user registered: john_doe',
      timestamp: '2 minutes ago'
    },
    {
      id: 2,
      type: 'subscription',
      description: 'User upgraded to Premium: movie_lover',
      timestamp: '15 minutes ago'
    },
    {
      id: 3,
      type: 'discussion',
      description: 'New discussion created: "Best Movies of 2024"',
      timestamp: '1 hour ago'
    },
    {
      id: 4,
      type: 'report',
      description: 'Content reported by user: spam_content',
      timestamp: '2 hours ago'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartBar },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'content', label: 'Content', icon: FaFilm },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600 text-lg">Manage your FlickNet platform</p>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors duration-200 border-b-2 ${
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
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaUsers className="text-2xl text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Total Users</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-green-600 font-medium">+12% from last month</div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaUsers className="text-2xl text-green-600" />
                  <h3 className="font-semibold text-gray-900">Active Users</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.activeUsers.toLocaleString()}</div>
                <div className="text-sm text-green-600 font-medium">+8% from last month</div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaFilm className="text-2xl text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Total Movies</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalMovies.toLocaleString()}</div>
                <div className="text-sm text-green-600 font-medium">+156 this month</div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaChartBar className="text-2xl text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Monthly Revenue</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">${stats.monthlyRevenue.toLocaleString()}</div>
                <div className="text-sm text-green-600 font-medium">+23% from last month</div>
              </div>
            </div>

            {/* Subscription Breakdown */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Free</span>
                  <span className="font-semibold text-gray-900">{stats.subscriptions.free}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full"
                        style={{ width: `${(stats.subscriptions.free / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Basic</span>
                  <span className="font-semibold text-gray-900">{stats.subscriptions.basic}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(stats.subscriptions.basic / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Premium</span>
                  <span className="font-semibold text-gray-900">{stats.subscriptions.premium}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(stats.subscriptions.premium / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-gray-900 font-medium">{activity.description}</span>
                      <span className="block text-sm text-gray-500 mt-1">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:border-primary-600 w-64"
                  />
                </div>
                <button className="btn-primary flex items-center gap-2">
                  <FaPlus />
                  Add User
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="loading-spinner mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-white font-semibold text-sm">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Role</div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-600' :
                            user.role === 'moderator' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {user.role}
                          </span>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Subscription</div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.subscription === 'premium' ? 'bg-purple-100 text-purple-600' :
                            user.subscription === 'basic' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {user.subscription}
                          </span>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Joined</div>
                          <div className="text-sm text-gray-900">{user.joinDate}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="View User">
                            <FaEye />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200" title="Edit User">
                            <FaEdit />
                          </button>
                          <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200" title="Ban User">
                            <FaBan />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete User"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
              <div className="flex items-center gap-4">
                <button className="btn-outline flex items-center gap-2">
                  <FaDownload />
                  Export Data
                </button>
                <button className="btn-primary flex items-center gap-2">
                  <FaPlus />
                  Add Movie
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Movies</h4>
                <span className="text-3xl font-bold text-gray-900 block mb-2">12,847</span>
                <span className="text-sm text-green-600 font-medium">+156 this month</span>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Discussions</h4>
                <span className="text-3xl font-bold text-gray-900 block mb-2">1,203</span>
                <span className="text-sm text-green-600 font-medium">+89 this week</span>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Reviews</h4>
                <span className="text-3xl font-bold text-gray-900 block mb-2">8,945</span>
                <span className="text-sm text-green-600 font-medium">+234 this week</span>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Reports</h4>
                <span className="text-3xl font-bold text-gray-900 block mb-2">23</span>
                <span className="text-sm text-yellow-600 font-medium">Pending review</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="btn-outline">Manage Movies</button>
              <button className="btn-outline">Review Reports</button>
              <button className="btn-outline">Moderate Discussions</button>
              <button className="btn-outline">Analytics</button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input type="text" defaultValue="FlickNet" className="input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                    <textarea
                      defaultValue="Your ultimate movie discovery platform"
                      className="input w-full"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">User Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                    <label className="ml-3 text-sm text-gray-700">Allow user registration</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                    <label className="ml-3 text-sm text-gray-700">Require email verification</label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Content Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                    <label className="ml-3 text-sm text-gray-700">Enable content moderation</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                    <label className="ml-3 text-sm text-gray-700">Auto-approve user reviews</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button className="btn-primary flex items-center gap-2">
                <FaCheck />
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
