import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { notificationService } from '../services/notificationService'; // Commented out to avoid unused import warning

const NotificationContext = createContext();

// Mock movie release notifications
const mockNotifications = [
    {
      id: 1,
      title: "Dune: Part Three",
      message: "Coming to theaters November 2026",
      releaseDate: "2026-11-20",
      type: "upcoming_release",
      read: false,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      title: "Avatar 3",
      message: "The next chapter arrives December 2025",
      releaseDate: "2025-12-19",
      type: "upcoming_release",
      read: false,
      timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: 3,
      title: "Spider-Man: Beyond the Spider-Verse",
      message: "The multiverse adventure continues in 2024",
      releaseDate: "2024-06-29",
      type: "upcoming_release",
      read: true,
      timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: 4,
      title: "The Batman 2",
      message: "Robert Pattinson returns as the Dark Knight",
      releaseDate: "2025-10-03",
      type: "upcoming_release",
      read: false,
      timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
      id: 5,
      title: "Fantastic Four",
      message: "Marvel's First Family joins the MCU",
      releaseDate: "2025-07-25",
      type: "upcoming_release",
      read: false,
      timestamp: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    }
  ];

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize notifications
    const initializeNotifications = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from an API
        const fetchedNotifications = mockNotifications;
        setNotifications(fetchedNotifications);

        // Calculate unread count
        const unread = fetchedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeNotifications();
  }, []); // Empty dependency array since mockNotifications is now a constant

  const markAsRead = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    setUnreadCount(prevCount => Math.max(0, prevCount - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      read: false,
      timestamp: new Date().toISOString()
    };

    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
    setUnreadCount(prevCount => prevCount + 1);
  };

  const removeNotification = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    }

    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  const getUpcomingReleases = useCallback(() => {
    return notifications
      .filter(n => n.type === 'upcoming_release')
      .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    getUpcomingReleases
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
