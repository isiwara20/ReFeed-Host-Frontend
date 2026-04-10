import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DonorNavbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const initials = currentUser?.username
    ? currentUser.username.slice(0, 2).toUpperCase()
    : "D";
const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <header className="dd-topbar">
            <a href="/" className="dd-topbar__logo">Re<span>Feed</span></a>
            <nav className="dd-topbar__nav">
              <a href="/donator-dashboard" className="dd-topbar__nav-link">Dashboard</a>
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
  );
};

export default DonorNavbar;
