import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AuthStyles.css";

const BASE_URL = "https://refeed-hosting-backend-production.up.railway.app/api";

const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert]   = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.password)        e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((r) => r.json());

      if (res.role) {
        localStorage.setItem("refeed_user", JSON.stringify({ username: res.username, role: res.role }));
        if (res.role === "NGO")     navigate("/ngo-dashboard");
        else if (res.role === "DONATOR") navigate("/donator-dashboard");
        else if (res.role === "ADMIN")   navigate("/admin-dashboard");
        else navigate("/");
      } else {
        setAlert({ type: "error", msg: res.message || "Login failed" });
      }
    } catch {
      setAlert({ type: "error", msg: "Network error. Make sure the server is running." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-re">Re</span>
          <span className="brand-feed">Feed</span>
          <span className="brand-dot" />
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your ReFeed account</p>

        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginBottom: 16 }}>
            ⚠️ {alert.msg}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input className={`form-input ${errors.username ? "has-error" : ""}`} type="text"
                placeholder="Your username" value={form.username} onChange={set("username")} autoComplete="username" />
            </div>
            {errors.username && <span className="field-error">⚠ {errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </span>
              <input className={`form-input ${errors.password ? "has-error" : ""}`}
                type={showPw ? "text" : "password"} placeholder="Your password"
                value={form.password} onChange={set("password")} autoComplete="current-password" />
              <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                <EyeIcon open={showPw} />
              </button>
            </div>
            {errors.password && <span className="field-error">⚠ {errors.password}</span>}
          </div>

          <div style={{ textAlign: "right", marginTop: -8 }}>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: 13 }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">Create one</Link>
        </div>
      </div>
    </div>
  );
}
