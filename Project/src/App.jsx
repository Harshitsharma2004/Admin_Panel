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
import UserInfo from './components/Dashboard/UserInfo'
import Login from "./components/LoginForm";
import Signup from "./components/SignUp";
import ForgotPass from "./components/ForgotPass";
import ResetPass from "./components/ResetPassword";
import Dashboard from "./components/Dashboard/Dashboard";
import EditProfile from "./components/EditProfile";
import ChangePassword from "./components/ChangePassword";
import User from "./components/User";
import {jwtDecode} from "jwt-decode";
import Category from "./components/Pages/Category";
import SubCategory from "./components/Pages/SubCategory";
import ServiceManagement from "./components/Pages/ServiceManagement";
import AttributeManagement from "./components/Pages/AttributeManagement";


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
      return <Navigate to="/dashboard/home" replace />;
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
            <Route path="home" element={<UserInfo />} />{" "}
            {/* ✅ Add this line */}
            <Route path="edit_profile" element={<EditProfile />} />
            <Route path="change_password" element={<ChangePassword />} />
            <Route path="users" element={<User />} />
            <Route path="users/search" element={<User />} />
            <Route path="users/add_new_users" element={<User />} />
            <Route path="users/edit/:id" element={<User />} />
            <Route path="users/delete/:id" element={<User />} />

            {/* for category  */}
            <Route path="category" element={<Category />} />

            <Route path="sub_category" element={<SubCategory />} />



            <Route path="services" element={<ServiceManagement/>} />


            <Route path="attributes" element={<AttributeManagement/>} />


          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* ✅ This is required for toasts to show up */}
        <ToastContainer position="top-center" autoClose={2000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
