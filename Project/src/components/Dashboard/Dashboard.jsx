import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "../Header";
import Footer from "../Footer";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContainer/AuthContainer";

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Use useEffect instead of inline Navigate
  // useEffect(() => {
  //   if (location.pathname === "/dashboard") {
  //     navigate("/dashboard/welcome", { replace: true });
  //   }
  // }, [location.pathname, navigate]);

  return (
    <div className="dashboard-wrapper">
      <Header />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <Outlet context={{ user }} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
