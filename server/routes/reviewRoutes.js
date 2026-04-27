// server/routes/reviewRoutes.js
const express = require("express");
const Review = require("../models/Review");
const Tour = require("../models/Tour");
const Booking = require("../models/Booking");
const { protect, admin } = require("../middleware/authMiddleware");
const { analyzeSentiment } = require("../utils/sentiment");

const router = express.Router();

/*
  GET /api/reviews/tour/:tourId
  Public
  Get approved reviews of a tour + summary
*/
router.get("/tour/:tourId", async (req, res) => {
  try {
    const { tourId } = req.params;

    const reviews = await Review.find({
      tour: tourId,
      isApproved: true,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews
        : 0;

    const sentimentCounts = reviews.reduce(
      (acc, item) => {
        const key = item.sentimentLabel || "Neutral";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { Positive: 0, Neutral: 0, Negative: 0 }
    );

    const dominantSentiment = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Neutral";

    return res.json({
      reviews,
      summary: {
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
        dominantSentiment,
        sentimentCounts,
      },
    });
  } catch (error) {
    console.error("Get tour reviews error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/*
  POST /api/reviews/:tourId
  Private
  Create review for a tour
*/
router.post("/:tourId", protect, async (req, res) => {
  try {
    const { tourId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment?.trim()) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    // optional rule: only users who booked this tour can review it
    const hasBooking = await Booking.findOne({
      user: req.user._id,
      tour: tourId,
      status: { $ne: "cancelled" },
    });

    if (!hasBooking) {
      return res.status(403).json({
        message: "You can only review a tour that you have booked",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      tour: tourId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this tour" });
    }

    const sentiment = analyzeSentiment(comment);

    const review = await Review.create({
      user: req.user._id,
      tour: tourId,
      rating: Number(rating),
      comment: comment.trim(),
      sentimentLabel: sentiment.label,
      sentimentScore: sentiment.score,
    });

    const populatedReview = await review.populate("user", "name");

    return res.status(201).json({
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error.message);

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this tour" });
    }

    return res.status(500).json({ message: "Server error" });
  }
});

/*
  GET /api/reviews
  Admin only
  Get all reviews
*/
router.get("/", protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("tour", "title location")
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    console.error("Get all reviews error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/*
  PUT /api/reviews/:id/approve
  Admin only
*/
router.put("/:id/approve", protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isApproved = true;
    await review.save();

    return res.json({
      message: "Review approved successfully",
      review,
    });
  } catch (error) {
    console.error("Approve review error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/*
  DELETE /api/reviews/:id
  Admin or owner
*/
router.delete("/:id", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await review.deleteOne();

    return res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;