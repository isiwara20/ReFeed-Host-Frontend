import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import "./UsersList.css";

const UsersList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [creatingConversation, setCreatingConversation] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/conversations/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    const isNotSelf = u.username !== currentUser?.username;

    return matchesSearch && matchesRole && isNotSelf;
  });

  const handleMessage = async (user) => {
    try {
      setCreatingConversation(user._id);
      const res = await API.post("/conversations", {
        participantUsername: user.username,
        participantRole: user.role
      });
      navigate(`/messages?conversation=${res.data._id}`);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setCreatingConversation(null);
    }
  };

  const getRoleBadgeClass = (role) => {
    const map = {
      DONATOR: "badge-donator",
      NGO: "badge-ngo",
      ADMIN: "badge-admin"
    };
    return map[role] || "badge-default";
  };

  const getRoleIcon = (role) => {
    const icons = {
      DONATOR: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      NGO: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      ADMIN: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
          <path d="M12 2L15.09 8.26H22L17.55 12.5L19.64 18.76L12 14.51L4.36 18.76L6.45 12.5L2 8.26H8.91L12 2Z"/>
        </svg>
      )
    };
    return icons[role] || null;
  };

  return (
    <div className="users-page">
      {/* Hero */}
      <div className="users-hero">
        <div className="users-hero-overlay" />
        <div className="users-hero-content">
          <h1 className="users-hero-title">User Directory</h1>
          <p className="users-hero-sub">
            Connect with donors, NGOs, and admins on the platform
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="users-main">
        {/* Toolbar */}
        <div className="users-toolbar">
          <div className="users-search-wrap">
            <svg className="users-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="users-search"
              type="text"
              placeholder="Search by name or username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="users-search-clear" onClick={() => setSearch("")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          <select
            className="users-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="DONATOR">Donors</option>
            <option value="NGO">NGOs</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {/* Stats */}
        {!loading && users.length > 0 && (
          <div className="users-stats">
            <span className="users-stat-item">
              <strong>{users.length}</strong> total users
            </span>
            <span className="users-stat-divider">•</span>
            <span className="users-stat-item">
              <strong>{filtered.length}</strong> showing
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="users-loading">
            <div className="users-spinner" />
            <p>Loading users…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && users.length === 0 && (
          <div className="users-empty">
            <div className="users-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="users-empty-title">No users found</h3>
            <p className="users-empty-desc">Check back later as more users join the platform.</p>
          </div>
        )}

        {/* No results */}
        {!loading && users.length > 0 && filtered.length === 0 && (
          <div className="users-empty">
            <div className="users-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 className="users-empty-title">No results</h3>
            <p className="users-empty-desc">Try adjusting your search or filter.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="users-grid">
            {filtered.map((user) => (
              <div key={user._id} className="users-card">
                <div className="users-card-header">
                  <div className="users-card-avatar">
                    {user.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="users-card-identity">
                    <h3 className="users-card-name">{user.name}</h3>
                    <p className="users-card-username">@{user.username}</p>
                  </div>
                </div>

                <div className="users-card-role">
                  <span className={`users-role-badge ${getRoleBadgeClass(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                </div>

                <button
                  className="users-card-btn"
                  onClick={() => handleMessage(user)}
                  disabled={creatingConversation === user._id}
                >
                  {creatingConversation === user._id ? (
                    <>
                      <span className="users-btn-spinner" />
                      Starting…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Message
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="users-footer">
        <p>© {new Date().getFullYear()} <strong>Re</strong><strong style={{color:"#16a34a"}}>Feed</strong> — Connecting communities to reduce food waste 🌿</p>
      </footer>
    </div>
  );
};

export default UsersList;
