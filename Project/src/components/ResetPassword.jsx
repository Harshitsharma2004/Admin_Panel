import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function ResetPass() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation function
  const validatePassword = (pass) => {
    const trimmed = pass.trim();
    if (trimmed.length < 8) return false;
    if (/\s/.test(trimmed)) return false; // no spaces allowed
    const hasUpper = /[A-Z]/.test(trimmed);
    const hasLower = /[a-z]/.test(trimmed);
    const hasNumber = /\d/.test(trimmed);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-\[\]\\\/~`+=;']/g.test(trimmed);
    return hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (!otp.trim() || !password || !confirmPass) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      toast.error(
        "Password must be at least 8 characters long, include uppercase, lowercase, number, special character, and contain no spaces."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
          newPassword: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Password reset successful!");
        navigate("/login");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Network error, try again later.");
    }

    setLoading(false);
  };

  const getPasswordStrength = (pass) => {
    if (pass.length < 6) return "Weak";
    if (
      /[a-z]/.test(pass) &&
      /[A-Z]/.test(pass) &&
      /\d/.test(pass) &&
      /[\W_]/.test(pass)
    )
      return "Strong";
    return "Medium";
  };

  const strength = getPasswordStrength(password);
  const strengthColor = {
    Weak: "red",
    Medium: "orange",
    Strong: "green",
  };

  return (
    <form className="auth-form" onSubmit={resetPassword}>
      <img src={logo} alt="Logo" />
      <h2>Reset Password</h2>

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
      />

      <label>New Password</label>
      <div className="password-wrapper" style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
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
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {password && (
        <div
          style={{
            marginTop: "5px",
            color: strengthColor[strength],
            fontWeight: "bold",
          }}
        >
          Strength: {strength}
        </div>
      )}

      <label>Confirm Password</label>
      <div className="password-wrapper" style={{ position: "relative" }}>
        <input
          type={showConfirm ? "text" : "password"}
          required
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          placeholder="Confirm new password"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          tabIndex={-1}
          aria-label={
            showConfirm ? "Hide confirm password" : "Show confirm password"
          }
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
        >
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      <p className="switch-link">
        <button type="button" onClick={() => navigate("/login")}>
          Back to Login
        </button>
      </p>
    </form>
  );
}
