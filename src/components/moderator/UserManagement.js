import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaUser,
  FaSearch,
  FaFilter,
  FaBan,
  FaExclamationTriangle,
  FaEye,
  FaCrown,
  FaShieldAlt,
  FaEnvelope
} from 'react-icons/fa';
import { moderationService } from '../../services/moderationService';
import GlassCard from '../ui/GlassCard';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    subscription: ''
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Use mock data for now - replace with real API call when backend is ready
      const result = moderationService.getMockUsers();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId, duration, reason) => {
    try {
      const result = await moderationService.suspendUser(userId, duration, reason);
      if (result.success) {
        loadUsers();
        setShowSuspendModal(false);
        setSelectedUser(null);
        alert(result.message);
      } else {
        alert('Failed to suspend user: ' + result.error);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <FaCrown className="text-yellow-600" />;
      case 'moderator': return <FaShieldAlt className="text-blue-600" />;
      default: return <FaUser className="text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-yellow-600 bg-yellow-100';
      case 'moderator': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSubscriptionColor = (subscription) => {
    switch (subscription) {
      case 'premium': return 'text-purple-600 bg-purple-100';
      case 'basic': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">View and manage user accounts (limited moderator access)</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {users.length} users found
          </span>
        </div>
      </div>

      {/* Notice */}
      <GlassCard className="p-4 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">Moderator Permissions</h4>
            <p className="text-sm text-blue-700">
              As a moderator, you can view user profiles and temporarily suspend users.
              You cannot delete users or change user roles (admin-only features).
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Filters */}
      <GlassCard className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, username, or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.subscription}
              onChange={(e) => setFilters({ ...filters, subscription: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Subscriptions</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">No users match your current filters.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <GlassCard key={user._id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role?.toUpperCase()}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionColor(user.subscription)}`}>
                        {user.subscription?.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span>@{user.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                      <div>
                        <span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="btn-outline flex items-center gap-2"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowModal(true);
                    }}
                  >
                    <FaEye />
                    View Profile
                  </button>

                  {/* Only allow suspension of regular users */}
                  {user.role === 'user' && (
                    <button
                      className="btn-secondary flex items-center gap-2"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowSuspendModal(true);
                      }}
                    >
                      <FaBan />
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* User Profile Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">User Profile</h3>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xl">
                    {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h4>
                    <p className="text-gray-600">@{selectedUser.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionColor(selectedUser.subscription)}`}>
                        {selectedUser.subscription?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Email:</span> {selectedUser.email}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className={`ml-1 ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Account Details</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Joined:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Last Login:</span> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Activity Summary</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">0</div>
                        <div className="text-gray-600">Reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">0</div>
                        <div className="text-gray-600">Ratings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">0</div>
                        <div className="text-gray-600">Watchlist Items</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  className="btn-outline"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Suspend User</h3>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 mb-4">
                    You are about to suspend <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suspension Duration
                  </label>
                  <select
                    id="suspensionDuration"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="24">24 hours</option>
                    <option value="72">3 days</option>
                    <option value="168">1 week</option>
                    <option value="720">30 days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Suspension
                  </label>
                  <textarea
                    id="suspensionReason"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Explain why this user is being suspended..."
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  className="btn-outline"
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => {
                    const duration = parseInt(document.getElementById('suspensionDuration').value);
                    const reason = document.getElementById('suspensionReason').value;

                    if (!reason.trim()) {
                      alert('Please provide a reason for suspension');
                      return;
                    }

                    handleSuspendUser(selectedUser._id, duration, reason);
                  }}
                >
                  <FaBan />
                  Suspend User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
