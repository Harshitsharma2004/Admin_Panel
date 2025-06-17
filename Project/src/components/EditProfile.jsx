import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContainer/AuthContainer";
import { toast } from "react-toastify";

export default function EditProfile() {
  const { fetchUserData, switchView, user } = useAuth();

  const [formData, setFormData] = useState({ name: "", email: "" });
  const [originalEmail, setOriginalEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [waitingForOtp, setWaitingForOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
      setOriginalEmail(user.email);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    if (formData.email === originalEmail) {
      // Only name changed
      try {
        const res = await fetch("http://localhost:5000/user/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: formData.name }),
        });

        if (res.ok) {
          toast.success("Profile Updated Successfully!")
          await fetchUserData();
          switchView("dashboard");
        } else {
          const data = await res.json();
          toast.error(data.error || "Update failed");
        }
      } catch (err) {
        console.error("Error updating user:", err);
      }
    } else {
      // Email changed → Send OTP
      setWaitingForOtp(true);
      try {
        const res = await fetch("http://localhost:5000/user/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: formData.name, email: formData.email }),
        });

        const data = await res.json();
        if (res.ok && data.emailChangePending) {
          toast.info("OTP sent to new email.")
          setOtpSent(true);
        } else {
          toast.error(data.error || "Failed to send OTP");
        }
      } catch (err) {
        console.error("Error sending OTP:", err);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const token = localStorage.getItem("authToken");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/user/update/verifyEmail", {
        method: "POST", // ✅ use POST here
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Email updated successfully!")
        await fetchUserData();
        switchView("dashboard");
      } else {
        toast.error(data.error || "OTP verification failed");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-profile-form">
      <h2>Edit Profile</h2>

      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Full Name"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />

      {!otpSent && <button type="submit">Save</button>}

      {waitingForOtp && otpSent && (
        <div>
          <p>An OTP has been sent to your new email.</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button type="button" onClick={handleVerifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify & Update Email"}
          </button>
        </div>
      )}
    </form>
  );
}
