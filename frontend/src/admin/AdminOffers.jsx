import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminOffers.css";

const API_URL = "http://localhost:5000";

function AdminOffers() {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderValue: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchOffers(token);
  }, [navigate]);

  const fetchOffers = async (token) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/offers/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOffers(response.data.offers);
      }
    } catch (error) {
      console.error(
        "Offers error:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("adminToken");

    try {
      const response = await axios.post(
        `${API_URL}/api/offers`,
        {
          ...formData,
          discountValue: Number(formData.discountValue),
          minimumOrderValue:
            Number(formData.minimumOrderValue) || 0,
          maxDiscount:
            Number(formData.maxDiscount) || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOffers((prev) => [
          response.data.offer,
          ...prev,
        ]);

        setFormData({
          title: "",
          code: "",
          discountType: "percentage",
          discountValue: "",
          minimumOrderValue: "",
          maxDiscount: "",
          startDate: "",
          endDate: "",
        });

        setShowForm(false);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create offer."
      );
    }
  };

  const handleDelete = async (offerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this offer?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("adminToken");

    try {
      const response = await axios.delete(
        `${API_URL}/api/offers/${offerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOffers((prev) =>
          prev.filter((offer) => offer._id !== offerId)
        );
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete offer."
      );
    }
  };

  return (
    <div className="admin-dashboard">

      {/* Sidebar */}
      <aside className="admin-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">NC</div>

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

          <button className="nav-item active">
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

          <button
            className="nav-item"
            onClick={() => navigate("/admin/settings")}
          >
            <span>⚙</span>
            Settings
          </button>

          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminData");
              navigate("/admin/login");
            }}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* Main */}
      <main className="admin-main">

        <header className="admin-header">

          <div>
            <p className="header-label">
              PROMOTIONS
            </p>
            <h1>Offers</h1>
          </div>

          <button
            className="create-offer-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "× Close" : "+ Create Offer"}
          </button>

        </header>

        {/* Create Offer Form */}
        {showForm && (
          <section className="offer-form-section">

            <div className="section-heading">
              <div>
                <p>NEW PROMOTION</p>
                <h2>Create Offer</h2>
              </div>
            </div>

            <form
              className="offer-form"
              onSubmit={handleCreateOffer}
            >

              <div className="form-group">
                <label>Offer Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Festive Sale"
                  required
                />
              </div>

              <div className="form-group">
                <label>Coupon Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. FESTIVE20"
                  required
                />
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Discount Type</label>

                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                  >
                    <option value="percentage">
                      Percentage (%)
                    </option>

                    <option value="fixed">
                      Fixed Amount (₹)
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Value</label>

                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    placeholder="20"
                    min="0"
                    required
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Minimum Order Value</label>

                  <input
                    type="number"
                    name="minimumOrderValue"
                    value={formData.minimumOrderValue}
                    onChange={handleChange}
                    placeholder="500"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Discount</label>

                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleChange}
                    placeholder="1000"
                    min="0"
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Start Date</label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>

                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <button
                type="submit"
                className="save-offer-button"
              >
                Create Offer
              </button>

            </form>

          </section>
        )}

        {/* Offers List */}
        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <p>ACTIVE & PAST PROMOTIONS</p>
              <h2>All Offers</h2>
            </div>
          </div>

          <div className="offers-list">

            {loading ? (

              <div className="offers-message">
                Loading offers...
              </div>

            ) : offers.length === 0 ? (

              <div className="offers-message">
                <strong>No offers created yet.</strong>
                <span>
                  Create your first discount offer.
                </span>
              </div>

            ) : (

              offers.map((offer) => (

                <div
                  className="offer-card"
                  key={offer._id}
                >

                  <div className="offer-main">

                    <div className="offer-code">
                      {offer.code}
                    </div>

                    <div>
                      <strong>{offer.title}</strong>

                      <span>
                        {offer.discountType === "percentage"
                          ? `${offer.discountValue}% OFF`
                          : `₹${offer.discountValue} OFF`}
                      </span>
                    </div>

                  </div>

                  <div className="offer-details">

                    <span>
                      Min. Order ₹
                      {offer.minimumOrderValue || 0}
                    </span>

                    <span>
                      {new Date(
                        offer.startDate
                      ).toLocaleDateString("en-IN")}{" "}
                      —{" "}
                      {new Date(
                        offer.endDate
                      ).toLocaleDateString("en-IN")}
                    </span>

                  </div>

                  <button
                    className="delete-offer-button"
                    onClick={() =>
                      handleDelete(offer._id)
                    }
                  >
                    Delete
                  </button>

                </div>

              ))

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminOffers;