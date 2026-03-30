import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { surplusApi } from "./surplusApi";
import Footer from "../../home/components/Footer";
import "./surplus.css";

/* ── State machine config ── */
const STEPS = ["DRAFT", "PUBLISHED", "RESERVED", "COLLECTED", "COMPLETED"];

const STATUS_META = {
  DRAFT:     { label: "Draft",     color: "DRAFT" },
  PUBLISHED: { label: "Published", color: "PUBLISHED" },
  RESERVED:  { label: "Reserved",  color: "RESERVED" },
  COLLECTED: { label: "Collected", color: "COLLECTED" },
  COMPLETED: { label: "Completed", color: "COMPLETED" },
  EXPIRED:   { label: "Expired",   color: "EXPIRED" },
  CANCELLED: { label: "Cancelled", color: "CANCELLED" },
};

const FOOD_TYPES = ["veg", "cooked", "packed", "bakery", "mixed", "dairy", "non-veg"];
const UNITS = ["kg", "g", "litres", "portions", "boxes", "bags", "pieces"];

/* ── Nominatim forward geocode: address → { lat, lng, display_name } ── */
async function geocodeAddress(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
    { headers: { "User-Agent": "ReFeed/1.0 (student project)" } }
  );
  const data = await res.json();
  return data; // array of results
}

/* ── SVG Icons ── */
const IconFood = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);
const IconQty = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconQR = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconNgo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ── Stepper ── */
const Stepper = ({ current }) => {
  const idx = STEPS.indexOf(current);
  return (
    <div className="sp-stepper">
      {STEPS.map((step, i) => {
        const done   = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={step}>
            <div className="sp-step-wrap">
              <div className={`sp-step-dot ${done ? "done" : active ? "active" : ""}`}>
                {done ? <IconCheck /> : i + 1}
              </div>
              <div className={`sp-step-label ${done ? "done" : active ? "active" : ""}`}>
                {step}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`sp-step-line ${done ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── Status Badge ── */
const Badge = ({ status }) => (
  <span className={`sp-badge ${status}`}>
    <span className="sp-badge-dot" />
    {STATUS_META[status]?.label || status}
  </span>
);

/* ── QR Modal ── */
const QRModal = ({ qr, onClose }) => (
  <div className="sp-modal-overlay" onClick={onClose}>
    <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
      <h3>Pickup QR Code</h3>
      <p>Show this to the NGO for verified pickup</p>
      <img src={qr} alt="QR Code" />
      <button className="sp-btn sp-btn-ghost sp-modal-close" onClick={onClose}>Close</button>
    </div>
  </div>
);

/* ── Address Search with Geocoding ── */
const AddressSearch = ({ onSelect }) => {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [debounce, setDebounce] = useState(null);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    if (debounce) clearTimeout(debounce);
    if (val.length < 4) { setResults([]); return; }
    setDebounce(setTimeout(async () => {
      setSearching(true);
      try {
        const data = await geocodeAddress(val);
        setResults(data);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 600));
  };

  const pick = (item) => {
    setSelected(item.display_name);
    setQuery(item.display_name);
    setResults([]);
    onSelect({ address: item.display_name, lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
  };

  return (
    <div className="sp-address-wrap">
      <div className="sp-input-wrap">
        <IconPin className="sp-input-icon" />
        <input
          type="text"
          placeholder="Type your pickup address…"
          value={query}
          onChange={handleInput}
          autoComplete="off"
        />
        {searching && <span className="sp-addr-spinner" />}
      </div>
      {results.length > 0 && !selected && (
        <ul className="sp-addr-dropdown">
          {results.map((r) => (
            <li key={r.place_id} onClick={() => pick(r)}>
              <IconPin /> {r.display_name}
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <div className="sp-addr-confirmed">
          <IconCheck /> Address confirmed
        </div>
      )}
    </div>
  );
};

/* ── Nearby NGOs Panel ── */
const NearbyNGOs = ({ lat, lng, user }) => {
  const [ngos, setNgos]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!lat || !lng) return;
    setLoading(true);
    setError("");
    try {
      const res = await surplusApi.getNearbyNGOs(lat, lng, user);
      setNgos(res.data || []);
      setSearched(true);
    } catch {
      setError("Could not fetch nearby NGOs.");
    } finally {
      setLoading(false);
    }
  };

  if (!lat || !lng) return null;

  return (
    <div className="sp-ngo-panel">
      <div className="sp-ngo-panel-header">
        <div className="sp-ngo-panel-title">
          <IconNgo /> Nearby NGOs
        </div>
        <button
          type="button"
          className="sp-btn sp-btn-outline sp-btn-sm"
          onClick={search}
          disabled={loading}
        >
          {loading ? <span className="sp-spinner" /> : <IconSearch />}
          {loading ? "Searching…" : searched ? "Refresh" : "Find NGOs"}
        </button>
      </div>

      {error && <div className="sp-alert sp-alert-error"><IconX /> {error}</div>}

      {searched && ngos.length === 0 && !loading && (
        <p className="sp-ngo-empty">No NGOs found within ~5 km of this address.</p>
      )}

      {ngos.length > 0 && (
        <ul className="sp-ngo-list">
          {ngos.map((n, i) => (
            <li key={n.place_id || i} className="sp-ngo-item">
              <div className="sp-ngo-dot" />
              <div>
                <div className="sp-ngo-name">{n.display_name?.split(",")[0] || "NGO"}</div>
                <div className="sp-ngo-addr">{n.display_name}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ── Create Form ── */
const CreateForm = ({ user, onCreated }) => {
  const [form, setForm] = useState({
    foodType: "veg",
    quantityAmount: "",
    quantityUnit: "kg",
    expiryTime: "",
    pickupWindowStart: "",
    pickupWindowEnd: "",
    selfDelivery: false,
  });
  const [location, setLocation] = useState({ address: "", lat: null, lng: null });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const set = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [field]: val }));
    setError("");
  };

  const validate = () => {
    if (!form.quantityAmount || isNaN(form.quantityAmount) || Number(form.quantityAmount) <= 0)
      return "Enter a valid quantity amount.";
    if (!form.expiryTime) return "Expiry time is required.";
    if (new Date(form.expiryTime) <= new Date()) return "Expiry must be in the future.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) return setError(err);

    const payload = {
      foodType: form.foodType,
      quantity: { amount: Number(form.quantityAmount), unit: form.quantityUnit },
      expiryTime: new Date(form.expiryTime).toISOString(),
      selfDelivery: form.selfDelivery,
      ...(form.pickupWindowStart && { pickupWindowStart: new Date(form.pickupWindowStart).toISOString() }),
      ...(form.pickupWindowEnd   && { pickupWindowEnd:   new Date(form.pickupWindowEnd).toISOString() }),
      location: {
        ...(location.address && { address: location.address }),
        ...(location.lat     && { lat: location.lat }),
        ...(location.lng     && { lng: location.lng }),
      },
    };

    try {
      setLoading(true);
      const res = await surplusApi.createDraft(payload, user);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onCreated(res.data); }, 1200);
    } catch (ex) {
      setError(ex.response?.data?.message || "Failed to create donation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-form-card">
      <div className="sp-form-title">New Surplus Donation — Draft</div>

      {error   && <div className="sp-alert sp-alert-error"><IconX /> {error}</div>}
      {success && <div className="sp-alert sp-alert-success"><IconCheck /> Draft created! Switching to My Donations…</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Food type + Quantity */}
        <div className="sp-row">
          <div className="sp-field">
            <label>Food Type <span className="sp-req">*</span></label>
            <div className="sp-input-wrap">
              <IconFood className="sp-input-icon" />
              <select value={form.foodType} onChange={set("foodType")}>
                {FOOD_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="sp-field">
            <label>Quantity <span className="sp-req">*</span></label>
            <div className="sp-qty-row">
              <div className="sp-input-wrap">
                <IconQty className="sp-input-icon" />
                <input type="number" min="0.1" step="0.1" placeholder="e.g. 5"
                  value={form.quantityAmount} onChange={set("quantityAmount")} />
              </div>
              <div className="sp-input-wrap">
                <select value={form.quantityUnit} onChange={set("quantityUnit")}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Expiry */}
        <div className="sp-row">
          <div className="sp-field">
            <label>Expiry Time <span className="sp-req">*</span></label>
            <div className="sp-input-wrap">
              <IconClock className="sp-input-icon" />
              <input type="datetime-local" value={form.expiryTime} onChange={set("expiryTime")} />
            </div>
          </div>
          <div className="sp-field">
            <label>Pickup Window Start</label>
            <div className="sp-input-wrap">
              <IconClock className="sp-input-icon" />
              <input type="datetime-local" value={form.pickupWindowStart} onChange={set("pickupWindowStart")} />
            </div>
          </div>
        </div>

        <div className="sp-row">
          <div className="sp-field">
            <label>Pickup Window End</label>
            <div className="sp-input-wrap">
              <IconClock className="sp-input-icon" />
              <input type="datetime-local" value={form.pickupWindowEnd} onChange={set("pickupWindowEnd")} />
            </div>
          </div>
        </div>

        {/* Address with geocoding */}
        <div className="sp-field">
          <label>Pickup Address</label>
          <AddressSearch onSelect={(loc) => setLocation(loc)} />
          {location.lat && (
            <div className="sp-coords-badge">
              <IconPin /> {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </div>
          )}
        </div>

        {/* Nearby NGOs — shown once address is resolved */}
        <NearbyNGOs lat={location.lat} lng={location.lng} user={user} />

        {/* Self delivery */}
        <label className="sp-checkbox-wrap">
          <input type="checkbox" checked={form.selfDelivery} onChange={set("selfDelivery")} />
          <div>
            <div className="sp-checkbox-label">Self Delivery</div>
            <div className="sp-checkbox-desc">I will deliver the food to the NGO myself</div>
          </div>
        </label>

        <div className="sp-form-actions">
          <button type="submit" className="sp-btn sp-btn-primary" disabled={loading || success}>
            {loading ? <span className="sp-spinner" /> : <IconPlus />}
            {loading ? "Creating…" : "Save as Draft"}
          </button>
          <button type="reset" className="sp-btn sp-btn-ghost" onClick={() => { setError(""); setLocation({ address: "", lat: null, lng: null }); }}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Donation Card ── */
const DonationCard = ({ donation, user, onRefresh }) => {
  const [busy, setBusy]   = useState(false);
  const [qr, setQr]       = useState(null);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (["RESERVED","COLLECTED","COMPLETED"].includes(donation.lifecycleStatus)) {
      surplusApi.getOrderDetails(donation._id, user)
        .then(res => setOrder(res.data || res))
        .catch(() => {});
    }
  }, [donation._id, donation.lifecycleStatus, user]);

  const act = async (fn, label) => {
    if (!window.confirm(`${label} this donation?`)) return;
    try {
      setBusy(true); setError("");
      await fn();
      onRefresh();
    } catch (ex) {
      setError(ex.response?.data?.message || `${label} failed.`);
    } finally { setBusy(false); }
  };

  const loadQR = async () => {
    try {
      setBusy(true);
      const res = await surplusApi.getQRCode(donation._id, user);
      setQr(res.data.qr);
    } catch { setError("Failed to load QR code."); }
    finally { setBusy(false); }
  };

  const d = donation;
  const expiry     = d.expiryTime ? new Date(d.expiryTime).toLocaleString() : "—";
  const pickupStart = d.pickupWindowStart ? new Date(d.pickupWindowStart).toLocaleString() : null;
  const pickupEnd   = d.pickupWindowEnd   ? new Date(d.pickupWindowEnd).toLocaleString()   : null;

  return (
    <div className={`sp-donation-card ${d.lifecycleStatus}`}>
      {qr && <QRModal qr={qr} onClose={() => setQr(null)} />}

      <div className="sp-card-top">
        <div>
          <div className="sp-card-title">{d.foodType} — {d.quantity?.amount} {d.quantity?.unit}</div>
          <div className="sp-card-meta">
            <span><IconClock /> Expires: {expiry}</span>
            {d.location?.address && <span><IconPin /> {d.location.address}</span>}
            {d.selfDelivery && <span>Self delivery</span>}
            {pickupStart && <span><IconClock /> Pickup: {pickupStart}{pickupEnd ? ` – ${pickupEnd}` : ""}</span>}
          </div>
        </div>
        <Badge status={d.lifecycleStatus} />
      </div>

      {!["EXPIRED","CANCELLED"].includes(d.lifecycleStatus) && (
        <Stepper current={d.lifecycleStatus} />
      )}

      {order && (
        <div className="sp-ngo-info">
          <span className="sp-ngo-info__label">Reserved by NGO</span>
          <span className="sp-ngo-info__value">{order.ngoUsername}</span>
          {order.deliveryType && <span className="sp-ngo-info__meta">{order.deliveryType === "delivery" ? `Delivery to: ${order.deliveryAddress}` : "Self pickup"}</span>}
        </div>
      )}

      {error && <div className="sp-alert sp-alert-error" style={{marginBottom:12}}><IconX /> {error}</div>}

      <div className="sp-card-actions">
        {d.lifecycleStatus === "DRAFT" && (
          <button className="sp-btn sp-btn-primary sp-btn-sm" disabled={busy}
            onClick={() => act(() => surplusApi.publish(d._id, user), "Publish")}>
            {busy ? <span className="sp-spinner" /> : null} Publish
          </button>
        )}
        {d.lifecycleStatus === "PUBLISHED" && (
          <button className="sp-btn sp-btn-outline sp-btn-sm" disabled={busy}
            onClick={() => act(() => surplusApi.reserve(d._id, user), "Reserve")}>
            {busy ? <span className="sp-spinner" /> : null} Mark Reserved
          </button>
        )}
        {d.lifecycleStatus === "RESERVED" && (
          <button className="sp-btn sp-btn-orange sp-btn-sm" disabled={busy}
            onClick={() => act(() => surplusApi.collect(d._id, user), "Mark Collected")}>
            {busy ? <span className="sp-spinner" /> : null} Mark Collected
          </button>
        )}
        {d.lifecycleStatus === "COLLECTED" && (
          <button className="sp-btn sp-btn-primary sp-btn-sm" disabled={busy}
            onClick={() => act(() => surplusApi.complete(d._id, user), "Complete")}>
            {busy ? <span className="sp-spinner" /> : null} Mark Complete
          </button>
        )}
        {["PUBLISHED","RESERVED","COLLECTED"].includes(d.lifecycleStatus) && (
          <button className="sp-btn sp-btn-ghost sp-btn-sm" disabled={busy} onClick={loadQR}>
            <IconQR /> View QR
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Main Page ── */
export default function SurplusDonationPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]               = useState("list");
  const [donations, setDonations]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState("");

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true); setFetchError("");
      const res = await surplusApi.listMine(currentUser);
      setDonations(res.data || []);
    } catch (ex) {
      setFetchError(ex.response?.data?.message || "Failed to load donations.");
    } finally { setLoading(false); }
  }, [currentUser]);

  useEffect(() => { loadDonations(); }, [loadDonations]);

  const handleCreated = (newDonation) => {
    setDonations((prev) => [newDonation, ...prev]);
    setTab("list");
  };

  const activeCount    = donations.filter((d) => !["COMPLETED","CANCELLED","EXPIRED"].includes(d.lifecycleStatus)).length;
  const completedCount = donations.filter((d) => d.lifecycleStatus === "COMPLETED").length;

  return (
    <div className="sp-page">
      {/* Navbar */}
      <header className="sp-nav">
        <div className="sp-nav-inner">
          <a href="/" className="sp-nav-logo">Re<span>Feed</span></a>
          <nav className="sp-nav-links">
            <a href="/">Home</a>
            <Link to="/donator-dashboard">Dashboard</Link>
            <Link to="/donor-profile">My Profile</Link>
          </nav>
          <div className="sp-nav-right">
            <span className="sp-nav-user">{currentUser?.username}</span>
            <button className="sp-nav-logout" onClick={() => { logout(); navigate("/"); }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="sp-main">
        {/* Page header */}
        <div className="sp-header">
          <div>
            <div className="sp-breadcrumb">
              <Link to="/donator-dashboard">Dashboard</Link>
              <span>/</span>
              <span>Surplus Donations</span>
            </div>
            <h1 className="sp-page-title">Surplus Donations</h1>
            <p className="sp-page-sub">
              {activeCount} active · {completedCount} completed · {donations.length} total
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="sp-btn sp-btn-ghost sp-btn-sm" onClick={loadDonations}>
              <IconRefresh /> Refresh
            </button>
            <button className="sp-btn sp-btn-primary sp-btn-sm" onClick={() => setTab("create")}>
              <IconPlus /> New Donation
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="sp-tabs">
          <button className={`sp-tab ${tab === "list" ? "active" : ""}`} onClick={() => setTab("list")}>
            My Donations ({donations.length})
          </button>
          <button className={`sp-tab ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>
            + New Donation
          </button>
        </div>

        {/* Create tab */}
        {tab === "create" && <CreateForm user={currentUser} onCreated={handleCreated} />}

        {/* List tab */}
        {tab === "list" && (
          <>
            {loading && (
              <div className="sp-loading">
                <div className="sp-loading-spinner" />
                <span>Loading donations…</span>
              </div>
            )}
            {!loading && fetchError && (
              <div className="sp-alert sp-alert-error"><IconX /> {fetchError}</div>
            )}
            {!loading && !fetchError && donations.length === 0 && (
              <div className="sp-empty">
                <div className="sp-empty-icon"><IconFood /></div>
                <p>No surplus donations yet.</p>
                <button className="sp-btn sp-btn-primary" onClick={() => setTab("create")}>
                  <IconPlus /> Post Your First Donation
                </button>
              </div>
            )}
            {!loading && !fetchError && donations.length > 0 && (
              <>
                <div className="sp-list-header">
                  <span className="sp-list-title">All Donations</span>
                  <span className="sp-list-count">{donations.length} total</span>
                </div>
                {donations.map((d) => (
                  <DonationCard key={d._id} donation={d} user={currentUser} onRefresh={loadDonations} />
                ))}
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
