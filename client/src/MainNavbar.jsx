import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";

function MainNavbar({
  activeTab,
  onSectionClick,
  searchTerm,
  onSearchChange,
  onLogout,
  onFavouritesClick,
  cartCount,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleNavClick = (id) => {
    if (id === "bookings") {
      navigate("/my-bookings");
      return;
    }

    if (id === "favourites" && onFavouritesClick) {
      onFavouritesClick();
    }

    if (location.pathname === "/dashboard") {
      if (onSectionClick) {
        onSectionClick(id);
      }
    } else {
      navigate(`/dashboard#${id}`);
    }
  };

  const handleSearchChange = (e) => {
    if (onSearchChange) onSearchChange(e.target.value);
  };

  return (
    <>
      <header className="dash-header">
        <div className="dash-topbar">
          <div className="dash-topbar-left">
            <span>✉ info@Touringo.com</span>
            <span>📞 +92 324 4563</span>
          </div>
          <div className="dash-topbar-center">
            70% Special Offers On All World Tours
          </div>
          <div className="dash-topbar-right">
            <span>us English</span>
            <span>|</span>
            <span>$ Currency</span>
          </div>
        </div>

        <nav className="dash-nav">
          <div className="dash-logo">
            <span className="dash-logo-icon">⛰</span>
            <span className="dash-logo-text">Touringo</span>
          </div>

          <ul className="dash-menu">
            <li
              className={activeTab === "home" ? "active" : ""}
              onClick={() => handleNavClick("home")}
            >
              Home
            </li>
            <li
              className={activeTab === "about" ? "active" : ""}
              onClick={() => handleNavClick("about")}
            >
              About Us
            </li>
            <li
              className={activeTab === "contact" ? "active" : ""}
              onClick={() => handleNavClick("contact")}
            >
              Contact Us
            </li>
            <li
              className={activeTab === "bookings" ? "active" : ""}
              onClick={() => handleNavClick("bookings")}
            >
              Bookings
            </li>

            <li
              className={`cart-menu-item ${activeTab === "favourites" ? "active" : ""}`.trim()}
              onClick={() => handleNavClick("favourites")}
            >
              <span className="cart-menu-label">
                <span className="fav-label">Cart Items</span>
                {typeof cartCount === "number" && cartCount > 0 && (
                  <span className="fav-badge">{cartCount}</span>
                )}
              </span>
            </li>

            <li
              className={activeTab === "packages" ? "active" : ""}
              onClick={() => handleNavClick("packages")}
            >
              Browse Trips
            </li>
          </ul>

          <div className="dash-nav-actions">
            <div className="dash-search-wrapper">
              <input
                type="text"
                className="dash-search-input"
                placeholder="Search trips..."
                value={searchTerm || ""}
                onChange={handleSearchChange}
              />
              <button className="dash-search-btn-icon">🔍</button>
            </div>

            {onLogout && (
              <button className="dash-logout-btn" onClick={() => setShowLogoutConfirm(true)}>
                Logout
              </button>
            )}
          </div>
        </nav>
      </header>

      {showLogoutConfirm && (
        <div className="site-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="site-modal-card compact" onClick={(e) => e.stopPropagation()}>
            <div className="site-modal-icon">↗</div>
            <h3>Logout from Touringo?</h3>
            <p>Your current session will be closed and you will return to the login page.</p>
            <div className="site-modal-actions">
              <button className="site-modal-secondary" onClick={() => setShowLogoutConfirm(false)}>
                Stay Here
              </button>
              <button
                className="site-modal-primary"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MainNavbar;
