import React from 'react';
import '../styles/features.css';

const IconZap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconMatch = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconMessage = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconQr = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="3" height="3" />
    <line x1="21" y1="14" x2="21" y2="14" />
    <line x1="21" y1="21" x2="21" y2="21" />
    <line x1="17" y1="21" x2="17" y2="21" />
  </svg>
);

const IconMap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const FEATURES = [
  { Icon: IconZap,    title: 'Real-Time Food Donation',   desc: 'Post surplus food instantly and get matched with nearby NGOs within minutes. No delays, no waste.' },
  { Icon: IconMatch,  title: 'Smart NGO Matching',        desc: 'Our algorithm matches donations to the most suitable verified NGO based on location, capacity, and food type.' },
  { Icon: IconMessage,title: 'WhatsApp Notifications',    desc: 'Donors and NGOs receive real-time updates via WhatsApp — no app download required.' },
  { Icon: IconQr,     title: 'QR Verification',           desc: 'Every pickup is verified with a unique QR code, ensuring full traceability and accountability.' },
  { Icon: IconMap,    title: 'Live Logistics Tracking',   desc: 'Track donation pickups and deliveries on an interactive map in real time.' },
  { Icon: IconChart,  title: 'Impact Dashboard',          desc: 'Donors get a personal dashboard showing meals donated, CO₂ saved, and communities impacted.' },
];

const Features = () => {
  return (
    <section className="features" id="features">
      <div className="features__header">
        <span className="features__tag">What We Offer</span>
        <h2 className="features__title">Everything You Need to Donate Smarter</h2>
        <p className="features__subtitle">
          A complete toolkit for food redistribution — from donation posting to verified delivery.
        </p>
      </div>

      <div className="features__grid">
        {FEATURES.map(({ Icon, title, desc }, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-card__icon"><Icon /></div>
            <h3 className="feature-card__title">{title}</h3>
            <p className="feature-card__desc">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
