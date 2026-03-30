import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AuthStyles.css";
import { api } from "./api";

/* ── Eye icon ── */
const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
);

/* ── Password rules ── */
const PW_RULES = [
  { key: "length",  label: "8+ characters",    test: (p) => p.length >= 8 },
  { key: "upper",   label: "Uppercase letter",  test: (p) => /[A-Z]/.test(p) },
  { key: "lower",   label: "Lowercase letter",  test: (p) => /[a-z]/.test(p) },
  { key: "number",  label: "Number",            test: (p) => /[0-9]/.test(p) },
  { key: "special", label: "Special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH_META = [
  null,
  { label: "Very weak", color: "#ef4444", width: "20%" },
  { label: "Weak",      color: "#f97316", width: "40%" },
  { label: "Fair",      color: "#eab308", width: "60%" },
  { label: "Good",      color: "#22c55e", width: "80%" },
  { label: "Strong",    color: "#16a34a", width: "100%" },
];

/* ── OTP digit boxes ── */
function OtpBoxes({ value, onChange }) {
  const LEN = 6;
  const refs = useRef([]);
  const digits = value.split("").concat(Array(LEN).fill("")).slice(0, LEN);

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? char : d)).join("");
    onChange(next);
    if (char && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, idx) => (idx === i ? "" : d)).join("");
      onChange(next.trimEnd());
      if (i > 0) refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    onChange(pasted);
    refs.current[Math.min(pasted.length, LEN - 1)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="otp-boxes">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`otp-box ${d ? "filled" : ""}`}
        />
      ))}
    </div>
  );
}

