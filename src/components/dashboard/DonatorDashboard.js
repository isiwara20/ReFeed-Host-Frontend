import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import { apiClient } from "../../api/client";
import VoiceAssistant from "../voice/VoiceAssistant";
import "./donatorDashboard.css";

/* ── Inline SVG icons ── */
const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconDonate = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconList = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const IconBell = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconSettings = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconMeals = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const IconNgo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ── Food Request Summary + Chart ── */
const CATEGORY_COLORS = {
  "non-vegetable": "#ff6b35",
  "vegetable":     "#00c853",
  "cooked":        "#3b82f6",
  "packed":        "#8b5cf6",
  "bakery":        "#f59e0b",
  "mixed":         "#6b7280",
};

const URGENCY_COLORS = {
  low:      "#00c853",
  medium:   "#f59e0b",
  high:     "#ff6b35",
  critical: "#ef4444",
};

const FoodRequestSummary = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    API.get("/food-requests/all")
      .then((res) => setRequests(res.data?.data || []))
      .catch(() => setError("Could not load food requests."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dd-fr-loading">Loading food requests…</div>;
  if (error)   return <div className="dd-fr-error">{error}</div>;
  if (requests.length === 0) return null;

  const total    = requests.length;
  const pending  = requests.filter((r) => r.status === "pending").length;
  const critical = requests.filter((r) => r.urgencyLevel === "critical").length;
  const matched  = requests.filter((r) => r.status === "matched").length;

  // Count by category
  const catCounts = {};
  requests.forEach((r) => {
    catCounts[r.category] = (catCounts[r.category] || 0) + 1;
  });
  const maxCat = Math.max(...Object.values(catCounts));

  // Count by urgency
  const urgCounts = {};
  requests.forEach((r) => {
    urgCounts[r.urgencyLevel] = (urgCounts[r.urgencyLevel] || 0) + 1;
  });

  return (
    <div className="dd-fr-section">
      <p className="dd-section-title">Food Requests Overview</p>

      {/* Summary cards */}
      <div className="dd-fr-stats">
        <div className="dd-fr-stat">
          <div className="dd-fr-stat__value">{total}</div>
          <div className="dd-fr-stat__label">Total Requests</div>
        </div>
        <div className="dd-fr-stat orange">
          <div className="dd-fr-stat__value">{pending}</div>
          <div className="dd-fr-stat__label">Pending</div>
        </div>
        <div className="dd-fr-stat green">
          <div className="dd-fr-stat__value">{matched}</div>
          <div className="dd-fr-stat__label">Matched</div>
        </div>
        <div className="dd-fr-stat red">
          <div className="dd-fr-stat__value">{critical}</div>
          <div className="dd-fr-stat__label">Critical</div>
        </div>
      </div>

      <div className="dd-fr-charts">
        {/* Category bar chart */}
        <div className="dd-fr-chart-card">
          <div className="dd-fr-chart-title">Requests by Category</div>
          <div className="dd-fr-bars">
            {Object.entries(catCounts).map(([cat, count]) => (
              <div key={cat} className="dd-fr-bar-row">
                <div className="dd-fr-bar-label">{cat}</div>
                <div className="dd-fr-bar-track">
                  <div
                    className="dd-fr-bar-fill"
                    style={{
                      width: `${(count / maxCat) * 100}%`,
                      background: CATEGORY_COLORS[cat] || "#9ca3af",
                    }}
                  />
                </div>
                <div className="dd-fr-bar-count">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency breakdown */}
        <div className="dd-fr-chart-card">
          <div className="dd-fr-chart-title">Urgency Breakdown</div>
          <div className="dd-fr-urgency-list">
            {["low","medium","high","critical"].map((u) => (
              urgCounts[u] ? (
                <div key={u} className="dd-fr-urgency-row">
                  <span className="dd-fr-urgency-dot" style={{ background: URGENCY_COLORS[u] }} />
                  <span className="dd-fr-urgency-label">{u.charAt(0).toUpperCase() + u.slice(1)}</span>
                  <span className="dd-fr-urgency-bar-wrap">
                    <span
                      className="dd-fr-urgency-bar"
                      style={{
                        width: `${(urgCounts[u] / total) * 100}%`,
                        background: URGENCY_COLORS[u],
                      }}
                    />
                  </span>
                  <span className="dd-fr-urgency-count">{urgCounts[u]}</span>
                </div>
              ) : null
            ))}
          </div>

          {/* Recent requests list */}
          <div className="dd-fr-chart-title" style={{ marginTop: 20 }}>Recent Requests</div>
          <div className="dd-fr-recent">
            {requests.slice(0, 4).map((r) => (
              <div key={r._id} className="dd-fr-recent-row">
                <span
                  className="dd-fr-recent-dot"
                  style={{ background: URGENCY_COLORS[r.urgencyLevel] || "#9ca3af" }}
                />
                <div className="dd-fr-recent-info">
                  <span className="dd-fr-recent-cat">{r.category}</span>
                  <span className="dd-fr-recent-loc">{r.location}</span>
                </div>
                <span className={`dd-fr-recent-status ${r.status}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Feature cards config ── */
const CARDS = [
  {
    color: "green",
    Icon: IconUser,
    title: "Donor Profile",
    desc: "Set up your profile with contact details and verification documents to start donating.",
    label: "Create Profile",
    to: "/create-donor",
  },
  {
    color: "orange",
    Icon: IconDonate,
    title: "Donate Surplus",
    desc: "Post surplus food instantly. Get matched with nearby verified NGOs within minutes.",
    label: "Post Donation",
    to: "/surplus",
  },
  {
    color: "blue",
    Icon: IconList,
    title: "My Donations",
    desc: "Track all your active and past donations. View pickup status and NGO assignments.",
    label: "View Donations",
    to: "/surplus",
  },
  {
    color: "purple",
    Icon: IconChart,
    title: "Reports & Trends",
    desc: "See your impact — meals donated, CO₂ saved, communities reached, and monthly trends.",
    label: "View Reports",
    to: "/reports",
  },
  {
    color: "blue",
    Icon: IconBell,
    title: "Notifications",
    desc: "Stay updated on donation pickups, NGO responses, and important alerts.",
    label: "View Notifications",
    to: "/notifications",
  },
  {
    color: "green",
    Icon: IconSettings,
    title: "Notification Settings",
    desc: "Choose how and when you receive updates — WhatsApp, email, or in-app.",
    label: "Manage Settings",
    to: "/settings/notifications",
  },
  {
    color: "orange",
    Icon: IconUser,
    title: "Restaurant Details",
    desc: "Add your restaurant name, address, photos and the foods you serve.",
    label: "Manage Restaurant",
    to: "/restaurant",
  },
];

const DonatorDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ meals: 0, ngos: 0, active: 0 });
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    if (!currentUser?.username) return;
    // surplus route expects role "DONOR", login returns "DONATOR"
    const roleHeader = currentUser.role === "DONATOR" ? "DONOR" : currentUser.role;
    apiClient
      .get("/surplus/mine", {
        headers: {
          "x-username": currentUser.username,
          "x-role": roleHeader,
        },
      })
      .then((donations) => {
        if (!Array.isArray(donations)) return;
        const done = donations.filter((d) => ["COLLECTED", "COMPLETED"].includes(d.lifecycleStatus));
        const meals = Math.round(donations.reduce((sum, d) => sum + (d.quantity?.amount || 0), 0));
        const ngos = done.length;
        const active = donations.filter((d) => ["DRAFT", "PUBLISHED", "RESERVED"].includes(d.lifecycleStatus)).length;
        setStats({ meals, ngos, active });
      })
      .catch((err) => console.error("Stats fetch failed:", err));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.username) return;
    apiClient.get("/restaurant/mine", {
      headers: { "x-username": currentUser.username, "x-role": currentUser.role },
    }).then(setRestaurant).catch(() => {});
  }, [currentUser]);

  const initials = currentUser?.username
    ? currentUser.username.slice(0, 2).toUpperCase()
    : "D";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dd-page">
      {/* Top bar */}
      <header className="dd-topbar">
        <a href="/" className="dd-topbar__logo">Re<span>Feed</span></a>
        <nav className="dd-topbar__nav">
          <a href="/" className="dd-topbar__nav-link">Home</a>
          <Link to="/surplus" className="dd-topbar__nav-link">Donations</Link>
          <Link to="/donor-profile" className="dd-topbar__nav-link">Profile</Link>
          <Link to="/restaurant" className="dd-topbar__nav-link">Restaurant</Link>
          <Link to="/reports" className="dd-topbar__nav-link">Reports</Link>
          <Link to="/notifications" className="dd-topbar__nav-link">Notifications</Link>
        </nav>
        <div className="dd-topbar__right">
          <div className="dd-topbar__user">
            <div className="dd-topbar__avatar">{initials}</div>
            <div>
              <div className="dd-topbar__username">{currentUser?.username}</div>
              <div className="dd-topbar__role">Donator</div>
            </div>
          </div>
          <button className="dd-logout-btn" onClick={handleLogout}>
            <IconLogout /> Sign out
          </button>
        </div>
      </header>

      <div className="dd-hero">
        <div className="dd-hero__overlay" />
        <div className="dd-hero__content">
          <h1>Welcome back, <span>{currentUser?.username || "Donator"}</span></h1>
          <p>Manage your donations, track your impact, and connect with NGOs.</p>
        </div>
      </div>

      <div className="dd-body">
        {/* Stats */}
        <div className="dd-stats">
          <div className="dd-stat">
            <div className="dd-stat__icon green"><IconMeals /></div>
            <div>
              <div className="dd-stat__value">{stats.meals}</div>
              <div className="dd-stat__label">Meals Donated</div>
            </div>
          </div>
          <div className="dd-stat">
            <div className="dd-stat__icon orange"><IconNgo /></div>
            <div>
              <div className="dd-stat__value">{stats.ngos}</div>
              <div className="dd-stat__label">NGOs Reached</div>
            </div>
          </div>
          <div className="dd-stat">
            <div className="dd-stat__icon blue"><IconChart /></div>
            <div>
              <div className="dd-stat__value">{stats.active}</div>
              <div className="dd-stat__label">Active Donations</div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <p className="dd-section-title">What would you like to do?</p>
        <div className="dd-grid">
          {CARDS.map(({ color, Icon, title, desc, label, to }) => (
            <Link key={title} to={to} className={`dd-card ${color}`}>
              <div className="dd-card__icon"><Icon /></div>
              <div className="dd-card__title">{title}</div>
              <div className="dd-card__desc">{desc}</div>
              <div className="dd-card__arrow">
                {label} <IconArrow />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <p className="dd-section-title">Quick actions</p>
        <div className="dd-quick">
          <Link to="/create-donor" className="dd-quick-btn primary">
            <IconUser /> Create Profile
          </Link>
          <Link to="/surplus" className="dd-quick-btn secondary">
            <IconDonate /> Post Donation
          </Link>
          <Link to="/surplus" className="dd-quick-btn ghost">
            <IconList /> My Donations
          </Link>
        </div>

        {/* Restaurant preview */}
        {restaurant && (
          <div className="dd-restaurant">
            <p className="dd-section-title">My Restaurant</p>
            <div className="dd-restaurant-card">
              {restaurant.image && (
                <img src={restaurant.image} alt="restaurant" className="dd-restaurant-img" />
              )}
              <div className="dd-restaurant-info">
                <div className="dd-restaurant-name">{restaurant.name}</div>
                {restaurant.address     && <div className="dd-restaurant-meta">{restaurant.address}</div>}
                {restaurant.phone       && <div className="dd-restaurant-meta">{restaurant.phone}</div>}
                {restaurant.openingHours && <div className="dd-restaurant-meta">{restaurant.openingHours}</div>}
                {restaurant.foodsServed  && <div className="dd-restaurant-meta">{restaurant.foodsServed}</div>}
              </div>
              <Link to="/restaurant" className="dd-restaurant-edit">Edit</Link>
            </div>
          </div>
        )}

        {/* Food Requests Summary */}
        <FoodRequestSummary />      </div>

      {/* Voice Assistant — floats over the page */}
      <VoiceAssistant />
    </div>
  );
};

export default DonatorDashboard;
