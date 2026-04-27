const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Tour = require("../models/Tour");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

//
// ========================= USERS =========================
//

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json({ count: users.length, users });
  } catch (error) {
    console.error("Admin users error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const role = req.body.role?.trim();
    const password = req.body.password?.trim();

    if (name) {
      user.name = name;
    }

    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      user.email = email;
    }

    if (role === "admin" || role === "user") {
      user.role = role;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    return res.json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Admin update user error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Admin delete user error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

//
// ========================= TOURS =========================
//

// @route   GET /api/admin/tours
// @desc    Get all tours for admin
// @access  Private/Admin
router.get("/tours", protect, admin, async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    return res.json({ count: tours.length, tours });
  } catch (error) {
    console.error("Admin tours error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/admin/tours
// @desc    Create a new tour
// @access  Private/Admin
router.post("/tours", protect, admin, async (req, res) => {
  try {
    const {
      title,
      location,
      description,
      price,
      durationDays,
      imageUrl,
      isFeatured,
      status,
    } = req.body;

    if (!title || !location || !description || !price || !durationDays) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const newTour = await Tour.create({
      title: title.trim(),
      location: location.trim(),
      description: description.trim(),
      price: Number(price),
      durationDays: Number(durationDays),
      imageUrl: imageUrl?.trim() || "",
      isFeatured: !!isFeatured,
      status: status === "inactive" ? "inactive" : "active",
    });

    return res.status(201).json({
      message: "Tour created successfully",
      tour: newTour,
    });
  } catch (error) {
    console.error("Admin create tour error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/admin/tours/:id
// @desc    Update a tour
// @access  Private/Admin
router.put("/tours/:id", protect, admin, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    const {
      title,
      location,
      description,
      price,
      durationDays,
      imageUrl,
      isFeatured,
      status,
    } = req.body;

    if (title !== undefined) {
      tour.title = title.trim();
    }

    if (location !== undefined) {
      tour.location = location.trim();
    }

    if (description !== undefined) {
      tour.description = description.trim();
    }

    if (price !== undefined) {
      tour.price = Number(price);
    }

    if (durationDays !== undefined) {
      tour.durationDays = Number(durationDays);
    }

    if (imageUrl !== undefined) {
      tour.imageUrl = imageUrl.trim();
    }

    if (isFeatured !== undefined) {
      tour.isFeatured = !!isFeatured;
    }

    if (status !== undefined) {
      tour.status = status === "inactive" ? "inactive" : "active";
    }

    const updatedTour = await tour.save();

    return res.json({
      message: "Tour updated successfully",
      tour: updatedTour,
    });
  } catch (error) {
    console.error("Admin update tour error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/admin/tours/:id
// @desc    Delete a tour
// @access  Private/Admin
router.delete("/tours/:id", protect, admin, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    await tour.deleteOne();

    return res.json({ message: "Tour deleted successfully" });
  } catch (error) {
    console.error("Admin delete tour error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;