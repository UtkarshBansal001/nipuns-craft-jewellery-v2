
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./CustomerHome.css";

function CustomerAccountEdit() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedCustomer = localStorage.getItem("customer");

    if (!savedCustomer) {
      navigate("/customer/login");
      return;
    }

    try {
      const customerData = JSON.parse(savedCustomer);

      setCustomer(customerData);
      setName(customerData.name || "");
      setPhone(customerData.phone || "");
    } catch (error) {
      console.error("Failed to load customer:", error);

      localStorage.removeItem("customer");
      localStorage.removeItem("customerToken");

      navigate("/customer/login");
    }
  }, [navigate]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("customerToken");

      const response = await axios.put(
        "http://localhost:5000/api/customer-auth/profile",
        {
          name: name.trim(),
          phone: phone.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        localStorage.setItem(
          "customer",
          JSON.stringify(response.data.customer)
        );

        setCustomer(response.data.customer);

        alert("Profile updated successfully.");

        navigate("/customer/account");
      }
    } catch (error) {
      console.error("Profile update error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customer");

        navigate("/customer/login");
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!customer) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="customer-account-edit-page">

        <div className="customer-account-edit-header">
          <p>PERSONAL INFORMATION</p>

          <h1>
            Edit
            <span>Profile</span>
          </h1>

          <p className="customer-account-edit-description">
            Keep your account information up to date.
          </p>
        </div>

        <section className="customer-account-edit-card">

          <div className="customer-account-edit-card-header">
            <p>ACCOUNT DETAILS</p>
            <span>
              Update the information associated with your account.
            </span>
          </div>

          <div className="customer-account-edit-form">

            <label>
              <span>FULL NAME</span>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </label>

            <label>
              <span>EMAIL ADDRESS</span>

              <input
                type="email"
                value={customer.email}
                disabled
              />

              <small>
                Email address cannot be changed.
              </small>
            </label>

            <label>
              <span>PHONE NUMBER</span>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </label>

          </div>

          <div className="customer-account-edit-actions">

            <button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/customer/account")}
              disabled={saving}
            >
              CANCEL
            </button>

          </div>

        </section>

        <button
          type="button"
          className="customer-account-edit-back"
          onClick={() => navigate("/customer/account")}
        >
          ← BACK TO ACCOUNT
        </button>

      </main>
    </>
  );
}

export default CustomerAccountEdit;

