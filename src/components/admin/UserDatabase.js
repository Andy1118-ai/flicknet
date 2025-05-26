import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaBan,
  FaCheck,
  FaUserShield,
  FaUser,
  FaFilter,
  FaDownload,
  FaPlus,
  FaSync,
  FaDatabase
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const UserDatabase = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterSubscription, setFilterSubscription] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    loadUsers();
  }, []);

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
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const result = await authService.deleteUser(userId);
        if (result.success) {
          setUsers(users.filter(u => u.id !== userId));
        } else {
          alert('Failed to delete user: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const result = await authService.updateUserRole(userId, newRole);
      if (result.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setShowRoleModal(false);
        setSelectedUser(null);
      } else {
        alert('Failed to update role: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSubscription = filterSubscription === 'all' || user.subscription === filterSubscription;

    return matchesSearch && matchesRole && matchesSubscription;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-600';
      case 'moderator': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getSubscriptionBadgeColor = (subscription) => {
    switch (subscription) {
      case 'premium': return 'bg-purple-100 text-purple-600';
      case 'basic': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the user database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FaDatabase className="text-3xl text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Database</h1>
            <p className="text-gray-600">Manage and monitor user accounts</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaUsers className="text-2xl text-blue-600" />
            <h3 className="font-semibold text-gray-900">Total Users</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">{users.length}</div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaUserShield className="text-2xl text-red-600" />
            <h3 className="font-semibold text-gray-900">Admins</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaCheck className="text-2xl text-green-600" />
            <h3 className="font-semibold text-gray-900">Active Users</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {users.filter(u => u.isActive !== false).length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaUser className="text-2xl text-purple-600" />
            <h3 className="font-semibold text-gray-900">Premium Users</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {users.filter(u => u.subscription === 'premium').length}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:border-primary-600 w-full"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-600"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>

              <select
                value={filterSubscription}
                onChange={(e) => setFilterSubscription(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-600"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={loadUsers}
              className="btn-outline flex items-center gap-2"
              disabled={loading}
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="btn-outline flex items-center gap-2">
              <FaDownload />
              Export
            </button>
            <button className="btn-primary flex items-center gap-2">
              <FaPlus />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="loading-spinner mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-white font-semibold text-sm">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionBadgeColor(user.subscription)}`}>
                        {user.subscription}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="View User">
                          <FaEye />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Edit Role"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                        >
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Role for {selectedUser.firstName} {selectedUser.lastName}
            </h3>
            <p className="text-gray-600 mb-6">
              Current role: <span className="font-medium">{selectedUser.role}</span>
            </p>
            <div className="space-y-3 mb-6">
              {['user', 'moderator', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(selectedUser.id, role)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors duration-200 ${
                    selectedUser.role === role
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="font-medium capitalize">{role}</div>
                  <div className="text-sm text-gray-500">
                    {role === 'admin' && 'Full system access'}
                    {role === 'moderator' && 'Content moderation access'}
                    {role === 'user' && 'Standard user access'}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDatabase;
