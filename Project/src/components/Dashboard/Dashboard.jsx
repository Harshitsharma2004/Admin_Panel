import React from "react";
import Sidebar from "./Sidebar";
import Header from "../Header";
import Footer from "../Footer";
import { Outlet, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContainer/AuthContainer";

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect base /dashboard to /dashboard/home
  if (location.pathname === "/dashboard") {
    return <Navigate to="/dashboard/home" replace />;
  }

  // Determine title for breadcrumb
  const pathToTitle = {
    "/dashboard/home": "Dashboard",
    "/dashboard/edit_profile": "Edit Profile",
    "/dashboard/change_password": "Change Password",
    "/dashboard/users": "Users",
    "/dashboard/category": "Category",
    "/dashboard/users/search": "Search",
    "/dashboard/users/add_new_users": "Add New User",
    "/dashboard/users/edit": "Edit",
    "/dashboard/users/delete": "Delete",
  };

  

  const showBreadcrumb = location.pathname !== "/dashboard/home";

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
