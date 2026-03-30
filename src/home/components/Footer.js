import React from 'react';
import '../styles/footer.css';

const IconPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconPhone = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconTwitter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconLinkedIn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const IconInstagram = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const IconFacebook = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Footer = () => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer" id="contact">
      <div className="footer__grid">
        {/* Brand */}
        <div>
          <div className="footer__brand-logo">Re<span>Feed</span></div>
          <p className="footer__brand-desc">
            Connecting surplus food with communities in need. Making every meal count.
          </p>
          <div className="footer__socials">
            <a href="/" className="footer__social-link" aria-label="Twitter"><IconTwitter /></a>
            <a href="/" className="footer__social-link" aria-label="LinkedIn"><IconLinkedIn /></a>
            <a href="/" className="footer__social-link" aria-label="Instagram"><IconInstagram /></a>
            <a href="/" className="footer__social-link" aria-label="Facebook"><IconFacebook /></a>
          </div>
        </div>

        {/* About */}
        <div>
          <div className="footer__col-title">About</div>
          <ul className="footer__links">
            <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>Our Mission</a></li>
            <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>How It Works</a></li>
            <li><a href="/">Impact Report</a></li>
            <li><a href="/">Blog</a></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <div className="footer__col-title">Quick Links</div>
          <ul className="footer__links">
            <li><a href="/register">Register</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/">NGO Portal</a></li>
            <li><a href="/">Donor Dashboard</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div className="footer__col-title">Contact</div>
          <div className="footer__contact-item">
            <span className="footer__contact-icon"><IconPin /></span>
            <span>Colombo, Sri Lanka</span>
          </div>
          <div className="footer__contact-item">
            <span className="footer__contact-icon"><IconMail /></span>
            <span>hello@refeed.org</span>
          </div>
          <div className="footer__contact-item">
            <span className="footer__contact-icon"><IconPhone /></span>
            <span>+94 706 125 515</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          © 2026 <span>ReFeed</span>. All rights reserved.
        </p>
        <div className="footer__bottom-links">
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
