import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Bell,
  CheckCheck,
  CheckSquare,
  Bug,
  Flag,
  GitPullRequest,
  FileText,
  MessageSquare,
  Clock,
  X
} from 'lucide-react';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'TASK_ASSIGNED':
      return CheckSquare;
    case 'BUG_REPORTED':
    case 'BUG_RESOLVED':
      return Bug;
    case 'MILESTONE_COMPLETED':
      return Flag;
    case 'CHANGE_REQUEST':
      return GitPullRequest;
    case 'DOCUMENT_UPLOADED':
      return FileText;
    case 'NEW_MESSAGE':
      return MessageSquare;
    default:
      return Bell;
  }
};

const NotificationCenter = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (typeof res.data === 'number') {
        setUnreadCount(res.data);
      }
    } catch (err) {
      // silently ignore polling failure if not authenticated
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data) {
        setUnreadCount(res.data.unreadCount || 0);
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.patch(`/notifications/${notif.notificationId}/read`);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === notif.notificationId ? { ...n, isRead: true } : n))
        );
      }
      if (notif.targetUrl) {
        setIsOpen(false);
        navigate(notif.targetUrl);
      }
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: '1px solid #d4d4d4',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          color: '#2b2b2b',
          backgroundColor: isOpen ? '#f4f4f4' : '#ffffff',
          transition: 'all 0.15s ease'
        }}
        title="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#2b2b2b',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 800,
              borderRadius: '999px',
              padding: '0.1rem 0.35rem',
              minWidth: '17px',
              textAlign: 'center',
              lineHeight: 1.2,
              border: '2px solid #ffffff'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="animate-scale-up"
          style={{
            position: 'absolute',
            right: 0,
            top: '46px',
            width: '360px',
            maxHeight: '480px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            border: '1px solid #d4d4d4',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.85rem 1.15rem',
              borderBottom: '1px solid #ebebeb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fafafa'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2b2b2b' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.4rem', backgroundColor: '#2b2b2b', color: '#ffffff', borderRadius: '4px' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: '#666666',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 600
                }}
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '380px' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.85rem' }}>
                Loading updates...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#8c8c8c' }}>
                <Bell size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b' }}>All caught up!</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>No new notifications</div>
              </div>
            ) : (
              notifications.map((n) => {
                const IconComp = getNotificationIcon(n.type);
                return (
                  <div
                    key={n.notificationId}
                    onClick={() => handleMarkAsRead(n)}
                    style={{
                      padding: '0.85rem 1.15rem',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      backgroundColor: n.isRead ? '#ffffff' : '#f8f9fa',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      transition: 'background-color 0.12s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: n.isRead ? '#f0f0f0' : '#2b2b2b',
                        color: n.isRead ? '#666666' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <IconComp size={14} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.15rem' }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: n.isRead ? 600 : 800, color: '#2b2b2b', margin: 0 }}>
                          {n.title}
                        </h4>
                        <span style={{ fontSize: '0.68rem', color: '#8c8c8c', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#666666', margin: 0, lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                    </div>

                    {!n.isRead && (
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#2b2b2b',
                          flexShrink: 0,
                          marginTop: '6px'
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
