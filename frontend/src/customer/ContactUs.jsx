import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./CustomerHome.css";

function ContactUs() {
return (
<>
<Navbar />

  <main className="contact-page">

    <section className="contact-header">

      <p>NIPUN'S CRAFT JEWELLERY</p>

      <h1>
        Get In
        <span>Touch</span>
      </h1>

      <div className="contact-line"></div>

      <p className="contact-intro">
        Have a question about our jewellery, your order,
        or anything else? We're here to help.
      </p>

    </section>

    <section className="contact-content">

      <div className="contact-info">

        <p className="contact-section-label">
          CONTACT US
        </p>

        <h2>
          We're here to
          <span>help.</span>
        </h2>

        <p className="contact-description">
          Whether you need help with an order, have a
          question about a product, or simply want to
          know more about our jewellery, feel free to
          reach out to us.
        </p>

        <div className="contact-details">

          <div className="contact-detail">

            <span>EMAIL</span>

            <a href="mailto:contact@nipunscraftjewellery.com">
              contact@nipunscraftjewellery.com
            </a>

          </div>

          <div className="contact-detail">

            <span>INSTAGRAM</span>

            <p>
              Follow us for new arrivals and updates.
            </p>

          </div>

          <div className="contact-detail">

            <span>ORDER SUPPORT</span>

            <p>
              Please keep your order number ready when
              contacting us about an existing order.
            </p>

          </div>

        </div>

      </div>

      <div className="contact-card">

        <p className="contact-card-label">
          CUSTOMER CARE
        </p>

        <h2>
          How can we
          <span>help?</span>
        </h2>

        <div className="contact-card-item">
          <strong>ORDER QUERIES</strong>
          <span>
            Questions about your order or delivery.
          </span>
        </div>

        <div className="contact-card-item">
          <strong>RETURNS & REFUNDS</strong>
          <span>
            Need help with a return or refund?
          </span>
        </div>

        <div className="contact-card-item">
          <strong>PRODUCT INFORMATION</strong>
          <span>
            Want to know more about a jewellery piece?
          </span>
        </div>

        <a
          href="mailto:contact@nipunscraftjewellery.com"
          className="contact-email-button"
        >
          EMAIL US
        </a>

      </div>

    </section>

    <section className="contact-bottom">

      <p>
        HANDCRAFTED WITH LOVE
      </p>

      <h2>
        We look forward to
        <span>hearing from you.</span>
      </h2>

    </section>

    <Link
      to="/"
      className="contact-back"
    >
      ← BACK TO HOME
    </Link>

  </main>
</>

);
}

export default ContactUs;