import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
const navigate = useNavigate();

const [menuOpen, setMenuOpen] = useState(false);
const [searchOpen, setSearchOpen] = useState(false);
const [cartCount, setCartCount] = useState(0);
const [wishlistCount, setWishlistCount] = useState(0);
const [searchQuery, setSearchQuery] = useState("");
const [customer, setCustomer] = useState(null);

useEffect(() => {
const loadCustomer = () => {
const savedCustomer =
localStorage.getItem("customer");

  if (savedCustomer) {
    setCustomer(JSON.parse(savedCustomer));
  } else {
    setCustomer(null);
  }
};

const updateCounts = () => {
  const cart = JSON.parse(
    localStorage.getItem("nipunsCart") || "[]"
  );

  const wishlist = JSON.parse(
    localStorage.getItem("nipunsWishlist") || "[]"
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  setCartCount(cartTotal);
  setWishlistCount(wishlist.length);
};

loadCustomer();
updateCounts();

window.addEventListener(
  "storage",
  updateCounts
);

window.addEventListener(
  "cartUpdated",
  updateCounts
);

window.addEventListener(
  "wishlistUpdated",
  updateCounts
);

window.addEventListener(
  "customerUpdated",
  loadCustomer
);

return () => {
  window.removeEventListener(
    "storage",
    updateCounts
  );

  window.removeEventListener(
    "cartUpdated",
    updateCounts
  );

  window.removeEventListener(
    "wishlistUpdated",
    updateCounts
  );

  window.removeEventListener(
    "customerUpdated",
    loadCustomer
  );
};

}, []);

const handleSearch = (value) => {
setSearchQuery(value);

navigate(
  value.trim()
    ? `/?search=${encodeURIComponent(
        value
      )}#collection`
    : "/"
);

};

const closeMenu = () => {
setMenuOpen(false);
};

return (
<nav className="customer-navbar">

  <div className="navbar-inner">

    <Link
      to="/"
      className="brand-logo"
      onClick={closeMenu}
    >
      <span className="brand-main">
        Nipun's Craft
      </span>

      <span className="brand-sub">
        JEWELLERY
      </span>
    </Link>

    <div
      className={`nav-links ${
        menuOpen ? "open" : ""
      }`}
    >

      <Link
        to="/"
        onClick={closeMenu}
      >
        HOME
      </Link>

      <a
        href="/#collection"
        onClick={closeMenu}
      >
        COLLECTION
      </a>

      <a
        href="/#new-arrivals"
        onClick={closeMenu}
      >
        NEW ARRIVALS
      </a>

      <a
        href="/#best-sellers"
        onClick={closeMenu}
      >
        BEST SELLERS
      </a>

    </div>

    <div className="navbar-actions">

      <Link
        to={
          customer
            ? "/customer/account"
            : "/customer/login"
        }
        className="nav-icon-button account-icon"
        aria-label={
          customer
            ? "Account"
            : "Login"
        }
      >
        ♙
      </Link>

      <button
        className={`nav-icon-button search-icon ${
          searchOpen
            ? "active"
            : ""
        }`}
        aria-label="Search"
        onClick={() =>
          setSearchOpen(
            !searchOpen
          )
        }
      >
        ⌕
      </button>

      <Link
        to="/wishlist"
        className="nav-icon-button wishlist-icon"
        aria-label="Wishlist"
      >
        ♡

        {wishlistCount > 0 && (
          <span className="wishlist-count">
            {wishlistCount}
          </span>
        )}
      </Link>

      <Link
        to="/cart"
        className="nav-icon-button cart-icon"
        aria-label="Shopping cart"
      >
        🛒

        {cartCount > 0 && (
          <span className="cart-count">
            {cartCount}
          </span>
        )}
      </Link>

      <button
        className={`menu-button ${
          menuOpen
            ? "active"
            : ""
        }`}
        onClick={() =>
          setMenuOpen(
            !menuOpen
          )
        }
        aria-label="Menu"
      >
        {menuOpen
          ? "×"
          : "☰"}
      </button>

    </div>

  </div>

  {searchOpen && (
    <div className="search-bar">

      <div className="search-bar-inner">

        <span className="search-label">
          SEARCH
        </span>

        <input
          type="text"
          placeholder="Search jewellery..."
          autoFocus
          value={searchQuery}
          onChange={(e) =>
            handleSearch(
              e.target.value
            )
          }
        />

        <button
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
            handleSearch("");
          }}
          aria-label="Close search"
        >
          ×
        </button>

      </div>

    </div>
  )}

</nav>

);
}

export default Navbar;