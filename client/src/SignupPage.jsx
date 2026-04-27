// src/SignupPage.jsx
import React, { useMemo, useState } from "react";
import "./App.css";
import {
  registerUser,
  sendVerificationCode,
  verifyEmailCode,
} from "./api";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

function SignupPage({ onSwitchToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [lastVerifiedEmail, setLastVerifiedEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailVerified(false);
    setLastVerifiedEmail("");
    setOtpCode("");
    setOtpError("");
    setOtpMessage("");
    setSuccess("");
  };

  const handleSendCode = async () => {
    setError("");
    setSuccess("");
    setOtpError("");
    setOtpMessage("");

    if (!emailRegex.test(normalizedEmail)) {
      setOtpError("Please enter a valid email address first.");
      return;
    }

    try {
      setSendingCode(true);
      const data = await sendVerificationCode({ email: normalizedEmail });
      setOtpMessage(data.message || "Verification code sent successfully.");
      setEmailVerified(false);
      setLastVerifiedEmail("");
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setOtpError("");
    setOtpMessage("");
    setError("");
    setSuccess("");

    if (!emailRegex.test(normalizedEmail)) {
      setOtpError("Please enter a valid email address first.");
      return;
    }

    if (!otpCode.trim()) {
      setOtpError("Please enter the verification code sent to your email.");
      return;
    }

    try {
      setVerifyingCode(true);
      const data = await verifyEmailCode({
        email: normalizedEmail,
        code: otpCode.trim(),
      });
      setEmailVerified(true);
      setLastVerifiedEmail(normalizedEmail);
      setOtpMessage(data.message || "Email verified successfully.");
    } catch (err) {
      setEmailVerified(false);
      setLastVerifiedEmail("");
      setOtpError(err.message);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!emailVerified || lastVerifiedEmail !== normalizedEmail) {
      setError("Please verify your email before creating the account.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 6 characters and include an uppercase letter, a number and a symbol."
      );
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await registerUser({
        name: fullName,
        email: normalizedEmail,
        password,
      });

      setSuccess("Account created successfully! Please log in.");

      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    } catch (err) {
      console.error(err);
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
          <h1 className="main-heading">Sign Up</h1>
          <p className="subtitle">
            Create your account to book tours, manage your trips, and explore
            new destinations with us.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="input-label">
              Full Name
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  required
                  className="text-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </label>

            <label className="input-label">
              Email ID
              <div className="input-with-button">
                <div className="input-with-icon flex-grow-field">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="text-input"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>

                <button
                  type="button"
                  className={`otp-btn ${emailVerified ? "otp-btn-verified" : ""}`}
                  onClick={handleSendCode}
                  disabled={sendingCode || emailVerified}
                >
                  {emailVerified
                    ? "Verified"
                    : sendingCode
                    ? "Sending..."
                    : "Send Code"}
                </button>
              </div>
            </label>

            <div className="otp-row">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter verification code"
                className="otp-input"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                disabled={emailVerified}
              />
              <button
                type="button"
                className="otp-verify-btn"
                onClick={handleVerifyCode}
                disabled={verifyingCode || emailVerified}
              >
                {emailVerified
                  ? "Verified"
                  : verifyingCode
                  ? "Verifying..."
                  : "Verify"}
              </button>
            </div>

            {otpMessage && <p className="otp-message">{otpMessage}</p>}
            {otpError && <p className="otp-error">{otpError}</p>}

            <label className="input-label">
              Password
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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

            <label className="input-label">
              Confirm Password
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  required
                  className="text-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {showConfirmPassword ? (
                  <FiEyeOff
                    className="eye-icon"
                    onClick={() => setShowConfirmPassword(false)}
                  />
                ) : (
                  <FiEye
                    className="eye-icon"
                    onClick={() => setShowConfirmPassword(true)}
                  />
                )}
              </div>
            </label>

            <div className="checkbox-row">
              <input
                id="signup-terms"
                type="checkbox"
                className="checkbox-input"
              />
              <label htmlFor="signup-terms" className="checkbox-label">
                I agree to the Terms &amp; Conditions
              </label>
            </div>

            {error && <p className="auth-inline-error">{error}</p>}
            {success && <p className="auth-inline-success">{success}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Account ↗"}
            </button>
          </form>

          <p className="switch-text">
            Already have an account?{" "}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToLogin}
            >
              Log In
            </button>
          </p>
        </div>

        <div className="login-right"></div>
      </div>
    </div>
  );
}

export default SignupPage;
