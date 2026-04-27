import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createReview,
  getMyBookings,
  getTourById,
  getTourReviews,
} from "../api";
import MainNavbar from "../MainNavbar";
import "../App.css";

function PackageDetail() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(state?.tour || null);
  const [loading, setLoading] = useState(!state?.tour);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    totalReviews: 0,
    averageRating: 0,
    dominantSentiment: "Neutral",
    sentimentCounts: { Positive: 0, Neutral: 0, Negative: 0 },
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");

  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [activeAccordion, setActiveAccordion] = useState("overview");
  const [activeImage, setActiveImage] = useState(0);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const token = localStorage.getItem("token");

  const loadTour = useCallback(async () => {
    if (!id) return null;

    try {
      setLoading(true);
      const data = await getTourById(id);
      setPkg(data);
      setError("");
      return data;
    } catch (err) {
      setError(err.message || "Package not found.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async () => {
    if (!id) return null;

    try {
      setReviewsLoading(true);
      setReviewError("");
      const data = await getTourReviews(id);
      setReviews(data.reviews || []);
      setReviewSummary(
        data.summary || {
          totalReviews: (data.reviews || []).length,
          averageRating: 0,
          dominantSentiment: "Neutral",
          sentimentCounts: { Positive: 0, Neutral: 0, Negative: 0 },
        }
      );
      return data;
    } catch (err) {
      setReviewError(err.message || "Unable to load reviews right now.");
      return null;
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;

    if (state?.tour?._id === id) {
      setPkg(state.tour);
      setLoading(false);
      return undefined;
    }

    const syncTour = async () => {
      const data = await loadTour();
      if (!active || !data) return;
    };

    syncTour();

    return () => {
      active = false;
    };
  }, [id, loadTour, state?.tour]);

  useEffect(() => {
    let mounted = true;

    const syncReviews = async () => {
      const data = await loadReviews();
      if (!mounted || !data) return;
    };

    syncReviews();

    return () => {
      mounted = false;
    };
  }, [loadReviews]);

  useEffect(() => {
    let mounted = true;

    const loadMyBookings = async () => {
      if (!token) {
        setBookingsLoaded(true);
        return;
      }

      try {
        const data = await getMyBookings();
        if (!mounted) return;
        setMyBookings(Array.isArray(data) ? data : []);
      } catch {
        if (!mounted) return;
        setMyBookings([]);
      } finally {
        if (mounted) setBookingsLoaded(true);
      }
    };

    loadMyBookings();

    return () => {
      mounted = false;
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleReviewFieldChange = (field, value) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    if (!token) {
      navigate("/login", {
        state: { redirectTo: `/packages/${id}` },
      });
      return;
    }

    try {
      setSubmittingReview(true);
      setSubmitError("");
      setSubmitMessage("");

      await createReview(id, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      await Promise.all([loadReviews(), loadTour()]);
      setReviewForm({ rating: 5, comment: "" });
      setSubmitMessage("Your review was added successfully and is now visible on this package.");
      setActiveAccordion("reviews");
    } catch (err) {
      setSubmitError(err.message || "Unable to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="package-detail-notfound"><p>Loading package...</p></div>;
  }

  if (!pkg) {
    return (
      <div className="package-detail-notfound">
        <p>{error || "Package not found."}</p>
        <button className="btn-outline" onClick={() => navigate("/dashboard#packages")}>Back to Dashboard</button>
      </div>
    );
  }

  const name = pkg.title || "Tour Package";
  const location = pkg.location || "Pakistan";
  const price = Number(pkg.price || 0);
  const shortDescription =
    pkg.description || "Enjoy a carefully planned destination experience with smooth travel support.";
  const durationDays = Number(pkg.durationDays || 3);
  const averageRating = Number(reviewSummary.averageRating || 0);
  const totalReviews = Number(reviewSummary.totalReviews || 0);
  const dominantSentiment = reviewSummary.dominantSentiment || "Neutral";

  const matchingBookings = myBookings.filter(
    (booking) => booking?.tour?._id === pkg._id && booking?.status !== "cancelled"
  );
  const canReview = matchingBookings.length > 0;
  const hasReviewed = reviews.some(
    (review) => review?.user?._id === storedUser?._id || review?.user?.name === storedUser?.name
  );

  const galleryImages = [
    pkg.imageUrl || "https://via.placeholder.com/1200x720?text=Tour+Image",
    pkg.imageUrl || "https://via.placeholder.com/1200x720?text=Tour+Image",
    pkg.imageUrl || "https://via.placeholder.com/1200x720?text=Tour+Image",
  ];

  const highlights = pkg.features?.length
    ? pkg.features
    : [
        `${durationDays} day guided trip experience`,
        "Comfortable stay and local transport support",
        "Popular sightseeing points and photo stops",
        "Family, couple, and group friendly package",
      ];

  const inclusions = pkg.additionalDetails?.length
    ? pkg.additionalDetails
    : [
        "Trip planning assistance before departure",
        "Local guidance during the selected package duration",
        "Clear pricing with no hidden platform charges",
        "Booking support and trip coordination",
      ];

  const statCards = [
    { icon: "⏱", label: "Duration", value: `${durationDays} Days` },
    { icon: "📍", label: "Destination", value: location },
    { icon: "⭐", label: "Guest Rating", value: totalReviews ? `${averageRating}/5` : "New Tour" },
    { icon: "🧾", label: "Booking Type", value: "Instant enquiry & booking" },
  ];

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => Number(review.rating) === star).length;
    const percentage = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  return (
    <div className="package-detail-page package-detail-page-pro">
      <MainNavbar
        activeTab="packages"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={handleLogout}
      />

      <section className="pd-hero-shell">
        <div className="pd-hero-card">
          <div className="pd-hero-copy">
            <span className="pd-hero-badge">Package Details</span>
            <p className="pd-breadcrumb pd-breadcrumb-pro">
              <span className="pd-breadcrumb-link" onClick={() => navigate("/dashboard#home")}>Home</span>
              <span>/</span>
              <span className="pd-breadcrumb-link" onClick={() => navigate("/dashboard#packages")}>Packages</span>
              <span>/</span>
              <span>{name}</span>
            </p>
            <h1 className="pd-hero-title pd-hero-title-pro">{name}</h1>
            <p className="pd-hero-description">{shortDescription}</p>

            <div className="pd-hero-meta-row">
              <div className="pd-hero-meta-pill">📍 {location}</div>
              <div className="pd-hero-meta-pill">⏱ {durationDays} Days</div>
              <div className="pd-hero-meta-pill">💳 From PKR {price.toLocaleString()}</div>
            </div>

            <div className="pd-hero-cta-row">
              <button className="btn-outline" onClick={() => navigate("/dashboard#packages")}>
                ← Back to all packages
              </button>
              <button
                className="btn-primary"
                onClick={() => navigate(`/book/${pkg._id}`, { state: { tour: pkg } })}
              >
                Book Package
              </button>
            </div>
          </div>

          <div className="pd-hero-sidecard">
            <div className="pd-sidecard-top">
              <span className="pd-sidecard-tag">{pkg.isFeatured ? "Featured" : "Popular choice"}</span>
              <div className="pd-sidecard-rating">
                <strong>{totalReviews ? averageRating.toFixed(1) : "New"}</strong>
                <span>{totalReviews ? `${totalReviews} reviews` : "No reviews yet"}</span>
              </div>
            </div>
            <div className="pd-sidecard-price">PKR {price.toLocaleString()}</div>
            <p className="pd-sidecard-note">Best for users who want a clean package overview, verified traveler reviews, and fast booking access.</p>
          </div>
        </div>
      </section>

      <main className="package-detail-main package-detail-main-pro">
        <section className="pd-gallery pd-gallery-pro">
          <div className="pd-main-image pd-main-image-pro">
            <img src={galleryImages[activeImage]} alt={name} />
            <div className="pd-image-badge">Top destination pick</div>
          </div>

          <div className="pd-thumb-row pd-thumb-row-pro">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`pd-thumb pd-thumb-pro ${activeImage === index ? "active" : ""}`}
                onClick={() => setActiveImage(index)}
              >
                <img src={image} alt={`${name} view ${index + 1}`} />
              </button>
            ))}
          </div>

          <div className="pd-stats-grid">
            {statCards.map((card) => (
              <div className="pd-stat-card" key={card.label}>
                <span className="pd-stat-icon">{card.icon}</span>
                <span className="pd-stat-label">{card.label}</span>
                <strong className="pd-stat-value">{card.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <aside className="pd-info pd-info-pro">
          <div className="pd-summary-card">
            <div className="pd-summary-head">
              <span className="pd-new-label">Tour Overview</span>
              <span className="pd-rating-chip">
                {totalReviews ? `${averageRating.toFixed(1)} ★` : "New Listing"}
              </span>
            </div>
            <h2 className="pd-title">Why travelers choose this package</h2>
            <p className="pd-short">{shortDescription}</p>

            <div className="pd-feature-list-pro">
              {highlights.map((item, index) => (
                <div className="pd-feature-row" key={`${item}-${index}`}>
                  <span className="pd-feature-check">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pd-booking-card-pro">
            <h3>Quick booking summary</h3>
            <div className="pd-booking-summary-row">
              <span>Base package price</span>
              <strong>PKR {price.toLocaleString()}</strong>
            </div>
            <div className="pd-booking-summary-row">
              <span>Duration</span>
              <strong>{durationDays} Days</strong>
            </div>
            <div className="pd-booking-summary-row">
              <span>Review score</span>
              <strong>{totalReviews ? `${averageRating.toFixed(1)}/5` : "Not rated yet"}</strong>
            </div>
            <div className="pd-booking-summary-row">
              <span>Traveler reviews</span>
              <strong>{totalReviews}</strong>
            </div>
            <button
              className="btn-primary pd-booking-full-btn"
              onClick={() => navigate(`/book/${pkg._id}`, { state: { tour: pkg } })}
            >
              Continue to Booking
            </button>
          </div>
        </aside>
      </main>

      <section className="pd-content-shell">
        <div className="pd-content-grid">
          <section className="pd-content-main">
            <div className="pd-tabs-row">
              {[
                ["overview", "Overview"],
                ["included", "Included"],
                ["reviews", "Reviews"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`pd-tab-btn ${activeAccordion === key ? "active" : ""}`}
                  onClick={() => setActiveAccordion(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="pd-tab-panel">
              {activeAccordion === "overview" && (
                <div className="pd-section-card">
                  <h3>About this package</h3>
                  <p>{shortDescription}</p>
                  <div className="pd-two-col-list">
                    {highlights.map((item, index) => (
                      <div className="pd-detail-bullet" key={`${item}-${index}`}>
                        <span>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAccordion === "included" && (
                <div className="pd-section-card">
                  <h3>What is included</h3>
                  <div className="pd-two-col-list">
                    {inclusions.map((item, index) => (
                      <div className="pd-detail-bullet" key={`${item}-${index}`}>
                        <span>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAccordion === "reviews" && (
                <div className="pd-section-card">
                  <div className="pd-reviews-headline">
                    <div>
                      <h3>Traveler reviews</h3>
                      <p>Reviews are shown directly with this package so users can trust what they book.</p>
                    </div>
                  </div>

                  <div className="pd-reviews-layout">
                    <div className="pd-reviews-summary-box">
                      <div className="pd-score-number">{totalReviews ? averageRating.toFixed(1) : "0.0"}</div>
                      <div className="pd-score-stars">
                        {totalReviews ? "★★★★★".slice(0, Math.round(averageRating)).padEnd(5, "☆") : "☆☆☆☆☆"}
                      </div>
                      <p>{totalReviews ? `Based on ${totalReviews} traveler reviews.` : "No reviews yet for this package."}</p>
                      <div className={`pd-sentiment-pill ${dominantSentiment.toLowerCase()}`}>
                        Overall sentiment: {dominantSentiment}
                      </div>

                      <div className="pd-rating-bars">
                        {ratingBreakdown.map((item) => (
                          <div className="pd-rating-bar-row" key={item.star}>
                            <span>{item.star}★</span>
                            <div className="pd-rating-bar-track">
                              <div className="pd-rating-bar-fill" style={{ width: `${item.percentage}%` }} />
                            </div>
                            <strong>{item.count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pd-review-form-box">
                      <h4>Write a review</h4>
                      {!token && (
                        <p className="pd-inline-note">Please log in first to write a review for this package.</p>
                      )}
                      {token && bookingsLoaded && !canReview && !hasReviewed && (
                        <p className="pd-inline-note">
                          You can review this package after booking it at least once.
                        </p>
                      )}
                      {hasReviewed && (
                        <p className="pd-inline-note success">You have already reviewed this package.</p>
                      )}
                      {submitMessage && <p className="pd-inline-note success">{submitMessage}</p>}
                      {submitError && <p className="pd-inline-note error">{submitError}</p>}

                      <form onSubmit={handleReviewSubmit} className="pd-review-form">
                        <label>
                          Rating
                          <select
                            value={reviewForm.rating}
                            onChange={(e) => handleReviewFieldChange("rating", Number(e.target.value))}
                            disabled={!token || !canReview || hasReviewed || submittingReview}
                          >
                            <option value={5}>5 - Excellent</option>
                            <option value={4}>4 - Very Good</option>
                            <option value={3}>3 - Good</option>
                            <option value={2}>2 - Fair</option>
                            <option value={1}>1 - Poor</option>
                          </select>
                        </label>

                        <label>
                          Your review
                          <textarea
                            rows="5"
                            placeholder="Share your travel experience, service quality, and what you liked most."
                            value={reviewForm.comment}
                            onChange={(e) => handleReviewFieldChange("comment", e.target.value)}
                            disabled={!token || !canReview || hasReviewed || submittingReview}
                          />
                        </label>

                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={!token || !canReview || hasReviewed || submittingReview}
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="pd-reviews-list">
                    {reviewsLoading && <p className="pd-empty-review-state">Loading reviews...</p>}
                    {!reviewsLoading && reviewError && <p className="pd-empty-review-state">{reviewError}</p>}
                    {!reviewsLoading && !reviewError && reviews.length === 0 && (
                      <p className="pd-empty-review-state">No traveler reviews yet. Be the first to share one after booking.</p>
                    )}
                    {!reviewsLoading && reviews.map((review) => (
                      <article className="pd-review-card pd-review-card-pro" key={review._id}>
                        <div className="pd-review-avatar">
                          {(review.user?.name || "U").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="pd-review-content">
                          <div className="pd-review-header">
                            <div>
                              <strong>{review.user?.name || "Traveler"}</strong>
                              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="pd-review-stars">{"★".repeat(Number(review.rating))}{"☆".repeat(5 - Number(review.rating))}</div>
                          </div>
                          <div className={`pd-review-sentiment ${String(review.sentimentLabel || 'Neutral').toLowerCase()}`}>
                            {review.sentimentLabel || "Neutral"}
                          </div>
                          <p className="pd-review-text">{review.comment}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="pd-content-side">
            <div className="pd-sticky-panel">
              <h3>Package fit</h3>
              <div className="pd-side-point">
                <span>👨‍👩‍👧</span>
                <div>
                  <strong>Family friendly</strong>
                  <p>Useful for family, group, and couple travel planning.</p>
                </div>
              </div>
              <div className="pd-side-point">
                <span>🧭</span>
                <div>
                  <strong>Easy trip planning</strong>
                  <p>Clear package details, booking flow, and real reviews in one place.</p>
                </div>
              </div>
              <div className="pd-side-point">
                <span>💬</span>
                <div>
                  <strong>Verified feedback</strong>
                  <p>Only users with bookings can submit package reviews.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default PackageDetail;
