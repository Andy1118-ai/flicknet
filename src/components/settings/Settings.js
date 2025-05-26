import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FaUser,
  FaLock,
  FaBell,
  FaEye,
  FaSave,
  FaCamera,
  FaCheck
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';


const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      username: user?.username || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm();

  const newPassword = watch('newPassword');

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    movieReleases: true,
    communityUpdates: false,
    weeklyDigest: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showWatchlist: true,
    showRatings: true,
    allowFriendRequests: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'password', label: 'Password', icon: FaLock },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'privacy', label: 'Privacy', icon: FaEye }
  ];

  const onProfileSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateUser(data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Password updated successfully!');
      resetPassword();
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    setSuccess('Notification preferences saved!');
    setTimeout(() => {
      setLoading(false);
      setSuccess('');
    }, 2000);
  };

  const savePrivacySettings = async () => {
    setLoading(true);
    setSuccess('Privacy settings saved!');
    setTimeout(() => {
      setLoading(false);
      setSuccess('');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 text-lg">Manage your account preferences and privacy</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <FaCheck className="text-lg" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-8">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="text-lg" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-8">
              <div className="border-b border-gray-200 pb-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
                <p className="text-gray-600">Update your personal information and profile details</p>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <button type="button" className="btn-outline flex items-center gap-2 mb-2">
                      <FaCamera />
                      Change Photo
                    </button>
                    <p className="text-sm text-gray-600">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      className={`input-field ${profileErrors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...registerProfile('firstName', {
                        required: 'First name is required'
                      })}
                    />
                    {profileErrors.firstName && (
                      <span className="text-sm text-red-600">{profileErrors.firstName.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      className={`input-field ${profileErrors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...registerProfile('lastName', {
                        required: 'Last name is required'
                      })}
                    />
                    {profileErrors.lastName && (
                      <span className="text-sm text-red-600">{profileErrors.lastName.message}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    className={`input-field ${profileErrors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    {...registerProfile('username', {
                      required: 'Username is required'
                    })}
                  />
                  {profileErrors.username && (
                    <span className="text-sm text-red-600">{profileErrors.username.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    className={`input-field ${profileErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    {...registerProfile('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {profileErrors.email && (
                    <span className="text-sm text-red-600">{profileErrors.email.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="card p-8">
              <div className="border-b border-gray-200 pb-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
                <p className="text-gray-600">Update your password to keep your account secure</p>
              </div>

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    className={`input-field ${passwordErrors.currentPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your current password"
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required'
                    })}
                  />
                  {passwordErrors.currentPassword && (
                    <span className="text-sm text-red-600">{passwordErrors.currentPassword.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    className={`input-field ${passwordErrors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your new password"
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                  />
                  {passwordErrors.newPassword && (
                    <span className="text-sm text-red-600">{passwordErrors.newPassword.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    className={`input-field ${passwordErrors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Confirm your new password"
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your new password',
                      validate: value =>
                        value === newPassword || 'Passwords do not match'
                    })}
                  />
                  {passwordErrors.confirmPassword && (
                    <span className="text-sm text-red-600">{passwordErrors.confirmPassword.message}</span>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaLock />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card p-8">
              <div className="border-b border-gray-200 pb-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
                <p className="text-gray-600">Choose what notifications you want to receive</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.pushNotifications}
                        onChange={() => handleNotificationChange('pushNotifications')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Movie Releases</h4>
                      <p className="text-sm text-gray-600">Get notified about new movie releases</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.movieReleases}
                        onChange={() => handleNotificationChange('movieReleases')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Community Updates</h4>
                      <p className="text-sm text-gray-600">Notifications about community discussions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.communityUpdates}
                        onChange={() => handleNotificationChange('communityUpdates')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Weekly Digest</h4>
                      <p className="text-sm text-gray-600">Weekly summary of your activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.weeklyDigest}
                        onChange={() => handleNotificationChange('weeklyDigest')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={saveNotificationSettings}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="card p-8">
              <div className="border-b border-gray-200 pb-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Settings</h2>
                <p className="text-gray-600">Control who can see your information and activity</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Profile Visibility</label>
                  <select
                    className="input-field"
                    value={privacySettings.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                  >
                    <option value="public">Public - Anyone can see your profile</option>
                    <option value="friends">Friends Only - Only your friends can see your profile</option>
                    <option value="private">Private - Only you can see your profile</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Show Watchlist</h4>
                      <p className="text-sm text-gray-600">Allow others to see your watchlist</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={privacySettings.showWatchlist}
                        onChange={() => handlePrivacyChange('showWatchlist', !privacySettings.showWatchlist)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Show Ratings</h4>
                      <p className="text-sm text-gray-600">Allow others to see your movie ratings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={privacySettings.showRatings}
                        onChange={() => handlePrivacyChange('showRatings', !privacySettings.showRatings)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Allow Friend Requests</h4>
                      <p className="text-sm text-gray-600">Let other users send you friend requests</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={privacySettings.allowFriendRequests}
                        onChange={() => handlePrivacyChange('allowFriendRequests', !privacySettings.allowFriendRequests)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Privacy Notice</h4>
                  <p className="text-sm text-yellow-800">
                    Your privacy is important to us. These settings control how your information is shared with other users.
                    You can change these settings at any time.
                  </p>
                </div>

                <button
                  onClick={savePrivacySettings}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
