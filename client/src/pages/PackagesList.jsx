import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PackageCard from "../components/PackageCard";
import MainNavbar from "../MainNavbar";
import { getTours } from "../api";
import "../App.css";

function PackagesList() {
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadTours = async () => {
      try {
        const data = await getTours();
        setPackages(data.tours || data);
      } catch (err) {
        console.error("Error loading tours:", err);
      }
    };

    loadTours();
  }, []);

  const filteredPackages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return packages;

    return packages.filter((pkg) =>
      pkg.title?.toLowerCase().includes(query) ||
      pkg.location?.toLowerCase().includes(query)
    );
  }, [packages, searchTerm]);

  const recommendedPackages = useMemo(() => {
    const featured = packages.filter((pkg) => pkg.isFeatured);
    const base = featured.length > 0 ? featured : packages;
    return base.slice(0, 3);
  }, [packages]);

  return (
    <div className="packages-listing-page">
      <MainNavbar
        activeTab="packages"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="packages-page packages-page-compact">
        <section className="packages-hero-banner packages-hero-compact">
          <div>
            <p className="dash-section-tag">All Packages</p>
            <h1 className="packages-page-title">Explore every available trip in one place</h1>
            <p className="packages-page-text">
              Start with recommended destinations, then browse the full packages collection below.
            </p>
          </div>

          <button
            type="button"
            className="packages-back-dashboard-btn"
            onClick={() => navigate("/dashboard#packages")}
          >
            Back to Dashboard
          </button>
        </section>

        <section className="recommended-packages-panel">
          <div className="recommended-panel-head">
            <div>
              <h2>Recommended Trips</h2>
              <p>Featured destinations selected to appear first for faster browsing.</p>
            </div>
          </div>

          <div className="recommended-packages-grid recommended-packages-grid-compact">
            {recommendedPackages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        </section>

        <section className="all-packages-panel">
          <div className="recommended-panel-head">
            <div>
              <h2>View All Packages</h2>
              <p>{filteredPackages.length} trips available for browsing.</p>
            </div>
          </div>

          <section className="packages-grid packages-grid-compact">
            {filteredPackages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </section>
        </section>
      </main>
    </div>
  );
}

export default PackagesList;
