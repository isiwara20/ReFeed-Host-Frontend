import React from 'react';

const styles = {
  section: {
    background: '#ffffff',
    padding: '100px 0',
    position: 'relative',
    borderTop: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb',
  },
  inner: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '72px',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  videoWrap: {
    borderRadius: '20px',
    overflow: 'hidden',
    aspectRatio: '16/9',
    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
    background: '#f0f2f5',
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    minHeight: '280px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: 'linear-gradient(135deg, #f0faf4 0%, #fff3ee 100%)',
    cursor: 'pointer',
  },
  playBtn: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: '#00c853',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 16px rgba(0,200,83,0.12)',
    cursor: 'pointer',
    transition: 'transform 0.28s ease',
  },
  videoLabel: {
    color: '#6b7280',
    fontSize: '0.88rem',
    fontWeight: 500,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  tag: {
    display: 'inline-block',
    color: '#00c853',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '14px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  title: {
    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1.2,
    marginBottom: '20px',
    letterSpacing: '-0.8px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  desc: {
    color: '#6b7280',
    fontSize: '1rem',
    lineHeight: 1.8,
    marginBottom: '16px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '28px 0 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#374151',
    fontSize: '0.95rem',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 500,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#ff6b35',
    flexShrink: 0,
  },
};

const VideoSection = () => {
  return (
    <section style={styles.section} id="video">
      <div style={styles.inner}>
        {/* Video side */}
        <div style={styles.videoWrap}>
          <div style={styles.videoPlaceholder}>
            <div style={styles.playBtn}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span style={styles.videoLabel}>ReFeed in Action</span>
          </div>
        </div>

        {/* Text side */}
        <div>
          <span style={styles.tag}>See It Live</span>
          <h2 style={styles.title}>
            From Surplus to Smiles<br />in Minutes
          </h2>
          <p style={styles.desc}>
            Watch how a restaurant posts leftover food, gets matched with a local NGO,
            and completes a verified pickup — all within a single platform.
          </p>
          <ul style={styles.list}>
            {[
              'Post surplus food in under 60 seconds',
              'Automatic NGO matching by proximity',
              'QR code generated for secure handoff',
              'Real-time status updates via WhatsApp',
            ].map((item, i) => (
              <li key={i} style={styles.listItem}>
                <span style={styles.dot} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
