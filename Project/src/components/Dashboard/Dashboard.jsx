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

  // Generate breadcrumb paths and titles
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbPaths = pathSegments.map(
    (_, index) => "/" + pathSegments.slice(0, index + 1).join("/")
  );

  const breadcrumbTitles = breadcrumbPaths
    .filter((path) => pathToTitle[path]) // keep only known paths
    .map((path) => ({
      path,
      title: pathToTitle[path],
    }));

  const showBreadcrumb = location.pathname !== "/dashboard/home";

  return (
    <div className="dashboard-wrapper">
      <Header />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          {/* {showBreadcrumb && (
            <div
              style={{
                padding: "10px 20px",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                flexWrap: "wrap",
              }}
            >
              <span
                onClick={() => {
                  const secondLast =
                    breadcrumbTitles[breadcrumbTitles.length - 2];
                  if (secondLast) {
                    navigate(secondLast.path);
                  } else {
                    navigate("/dashboard");
                  }
                }}
                style={{
                  cursor: "pointer",
                  color: "#007bff",
                  fontWeight: 500,
                }}
              >
                ← Back
              </span>

              {breadcrumbTitles.map((item, idx) => (
                <React.Fragment key={item.path}>
                  {idx > 0 && <span style={{ color: "#999" }}>/</span>}
                  <span
                    style={{
                      fontWeight:
                        idx === breadcrumbTitles.length - 1 ? "bold" : 500,
                      color:
                        idx === breadcrumbTitles.length - 1
                          ? "#000"
                          : "#007bff",
                      cursor:
                        idx !== breadcrumbTitles.length - 1
                          ? "pointer"
                          : "default",
                    }}
                    onClick={() =>
                      idx !== breadcrumbTitles.length - 1 && navigate(item.path)
                    }
                  >
                    {item.title}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )} */}

          <Outlet context={{ user }} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
