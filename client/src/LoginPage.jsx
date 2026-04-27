import React, { useState } from "react";
import "./App.css";
import { loginUser } from "./api";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

function LoginPage({ onSwitchToSignup, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const data = await loginUser({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccessMessage(`Welcome back, ${data.user?.name || "Traveler"}! Redirecting to your dashboard...`);

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <p className="mini-heading">Explore With Safety Guider</p>
          <h1 className="main-heading">Log In</h1>
          <p className="subtitle">
            We&apos;re thrilled that you&apos;re back. Please log in to manage
            your trips and packages.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="input-label">
              Email ID
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="text-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>

            <label className="input-label">
              Password
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="text-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {showPassword ? (
                  <FiEyeOff
                    className="eye-icon"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <FiEye
                    className="eye-icon"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            </label>

            <div className="checkbox-row">
              <input id="login-privacy" type="checkbox" className="checkbox-input" />
              <label htmlFor="login-privacy" className="checkbox-label">
                I agree to the Privacy Policy
              </label>
            </div>

            {error && <p className="auth-inline-error">{error}</p>}
            {successMessage && <div className="auth-inline-success">{successMessage}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Submit Now ↗"}
            </button>
          </form>

          <p className="switch-text">
            Don&apos;t have an account?{" "}
            <button type="button" className="link-button" onClick={onSwitchToSignup}>
              Sign Up
            </button>
          </p>
        </div>

        <div className="login-right"></div>
      </div>

      {successMessage && (
        <div className="auth-floating-alert success">{successMessage}</div>
      )}
    </div>
  );
}

export default LoginPage;
