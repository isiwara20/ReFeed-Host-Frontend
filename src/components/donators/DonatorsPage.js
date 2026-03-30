import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "./donators.css";

export default function DonatorsPage() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/restaurant/all")
      .then((res) => setDonors(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dnp-page">
      <header className="dnp-header">
        <div className="dnp-header-inner">
          <a href="/" className="dnp-logo">Re<span>Feed</span></a>
          <nav className="dnp-nav-links">
            <a href="/">Home</a>
            <a href="/donators" className="active">Donators</a>
          </nav>
        </div>
      </header>

      <div className="dnp-hero-banner">
        <div className="dnp-hero-text">
          <h1 className="dnp-hero-title">Our Donors</h1>
          <p className="dnp-hero-sub">Restaurants and individuals making a difference by donating surplus food.</p>
        </div>
      </div>

      <main className="dnp-main">
        {loading && (
          <div className="dnp-loading">
            <div className="dnp-spinner" />
          </div>
        )}

        {!loading && donors.length === 0 && (
          <div className="dnp-empty">No donors registered yet.</div>
        )}

        {!loading && donors.length > 0 && (
          <>
            <p className="dnp-count">{donors.length} registered donor{donors.length !== 1 ? "s" : ""}</p>
            <div className="dnp-grid">
            {donors.map((d) => (
              <div key={d._id} className="dnp-card">
                <div className="dnp-avatar-wrap">
                  {d.image ? (
                    <img src={d.image} alt={d.name} className="dnp-avatar" />
                  ) : (
                    <div className="dnp-avatar-placeholder">
                      {d.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="dnp-card-body">
                  <h3 className="dnp-card-name">{d.name}</h3>
                  <p className="dnp-card-username">@{d.donorUsername}</p>
                  {d.address     && <p className="dnp-card-info">{d.address}</p>}
                  {d.phone       && <p className="dnp-card-info">{d.phone}</p>}
                  {d.openingHours && <p className="dnp-card-info">{d.openingHours}</p>}
                  {d.foodsServed  && (
                    <div className="dnp-foods">
                      {d.foodsServed.split(",").map((f) => (
                        <span key={f} className="dnp-food-tag">{f.trim()}</span>
                      ))}
                    </div>
                  )}
                  {d.description && <p className="dnp-card-desc">{d.description}</p>}
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
