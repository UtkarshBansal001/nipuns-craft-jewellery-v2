import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./CustomerHome.css";

function Wishlist() {
const [wishlist, setWishlist] = useState([]);

useEffect(() => {
const savedWishlist = JSON.parse(
localStorage.getItem("nipunsWishlist") || "[]"
);

setWishlist(savedWishlist);
}, []);

const removeFromWishlist = (id) => {
const updatedWishlist = wishlist.filter(
(item) => item._id !== id
);

setWishlist(updatedWishlist);

localStorage.setItem(
  "nipunsWishlist",
  JSON.stringify(updatedWishlist)
);

window.dispatchEvent(new Event("wishlistUpdated"));
};

return (
<>
<Navbar />

  <main className="wishlist-page">

    <div className="wishlist-heading">
      <div>
        <p>YOUR SAVED PIECES</p>

        <h1>
          My
          <span>Wishlist</span>
        </h1>

        <div className="wishlist-heading-line"></div>

        <span className="wishlist-count">
          {wishlist.length}{" "}
          {wishlist.length === 1 ? "PIECE" : "PIECES"} SAVED
        </span>
      </div>
    </div>

    {wishlist.length === 0 ? (
      <div className="wishlist-empty">

        <div className="wishlist-empty-icon">
          ♡
        </div>

        <p className="wishlist-empty-label">
          YOUR COLLECTION
        </p>

        <h2>Your Wishlist is Empty</h2>

        <p>
          Save the jewellery pieces you love and
          come back to them whenever you're ready.
        </p>

        <Link
          to="/"
          className="wishlist-explore-button"
        >
          EXPLORE COLLECTION
        </Link>

      </div>
    ) : (
      <div className="wishlist-grid">

        {wishlist.map((product) => (
          <article
            className="wishlist-card"
            key={product._id}
          >

            <Link
              to={`/product/${product._id}`}
              className="wishlist-product-link"
            >

              <div className="wishlist-product-image">

                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                  />
                ) : (
                  <div className="wishlist-no-image">
                    NO IMAGE
                  </div>
                )}

              </div>

              <div className="wishlist-product-info">

                <p className="wishlist-product-category">
                  {product.category}
                </p>

                <h3>
                  {product.name}
                </h3>

                <p className="wishlist-product-price">
                  ₹
                  {(
                    product.salePrice || product.price
                  ).toLocaleString("en-IN")}
                </p>

              </div>

            </Link>

            <button
              className="wishlist-remove-button"
              onClick={() =>
                removeFromWishlist(product._id)
              }
            >
              REMOVE
              <span>×</span>
            </button>

          </article>
        ))}

      </div>
    )}

    <Link
      to="/customer/account"
      className="wishlist-back"
    >
      ← BACK TO ACCOUNT
    </Link>

  </main>
</>
);
}

export default Wishlist;