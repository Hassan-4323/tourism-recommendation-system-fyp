import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "./MainNavbar";
import "./App.css";
import { getMyBookings, cancelMyBooking } from "./api";

const PAYMENT_LABELS = {
  cash_on_arrival: "Cash on Arrival",
  bank_transfer: "Bank Transfer",
  demo_card: "Demo Card Payment",
};

const PLAN_LABELS = {
  single: "Single Package",
  group: "Group Package",
  family: "Family Package",
};

const formatBookingDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const getBookingStatusClass = (status) => {
  if (status === "confirmed") return "confirmed";
  if (status === "cancelled") return "cancelled";
  return "pending";
};

export default function MyBookingsPage({ onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err.message || "Failed to load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      setLoadingBookings(true);
      await cancelMyBooking(bookingId);
      await loadBookings();
      setMessage("Booking cancelled.");
    } catch (err) {
      setMessage(err.message || "Failed to cancel booking");
      setLoadingBookings(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      b.tour?.title?.toLowerCase().includes(q) ||
      b.tour?.location?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-page my-bookings-page-wrap">
      <MainNavbar
        activeTab="bookings"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={onLogout}
        cartCount={0}
      />

      <section className="my-bookings-page-hero">
        <div className="dash-container">
          <p className="dash-section-tag center">My Bookings</p>
          <h1 className="dash-section-title center my-bookings-main-title">
            Manage Your <span className="dash-highlight">Booked Trips</span>
          </h1>
          <p className="dash-section-subtext center-text">
            View all your reservations in one dedicated place, track their status and manage upcoming travel professionally.
          </p>

          <div className="my-bookings-hero-stats">
            <div className="my-bookings-stat-card">
              <strong>{bookings.length}</strong>
              <span>Total Bookings</span>
            </div>
            <div className="my-bookings-stat-card">
              <strong>{bookings.filter((b) => b.status === "confirmed").length}</strong>
              <span>Confirmed</span>
            </div>
            <div className="my-bookings-stat-card">
              <strong>{bookings.filter((b) => b.status !== "cancelled").length}</strong>
              <span>Active Trips</span>
            </div>
          </div>
        </div>
      </section>

      <section className="my-bookings-page-section">
        <div className="dash-container">
          <div className="my-bookings-toolbar">
            <div>
              <h2 className="my-bookings-section-heading">Your Travel Reservations</h2>
              <p className="my-bookings-toolbar-text">
                Open package details, review trip information and cancel only when needed.
              </p>
            </div>

            <button
              type="button"
              className="view-all-packages-btn"
              onClick={() => navigate("/dashboard#packages")}
            >
              Browse More Packages
            </button>
          </div>

          {message ? <p className="my-bookings-message">{message}</p> : null}

          {loadingBookings && <p style={{ textAlign: "center" }}>Loading bookings...</p>}

          {!loadingBookings && filteredBookings.length === 0 && (
            <div className="empty-state-card">
              <div className="empty-state-icon">🧳</div>
              <h3>No bookings yet</h3>
              <p>Your booked trips will appear here once you reserve a package.</p>
              <button className="btn-primary" onClick={() => navigate("/dashboard#packages")}>
                Browse Packages
              </button>
            </div>
          )}

          {!loadingBookings && filteredBookings.length > 0 && (
            <div className="booking-cards-grid my-bookings-grid">
              {filteredBookings.map((b) => (
                <div
                  key={b._id}
                  className={`booking-card my-booking-card-pro status-${getBookingStatusClass(b.status)}`}
                >
                  <div className="booking-card-top my-booking-card-top">
                    <div className="my-booking-card-title-wrap">
                      <div className="my-booking-card-label-row">
                        <span className="my-booking-card-label">Reservation</span>
                        <span className="my-booking-card-reference">#{String(b._id).slice(-6).toUpperCase()}</span>
                      </div>
                      <h3>{b.tour?.title}</h3>
                      <p className="pkg-location my-booking-card-location">{b.tour?.location}</p>
                    </div>

                    <div className="my-booking-card-status-wrap">
                      <span className={`my-booking-status-chip ${getBookingStatusClass(b.status)}`}>
                        {b.status}
                      </span>
                      <span className="my-booking-created-date">Booked {formatBookingDate(b.createdAt)}</span>
                    </div>
                  </div>

                  <div className="booking-info-row">
                    <div className="booking-info-box">
                      <span>Trip Start</span>
                      <strong>{formatBookingDate(b.travelDate)}</strong>
                    </div>
                    <div className="booking-info-box">
                      <span>Trip End</span>
                      <strong>{formatBookingDate(b.returnDate)}</strong>
                    </div>
                    <div className="booking-info-box booking-info-box-highlight">
                      <span>Total</span>
                      <strong>PKR {Number(b.totalPrice).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="booking-info-row">
                    <div className="booking-info-box">
                      <span>Travelers</span>
                      <strong>{b.numGuests}</strong>
                    </div>
                    <div className="booking-info-box">
                      <span>Plan</span>
                      <strong>{PLAN_LABELS[b.planType] || "Group Package"}</strong>
                    </div>
                    <div className="booking-info-box">
                      <span>Payment</span>
                      <strong>{PAYMENT_LABELS[b.paymentMethod] || "Cash on Arrival"}</strong>
                    </div>
                  </div>

                  <div className="booking-info-row">
                    <div className="booking-info-box">
                      <span>Traveler</span>
                      <strong>{b.travelerName || "Saved User"}</strong>
                    </div>
                    <div className="booking-info-box">
                      <span>Phone</span>
                      <strong>{b.travelerPhone || "-"}</strong>
                    </div>
                    <div className="booking-info-box">
                      <span>Departure City</span>
                      <strong>{b.departureCity || "-"}</strong>
                    </div>
                  </div>

                  <div className="my-bookings-card-actions">
                    <button
                      type="button"
                      className="pkg-details-btn my-booking-view-btn"
                      onClick={() => navigate(`/packages/${b.tour?._id}`)}
                    >
                      View Package
                    </button>

                    {b.status !== "cancelled" && (
                      <button
                        className="booking-cancel-btn"
                        onClick={() => handleCancelBooking(b._id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
