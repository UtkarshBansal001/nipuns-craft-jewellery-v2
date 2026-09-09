import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCustomers.css";

const API_URL = "http://localhost:5000";

function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchCustomers(token);
  }, [navigate]);

  const fetchCustomers = async (token) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/customer-auth/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error(
        "Customers error:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
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

          <button
            className="nav-item"
            onClick={() => navigate("/admin/offers")}
          >
            <span>♢</span>
            Offers
          </button>

          <button className="nav-item active">
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
            <p className="header-label">CUSTOMER MANAGEMENT</p>
            <h1>Customers</h1>
          </div>

          <div className="customer-count">
            <span>Total Customers</span>
            <strong>
              {loading ? "—" : customers.length}
            </strong>
          </div>

        </header>

        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <p>REGISTERED CUSTOMERS</p>
              <h2>Customer List</h2>
            </div>
          </div>

          <div className="customers-list">

            {loading ? (

              <div className="customers-message">
                Loading customers...
              </div>

            ) : customers.length === 0 ? (

              <div className="customers-message">
                No customers registered yet.
              </div>

            ) : (

              customers.map((customer, index) => (

                <div
                  className="customer-row"
                  key={customer._id}
                >

                  <div className="customer-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="customer-avatar">
                    {customer.name
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>

                  <div className="customer-info">
                    <strong>
                      {customer.name}
                    </strong>

                    <span>
                      {customer.email}
                    </span>
                  </div>

                  <div className="customer-date">
                    <span>JOINED</span>

                    <p>
                      {customer.createdAt
                        ? new Date(
                            customer.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </p>
                  </div>

                </div>

              ))

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminCustomers;