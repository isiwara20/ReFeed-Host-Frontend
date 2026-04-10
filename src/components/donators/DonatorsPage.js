import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "./donators.css";

export default function DonatorsPage() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/restaurant/all")
      .then((res) => setDonors(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = donors.filter((d) =>
    !search ||
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.donorUsername?.toLowerCase().includes(search.toLowerCase()) ||
    d.address?.toLowerCase().includes(search.toLowerCase()) ||
    d.foodsServed?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dnp-page">

      {/* Hero */}
      <div className="dnp-hero">
        <div className="dnp-hero-overlay" />
        <div className="dnp-hero-content">
          <span className="dnp-hero-badge">Community Partners</span>
          <h1 className="dnp-hero-title">Our Food Donors</h1>
          <p className="dnp-hero-sub">
            Restaurants and individuals making a real difference by sharing surplus food with those in need.
          </p>
          <div className="dnp-search-wrap">
            <svg className="dnp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="dnp-search"
              type="text"
              placeholder="Search by name, location or food type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="dnp-search-clear" onClick={() => setSearch("")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && donors.length > 0 && (
        <div className="dnp-stats-bar">
          <div className="dnp-stats-inner">
            <div className="dnp-stat">
              <span className="dnp-stat-value">{donors.length}</span>
              <span className="dnp-stat-label">Registered Donors</span>
            </div>
            <div className="dnp-stat-divider" />
            <div className="dnp-stat">
              <span className="dnp-stat-value">{filtered.length}</span>
              <span className="dnp-stat-label">Showing</span>
            </div>
          </div>
        </div>
      )}

      <main className="dnp-main">
        {/* Loading */}
        {loading && (
          <div className="dnp-loading">
            <div className="dnp-spinner" />
            <p className="dnp-loading-text">Loading donors…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && donors.length === 0 && (
          <div className="dnp-empty">
            <div className="dnp-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="dnp-empty-title">No donors yet</h3>
            <p className="dnp-empty-desc">Be the first to register as a food donor and make a difference.</p>
          </div>
        )}

        {/* No search results */}
        {!loading && donors.length > 0 && filtered.length === 0 && (
          <div className="dnp-empty">
            <div className="dnp-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 className="dnp-empty-title">No results found</h3>
            <p className="dnp-empty-desc">Try a different search term.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="dnp-grid">
            {filtered.map((d) => (
              <div key={d._id} className="dnp-card">
                <div className="dnp-card-top">
                  <div className="dnp-avatar-wrap">
                    {d.image ? (
                      <img src={d.image} alt={d.name} className="dnp-avatar" />
                    ) : (
                      <div className="dnp-avatar-placeholder">
                        {d.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="dnp-card-identity">
                    <h3 className="dnp-card-name">{d.name}</h3>
                    <p className="dnp-card-username">@{d.donorUsername}</p>
                  </div>
                </div>

                {d.description && (
                  <p className="dnp-card-desc">{d.description}</p>
                )}

                <div className="dnp-card-meta">
                  {d.address && (
                    <div className="dnp-meta-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{d.address}</span>
                    </div>
                  )}
                  {d.phone && (
                    <div className="dnp-meta-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>{d.phone}</span>
                    </div>
                  )}
                  {d.openingHours && (
                    <div className="dnp-meta-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{d.openingHours}</span>
                    </div>
                  )}
                </div>

                {d.foodsServed && (
                  <div className="dnp-foods">
                    {d.foodsServed.split(",").map((f) => (
                      <span key={f} className="dnp-food-tag">{f.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="dnp-footer">
        <p>© {new Date().getFullYear()} <strong>Re</strong><strong style={{color:"#16a34a"}}>Feed</strong> — Reducing food waste, one meal at a time 🌿</p>
      </footer>
    </div>
  );
}
