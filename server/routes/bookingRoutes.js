const express = require("express");
const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

const PLAN_MULTIPLIERS = {
  single: 1,
  group: 1.2,
  family: 1.4,
};

router.post("/", protect, async (req, res) => {
  try {
    const {
      tourId,
      numGuests,
      travelDate,
      returnDate,
      planType = "group",
      travelerName = "",
      travelerEmail = "",
      travelerPhone = "",
      departureCity = "",
      paymentMethod = "cash_on_arrival",
    } = req.body;

    if (!tourId || !numGuests || !travelDate) {
      return res.status(400).json({ message: "tourId, numGuests and travelDate are required" });
    }

    const validPlans = ["single", "group", "family"];
    if (!validPlans.includes(planType)) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    const validPayments = ["cash_on_arrival", "bank_transfer", "demo_card"];
    if (!validPayments.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    const guests = Number(numGuests);
    if (Number.isNaN(guests) || guests < 1) {
      return res.status(400).json({ message: "Guests must be at least 1" });
    }

    const basePrice = Number(tour.price || 0);
    const multiplier = PLAN_MULTIPLIERS[planType] || 1;
    const totalPrice = Math.round(basePrice * multiplier * guests);

    const booking = await Booking.create({
      user: req.user._id,
      tour: tour._id,
      travelerName,
      travelerEmail,
      travelerPhone,
      departureCity,
      planType,
      paymentMethod,
      numGuests: guests,
      totalPrice,
      travelDate,
      returnDate: returnDate || null,
    });

    const populated = await booking.populate("tour user", "-password");
    return res.status(201).json(populated);
  } catch (error) {
    console.error("Create booking error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("tour")
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error("My bookings error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/", protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("tour", "title location price")
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error("All bookings error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("tour");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (booking.status === "cancelled") {
      return res.json(booking);
    }

    booking.status = "cancelled";
    await booking.save();

    return res.json(booking);
  } catch (error) {
    console.error("Cancel booking error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["pending", "confirmed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("tour", "title location price");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    return res.json(booking);
  } catch (error) {
    console.error("Update booking status error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
