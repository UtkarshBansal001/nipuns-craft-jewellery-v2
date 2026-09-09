import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./CustomerHome.css";

const RAZORPAY_KEY_ID = "rzp_test_TZNc3IiHtwSsJp";

const loadRazorpay = () => {
return new Promise((resolve) => {
const existingScript = document.querySelector(
'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
);

if (existingScript) {
  resolve(true);
  return;
}

const script = document.createElement("script");

script.src =
  "https://checkout.razorpay.com/v1/checkout.js";

script.onload = () => {
  resolve(true);
};

script.onerror = () => {
  resolve(false);
};

document.body.appendChild(script);

});
};

function Checkout() {
const navigate = useNavigate();

const [cart, setCart] = useState([]);
const [customer, setCustomer] = useState(null);

const [formData, setFormData] = useState({
phone: "",
address: "",
city: "",
pinCode: "",
state: "",
paymentMethod: "cod",
});

const [error, setError] = useState("");

const [couponCode, setCouponCode] = useState("");
const [couponDiscount, setCouponDiscount] = useState(0);
const [appliedCoupon, setAppliedCoupon] = useState(null);
const [couponMessage, setCouponMessage] = useState("");

useEffect(() => {
const loadCheckoutData = async () => {
const savedCart = JSON.parse(
localStorage.getItem("nipunsCart") || "[]"
);

  const savedCustomer =
    localStorage.getItem("customer");

  if (savedCart.length === 0) {
    navigate("/cart");
    return;
  }

  if (!savedCustomer) {
    navigate("/customer/login");
    return;
  }

  try {
    const response = await axios.get(
      "http://localhost:5000/api/products"
    );

    if (response.data.success) {
      const latestProducts =
        response.data.products;

      const updatedCart = savedCart
        .map((cartItem) => {
          const latestProduct =
            latestProducts.find(
              (product) =>
                product._id === cartItem._id
            );

          if (!latestProduct) {
            return cartItem;
          }

          return {
            ...cartItem,
            stock: latestProduct.stock,
            quantity:
              latestProduct.stock > 0
                ? Math.min(
                    cartItem.quantity,
                    latestProduct.stock
                  )
                : cartItem.quantity,
            price: latestProduct.price,
            salePrice:
              latestProduct.salePrice,
            name: latestProduct.name,
            images:
              latestProduct.images,
            category:
              latestProduct.category,
            productCode:
              latestProduct.productCode,
          };
        })
        .filter(Boolean);

      setCart(updatedCart);

      localStorage.setItem(
        "nipunsCart",
        JSON.stringify(updatedCart)
      );
    } else {
      setCart(savedCart);
    }
  } catch (error) {
    console.error(
      "Checkout stock sync error:",
      error
    );

    setCart(savedCart);
  }

  setCustomer(JSON.parse(savedCustomer));
};

loadCheckoutData();

}, [navigate]);

const subtotal = cart.reduce(
(total, item) =>
total +
(item.salePrice || item.price) *
item.quantity,
0
);

const shipping = subtotal >= 999 ? 0 : 49;

const total = subtotal + shipping - couponDiscount;

const handleApplyCoupon = async () => {
setCouponMessage("");

if (!couponCode.trim()) {
  setCouponMessage(
    "Please enter a coupon code."
  );
  return;
}

try {
  const response = await axios.post(
    "http://localhost:5000/api/offers/apply",
    {
      code: couponCode.trim(),
      orderAmount: subtotal,
    }
  );

  if (response.data.success) {
    setCouponDiscount(
      response.data.discount
    );

    setAppliedCoupon(
      response.data.offer
    );

    setCouponMessage(
      `Coupon ${response.data.offer.code} applied successfully.`
    );
  }
} catch (error) {
  setCouponDiscount(0);
  setAppliedCoupon(null);

  setCouponMessage(
    error.response?.data?.message ||
      "Invalid coupon code."
  );
}

};

const validateCheckout = () => {
setError("");

if (cart.some((item) => item.stock <= 0)) {
  setError(
    "One or more products in your cart are out of stock. Please return to your cart."
  );
  return false;
}

if (
  cart.some(
    (item) => item.quantity > item.stock
  )
) {
  setError(
    "One or more products have insufficient stock. Please return to your cart and update the quantity."
  );
  return false;
}

if (!formData.phone.trim()) {
  setError(
    "Please enter your phone number."
  );
  return false;
}

if (
  !/^[0-9]{10}$/.test(
    formData.phone.trim()
  )
) {
  setError(
    "Please enter a valid 10-digit phone number."
  );
  return false;
}

if (!formData.address.trim()) {
  setError(
    "Please enter your address."
  );
  return false;
}

if (!formData.city.trim()) {
  setError(
    "Please enter your city."
  );
  return false;
}

if (
  !/^[0-9]{6}$/.test(
    formData.pinCode.trim()
  )
) {
  setError(
    "Please enter a valid 6-digit PIN code."
  );
  return false;
}

if (!formData.state.trim()) {
  setError(
    "Please enter your state."
  );
  return false;
}

return true;

};

const handlePlaceOrder = async () => {
if (!validateCheckout()) {
return;
}

try {
  const response = await axios.post(
    "http://localhost:5000/api/orders",
    {
      customer: customer.id,

      items: cart.map((item) => ({
        product: item._id,
        name: item.name,
        productCode:
          item.productCode || "",
        image:
          item.images?.[0] || "",
        price:
          item.salePrice ||
          item.price,
        quantity: item.quantity,
      })),

      phone: formData.phone.trim(),
      address:
        formData.address.trim(),
      city: formData.city.trim(),
      pinCode:
        formData.pinCode.trim(),
      state:
        formData.state.trim(),

      paymentMethod: "cod",

      couponCode:
        appliedCoupon?.code || "",
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          "customerToken"
        )}`,
      },
    }
  );

  if (response.data.success) {
    localStorage.setItem(
      "lastOrder",
      JSON.stringify(
        response.data.order
      )
    );

    localStorage.removeItem(
      "nipunsCart"
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    navigate("/order-success");
  }
} catch (error) {
  setError(
    error.response?.data?.message ||
      "Failed to place order. Please try again."
  );
}

};

useEffect(() => {
if (error) {
document
.getElementById("checkout-error")
?.scrollIntoView({
behavior: "smooth",
block: "center",
});
}
}, [error]);

const handleOnlinePayment = async () => {
if (!validateCheckout()) {
return;
}

try {
  const loaded = await loadRazorpay();

  if (!loaded) {
    alert(
      "Razorpay failed to load."
    );
    return;
  }

 const response = await axios.post(
"http://localhost:5000/api/payment/create-order",
{ items: cart.map((item) => ({ product: item._id, quantity: item.quantity, })), couponCode: appliedCoupon?.code || "", },
{
headers: {
Authorization: `Bearer ${localStorage.getItem( "customerToken" )}`,
},
}
);

  if (!response.data.success) {
    alert(
      "Unable to create payment order."
    );
    return;
  }

  const order = response.data.order;

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "Nipun's Craft Jewellery",
    description: "Jewellery Order",
    order_id: order.id,

    handler: async function (
      paymentResponse
    ) {
      try {
        const verifyResponse =
          await axios.post(
"http://localhost:5000/api/payment/verify-payment",
{
razorpay_order_id:
paymentResponse.razorpay_order_id,

razorpay_payment_id:
  paymentResponse.razorpay_payment_id,

razorpay_signature:
  paymentResponse.razorpay_signature,



},
{
headers: {
Authorization: `Bearer ${localStorage.getItem( "customerToken" )}`,
},
}
);
        if (
          verifyResponse.data.success
        ) {
          const orderResponse =
            await axios.post(
              "http://localhost:5000/api/orders",
              {
                customer:
                  customer.id,

                items: cart.map(
                  (item) => ({
                    product:
                      item._id,
                    name:
                      item.name,
                    productCode:
                      item.productCode ||
                      "",
                    image:
                      item.images?.[0] ||
                      "",
                    price:
                      item.salePrice ||
                      item.price,
                    quantity:
                      item.quantity,
                  })
                ),

                phone:
                  formData.phone.trim(),
                address:
                  formData.address.trim(),
                city:
                  formData.city.trim(),
                pinCode:
                  formData.pinCode.trim(),
                state:
                  formData.state.trim(),

                paymentMethod:
                  "online",

                razorpayOrderId:
                  paymentResponse.razorpay_order_id,

                razorpayPaymentId:
                  paymentResponse.razorpay_payment_id,

                couponCode:
                  appliedCoupon?.code ||
                  "",
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "customerToken"
                  )}`,
                },
              }
            );

          if (
            orderResponse.data
              .success
          ) {
            localStorage.setItem(
              "lastOrder",
              JSON.stringify(
                orderResponse.data
                  .order
              )
            );

            localStorage.removeItem(
              "nipunsCart"
            );

            window.dispatchEvent(
              new Event(
                "cartUpdated"
              )
            );

            navigate(
              "/order-success"
            );
          }
        } else {
          alert(
            "Payment verification failed."
          );
        }
      } catch (error) {
        console.error(
          "Payment verification error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Payment verification failed."
        );
      }
    },

    theme: {
      color: "#222222",
    },
  };

  const razorpay =
    new window.Razorpay(
      options
    );

  razorpay.open();
} catch (error) {
  console.error(
    "Online payment error:",
    error
  );

  alert(
    error.response?.data?.message ||
      "Unable to start online payment."
  );
}

};

