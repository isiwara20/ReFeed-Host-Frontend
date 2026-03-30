import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import "./MessagesPage.css";

const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const MAX_MESSAGE_LENGTH = 1000;

const MessagesPage = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [contactsQuery, setContactsQuery] = useState("");
  const [conversationsQuery, setConversationsQuery] = useState("");
  const [loadingSidebar, setLoadingSidebar] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingMessageId, setUpdatingMessageId] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState("");
  const [editingMessageId, setEditingMessageId] = useState("");
  const [editingBody, setEditingBody] = useState("");
  const [openActionMenuMessageId, setOpenActionMenuMessageId] = useState("");
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState("");
  const [error, setError] = useState("");
  const messageScrollRef = useRef(null);
  const composerInputRef = useRef(null);

  const requestOptions = useMemo(
    () => ({
      authUser: {
        username: currentUser?.username,
        role: currentUser?.role
      }
    }),
    [currentUser?.role, currentUser?.username]
  );
  const conversationIdFromQuery = useMemo(
    () => new URLSearchParams(location.search).get("conversationId") || "",
    [location.search]
  );

  const loadConversations = async () => {
    if (!currentUser?.username || !currentUser?.role) return;
    setLoadingSidebar(true);
    setError("");
    try {
      const [users, existingConversations] = await Promise.all([
        apiClient.get("/conversations/users", requestOptions),
        apiClient.get("/conversations", requestOptions)
      ]);
      setContacts(Array.isArray(users) ? users : []);
      setConversations(Array.isArray(existingConversations) ? existingConversations : []);
    } catch (err) {
      setError(err.message || "Failed to load communications");
    } finally {
      setLoadingSidebar(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const data = await apiClient.get(
        `/conversations/${conversationId}/messages`,
        requestOptions
      );
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      await apiClient.patch(`/conversations/${conversationId}/read`, {}, requestOptions);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === conversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation
        )
      );
    } catch (err) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.username, currentUser?.role]);

  useEffect(() => {
    if (!conversationIdFromQuery) return;
    setActiveConversationId(conversationIdFromQuery);
  }, [conversationIdFromQuery]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    loadMessages(activeConversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  const openConversation = async (contact) => {
    setError("");
    try {
      const conversation = await apiClient.post(
        "/conversations",
        { username: contact.username, role: contact.role },
        requestOptions
      );
      const conversationId = conversation?._id;
      if (!conversationId) {
        return;
      }

      setConversations((prev) => {
        const exists = prev.some((item) => item._id === conversationId);
        if (exists) return prev;
        return [conversation, ...prev];
      });
      setActiveConversationId(conversationId);
    } catch (err) {
      setError(err.message || "Failed to open conversation");
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!activeConversationId || !messageBody.trim()) {
      return;
    }

    try {
      setSending(true);
      const sent = await apiClient.post(
        `/conversations/${activeConversationId}/messages`,
        { body: messageBody.trim() },
        requestOptions
      );
      setMessages((prev) => [...prev, sent]);
      setMessageBody("");
      await loadConversations();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const beginEditMessage = (message) => {
    setEditingMessageId(message._id);
    setEditingBody(message.body || "");
    setOpenActionMenuMessageId("");
    setConfirmDeleteMessageId("");
  };

  const cancelEditMessage = () => {
    setEditingMessageId("");
    setEditingBody("");
  };

  const saveEditedMessage = async (messageId) => {
    if (!activeConversationId || !messageId || !editingBody.trim()) {
      return;
    }

    try {
      setUpdatingMessageId(messageId);
      const updated = await apiClient.patch(
        `/conversations/${activeConversationId}/messages/${messageId}`,
        { body: editingBody.trim() },
        requestOptions
      );

      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId ? { ...message, ...updated } : message
        )
      );

      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation._id !== activeConversationId) return conversation;
          return {
            ...conversation,
            lastMessage:
              conversation.lastMessage?._id === messageId
                ? { ...conversation.lastMessage, ...updated }
                : conversation.lastMessage
          };
        })
      );

      cancelEditMessage();
    } catch (err) {
      setError(err.message || "Failed to update message");
    } finally {
      setUpdatingMessageId("");
    }
  };

  const deleteOwnMessage = async (messageId) => {
    if (!activeConversationId || !messageId) {
      return;
    }

    try {
      setDeletingMessageId(messageId);
      await apiClient.delete(
        `/conversations/${activeConversationId}/messages/${messageId}`,
        requestOptions
      );

      setMessages((prev) => prev.filter((message) => message._id !== messageId));
      if (editingMessageId === messageId) {
        cancelEditMessage();
      }
      await loadConversations();
    } catch (err) {
      setError(err.message || "Failed to delete message");
    } finally {
      setDeletingMessageId("");
      setConfirmDeleteMessageId("");
    }
  };

  useEffect(() => {
    const onDocumentMouseDown = (event) => {
      if (!event.target.closest(".rf-message-menu-wrap")) {
        setOpenActionMenuMessageId("");
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setOpenActionMenuMessageId("");
        setConfirmDeleteMessageId("");
      }
    };

    document.addEventListener("mousedown", onDocumentMouseDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocumentMouseDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    setOpenActionMenuMessageId("");
    setConfirmDeleteMessageId("");
    cancelEditMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  useEffect(() => {
    if (!messageScrollRef.current) return;
    messageScrollRef.current.scrollTop = messageScrollRef.current.scrollHeight;
  }, [messages, loadingMessages]);

  useEffect(() => {
    if (!activeConversationId || !composerInputRef.current) return;
    composerInputRef.current.focus();
  }, [activeConversationId]);

  const handleComposerKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!sending && activeConversationId && messageBody.trim()) {
        handleSendMessage(event);
      }
    }
  };

  const handleEditKeyDown = (event, messageId) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditMessage();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (!updatingMessageId && editingBody.trim()) {
        saveEditedMessage(messageId);
      }
    }
  };

  const filteredContacts = useMemo(() => {
    const q = contactsQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((contact) => {
      const label = `${contact.name || ""} ${contact.username || ""} ${contact.role || ""}`.toLowerCase();
      return label.includes(q);
    });
  }, [contacts, contactsQuery]);

  const filteredConversations = useMemo(() => {
    const q = conversationsQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conversation) => {
      const other = conversation?.otherParticipant;
      const label = `${other?.name || ""} ${other?.username || ""} ${other?.role || ""} ${conversation?.lastMessage?.body || ""}`.toLowerCase();
      return label.includes(q);
    });
  }, [conversations, conversationsQuery]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0),
    [conversations]
  );

  const activeConversation = conversations.find(
    (conversation) => conversation._id === activeConversationId
  );

  const activeConversationLabel =
    activeConversation?.otherParticipant?.name ||
    activeConversation?.otherParticipant?.username ||
    "Messages";

  return (
    <div className="rf-messages-page">
      <header className="rf-messages-header">
        <div>
          <h1>Messages</h1>
          <p>Chat with donors and NGOs in one place. Unread: {totalUnread}</p>
        </div>
        <button
          type="button"
          className="rf-header-refresh"
          onClick={loadConversations}
          disabled={loadingSidebar}
        >
          {loadingSidebar ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && <p className="rf-error-note">{error}</p>}

      <div className="rf-messages-grid">
        <section className="rf-card rf-card-contacts">
          <h2 className="rf-card-title">Contacts</h2>
          <input
            type="text"
            className="rf-list-search"
            placeholder="Search contacts"
            value={contactsQuery}
            onChange={(event) => setContactsQuery(event.target.value)}
          />
          <ul className="rf-list">
          {filteredContacts.map((contact) => (
            <li key={`${contact.role}-${contact.username}`}>
              <button
                type="button"
                onClick={() => openConversation(contact)}
                className="rf-list-btn"
              >
                <div className="rf-list-title">{contact.name || contact.username}</div>
                <div className="rf-list-meta">
                  {contact.username} ({contact.role})
                </div>
              </button>
            </li>
          ))}
            {filteredContacts.length === 0 && (
              <li>
                <p className="rf-empty-note">No contacts found.</p>
              </li>
            )}
          </ul>
        </section>

        <section className="rf-card rf-card-conversations">
          <h2 className="rf-card-title">Conversations</h2>
          <input
            type="text"
            className="rf-list-search"
            placeholder="Search conversations"
            value={conversationsQuery}
            onChange={(event) => setConversationsQuery(event.target.value)}
          />
          <ul className="rf-list">
          {filteredConversations.map((conversation) => (
            <li key={conversation._id}>
              <button
                type="button"
                onClick={() => setActiveConversationId(conversation._id)}
                className={`rf-list-btn ${
                  activeConversationId === conversation._id ? "rf-list-btn-active" : ""
                }`}
                aria-current={activeConversationId === conversation._id ? "true" : undefined}
              >
                <div className="rf-list-title">
                  {conversation?.otherParticipant?.name || conversation?.otherParticipant?.username}
                </div>
                <div className="rf-list-row">
                  <div className="rf-list-snippet">
                    {conversation?.lastMessage?.body || "No messages yet"}
                  </div>
                  {conversation?.unreadCount > 0 && (
                    <span className="rf-unread-badge">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
            {filteredConversations.length === 0 && (
              <li>
                <p className="rf-empty-note">No conversations found.</p>
              </li>
            )}
          </ul>
        </section>

        <section className="rf-card rf-card-messages">
          <div className="rf-message-pane-head">
            <h2 className="rf-card-title">{activeConversationLabel}</h2>
            {activeConversation && (
              <p className="rf-list-meta">
                {activeConversation?.otherParticipant?.username} ({activeConversation?.otherParticipant?.role})
              </p>
            )}
          </div>

          {!activeConversationId && (
            <p className="rf-empty-note rf-empty-note-padded">
              Select a conversation to start messaging, or choose a contact to begin a new chat.
            </p>
          )}

          {loadingMessages && <p className="rf-empty-note">Loading messages...</p>}
          {!loadingMessages && (
            <div className="rf-message-scroll" ref={messageScrollRef}>
              {messages.length === 0 && (
                <p className="rf-empty-note">No messages yet. Send the first message.</p>
              )}
            {messages.map((message) => (
              (() => {
                const isOwnMessage =
                  message.senderUsername === currentUser?.username &&
                  String(message.senderRole || "").toUpperCase() ===
                    String(currentUser?.role || "").toUpperCase();
                const isEditing = editingMessageId === message._id;
                const isActionMenuOpen = openActionMenuMessageId === message._id;
                const isDeleteConfirmOpen = confirmDeleteMessageId === message._id;

                return (
              <div
                key={message._id}
                className={`rf-message-bubble ${
                  isOwnMessage
                    ? "rf-message-outgoing"
                    : "rf-message-incoming"
                }`}
              >
                <div className="rf-message-meta">
                  <span>
                    {message.senderUsername} ({message.senderRole})
                    {message.editedAt ? " (edited)" : ""}
                  </span>
                  <div className="rf-message-meta-right">
                    {message.createdAt && <span>{formatTimestamp(message.createdAt)}</span>}
                    {isOwnMessage && !isEditing && (
                      <div className="rf-message-menu-wrap">
                        <button
                          type="button"
                          className="rf-message-menu-trigger"
                          onClick={() => {
                            setOpenActionMenuMessageId((prev) =>
                              prev === message._id ? "" : message._id
                            );
                            setConfirmDeleteMessageId("");
                          }}
                          aria-expanded={isActionMenuOpen}
                          aria-label="Open message actions"
                        >
                          <span aria-hidden="true">•••</span>
                        </button>

                        {isActionMenuOpen && (
                          <div className="rf-message-menu" role="menu" aria-label="Message actions">
                            <button
                              type="button"
                              className="rf-message-menu-item"
                              onClick={() => beginEditMessage(message)}
                              role="menuitem"
                            >
                              Edit message
                            </button>
                            <button
                              type="button"
                              className="rf-message-menu-item rf-message-menu-item-danger"
                              onClick={() => {
                                setConfirmDeleteMessageId(message._id);
                                setOpenActionMenuMessageId("");
                              }}
                              role="menuitem"
                            >
                              Delete message
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!isEditing && <div className="rf-message-body">{message.body}</div>}

                {isEditing && (
                  <div className="rf-message-edit-wrap">
                    <textarea
                      className="rf-message-edit-input"
                      rows={3}
                      value={editingBody}
                      maxLength={MAX_MESSAGE_LENGTH}
                      onChange={(event) => setEditingBody(event.target.value)}
                      onKeyDown={(event) => handleEditKeyDown(event, message._id)}
                    />
                    <div className="rf-message-actions">
                      <button
                        type="button"
                        className="rf-msg-action-btn rf-msg-action-primary"
                        onClick={() => saveEditedMessage(message._id)}
                        disabled={updatingMessageId === message._id || !editingBody.trim()}
                      >
                        {updatingMessageId === message._id ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        className="rf-msg-action-btn"
                        onClick={cancelEditMessage}
                        disabled={updatingMessageId === message._id}
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="rf-message-edit-hint">
                      Press Ctrl+Enter to save, Esc to cancel. {editingBody.trim().length}/{MAX_MESSAGE_LENGTH}
                    </p>
                  </div>
                )}

                {isOwnMessage && !isEditing && isDeleteConfirmOpen && (
                  <div className="rf-delete-confirm" role="alertdialog" aria-label="Delete message confirmation">
                    <p>Delete this message for everyone?</p>
                    <div className="rf-message-actions">
                      <button
                        type="button"
                        className="rf-msg-action-btn"
                        onClick={() => setConfirmDeleteMessageId("")}
                        disabled={deletingMessageId === message._id}
                      >
                        Keep
                      </button>
                      <button
                        type="button"
                        className="rf-msg-action-btn rf-msg-action-danger"
                        onClick={() => deleteOwnMessage(message._id)}
                        disabled={deletingMessageId === message._id}
                      >
                        {deletingMessageId === message._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}

              </div>
                );
              })()
            ))}
          </div>
        )}

          <form onSubmit={handleSendMessage} className="rf-composer">
          <textarea
            ref={composerInputRef}
            value={messageBody}
            onChange={(event) => setMessageBody(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            rows={3}
            placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
            className="rf-composer-input"
            disabled={!activeConversationId || sending}
          />
          <button
            type="submit"
            disabled={!activeConversationId || !messageBody.trim() || sending}
            className="rf-send-btn"
          >
            {sending ? "Sending..." : "Send message"}
          </button>
          <p className="rf-composer-hint">
            Press Enter to send, Shift+Enter for newline. {messageBody.trim().length}/1000
          </p>
        </form>
        </section>
      </div>
    </div>
  );
};

export default MessagesPage;
