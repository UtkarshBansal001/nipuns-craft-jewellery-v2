import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminData");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (error) {
        console.error("Admin data error:", error);
      }
    }

    fetchDashboardData(token);
  }, [navigate]);

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================
  const fetchDashboardData = async (token) => {
    setLoading(true);

    const authConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // ==========================================
    // PRODUCTS
    // ==========================================
    try {
      const productsResponse = await axios.get(
        `${API_URL}/api/products`,
        authConfig
      );

      console.log("PRODUCT API RESPONSE:", productsResponse.data);

      if (productsResponse.data.success) {
        const products = productsResponse.data.products || [];

        setProductCount(
          productsResponse.data.count ?? products.length
        );
      }
    } catch (error) {
      console.error(
        "Products API error:",
        error.response?.status,
        error.response?.data || error.message
      );

      setProductCount(0);
    }

    // ==========================================
    // ORDERS
    // ==========================================
    try {
      const ordersResponse = await axios.get(
        `${API_URL}/api/orders/admin/all`,
        authConfig
      );

      console.log("ORDERS API RESPONSE:", ordersResponse.data);

      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.orders || [];

        // Total orders
        setOrderCount(orders.length);

        // Latest 5 orders
        setRecentOrders(orders.slice(0, 5));

        // Revenue excluding cancelled orders
        const revenue = orders
          .filter(
            (order) => order.orderStatus !== "Cancelled"
          )
          .reduce(
            (total, order) =>
              total + (Number(order.totalAmount) || 0),
            0
          );

        setTotalRevenue(revenue);
      }
    } catch (error) {
      console.error(
        "Orders API error:",
        error.response?.status,
        error.response?.data || error.message
      );

      setOrderCount(0);
      setTotalRevenue(0);
      setRecentOrders([]);
    }

    // ==========================================
    // CUSTOMERS
    // ==========================================
    try {
      const customersResponse = await axios.get(
        `${API_URL}/api/customer-auth/admin/all`,
        authConfig
      );

      console.log(
        "CUSTOMERS API RESPONSE:",
        customersResponse.data
      );

      if (customersResponse.data.success) {
        const customers =
          customersResponse.data.customers || [];

        setCustomerCount(
          customersResponse.data.count ?? customers.length
        );
      }
    } catch (error) {
      console.error(
        "Customers API error:",
        error.response?.status,
        error.response?.data || error.message
      );

      setCustomerCount(0);
    }

    setLoading(false);
  };

  // ==========================================
  // REFRESH
  // ==========================================
  const handleRefresh = () => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      fetchDashboardData(token);
    } else {
      navigate("/admin/login");
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");

    navigate("/admin/login");
  };

  return (
    <div className="admin-dashboard">

      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <aside className="admin-sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            <img
              src="/Nipun logo.png"
              alt="Nipun's Craft Jewellery"
            />
          </div>

          <div>
            <h2>Nipun's Craft</h2>
            <span>JEWELLERY</span>
          </div>

        </div>

        <nav className="sidebar-nav">

          <button className="nav-item active">
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

          <button
            className="nav-item"
            onClick={() => navigate("/admin/settings")}
          >
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

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}
      <main className="admin-main">

        {/* ==========================================
            HEADER
        ========================================== */}
        <header className="admin-header">

          <div>
            <p className="header-label">ADMIN PANEL</p>
            <h1>Dashboard</h1>
          </div>

          <div className="header-actions">

            <button
              className="dashboard-refresh-button"
              onClick={handleRefresh}
              disabled={loading}
            >
              ↻ {loading ? "Refreshing..." : "Refresh"}
            </button>

            <div className="admin-profile">

              <div className="profile-avatar">
                <img
                  src="/Nipun logo2.png"
                  alt="Nipun's Craft Jewellery"
                />
              </div>

              <div>

                <strong>
                  {admin?.name || "Admin"}
                </strong>

                <span>
                  {admin?.email || "Administrator"}
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* ==========================================
            WELCOME CARD
        ========================================== */}
        <section className="welcome-card">

          <div>

            <p className="welcome-small">
              Welcome back
            </p>

            <h2 className="welcome-title">
              Manage your jewellery store
            </h2>

            <p>
              Keep your products, orders and offers
              organized from one place.
            </p>

          </div>

          <div className="welcome-icon">
            ◇
          </div>

        </section>

        {/* ==========================================
            STATS
        ========================================== */}
        <section className="stats-grid">

          {/* PRODUCTS */}
          <div className="stat-card">

            <div className="stat-icon">
              ◇
            </div>

            <div>

              <span>Total Products</span>

              <strong>
                {loading ? "—" : productCount}
              </strong>

            </div>

          </div>

          {/* ORDERS */}
          <div className="stat-card">

            <div className="stat-icon">
              ▤
            </div>

            <div>

              <span>Total Orders</span>

              <strong>
                {loading ? "—" : orderCount}
              </strong>

            </div>

          </div>

          {/* REVENUE */}
          <div className="stat-card">

            <div className="stat-icon">
              ₹
            </div>

            <div>

              <span>Total Revenue</span>

              <strong>
                ₹
                {loading
                  ? "—"
                  : totalRevenue.toLocaleString("en-IN")}
              </strong>

            </div>

          </div>

          {/* CUSTOMERS */}
          <div className="stat-card">

            <div className="stat-icon">
              ♙
            </div>

            <div>

              <span>Customers</span>

              <strong>
                {loading ? "—" : customerCount}
              </strong>

            </div>

          </div>

        </section>

        {/* ==========================================
            RECENT ORDERS
        ========================================== */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <p>RECENT ACTIVITY</p>

              <h2>Recent Orders</h2>

            </div>

            <button
              className="view-all-button"
              onClick={() => navigate("/admin/orders")}
            >
              View All →
            </button>

          </div>

          <div className="recent-orders-list">

            {loading ? (

              <p className="dashboard-loading">
                Loading recent orders...
              </p>

            ) : recentOrders.length === 0 ? (

              <div className="empty-orders">

                <div className="empty-orders-icon">
                  ▤
                </div>

                <strong>
                  No orders yet
                </strong>

                <span>
                  Customer orders will appear here.
                </span>

              </div>

            ) : (

              recentOrders.map((order) => (

                <div
                  className="recent-order-row"
                  key={order._id}
                >

                  <div>

                    <strong>
                      #{order._id.slice(-6).toUpperCase()}
                    </strong>

                    <span>
                      {order.customer?.name || "Customer"}
                    </span>

                  </div>

                  <div>

                    <span>
                      ₹
                      {(order.totalAmount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                  <span
                    className={`recent-order-status ${
                      order.orderStatus
                        ?.toLowerCase()
                        .replace(" ", "-") || ""
                    }`}
                  >
                    {order.orderStatus}
                  </span>

                </div>

              ))

            )}

          </div>

        </section>

        {/* ==========================================
            QUICK ACTIONS
        ========================================== */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <p>STORE MANAGEMENT</p>

              <h2>Quick Actions</h2>

            </div>

          </div>

          <div className="quick-actions">

            {/* ADD PRODUCT */}
            <button
              onClick={() => navigate("/admin/products")}
              className="action-card"
            >

              <div className="action-icon">
                +
              </div>

              <div>

                <strong>
                  Add Product
                </strong>

                <span>
                  Add a new jewellery product
                </span>

              </div>

              <b>
                →
              </b>

            </button>

            {/* MANAGE ORDERS */}
            <button
              onClick={() => navigate("/admin/orders")}
              className="action-card"
            >

              <div className="action-icon">
                ▤
              </div>

              <div>

                <strong>
                  Manage Orders
                </strong>

                <span>
                  View and update customer orders
                </span>

              </div>

              <b>
                →
              </b>

            </button>

            {/* CREATE OFFER */}
            <button
              onClick={() => navigate("/admin/offers")}
              className="action-card"
            >

              <div className="action-icon">
                %
              </div>

              <div>

                <strong>
                  Create Offer
                </strong>

                <span>
                  Create discounts and coupons
                </span>

              </div>

              <b>
                →
              </b>

            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;