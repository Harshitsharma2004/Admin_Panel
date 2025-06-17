import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const handleChangePassword = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        navigate("/dashboard");
      } else {
        toast.error(data.error || "Password update failed");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      {/* Current Password */}
      <div className="password-wrapper">
        <input
          className="change-password-input"
          type={showCurrent ? "text" : "password"}
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowCurrent(!showCurrent)}
          aria-label={showCurrent ? "Hide password" : "Show password"}
        >
          {showCurrent ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* New Password */}
      <div className="password-wrapper">
        <input
          className="change-password-input"
          type={showNew ? "text" : "password"}
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          aria-label={showNew ? "Hide password" : "Show password"}
        >
          {showNew ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="password-wrapper">
        <input
          className="change-password-input"
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          aria-label={showConfirm ? "Hide password" : "Show password"}
        >
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <button
        className="change-password-button"
        onClick={handleChangePassword}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}

export default ChangePassword;
