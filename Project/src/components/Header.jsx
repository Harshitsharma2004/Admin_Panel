import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContainer/AuthContainer";
import logo from "../assets/logo.png";

function UserInitialAvatar({ name, onClick }) {
  if (!name) return null;
  const initial = name.charAt(0).toUpperCase();
  const style = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "18px",
    userSelect: "none",
    cursor: "pointer",
    marginRight: "10px",
  };
  return <div style={style} onClick={onClick}>{initial}</div>;
}

export default function Header() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        // padding: "10px 20px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div style={{background:"#012e41",marginLeft:"-20px",width:"290px",height:"63px",display:"flex",justifyContent:"center",alignItems:"center",borderBottom:"2px solid white",borderTopRightRadius:"40px"}}>
        <img src={logo} alt="Logo" className="header-logo" style={{ height: "45px",border:"2px solid white",padding:"5px",borderRadius:"7px",background:"#86d4f5" }} />
      </div>

      <div style={{ position: "relative", marginRight: "40px" }} ref={menuRef} onClick={toggleMenu}>
        <div
          className="user"
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        >
          <UserInitialAvatar name={user?.name} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p style={{ margin: 0, fontWeight: 500 }}>Welcome</p>
            <p style={{ margin: 0 }}>{user?.name || "Guest"}</p>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              right: 0,
              backgroundColor: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              borderRadius: "8px",
              width: "220px",
              zIndex: 999,
              overflow: "hidden",
              padding: "10px",
            }}
          >
            <p
              style={{
                fontWeight: "bold",
                backgroundColor: "#007bff",
                color: "white",
                padding: "12px 16px",
                margin: "0 0 10px 0",
                borderRadius: "6px",
                fontSize: "16px",
              }}
            >
              Quick Actions
            </p>

            <div
              style={menuCardStyle}
              onClick={() => navigate("/dashboard/edit_profile")}
            >
              📝 Profile
            </div>
            <div
              style={menuCardStyle}
              onClick={() => navigate("/dashboard/change_password")}
            >
              🔒 Change Password
            </div>
            <div
              style={{ ...menuCardStyle, color: "red" }}
              onClick={logout}
            >
              🚪 Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// 🔽 Move this OUTSIDE of JSX
const menuCardStyle = {
  padding: "10px 16px",
  backgroundColor: "#f5f5f5",
  marginBottom: "8px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "14px",
  transition: "background 0.2s",
};
