import { Link } from "react-router-dom";

function Footer() {
return (
<footer className="customer-footer">

  <div className="footer-inner">

    <div className="footer-brand">

      <h2>
        Nipun's Craft
        <span>JEWELLERY</span>
      </h2>

      <p>
        Handcrafted jewellery made with love,
        designed to make every moment beautifully
        unforgettable.
      </p>

      <span className="footer-est">
        HANDCRAFTED WITH LOVE
      </span>

    </div>

    <div className="footer-column">

      <h3>QUICK LINKS</h3>

      <Link to="/">HOME</Link>

      <a href="/#collection">
        COLLECTION
      </a>

      <a href="/#new-arrivals">
        NEW ARRIVALS
      </a>

      <a href="/#best-sellers">
        BEST SELLERS
      </a>

    </div>

    <div className="footer-column">

      <h3>CUSTOMER CARE</h3>

      <Link to="/customer/account">
        MY ACCOUNT
      </Link>

      <Link to="/customer/orders">
        MY ORDERS
      </Link>

      <Link to="/wishlist">
        WISHLIST
      </Link>

      <Link to="/cart">
        CART
      </Link>

      <Link to="/shipping-policy">
        SHIPPING POLICY
      </Link>

      <Link to="/return-refund-policy">
        RETURNS & REFUNDS
      </Link>

      <Link to="/privacy-policy">
        PRIVACY POLICY
      </Link>

      <Link to="/terms-conditions">
        TERMS & CONDITIONS
      </Link>

      <Link to="/contact-us">
        CONTACT US
      </Link>

    </div>

    <div className="footer-column footer-contact">

      <h3>CONTACT</h3>

      <p>
        We're here to help with your jewellery
        journey.
      </p>

      <a href="mailto:contact@nipunscraftjewellery.com">
        contact@nipunscraftjewellery.com
      </a>

      <a
        href="https://www.instagram.com/nipuncraftjewels/"
        target="_blank"
        rel="noopener noreferrer"
      >
        INSTAGRAM
      </a>

    </div>

  </div>

  <div className="footer-bottom">

    <span>
      © 2026 NIPUN'S CRAFT JEWELLERY
    </span>

    <span>
      HANDCRAFTED WITH LOVE
    </span>

  </div>

</footer>

);
}

export default Footer;