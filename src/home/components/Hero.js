import React, { useEffect, useRef } from 'react';
import '../styles/hero.css';

const Hero = () => {
  const bgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80';
    img.onload = () => {
      if (bgRef.current) bgRef.current.classList.add('loaded');
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero__bg" ref={bgRef} />
      <div className="hero__overlay" />

      <div className="hero__content">
        <div className="hero__badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Fighting Food Waste Together
        </div>
        <h1 className="hero__title">
          Reduce Food Waste.<br />
          <span className="highlight-green">Feed </span>
          <span className="highlight-orange">Communities.</span>
        </h1>
        <p className="hero__subtitle">
          ReFeed connects surplus food donors with verified NGOs — making food redistribution
          seamless, transparent, and impactful.
        </p>
        <div className="hero__actions">
          <a href="/register" className="btn btn--primary">
            Register Now
          </a>
          <button
            className="btn btn--secondary"
            onClick={() => scrollTo('contact')}
          >
            Contact Us
          </button>
        </div>
      </div>

      <div className="hero__wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
