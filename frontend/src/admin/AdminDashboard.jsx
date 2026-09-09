import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000";

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
      setAdmin(JSON.parse(adminData));
    }

    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      const [productsResponse, ordersResponse, customersResponse] =
  await Promise.all([
    axios.get(`${API_URL}/api/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

    axios.get(`${API_URL}/api/orders/admin/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

    axios.get(`${API_URL}/api/customer-auth/admin/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ]);

      // Products
      if (productsResponse.data.success) {
        setProductCount(productsResponse.data.count);
      }

      // Orders
      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.orders;

        setOrderCount(orders.length);

        // Latest 5 orders
        setRecentOrders(orders.slice(0, 5));

        // Revenue excluding cancelled orders
        const revenue = orders
          .filter((order) => order.orderStatus !== "Cancelled")
          .reduce(
            (total, order) => total + (order.totalAmount || 0),
            0
          );

        setTotalRevenue(revenue);

        // Unique customers who have placed orders
        if (customersResponse.data.success) {
  setCustomerCount(customersResponse.data.count);
}
      }
    } catch (error) {
      console.error("Dashboard error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      setLoading(true);
      fetchDashboardData(token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");

    navigate("/admin/login");
  };

  return (
    <div className="admin-dashboard">

      {/* Sidebar */}
      <aside className="admin-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
<img src="\Nipun logo.png" alt="Nipun's Craft Jewellery" />

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

      {/* Main Content */}
      <main className="admin-main">

        {/* Header */}
        <header className="admin-header">

          <div>
            <p className="header-label">ADMIN PANEL</p>
            <h1>Dashboard</h1>
          </div>

          <div className="header-actions">

            <button
              className="dashboard-refresh-button"
              onClick={handleRefresh}
            >
              ↻ Refresh
            </button>

            <div className="admin-profile">

              <div className="profile-avatar">
<img src="/Nipun logo2.png" alt="Nipun's Craft Jewellery" />

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

        {/* Welcome */}
        <section className="welcome-card">

          <div>
            <p className="welcome-small">
              Welcome back
            </p>

            <h2 className="welcome-title">Manage your jewellery store</h2>

            <p>
              Keep your products, orders and offers
              organized from one place.
            </p>
          </div>

          <div className="welcome-icon">
            ◇
          </div>

        </section>

        {/* Stats */}
        <section className="stats-grid">

          {/* Products */}
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

          {/* Orders */}
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

          {/* Revenue */}
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

          {/* Customers */}
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

        {/* Recent Orders */}
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
                    className={`recent-order-status ${order.orderStatus
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {order.orderStatus}
                  </span>

                </div>

              ))

            )}

          </div>

        </section>

        {/* Quick Actions */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <p>STORE MANAGEMENT</p>
              <h2>Quick Actions</h2>
            </div>

          </div>

          <div className="quick-actions">

            {/* Add Product */}
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

            {/* Manage Orders */}
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

            {/* Create Offer */}
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