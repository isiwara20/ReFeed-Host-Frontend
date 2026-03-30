import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./notifications/NotificationBell";
import "./Navbar.css";

const getDashboardRoute = (currentUser) => {
  if (!currentUser) return "/login";
  if (currentUser.role === "DONATOR") return "/donator-dashboard";
  if (currentUser.role === "NGO") return "/ngo-dashboard";
  if (currentUser.role === "ADMIN") return "/admin-dashboard";
  return "/dashboard";
};

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClassName = ({ isActive }) => `navbar__route ${isActive ? "active" : ""}`;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);
  const goToSection = (id) => {
    setMenuOpen(false);
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    };

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scroll, 120);
    } else {
      scroll();
    }
  };

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          Re<span>Feed</span>
        </Link>

        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`navbar__links${menuOpen ? " open" : ""}`}>
          {isAuthenticated ? (
            <>
              <li><NavLink to={getDashboardRoute(currentUser)} className={linkClassName} onClick={closeMenu}>Dashboard</NavLink></li>
              <li><NavLink to="/users" className={linkClassName} onClick={closeMenu}>Users</NavLink></li>
              <li><NavLink to="/notifications" className={linkClassName} onClick={closeMenu}>Notifications</NavLink></li>
              <li><NavLink to="/messages" className={linkClassName} onClick={closeMenu}>Messages</NavLink></li>
              <li><NavLink to="/donators" className={linkClassName} onClick={closeMenu}>Donators</NavLink></li>
              <li><NavLink to="/settings/notifications" className={linkClassName} onClick={closeMenu}>Notification Settings</NavLink></li>
              <li className="navbar__notification-item">
                <NotificationBell className="navbar__bell" />
              </li>
              <li className="navbar__user-email" title={currentUser?.email || currentUser?.username || "Logged in"}>
                {currentUser?.email || currentUser?.username || "Logged in"}
              </li>
              <li>
                <button type="button" onClick={handleLogout} className="navbar__logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><a href="#hero" onClick={(e) => { e.preventDefault(); goToSection("hero"); }}>Home</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); goToSection("about"); }}>About</a></li>
              <li><a href="#features" onClick={(e) => { e.preventDefault(); goToSection("features"); }}>Features</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); goToSection("contact"); }}>Contact</a></li>
              <li><Link to="/donators" onClick={closeMenu}>Donators</Link></li>
              <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
              <li><Link to="/register" className="navbar__cta" onClick={closeMenu}>Get Started</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

