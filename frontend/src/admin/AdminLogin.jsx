import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminLogin.css";

const API_URL = "http://localhost:5000";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        formData
      );

      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem(
          "adminData",
          JSON.stringify(response.data.admin)
        );

        navigate("/admin");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-brand">
          <div className="admin-logo">
<img src="/Nipun logo2.png" alt="Nipun's Craft Jewellery" />

</div>

          <h1>Nipun's Craft</h1>
          <p>JEWELLERY</p>
        </div>

        <div className="admin-login-heading">
          <h2>Welcome Back</h2>
          <p>Sign in to manage your jewellery store</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter admin email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <div className="admin-login-footer">
          <span>Secure Admin Portal</span>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;