import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

export default function ForgotPass() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const sendResetLink = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Enter your email");
    if (!validateEmail(email)) return toast.error("Enter a valid email");

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || `Password reset OTP sent to ${email}`);
        navigate("/reset", { state: { email } });
      } else {
        toast.error(data.error || "Failed to send reset link");
      }
    } catch (err) {
      console.error("Error sending reset link:", err);
      toast.error("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <form className="auth-form" onSubmit={sendResetLink}>
      <img src={logo} alt="Logo" />
      <h2>Forgot Password</h2>

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
        {loading ? "Sending..." : "Send Reset OTP"}
      </button>

      <p className="switch-link">
        Remembered?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          Login
        </button>
      </p>
    </form>
  );
}
