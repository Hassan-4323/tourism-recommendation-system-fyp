import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* LEFT SECTION */}
        <div className="footer-section footer-brand">
          <div className="footer-logo-row">
            <span className="footer-logo-icon">⛰</span>
            <h2 className="footer-logo">
              Explore<span>Pakistan</span>
            </h2>
          </div>

          <p className="footer-text">
            Discover safe and beautiful destinations across Pakistan with our
            AI-powered tourism platform designed for smarter travel planning.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/dashboard">Home</a></li>
            <li><a href="/packages">Packages</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* CONTACT SECTION */}
        <div className="footer-section">
          <h3 className="footer-heading">Contact</h3>
          <div className="footer-contact-list">
            <p>📍 Islamabad, Pakistan</p>
            <p>📞 +92 300 1234567</p>
            <p>✉ info@explorepakistan.com</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Explore Pakistan. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;