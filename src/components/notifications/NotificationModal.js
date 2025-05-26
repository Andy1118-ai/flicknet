import React, { useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaFilm, FaCheck, FaTrash, FaBell } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';

const NotificationModal = ({ onClose }) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    getUpcomingReleases
  } = useNotifications();

  const upcomingReleases = getUpcomingReleases();

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleRemoveNotification = (notificationId) => {
    removeNotification(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilRelease = (releaseDate) => {
    const today = new Date();
    const release = new Date(releaseDate);
    const diffTime = release - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Released';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <FaBell className="title-icon" />
            Movie Notifications
          </h2>
          <div className="header-actions">
            {notifications.some(n => !n.read) && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
              >
                <FaCheck />
              </button>
            )}
            <button
              className="close-btn"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="modal-content">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <FaFilm className="empty-icon" />
              <h3>No notifications yet</h3>
              <p>We'll notify you about upcoming movie releases and updates!</p>
            </div>
          ) : (
            <div className="notifications-list">
              {upcomingReleases.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">
                        <FaFilm className="movie-icon" />
                        {notification.title}
                      </h4>
                      <div className="notification-actions">
                        {!notification.read && (
                          <button
                            className="action-btn read-btn"
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleRemoveNotification(notification.id)}
                          title="Remove notification"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <p className="notification-message">
                      {notification.message}
                    </p>

                    <div className="notification-meta">
                      <div className="release-info">
                        <FaCalendarAlt className="calendar-icon" />
                        <span className="release-date">
                          {formatDate(notification.releaseDate)}
                        </span>
                        <span className="days-until">
                          ({getDaysUntilRelease(notification.releaseDate)})
                        </span>
                      </div>
                      <div className="notification-time">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .notification-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .notification-modal {
          background: var(--white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 500px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--navy-blue);
          margin: 0;
        }

        .title-icon {
          color: var(--primary-blue);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mark-all-read-btn,
        .close-btn {
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .mark-all-read-btn:hover {
          color: var(--success);
          background-color: var(--gray-100);
        }

        .close-btn:hover {
          color: var(--gray-700);
          background-color: var(--gray-100);
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--gray-500);
        }

        .empty-icon {
          font-size: 3rem;
          color: var(--gray-300);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: var(--gray-600);
          margin-bottom: 0.5rem;
        }

        .notifications-list {
          padding: 0 1.5rem 1rem;
        }

        .notification-item {
          position: relative;
          padding: 1rem;
          border-radius: var(--radius-lg);
          margin-bottom: 0.75rem;
          transition: all var(--transition-fast);
          border: 1px solid var(--gray-200);
        }

        .notification-item:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .notification-item.unread {
          background-color: var(--pale-blue);
          border-color: var(--light-blue);
        }

        .notification-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .notification-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--navy-blue);
          margin: 0;
          flex: 1;
        }

        .movie-icon {
          color: var(--primary-blue);
          font-size: 0.875rem;
        }

        .notification-actions {
          display: flex;
          gap: 0.25rem;
        }

        .action-btn {
          background: none;
          border: none;
          color: var(--gray-400);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          transition: all var(--transition-fast);
        }

        .read-btn:hover {
          color: var(--success);
          background-color: rgba(16, 185, 129, 0.1);
        }

        .delete-btn:hover {
          color: var(--error);
          background-color: rgba(239, 68, 68, 0.1);
        }

        .notification-message {
          color: var(--gray-700);
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .notification-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
        }

        .release-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-blue);
          font-weight: 500;
        }

        .calendar-icon {
          font-size: 0.75rem;
        }

        .days-until {
          color: var(--gray-600);
          font-weight: normal;
        }

        .notification-time {
          color: var(--gray-500);
        }

        .unread-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 8px;
          height: 8px;
          background-color: var(--primary-blue);
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .notification-modal {
            margin: 0.5rem;
            max-height: 90vh;
          }

          .modal-header {
            padding: 1rem;
          }

          .notifications-list {
            padding: 0 1rem 1rem;
          }

          .notification-item {
            padding: 0.75rem;
          }

          .notification-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .notification-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationModal;
