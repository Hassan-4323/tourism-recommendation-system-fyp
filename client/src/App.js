// src/App.js
import { useState, useEffect } from "react";
import "./App.css";

import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import DashboardPage from "./DashboardPage";
import AdminDashboard from "./AdminDashboard";
import BookNowPage from "./BookNowPage";
import Footer from "./components/Footer";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";

// use your detail page component from /pages
import PackageDetail from "./pages/PackageDetail";
import PackagesList from "./pages/PackagesList";
import BlogsList from "./pages/BlogsList";
import BlogDetail from "./pages/BlogDetail";
import MyBookingsPage from "./MyBookingsPage";
import TravelInsightsPage from "./TravelInsightsPage";

/* ---------- Small helper components ---------- */

// Login route wrapper – handles navigation after login
function LoginWrapper({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSuccess = (user) => {
    onLoginSuccess(user);
    const redirectTo = searchParams.get("redirect");
    navigate(redirectTo || "/dashboard", { replace: true });
  };

  return (
    <LoginPage
      onSwitchToSignup={() => navigate("/signup")}
      onLoginSuccess={handleSuccess}
    />
  );
}

// Signup route wrapper – lets SignupPage go back to login
function SignupWrapper() {
  const navigate = useNavigate();

  return <SignupPage onSwitchToLogin={() => navigate("/login")} />;
}

// Dashboard wrapper – chooses AdminDashboard or normal Dashboard
function DashboardWrapper({ currentUser, onLogout }) {
  if (!currentUser) {
    // if not logged in, go back to login
    return <Navigate to="/login" replace />;
  }

  // admin vs normal user
  if (currentUser.role === "admin") {
    return <AdminDashboard onLogout={onLogout} />;
  }

  return <DashboardPage onLogout={onLogout} />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/* ---------- Inner app content (needs Router context) ---------- */
function AppContent({ currentUser, handleLoginSuccess, handleLogout }) {
  const location = useLocation();

  // hide footer on login & signup routes
  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    currentUser?.role === "admin";

  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ROOT: show login OR dashboard */}
        <Route
          path="/"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* LOGIN PAGE */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginWrapper onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* SIGNUP PAGE */}
        <Route
          path="/signup"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignupWrapper />
            )
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <DashboardWrapper
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />

        {/* ALL PACKAGES PAGE */}
        <Route path="/packages" element={<PackagesList />} />

        {/* FULL-PAGE PACKAGE DETAILS */}
        <Route path="/packages/:id" element={<PackageDetail />} />

        {/* BLOGS */}
        <Route path="/blogs" element={<BlogsList />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />

        {/* MY BOOKINGS */}
        <Route path="/my-bookings" element={currentUser ? <MyBookingsPage onLogout={handleLogout} /> : <Navigate to="/login" replace />} />

        {/* TRAVEL INSIGHTS */}
        <Route path="/travel-insights" element={currentUser ? <TravelInsightsPage onLogout={handleLogout} /> : <Navigate to="/login" replace />} />

        {/* BOOK NOW */}
        <Route path="/book/:id" element={<BookNowPage />} />
        <Route path="/book" element={<Navigate to="/dashboard#packages" replace />} />

        {/* ANY OTHER URL → go to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global footer, hidden on login/signup */}
      {!hideFooter && <Footer />}
    </>
  );
}

/* ------------------------ MAIN APP ------------------------ */

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // On page load, check localStorage for user
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  // called when login is successful
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    // LoginPage should already save user & token in localStorage
  };

  // called when user clicks logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  return (
    <Router>
      <AppContent
        currentUser={currentUser}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
