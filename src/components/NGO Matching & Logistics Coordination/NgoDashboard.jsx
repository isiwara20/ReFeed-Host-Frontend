import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./NgoDashboard.css";
import NotificationBell from "../notifications/NotificationBell";
import NotificationPage from "../notifications/NotificationPage";
import MessagesPage from "../communications/MessagesPage";
import NotificationPreferences from "../notifications/NotificationPreferences";

const BASE = "https://refeed-hosting-backend-production.up.railway.app/api";
const get  = (url) => fetch(`${BASE}${url}`).then((r) => r.json());
const post = (url, body) => fetch(`${BASE}${url}`, { method: "POST",   headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
const put  = (url, body) => fetch(`${BASE}${url}`, { method: "PUT",    headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
const del  = (url)       => fetch(`${BASE}${url}`, { method: "DELETE" }).then((r) => r.json());

const PROVINCES = ["Western","Central","Southern","Northern","Eastern","North Western","North Central","Uva","Sabaragamuwa"];

const CATEGORY_LABELS = { vegetable: "Vegetable", "non-vegetable": "Non Vegetable", cooked: "Cooked", packed: "Packed", bakery: "Bakery", mixed: "Mixed" };
const URGENCY_LABELS  = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };

/* ── helpers ── */
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("refeed_user") || null)
      || JSON.parse(localStorage.getItem("currentUser") || "{}");
  } catch { return {}; }
}
function getAvatar() { return localStorage.getItem("refeed_ngo_avatar") || null; }
function saveAvatar(b64) { localStorage.setItem("refeed_ngo_avatar", b64); }
function getTheme() { return localStorage.getItem("refeed_theme") || "light"; }
function saveTheme(t) { localStorage.setItem("refeed_theme", t); }

