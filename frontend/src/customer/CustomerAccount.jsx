
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./CustomerHome.css";

function CustomerAccount() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const savedCustomer = localStorage.getItem("customer");

    if (!savedCustomer) {
      navigate("/customer/login");
      return;
    }

    try {
      setCustomer(JSON.parse(savedCustomer));
    } catch (error) {
      console.error("Failed to load customer:", error);
      localStorage.removeItem("customer");
      localStorage.removeItem("customerToken");
      navigate("/customer/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customer");

    navigate("/");
    window.location.reload();
  };

  if (!customer) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="customer-account-page">

        <div className="customer-account-header">
          <p>PERSONAL ACCOUNT</p>
          <h1>My Account</h1>
          <span>Manage your profile, orders and preferences.</span>
        </div>

        <div className="customer-account-layout">

          {/* Profile Card */}
          <section className="customer-account-profile">

            <div className="customer-account-profile-top">
              <div className="customer-account-avatar">
                {customer.name
                  ? customer.name.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div>
                <p className="customer-account-welcome">
                  WELCOME BACK
                </p>

                <h2>{customer.name}</h2>
              </div>
            </div>

            <div className="customer-account-details">

              <div className="customer-account-detail">
                <span>FULL NAME</span>
                <strong>{customer.name}</strong>
              </div>

              <div className="customer-account-detail">
                <span>EMAIL ADDRESS</span>
                <strong>{customer.email}</strong>
              </div>

              <div className="customer-account-detail">
                <span>PHONE NUMBER</span>
                <strong>{customer.phone || "Not added"}</strong>
              </div>

            </div>

            <Link
              to="/customer/account/edit"
              className="customer-account-edit"
            >
              EDIT PROFILE
            </Link>

          </section>

          {/* Account Navigation */}
          <section className="customer-account-menu">

            <p className="customer-account-menu-title">
              MY SHOPPING
            </p>

            <Link
              to="/customer/orders"
              className="customer-account-menu-item"
            >
              <div>
                <strong>My Orders</strong>
                <span>View and track your orders</span>
              </div>

              <span className="customer-account-arrow">→</span>
            </Link>

            <Link
              to="/wishlist"
              className="customer-account-menu-item"
            >
              <div>
                <strong>My Wishlist</strong>
                <span>View your saved jewellery</span>
              </div>

              <span className="customer-account-arrow">→</span>
            </Link>

            <Link
              to="/cart"
              className="customer-account-menu-item"
            >
              <div>
                <strong>My Cart</strong>
                <span>Continue your shopping</span>
              </div>

              <span className="customer-account-arrow">→</span>
            </Link>

            <div className="customer-account-divider"></div>

            <button
              onClick={handleLogout}
              className="customer-account-logout"
            >
              LOG OUT
            </button>

          </section>

        </div>

        <Link
          to="/"
          className="customer-account-home"
        >
          ← BACK TO HOME
        </Link>

      </main>
    </>
  );
}

export default CustomerAccount;

