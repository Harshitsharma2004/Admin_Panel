import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const SidebarItem = ({ to, iconPath, label, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <li
      className={`sidebar-item ${isActive ? "active" : ""}`}
      onClick={handleClick}
    >
      <img src={`/icons/${iconPath}`} alt={label} className="sidebar-icon" />
      {label}
    </li>
  );
};

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    toast.success("Logout Successfull.");
    // setUser(null);
    // setView("login");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <ul className="sidebar-list">
        <SidebarItem
          to="/dashboard/home"
          iconPath="dashboard-icon.svg"
          label="Dashboard"
        />
        <SidebarItem
          to="/dashboard/users"
          iconPath="user-icon.svg"
          label="User Management"
        />
        <SidebarItem
          to="/dashboard/category"
          iconPath="category-icon.svg"
          label="Category Management"
        />
        <SidebarItem
          to="/dashboard/sub_category"
          iconPath="subCategory-icon.svg"
          label="Sub Category Management"
        />
        <SidebarItem
          to="/dashboard/services"
          iconPath="service-icon.svg"
          label="Service Management"
        />
        <SidebarItem
          to="/dashboard/attributes"
          iconPath="attribute-icon.svg"
          label="Attribute Management"
        />
        <SidebarItem
          iconPath="logout-icon.svg"
          label="Logout"
          onClick={logout}
        />
      </ul>
    </aside>
  );
}
