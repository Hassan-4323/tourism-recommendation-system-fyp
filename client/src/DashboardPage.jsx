// src/DashboardPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { getTours, getMyBookings, cancelMyBooking, getBlogs } from "./api";
import { useNavigate, useLocation } from "react-router-dom";
import MainNavbar from "./MainNavbar";

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

function DashboardPage({ onLogout }) {
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const navigate = useNavigate();
  const location = useLocation();
  const packagesCarouselRef = useRef(null);

  const showToast = (msg) => {
    setToast({ show: true, message: msg });

    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2500);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setLoadingBookings(true);
      await cancelMyBooking(bookingId);
      const data = await getMyBookings();
      setBookings(data);
      setMessage("Booking cancelled.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleAddToCart = (tour) => {
    setCartItems((prev) => {
      const exists = prev.some((item) => item._id === tour._id);

      if (exists) {
        showToast("This tour is already in your cart.");
        return prev;
      }

      showToast("Tour added to cart!");
      return [...prev, tour];
    });
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const openCart = () => {
    setIsCartOpen(true);
    setActiveTab("favourites");
  };

  const closeCart = () => setIsCartOpen(false);

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleBookNow = (tour) => {
    navigate(`/book/${tour._id}`, { state: { tour } });
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    setActiveTab(id);
    const section = document.getElementById(id);
    if (section) {
      setTimeout(() => section.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [location]);

  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) return;

    const section = document.getElementById("packages");
    if (section) {
      setActiveTab("packages");
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchTerm]);

  useEffect(() => {
    const loadTours = async () => {
      try {
        const data = await getTours();
        setTours(data);
      } catch (err) {
        console.error("Error loading tours:", err.message);
        setMessage(err.message);
      } finally {
        setLoadingTours(false);
      }
    };

    const loadBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const data = await getBlogs();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading blogs:", err.message);
      } finally {
        setLoadingBlogs(false);
      }
    };

    const loadMyBookings = async () => {
      try {
        setLoadingBookings(true);
        const data = await getMyBookings();
        setBookings(data);
      } catch (err) {
        console.error("Error loading bookings:", err.message);
      } finally {
        setLoadingBookings(false);
      }
    };

    loadTours();
    loadMyBookings();
    loadBlogs();
  }, []);


  const filteredTours = tours.filter((t) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      t.title?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q)
    );
  });

  const handleViewDetails = (tour) => {
    navigate(`/packages/${tour._id}`, { state: { tour } });
  };

  const scrollPackagesCarousel = (direction) => {
    const container = packagesCarouselRef.current;
    if (!container) return;

    const firstCard = container.querySelector(".user-package-card");
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
    const gap = 28;
    const amount = cardWidth + gap;

    container.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const goToAllPackages = () => {
    navigate("/packages");
  };

  const featureCards = [
    {
      icon: "🧭",
      title: "Smart Trip Planning",
      text: "Explore well-organized destinations and plan your journey with confidence.",
    },
    {
      icon: "🛡️",
      title: "Safe Travel Choices",
      text: "Choose locations and packages designed for comfort, safety and convenience.",
    },
    {
      icon: "⚡",
      title: "Quick Booking Flow",
      text: "Book trips, manage bookings and move through the website with ease.",
    },
    {
      icon: "💬",
      title: "Helpful Support",
      text: "Get assistance for packages, schedules and travel-related questions anytime.",
    },
  ];


  const travelInsights = useMemo(() => {
    const bookingCountMap = new Map();

    bookings.forEach((booking) => {
      const tourId = booking.tour?._id || booking.tour;
      if (!tourId) return;
      bookingCountMap.set(tourId, (bookingCountMap.get(tourId) || 0) + 1);
    });

    const enrichedTours = tours.map((tour) => {
      const bookingCount = bookingCountMap.get(tour._id) || 0;
      const rating = Number(tour.averageRating || 0);
      const reviewCount = Number(tour.reviewCount || 0);
      const popularity = Math.min(100, bookingCount * 16 + (tour.isFeatured ? 12 : 0) + reviewCount * 3);
      const safety = Math.min(100, 58 + rating * 8 + (reviewCount > 0 ? 6 : 0));
      const recommendationScore = Math.round(popularity * 0.55 + safety * 0.45);
      return { ...tour, bookingCount, rating, reviewCount, popularity, safety, recommendationScore };
    });

    const recommended = [...enrichedTours]
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 4);

    const safePlaces = [...enrichedTours]
      .sort((a, b) => b.safety - a.safety)
      .slice(0, 4);

    const trending = [...enrichedTours]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 4);

    const hiddenGems = [...enrichedTours]
      .filter((tour) => tour.safety >= 70 && tour.bookingCount <= 1)
      .sort((a, b) => b.safety - a.safety)
      .slice(0, 3);

    return {
      recommended,
      safePlaces,
      trending,
      hiddenGems,
      summary: {
        favoritePlaces: trending.filter((tour) => tour.bookingCount > 0).length,
        safePlaces: safePlaces.filter((tour) => tour.safety >= 70).length,
        topRecommendations: recommended.length,
      },
    };
  }, [tours, bookings]);

  const serviceCards = [
    {
      image:
        "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200",
      title: "Scenic Destinations",
      text: "From valleys to mountains, discover memorable places for your next adventure.",
    },
    {
      image:
        "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1200",
      title: "Flexible Travel Packages",
      text: "Browse curated tours with details, pricing and actions designed for smooth booking.",
    },
    {
      image:
        "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1200",
      title: "Easy Booking Management",
      text: "Track your bookings, manage upcoming trips and organize your travel plans in one place.",
    },
  ];

  return (
    <div className="dashboard-page">
      <MainNavbar
        activeTab={activeTab}
        onSectionClick={scrollToSection}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={onLogout}
        onFavouritesClick={openCart}
        cartCount={cartItems.length}
      />

      <section id="home" className="new-hero">
        <div className="new-hero-container">
          <div className="new-hero-left">
            <p className="new-discount-text">Plan memorable journeys across Pakistan</p>

            <h1 className="new-hero-title">
              Discover Beautiful Places
              <br />
              For Your Next Adventure
            </h1>

            <p className="new-hero-desc">
              Browse curated destinations, explore package details, manage your
              bookings and save your favourite trips in one modern travel
              dashboard.
            </p>

            <div className="new-hero-buttons">
              <button
                className="new-find-btn"
                onClick={() => scrollToSection("packages")}
              >
                Explore Packages
              </button>

              <button
                className="new-secondary-btn"
                onClick={() => navigate("/my-bookings")}
              >
                View Bookings
              </button>
            </div>

            <div className="hero-mini-stats">
              <div className="hero-stat-card">
                <strong>{tours.length || 0}+</strong>
                <span>Packages</span>
              </div>
              <div className="hero-stat-card">
                <strong>{bookings.length || 0}</strong>
                <span>Bookings</span>
              </div>
              <div className="hero-stat-card">
                <strong>{cartItems.length || 0}</strong>
                <span>Saved Trips</span>
              </div>
            </div>
          </div>

          <div className="new-hero-right">
            <div className="hero-image-stack">
              <img
                src="https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1200"
                className="hero-img img1"
                alt="Mountain travel destination"
              />
              <img
                src="https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=1200"
                className="hero-img img2"
                alt="Lake and mountain destination"
              />
              <img
                src="https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1200"
                className="hero-img img3"
                alt="Travel landscape"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="who-section">
        <div className="who-container">
          <p className="who-tag">Why Choose Touringo</p>
          <h2 className="who-title">A Better Way To Plan Your Travel</h2>

          <div className="who-services-grid">
            {featureCards.map((item, index) => (
              <div className="who-card" key={index}>
                <div className="who-card-icon-wrap">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="dash-about-section">
        <div className="dash-container dash-about-grid">
          <div className="dash-about-left">
            <p className="dash-section-tag">Who We Are</p>

            <h2 className="dash-section-title dash-about-title">
              Travel Smarter With A
              <span className="dash-highlight"> Clean, Easy & Reliable </span>
              Experience
            </h2>

            <p className="dash-section-text">
              Touringo helps users discover destinations, explore packages,
              review trip details and manage travel bookings from one place.
            </p>

            <p className="dash-section-text">
              Our goal is to make travel planning more comfortable, visual and
              organized for every user.
            </p>

            <div className="dash-about-points">
              <div className="dash-about-point">✓ Explore destination packages</div>
              <div className="dash-about-point">✓ Save tours to cart instantly</div>
              <div className="dash-about-point">✓ Manage upcoming bookings easily</div>
            </div>
          </div>

          <div className="dash-about-right">
            <img
              src="https://images.pexels.com/photos/210243/pexels-photo-210243.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Beautiful travel landscape"
              className="dash-about-image"
            />
          </div>
        </div>
      </section>

      <section className="dash-services-section">
        <div className="dash-container">
          <p className="dash-section-tag center">Our Best Services</p>
          <h2 className="dash-section-title center">
            Discover Better Tours &amp; Travel Planning With
            <span className="dash-highlight"> Touringo</span>
          </h2>

          <div className="dash-cards-row">
            {serviceCards.map((item, index) => (
              <div
                key={index}
                className={`dash-service-card ${index === 1 ? "dash-service-card-main" : ""}`}
              >
                <img src={item.image} alt={item.title} className="dash-card-image" />
                <div className="dash-card-body">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="travel-insights-entry-section">
        <div className="dash-container">
          <div className="travel-insights-entry-card">
            <div className="travel-insights-entry-copy">
              <p className="dash-section-tag">Traveler Intelligence</p>
              <h2 className="dash-section-title travel-insights-title">
                Open Your <span className="dash-highlight">Insights Center</span>
              </h2>
              <p className="travel-insights-subtext">
                View personalized travel recommendations, safer destinations, popular packages and hidden gems on a dedicated insights page.
              </p>
            </div>

            <div className="travel-insights-entry-summary">
              <button className="travel-summary-card warm clickable" onClick={() => navigate("/travel-insights") }>
                <strong>{travelInsights.summary.favoritePlaces}</strong>
                <span>Favorite Places</span>
                <small>Open insight details</small>
              </button>
              <button className="travel-summary-card cool clickable" onClick={() => navigate("/travel-insights") }>
                <strong>{travelInsights.summary.safePlaces}</strong>
                <span>Safe Places</span>
                <small>See trusted destinations</small>
              </button>
              <button className="travel-summary-card blend clickable" onClick={() => navigate("/travel-insights") }>
                <strong>{travelInsights.summary.topRecommendations}</strong>
                <span>Top Picks</span>
                <small>View smart matches</small>
              </button>
            </div>

            <div className="travel-insights-entry-actions">
              <button className="new-find-btn" onClick={() => navigate("/travel-insights")}>View Full Insights</button>
              <button className="new-secondary-btn" onClick={() => navigate("/packages")}>Browse Packages</button>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="user-packages-section">
        <div className="dash-container">
          <p className="dash-section-tag center">Travel Packages</p>
          <h2 className="dash-section-title center">
            Explore Our Latest <span className="dash-highlight">Tours</span>
          </h2>

          <p className="dash-section-subtext center-text">
            Browse destination cards, compare options and move forward with the
            trip that matches your plan.
          </p>

          {message && <p style={{ textAlign: "center", color: "red" }}>{message}</p>}
          {loadingTours && <p style={{ textAlign: "center" }}>Loading tours...</p>}

          {!loadingTours && (
            <>
              <div className="packages-toolbar">
                <div>
                  <h3 className="packages-toolbar-title">Recommended trips for you</h3>
                  <p className="packages-toolbar-text">
                    Browse a few highlighted packages, or open the full packages page to see everything.
                  </p>
                </div>

                <div className="packages-toolbar-actions">
                  <button
                    type="button"
                    className="view-all-packages-btn"
                    onClick={goToAllPackages}
                  >
                    View All Packages
                  </button>
                </div>
              </div>

              {filteredTours && filteredTours.length > 0 ? (
                <div className="user-packages-carousel-shell">
                  <button
                    type="button"
                    className="packages-arrow-btn packages-arrow-side packages-arrow-left"
                    onClick={() => scrollPackagesCarousel("prev")}
                    aria-label="Show previous packages"
                  >
                    ‹
                  </button>

                  <div className="user-packages-carousel-wrap">
                    <div className="user-packages-carousel" ref={packagesCarouselRef}>
                    {filteredTours.map((t) => (
                      <div key={t._id} className="user-package-card">
                        <div className="package-card-image">
                          <img
                            src={
                              t.imageUrl ||
                              "https://via.placeholder.com/400x250?text=Tour+Image"
                            }
                            alt={t.title}
                          />
                        </div>

                        <div className="user-package-card-content">
                          <div className="user-package-header">
                            <h3>{t.title}</h3>
                            <div className="pkg-header-badges">
                              <span className={`pkg-rating-badge ${Number(t.reviewCount || 0) > 0 ? "" : "is-empty"}`.trim()}>
                                {Number(t.reviewCount || 0) > 0
                                  ? `★ ${Number(t.averageRating || 0).toFixed(1)}`
                                  : "New"}
                              </span>
                              <span
                                className={`pkg-status ${t.isFeatured ? "active" : "inactive"}`}
                              >
                                {t.isFeatured ? "Featured" : "Available"}
                              </span>
                            </div>
                          </div>

                          <p className="pkg-location">{t.location}</p>

                          <div className="pkg-price-row">
                            <p className="pkg-price-label">Starting From</p>
                            <p className="pkg-price">
                              PKR {Number(t.price).toLocaleString()}
                            </p>
                          </div>

                          <div className="pkg-card-footer">
                            <button
                              className="pkg-book-btn"
                              onClick={() => handleBookNow(t)}
                            >
                              Book Now
                            </button>

                            <button
                              className="pkg-details-btn"
                              onClick={() => handleViewDetails(t)}
                            >
                              View Details
                            </button>

                            <button
                              className="pkg-cart-btn"
                              onClick={() => handleAddToCart(t)}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="packages-arrow-btn packages-arrow-side packages-arrow-right"
                    onClick={() => scrollPackagesCarousel("next")}
                    aria-label="Show next packages"
                  >
                    ›
                  </button>
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "#6b7280" }}>
                  No tours match your search.
                </p>
              )}
            </>
          )}
        </div>
      </section>


      <section id="blogs" className="travel-blogs-section">
        <div className="dash-container">
          <div className="travel-blogs-head">
            <div>
              <p className="dash-section-tag">Recent Updates</p>
              <h2 className="travel-blogs-title">Travel Related Blogs</h2>
              <p className="travel-blogs-subtext">
                Explore helpful travel reads, destination ideas and planning tips without leaving your dashboard.
              </p>
            </div>

            <button
              type="button"
              className="view-all-packages-btn"
              onClick={() => navigate('/blogs')}
            >
              View All Blogs
            </button>
          </div>

          {loadingBlogs ? (
            <p style={{ textAlign: 'center' }}>Loading blogs...</p>
          ) : (
            <div className="travel-blogs-grid">
              {blogs.slice(0, 4).map((blog) => (
                <article
                  key={blog._id}
                  className="travel-blog-feature-card"
                  onClick={() => navigate(`/blogs/${blog.slug || blog._id}`)}
                >
                  <img src={blog.imageUrl} alt={blog.title} className="travel-blog-feature-image" />
                  <div className="travel-blog-feature-overlay" />
                  <div className="travel-blog-feature-content">
                    <span className="travel-blog-category">{blog.category}</span>
                    <h3>{blog.title}</h3>
                    <button type="button" className="travel-blog-read-btn">Read More</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="favourites" className="favourites-section">
        <div className="dash-container">
          <p className="dash-section-tag center">Saved Trips</p>
          <h2 className="dash-section-title center">
            Your <span className="dash-highlight">Favourite</span> Tours
          </h2>

          <p className="dash-section-subtext center-text">
            Trips added to cart are shown here as your quick shortlist.
          </p>

          {cartItems.length === 0 ? (
            <div className="empty-state-card compact-empty">
              <div className="empty-state-icon">❤</div>
              <h3>No saved trips yet</h3>
              <p>Add destinations to your cart and they will appear here.</p>
              <button
                className="btn-primary"
                onClick={() => scrollToSection("packages")}
              >
                Explore Trips
              </button>
            </div>
          ) : (
            <>
              <div className="saved-trips-grid">
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item._id} className="saved-trip-card">
                    <img
                      src={
                        item.imageUrl ||
                        "https://via.placeholder.com/400x250?text=Tour+Image"
                      }
                      alt={item.title}
                    />
                    <div className="saved-trip-body">
                      <h3>{item.title}</h3>
                      <p>{item.location}</p>
                      <strong>PKR {Number(item.price).toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="saved-trip-actions">
                <button className="btn-primary" onClick={openCart}>
                  Open Cart Panel
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="dash-container contact-grid">
          <div className="contact-left-card">
            <p className="dash-section-tag">Contact Us</p>
            <h2 className="dash-section-title">
              Get In <span className="dash-highlight">Touch</span>
            </h2>
            <p className="dash-section-text">
              Have questions about a package, booking or custom tour? Reach out
              to us any time.
            </p>

            <ul className="contact-list">
              <li>📧 support@touringo.com</li>
              <li>📞 +92-300-1234567</li>
              <li>📍 Abbottabad, Pakistan</li>
            </ul>
          </div>

          <form className="contact-form">
            <input type="text" placeholder="Your Name" />
            <input type="email" placeholder="Your Email" />
            <textarea rows="4" placeholder="Your Message" />
            <button type="button" className="btn-primary contact-submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {isCartOpen && (
        <div className="cart-overlay" onClick={closeCart}>
          <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <div className="cart-title">Your Cart ({cartItems.length})</div>
              <button className="cart-close-btn" onClick={closeCart}>
                ×
              </button>
            </div>

            <div className="cart-body">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  Your cart is empty. Add some tours!
                </div>
              ) : (
                <div className="cart-list">
                  {cartItems.map((item) => (
                    <div key={item._id} className="cart-item">
                      <div className="cart-item-main">
                        <div className="cart-item-title">{item.title}</div>
                        <div className="cart-item-location">{item.location}</div>
                        <div className="cart-item-price">
                          PKR {Number(item.price).toLocaleString()}
                        </div>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => handleRemoveFromCart(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span>Total</span>
                <span>PKR {cartTotal.toLocaleString()}</span>
              </div>

              <div className="cart-actions">
                <button
                  className="cart-checkout-btn"
                  onClick={() => {
                    if (cartItems.length > 0) {
                      handleBookNow(cartItems[0]);
                      closeCart();
                    }
                  }}
                >
                  Proceed to Booking
                </button>

                <button className="cart-continue-btn" onClick={closeCart}>
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast.show && <div className="custom-toast">{toast.message}</div>}
    </div>
  );
}

export default DashboardPage;