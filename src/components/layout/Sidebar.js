import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaCog,
  FaCreditCard,
  FaUsers,
  FaUserShield,
  FaTimes,
  FaDatabase,
  FaUserCog,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      path: '/dashboard',
      icon: FaTachometerAlt,
      label: 'Dashboard',
      description: 'Overview and stats',
      public: true
    }
  ];

  // Add authenticated user items
  if (isAuthenticated) {
    navigationItems.push(
      {
        path: '/settings',
        icon: FaCog,
        label: 'Settings',
        description: 'Account preferences'
      },
      {
        path: '/subscription',
        icon: FaCreditCard,
        label: 'Subscription',
        description: 'Billing and plans'
      },
      {
        path: '/community',
        icon: FaUsers,
        label: 'Community',
        description: 'Connect with others'
      }
    );

    // Add moderator panel for moderator users
    if (user?.role === 'moderator') {
      navigationItems.push(
        {
          path: '/moderator',
          icon: FaShieldAlt,
          label: 'Moderator Panel',
          description: 'Content moderation'
        }
      );
    }

    // Add admin panel for admin users
    if (user?.role === 'admin') {
      navigationItems.push(
        {
          path: '/moderator',
          icon: FaShieldAlt,
          label: 'Moderator Panel',
          description: 'Content moderation'
        },
        {
          path: '/admin',
          icon: FaUserShield,
          label: 'Admin Panel',
          description: 'System management'
        },
        {
          path: '/admin/users',
          icon: FaDatabase,
          label: 'User Database',
          description: 'Manage user accounts'
        },
        {
          path: '/admin/database',
          icon: FaUserCog,
          label: 'Admin Database',
          description: 'Database administration'
        }
      );
    }
  }

  return (
    <>
      <aside className={`fixed top-[70px] left-0 w-80 h-[calc(100vh-70px)] bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg transform transition-transform duration-300 z-40 overflow-y-auto flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:${isOpen ? 'relative top-0 h-auto min-h-[calc(100vh-70px)] translate-x-0' : ''}`}>
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Navigation</h3>
          <button
            className="text-gray-500 text-xl p-2 rounded-md hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`flex items-center px-6 py-4 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 relative ${
                      isActive ? 'bg-primary-600 text-white' : ''
                    }`}
                    onClick={onClose}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
                    )}
                    <div className="text-xl mr-4 w-6 flex items-center justify-center">
                      <Icon />
                    </div>
                    <div className="flex-1">
                      <span className="block font-medium text-sm leading-tight">{item.label}</span>
                      <span className={`block text-xs mt-0.5 ${isActive ? 'text-white/90' : 'text-gray-500'}`}>
                        {item.description}
                      </span>
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-white font-semibold text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-primary-600 uppercase font-medium tracking-wide">
                  {user?.subscription || 'Free'} Plan
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <h4 className="text-base font-semibold text-gray-800 mb-2">Join FlickNet</h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Sign up to unlock all features and connect with movie lovers!
              </p>
              <div className="flex flex-col gap-2">
                <button
                  className="btn-primary btn-sm w-full text-xs font-medium"
                  onClick={() => window.location.href = '/signup'}
                >
                  Sign Up
                </button>
                <button
                  className="btn-outline btn-sm w-full text-xs font-medium"
                  onClick={() => window.location.href = '/login'}
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>


    </>
  );
};

export default Sidebar;
