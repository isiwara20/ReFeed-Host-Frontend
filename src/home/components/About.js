import React from 'react';
import '../styles/about.css';

const About = () => {
  return (
    <section className="about" id="about">
      <div className="about__inner">
        {/* Left: Text */}
        <div className="about__text">
          <span className="about__tag">About ReFeed</span>
          <h2 className="about__title">
            Bridging the Gap Between<br />Surplus and Need
          </h2>
          <p className="about__desc">
            Every day, tonnes of edible food go to waste while millions go hungry.
            ReFeed is a platform that bridges this gap — connecting food donors
            (restaurants, caterers, households) with verified NGOs and food banks
            in real time.
          </p>
          <p className="about__desc">
            Our smart matching engine, QR-based verification, and WhatsApp
            notifications make the entire donation journey frictionless and
            fully traceable.
          </p>

          <div className="about__stats">
            <div className="about__stat">
              <div className="about__stat-value green">12K+</div>
              <div className="about__stat-label">Meals Redistributed</div>
            </div>
            <div className="about__stat">
              <div className="about__stat-value orange">340+</div>
              <div className="about__stat-label">Verified NGOs</div>
            </div>
            <div className="about__stat">
              <div className="about__stat-value dark">98%</div>
              <div className="about__stat-label">Delivery Success</div>
            </div>
          </div>
        </div>

        {/* Right: Video */}
        <div className="about__video-wrap">
          <div className="about__video-placeholder">
            <div className="about__play-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="about__video-label">Watch how ReFeed works</span>
          </div>
        </div>
      </div>

      <div className="about__wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" fill="#f7f8fa" />
        </svg>
      </div>
    </section>
  );
};

export default About;
