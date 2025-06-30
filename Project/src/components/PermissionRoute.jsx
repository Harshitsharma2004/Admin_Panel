
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../AuthContainer/AuthContainer";

const PermissionRoute = ({ permissionKey, children }) => {
  const { permissions, role } = useAuth();

  // Admin has access to all
  if (role === "Admin") return children;

  if (permissions.includes(permissionKey)) {
    return children;
  }

  return <Navigate to="/dashboard/home" replace />;
};

export default PermissionRoute;
