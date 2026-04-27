const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    travelerName: {
      type: String,
      trim: true,
      default: "",
    },
    travelerEmail: {
      type: String,
      trim: true,
      default: "",
    },
    travelerPhone: {
      type: String,
      trim: true,
      default: "",
    },
    departureCity: {
      type: String,
      trim: true,
      default: "",
    },
    planType: {
      type: String,
      enum: ["single", "group", "family"],
      default: "group",
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_arrival", "bank_transfer", "demo_card"],
      default: "cash_on_arrival",
    },
    numGuests: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    travelDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
