import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "./MainNavbar";
import { getMyBookings, getTours } from "./api";
import "./App.css";

function TravelInsightsPage({ onLogout }) {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [toursData, bookingsData] = await Promise.all([getTours(), getMyBookings()]);
        setTours(Array.isArray(toursData) ? toursData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (error) {
        console.error("Error loading travel insights:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

    const recommended = [...enrichedTours].sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 6);
    const safePlaces = [...enrichedTours].sort((a, b) => b.safety - a.safety).slice(0, 5);
    const trending = [...enrichedTours].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
    const hiddenGems = [...enrichedTours]
      .filter((tour) => tour.safety >= 70 && tour.bookingCount <= 1)
      .sort((a, b) => b.safety - a.safety)
      .slice(0, 4);

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

  const goToPackage = (tour) => {
    navigate(`/packages/${tour._id}`, { state: { tour } });
  };

  return (
    <div className="dashboard-page">
      <MainNavbar
        activeTab="insights"
        onSectionClick={() => navigate("/dashboard")}
        searchTerm=""
        onSearchChange={() => {}}
        onLogout={onLogout}
        cartCount={0}
      />

      <section className="insights-page-hero">
        <div className="dash-container">
          <div className="insights-page-hero-card">
            <div>
              <p className="dash-section-tag">Traveler Intelligence</p>
              <h1 className="dash-section-title insights-page-title">
                Explore <span className="dash-highlight">Travel Insights</span>
              </h1>
              <p className="insights-page-subtext">
                Open smart recommendations, trusted destinations and trending packages based on your current project data.
              </p>
            </div>
            <div className="insights-hero-actions">
              <button className="new-find-btn" onClick={() => navigate("/packages")}>Browse Packages</button>
              <button className="new-secondary-btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
            </div>
          </div>

          <div className="travel-insights-summary-row separate-page">
            <div className="travel-summary-card warm">
              <strong>{travelInsights.summary.favoritePlaces}</strong>
              <span>Favorite Places</span>
              <small>Driven by booking demand</small>
            </div>
            <div className="travel-summary-card cool">
              <strong>{travelInsights.summary.safePlaces}</strong>
              <span>Safe Places</span>
              <small>Backed by traveler confidence</small>
            </div>
            <div className="travel-summary-card blend">
              <strong>{travelInsights.summary.topRecommendations}</strong>
              <span>Top Picks</span>
              <small>Balanced by popularity and trust</small>
            </div>
          </div>
        </div>
      </section>

      <section className="travel-insights-section standalone">
        <div className="dash-container">
          {loading ? (
            <p className="insights-loading-text">Loading insights...</p>
          ) : (
            <div className="travel-insights-grid">
              <div className="travel-insight-panel featured">
                <div className="travel-panel-head">
                  <div>
                    <h3>Best recommended destinations</h3>
                    <p>Click any card to open the destination package details.</p>
                  </div>
                  <span className="travel-panel-chip">Smart Match</span>
                </div>

                <div className="travel-insight-list">
                  {travelInsights.recommended.map((tour, index) => (
                    <button key={tour._id} className="travel-insight-item rich clickable" onClick={() => goToPackage(tour)}>
                      <div className="travel-insight-rank">0{index + 1}</div>
                      <div className="travel-insight-main">
                        <strong>{tour.title}</strong>
                        <span>{tour.location}</span>
                      </div>
                      <div className="travel-insight-metrics">
                        <div><label>Score</label><strong>{tour.recommendationScore}</strong></div>
                        <div><label>Safety</label><strong>{Math.round(tour.safety)}</strong></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="travel-insight-panel">
                <div className="travel-panel-head">
                  <div>
                    <h3>Safe destinations</h3>
                    <p>Highly rated destinations with stronger confidence.</p>
                  </div>
                </div>
                <div className="travel-insight-list compact">
                  {travelInsights.safePlaces.map((tour) => (
                    <button key={tour._id} className="travel-insight-item clickable" onClick={() => goToPackage(tour)}>
                      <div className="travel-insight-main">
                        <strong>{tour.title}</strong>
                        <span>{tour.location}</span>
                      </div>
                      <div className="travel-score-pill safe">Safety {Math.round(tour.safety)}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="travel-insight-panel">
                <div className="travel-panel-head">
                  <div>
                    <h3>Popular right now</h3>
                    <p>Most in-demand packages from bookings and activity.</p>
                  </div>
                </div>
                <div className="travel-insight-list compact">
                  {travelInsights.trending.map((tour) => (
                    <button key={tour._id} className="travel-insight-item clickable" onClick={() => goToPackage(tour)}>
                      <div className="travel-insight-main">
                        <strong>{tour.title}</strong>
                        <span>{tour.location}</span>
                      </div>
                      <div className="travel-score-pill">Popularity {Math.round(tour.popularity)}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="travel-insight-panel">
                <div className="travel-panel-head">
                  <div>
                    <h3>Hidden gems</h3>
                    <p>Promising destinations with lower demand but good trust.</p>
                  </div>
                </div>
                <div className="travel-insight-list compact">
                  {travelInsights.hiddenGems.length ? (
                    travelInsights.hiddenGems.map((tour) => (
                      <button key={tour._id} className="travel-insight-item clickable" onClick={() => goToPackage(tour)}>
                        <div className="travel-insight-main">
                          <strong>{tour.title}</strong>
                          <span>{tour.location}</span>
                        </div>
                        <div className="travel-score-pill gem">Gem Pick</div>
                      </button>
                    ))
                  ) : (
                    <div className="travel-insight-empty">Hidden gems will appear once more trusted destinations have lower demand.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default TravelInsightsPage;
