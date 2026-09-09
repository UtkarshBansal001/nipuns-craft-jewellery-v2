import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import "./CustomerHome.css";

function OrderSuccess() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("lastOrder");

    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (error) {
        console.error("Failed to load saved order:", error);
      }
    }
  }, []);

  return (
    <>
      <Navbar />

      <main className="order-success-page">
        <div className="order-success-box">

          <div className="order-success-icon">
            ✓
          </div>

          <p className="order-success-subtitle">
            NIPUN'S CRAFT JEWELLERY
          </p>

          <h1>Order Placed Successfully</h1>

          <p className="order-success-message">
            Thank you for your order. Your order has been received
            and is currently being processed.
          </p>

          {order && (
            <>
              {/* ORDER DETAILS */}

              <div className="order-success-details">

  <div className="order-success-detail-row">
    <span>Order Number</span>
    <strong>
      #{order._id?.slice(-8).toUpperCase()}
    </strong>
  </div>

  <div className="order-success-detail-row">
    <span>Payment Method</span>
    <strong>
      {order.paymentMethod === "online"
        ? "Online Payment"
        : "Cash on Delivery"}
    </strong>
  </div>

  <div className="order-success-detail-row">
    <span>Payment Status</span>
    <strong>
      {order.paymentStatus || "Pending"}
    </strong>
  </div>

  <div className="order-success-detail-row">
    <span>Order Status</span>
    <strong>
      {order.orderStatus || "Pending"}
    </strong>
  </div>

  {/* Price Breakdown */}

  <div className="order-success-detail-row">
    <span>Subtotal</span>
    <strong>
      ₹{Number(order.subtotal || 0).toLocaleString("en-IN")}
    </strong>
  </div>

  <div className="order-success-detail-row">
    <span>Shipping</span>
    <strong>
      {Number(order.shippingAmount || 0) === 0
        ? "FREE"
        : `₹${Number(order.shippingAmount).toLocaleString("en-IN")}`}
    </strong>
  </div>

  {Number(order.discountAmount || 0) > 0 && (
    <div className="order-success-detail-row">
      <span>
        Discount
        {order.couponCode ? ` (${order.couponCode})` : ""}
      </span>

      <strong>
        -₹
        {Number(order.discountAmount).toLocaleString("en-IN")}
      </strong>
    </div>
  )}

  <div className="order-success-detail-row order-success-total">
    <span>Total Amount</span>

    <strong>
      ₹
      {Number(
        order.totalAmount || 0
      ).toLocaleString("en-IN")}
    </strong>
  </div>

</div>

              {/* ORDERED PRODUCTS */}

              {order.items?.length > 0 && (
                <div className="order-success-products">

                  <h2>Ordered Products</h2>

                  {order.items.map((item, index) => (
                    <div
                      className="order-success-product"
                      key={item.product?._id || index}
                    >

                      <div className="order-success-product-image">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <div className="order-success-no-image">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="order-success-product-info">

                        <h3>{item.name}</h3>

                        {item.productCode && (
                          <p>
                            Product Code: {item.productCode}
                          </p>
                        )}

                        <p>
                          Quantity: {item.quantity}
                        </p>

                        <strong>
                          ₹
                          {Number(
                            item.price * item.quantity
                          ).toLocaleString("en-IN")}
                        </strong>

                      </div>

                    </div>
                  ))}

                </div>
              )}

              {/* DELIVERY ADDRESS */}

              <div className="order-success-delivery">

                <h2>Delivery Address</h2>

                <p>
                  {order.address}
                </p>

                <p>
                  {order.city}, {order.state} - {order.pinCode}
                </p>

                <p>
                  Phone: {order.phone}
                </p>

              </div>
            </>
          )}

          <div className="order-success-actions">

            <Link
              to="/customer/orders"
              className="order-success-button"
            >
              VIEW MY ORDERS
            </Link>

            <Link
              to="/"
              className="order-success-secondary"
            >
              CONTINUE SHOPPING
            </Link>

          </div>

        </div>
      </main>
    </>
  );
}

export default OrderSuccess;