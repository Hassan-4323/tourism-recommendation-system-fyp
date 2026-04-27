// routes/tourRoutes.js
const express = require("express");
const Tour = require("../models/Tour");
const Review = require("../models/Review");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/tours
// @desc    Get all tours (public)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const tours = await Tour.find({
      $or: [
        { status: "active" },
        { status: { $exists: false } },
        { status: null },
        { status: "" },
      ],
    }).sort({ isFeatured: -1, createdAt: -1 });

    const reviews = await Review.find({
      isApproved: true,
      tour: { $in: tours.map((tour) => tour._id) },
    }).select("tour rating sentimentLabel");

    const reviewMap = reviews.reduce((acc, review) => {
      const key = String(review.tour);
      if (!acc[key]) {
        acc[key] = {
          reviewCount: 0,
          ratingTotal: 0,
          sentimentCounts: { Positive: 0, Neutral: 0, Negative: 0 },
        };
      }
      acc[key].reviewCount += 1;
      acc[key].ratingTotal += Number(review.rating || 0);
      const label = review.sentimentLabel || "Neutral";
      acc[key].sentimentCounts[label] = (acc[key].sentimentCounts[label] || 0) + 1;
      return acc;
    }, {});

    const enrichedTours = tours.map((tour) => {
      const stats = reviewMap[String(tour._id)] || {
        reviewCount: 0,
        ratingTotal: 0,
        sentimentCounts: { Positive: 0, Neutral: 0, Negative: 0 },
      };
      const averageRating = stats.reviewCount
        ? Number((stats.ratingTotal / stats.reviewCount).toFixed(1))
        : 0;
      const dominantSentiment = Object.entries(stats.sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Neutral";

      return {
        ...tour.toObject(),
        reviewCount: stats.reviewCount,
        averageRating,
        dominantSentiment,
      };
    });

    return res.json(enrichedTours);
  } catch (error) {
    console.error("Get tours error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/tours/:id
// @desc    Get single tour
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    const reviews = await Review.find({ tour: tour._id, isApproved: true }).select("rating sentimentLabel");
    const reviewCount = reviews.length;
    const averageRating = reviewCount
      ? Number((reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviewCount).toFixed(1))
      : 0;
    const sentimentCounts = reviews.reduce(
      (acc, item) => {
        const label = item.sentimentLabel || "Neutral";
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      },
      { Positive: 0, Neutral: 0, Negative: 0 }
    );
    const dominantSentiment = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Neutral";

    return res.json({
      ...tour.toObject(),
      reviewCount,
      averageRating,
      dominantSentiment,
    });
  } catch (error) {
    console.error("Get tour error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/tours
// @desc    Create tour (admin only)
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const { title, description, location, price, durationDays, imageUrl, isFeatured, status } = req.body;

    if (!title || !description || !location || !price || !durationDays) {
      return res.status(400).json({ message: "Please fill required fields" });
    }

    const tour = await Tour.create({
      title,
      description,
      location,
      price,
      durationDays,
      imageUrl,
      isFeatured: !!isFeatured,
      status: status === "inactive" ? "inactive" : "active",
      createdBy: req.user._id,
    });

    return res.status(201).json(tour);
  } catch (error) {
    console.error("Create tour error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/tours/:id
// @desc    Update tour (admin only)
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    return res.json(tour);
  } catch (error) {
    console.error("Update tour error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/tours/:id
// @desc    Delete tour (admin only)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    return res.json({ message: "Tour deleted" });
  } catch (error) {
    console.error("Delete tour error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
