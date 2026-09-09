


import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrders.css";

const API_URL = import.meta.env.VITE_API_URL;

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState("");
  
  const fetchOrders = async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("adminToken");

    const response = await axios.get(
      `${API_URL}/api/orders/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setOrders(response.data.orders);
    }
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to load orders."
    );
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
  fetchOrders();
}, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (
  newStatus === "Cancelled" &&
  !window.confirm(
    "Are you sure you want to cancel this order?"
  )
) {
  return;
}

    try {
      setUpdatingOrder(orderId);

      const token = localStorage.getItem("adminToken");

const response = await axios.put(
  `${API_URL}/api/orders/admin/${orderId}/status`,
  {
    orderStatus: newStatus,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

     if (response.data.success) {
  await fetchOrders();
}
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingOrder("");
    }
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
  <main className="admin-orders-page">
    <div className="admin-orders-header">
  <div>
    <p>NIPUN'S CRAFT JEWELLERY</p>
    <h1>Orders</h1>
  </div>

  <button
    className="admin-orders-refresh"
    onClick={fetchOrders}
    disabled={loading}
  >
    {loading ? "Refreshing..." : "REFRESH ORDERS"}
  </button>
</div>

    {orders.length === 0 ? (
      <div className="admin-orders-empty">
        No orders found.
      </div>
    ) : (
      <div className="admin-orders-list">
        {orders.map((order) => (
          <div className="admin-order-card" key={order._id}>

            {/* TOP */}
            <div className="admin-order-top">

              <div className="admin-order-id">
                <span>ORDER ID</span>
                <strong>
                  #{order._id.slice(-6).toUpperCase()}
                </strong>
              </div>

              <div className="admin-order-date">
                <span>DATE</span>
                <p>
                 {new Date(order.createdAt).toLocaleString(
  "en-IN",
  {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
)}
                </p>
              </div>

              <div className="admin-order-customer">
                <span>CUSTOMER</span>
                <p>
                  {order.customer?.name || "Unknown"}
                </p>
              </div>

            </div>

            {/* PRODUCTS */}
            <div className="admin-order-items">
              {order.items.map((item, index) => (
                <div
                  className="admin-order-item"
                  key={`${order._id}-${index}`}
                >
                  <div className="admin-order-item-image">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    )}
                  </div>

                  <div className="admin-order-item-info">
                    <h3>{item.name}</h3>

                    <p>
                      Quantity: {item.quantity}
                    </p>

                    <p>
  Product Code: {item.productCode || "N/A"}
</p>

                    <p>
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* DETAILS */}
            <div className="admin-order-details">

              <div className="admin-order-detail">
                <span>EMAIL</span>
                <p>
                  {order.customer?.email || "Unknown"}
                </p>
              </div>

              <div className="admin-order-detail">
                <span>PHONE</span>
                <p>{order.phone}</p>
              </div>

              <div className="admin-order-detail">
                <span>PAYMENT</span>
                <p>
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </p>
              </div>

              <div className="admin-order-detail">
                <span>DELIVERY ADDRESS</span>
                <p>
                  {order.address}, {order.city},{" "}
                  {order.state} - {order.pinCode}
                </p>
              </div>

            </div>

            {/* BOTTOM */}
            <div className="admin-order-bottom">

             <div className="admin-order-total">
  <div className="admin-order-price-row">
    <span>SUBTOTAL</span>
    <span>
      ₹{(order.subtotal ?? order.totalAmount).toLocaleString("en-IN")}
    </span>
  </div>

  {order.couponCode && order.discountAmount > 0 && (
    <div className="admin-order-price-row discount">
      <span>DISCOUNT ({order.couponCode})</span>
      <span>
        -₹{order.discountAmount.toLocaleString("en-IN")}
      </span>
    </div>
  )}

  <div className="admin-order-price-row">
    <span>SHIPPING</span>
    <span>
      {(order.shippingAmount ?? 0) === 0
  ? "FREE"
  : `₹${(order.shippingAmount ?? 0).toLocaleString("en-IN")}`}
    </span>
  </div>

  <div className="admin-order-grand-total">
    <span>ORDER TOTAL</span>
    <strong>
      ₹{order.totalAmount.toLocaleString("en-IN")}
    </strong>
  </div>
</div>

              <div className="admin-order-status">
                <span>STATUS</span>

                <select
  className={`admin-status-select ${order.orderStatus
    .toLowerCase()
    .replace(" ", "-")}`}
  value={order.orderStatus}
  onChange={(e) =>
    handleStatusChange(
      order._id,
      e.target.value
    )
  }
  disabled={
    updatingOrder === order._id ||
    order.orderStatus === "Cancelled"
  }
>
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Confirmed">
                    Confirmed
                  </option>

                  <option value="Shipped">
                    Shipped
                  </option>

                  <option value="Delivered">
                    Delivered
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>

                {updatingOrder === order._id && (
                  <span>Updating...</span>
                )}
              </div>

            </div>

          </div>
        ))}
      </div>
    )}
  </main>
);
}

export default AdminOrders;