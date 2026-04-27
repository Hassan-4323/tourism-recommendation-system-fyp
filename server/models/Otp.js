// server/models/Otp.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Optional: make sure one OTP per email (last one wins)
otpSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("Otp", otpSchema);
