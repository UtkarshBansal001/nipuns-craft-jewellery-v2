import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./CustomerHome.css";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerOrders() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const toggleOrderDetails = (orderId) => {
  setExpandedOrder(
    expandedOrder === orderId ? null : orderId
  );
};

  const handleReorder = async (order) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/products`
    );

    if (!response.data.success) {
      alert("Unable to check product stock.");
      return;
    }

    const latestProducts = response.data.products;

    const existingCart = JSON.parse(
      localStorage.getItem("nipunsCart") || "[]"
    );

    const updatedCart = [...existingCart];
    let skippedProducts = [];

    for (const item of order.items) {
      const latestProduct = latestProducts.find(
        (product) => product._id === item.product
      );

      if (!latestProduct || latestProduct.stock <= 0) {
  skippedProducts.push(item.name);
  continue;
}

      const existingItem = updatedCart.find(
        (cartItem) => cartItem._id === latestProduct._id
      );

      const reorderQuantity = Math.min(
        item.quantity,
        latestProduct.stock
      );

      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + reorderQuantity,
          latestProduct.stock
        );

        existingItem.stock = latestProduct.stock;
        existingItem.price = latestProduct.price;
        existingItem.salePrice = latestProduct.salePrice;
        existingItem.name = latestProduct.name;
        existingItem.images = latestProduct.images;
        existingItem.category = latestProduct.category;
      } else {
        updatedCart.push({
          _id: latestProduct._id,
          name: latestProduct.name,
          productCode: latestProduct.productCode,
          images: latestProduct.images,
          price: latestProduct.price,
          salePrice: latestProduct.salePrice,
          category: latestProduct.category,
          stock: latestProduct.stock,
          quantity: reorderQuantity,
        });
      }
    }

    localStorage.setItem(
      "nipunsCart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("cartUpdated"));

    if (skippedProducts.length > 0) {
  alert(
    `${skippedProducts.join(", ")} ${
      skippedProducts.length === 1
        ? "is"
        : "are"
    } currently unavailable.`
  );
}

    navigate("/cart");
  } catch (error) {
    console.error("Reorder error:", error);

    alert("Unable to reorder. Please try again.");
  }
};

 const fetchOrders = async (customerId, showLoading = false) => {
  try {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    const token = localStorage.getItem("customerToken");

    const response = await axios.get(
      `${API_URL}/api/orders/customer/${customerId}`,
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
    if (error.response?.status === 401) {
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customer");
      navigate("/customer/login");
      return;
    }

    setError(
      error.response?.data?.message ||
        "Failed to load your orders."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const savedCustomer = localStorage.getItem("customer");

    if (!savedCustomer) {
      navigate("/customer/login");
      return;
    }

    const customerData = JSON.parse(savedCustomer);
    setCustomer(customerData);

    fetchOrders(customerData.id, true);

const interval = setInterval(() => {
  fetchOrders(customerData.id);
}, 10000);

return () => clearInterval(interval);
  }, [navigate]);

  if (!customer) return null;

  return (
    <>
      <Navbar />

      <main className="customer-orders-page">
        <div className="customer-orders-heading">
  <div>
    <p>YOUR SHOPPING HISTORY</p>
    <h1>My Orders</h1>
  </div>

  <button
    className="customer-orders-refresh"
    onClick={() => fetchOrders(customer.id, true)}
    disabled={loading}
  >
    {loading ? "Refreshing..." : "REFRESH ORDERS"}
  </button>
</div>

        {loading && (
          <p className="customer-orders-message">
            Loading your orders...
          </p>
        )}

        {error && (
          <p className="customer-orders-error">
            {error}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="customer-orders-empty">
            <h2>No Orders Yet</h2>
            <p>
              You haven't placed any orders yet.
            </p>

            <Link to="/" className="customer-orders-shop-button">
              START SHOPPING
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="customer-orders-list">
            {orders.map((order) => (
              <div className="customer-order-card" key={order._id}>
                <div className="customer-order-top">
                  <div>
                    <span>ORDER ID</span>
                    <p>#{order._id.slice(-8).toUpperCase()}</p>
                  </div>

                  <div>
                    <span>DATE</span>
                    <p>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <span>STATUS</span>
                    <p
  className={`customer-order-status ${order.orderStatus
    .toLowerCase()
    .replace(" ", "-")}`}
>
  {order.orderStatus}
</p>
                  </div>
                </div>

                <div className="customer-order-actions">
  <button
    className="customer-order-details-button"
    onClick={() => toggleOrderDetails(order._id)}
  >
    {expandedOrder === order._id
      ? "HIDE DETAILS"
      : "VIEW DETAILS"}
  </button>
</div>

{expandedOrder === order._id && (
  <div className="customer-order-expanded-details">
    <div>
      <span>ORDER NUMBER</span>
      <p>#{order._id.slice(-8).toUpperCase()}</p>
    </div>

    <div>
      <span>ORDER DATE</span>
      <p>
        {new Date(order.createdAt).toLocaleString("en-IN")}
      </p>
    </div>

    <div>
      <span>PHONE</span>
      <p>{order.phone}</p>
    </div>

    <div>
      <span>DELIVERY ADDRESS</span>
      <p>
        {order.address}, {order.city}, {order.state} -{" "}
        {order.pinCode}
      </p>
    </div>

    <div>
      <span>PAYMENT METHOD</span>
      <p>
        {order.paymentMethod === "cod"
          ? "Cash on Delivery"
          : "Online Payment"}
      </p>
    </div>

    <div>
  <span>SUBTOTAL</span>
  <p>
    ₹{(order.subtotal ?? order.totalAmount).toLocaleString("en-IN")}
  </p>
</div>

<div>
  <span>SHIPPING</span>
  <p>
    {(order.shippingAmount ?? 0) === 0
      ? "FREE"
      : `₹${order.shippingAmount.toLocaleString("en-IN")}`}
  </p>
</div>

{order.couponCode && order.discountAmount > 0 && (
  <div>
    <span>DISCOUNT ({order.couponCode})</span>
    <p>
      -₹{order.discountAmount.toLocaleString("en-IN")}
    </p>
  </div>
)}

<div>
  <span>FINAL TOTAL</span>
  <p>
    ₹{order.totalAmount.toLocaleString("en-IN")}
  </p>
</div>
  </div>
)}

              {order.orderStatus !== "Cancelled" && (
  <div className="order-tracking">
    {["Pending", "Confirmed", "Shipped", "Delivered"].map(
      (status, index) => {
        const statusOrder = [
          "Pending",
          "Confirmed",
          "Shipped",
          "Delivered",
        ];

        const currentIndex =
          statusOrder.indexOf(order.orderStatus);

        const isCompleted = index <= currentIndex;

        return (
          <div
            className={`order-tracking-step ${
              isCompleted ? "completed" : ""
            }`}
            key={status}
          >
            <div className="order-tracking-dot">
              {isCompleted ? "✓" : index + 1}
            </div>

            <span>{status}</span>

            {index < 3 && (
              <div
                className={`order-tracking-line ${
                  index < currentIndex ? "completed" : ""
                }`}
              ></div>
            )}
          </div>
        );
      }
    )}
  </div>
)}

{order.orderStatus === "Cancelled" && (
  <div className="order-cancelled-message">
    <span>✕</span>
    <strong>Order Cancelled</strong>
  </div>
)}

                <div className="customer-order-items">
                  {order.items.map((item, index) => (
                    <Link
  to={`/product/${item.product}`}
  className="customer-order-item"
  key={`${order._id}-${index}`}
>
                      <div className="customer-order-item-image">
                       {item.image ? (
  <img
    src={item.image}
    alt={item.name}
  />
) : (
  <span className="customer-order-no-image">
    NO IMAGE
  </span>
)}
                      </div>

                      <div className="customer-order-item-info">
                        <h3>{item.name}</h3>
                        <p>Qty: {item.quantity}</p>
                        <p>
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="customer-order-bottom">
                  {order.orderStatus === "Delivered" && (
  <button
    className="customer-order-reorder"
   onClick={() => handleReorder(order)}
  >
    REORDER
  </button>
)}
                  <div>
  <span>DELIVERY ADDRESS</span>
  <p>
    {order.address}, {order.city}, {order.state} -{" "}
    {order.pinCode}
  </p>
</div>
                  <div>
                    <span>PAYMENT</span>
                    <p>
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>
                  </div>

                  <div className="customer-order-price-breakup">
  <span>SUBTOTAL</span>
  <p>
    ₹{(order.subtotal ?? order.totalAmount).toLocaleString("en-IN")}
  </p>

  {order.couponCode && order.discountAmount > 0 && (
    <>
      <span className="customer-order-discount-label">
        DISCOUNT ({order.couponCode})
      </span>
      <p className="customer-order-discount">
        -₹{order.discountAmount.toLocaleString("en-IN")}
      </p>
    </>
  )}

  <span>SHIPPING</span>
  <p>
    {(order.shippingAmount ?? 0) === 0
      ? "FREE"
      : `₹${order.shippingAmount.toLocaleString("en-IN")}`}
  </p>

  <div className="customer-order-final-total">
    <span>TOTAL</span>
    <p>
      ₹{order.totalAmount.toLocaleString("en-IN")}
    </p>
  </div>
</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/customer/account"
          className="customer-orders-back"
        >
          ← BACK TO ACCOUNT
        </Link>
      </main>
    </>
  );
}

export default CustomerOrders;