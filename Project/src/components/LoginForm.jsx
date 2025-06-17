import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/logo.png";
import "react-toastify/dist/ReactToastify.css";
import CryptoJS from "crypto-js"; // Importing crypto-js for encryption

const SECRET_KEY = "C@rr!er^@2025$06"; // You should use a more secure secret key in production

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedPassword = localStorage.getItem("rememberedPassword");

    if (rememberedEmail && rememberedPassword) {
      // Decrypt the values before setting them
      const decryptedEmail = CryptoJS.AES.decrypt(rememberedEmail, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      const decryptedPassword = CryptoJS.AES.decrypt(rememberedPassword, SECRET_KEY).toString(CryptoJS.enc.Utf8);

      if (decryptedEmail && decryptedPassword) {
        setEmail(decryptedEmail);
        setPassword(decryptedPassword);
        setRememberMe(true);
      }
    }
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Invalid email format");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Login successful!");
        const { token } = data;
        localStorage.setItem("authToken", token);

        // Handle "Remember Me" logic with encryption
        if (rememberMe) {
          const encryptedEmail = CryptoJS.AES.encrypt(email.trim(), SECRET_KEY).toString();
          const encryptedPassword = CryptoJS.AES.encrypt(password.trim(), SECRET_KEY).toString();
          
          localStorage.setItem("rememberedEmail", encryptedEmail);
          localStorage.setItem("rememberedPassword", encryptedPassword);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        navigate("/dashboard");
        window.location.reload();
      } else {
        toast.error(data.error || "Login failed. Check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <form className="auth-form" onSubmit={onSubmit} autoComplete="on">
      <img src={logo} alt="Logo" />
      <h2 style={{margin:"10px",fontSize:"20px"}}>Admin Panel Login</h2>

      <label>Email</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        disabled={loading}
        autoComplete="email"
      />

      <label>Password</label>
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember Me
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* <p className="switch-link">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/signup")}
          disabled={loading}
        >
          Sign Up
        </button>
      </p> */}

      <p className="switch-link">
        <button
          type="button"
          onClick={() => navigate("/forgot")}
          disabled={loading}
        >
          Forgot Password?
        </button>
      </p>
    </form>
  );
}
