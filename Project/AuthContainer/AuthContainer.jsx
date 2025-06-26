import React, { createContext, useContext, useState, useEffect } from "react";
import "antd/dist/reset.css";
import "../src/assets/styles/main.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [view, setView] = useState(() =>
    localStorage.getItem("authToken") ? "dashboard" : "login"
  );
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => localStorage.getItem("userEmail") || "");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");             // in-memory only
  const [permissions, setPermissions] = useState([]); // in-memory only

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
        setUser(data);

        if (data.role) setRole(data.role);
        if (Array.isArray(data.permissions)) setPermissions(data.permissions);
      } else {
        console.warn("Invalid token");
        logout();
      }
    } catch (err) {
      console.error("Error fetching user data", err);
      logout();
    }
  };

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
    setUser(null);
    setRole("");
    setPermissions([]);
    setView("login");
    navigate("/login");
    toast.success("Logout Successful.");
  };

  return (
    <AuthContext.Provider
      value={{
        view,
        email,
        user,
        role,
        permissions,
        switchView,
        fetchUserData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