/* ── OTP Overlay ── */
function OtpOverlay({ phone, onVerified, onClose }) {
  const [otp, setOtp]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef(null);

  const startTimer = useCallback((secs = 60) => {
    setCountdown(secs);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);

  // Auto-send OTP once when overlay mounts — ref guard prevents StrictMode double-fire
  const sentRef = useRef(false);
  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    (async () => {
      setSending(true);
      try {
        const res = await api.sendOTP(phone);
        if (res.message?.toLowerCase().includes("sent")) {
          setSuccess("OTP sent to your WhatsApp.");
          startTimer();
        } else {
          setError(res.message || "Failed to send OTP.");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSending(false);
      }
    })();
    return () => { clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async () => {
    if (countdown > 0) return;
    setError(""); setSuccess("");
    setSending(true);
    try {
      const res = await api.sendOTP(phone);
      if (res.message?.toLowerCase().includes("sent")) {
        setSuccess("OTP resent to your WhatsApp.");
        startTimer();
        setOtp("");
      } else {
        setError(res.message || "Failed to resend OTP.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 6) { setError("Enter the full 6-digit OTP."); return; }
    setError(""); setLoading(true);
    try {
      const res = await api.verifyOTP(phone, otp);
      if (res.message?.toLowerCase().includes("verified")) {
        clearInterval(timerRef.current);
        onVerified();
      } else {
        setError(res.message || "Invalid OTP. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay-backdrop">
      <div className="overlay-card" role="dialog" aria-modal="true" aria-label="WhatsApp OTP Verification">
        {/* Header */}
        <div className="overlay-header">
          <div className="overlay-icon-wrap">
            <span style={{ fontSize: 28 }}>💬</span>
          </div>
          <h2 className="overlay-title">Verify WhatsApp</h2>
          <p className="overlay-subtitle">
            We sent a 6-digit code to<br />
            <strong style={{ color: "var(--text)" }}>{phone}</strong>
          </p>
        </div>

        {/* Status */}
        {sending && (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <span className="spinner" style={{ borderTopColor: "var(--primary)", borderColor: "rgba(22,163,74,0.2)" }} />
            Sending OTP…
          </div>
        )}
        {success && !sending && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ {success}</div>}
        {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>⚠️ {error}</div>}

        {/* OTP input */}
        <div style={{ marginBottom: 20 }}>
          <OtpBoxes value={otp} onChange={setOtp} />
        </div>

        {/* Countdown / resend */}
        <div className="otp-resend-row">
          {countdown > 0 ? (
            <span className="otp-countdown">
              Resend in <strong>{String(Math.floor(countdown / 60)).padStart(2,"0")}:{String(countdown % 60).padStart(2,"0")}</strong>
            </span>
          ) : (
            <button
              type="button"
              className="otp-resend-btn"
              onClick={handleResend}
              disabled={sending}
            >
              {sending ? "Sending…" : "Resend OTP"}
            </button>
          )}
        </div>

        {/* Actions */}
        <button
          type="button"
          className="btn-primary"
          onClick={handleVerify}
          disabled={loading || otp.length < 6}
          style={{ marginBottom: 10 }}
        >
          {loading && <span className="spinner" />}
          {loading ? "Verifying…" : "Verify OTP"}
        </button>

        <button type="button" className="overlay-cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Creating Account Overlay ── */
const STEPS = [
  { icon: "🔐", label: "Encrypting your credentials" },
  { icon: "💾", label: "Saving your profile"         },
  { icon: "🏗️",  label: "Preparing your dashboard"   },
  { icon: "🔔", label: "Setting up notifications"    },
  { icon: "💬", label: "Sending WhatsApp details"    },
  { icon: "✅", label: "Everything is ready"         },
];

const STEP_INTERVAL  = 600;                          // ms between each step appearing
const ANIMATION_DONE = STEPS.length * STEP_INTERVAL; // total animation time

function CreatingOverlay({ username }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [activeIdx, setActiveIdx]       = useState(0);
  // showSuccess only flips true after ALL steps have animated
  const [showSuccess, setShowSuccess]   = useState(false);

  useEffect(() => {
    // Step-by-step reveal — always runs regardless of when API responds
    const stepTimers = STEPS.map((_, i) =>
      setTimeout(() => {
        setVisibleCount(i + 1);
        setActiveIdx(i);
      }, i * STEP_INTERVAL)
    );

    // After all steps done, flip to success screen
    const successTimer = setTimeout(() => {
      setShowSuccess(true);
    }, ANIMATION_DONE + 400);

    return () => {
      stepTimers.forEach(clearTimeout);
      clearTimeout(successTimer);
    };
  }, []);

  return (
    <div className="overlay-backdrop">
      <div className="overlay-card creating-overlay-card">

        <div className="creating-header">
          {showSuccess ? (
            <div className="creating-success-icon">🎉</div>
          ) : (
            <div className="creating-ring">
              <div className="creating-ring-inner" />
            </div>
          )}
          <h2 className="overlay-title" style={{ marginTop: 14 }}>
            {showSuccess ? "Account Created!" : "Setting things up…"}
          </h2>
          {showSuccess && username && (
            <p className="creating-username-msg">
              Your username is{" "}
              <strong style={{ color: "var(--primary-dark)" }}>"{username}"</strong>
              <br />
              <span style={{ fontSize: 12 }}>Check your WhatsApp for login details.</span>
            </p>
          )}
        </div>

        {!showSuccess && (
          <div className="creating-steps">
            {STEPS.map((s, i) => {
              const isVisible = i < visibleCount;
              const isDone    = i < activeIdx;
              const isActive  = i === activeIdx;
              return (
                <div
                  key={i}
                  className={`creating-step ${isVisible ? "step-visible" : "step-hidden"} ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                >
                  <span className="creating-step-icon">{s.icon}</span>
                  <span className="creating-step-label">{s.label}</span>
                  <span className="creating-step-status">
                    {isDone   && <span className="step-done-check">✓</span>}
                    {isActive && <span className="spinner step-spinner" />}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {showSuccess && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
            Redirecting to login…
          </p>
        )}
      </div>
    </div>
  );
}


/* ── Right panel ── */
function RightPanel() {
  return (
    <div className="auth-split-right">
      <div className="right-content">
        <div className="right-illustration">
          <div className="right-illustration-inner">🌿</div>
        </div>
        <h2 className="right-title">Feed the need,<br />not the landfill</h2>
        <p className="right-subtitle">
          ReFeed connects food donors with NGOs to reduce waste and fight hunger — one meal at a time.
        </p>
        <div className="right-stats">
          <div className="stat-item">
            <div className="stat-number">2.4k+</div>
            <div className="stat-label">Meals Saved</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">180+</div>
            <div className="stat-label">NGO Partners</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Less Waste</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN REGISTER COMPONENT
══════════════════════════════════════════ */
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "", role: "donator",
  });
  const [showPw, setShowPw]       = useState(false);
  const [showCpw, setShowCpw]     = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [errors, setErrors]       = useState({});

  // Phone verification state
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showOtpOverlay, setShowOtpOverlay] = useState(false);

  // Creating account overlay
  const [creating, setCreating]   = useState(false);
  const [createdUsername, setCreatedUsername] = useState(null);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    // Reset phone verification if phone changes
    if (k === "phone") setPhoneVerified(false);
  };

  const allRulesPassed = PW_RULES.every((r) => r.test(form.password));

  const isValidPhone = /^\+?\d{10,15}$/.test(form.phone);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                     e.name = "Full name is required";
    if (!/\S+@\S+\.\S+/.test(form.email))      e.email = "Enter a valid email address";
    if (!isValidPhone)                         e.phone = "Enter a valid phone (e.g. +94771234567)";
    if (!phoneVerified)                        e.phone = "Please verify your WhatsApp number first";
    if (!allRulesPassed)                       e.password = "Password doesn't meet all requirements";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setCreating(true);
    setCreatedUsername(null);

    try {
      const res = await api.register(form);
      if (res.username) {
        setCreatedUsername(res.username);
        // Navigate after animation finishes: all steps + success display time
        setTimeout(() => navigate("/login"), ANIMATION_DONE + 400 + 2500);
      } else {
        setCreating(false);
        setErrors({ submit: res.message || "Registration failed. Please try again." });
      }
    } catch {
      setCreating(false);
      setErrors({ submit: "Network error. Make sure the server is running." });
    }
  };

  const score = form.password ? PW_RULES.filter((r) => r.test(form.password)).length : 0;
  const sm    = score > 0 ? STRENGTH_META[score] : null;

  return (
    <>
      <div className="auth-split-page">
        {/* ── Left: form ── */}
        <div className="auth-split-left">
          <div className="auth-brand">
            <span className="brand-re">Re</span>
            <span className="brand-feed">Feed</span>
            <span className="brand-dot" />
          </div>

          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join ReFeed and start making a difference today.</p>

          {errors.submit && (
            <div className="alert alert-error" style={{ marginBottom: 18 }}>⚠️ {errors.submit}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* Role */}
            <div className="form-group">
              <label className="form-label">I am registering as</label>
              <div className="role-selector">
                {[
                  { value: "donator", icon: "🤝", label: "Donator", desc: "Donate surplus food" },
                  { value: "ngo",     icon: "🏢", label: "NGO",     desc: "Receive & distribute" },
                ].map((r) => (
                  <label key={r.value} className={`role-option ${form.role === r.value ? "selected" : ""}`}>
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={set("role")} />
                    <div className="role-icon">{r.icon}</div>
                    <div className="role-label">{r.label}</div>
                    <div className="role-desc">{r.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Name + Email */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">NGO / Donor Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input className={`form-input ${errors.name ? "has-error" : ""}`} type="text" placeholder="Name" value={form.name} onChange={set("name")} />
                </div>
                {errors.name && <span className="field-error">⚠ {errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input className={`form-input ${errors.email ? "has-error" : ""}`} type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
                </div>
                {errors.email && <span className="field-error">⚠ {errors.email}</span>}
              </div>
            </div>

            {/* Phone + Verify button */}
            <div className="form-group">
              <label className="form-label">WhatsApp Phone Number</label>
              <div className="phone-verify-row">
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <span className="input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  </span>
                  <input
                    className={`form-input ${errors.phone ? "has-error" : ""} ${phoneVerified ? "input-verified" : ""}`}
                    type="tel"
                    placeholder="+94771234567"
                    value={form.phone}
                    onChange={set("phone")}
                    disabled={phoneVerified}
                  />
                  {phoneVerified && (
                    <span className="verified-badge" title="WhatsApp Verified">✓</span>
                  )}
                </div>
                {!phoneVerified ? (
                  <button
                    type="button"
                    className="btn-verify-phone"
                    disabled={!isValidPhone}
                    onClick={() => setShowOtpOverlay(true)}
                  >
                    Verify
                  </button>
                ) : (
                  <span className="wa-verified-tag">
                    <span>✅</span> Verified
                  </span>
                )}
              </div>
              {errors.phone && <span className="field-error">⚠ {errors.phone}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input
                  className={`form-input ${errors.password ? "has-error" : ""}`}
                  type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={set("password")}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                />
                <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                  <EyeIcon open={showPw} />
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, minHeight: 16 }}>
                {form.password && sm && (
                  <>
                    <div className="strength-bar" style={{ flex: 1 }}>
                      <div className="strength-fill" style={{ width: sm.width, background: sm.color }} />
                    </div>
                    <span style={{ fontSize: 11, color: sm.color, fontWeight: 600, whiteSpace: "nowrap" }}>{sm.label}</span>
                  </>
                )}
              </div>

              <div className={`pw-checklist ${pwFocused || form.password ? "visible" : ""}`}>
                {PW_RULES.map((rule) => {
                  const pass = rule.test(form.password);
                  return (
                    <div key={rule.key} className={`pw-check-item ${pass ? "pass" : "fail"}`}>
                      <div className="pw-check-icon">{pass ? "✓" : ""}</div>
                      <span>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
              {errors.password && !pwFocused && <span className="field-error">⚠ {errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input
                  className={`form-input ${errors.confirmPassword ? "has-error" : ""}`}
                  type={showCpw ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                />
                <button type="button" className="input-toggle" onClick={() => setShowCpw(!showCpw)} aria-label="Toggle confirm password">
                  <EyeIcon open={showCpw} />
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">⚠ {errors.confirmPassword}</span>}
              {!errors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword && (
                <span style={{ fontSize: 11.5, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4 }}>✓ Passwords match</span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={creating}>
              Create Account
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign in</Link>
          </div>
        </div>

        <RightPanel />
      </div>

      {/* ── OTP Overlay ── */}
      {showOtpOverlay && (
        <OtpOverlay
          phone={form.phone}
          onVerified={() => {
            setPhoneVerified(true);
            setShowOtpOverlay(false);
          }}
          onClose={() => setShowOtpOverlay(false)}
        />
      )}

      {/* ── Creating Account Overlay ── */}
      {creating && <CreatingOverlay username={createdUsername} />}
    </>
  );
}
