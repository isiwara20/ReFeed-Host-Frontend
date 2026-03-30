import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { donorApi } from "./services/donorApi";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../../home/components/Footer";
import "./donorCreate.css";

export default function DonorCreatePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isEdit, setIsEdit]     = useState(false);
  const [form, setForm]         = useState({ name: "", email: "", phone: "", nicNumber: "", businessRegNumber: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if profile already exists
  useEffect(() => {
    donorApi.getProfile(currentUser.username, currentUser)
      .then((res) => {
        const p = res.data;
        setIsEdit(true);
        setForm({
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          nicNumber: p.nicNumber || "",
          businessRegNumber: p.businessRegNumber || "",
        });
      })
      .catch(() => setIsEdit(false))
      .finally(() => setChecking(false));
  }, []); // eslint-disable-line

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    if (!isEdit) {
      if (!form.name.trim())  return "Full name is required.";
      if (!form.email.trim()) return "Email address is required.";
      if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address.";
      if (!form.phone.trim()) return "Phone number is required.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) return setError(err);
    try {
      setLoading(true);
      if (isEdit) {
        await donorApi.updateProfile(
          { nicNumber: form.nicNumber, businessRegNumber: form.businessRegNumber },
          currentUser
        );
      } else {
        await donorApi.createProfile(form, currentUser);
      }
      setSuccess(true);
      setTimeout(() => navigate("/donor-profile"), 1500);
    } catch (ex) {
      setError(ex.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} profile.`);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="dcp-page">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: "60vh" }}>
          <div className="dcp-spinner" style={{ width: 36, height: 36, borderWidth: 3, borderColor: "#e5e7eb", borderTopColor: "#00c853" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dcp-page">
      {/* ── Navbar ── */}
      <header className="dcp-nav">
        <div className="dcp-nav-inner">
          <a href="/" className="dcp-nav-logo">Re<span>Feed</span></a>
          <nav className="dcp-nav-links">
            <a href="/">Home</a>
            <a href="/#about">About</a>
            <a href="/#features">Features</a>
            <Link to="/donator-dashboard">Dashboard</Link>
          </nav>
          <div className="dcp-nav-right">
            <span className="dcp-nav-user">{currentUser?.username}</span>
            <button className="dcp-nav-logout" onClick={() => { logout(); navigate("/"); }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="dcp-main">
        {/* Left — form */}
        <div className="dcp-form-side">
          <div className="dcp-form-wrap">

            {/* Breadcrumb */}
            <div className="dcp-breadcrumb">
              <Link to="/donator-dashboard">Dashboard</Link>
              <span>/</span>
              <span>{isEdit ? "Edit Profile" : "Create Profile"}</span>
            </div>

            <h1 className="dcp-title">{isEdit ? "Edit Donor Profile" : "Create Donor Profile"}</h1>
            <p className="dcp-subtitle">
              {isEdit
                ? "Update your NIC or business registration number below."
                : "Fill in your details to start donating surplus food to verified NGOs."}
            </p>

            {error && (
              <div className="dcp-alert dcp-alert-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="dcp-alert dcp-alert-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {isEdit ? "Profile updated!" : "Profile created!"} Redirecting…
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Row 1 */}
              <div className="dcp-row">
                <div className="dcp-field">
                  <label htmlFor="name">
                    Full Name <span className="dcp-req">*</span>
                  </label>
                  <div className="dcp-input-wrap">
                    <svg className="dcp-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input id="name" type="text" placeholder="John Doe" value={form.name} onChange={set("name")} disabled={isEdit} />
                  </div>
                </div>

                <div className="dcp-field">
                  <label htmlFor="email">
                    Email Address <span className="dcp-req">*</span>
                  </label>
                  <div className="dcp-input-wrap">
                    <svg className="dcp-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} disabled={isEdit} />
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="dcp-row">
                <div className="dcp-field">
                  <label htmlFor="phone">
                    Phone Number <span className="dcp-req">*</span>
                  </label>
                  <div className="dcp-input-wrap">
                    <svg className="dcp-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <input id="phone" type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={set("phone")} disabled={isEdit} />
                  </div>
                </div>

                <div className="dcp-field">
                  <label htmlFor="nic">NIC Number <span className="dcp-optional">(optional)</span></label>
                  <div className="dcp-input-wrap">
                    <svg className="dcp-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    <input id="nic" type="text" placeholder="NIC / ID number" value={form.nicNumber} onChange={set("nicNumber")} />
                  </div>
                </div>
              </div>

              {/* Row 3 — full width */}
              <div className="dcp-field">
                <label htmlFor="brn">Business Registration Number <span className="dcp-optional">(optional)</span></label>
                <div className="dcp-input-wrap">
                  <svg className="dcp-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <input id="brn" type="text" placeholder="e.g. REG-2024-00123" value={form.businessRegNumber} onChange={set("businessRegNumber")} />
                </div>
              </div>

              {/* Info note */}
              <div className="dcp-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {isEdit
                  ? "Only NIC and Business Registration Number can be updated."
                  : <>Your profile will be reviewed. Verification status starts as <strong>Pending</strong>.</>}
              </div>

              {/* Actions */}
              <div className="dcp-actions">
                <button type="submit" className="dcp-btn dcp-btn-primary" disabled={loading || success}>
                  {loading ? <span className="dcp-spinner" /> : null}
                  {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Profile"}
                </button>
                <Link to="/donor-profile" className="dcp-btn dcp-btn-view">
                  View Profile
                </Link>
                <Link to="/donator-dashboard" className="dcp-btn dcp-btn-ghost">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right — visual panel */}
        <div className="dcp-visual-side">
          <div className="dcp-visual-content">
            <div className="dcp-visual-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00c853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 className="dcp-visual-title">Why create a profile?</h2>
            <ul className="dcp-visual-list">
              {[
                "Get matched with verified NGOs near you",
                "Track all your donations in one place",
                "Receive real-time WhatsApp updates",
                "Build your impact report over time",
                "QR-verified pickups for accountability",
              ].map((item, i) => (
                <li key={i}>
                  <span className="dcp-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="dcp-visual-stat">
              <div className="dcp-visual-stat-value">12K+</div>
              <div className="dcp-visual-stat-label">Meals redistributed by donors like you</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