if (!customer) {
return null;
}

return (
<>
<Navbar />

  <main className="checkout-page">

    <section className="checkout-heading">

      <p>COMPLETE YOUR ORDER</p>

      <h1>
        Secure
        <span>Checkout</span>
      </h1>

      <div className="checkout-heading-line"></div>

      <span className="checkout-step-label">
        DELIVERY & PAYMENT
      </span>

    </section>

    <div className="checkout-layout">

      <section className="checkout-form-section">

        <div className="checkout-section-header">
          <p>01</p>

          <div>
            <span>YOUR DETAILS</span>
            <h2>Delivery Information</h2>
          </div>
        </div>

        {error && (
          <div
            className="checkout-error"
            id="checkout-error"
          >
            <strong>PLEASE CHECK</strong>
            <span>{error}</span>
          </div>
        )}

        <form>

          <div className="checkout-field">
            <label>FULL NAME</label>

            <input
              type="text"
              defaultValue={
                customer.name
              }
              placeholder="Full name"
              readOnly
            />
          </div>

          <div className="checkout-field">
            <label>EMAIL ADDRESS</label>

            <input
              type="email"
              defaultValue={
                customer.email
              }
              placeholder="Email"
              readOnly
            />
          </div>

          <div className="checkout-field">
            <label>PHONE NUMBER</label>

            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={
                formData.phone
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone:
                    e.target.value,
                })
              }
              maxLength={10}
            />
          </div>

          <div className="checkout-field">
            <label>DELIVERY ADDRESS</label>

            <textarea
              placeholder="House no., street, area"
              rows="4"
              value={
                formData.address
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address:
                    e.target.value,
                })
              }
            ></textarea>
          </div>

          <div className="checkout-two-columns">

            <div className="checkout-field">
              <label>CITY</label>

              <input
                type="text"
                placeholder="City"
                value={
                  formData.city
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    city:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="checkout-field">
              <label>PIN CODE</label>

              <input
                type="text"
                placeholder="6-digit PIN"
                value={
                  formData.pinCode
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pinCode:
                      e.target.value,
                  })
                }
                maxLength={6}
              />
            </div>

          </div>

          <div className="checkout-field">
            <label>STATE</label>

            <input
              type="text"
              placeholder="State"
              value={
                formData.state
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  state:
                    e.target.value,
                })
              }
            />
          </div>

          <div className="checkout-payment-section">

            <div className="checkout-section-header">
              <p>02</p>

              <div>
                <span>HOW WOULD YOU LIKE TO PAY?</span>
                <h2>Payment Method</h2>
              </div>
            </div>

            <div className="payment-options">

              <label
                className={`payment-option ${
                  formData.paymentMethod ===
                  "cod"
                    ? "active"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={
                    formData.paymentMethod ===
                    "cod"
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentMethod:
                        e.target.value,
                    })
                  }
                />

                <div className="payment-option-content">
                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order arrives
                  </span>
                </div>

                <span className="payment-check">
                  ✓
                </span>

              </label>

              <label
                className={`payment-option ${
                  formData.paymentMethod ===
                  "online"
                    ? "active"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={
                    formData.paymentMethod ===
                    "online"
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentMethod:
                        e.target.value,
                    })
                  }
                />

                <div className="payment-option-content">
                  <strong>
                    Online Payment
                  </strong>

                  <span>
                    Secure payment via Razorpay
                  </span>
                </div>

                <span className="payment-check">
                  ✓
                </span>

              </label>

            </div>

          </div>

          <button
            type="button"
            className="place-order-button"
            onClick={
              formData.paymentMethod ===
              "online"
                ? handleOnlinePayment
                : handlePlaceOrder
            }
          >
            {formData.paymentMethod ===
            "online"
              ? "PAY & PLACE ORDER"
              : "PLACE COD ORDER"}
          </button>

          <p className="checkout-terms">
            By placing your order, you agree
            to our order and delivery terms.
          </p>

        </form>

      </section>

      <aside className="checkout-summary">

        <div className="checkout-summary-header">

          <p>YOUR SELECTION</p>

          <h2>
            Order
            <span>Summary</span>
          </h2>

        </div>

        <div className="checkout-products">

          {cart.map((item) => (

            <div
              className="checkout-product"
              key={item._id}
            >

              <div className="checkout-product-image">

                {item.images?.[0] ? (
                  <img
                    src={
                      item.images[0]
                    }
                    alt={
                      item.name
                    }
                  />
                ) : (
                  <div className="checkout-no-image">
                    NO IMAGE
                  </div>
                )}

                <span>
                  {item.quantity}
                </span>

              </div>

              <div className="checkout-product-info">

                <p>
                  {item.category}
                </p>

                <h3>
                  {item.name}
                </h3>

                <span>
                  ₹
                  {(
                    (item.salePrice ||
                      item.price) *
                    item.quantity
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>

                {item.stock <= 0 && (
                  <small className="checkout-out-of-stock">
                    OUT OF STOCK
                  </small>
                )}

                {item.quantity >
                  item.stock &&
                  item.stock > 0 && (
                    <small className="checkout-out-of-stock">
                      ONLY{" "}
                      {item.stock}{" "}
                      AVAILABLE
                    </small>
                  )}

              </div>

            </div>

          ))}

        </div>

        <div className="coupon-section">

          <p className="coupon-label">
            HAVE A COUPON?
          </p>

          <div className="coupon-input-row">

            <input
              type="text"
              placeholder="ENTER CODE"
              value={
                couponCode
              }
              onChange={(e) => {
                setCouponCode(
                  e.target.value.toUpperCase()
                );

                setCouponMessage(
                  ""
                );
              }}
            />

            <button
              type="button"
              onClick={
                handleApplyCoupon
              }
            >
              APPLY
            </button>

          </div>

          {couponMessage && (
            <p
              className={
                appliedCoupon
                  ? "coupon-success"
                  : "coupon-error"
              }
            >
              {couponMessage}
            </p>
          )}

          {appliedCoupon && (
            <div className="coupon-discount-row">

              <span>
                DISCOUNT (
                {appliedCoupon.code}
                )
              </span>

              <span>
                -₹
                {couponDiscount.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>
          )}

        </div>

        <div className="checkout-price-breakup">

          <div className="checkout-total-row">
            <span>Subtotal</span>

            <span>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <div className="checkout-total-row">
            <span>Shipping</span>

            <span>
              {shipping === 0
                ? "FREE"
                : `₹${shipping}`}
            </span>
          </div>

          {couponDiscount > 0 && (
            <div className="checkout-total-row checkout-discount">
              <span>
                Discount
              </span>

              <span>
                -₹
                {couponDiscount.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          )}

          <div className="checkout-grand-total">

            <span>TOTAL</span>

            <strong>
              ₹
              {total.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>

        <div className="checkout-secure">

          <span>✓</span>

          <div>
            <strong>
              SECURE CHECKOUT
            </strong>

            <p>
              Your payment and order details
              are protected.
            </p>
          </div>

        </div>

        <Link
          to="/cart"
          className="back-to-cart"
        >
          ← BACK TO CART
        </Link>

      </aside>

    </div>

  </main>
</>

);
}

export default Checkout;