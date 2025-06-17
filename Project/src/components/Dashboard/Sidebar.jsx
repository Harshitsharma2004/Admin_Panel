import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarItem = ({ to, iconPath, label }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li
      className={`sidebar-item ${isActive ? "active" : ""}`}
      onClick={() => navigate(to)}
    >
      <img
        src={`/icons/${iconPath}`}
        alt={label}
        className="sidebar-icon"
      />
      {label}
    </li>
  );
};

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <ul className="sidebar-list">
        <SidebarItem to="/dashboard/home" iconPath="dashboard-icon.svg" label="Dashboard" />
        <SidebarItem to="/dashboard/users" iconPath="user-icon.svg" label="User Management" />
        <SidebarItem to="/dashboard/category" iconPath="category-icon.svg" label="Category Management" />
        <SidebarItem to="/dashboard/sub_category" iconPath="subCategory-icon.svg" label="Sub Category Management" />
        <SidebarItem to="/dashboard/services" iconPath="service-icon.svg" label="Service Management" />
      </ul>
    </aside>
  );
}
