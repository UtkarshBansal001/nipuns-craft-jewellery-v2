
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/customer-auth/login`,
        {
          email,
          password,
        }
      );

      if (response.data.success) {
        localStorage.setItem(
          "customerToken",
          response.data.token
        );

        localStorage.setItem(
          "customer",
          JSON.stringify(response.data.customer)
        );

        navigate("/");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="customer-auth-page">

      <section className="customer-auth-box">

        <div className="customer-auth-header">

          <p className="customer-auth-subtitle">
            NIPUN'S CRAFT JEWELLERY
          </p>

          <h1>
            Welcome
            <span>Back</span>
          </h1>

          <p className="customer-auth-description">
            Sign in to continue shopping and manage your
            jewellery orders.
          </p>

        </div>

        {error && (
          <div className="customer-auth-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="customer-auth-form"
        >

          <div className="customer-auth-field">
            <label htmlFor="login-email">
              EMAIL ADDRESS
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="customer-auth-field">
            <label htmlFor="login-password">
              PASSWORD
            </label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="customer-auth-button"
            disabled={loading}
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>

        </form>

        <div className="customer-auth-divider">
          <span>OR</span>
        </div>

        <p className="customer-auth-switch">
          Don't have an account?
          <Link to="/customer/signup">
            CREATE ACCOUNT
          </Link>
        </p>

        <Link
          to="/"
          className="customer-auth-home"
        >
          ← BACK TO HOME
        </Link>

      </section>

    </main>
  );
}

export default CustomerLogin;

