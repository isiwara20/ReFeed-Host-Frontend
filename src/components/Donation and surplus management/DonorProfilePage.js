import React, { useEffect, useState } from "react";
import { donorApi } from "./services/donorApi";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../home/components/Footer";
import "./donorProfile.css";

export default function DonorProfilePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [image, setImage]       = useState(null);

  useEffect(() => { loadProfile(); }, []); // eslint-disable-line

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await donorApi.getProfile(currentUser.username, currentUser);
      setProfile(res.data);
      if (res.data?.profileImage) setImage(res.data.profileImage);
    } catch {
      setError("Profile not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        setImage(base64);
        try {
          await donorApi.updateProfile({ profileImage: base64 }, currentUser);
        } catch (err) { console.error("Image save failed:", err?.response?.data || err.message); }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;
    try {
      setDeleting(true);
      await donorApi.deleteProfile(currentUser.username, currentUser);
      navigate("/donator-dashboard");
    } catch {
      setError("Delete failed. Please try again.");
      setDeleting(false);
    }
  };

  const statusColor = { APPROVED: "green", PENDING: "orange", REJECTED: "red" };

  return (
    <div className="dpp-page">
      {/* Navbar */}
      <header className="dpp-nav">
        <div className="dpp-nav-inner">
          <a href="/" className="dpp-nav-logo">Re<span>Feed</span></a>
          <nav className="dpp-nav-links">
            <a href="/">Home</a>
            <Link to="/donator-dashboard">Dashboard</Link>
            <Link to="/create-donor">Edit Profile</Link>
          </nav>
          <div className="dpp-nav-right">
            <span className="dpp-nav-user">{currentUser?.username}</span>
            <button className="dpp-nav-logout" onClick={() => { logout(); navigate("/"); }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="dpp-main">
        {/* Hero */}
        <div className="dpp-hero">
          <div className="dpp-hero-text">
            <h1 className="dpp-hero-title">Your Donor Profile</h1>
            <p className="dpp-hero-sub">Manage your details, track verification status, and keep your information up to date.</p>
          </div>
          <div className="dpp-hero-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=520&q=80"
              alt="Food donation"
              className="dpp-hero-img"
            />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="dpp-breadcrumb">
          <Link to="/donator-dashboard">Dashboard</Link>
          <span>/</span>
          <span>My Profile</span>
        </div>

        {loading && (
          <div className="dpp-state">
            <div className="dpp-spinner" />
            <p>Loading profile…</p>
          </div>
        )}

        {!loading && error && (
          <div className="dpp-state">
            <div className="dpp-state-icon dpp-state-icon-warn">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="dpp-state-msg">{error}</p>
            <Link to="/create-donor" className="dpp-btn dpp-btn-primary">Create Profile</Link>
          </div>
        )}

        {!loading && profile && (
          <div className="dpp-layout">
            {/* Left — profile card */}
            <div className="dpp-card">
              {/* Avatar */}
              <div className="dpp-avatar-wrap">
                {image ? (
                  <img src={image} alt="profile" className="dpp-avatar-img" />
                ) : (
                  <div className="dpp-avatar-placeholder">
                    {profile.name?.slice(0, 2).toUpperCase() || "DN"}
                  </div>
                )}
                <label className="dpp-avatar-upload" title="Upload photo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              <h2 className="dpp-name">{profile.name}</h2>
              <p className="dpp-username">@{currentUser?.username}</p>

              <span className={`dpp-badge dpp-badge-${statusColor[profile.verificationStatus] || "orange"}`}>
                {profile.verificationStatus}
              </span>

              <div className="dpp-card-actions">
                <Link to="/create-donor" className="dpp-btn dpp-btn-outline">
                  Edit Profile
                </Link>
                <button
                  className="dpp-btn dpp-btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>

            {/* Right — details */}
            <div className="dpp-details">
              <div className="dpp-section">
                <h3 className="dpp-section-title">Personal Information</h3>
                <div className="dpp-info-grid">
                  <div className="dpp-info-item">
                    <span className="dpp-info-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      Full Name
                    </span>
                    <span className="dpp-info-value">{profile.name}</span>
                  </div>
                  <div className="dpp-info-item">
                    <span className="dpp-info-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Email
                    </span>
                    <span className="dpp-info-value">{profile.email}</span>
                  </div>
                  <div className="dpp-info-item">
                    <span className="dpp-info-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      Phone
                    </span>
                    <span className="dpp-info-value">{profile.phone}</span>
                  </div>
                  {profile.nicNumber && (
                    <div className="dpp-info-item">
                      <span className="dpp-info-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                        </svg>
                        NIC Number
                      </span>
                      <span className="dpp-info-value">{profile.nicNumber}</span>
                    </div>
                  )}
                  {profile.businessRegNumber && (
                    <div className="dpp-info-item">
                      <span className="dpp-info-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        Business Reg No
                      </span>
                      <span className="dpp-info-value">{profile.businessRegNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="dpp-section">
                <h3 className="dpp-section-title">Verification Status</h3>
                <div className={`dpp-status-card dpp-status-card-${statusColor[profile.verificationStatus] || "orange"}`}>
                  <div className="dpp-status-card-icon">
                    {profile.verificationStatus === "APPROVED" ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : profile.verificationStatus === "REJECTED" ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="dpp-status-card-title">{profile.verificationStatus}</div>
                    <div className="dpp-status-card-desc">
                      {profile.verificationStatus === "APPROVED" && "Your profile is verified. You can post donations."}
                      {profile.verificationStatus === "PENDING"  && "Your profile is under review. We'll notify you soon."}
                      {profile.verificationStatus === "REJECTED" && "Verification failed. Please update your documents."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
