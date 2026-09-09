import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./CustomerHome.css";

const API_URL = "http://localhost:5000";

function Cart() {
const [cartItems, setCartItems] = useState([]);
const navigate = useNavigate();

useEffect(() => {
const syncCartStock = async () => {
const savedCart = JSON.parse(
localStorage.getItem("nipunsCart") || "[]"
);

  if (savedCart.length === 0) {
    setCartItems([]);
    return;
  }

  try {
    const response = await axios.get(
      `${API_URL}/api/products`
    );

    if (response.data.success) {
      const latestProducts = response.data.products;

      const updatedCart = savedCart.map((cartItem) => {
        const latestProduct = latestProducts.find(
          (product) => product._id === cartItem._id
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
          salePrice: latestProduct.salePrice,
          name: latestProduct.name,
          images: latestProduct.images,
          category: latestProduct.category,
        };
      });

      setCartItems(updatedCart);

      localStorage.setItem(
        "nipunsCart",
        JSON.stringify(updatedCart)
      );
    }
  } catch (error) {
    console.error(
      "Cart stock sync error:",
      error
    );

    setCartItems(savedCart);
  }
};

syncCartStock();

}, []);

const updateCart = (updatedCart) => {
setCartItems(updatedCart);

localStorage.setItem(
  "nipunsCart",
  JSON.stringify(updatedCart)
);

window.dispatchEvent(
  new Event("cartUpdated")
);

};

const increaseQuantity = (id) => {
const updatedCart = cartItems.map((item) =>
item._id === id
? {
...item,
quantity: Math.min(
item.quantity + 1,
item.stock
),
}
: item
);

updateCart(updatedCart);

};

const decreaseQuantity = (id) => {
const updatedCart = cartItems
.map((item) =>
item._id === id
? {
...item,
quantity: item.quantity - 1,
}
: item
)
.filter((item) => item.quantity > 0);

updateCart(updatedCart);

};

const removeItem = (id) => {
const updatedCart = cartItems.filter(
(item) => item._id !== id
);

updateCart(updatedCart);

};

const getItemPrice = (item) => {
return item.salePrice || item.price;
};

const subtotal = cartItems.reduce(
(total, item) =>
total + getItemPrice(item) * item.quantity,
0
);

const shipping = subtotal >= 999 ? 0 : 49;

const total = subtotal + shipping;

const outOfStockCount = cartItems.filter(
(item) => item.stock <= 0
).length;

const handleCheckout = () => {
const availableItems = cartItems.filter(
(item) => item.stock > 0
);

if (availableItems.length === 0) {
  return;
}

updateCart(availableItems);
navigate("/checkout");

};

return (
<>
<Navbar />

  <main className="cart-page">

    <section className="cart-heading">

      <p>YOUR SELECTION</p>

      <h1>
        Shopping
        <span>Cart</span>
      </h1>

      <div className="cart-heading-line"></div>

      <span className="cart-count">
        {cartItems.length}{" "}
        {cartItems.length === 1 ? "PIECE" : "PIECES"} IN CART
      </span>

    </section>

    {cartItems.length === 0 ? (

      <section className="empty-cart">

        <div className="empty-cart-icon">
          🛍
        </div>

        <p className="empty-cart-label">
          YOUR COLLECTION
        </p>

        <h2>Your Cart is Empty</h2>

        <p>
          Discover something beautiful from our
          collection and add your favourite pieces
          to your cart.
        </p>

        <Link
          to="/"
          className="continue-shopping"
        >
          EXPLORE COLLECTION
        </Link>

      </section>

    ) : (

      <div className="cart-container">

        <section className="cart-items">

          {outOfStockCount > 0 && (
            <div className="cart-stock-warning">
              <strong>
                {outOfStockCount}{" "}
                {outOfStockCount === 1
                  ? "ITEM"
                  : "ITEMS"}{" "}
                UNAVAILABLE
              </strong>

              <span>
                Out-of-stock pieces will be removed
                before checkout.
              </span>
            </div>
          )}

          {cartItems.map((item) => (

            <article
              className={`cart-item ${
                item.stock <= 0
                  ? "cart-item-unavailable"
                  : ""
              }`}
              key={item._id}
            >

              <Link
                to={`/product/${item._id}`}
                className="cart-item-image"
              >

                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                  />
                ) : (
                  <div className="cart-no-image">
                    NO IMAGE
                  </div>
                )}

              </Link>

              <div className="cart-item-info">

                {item.stock <= 0 && (
                  <span className="cart-out-of-stock">
                    OUT OF STOCK
                  </span>
                )}

                <p className="cart-item-category">
                  {item.category}
                </p>

                <h3>{item.name}</h3>

                <div className="cart-item-price">

                  <span>
                    ₹
                    {getItemPrice(item).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  {item.salePrice && (
                    <del>
                      ₹
                      {item.price.toLocaleString(
                        "en-IN"
                      )}
                    </del>
                  )}

                </div>

                <div className="cart-item-bottom">

                  <div className="quantity-control">

                    <button
                      onClick={() =>
                        decreaseQuantity(item._id)
                      }
                      disabled={item.stock <= 0}
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(item._id)
                      }
                      disabled={
                        item.stock <= 0 ||
                        item.quantity >= item.stock
                      }
                    >
                      +
                    </button>

                  </div>

                  <button
                    className="remove-cart-item"
                    onClick={() =>
                      removeItem(item._id)
                    }
                  >
                    REMOVE
                  </button>

                </div>

              </div>

              <div className="cart-item-total">

                <span>ITEM TOTAL</span>

                ₹
                {(
                  getItemPrice(item) *
                  item.quantity
                ).toLocaleString("en-IN")}

              </div>

            </article>

          ))}

        </section>

        <aside className="cart-summary">

          <p className="cart-summary-label">
            ORDER SUMMARY
          </p>

          <h2>
            Your
            <span>Order</span>
          </h2>

          <div className="cart-summary-line"></div>

          <div className="summary-row">
            <span>
              Subtotal
            </span>

            <span>
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="summary-row">

            <span>
              Shipping
            </span>

            <span>
              {shipping === 0
                ? "FREE"
                : `₹${shipping}`}
            </span>

          </div>

          {shipping > 0 && (
            <p className="free-shipping-note">
              Add ₹
              {(999 - subtotal).toLocaleString(
                "en-IN"
              )}{" "}
              more for FREE shipping
            </p>
          )}

          <div className="summary-total">

            <span>
              TOTAL
            </span>

            <strong>
              ₹{total.toLocaleString("en-IN")}
            </strong>

          </div>

          <button
            className="checkout-button"
            onClick={handleCheckout}
            disabled={outOfStockCount === cartItems.length}
          >
            {outOfStockCount > 0
              ? "REMOVE OUT OF STOCK & CHECKOUT"
              : "PROCEED TO CHECKOUT"}
          </button>

          <Link
            to="/"
            className="cart-continue-link"
          >
            ← CONTINUE SHOPPING
          </Link>

          <div className="cart-secure-note">

            <span>✓</span>

            <div>
              <strong>
                SECURE CHECKOUT
              </strong>

              <p>
                Your order is safe and secure.
              </p>
            </div>

          </div>

        </aside>

      </div>

    )}

  </main>
</>

);
}

export default Cart;