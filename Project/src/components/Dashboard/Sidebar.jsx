import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal } from "antd";
import { useAuth } from "../../../AuthContainer/AuthContainer";

const SidebarItem = ({ to, iconPath, label, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

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
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <img src={`/icons/${iconPath}`} alt={label} className="sidebar-icon" />
      {label}
    </li>
  );
};

export default function Sidebar() {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [visible, setVisible] = useState(true);

  const { permissions, logout, role } = useAuth();

  const allSidebarItems = [
    {
      to: "/dashboard/home",
      iconPath: "dashboard-icon.svg",
      label: "Dashboard",
      permission: "dashboard",
    },
    {
      to: "/dashboard/role",
      iconPath: "role-icon.svg",
      label: "Role Management",
      permission: "role_management",
    },
    {
      to: "/dashboard/sub_admin",
      iconPath: "subAdmin-icon.svg",
      label: "Sub Admin Management",
      permission: "sub_admin_management",
    },
    {
      to: "/dashboard/users",
      iconPath: "user-icon.svg",
      label: "User Management",
      permission: "user_management",
    },
    {
      to: "/dashboard/serviceProvider",
      iconPath: "serviceProvider-icon.svg",
      label: "Service Provider Management",
      permission: "service_provider_management",
    },
    {
      to: "/dashboard/category",
      iconPath: "category-icon.svg",
      label: "Category Management",
      permission: "category_management",
    },
    {
      to: "/dashboard/sub_category",
      iconPath: "subCategory-icon.svg",
      label: "Sub Category Management",
      permission: "sub_category_management",
    },
    {
      to: "/dashboard/services",
      iconPath: "service-icon.svg",
      label: "Service Management",
      permission: "service_management",
    },
    {
      to: "/dashboard/attributes",
      iconPath: "attribute-icon.svg",
      label: "Attribute Management",
      permission: "attribute_management",
    },
  ];

  const filteredSidebarItems =
    role === "Admin"
      ? allSidebarItems
      : allSidebarItems.filter((item) => permissions.includes(item.permission));

  const showLogoutModal = () => {
    setIsModalVisible(true);
  };

  const handleLogout = () => {
    setIsModalVisible(false);
    logout(); // uses context logout (which clears everything)
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <aside className={`sidebar ${visible ? "visible" : "collapsed"}`}>
      <ul className="sidebar-list">
        {filteredSidebarItems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            iconPath={item.iconPath}
            label={item.label}
          />
        ))}
        <SidebarItem
          iconPath="logout-icon.svg"
          label="Logout"
          onClick={showLogoutModal}
        />
      </ul>

      <Modal
        title="Confirm Logout"
        open={isModalVisible}
        onOk={handleLogout}
        onCancel={handleCancel}
        okText="Logout"
        cancelText="Cancel"
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </aside>
  );
}
