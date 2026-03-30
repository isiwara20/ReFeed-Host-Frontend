import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthStyles.css";
import { api } from "./api";

/* ── Password rules (same as Register) ── */
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

/* ── Password Reset Success Overlay ── */
function ResetSuccessOverlay({ onLogin }) {
  return (
    <div className="overlay-backdrop">
      <div className="overlay-card" style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "var(--primary-xlight)", border: "2px solid var(--primary-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 34
        }}>🔐</div>

        <h2 className="overlay-title">Password Updated</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "8px 0 6px", lineHeight: 1.6 }}>
          Your password has been reset successfully.
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24, lineHeight: 1.5 }}>
          For your security, please sign in again with your new password.
        </p>

        <button className="btn-primary" onClick={onLogin}>
          Sign In Now
        </button>
      </div>
    </div>
  );
}
function Steps({ current }) {
  const steps = ["Identify", "Verify OTP", "New Password"];
  return (
    <div className="step-indicator">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className={`step ${i < current ? "done" : i === current ? "active" : ""}`}>
            <div className="step-circle">{i < current ? "✓" : i + 1}</div>
            <span className="step-label">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-line ${i < current ? "done" : ""}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── OTP digit boxes ── */
function OtpBoxes({ value, onChange }) {
  const len = 6;
  const digits = value.split("").concat(Array(len).fill("")).slice(0, len);
  const refs = useRef([]);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, idx) => (idx === i ? "" : d)).join("").padEnd(len, "").slice(0, len);
      onChange(next.trimEnd());
      if (i > 0) refs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? char : d)).join("");
    onChange(next);
    if (char && i < len - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, len);
    onChange(pasted);
    refs.current[Math.min(pasted.length, len - 1)]?.focus();
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

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  // Step 0
  const [identifier, setIdentifier] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [username, setUsername]       = useState("");

  // Step 1 – OTP
  const [otp, setOtp]             = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  // Step 2 – new password
  const [newPw, setNewPw]       = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [showCpw, setShowCpw]   = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCountdown = (secs = 60) => {
    setCountdown(secs);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(timerRef.current); return 0; } return c - 1; });
    }, 1000);
  };

  /* ── Step 0: identify ── */
  const handleIdentify = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) { setAlert({ type: "error", msg: "Enter your email or username" }); return; }
    setAlert(null);
    setLoading(true);
    try {
      const res = await api.identifyUser(identifier.trim());
      if (res.phone) {
        setMaskedPhone(res.phone);
        setUsername(identifier.trim());
        const otpRes = await api.sendOTP(res.phone);
        if (otpRes.message?.toLowerCase().includes("sent")) {
          startCountdown();
          setStep(1);
          setAlert({ type: "success", msg: "OTP sent to your WhatsApp number." });
        } else {
          setAlert({ type: "error", msg: otpRes.message || "Failed to send OTP" });
        }
      } else {
        setAlert({ type: "error", msg: res.message || "User not found" });
      }
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 1: verify OTP ── */
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setAlert({ type: "error", msg: "Enter the 6-digit OTP" }); return; }
    setAlert(null);
    setLoading(true);
    try {
      const res = await api.verifyOTP(maskedPhone, otp);
      if (res.message?.toLowerCase().includes("verified")) {
        setStep(2);
        setAlert(null);
      } else {
        setAlert({ type: "error", msg: res.message || "Invalid OTP" });
      }
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const res = await api.sendOTP(maskedPhone);
      if (res.message?.toLowerCase().includes("sent")) {
        startCountdown();
        setAlert({ type: "success", msg: "OTP resent to your WhatsApp." });
      } else {
        setAlert({ type: "error", msg: res.message || "Failed to resend OTP" });
      }
    } catch {
      setAlert({ type: "error", msg: "Network error." });
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: reset password ── */
  const allRulesPassed = PW_RULES.every((r) => r.test(newPw));

  const handleReset = async (e) => {
    e.preventDefault();
    if (!allRulesPassed) { setAlert({ type: "error", msg: "Password doesn't meet all requirements" }); return; }
    if (newPw !== confirmPw) { setAlert({ type: "error", msg: "Passwords don't match" }); return; }
    setAlert(null);
    setLoading(true);
    try {
      const res = await api.resetPassword(username, newPw, confirmPw);
      if (res.message?.toLowerCase().includes("updated") ||
          res.message?.toLowerCase().includes("success") ||
          res.message?.toLowerCase().includes("reset")) {
        setResetDone(true);
      } else {
        setAlert({ type: "error", msg: res.message || "Reset failed" });
      }
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const score = newPw ? PW_RULES.filter((r) => r.test(newPw)).length : 0;
  const sm    = score > 0 ? STRENGTH_META[score] : null;

  return (
    <>
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-re">Re</span>
          <span className="brand-feed">Feed</span>
          <span className="brand-dot" />
        </div>

        <Steps current={step} />

        <h1 className="auth-title">
          {step === 0 && "Reset Password"}
          {step === 1 && "Verify OTP"}
          {step === 2 && "New Password"}
        </h1>
        <p className="auth-subtitle">
          {step === 0 && "Enter your email or username to continue"}
          {step === 1 && `OTP sent to ${maskedPhone} via WhatsApp`}
          {step === 2 && "Choose a strong new password"}
        </p>

        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginBottom: 16 }}>
            {alert.type === "success" ? "✅" : "⚠️"} {alert.msg}
          </div>
        )}

        {/* ── Step 0 ── */}
        {step === 0 && (
          <form className="auth-form" onSubmit={handleIdentify} noValidate>
            <div className="form-group">
              <label className="form-label">Email or Username</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input
                  className="form-input"
                  type="text"
                  placeholder="you@example.com or your_username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Looking up…" : "Continue"}
            </button>
          </form>
        )}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
            <div className="form-group">
              <label className="form-label" style={{ textAlign: "center", display: "block" }}>
                Enter 6-digit OTP
              </label>
              <OtpBoxes value={otp} onChange={setOtp} />
            </div>

            <div className="otp-resend-row">
              {countdown > 0 ? (
                <span className="otp-countdown">
                  Resend in <strong>{String(Math.floor(countdown / 60)).padStart(2,"0")}:{String(countdown % 60).padStart(2,"0")}</strong>
                </span>
              ) : (
                <button type="button" className="otp-resend-btn" onClick={handleResend} disabled={loading}>
                  {loading ? "Sending…" : "Resend OTP"}
                </button>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading || otp.length < 6}>
              {loading && <span className="spinner" />}
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleReset} noValidate>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input
                  className="form-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                />
                <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                  <EyeIcon open={showPw} />
                </button>
              </div>

              {/* Strength bar — always reserves space */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, minHeight: 16 }}>
                {newPw && sm && (
                  <>
                    <div className="strength-bar" style={{ flex: 1 }}>
                      <div className="strength-fill" style={{ width: sm.width, background: sm.color }} />
                    </div>
                    <span style={{ fontSize: 11, color: sm.color, fontWeight: 600, whiteSpace: "nowrap" }}>{sm.label}</span>
                  </>
                )}
              </div>

              {/* Checklist — slides in/out, no layout shift */}
              <div className={`pw-checklist ${pwFocused || newPw ? "visible" : ""}`}>
                {PW_RULES.map((rule) => {
                  const pass = rule.test(newPw);
                  return (
                    <div key={rule.key} className={`pw-check-item ${pass ? "pass" : "fail"}`}>
                      <div className="pw-check-icon">{pass ? "✓" : ""}</div>
                      <span>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input
                  className="form-input"
                  type={showCpw ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
                <button type="button" className="input-toggle" onClick={() => setShowCpw(!showCpw)} aria-label="Toggle confirm password">
                  <EyeIcon open={showCpw} />
                </button>
              </div>
              {confirmPw && newPw !== confirmPw && (
                <span className="field-error">⚠ Passwords don't match</span>
              )}
              {confirmPw && newPw === confirmPw && (
                <span style={{ fontSize: 11.5, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4 }}>✓ Passwords match</span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link">← Back to Login</Link>
        </div>
      </div>
    </div>

    {resetDone && <ResetSuccessOverlay onLogin={() => navigate("/login")} />}
    </>
  );
}
