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

  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [resendTimer, setResendTimer] = useState(60);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================================
  // SIGNUP
  // ================================

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
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
        setOtpStep(true);

        setSuccess(
          "OTP has been sent to your email and phone number."
        );

        startResendTimer();
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

  // ================================
  // VERIFY OTP
  // ================================

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/customer-auth/verify-otp`,
        {
          email,
          otp,
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
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // RESEND TIMER
  // ================================

  const startResendTimer = () => {
    setResendTimer(60);

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  // ================================
  // RESEND OTP
  // ================================

  const handleResendOTP = async () => {
    if (resendTimer > 0 || resendLoading) {
      return;
    }

    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/customer-auth/resend-otp`,
        {
          email,
        }
      );

      if (response.data.success) {
        setOtp("");

        setSuccess(
          "A new OTP has been sent to your email and phone."
        );

        startResendTimer();
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to resend OTP. Please try again."
      );

      if (error.response?.data?.retryAfter) {
        setResendTimer(
          error.response.data.retryAfter
        );
      }
    } finally {
      setResendLoading(false);
    }
  };

  // ================================
  // OTP SCREEN
  // ================================

  if (otpStep) {
    return (
      <main className="customer-auth-page">
        <section className="customer-auth-box">

          <div className="customer-auth-header">

            <p className="customer-auth-subtitle">
              NIPUN'S CRAFT JEWELLERY
            </p>

            <h1>
              Verify
              <span>Account</span>
            </h1>

            <p className="customer-auth-description">
              Enter the 6-digit OTP sent to your email
              address and phone number.
            </p>

          </div>

          {error && (
            <div className="customer-auth-error">
              {error}
            </div>
          )}

          {success && (
            <div
              className="customer-auth-success"
            >
              {success}
            </div>
          )}

          <form
            onSubmit={handleVerifyOTP}
            className="customer-auth-form"
          >

            <div className="customer-auth-field">

              <label htmlFor="signup-otp">
                VERIFICATION OTP
              </label>

              <input
                id="signup-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                autoComplete="one-time-code"
                required
              />

              <small>
                OTP is valid for 5 minutes.
              </small>

            </div>

            <button
              type="submit"
              className="customer-auth-button"
              disabled={loading}
            >
              {loading
                ? "VERIFYING..."
                : "VERIFY OTP"}
            </button>

          </form>

          <div
            className="customer-auth-divider"
          >
            <span>OR</span>
          </div>

          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >

            {resendTimer > 0 ? (
              <p>
                Resend OTP in{" "}
                <strong>
                  {resendTimer}s
                </strong>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: "600",
                }}
              >
                {resendLoading
                  ? "SENDING..."
                  : "RESEND OTP"}
              </button>
            )}

          </div>

          <button
            type="button"
            onClick={() => {
              setOtpStep(false);
              setOtp("");
              setError("");
              setSuccess("");
            }}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            ← BACK TO SIGNUP
          </button>

        </section>
      </main>
    );
  }

  // ================================
  // SIGNUP SCREEN
  // ================================

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

        {success && (
          <div className="customer-auth-success">
            {success}
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
              onChange={(e) =>
                setName(e.target.value)
              }
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
              onChange={(e) =>
                setEmail(e.target.value)
              }
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
              onChange={(e) =>
                setPhone(e.target.value)
              }
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
              onChange={(e) =>
                setPassword(e.target.value)
              }
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
              ? "SENDING OTP..."
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