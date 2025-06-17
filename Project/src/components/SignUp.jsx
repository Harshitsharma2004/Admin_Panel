import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Password validation function
  const validatePassword = (password) => {
    const trimmed = password.trim();

    if (trimmed.length < 8) return false;
    if (/\s/.test(trimmed)) return false; // no spaces allowed

    const hasUpper = /[A-Z]/.test(trimmed);
    const hasLower = /[a-z]/.test(trimmed);
    const hasNumber = /\d/.test(trimmed);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(trimmed);

    return hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return toast.error("Enter a valid email");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent to your email.");
        setOtpSent(true);
      } else {
        toast.error(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      toast.error("Server error while sending OTP.");
    }

    setLoading(false);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || !password) return toast.error("Enter OTP and Password");

    if (!validatePassword(password)) {
      return toast.error(
        "Password must be at least 8 characters, contain uppercase, lowercase, number, special character, and no spaces."
      );
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Signup successful. You can now log in.");
        navigate("/login");
      } else {
        toast.error(data.error || "Verification failed.");
      }
    } catch (err) {
      toast.error("Server error during OTP verification.");
    }

    setLoading(false);
  };

  const handleResend = () => {
    setOtpSent(false);
    setOtp("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <div>
      {!otpSent ? (
        <form className="auth-form" onSubmit={sendOtp}>
          <img src={logo} alt="Logo" />
          <h2>Sign Up</h2>
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
          <p className="switch-link">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")} disabled={loading}>
              Login
            </button>
          </p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={verifyOtp}>
          <img src={logo} alt="Logo" />
          <h2>Verify OTP & Set Password</h2>
          <label>Email</label>
          <input type="email" disabled value={email} />
          <label>OTP</label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            disabled={loading}
          />
          <label>Password</label>
          <div className="password-wrapper" style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set your password"
              disabled={loading}
              style={{ width: "100%", paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                margin: 0,
              }}
              disabled={loading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Signup"}
          </button>
          <p className="switch-link">
            <button type="button" onClick={handleResend} disabled={loading}>
              Resend OTP
            </button>
          </p>
        </form>
      )}
    </div>
  );
}
