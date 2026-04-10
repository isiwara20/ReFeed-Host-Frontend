import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api/client";
import "./NotificationBell.css";

const POLL_INTERVAL_MS = 30000; // 30 seconds
const PREVIEW_LIMIT = 6;

const isUnread = (notification) =>
  !(notification.isRead || notification.read || notification.readAt);

const getTitle = (notification) =>
  notification.title || notification.subject || notification.type || "Notification";

const getBody = (notification) =>
  notification.message || notification.text || notification.body || "";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const getUserId = (currentUser) =>
  currentUser?._id || currentUser?.id || currentUser?.userId || "";

const NotificationBell = ({ className = "" }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = getUserId(currentUser);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewNotifications, setPreviewNotifications] = useState([]);
  const menuRef = useRef(null);
  const hasUnread = unreadCount > 0;

  const loadUnreadCount = async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    setLoadingCount(true);
    try {
      const data = await apiClient.get(
        `/notifications/user/${userId}/unread-count`,
        { token: currentUser.token }
      );
      setUnreadCount(Number(data?.unreadCount || 0));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load notifications for bell", error);
    } finally {
      setLoadingCount(false);
    }
  };

  const loadPreviewNotifications = async () => {
    if (!userId) return;

    setPreviewLoading(true);
    setPreviewError("");
    try {
      const data = await apiClient.get(
        `/notifications/user/${userId}?limit=${PREVIEW_LIMIT}&skip=0`,
        { token: currentUser.token }
      );
      const items = Array.isArray(data) ? data : data?.notifications || [];
      setPreviewNotifications(items);
      if (Number.isFinite(data?.unreadCount)) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      setPreviewError(
        error?.data?.error || error?.data?.message || error?.message || "Failed to load notifications."
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setPreviewNotifications([]);
      return undefined;
    }

    loadUnreadCount();
    const intervalId = setInterval(loadUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUser?.token]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const handleToggleMenu = async () => {
    const next = !menuOpen;
    setMenuOpen(next);
    if (next) {
      await loadPreviewNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    if (!notificationId || !userId) return;

    try {
      await apiClient.patch(
        `/notifications/${notificationId}/read`,
        {},
        { token: currentUser.token }
      );

      setPreviewNotifications((prev) =>
        prev.map((notification) =>
          (notification._id || notification.id) === notificationId
            ? { ...notification, isRead: true, read: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    try {
      await apiClient.patch(
        "/notifications/read-all",
        { userId },
        { token: currentUser.token }
      );

      setPreviewNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
          read: true,
          readAt: notification.readAt || new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const handleOpenNotification = async (notification) => {
    const notificationId = notification._id || notification.id;
    if (isUnread(notification) && notificationId) {
      await markAsRead(notificationId);
    }

    if (notification?.metadata?.conversationId) {
      setMenuOpen(false);
      if (location.pathname.startsWith("/admin-dashboard")) {
        navigate(`/admin-dashboard?page=messages&conversationId=${notification.metadata.conversationId}`);
        return;
      }
      if (location.pathname.startsWith("/ngo-dashboard")) {
        navigate(`/ngo-dashboard?page=messages&conversationId=${notification.metadata.conversationId}`);
        return;
      }
      navigate(`/messages?conversationId=${notification.metadata.conversationId}`);
    }
  };

  const handleMarkReadClick = async (event, notification) => {
    event.stopPropagation();
    const id = notification._id || notification.id;
    await markAsRead(id);
  };

  const openNotificationCenter = () => {
    setMenuOpen(false);
    if (location.pathname.startsWith("/admin-dashboard")) {
      navigate("/admin-dashboard?page=notifications");
      return;
    }
    if (location.pathname.startsWith("/ngo-dashboard")) {
      navigate("/ngo-dashboard?page=notifications");
      return;
    }
    navigate("/notifications");
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`rf-bell-wrap ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={handleToggleMenu}
        className={`rf-bell ${hasUnread ? "rf-bell-has-unread" : ""}`}
        aria-expanded={menuOpen}
        aria-haspopup="dialog"
        aria-label={
          loadingCount
            ? "Loading notifications"
            : `You have ${unreadCount} unread notifications`
        }
      >
        <span className="rf-bell-icon-wrap">
          {/* Simple bell icon using SVG to avoid extra dependencies */}
          <svg
            className="rf-bell-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="rf-bell-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
      </button>

      {menuOpen && (
        <div className="rf-bell-popup" role="dialog" aria-label="Notifications popup">
          <div className="rf-bell-popup-head">
            <div>
              <h3>Notifications</h3>
              <p className="rf-bell-popup-subtitle">
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rf-bell-popup-actions">
              <button
                type="button"
                onClick={loadPreviewNotifications}
                className="rf-bell-popup-link"
              >
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="rf-bell-popup-link"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {previewLoading && (
            <p className="rf-bell-popup-note">Loading notifications...</p>
          )}
          {!previewLoading && previewError && (
            <p className="rf-bell-popup-note rf-bell-popup-error">{previewError}</p>
          )}

          {!previewLoading && !previewError && (
            <ul className="rf-bell-popup-list">
              {previewNotifications.map((notification) => {
                const unread = isUnread(notification);
                const notificationId = notification._id || notification.id;

                return (
                  <li key={notificationId}>
                    <button
                      type="button"
                      className={`rf-bell-item ${unread ? "rf-bell-item-unread" : ""}`}
                      onClick={() => handleOpenNotification(notification)}
                    >
                      <div className="rf-bell-item-top">
                        <span className="rf-bell-item-title">{getTitle(notification)}</span>
                        {unread && <span className="rf-bell-dot" />}
                      </div>
                      {getBody(notification) && (
                        <p className="rf-bell-item-body">{getBody(notification)}</p>
                      )}
                      <div className="rf-bell-item-bottom">
                        {notification.createdAt && (
                          <span className="rf-bell-item-time">
                            {formatDate(notification.createdAt)}
                          </span>
                        )}
                        {unread && (
                          <button
                            type="button"
                            className="rf-bell-mark-read"
                            onClick={(event) => handleMarkReadClick(event, notification)}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}

              {previewNotifications.length === 0 && (
                <li>
                  <p className="rf-bell-popup-note">No notifications yet.</p>
                </li>
              )}
            </ul>
          )}

          <div className="rf-bell-popup-foot">
            <button
              type="button"
              className="rf-bell-popup-view-all"
              onClick={openNotificationCenter}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

