import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "../AuthContainer/AuthContainer";
import UserInfo from "./components/Dashboard/UserInfo";
import Login from "./components/LoginForm";
import Signup from "./components/SignUp";
import ForgotPass from "./components/ForgotPass";
import ResetPass from "./components/ResetPassword";
import Dashboard from "./components/Dashboard/Dashboard";
import EditProfile from "./components/EditProfile";
import ChangePassword from "./components/ChangePassword";
import User from "./components/User";
import { jwtDecode } from "jwt-decode";
import Category from "./components/Pages/Category";
import SubCategory from "./components/Pages/SubCategory";
import ServiceManagement from "./components/Pages/ServiceManagement";
import AttributeManagement from "./components/Pages/AttributeManagement";
import ServiceProvider from "./components/Pages/ServiceProviderManagement";
import RoleManagement from "./components/Pages/RoleManagement";
import SubAdminManagement from "./components/Pages/SubAdminManagement";
import WelcomePage from "./components/Pages/WelcomePage";

import PermissionRoute from "./components/PermissionRoute";

function ProtectedRoute({ children }) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setIsAuthenticated(false);
      setCheckingAuth(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } catch (err) {
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  if (checkingAuth) {
    return <div>Loading...</div>; // 🔄 You can show a spinner or skeleton here
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("authToken");

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (!isExpired) {
      return <Navigate to="/dashboard" replace />;
    } else {
      localStorage.removeItem("authToken");
      return children;
    }
  } catch (err) {
    localStorage.removeItem("authToken");
    return children;
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot"
            element={
              <PublicRoute>
                <ForgotPass />
              </PublicRoute>
            }
          />
          <Route
            path="/reset"
            element={
              <PublicRoute>
                <ResetPass />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="welcome" replace />} />
            <Route path="welcome" element={<WelcomePage />} />{" "}

            <Route path="home" element={<UserInfo />} />
            {/* ✅ Add this line */}
            <Route path="edit_profile" element={<EditProfile />} />
            <Route path="change_password" element={<ChangePassword />} />
            <Route
              path="users"
              element={
                <PermissionRoute permissionKey="user_management">
                  <User />
                </PermissionRoute>
              }
            />
            <Route
              path="serviceProvider"
              element={
                <PermissionRoute permissionKey="service_provider_management">
                  <ServiceProvider />
                </PermissionRoute>
              }
            />
            <Route
              path="role"
              element={
                <PermissionRoute permissionKey="role_management">
                  <RoleManagement />
                </PermissionRoute>
              }
            />
            <Route
              path="sub_admin"
              element={
                <PermissionRoute permissionKey="sub_admin_management">
                  <SubAdminManagement />
                </PermissionRoute>
              }
            />
            <Route
              path="category"
              element={
                <PermissionRoute permissionKey="category_management">
                  <Category />
                </PermissionRoute>
              }
            />
            <Route
              path="sub_category"
              element={
                <PermissionRoute permissionKey="sub_category_management">
                  <SubCategory />
                </PermissionRoute>
              }
            />
            <Route
              path="services"
              element={
                <PermissionRoute permissionKey="service_management">
                  <ServiceManagement />
                </PermissionRoute>
              }
            />
            <Route
              path="attributes"
              element={
                <PermissionRoute permissionKey="attribute_management">
                  <AttributeManagement />
                </PermissionRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* ✅ This is required for toasts to show up */}
        <ToastContainer position="top-right" autoClose={1000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
