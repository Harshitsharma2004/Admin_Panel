import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContainer/AuthContainer";

const PermissionRoute = ({ permissionKey, children }) => {
  const { permissions, role } = useAuth();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (role === "Admin") {
      setHasPermission(true);
      setLoading(false);
      return;
    }

    if (permissions && Array.isArray(permissions)) {
      const allowed = permissions.includes(permissionKey);
      setHasPermission(allowed);
      setLoading(false);
    }
  }, [permissions, role, permissionKey]);

  if (loading) return <div>Loading...</div>; // or a skeleton

  if (!hasPermission) {
    return <Navigate to="/dashboard/welcome" state={{ from: location }} replace />;
  }

  return children;
};

export default PermissionRoute;
