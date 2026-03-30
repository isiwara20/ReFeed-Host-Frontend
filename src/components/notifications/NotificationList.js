import React from "react";

const getTitle = (notification) =>
  notification.title ||
  notification.subject ||
  notification.type ||
  "Notification";

const getBody = (notification) =>
  notification.message || notification.text || notification.body || "";

const isRead = (notification) =>
  Boolean(notification.isRead || notification.read || notification.readAt);

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const NotificationList = ({
  notifications,
  loading,
  error,
  onMarkRead,
  onMarkAllRead,
  onOpenConversation,
  emptyMessage = "No notifications yet.",
}) => {
  const unreadCount = notifications.filter((notification) => !isRead(notification)).length;

  return (
    <div className="rf-notifications-card">
      <div className="rf-notifications-card-head">
        <h2 className="rf-notifications-card-title">Notifications</h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="rf-link-btn"
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {loading && (
        <p className="rf-status-message">Loading notifications...</p>
      )}
      {error && (
        <p className="rf-status-message rf-status-error">
          {error.message || "Failed to load notifications."}
        </p>
      )}

      {notifications.length === 0 && !loading && !error && (
        <p className="rf-status-message">{emptyMessage}</p>
      )}

      <ul className="rf-notification-items">
        {notifications.map((notification) => {
          const read = isRead(notification);
          return (
            <li
              key={notification._id || notification.id}
              className={`rf-notification-item ${
                read ? "rf-notification-read" : "rf-notification-unread"
              }`}
            >
              <div className="rf-notification-main">
                <div className="rf-notification-top-row">
                  <p className="rf-notification-title">{getTitle(notification)}</p>
                  {!read && <span className="rf-unread-pill">New</span>}
                </div>
                {getBody(notification) && (
                  <p className="rf-notification-body">
                    {getBody(notification)}
                  </p>
                )}
                {notification.createdAt && (
                  <p className="rf-notification-time">
                    {formatDate(notification.createdAt)}
                  </p>
                )}
                {notification?.metadata?.conversationId && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenConversation &&
                      onOpenConversation(
                        notification.metadata.conversationId,
                        notification._id || notification.id
                      )
                    }
                    className="rf-link-btn"
                  >
                    Open conversation
                  </button>
                )}
              </div>
              {!read && (
                <button
                  type="button"
                  onClick={() =>
                    onMarkRead && onMarkRead(notification._id || notification.id)
                  }
                  className="rf-link-btn"
                >
                  Mark read
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default NotificationList;

