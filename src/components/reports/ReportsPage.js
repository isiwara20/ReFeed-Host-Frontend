import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import "./reports.css";

/* ── Icons ── */
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

/* ── Helpers ── */
const URGENCY_COLOR = { low: "#00c853", medium: "#f59e0b", high: "#ff6b35", critical: "#ef4444" };
const STATUS_COLOR  = { DRAFT: "#9ca3af", PUBLISHED: "#00c853", RESERVED: "#3b82f6", COLLECTED: "#ff6b35", COMPLETED: "#8b5cf6", EXPIRED: "#ef4444", CANCELLED: "#6b7280" };
const CAT_COLOR     = { "non-vegetable": "#ff6b35", vegetable: "#00c853", cooked: "#3b82f6", packed: "#8b5cf6", bakery: "#f59e0b", mixed: "#6b7280", dairy: "#06b6d4", veg: "#00c853", "non-veg": "#ff6b35" };

function countBy(arr, key) {
  return arr.reduce((acc, item) => {
    const v = item[key] || "unknown";
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
}

/* ── Pure CSS horizontal bar ── */
const Bar = ({ label, count, max, color }) => (
  <div className="rp-bar-row">
    <span className="rp-bar-label">{label}</span>
    <div className="rp-bar-track">
      <div className="rp-bar-fill" style={{ width: `${max ? (count / max) * 100 : 0}%`, background: color }} />
    </div>
    <span className="rp-bar-count">{count}</span>
  </div>
);

/* ── Stat card ── */
const StatCard = ({ value, label, accent }) => (
  <div className="rp-stat" style={{ borderTopColor: accent }}>
    <div className="rp-stat__value">{value}</div>
    <div className="rp-stat__label">{label}</div>
  </div>
);

export default function ReportsPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      API.get("/surplus/mine", { headers: { "x-username": currentUser?.username, "x-role": "DONOR" } }),
      API.get("/food-requests/all"),
    ])
      .then(([donRes, reqRes]) => {
        setDonations(donRes.data || []);
        setRequests(reqRes.data?.data || []);
      })
      .catch(() => setError("Failed to load report data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  /* ── Derived donation stats ── */
  const total      = donations.length;
  const completed  = donations.filter(d => d.lifecycleStatus === "COMPLETED").length;
  const active     = donations.filter(d => !["COMPLETED","CANCELLED","EXPIRED"].includes(d.lifecycleStatus)).length;
  const selfDel    = donations.filter(d => d.selfDelivery).length;

  const byStatus   = countBy(donations, "lifecycleStatus");
  const byFoodType = countBy(donations, "foodType");
  const maxStatus  = Math.max(...Object.values(byStatus), 1);
  const maxFood    = Math.max(...Object.values(byFoodType), 1);

  /* ── Derived request stats ── */
  const rTotal    = requests.length;
  const rPending  = requests.filter(r => r.status === "pending").length;
  const rMatched  = requests.filter(r => r.status === "matched").length;
  const rCritical = requests.filter(r => r.urgencyLevel === "critical").length;

  const byUrgency  = countBy(requests, "urgencyLevel");
  const byCategory = countBy(requests, "category");
  const maxUrg     = Math.max(...Object.values(byUrgency), 1);
  const maxCat     = Math.max(...Object.values(byCategory), 1);

  return (
    <div className="rp-page">
      {/* Navbar */}
      <header className="rp-nav">
        <div className="rp-nav__inner">
          <a href="/" className="rp-nav__logo">Re<span>Feed</span></a>
          <nav className="rp-nav__links">
            <a href="/">Home</a>
            <Link to="/donator-dashboard">Dashboard</Link>
            <Link to="/surplus">My Donations</Link>
          </nav>
          <div className="rp-nav__right">
            <span className="rp-nav__user">{currentUser?.username}</span>
            <button className="rp-nav__logout" onClick={() => { logout(); navigate("/"); }}>
              <IconLogout /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="rp-main">
        {/* Hero */}
        <div className="rp-hero">
          <div className="rp-hero__overlay" />
          <div className="rp-hero__content">
            <h1>Reports &amp; Trends</h1>
            <p>Your donation activity and community food request overview</p>
          </div>
        </div>

        {/* Header */}
        <div className="rp-header">
          <div>
            <div className="rp-breadcrumb">
              <Link to="/donator-dashboard">Dashboard</Link>
              <span>/</span>
              <span>Reports</span>
            </div>
            <h1 className="rp-title">Reports &amp; Trends</h1>
            <p className="rp-sub">Your donation activity and community food request overview</p>
          </div>
          <button className="rp-btn rp-btn--ghost" onClick={load} disabled={loading}>
            <IconRefresh /> Refresh
          </button>
        </div>

        {loading && <div className="rp-loading"><div className="rp-spinner" /><span>Loading…</span></div>}
        {error   && <div className="rp-alert">{error}</div>}

        {!loading && !error && (
          <>
            {/* ── Section 1: My Donations ── */}
            <div className="rp-section-label">My Surplus Donations</div>

            <div className="rp-stats-row">
              <StatCard value={total}     label="Total Posted"    accent="#111827" />
              <StatCard value={active}    label="Active"          accent="#00c853" />
              <StatCard value={completed} label="Completed"       accent="#8b5cf6" />
              <StatCard value={selfDel}   label="Self Delivery"   accent="#ff6b35" />
            </div>

            <div className="rp-charts-row">
              {/* By status */}
              <div className="rp-card">
                <div className="rp-card__title">Donations by Status</div>
                {Object.keys(byStatus).length === 0
                  ? <p className="rp-empty">No donations yet.</p>
                  : Object.entries(byStatus).map(([s, c]) => (
                      <Bar key={s} label={s} count={c} max={maxStatus} color={STATUS_COLOR[s] || "#9ca3af"} />
                    ))
                }
              </div>

              {/* By food type */}
              <div className="rp-card">
                <div className="rp-card__title">Donations by Food Type</div>
                {Object.keys(byFoodType).length === 0
                  ? <p className="rp-empty">No donations yet.</p>
                  : Object.entries(byFoodType).map(([f, c]) => (
                      <Bar key={f} label={f} count={c} max={maxFood} color={CAT_COLOR[f] || "#9ca3af"} />
                    ))
                }
              </div>
            </div>

            {/* Recent donations table */}
            {donations.length > 0 && (
              <div className="rp-card rp-card--full">
                <div className="rp-card__title">Recent Donations</div>
                <div className="rp-table-wrap">
                  <table className="rp-table">
                    <thead>
                      <tr>
                        <th>Food Type</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Expiry</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.slice(0, 6).map(d => (
                        <tr key={d._id}>
                          <td className="rp-td-cap">{d.foodType}</td>
                          <td>{d.quantity?.amount} {d.quantity?.unit}</td>
                          <td>
                            <span className="rp-pill" style={{ background: STATUS_COLOR[d.lifecycleStatus] + "22", color: STATUS_COLOR[d.lifecycleStatus] }}>
                              {d.lifecycleStatus}
                            </span>
                          </td>
                          <td>{d.expiryTime ? new Date(d.expiryTime).toLocaleDateString() : "—"}</td>
                          <td className="rp-td-muted">{d.location?.address || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Section 2: Food Requests ── */}
            <div className="rp-section-label" style={{ marginTop: 40 }}>Community Food Requests</div>

            <div className="rp-stats-row">
              <StatCard value={rTotal}    label="Total Requests"  accent="#111827" />
              <StatCard value={rPending}  label="Pending"         accent="#ff6b35" />
              <StatCard value={rMatched}  label="Matched"         accent="#00c853" />
              <StatCard value={rCritical} label="Critical"        accent="#ef4444" />
            </div>

            <div className="rp-charts-row">
              {/* By urgency */}
              <div className="rp-card">
                <div className="rp-card__title">Requests by Urgency</div>
                {Object.keys(byUrgency).length === 0
                  ? <p className="rp-empty">No requests found.</p>
                  : ["low","medium","high","critical"].filter(u => byUrgency[u]).map(u => (
                      <Bar key={u} label={u} count={byUrgency[u]} max={maxUrg} color={URGENCY_COLOR[u]} />
                    ))
                }
              </div>

              {/* By category */}
              <div className="rp-card">
                <div className="rp-card__title">Requests by Category</div>
                {Object.keys(byCategory).length === 0
                  ? <p className="rp-empty">No requests found.</p>
                  : Object.entries(byCategory).map(([cat, c]) => (
                      <Bar key={cat} label={cat} count={c} max={maxCat} color={CAT_COLOR[cat] || "#9ca3af"} />
                    ))
                }
              </div>
            </div>

            {/* Recent requests table */}
            {requests.length > 0 && (
              <div className="rp-card rp-card--full">
                <div className="rp-card__title">Recent Food Requests</div>
                <div className="rp-table-wrap">
                  <table className="rp-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Location</th>
                        <th>Requested</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.slice(0, 6).map(r => (
                        <tr key={r._id}>
                          <td className="rp-td-cap">{r.category}</td>
                          <td>
                            <span className="rp-pill" style={{ background: URGENCY_COLOR[r.urgencyLevel] + "22", color: URGENCY_COLOR[r.urgencyLevel] }}>
                              {r.urgencyLevel}
                            </span>
                          </td>
                          <td>
                            <span className="rp-pill" style={{ background: r.status === "pending" ? "#fff3ee" : r.status === "matched" ? "#e8faf0" : "#f5f3ff", color: r.status === "pending" ? "#ff6b35" : r.status === "matched" ? "#00a846" : "#7c3aed" }}>
                              {r.status}
                            </span>
                          </td>
                          <td className="rp-td-muted">{r.location || "—"}</td>
                          <td className="rp-td-muted">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
