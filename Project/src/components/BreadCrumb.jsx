// components/BreadcrumbBar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const pathToTitle = {
    "/dashboard":"Dashboard",
  "/dashboard/home": "Dashboard",
  "/dashboard/users": "Users",
  "/dashboard/category": "Category",
  "/dashboard/sub_category": " Sub Category",
  "/dashboard/services": "Services",
  "/dashboard/attributes": "Attributes",
  "/dashboard/serviceProvider": "Service Provider",
  "/dashboard/role": "Role ",
  "/dashboard/sub_admin": "Sub Admin ",



};

export default function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbPaths = pathSegments.map(
    (_, index) => "/" + pathSegments.slice(0, index + 1).join("/")
  );

  const breadcrumbTitles = breadcrumbPaths
    .filter((path) => pathToTitle[path] && path !== "/dashboard")
    .map((path) => ({
      path,
      title: pathToTitle[path],
    }));

  const showBreadcrumb = location.pathname !== "/dashboard/home";

  if (!showBreadcrumb) return null;

  return (
    <div
      style={{
        padding: "10px 20px",
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        flexWrap: "wrap",
        margin: "6px 0px 6px 0px",
        borderRadius: "5px",
      }}
    >
      <span
        onClick={() => {
          const secondLast = breadcrumbTitles[breadcrumbTitles.length - 2];
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
              fontWeight: idx === breadcrumbTitles.length - 1 ? "bold" : 500,
              color: idx === breadcrumbTitles.length - 1 ? "#000" : "#007bff",
              cursor:
                idx !== breadcrumbTitles.length - 1 ? "pointer" : "default",
              textDecoration:
                idx === 0 ? "underline" : "none",
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
  );
}
