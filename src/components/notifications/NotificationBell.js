import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import NotificationModal from './NotificationModal';

const NotificationBell = () => {
  const [showModal, setShowModal] = useState(false);
  const { unreadCount } = useNotifications();
  const { isAuthenticated } = useAuth();

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleBellClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        className="notification-bell"
        onClick={handleBellClick}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <FaBell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showModal && (
        <NotificationModal onClose={handleCloseModal} />
      )}

      <style jsx>{`
        .notification-bell {
          position: relative;
          background: none;
          border: none;
          color: var(--white);
          cursor: pointer;
          padding: 0.75rem;
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-bell:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .bell-icon {
          font-size: 1.25rem;
          transition: transform var(--transition-fast);
        }

        .notification-bell:hover .bell-icon {
          animation: bellRing 0.5s ease-in-out;
        }

        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }

        .notification-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background-color: var(--error);
          color: var(--white);
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .notification-badge:empty {
          display: none;
        }
      `}</style>
    </>
  );
};

export default NotificationBell;
