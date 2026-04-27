const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Tour = require("../models/Tour");
const Booking = require("../models/Booking");
const Otp = require("../models/Otp");

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to DB for seeding");
}

async function clearDB() {
  await Booking.deleteMany({});
  await Otp.deleteMany({});
  await Tour.deleteMany({});
  await User.deleteMany({});
  console.log("🧹 Cleared old data");
}

async function seedUsers() {
  // create users with temporary password that satisfies validation
  await User.create([
    {
      name: "Admin",
      email: "admin@tour.com",
      password: "temporary123",
      role: "admin",
    },
    {
      name: "Test User",
      email: "user@tour.com",
      password: "temporary123",
      role: "user",
    },
  ]);

  // hash real passwords
  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("user123", 10);

  // update passwords with hashed values
  await User.updateOne(
    { email: "admin@tour.com" },
    { $set: { password: adminHash, role: "admin" } }
  );

  await User.updateOne(
    { email: "user@tour.com" },
    { $set: { password: userHash, role: "user" } }
  );

  console.log("👤 Seeded users with hashed passwords");
}

async function seedTours() {
  const tours = await Tour.insertMany([
    {
      title: "Naran Kaghan Valley",
      location: "KPK, Pakistan",
      description:
        "Beautiful valley tour with lakes, mountain views and cool weather.",
      price: 15000,
      durationDays: 3,
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60",
    },
    {
      title: "Hunza Trip",
      location: "Gilgit Baltistan, Pakistan",
      description:
        "Explore Hunza valley with breathtaking mountains and culture.",
      price: 25000,
      durationDays: 5,
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60",
    },
    {
      title: "Swat Kalam Tour",
      location: "KPK, Pakistan",
      description:
        "Enjoy the beauty of Swat valley with rivers, forests and meadows.",
      price: 18000,
      durationDays: 4,
      image:
        "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1200&q=60",
    },
  ]);

  console.log("🗺️ Seeded tours");
  return tours;
}

async function run() {
  try {
    await connectDB();
    await clearDB();
    await seedUsers();
    await seedTours();
    console.log("✅ Seeding completed!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();