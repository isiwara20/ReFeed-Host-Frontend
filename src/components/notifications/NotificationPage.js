import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api/client";
import NotificationList from "./NotificationList";
import "./NotificationPage.css";

const PAGE_SIZE = 20;

const isUnread = (notification) =>
  !(notification.isRead || notification.read || notification.readAt);

const getUserId = (currentUser) =>
  currentUser?._id || currentUser?.id || currentUser?.userId || "";

const NotificationPage = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = getUserId(currentUser);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const showUnreadOnly = searchParams.get("filter") === "unread";

  const loadNotifications = async ({ append = false, skip = 0 } = {}) => {
    if (!userId) return;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const query = new URLSearchParams({
      limit: String(PAGE_SIZE),
      skip: String(skip),
      unreadOnly: String(showUnreadOnly),
    });

    try {
      const data = await apiClient.get(
        `/notifications/user/${userId}?${query.toString()}`,
        {
          token: currentUser.token,
        }
      );
      const items = Array.isArray(data) ? data : data?.notifications || [];

      setNotifications((prev) => (append ? [...prev, ...items] : items));
      setHasMore(Boolean(data?.pagination?.hasMore));
      setUnreadCount(
        Number.isFinite(data?.unreadCount)
          ? data.unreadCount
          : items.filter(isUnread).length
      );
    } catch (err) {
      setError(err);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadNotifications({ append: false, skip: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUser?.token, showUnreadOnly]);

  const handleLoadMore = () => {
    loadNotifications({ append: true, skip: notifications.length });
  };

  const handleRefresh = () => {
    loadNotifications({ append: false, skip: 0 });
  };

  const handleMarkRead = async (id) => {
    if (!userId || !id) return;
    try {
      await apiClient.patch(
        `/notifications/${id}/read`,
        {},
        { token: currentUser.token }
      );
      setNotifications((prev) =>
        prev
          .map((n) =>
            (n._id || n.id) === id ? { ...n, isRead: true, read: true } : n
          )
          .filter((n) => !showUnreadOnly || isUnread(n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      await apiClient.patch(
        "/notifications/read-all",
        { userId },
        { token: currentUser.token }
      );
      setNotifications((prev) =>
        prev
          .map((n) => ({ ...n, isRead: true, read: true }))
          .filter((n) => !showUnreadOnly || isUnread(n))
      );
      setUnreadCount(0);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const handleOpenConversation = async (conversationId, notificationId) => {
    if (!conversationId) return;
    if (notificationId) {
      await handleMarkRead(notificationId);
    }
    navigate(`/messages?conversationId=${conversationId}`);
  };

  return (
    <div className="rf-notifications-page">
      <div className="rf-notifications-hero">
        <div>
          <h1 className="rf-notifications-title">Notification Center</h1>
          <p className="rf-notifications-subtitle">
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rf-notification-controls">
          <button
            type="button"
            onClick={handleRefresh}
            className="rf-btn rf-btn-muted"
          >
            Refresh
          </button>
          <Link
            to="/notifications"
            className={`rf-filter-chip ${
              !showUnreadOnly
                ? "rf-filter-chip-active"
                : "rf-filter-chip-inactive"
            }`}
          >
            All
          </Link>
          <Link
            to="/notifications?filter=unread"
            className={`rf-filter-chip ${
              showUnreadOnly
                ? "rf-filter-chip-active"
                : "rf-filter-chip-inactive"
            }`}
          >
            Unread
          </Link>
        </div>
      </div>

      <NotificationList
        notifications={notifications}
        loading={loading}
        error={error}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onOpenConversation={handleOpenConversation}
      />

      {hasMore && (
        <div className="rf-pagination-wrap">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rf-btn rf-btn-muted"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;

