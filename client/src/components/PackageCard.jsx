import React from "react";
import { useNavigate } from "react-router-dom";

function PackageCard({ pkg }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/packages/${pkg._id}`, { state: { tour: pkg } });
  };

  const handleBookNow = () => {
    navigate(`/book/${pkg._id}`, { state: { tour: pkg } });
  };

  return (
    <div className="package-card">
      <div className="package-card-image">
        <img
          src={pkg.imageUrl || "https://via.placeholder.com/400x250?text=Tour+Image"}
          alt={pkg.title}
        />
      </div>

      <div className="package-card-header">
        <div>
          <h3 className="package-card-title">{pkg.title}</h3>
          <p className="package-card-location">{pkg.location}</p>
        </div>

        <div className="pkg-header-badges">
          <span className={`pkg-rating-badge ${Number(pkg.reviewCount || 0) > 0 ? "" : "is-empty"}`.trim()}>
            {Number(pkg.reviewCount || 0) > 0
              ? `★ ${Number(pkg.averageRating || 0).toFixed(1)}`
              : "New"}
          </span>
          <span className={`pkg-status ${pkg.isFeatured ? "active" : "inactive"}`}>
            {pkg.isFeatured ? "Featured" : "Available"}
          </span>
        </div>
      </div>

      <div className="package-card-body">
        <p className="package-card-price">PKR {Number(pkg.price).toLocaleString()}</p>
        <p className="package-card-short">{pkg.description?.slice(0, 80)}...</p>
      </div>

      <div className="package-card-footer">
        <button className="btn-primary" onClick={handleBookNow}>Book Now</button>
        <button className="btn-outline" onClick={handleViewDetails}>View Details</button>
      </div>
    </div>
  );
}

export default PackageCard;