/* ── Toast notification system ── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return { toasts, add };
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "ℹ"}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-card ${wide ? "modal-wide" : ""}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = { pending:"pill-yellow", in_progress:"pill-blue", completed:"pill-green", cancelled:"pill-red", matched:"pill-green", VERIFIED:"pill-green", PENDING:"pill-yellow", UNDER_REVIEW:"pill-blue", REJECTED:"pill-red" };
  return <span className={`pill ${map[status] || "pill-gray"}`}>{status?.replace(/_/g," ")}</span>;
}

function UrgencyPill({ level }) {
  const map = { low:"pill-gray", medium:"pill-yellow", high:"pill-blue", critical:"pill-red" };
  return <span className={`pill ${map[level] || "pill-gray"}`}>{URGENCY_LABELS[level] || level}</span>;
}

/* ══════════════════════════════════════════
   OVERVIEW PAGE
══════════════════════════════════════════ */
function OverviewPage({ username, verifyStatus, requests, orders, toast }) {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 4;
  
  const stats = [
    { label: "My Requests",   value: requests.length,                                                              cls: "stat-icon-green",  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg> },
    { label: "Matched",       value: requests.filter(r=>r.status==="matched").length,                              cls: "stat-icon-blue",   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
    { label: "Active Orders", value: orders.filter(o=>o.status==="pending"||o.status==="in_progress").length,      cls: "stat-icon-orange", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { label: "Completed",     value: orders.filter(o=>o.status==="completed").length,                              cls: "stat-icon-purple", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  ];

  const paginatedOrders = orders.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  const totalPages = Math.ceil(orders.length / rowsPerPage);

  return (
    <div>
      <p className="page-title">Dashboard Overview</p>
      <p className="page-subtitle">Welcome back, {username}</p>

      {verifyStatus !== "VERIFIED" && (
        <div className="info-banner">
          Your NGO is not yet verified. Complete verification to unlock food requests.
        </div>
      )}

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon-wrap ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Recent Activity</div>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No orders yet</div>
            <div className="empty-desc">Submit a food request to get started.</div>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Food Type</th>
                    <th>Quantity</th>
                    <th>Delivery</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((o) => (
                    <tr key={o._id}>
                      <td className="table-cell-food">{o.foodType}</td>
                      <td>{o.quantity?.amount} {o.quantity?.unit}</td>
                      <td style={{ textTransform:"capitalize" }}>{o.deliveryType}</td>
                      <td><StatusPill status={o.status} /></td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="table-pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Previous
                </button>

                <div className="pagination-info">
                  Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   VERIFICATION PAGE
══════════════════════════════════════════ */
function VerificationPage({ username, verifyStatus, verifyData, onRefresh, toast }) {
  const [form, setForm] = useState({
    ngoUsername: username,
    registrationNumber: "", registrationAuthority: "", registrationDocumentUrl: "",
    officialAddress: "", district: "", province: "",
    contactPersonName: "", contactPersonNIC: "", contactPersonRole: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await post("/ngo-verification/submit", form);
      if (res.message) { toast(res.message, "success"); onRefresh(); }
      else toast(res.error || "Submission failed", "error");
    } catch { toast("Network error", "error"); }
    finally { setLoading(false); }
  };

  const statusConfig = {
    VERIFIED:     { bg:"#f0fdf4", border:"#86efac", icon:"✓", title:"Verified NGO",         desc:"Your NGO is verified. You can now request food donations.", color:"#15803d" },
    PENDING:      { bg:"#fefce8", border:"#fde047", icon:"⏳", title:"Under Review",          desc:"Your verification is being reviewed by our team.", color:"#a16207" },
    UNDER_REVIEW: { bg:"#eff6ff", border:"#93c5fd", icon:"🔍", title:"Under Review",          desc:"Our admin team is actively reviewing your documents.", color:"#1d4ed8" },
    REJECTED:     { bg:"#fef2f2", border:"#fca5a5", icon:"✕", title:"Verification Rejected", desc:verifyData?.rejectionReason || "Please contact support.", color:"#dc2626" },
  };
  const sc = statusConfig[verifyStatus];

  return (
    <div>
      <p className="page-title">NGO Verification</p>
      <p className="page-subtitle">Submit your documents to get verified and unlock food requests.</p>

      {sc && (
        <div className="verify-status-banner" style={{ background:sc.bg, border:`1px solid ${sc.border}`, color:sc.color }}>
          <div className="verify-status-icon">{sc.icon}</div>
          <div>
            <div className="verify-status-title">{sc.title}</div>
            <div className="verify-status-desc">{sc.desc}</div>
          </div>
        </div>
      )}

      {(verifyStatus === "none" || verifyStatus === "REJECTED") && (
        <div className="card">
          <div className="card-title">Verification Form</div>
          {verifyStatus === "REJECTED" ? (
            <div style={{ padding: "24px", textAlign: "center", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fca5a5" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#dc2626", marginBottom: "12px" }}>Verification Rejected</div>
              <div style={{ fontSize: "14px", color: "#7f1d1d", marginBottom: "24px", lineHeight: "1.6" }}>
                {verifyData?.rejectionReason || "Your verification has been rejected. Please review the reason and contact our support team for assistance."}
              </div>
              <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", marginBottom: "24px", textAlign: "left", border: "1px solid #fecaca" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#991b1b", marginBottom: "12px" }}>📋 Rejection Details:</div>
                <div style={{ fontSize: "13px", color: "#7f1d1d", lineHeight: "1.8" }}>
                  {verifyData?.rejectionReason || "No specific reason provided. Please contact support for more information."}
                </div>
              </div>
              <div style={{ background: "#f3f4f6", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "12px" }}>📞 Contact Support:</div>
                <div style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.8" }}>
                  <div>📧 Email: <strong>support@refeed.com</strong></div>
                  <div>📱 WhatsApp: <strong>+94 76 123 4567</strong></div>
                  <div>☎️ Phone: <strong>+94 11 234 5678</strong></div>
                </div>
              </div>
              <button className="btn btn-outline" onClick={() => window.location.href = "mailto:support@refeed.com"}>
                Contact Support
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div className="form-grid">
                  <div className="field">
                    <label className="field-label">Registration Number *</label>
                    <input className="field-input" placeholder="NGO/2024/001" value={form.registrationNumber} onChange={set("registrationNumber")} required />
                  </div>
                  <div className="field">
                    <label className="field-label">Registration Authority</label>
                    <input className="field-input" placeholder="Ministry of Social Services" value={form.registrationAuthority} onChange={set("registrationAuthority")} />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Document URL</label>
                  <input className="field-input" placeholder="https://drive.google.com/..." value={form.registrationDocumentUrl} onChange={set("registrationDocumentUrl")} />
                </div>
                <div className="field">
                  <label className="field-label">Official Address *</label>
                  <input className="field-input" placeholder="123 Main St, Colombo" value={form.officialAddress} onChange={set("officialAddress")} required />
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label className="field-label">District</label>
                    <input className="field-input" placeholder="Colombo" value={form.district} onChange={set("district")} />
                  </div>
                  <div className="field">
                    <label className="field-label">Province</label>
                    <select className="field-select" value={form.province} onChange={set("province")}>
                      <option value="">Select Province</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label className="field-label">Contact Person Name *</label>
                    <input className="field-input" placeholder="Full Name" value={form.contactPersonName} onChange={set("contactPersonName")} required />
                  </div>
                  <div className="field">
                    <label className="field-label">NIC Number</label>
                    <input className="field-input" placeholder="199012345678" value={form.contactPersonNIC} onChange={set("contactPersonNIC")} />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Contact Person Role</label>
                  <input className="field-input" placeholder="Director / Manager" value={form.contactPersonRole} onChange={set("contactPersonRole")} />
                </div>
                <div>
                  <button type="submit" className="btn btn-green" disabled={loading}>
                    {loading && <span className="spin" />}
                    {loading ? "Submitting…" : "Submit Verification"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   FOOD REQUESTS PAGE
══════════════════════════════════════════ */
function FoodRequestsPage({ username, ngoData, verifyStatus, toast }) {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(null);
  const [paidIds, setPaidIds]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("refeed_paid_requests") || "[]"); } catch { return []; }
  });
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUrgency,  setFilterUrgency]  = useState("all");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try { const r = await get(`/food-requests/user/${username}`); setRequests(r.data || []); }
    catch { toast("Failed to load requests", "error"); }
    finally { setLoading(false); }
  }, [username, toast]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    try { await del(`/food-requests/delete/${id}`); toast("Request deleted.", "success"); fetchRequests(); }
    catch { toast("Delete failed", "error"); }
  };

  const markPaid = (id) => {
    const updated = [...paidIds, id];
    setPaidIds(updated);
    localStorage.setItem("refeed_paid_requests", JSON.stringify(updated));
  };

  if (verifyStatus !== "VERIFIED") {
    return (
      <div>
        <p className="page-title">Food Requests</p>
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <div className="empty-title">Verification Required</div>
            <div className="empty-desc">Your NGO must be verified before you can request food donations.</div>
          </div>
        </div>
      </div>
    );
  }

  const isLocked = (r) => r.status === "matched" || r.status === "completed";

  const filtered = requests.filter(r => {
    if (filterStatus   !== "all" && r.status      !== filterStatus)   return false;
    if (filterCategory !== "all" && r.category    !== filterCategory) return false;
    if (filterUrgency  !== "all" && r.urgencyLevel !== filterUrgency)  return false;
    return true;
  });

  return (
    <div>
      <p className="page-title">Food Requests</p>
      <p className="page-subtitle">Submit and manage your food donation requests.</p>

      {/* ── Toolbar ── */}
      <div className="table-toolbar">
        <div className="filter-group">
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="matched">Matched</option>
          </select>
          <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select className="filter-select" value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
            <option value="all">All Urgency</option>
            {Object.entries(URGENCY_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {(filterStatus !== "all" || filterCategory !== "all" || filterUrgency !== "all") && (
            <button className="btn btn-outline btn-sm" onClick={() => { setFilterStatus("all"); setFilterCategory("all"); setFilterUrgency("all"); }}>
              Clear
            </button>
          )}
        </div>
        <button className="btn btn-green" onClick={() => { setEditItem(null); setShowForm(true); setMatchResult(null); }}>
          + New Request
        </button>
      </div>

      {loading ? (
        <div className="card"><div className="empty-state"><span className="spin spin-dark" style={{ width:28, height:28 }} /></div></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">{requests.length === 0 ? "No requests yet" : "No results match your filters"}</div>
            <div className="empty-desc">{requests.length === 0 ? 'Click "+ New Request" to submit your first food request.' : "Try adjusting the filters above."}</div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Category</th><th>Location</th><th>Urgency</th><th>Expiry Req.</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id}>
                    <td>{CATEGORY_LABELS[r.category] || r.category}</td>
                    <td>{r.location}</td>
                    <td><UrgencyPill level={r.urgencyLevel} /></td>
                    <td>{new Date(r.expiryRequirement).toLocaleDateString()}</td>
                    <td><StatusPill status={r.status} /></td>
                    <td>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <button className="btn btn-outline btn-sm" disabled={isLocked(r)} onClick={() => { setEditItem(r); setShowForm(true); setMatchResult(null); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" disabled={isLocked(r)} onClick={() => handleDelete(r._id)}>Delete</button>
                        {!isLocked(r) && (
                          <button className="btn btn-green btn-sm" onClick={() => setShowOrderModal(r)}>Check Matches</button>
                        )}
                        {r.status === "matched" && (
                          paidIds.includes(r._id)
                            ? <span className="donated-badge">Donated</span>
                            : <button className="btn btn-donate btn-sm" onClick={() => setShowDonateModal(r)}>Donate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <RequestFormModal username={username} ngoData={ngoData} editItem={editItem}
          onClose={() => setShowForm(false)}
          onSaved={(result) => { setShowForm(false); fetchRequests(); if (result?.availability) setMatchResult(result); }} />
      )}

      {matchResult && (
        <MatchResultModal result={matchResult} username={username}
          onClose={() => setMatchResult(null)}
          onOrdered={() => { setMatchResult(null); fetchRequests(); toast("Order placed successfully!", "success"); }} />
      )}

      {showOrderModal && (
        <MatchResultModal
          result={{ availability:{ available:true, donations:[] }, request:showOrderModal }}
          username={username}
          onClose={() => setShowOrderModal(null)}
          onOrdered={() => { setShowOrderModal(null); fetchRequests(); toast("Order placed!", "success"); }}
          fetchMatches />
      )}

      {showDonateModal && (
        <DonateModal
          request={showDonateModal}
          ngoUsername={username}
          ngoData={ngoData}
          onClose={() => setShowDonateModal(null)}
          onSuccess={() => {
            markPaid(showDonateModal._id);
            setShowDonateModal(null);
            toast("Thank you! Donation recorded successfully.", "success");
          }}
        />
      )}
    </div>
  );
}

/* ── Donate Modal ── */
function DonateModal({ request, ngoUsername, ngoData, onClose, onSuccess }) {
  const [amount, setAmount]       = useState("");
  const [step, setStep]           = useState("form");
  const [payResult, setPayResult] = useState(null);
  const [err, setErr]             = useState(null);
  const [orderId, setOrderId]     = useState("");
  const [donorUsername, setDonorUsername] = useState("Loading…");

  // Fetch the donorUsername from the surplus donation linked to this NGO's order
  useEffect(() => {
    const fetchDonor = async () => {
      try {
        // Get orders for this NGO and find the one matching this food request's location/category
        const orders = await get(`/donation-orders-status/ngo/${ngoUsername}`);
        const arr = Array.isArray(orders) ? orders : [];
        // Find the most recent order that matches
        const match = arr.find(o =>
          o.status !== "cancelled" &&
          (o.foodType || "").toLowerCase().includes((request.category || "").split("-")[0].toLowerCase())
        ) || arr[arr.length - 1];
        if (match?.donorUsername) {
          setDonorUsername(match.donorUsername);
        } else {
          // Fallback: fetch surplus donations and find a published one matching category
          const surplus = await get("/surplus/mine");
          const s = Array.isArray(surplus) ? surplus.find(x => x.lifecycleStatus === "PUBLISHED") : null;
          setDonorUsername(s?.donorUsername || "—");
        }
      } catch { setDonorUsername("—"); }
    };
    fetchDonor();
  }, [ngoUsername, request]);

  const handlePay = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    setErr(null);
    setStep("paying");

    try {
      const res = await fetch("https://refeed-hosting-backend-production.up.railway.app/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fname: ngoData?.name?.split(" ")[0] || ngoUsername,
          lname: ngoData?.name?.split(" ").slice(1).join(" ") || "NGO",
          email: ngoData?.email || "ngo@refeed.lk",
          phone: (ngoData?.phone || "0700000000").replace(/\D/g, "").slice(-10),
          amount: Number(amount).toFixed(2),
        }),
      });
      const { encodedPayload, signature, order_id, error } = await res.json();
      if (error) { setErr(error); setStep("form"); return; }
      setOrderId(order_id);

      const loadAndPay = () => {
        const dp = new window.DirectPayIpg.Init({
          signature,
          dataString: encodedPayload,
          stage: "PROD",
          container: "dp-card-container",
        });
        dp.doInContainerCheckout()
          .then((data) => { setPayResult(data?.data || data); setStep("success"); })
          .catch(() => { setErr("Payment was cancelled or failed. Please try again."); setStep("form"); });
      };

      if (window.DirectPayIpg) { loadAndPay(); return; }
      const script = document.createElement("script");
      script.id  = "dp-v3-sdk";
      script.src = "https://cdn.directpay.lk/v3/directpayipg.min.js";
      script.onload = loadAndPay;
      document.body.appendChild(script);
    } catch {
      setErr("Network error. Please try again.");
      setStep("form");
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && step !== "paying" && onClose()}>
      <div className="modal-card modal-wide" onClick={e => e.stopPropagation()}>

        {step === "form" && (
          <>
            <div className="modal-header">
              <span className="modal-title">Donate to Donor</span>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <div className="donate-info-strip">
              <div className="donate-info-row">
                <span className="donate-info-label">Donor ID</span>
                <span className="donate-info-value">{donorUsername}</span>
              </div>
              <div className="donate-info-row">
                <span className="donate-info-label">NGO (You)</span>
                <span className="donate-info-value">{ngoUsername}</span>
              </div>
              <div className="donate-info-row">
                <span className="donate-info-label">Request</span>
                <span className="donate-info-value">{CATEGORY_LABELS[request?.category] || request?.category} · {request?.location}</span>
              </div>
            </div>

            {err && <div className="form-err" style={{ marginTop:14 }}>{err}</div>}

            <div className="field" style={{ marginTop:20 }}>
              <label className="field-label">Donation Amount (LKR) *</label>
              <div className="donate-amount-wrap">
                <span className="donate-currency">LKR</span>
                <input
                  className="field-input donate-amount-input"
                  type="number" min="1" step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="donate-quick-amounts">
              {["500","1000","2500","5000"].map(a => (
                <button key={a} className={`donate-quick-btn ${amount === a ? "active" : ""}`} onClick={() => setAmount(a)}>
                  LKR {Number(a).toLocaleString()}
                </button>
              ))}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-donate" disabled={!amount || Number(amount) <= 0} onClick={handlePay}>
                Proceed to Payment
              </button>
            </div>
          </>
        )}

        {step === "paying" && (
          <>
            <div className="modal-header">
              <span className="modal-title">Complete Payment</span>
            </div>
            <div className="donate-paying-header">
              <span className="donate-paying-amount">LKR {Number(amount).toLocaleString()}</span>
              {orderId && <span className="donate-paying-ref">Order: {orderId}</span>}
            </div>
            <div id="dp-card-container" style={{ minHeight: 320 }} />
          </>
        )}

        {step === "success" && (
          <div className="donate-success">
            <div className="donate-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="donate-success-title">Donation Successful</div>
            <div className="donate-success-desc">
              You have successfully donated <strong>LKR {Number(amount).toLocaleString()}</strong> to donor <strong>{donorUsername}</strong>.
            </div>
            {payResult && (
              <div className="donate-receipt">
                {payResult.transactionId && <div className="donate-receipt-row"><span>Transaction ID</span><span>{payResult.transactionId}</span></div>}
                {payResult.amount        && <div className="donate-receipt-row"><span>Amount</span><span>LKR {payResult.amount}</span></div>}
                {payResult.dateTime      && <div className="donate-receipt-row"><span>Date & Time</span><span>{payResult.dateTime}</span></div>}
                {payResult.reference     && <div className="donate-receipt-row"><span>Reference</span><span>{payResult.reference}</span></div>}
                {orderId                 && <div className="donate-receipt-row"><span>Order ID</span><span>{orderId}</span></div>}
              </div>
            )}
            <button className="btn btn-green" style={{ marginTop:24, width:"100%" }} onClick={onSuccess}>Done</button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Request Form Modal ── */
function RequestFormModal({ username, ngoData, editItem, onClose, onSaved }) {
  const [form, setForm] = useState({
    username, email: ngoData?.email || "", phone: ngoData?.phone || "",
    location: "", category: "vegetable", urgencyLevel: "medium", expiryRequirement: "",
    ...(editItem ? { location:editItem.location, category:editItem.category, urgencyLevel:editItem.urgencyLevel, expiryRequirement:editItem.expiryRequirement?.slice(0,10) } : {}),
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErr(null);
    try {
      let res;
      if (editItem) {
        res = await put(`/food-requests/update/${editItem._id}`, form);
        if (res.data) onSaved({});
        else setErr(res.error || "Update failed");
      } else {
        res = await post("/food-requests/create", form);
        if (res.request) onSaved({ availability: { available: res.available, donations: res.donations || [] }, request: res.request });
        else setErr(res.error || "Submission failed");
      }
    } catch { setErr("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={editItem ? "Edit Request" : "New Food Request"} onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-green" form="req-form" type="submit" disabled={loading}>
          {loading && <span className="spin" />}{loading ? "Saving…" : editItem ? "Update" : "Submit Request"}
        </button>
      </>}>
      {err && <div className="form-err">{err}</div>}
      <form id="req-form" onSubmit={handleSubmit}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="form-grid">
            <div className="field">
              <label className="field-label">Category *</label>
              <select className="field-select" value={form.category} onChange={set("category")}>
                {Object.entries(CATEGORY_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Urgency Level *</label>
              <select className="field-select" value={form.urgencyLevel} onChange={set("urgencyLevel")}>
                {Object.entries(URGENCY_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Location *</label>
            <input className="field-input" placeholder="Colombo 07" value={form.location} onChange={set("location")} required />
          </div>
          <div className="field">
            <label className="field-label">Required Before *</label>
            <input className="field-input" type="date" value={form.expiryRequirement} onChange={set("expiryRequirement")} required min={new Date().toISOString().slice(0,10)} />
          </div>
          <div className="form-grid">
            <div className="field">
              <label className="field-label">Email</label>
              <input className="field-input" type="email" value={form.email} onChange={set("email")} />
            </div>
            <div className="field">
              <label className="field-label">Phone</label>
              <input className="field-input" value={form.phone} onChange={set("phone")} />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/* ── Match Result Modal ── */
function MatchResultModal({ result, username, onClose, onOrdered, fetchMatches }) {
  const [donations, setDonations] = useState(result?.availability?.donations || []);
  const [selected, setSelected]   = useState(null);
  const [step, setStep]           = useState("list");
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [donationDetail, setDonationDetail] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState(null);

  useEffect(() => {
    if (fetchMatches) {
      get("/surplus/mine").then((d) => setDonations(Array.isArray(d) ? d.filter(x=>x.lifecycleStatus==="PUBLISHED") : [])).catch(()=>{});
    }
    get(`/ngo-Address/${username}`).then(setAddresses).catch(()=>{});
  }, [username, fetchMatches]);

  const handleSelectDonation = async (d) => {
    setSelected(d);
    if (d.location?.lat && d.location?.lng) {
      try { const detail = await get(`/donations-picking/${d._id}`); setDonationDetail(detail); } catch {}
    }
    setStep("delivery");
  };

  const handlePlaceOrder = async () => {
    if (deliveryType === "delivery" && !selectedAddr) { setErr("Select a delivery address."); return; }
    setLoading(true); setErr(null);
    try {
      const res = await post("/donation-orders-status", {
        ngoUsername: username, deliveryType,
        surplusDonationId: selected._id,
        selectedAddressId: deliveryType === "delivery" ? selectedAddr : undefined,
      });
      if (res.order) onOrdered();
      else setErr(res.error || "Order failed");
    } catch { setErr("Network error"); }
    finally { setLoading(false); }
  };

  const mapLat = donationDetail?.location?.lat || selected?.location?.lat;
  const mapLng = donationDetail?.location?.lng || selected?.location?.lng;

  return (
    <Modal title={step === "list" ? "Available Donations" : "Choose Delivery Method"} onClose={onClose} wide
      footer={step === "delivery" ? <>
        <button className="btn btn-outline" onClick={() => setStep("list")}>← Back</button>
        <button className="btn btn-green" onClick={handlePlaceOrder} disabled={loading}>
          {loading && <span className="spin" />}{loading ? "Placing…" : "Confirm Order"}
        </button>
      </> : null}>
      {err && <div className="form-err">{err}</div>}

      {step === "list" && (
        donations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No matching donations found</div>
            <div className="empty-desc">There are currently no available donations matching your request.</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {donations.map((d) => (
              <div key={d._id} className="match-card" onClick={() => handleSelectDonation(d)}>
                <div className="match-card-header">
                  <span className="match-card-title">{d.foodType}</span>
                  <StatusPill status={d.lifecycleStatus} />
                </div>
                <div className="match-card-meta">
                  <span className="match-meta-item">📦 {d.quantity?.amount} {d.quantity?.unit}</span>
                  <span className="match-meta-item">📍 {d.location?.address || "—"}</span>
                  <span className="match-meta-item">Expires {new Date(d.expiryTime).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {step === "delivery" && selected && (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div className="selected-donation-summary">
            <div style={{ fontWeight:700, textTransform:"capitalize" }}>{selected.foodType}</div>
            <div style={{ fontSize:13, color:"var(--muted)", marginTop:3 }}>
              {selected.quantity?.amount} {selected.quantity?.unit} · {selected.location?.address}
            </div>
          </div>

          <div>
            <div className="field-label" style={{ marginBottom:10 }}>How would you like to receive it?</div>
            <div className="delivery-options">
              {[
                { value:"pickup",   title:"Self Pickup", desc:"Collect from donor location" },
                { value:"delivery", title:"Delivery",    desc:"Deliver to your address" },
              ].map((opt) => (
                <div key={opt.value} className={`delivery-option ${deliveryType === opt.value ? "selected" : ""}`}
                  onClick={() => setDeliveryType(opt.value)}>
                  <div className="delivery-option-title">{opt.title}</div>
                  <div className="delivery-option-desc">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {deliveryType === "pickup" && mapLat && mapLng && (
            <div>
              <div className="field-label" style={{ marginBottom:8 }}>Pickup Location</div>
              <div className="map-container">
                <iframe
                  title="Pickup Location"
                  src={`https://maps.google.com/maps?q=${mapLat},${mapLng}&output=embed`}
                  width="100%" height="100%" style={{ border:0 }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div style={{ fontSize:12, color:"var(--muted)", marginTop:6 }}>
                {donationDetail?.location?.address || selected?.location?.address}
              </div>
            </div>
          )}

          {deliveryType === "delivery" && (
            <AddressSelector username={username} addresses={addresses} selected={selectedAddr}
              onSelect={setSelectedAddr} onRefresh={() => get(`/ngo-Address/${username}`).then(setAddresses)} />
          )}
        </div>
      )}
    </Modal>
  );
}

/* ══════════════════════════════════════════
   ADDRESSES PAGE
══════════════════════════════════════════ */
function AddressesPage({ username, toast }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try { const r = await get(`/ngo-Address/${username}`); setAddresses(Array.isArray(r) ? r : []); }
    catch { toast("Failed to load addresses", "error"); }
    finally { setLoading(false); }
  }, [username, toast]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try { await del(`/ngo-Address/${id}`); toast("Address deleted.", "success"); fetchAddresses(); }
    catch { toast("Delete failed", "error"); }
  };

  return (
    <div>
      <p className="page-title">Delivery Addresses</p>
      <p className="page-subtitle">Manage your NGO's delivery addresses.</p>

      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button className="btn btn-green" onClick={() => { setEditItem(null); setShowForm(true); }}>+ Add Address</button>
      </div>

      {loading ? (
        <div className="card"><div className="empty-state"><span className="spin spin-dark" style={{ width:28, height:28 }} /></div></div>
      ) : addresses.filter(a => !a.isDeleted).length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📍</div>
            <div className="empty-title">No addresses saved</div>
            <div className="empty-desc">Add a delivery address to receive food donations.</div>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {addresses.filter(a => !a.isDeleted).map((a) => (
            <div key={a._id} className="card" style={{ padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{a.addressLine}</div>
                <div style={{ fontSize:13, color:"var(--muted)", marginTop:3 }}>
                  {a.city}{a.state ? `, ${a.state}` : ""}{a.postalCode ? ` ${a.postalCode}` : ""} · {a.country}
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setEditItem(a); setShowForm(true); }}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddressFormModal username={username} editItem={editItem}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchAddresses(); toast(editItem ? "Address updated." : "Address added.", "success"); }} />
      )}
    </div>
  );
}

function AddressFormModal({ username, editItem, onClose, onSaved }) {
  const [form, setForm] = useState({
    username, addressLine:"", city:"", state:"", postalCode:"", country:"Sri Lanka",
    ...(editItem ? { addressLine:editItem.addressLine, city:editItem.city, state:editItem.state||"", postalCode:editItem.postalCode||"", country:editItem.country||"Sri Lanka" } : {}),
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErr(null);
    try {
      let res;
      if (editItem) res = await put(`/ngo-Address/${editItem._id}`, form);
      else          res = await post("/ngo-Address", form);
      if (res.address || res.message) onSaved();
      else setErr(res.error || "Save failed");
    } catch { setErr("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={editItem ? "Edit Address" : "Add Address"} onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-green" form="addr-form" type="submit" disabled={loading}>
          {loading && <span className="spin" />}{loading ? "Saving…" : "Save Address"}
        </button>
      </>}>
      {err && <div className="form-err">{err}</div>}
      <form id="addr-form" onSubmit={handleSubmit}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="field">
            <label className="field-label">Address Line *</label>
            <input className="field-input" placeholder="123 Main Street" value={form.addressLine} onChange={set("addressLine")} required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label className="field-label">City *</label>
              <input className="field-input" placeholder="Colombo" value={form.city} onChange={set("city")} required />
            </div>
            <div className="field">
              <label className="field-label">State / Province</label>
              <select className="field-select" value={form.state} onChange={set("state")}>
                <option value="">Select Province</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label className="field-label">Postal Code</label>
              <input className="field-input" placeholder="00100" value={form.postalCode} onChange={set("postalCode")} />
            </div>
            <div className="field">
              <label className="field-label">Country</label>
              <input className="field-input" value={form.country} onChange={set("country")} />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function AddressSelector({ username, addresses, selected, onSelect, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const active = addresses.filter(a => !a.isDeleted);
  return (
    <div>
      <div className="field-label" style={{ marginBottom:8 }}>Select Delivery Address</div>
      {active.length === 0 ? (
        <div style={{ fontSize:13, color:"var(--muted)", marginBottom:10 }}>No addresses saved.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:10 }}>
          {active.map((a) => (
            <div key={a._id} className={`address-card ${selected === a._id ? "selected" : ""}`} onClick={() => onSelect(a._id)}>
              <div className="address-card-text">
                <div style={{ fontWeight:600 }}>{a.addressLine}</div>
                <div style={{ fontSize:12, color:"var(--muted)" }}>{a.city}{a.state ? `, ${a.state}` : ""} · {a.country}</div>
              </div>
              {selected === a._id && <span style={{ color:"var(--primary)", fontWeight:700 }}>✓</span>}
            </div>
          ))}
        </div>
      )}
      {!showAdd ? (
        <button className="btn btn-outline btn-sm" onClick={() => setShowAdd(true)}>+ Add New Address</button>
      ) : (
        <AddressFormModal username={username} editItem={null}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); onRefresh(); }} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   ORDERS PAGE
══════════════════════════════════════════ */
function OrdersPage({ username, toast }) {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterDelivery, setFilterDelivery] = useState("all");
  const [searchDonor,    setSearchDonor]    = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try { const r = await get(`/donation-orders-status/ngo/${username}`); setOrders(Array.isArray(r) ? r : []); }
    catch { toast("Failed to load orders", "error"); }
    finally { setLoading(false); }
  }, [username, toast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try { await del(`/donation-orders-status/${id}`); toast("Order cancelled.", "success"); fetchOrders(); }
    catch { toast("Cancel failed", "error"); }
  };

  const filtered = orders.filter(o => {
    if (filterStatus   !== "all" && o.status       !== filterStatus)   return false;
    if (filterDelivery !== "all" && o.deliveryType !== filterDelivery) return false;
    if (searchDonor && !o.donorUsername?.toLowerCase().includes(searchDonor.toLowerCase())) return false;
    return true;
  });

  const hasFilters = filterStatus !== "all" || filterDelivery !== "all" || searchDonor;

  return (
    <div>
      <p className="page-title">My Orders</p>
      <p className="page-subtitle">Track your donation orders and their status.</p>

      <div className="table-toolbar">
        <div className="filter-group">
          <input
            className="filter-search"
            placeholder="Search donor…"
            value={searchDonor}
            onChange={e => setSearchDonor(e.target.value)}
          />
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="filter-select" value={filterDelivery} onChange={e => setFilterDelivery(e.target.value)}>
            <option value="all">All Delivery</option>
            <option value="pickup">Self Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
          {hasFilters && (
            <button className="btn btn-outline btn-sm" onClick={() => { setFilterStatus("all"); setFilterDelivery("all"); setSearchDonor(""); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card"><div className="empty-state"><span className="spin spin-dark" style={{ width:28, height:28 }} /></div></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-title">{orders.length === 0 ? "No orders yet" : "No results match your filters"}</div>
            <div className="empty-desc">{orders.length === 0 ? "When you select a donation from a matched request, your orders will appear here." : "Try adjusting the filters above."}</div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Food Type</th><th>Qty</th><th>Donor</th><th>Delivery</th><th>Address</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o._id}>
                    <td style={{ textTransform:"capitalize" }}>{o.foodType}</td>
                    <td>{o.quantity?.amount} {o.quantity?.unit}</td>
                    <td>{o.donorUsername}</td>
                    <td style={{ textTransform:"capitalize" }}>{o.deliveryType}</td>
                    <td style={{ maxWidth:160, wordWrap:"break-word", whiteSpace:"normal" }}>{o.deliveryAddress || "—"}</td>
                    <td><StatusPill status={o.status} /></td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      {(o.status === "pending" || o.status === "in_progress") && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(o._id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════════ */
function ProfilePage({ username, ngoData, onUpdated, toast }) {
  const [form, setForm]       = useState({ name:ngoData?.name||"", email:ngoData?.email||"" });
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar]   = useState(getAvatar());
  const fileRef               = useRef();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const b64 = ev.target.result; setAvatar(b64); saveAvatar(b64); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/update-ngo`, {
        method:"PATCH", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ username, ...form }),
      }).then(r => r.json());
      if (res.message || res.name) { toast("Profile updated successfully.", "success"); onUpdated(); }
      else toast(res.message || "Update failed", "error");
    } catch { toast("Network error", "error"); }
    finally { setLoading(false); }
  };

  const initials = (ngoData?.name || username || "N")[0].toUpperCase();

  return (
    <div>
      <p className="page-title">My Profile</p>
      <p className="page-subtitle">Manage your NGO account information.</p>

      <div className="profile-layout">

        {/* ── Left: Identity card ── */}
        <div className="profile-identity-card">
          <div className="profile-avatar-wrap" onClick={() => fileRef.current.click()}>
            {avatar
              ? <img src={avatar} alt="Profile" className="profile-avatar-img" />
              : <div className="profile-avatar-initials">{initials}</div>
            }
            <div className="profile-avatar-overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Change
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange} />

          <div className="profile-identity-name">{ngoData?.name || username}</div>
          <div className="profile-identity-username">@{username}</div>
          <div className="profile-identity-role">NGO Account</div>

          <button className="btn btn-outline btn-sm profile-photo-btn" onClick={() => fileRef.current.click()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Photo
          </button>

          <div className="profile-identity-divider" />

          <div className="profile-meta-row">
            <span className="profile-meta-label">Member since</span>
            <span className="profile-meta-value">{new Date().getFullYear()}</span>
          </div>
          <div className="profile-meta-row">
            <span className="profile-meta-label">Account type</span>
            <span className="profile-meta-value">NGO</span>
          </div>
        </div>

        {/* ── Right: Edit form ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:20 }}>

          {/* Editable section */}
          <div className="card" style={{ padding:"24px 28px" }}>
            <div className="profile-section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Personal Information
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div className="field">
                  <label className="field-label">Full Name</label>
                  <input className="field-input" value={form.name} onChange={set("name")} placeholder="NGO Organisation Name" />
                </div>
                <div className="field">
                  <label className="field-label">Email Address</label>
                  <input className="field-input" type="email" value={form.email} onChange={set("email")} placeholder="email@example.com" />
                </div>
                <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:4 }}>
                  <button type="submit" className="btn btn-green" disabled={loading}>
                    {loading && <span className="spin" />}{loading ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Read-only section */}
          <div className="card" style={{ padding:"24px 28px" }}>
            <div className="profile-section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Account Credentials
              <span className="profile-locked-badge">Read Only</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div className="field">
                <label className="field-label">Username</label>
                <div className="profile-readonly-field">
                  <span>{username}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              </div>
              <div className="field">
                <label className="field-label">WhatsApp Number</label>
                <div className="profile-readonly-field">
                  <span>{ngoData?.phone || "—"}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <span className="profile-readonly-hint">WhatsApp number cannot be changed. Contact support if needed.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT DASHBOARD COMPONENT
══════════════════════════════════════════ */
export default function NgoDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = getUser();
  const username = user.username;

  const [activePage, setActivePage] = useState("overview");
  const [ngoData, setNgoData]       = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("none");
  const [verifyData, setVerifyData]     = useState(null);
  const [requests, setRequests]     = useState([]);
  const [orders, setOrders]         = useState([]);
  const [theme, setTheme]           = useState(getTheme());
  const [avatar, setAvatar]         = useState(getAvatar());
  const [showSidebar, setShowSidebar] = useState(false);
  const { toasts, add: toast }      = useToast();
  const allowedPages = useRef(new Set([
    "overview",
    "verification",
    "food-requests",
    "orders",
    "addresses",
    "profile",
    "messages",
    "notifications",
    "notification-preferences"
  ]));

  useEffect(() => {
    const pageFromQuery = new URLSearchParams(location.search).get("page");
    if (pageFromQuery && allowedPages.current.has(pageFromQuery)) {
      setActivePage(pageFromQuery);
    }
  }, [location.search]);

  // sync avatar from localStorage when profile updates
  useEffect(() => {
    const handler = () => setAvatar(getAvatar());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // apply theme to root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    saveTheme(theme);
  }, [theme]);

  const loadNgoData = useCallback(async () => {
    if (!username) return;
    try { const ngo = await get(`/auth/ngo/${username}`).catch(()=>null); if (ngo?.name) setNgoData(ngo); } catch {}
  }, [username]);

  const loadVerifyStatus = useCallback(async () => {
    if (!username) return;
    try { const r = await get(`/ngo-verification/status/${username}`); if (r.status) { setVerifyStatus(r.status); setVerifyData(r); } } catch { setVerifyStatus("none"); }
  }, [username]);

  const loadRequests = useCallback(async () => {
    if (!username) return;
    try { const r = await get(`/food-requests/user/${username}`); setRequests(r.data || []); } catch {}
  }, [username]);

  const loadOrders = useCallback(async () => {
    if (!username) return;
    try { const r = await get(`/donation-orders-status/ngo/${username}`); setOrders(Array.isArray(r) ? r : []); } catch {}
  }, [username]);

  useEffect(() => {
    console.log("NgoDashboard useEffect: username =", username, "user object =", getUser());
    if (!username) { 
      console.log("NgoDashboard: No username, redirecting to login");
      navigate("/login"); 
      return; 
    }
    console.log("NgoDashboard: Loading data for username:", username);
    loadNgoData(); loadVerifyStatus(); loadRequests(); loadOrders();
  }, [username, navigate, loadNgoData, loadVerifyStatus, loadRequests, loadOrders]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => { localStorage.removeItem("refeed_user"); navigate("/login"); };

  const verifyBadge = {
    VERIFIED:     { cls:"badge-verified",   label:"Verified"      },
    PENDING:      { cls:"badge-pending",    label:"Pending"       },
    UNDER_REVIEW: { cls:"badge-pending",    label:"Under Review"  },
    REJECTED:     { cls:"badge-rejected",   label:"Rejected"      },
    none:         { cls:"badge-unverified", label:"Unverified"    },
  }[verifyStatus] || { cls:"badge-unverified", label:"Unverified" };

  const navItems = [
    { id:"overview",      label:"Overview",      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { id:"verification",  label:"Verification",  icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { id:"food-requests", label:"Food Requests", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
    { id:"orders",        label:"My Orders",     icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { id:"addresses",     label:"Addresses",     icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
    { id:"profile",       label:"Profile",       icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id:"messages",      label:"Messages",      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id:"notifications", label:"Notifications", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { id:"notification-preferences", label:"Notification Preferences", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ];

  const pageTitles = { overview:"Overview", verification:"Verification", "food-requests":"Food Requests", orders:"My Orders", addresses:"Addresses", profile:"Profile", messages:"Messages" ,notifications:"Notifications","notification-preferences":"Notification Preferences" };
  const initials = (ngoData?.name || username || "N")[0].toUpperCase();

  return (
    <div className="dash-layout">
      <ToastContainer toasts={toasts} />

      {/* ── Sign Out Confirm ── */}
      {showLogoutConfirm && (
        <div className="modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-card" style={{ maxWidth:380 }} onClick={e => e.stopPropagation()}>
            <div className="logout-confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <div className="logout-confirm-title">Sign Out</div>
            <div className="logout-confirm-desc">Are you sure you want to sign out of your account?</div>
            <div className="logout-confirm-actions">
              <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={handleLogout}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar Backdrop (Mobile) ── */}
      {showSidebar && (
        <div 
          className="dash-sidebar-backdrop" 
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`dash-sidebar ${showSidebar ? "open" : ""}`}>
        <div className="sidebar-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="brand-re">Re</span>
          <span className="brand-feed">Feed</span>
          <span className="brand-dot" />
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} />
              : initials
            }
          </div>
          <div>
            <div className="sidebar-user-name">{ngoData?.name || username}</div>
            <div className="sidebar-user-role">NGO Account</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map((item) => (
            <button key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => { setActivePage(item.id); setShowSidebar(false); }}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          © {new Date().getFullYear()} ReFeed<br />
          All rights reserved.
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">
        <header className="dash-header">
          <div className="dash-header-left">
            <button className="dash-sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)} title="Toggle sidebar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="dash-header-title">{pageTitles[activePage]}</span>
          </div>
          <div className="dash-header-right">
            <NotificationBell className="navbar__bell" />
            <span className={`header-badge ${verifyBadge.cls}`}>{verifyBadge.label}</span>
            <button className="theme-toggle" onClick={() => setTheme(t => t === "light" ? "dark" : "light")} title="Toggle theme">
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <button className="btn-logout" onClick={() => setShowLogoutConfirm(true)}>Sign Out</button>
          </div>
        </header>

        <div className="dash-content">
          <div className="dash-content-inner">
            {activePage === "overview"      && <OverviewPage username={username} verifyStatus={verifyStatus} requests={requests} orders={orders} toast={toast} />}
            {activePage === "verification"  && <VerificationPage username={username} verifyStatus={verifyStatus} verifyData={verifyData} onRefresh={loadVerifyStatus} toast={toast} />}
            {activePage === "food-requests" && <FoodRequestsPage username={username} ngoData={ngoData} verifyStatus={verifyStatus} toast={toast} />}
            {activePage === "orders"        && <OrdersPage username={username} toast={toast} />}
            {activePage === "addresses"     && <AddressesPage username={username} toast={toast} />}
            {activePage === "profile"       && <ProfilePage username={username} ngoData={ngoData} onUpdated={() => { loadNgoData(); setAvatar(getAvatar()); }} toast={toast} />}
            {activePage === "messages"      && <MessagesPage username={username} toast={toast} />}
            {activePage === "notifications"  && <NotificationPage username={username} toast={toast} />}
            {activePage === "notification-preferences"  && <NotificationPreferences username={username} toast={toast} />}
          </div>
        </div>

        <footer className="dash-footer">
          <span>© {new Date().getFullYear()} <strong style={{ color:"var(--primary-dark)" }}>Re</strong><strong>Feed</strong>. All rights reserved.</span>
          <span>Reducing food waste, one meal at a time 🌿</span>
        </footer>
      </main>
    </div>
  );
}
