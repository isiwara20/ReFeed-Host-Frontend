import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/notifications/NotificationBell';
import '../styles/navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = () => {
    setDropOpen(false);
    logout();
    navigate('/');
  };

  const getDashboard = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'DONATOR') return '/donator-dashboard';
    if (currentUser.role === 'NGO') return '/ngo-dashboard';
    if (currentUser.role === 'ADMIN') return '/admin-dashboard';
    return '/';
  };

  const initials = currentUser?.username?.slice(0, 2).toUpperCase() || '';

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar__inner">
        <div className="navbar__logo">Re<span>Feed</span></div>

        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        <ul className={`navbar__links${menuOpen ? ' open' : ''}`}>
          <li><a href="#hero" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}>Home</a></li>
          <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a></li>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Features</a></li>
          <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Contact</a></li>
          <li><a href="/donators">Donators</a></li>


          {!currentUser ? (
            <>
              <li><a href="/login">Login</a></li>
              <li><a href="/register" className="navbar__cta">Get Started</a></li>
            </>
          ) : (
            <>
              <li><a href="/notifications">Notifications</a></li>
              <li><a href="/messages">Messages</a></li>
              <li><a href="/settings/notifications">Notification Settings</a></li>
              <li style={{ display: 'flex', alignItems: 'center' }}><NotificationBell /></li>
              <li className="navbar__profile" ref={dropRef}>
                <button className="navbar__avatar" onClick={() => setDropOpen(!dropOpen)}>
                  {initials}
                </button>
                {dropOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__drop-user">{currentUser.username}</div>
                    <button className="navbar__drop-item" onClick={() => { setDropOpen(false); navigate(getDashboard()); }}>
                      Dashboard
                    </button>
                    <button className="navbar__drop-item navbar__drop-logout" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
