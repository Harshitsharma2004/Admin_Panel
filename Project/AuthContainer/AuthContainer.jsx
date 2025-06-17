import React, { createContext, useContext, useState, useEffect } from "react";
import "antd/dist/reset.css";
import "../src/assets/styles/main.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Initialize view based on token presence in localStorage
  const [view, setView] = useState(() =>
    localStorage.getItem("authToken") ? "dashboard" : "login"
  );
  const navigate = useNavigate();

  // Initialize email from localStorage
  const [email, setEmail] = useState(
    () => localStorage.getItem("userEmail") || ""
  );

  // User data
  const [user, setUser] = useState(null);

  // Fetch user data from backend
  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        // console.log(data)
        setUser(data);
      } else {
        console.warn("Invalid or expired token");
        setUser(null);
        localStorage.removeItem("authToken");
        setView("login");
      }
    } catch (err) {
      console.error("Error fetching user data", err);
      setUser(null);
    }
  };

  // Call it once when app loads
  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      fetchUserData();
    }
  }, []);

  const switchView = (newView, emailValue = "") => {
    setView(newView);
    if (emailValue) setEmail(emailValue);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    toast.success("Logout Successfull.");
    setUser(null);
    setView("login");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ view, email, user, switchView, fetchUserData, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
