// src/data/packages.js
export const packages = [
  {
    id: "malam-jabba",
    name: "Malam Jabba",
    location: "Swat, Pakistan",
    price: 15000,
    status: "Featured",
    statusType: "success", // success / danger
    shortDescription: "3 days trip including sightseeing, hotel and transport.",
    images: [
      "https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg",
      "https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg",
      "https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg"
    ],
    rating: 4.9,
    reviewsCount: 12,
    features: [
      "2 Nights hotel stay",
      "Breakfast & Dinner included",
      "Bonfire & music night",
      "Professional tour guide"
    ],
    additionalDetails: [
      "Free cancellation up to 5 days before trip.",
      "Children under 5 are free.",
      "Departure from Islamabad."
    ],
    longDescription:
      "Enjoy an unforgettable adventure in Malam Jabba with snow activities, chairlift rides, and stunning mountain views."
  },
  {
    id: "batakundi",
    name: "Batakundi",
    location: "Naran, Pakistan",
    price: 28000,
    status: "Available",
    statusType: "danger",
    shortDescription: "4 days and 3 nights tour with jeep safari and sightseeing.",
    images: [
      "https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg",
      "https://images.pexels.com/photos/210307/pexels-photo-210307.jpeg"
    ],
    rating: 4.7,
    reviewsCount: 8,
    features: [
      "3 Nights hotel stay",
      "Jeep safari included",
      "Daily breakfast",
      "Photography spots"
    ],
    additionalDetails: [
      "Pickup from Abbottabad or Islamabad.",
      "Comfortable AC transport.",
      "Tour operator available 24/7."
    ],
    longDescription:
      "Batakundi is a peaceful valley near Naran, surrounded by lush green mountains and rivers."
  },
  {
    id: "hunza-valley",
    name: "Hunza Valley Tour",
    location: "Hunza, Pakistan",
    price: 25000,
    status: "Available",
    statusType: "danger",
    shortDescription: "5 days tour exploring Hunza, Attabad Lake, and Passu cones.",
    images: [
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg"
    ],
    rating: 5.0,
    reviewsCount: 20,
    features: [
      "4 Nights hotel stay",
      "Attabad lake boating",
      "Visit Altit & Baltit forts",
      "Professional photography"
    ],
    additionalDetails: [
      "All main entry tickets included.",
      "Local Hunza food tasting.",
      "Comfortable transport with music."
    ],
    longDescription:
      "Explore the magical Hunza Valley with crystal blue lakes, snow-covered peaks and rich local culture."
  }
];
