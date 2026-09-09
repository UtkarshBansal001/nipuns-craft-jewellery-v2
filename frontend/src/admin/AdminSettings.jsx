import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminSettings.css";

const API_URL = "http://localhost:5000";

function AdminSettings() {
const navigate = useNavigate();

const [admin, setAdmin] = useState(null);
const [loading, setLoading] = useState(true);

const [passwordData, setPasswordData] = useState({
currentPassword: "",
newPassword: "",
confirmPassword: "",
});

const [passwordMessage, setPasswordMessage] = useState("");
const [passwordError, setPasswordError] = useState("");
const [changingPassword, setChangingPassword] = useState(false);

useEffect(() => {
const token = localStorage.getItem("adminToken");
const adminData = localStorage.getItem("adminData");

if (!token) {
  navigate("/admin/login");
  return;
}

if (adminData) {
  setAdmin(JSON.parse(adminData));
}

setLoading(false);

}, [navigate]);

const handlePasswordChange = (e) => {
const { name, value } = e.target;

setPasswordData((prev) => ({
  ...prev,
  [name]: value,
}));

};

const handleChangePassword = async (e) => {
e.preventDefault();

setPasswordMessage("");
setPasswordError("");

if (
  !passwordData.currentPassword ||
  !passwordData.newPassword ||
  !passwordData.confirmPassword
) {
  setPasswordError("Please fill all password fields.");
  return;
}

if (passwordData.newPassword.length < 6) {
  setPasswordError(
    "New password must be at least 6 characters."
  );
  return;
}

if (
  passwordData.newPassword !==
  passwordData.confirmPassword
) {
  setPasswordError(
    "New password and confirm password do not match."
  );
  return;
}

try {
  setChangingPassword(true);

  const token = localStorage.getItem("adminToken");

  const response = await axios.put(
    `${API_URL}/api/auth/change-password`,
    {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.data.success) {
    setPasswordMessage(
      "Password changed successfully."
    );

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }
} catch (error) {
  setPasswordError(
    error.response?.data?.message ||
      "Failed to change password."
  );
} finally {
  setChangingPassword(false);
}

};

const handleLogout = () => {
localStorage.removeItem("adminToken");
localStorage.removeItem("adminData");

navigate("/admin/login");

};

if (loading) {
return (
<main className="admin-settings-loading">
Loading settings...
</main>
);
}

return (
<div className="admin-dashboard">

  <aside className="admin-sidebar">

    <div className="sidebar-brand">
     <div className="sidebar-logo">
<img src="/Nipun logo.png" alt="Nipun's Craft Jewellery" />

</div>

      <div>
        <h2>Nipun's Craft</h2>
        <span>JEWELLERY</span>
      </div>
    </div>

    <nav className="sidebar-nav">

      <button
        className="nav-item"
        onClick={() => navigate("/admin")}
      >
        <span>▦</span>
        Dashboard
      </button>

      <button
        className="nav-item"
        onClick={() => navigate("/admin/products")}
      >
        <span>◇</span>
        Products
      </button>

      <button
        className="nav-item"
        onClick={() => navigate("/admin/orders")}
      >
        <span>▤</span>
        Orders
      </button>

      <button
        className="nav-item"
        onClick={() => navigate("/admin/offers")}
      >
        <span>♢</span>
        Offers
      </button>

      <button
        className="nav-item"
        onClick={() => navigate("/admin/customers")}
      >
        <span>♙</span>
        Customers
      </button>

    </nav>

    <div className="sidebar-bottom">

      <button className="nav-item active">
        <span>⚙</span>
        Settings
      </button>

      <button
        className="logout-button"
        onClick={handleLogout}
      >
        <span>↪</span>
        Logout
      </button>

    </div>

  </aside>

  <main className="admin-main">

    <header className="admin-header">

      <div>
        <p className="header-label">
          STORE CONFIGURATION
        </p>

        <h1>Settings</h1>
      </div>

      <button
        className="settings-back-button"
        onClick={() => navigate("/admin")}
      >
        ← DASHBOARD
      </button>

    </header>

    <section className="settings-grid">

      <div className="settings-card">

        <div className="settings-card-header">
          <p>ADMINISTRATOR</p>
          <h2>Profile</h2>
        </div>

        <div className="settings-profile">

          <div className="settings-avatar">
<img src="/Nipun logo2.png" alt="Nipun's Craft Jewellery" />

</div>

          <div>
            <strong>
              {admin?.name || "Admin"}
            </strong>

            <span>
              {admin?.email ||
                "Administrator"}
            </span>
          </div>

        </div>

        <div className="settings-info">

          <div>
            <span>NAME</span>
            <strong>
              {admin?.name || "Admin"}
            </strong>
          </div>

          <div>
            <span>EMAIL</span>
            <strong>
              {admin?.email || "—"}
            </strong>
          </div>

          <div>
            <span>ROLE</span>
            <strong>
              Store Administrator
            </strong>
          </div>

        </div>

      </div>

      <div className="settings-card">

        <div className="settings-card-header">
          <p>SECURITY</p>
          <h2>Change Password</h2>
        </div>

        {passwordMessage && (
          <div className="settings-success">
            {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div className="settings-error">
            {passwordError}
          </div>
        )}

        <form
          className="settings-form"
          onSubmit={handleChangePassword}
        >

          <div className="settings-field">

            <label>
              CURRENT PASSWORD
            </label>

            <input
              type="password"
              name="currentPassword"
              value={
                passwordData.currentPassword
              }
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              autoComplete="current-password"
            />

          </div>

          <div className="settings-field">

            <label>
              NEW PASSWORD
            </label>

            <input
              type="password"
              name="newPassword"
              value={
                passwordData.newPassword
              }
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              autoComplete="new-password"
            />

          </div>

          <div className="settings-field">

            <label>
              CONFIRM NEW PASSWORD
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={
                passwordData.confirmPassword
              }
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />

          </div>

          <button
            type="submit"
            className="change-password-button"
            disabled={changingPassword}
          >
            {changingPassword
              ? "CHANGING PASSWORD..."
              : "CHANGE PASSWORD"}
          </button>

        </form>

      </div>

      <div className="settings-card store-settings-card">

        <div className="settings-card-header">
          <p>STORE INFORMATION</p>
          <h2>Nipun's Craft Jewellery</h2>
        </div>

        <div className="store-info-grid">

          <div>
            <span>STORE</span>
            <strong>
              Nipun's Craft Jewellery
            </strong>
          </div>

          <div>
            <span>WEBSITE</span>
            <strong>
              Customer Store
            </strong>
          </div>

          <div>
            <span>PAYMENTS</span>
            <strong>
              COD & Online Payment
            </strong>
          </div>

          <div>
            <span>PLATFORM</span>
            <strong>
              React + Node.js
            </strong>
          </div>

        </div>

      </div>

    </section>

  </main>

</div>

);
}

export default AdminSettings;