
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerSignup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/customer-auth/signup`,
        {
          name,
          email,
          phone,
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
          "Signup failed. Please try again."
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
            Create
            <span>Account</span>
          </h1>

          <p className="customer-auth-description">
            Create your account to save your favourite pieces
            and manage your jewellery orders.
          </p>

        </div>

        {error && (
          <div className="customer-auth-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSignup}
          className="customer-auth-form"
        >

          <div className="customer-auth-field">
            <label htmlFor="signup-name">
              FULL NAME
            </label>

            <input
              id="signup-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="customer-auth-field">
            <label htmlFor="signup-email">
              EMAIL ADDRESS
            </label>

            <input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="customer-auth-field">
            <label htmlFor="signup-phone">
              PHONE NUMBER
            </label>

            <input
              id="signup-phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>

          <div className="customer-auth-field">
            <label htmlFor="signup-password">
              PASSWORD
            </label>

            <input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />

            <small>
              Password must be at least 6 characters.
            </small>
          </div>

          <button
            type="submit"
            className="customer-auth-button"
            disabled={loading}
          >
            {loading
              ? "CREATING ACCOUNT..."
              : "CREATE ACCOUNT"}
          </button>

        </form>

        <div className="customer-auth-divider">
          <span>OR</span>
        </div>

        <p className="customer-auth-switch">
          Already have an account?
          <Link to="/customer/login">
            LOGIN
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

export default CustomerSignup;

