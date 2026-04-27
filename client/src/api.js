// src/api.js
const API_BASE_URL = "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

/* --- AUTH --- */

export function sendVerificationCode(payload) {
  return request("/api/auth/send-verification-code", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyEmailCode(payload) {
  return request("/api/auth/verify-email-code", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser() {
  return request("/api/auth/me", {
    headers: getAuthHeaders(),
  });
}

/* --- TOURS --- */

export function getTours() {
  return request("/api/tours");
}

export function getAdminTours() {
  return request("/api/admin/tours", {
    headers: getAuthHeaders(),
  });
}

export function getTourById(id) {
  return request(`/api/tours/${id}`);
}

export function createTour(payload) {
  return request("/api/tours", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export function updateTour(id, payload) {
  return request(`/api/tours/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export function deleteTour(id) {
  return request(`/api/tours/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

/* --- BOOKINGS --- */

export function createBooking(payload) {
  return request("/api/bookings", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export function getMyBookings() {
  return request("/api/bookings/my", {
    headers: getAuthHeaders(),
  });
}

export function getAllBookings() {
  return request("/api/bookings", {
    headers: getAuthHeaders(),
  });
}

export function cancelMyBooking(id) {
  return request(`/api/bookings/${id}/cancel`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
}

export function adminUpdateBookingStatus(id, status) {
  return request(`/api/bookings/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
}

/* --- ADMIN USERS --- */

export function getAllUsers() {
  return request("/api/admin/users", {
    headers: getAuthHeaders(),
  });
}

export function updateUser(id, payload) {
  return request(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id) {
  return request(`/api/admin/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

/* --- REVIEWS --- */

export function getTourReviews(tourId) {
  return request(`/api/reviews/tour/${tourId}`);
}

export function createReview(tourId, payload) {
  return request(`/api/reviews/${tourId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export function getAllReviews() {
  return request("/api/reviews", {
    headers: getAuthHeaders(),
  });
}

export function approveReview(id) {
  return request(`/api/reviews/${id}/approve`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
}

export function deleteReview(id) {
  return request(`/api/reviews/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}
/* --- BLOGS --- */

export function getBlogs() {
  return request("/api/blogs");
}

export function getBlogById(id) {
  return request(`/api/blogs/${id}`);
}
