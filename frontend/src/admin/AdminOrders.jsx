import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrders.css";

const API_URL = import.meta.env.VITE_API_URL;

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState("");

  // Shipping form
  const [shippingOrder, setShippingOrder] = useState(null);
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

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

  // Normal status change
  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === "Shipped") {
      const order = orders.find(
        (item) => item._id === orderId
      );

      setShippingOrder(order);

      setCourierName(order?.courierName || "");
      setTrackingNumber(order?.trackingNumber || "");
      setTrackingUrl(order?.trackingUrl || "");

      return;
    }

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

  // Confirm shipment
  const handleConfirmShipment = async () => {
    if (!shippingOrder) return;

    if (!courierName.trim()) {
      alert("Please enter courier name.");
      return;
    }

    if (!trackingNumber.trim()) {
      alert("Please enter tracking number.");
      return;
    }

    try {
      setUpdatingOrder(shippingOrder._id);

      const token = localStorage.getItem("adminToken");

      const response = await axios.put(
        `${API_URL}/api/orders/admin/${shippingOrder._id}/status`,
        {
          orderStatus: "Shipped",
          courierName: courierName.trim(),
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setShippingOrder(null);
        setCourierName("");
        setTrackingNumber("");
        setTrackingUrl("");

        await fetchOrders();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to mark order as shipped."
      );
    } finally {
      setUpdatingOrder("");
    }
  };

  // Close shipping form
  const closeShippingForm = () => {
    if (updatingOrder) return;

    setShippingOrder(null);
    setCourierName("");
    setTrackingNumber("");
    setTrackingUrl("");
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
            <div
              className="admin-order-card"
              key={order._id}
            >
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
                    {new Date(
                      order.createdAt
                    ).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="admin-order-customer">
                  <span>CUSTOMER</span>

                  <p>
                    {order.customer?.name ||
                      "Unknown"}
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
                        Product Code:{" "}
                        {item.productCode || "N/A"}
                      </p>

                      <p>
                        ₹
                        {item.price.toLocaleString(
                          "en-IN"
                        )}
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
                    {order.customer?.email ||
                      "Unknown"}
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
                    {order.address},{" "}
                    {order.city},{" "}
                    {order.state} -{" "}
                    {order.pinCode}
                  </p>
                </div>
              </div>

              {/* SHIPPING / TRACKING DETAILS */}
              {order.orderStatus === "Shipped" ||
              order.orderStatus === "Delivered" ? (
                <div className="admin-order-shipping">
                  <div>
                    <span>COURIER</span>
                    <p>
                      {order.courierName ||
                        "Not available"}
                    </p>
                  </div>

                  <div>
                    <span>TRACKING NUMBER</span>
                    <p>
                      {order.trackingNumber ||
                        "Not available"}
                    </p>
                  </div>

                  {order.trackingUrl && (
                    <div>
                      <span>TRACKING LINK</span>

                      <p>
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Track Shipment
                        </a>
                      </p>
                    </div>
                  )}

                  {order.shippedAt && (
                    <div>
                      <span>SHIPPED ON</span>

                      <p>
                        {new Date(
                          order.shippedAt
                        ).toLocaleString(
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
                  )}

                  {order.deliveredAt && (
                    <div>
                      <span>DELIVERED ON</span>

                      <p>
                        {new Date(
                          order.deliveredAt
                        ).toLocaleString(
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
                  )}
                </div>
              ) : null}

              {/* BOTTOM */}
              <div className="admin-order-bottom">
                <div className="admin-order-total">
                  <div className="admin-order-price-row">
                    <span>SUBTOTAL</span>

                    <span>
                      ₹
                      {(
                        order.subtotal ??
                        order.totalAmount
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {order.couponCode &&
                    order.discountAmount > 0 && (
                      <div className="admin-order-price-row discount">
                        <span>
                          DISCOUNT (
                          {order.couponCode})
                        </span>

                        <span>
                          -₹
                          {order.discountAmount.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    )}

                  <div className="admin-order-price-row">
                    <span>SHIPPING</span>

                    <span>
                      {(order.shippingAmount ??
                        0) === 0
                        ? "FREE"
                        : `₹${(
                            order.shippingAmount ??
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}`}
                    </span>
                  </div>

                  <div className="admin-order-grand-total">
                    <span>ORDER TOTAL</span>

                    <strong>
                      ₹
                      {order.totalAmount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                </div>

                {/* STATUS */}
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
                      updatingOrder ===
                        order._id ||
                      order.orderStatus ===
                        "Cancelled" ||
                      order.orderStatus ===
                        "Delivered"
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

                  {updatingOrder ===
                    order._id && (
                    <span>Updating...</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHIPPING MODAL */}
      {shippingOrder && (
        <div className="admin-shipping-overlay">
          <div className="admin-shipping-modal">
            <div className="admin-shipping-modal-header">
              <div>
                <span>SHIP ORDER</span>

                <h2>
                  #
                  {shippingOrder._id
                    .slice(-6)
                    .toUpperCase()}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeShippingForm}
                disabled={!!updatingOrder}
              >
                ×
              </button>
            </div>

            <div className="admin-shipping-form">
              <label>
                Courier Name
                <input
                  type="text"
                  placeholder="e.g. Delhivery"
                  value={courierName}
                  onChange={(e) =>
                    setCourierName(
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Tracking Number
                <input
                  type="text"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) =>
                    setTrackingNumber(
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Tracking URL
                <span className="optional">
                  Optional
                </span>

                <input
                  type="url"
                  placeholder="https://..."
                  value={trackingUrl}
                  onChange={(e) =>
                    setTrackingUrl(
                      e.target.value
                    )
                  }
                />
              </label>

              <div className="admin-shipping-actions">
                <button
                  type="button"
                  className="admin-shipping-cancel"
                  onClick={closeShippingForm}
                  disabled={!!updatingOrder}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="admin-shipping-confirm"
                  onClick={
                    handleConfirmShipment
                  }
                  disabled={!!updatingOrder}
                >
                  {updatingOrder
                    ? "Updating..."
                    : "CONFIRM SHIPMENT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminOrders;