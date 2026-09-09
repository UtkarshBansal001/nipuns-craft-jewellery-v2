import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./CustomerHome.css";

function ShippingPolicy() {
return (
<>
<Navbar />

  <main className="policy-page">

    <section className="policy-header">

      <p>NI PUN'S CRAFT JEWELLERY</p>

      <h1>
        Shipping
        <span>Policy</span>
      </h1>

      <div className="policy-line"></div>

      <p className="policy-intro">
        Everything you need to know about how we
        carefully pack and deliver your jewellery.
      </p>

    </section>

    <section className="policy-content">

      <div className="policy-section">

        <h2>Order Processing</h2>

        <p>
          Once your order is successfully placed,
          we carefully prepare and pack your jewellery
          for dispatch.
        </p>

        <p>
          Orders are generally processed within
          1–3 business days. Processing may take
          slightly longer during festive periods,
          special offers, or high-volume sales.
        </p>

      </div>

      <div className="policy-section">

        <h2>Shipping Time</h2>

        <p>
          After dispatch, delivery generally takes
          approximately 3–7 business days depending
          on your location and the courier service.
        </p>

        <p>
          Delivery timelines are estimates and may
          vary due to weather, holidays, courier
          delays, or circumstances beyond our control.
        </p>

      </div>

      <div className="policy-section">

        <h2>Shipping Charges</h2>

        <p>
          Shipping charges are calculated at checkout
          based on your order and applicable delivery
          conditions.
        </p>

        <p>
          Orders meeting the applicable free-shipping
          threshold may qualify for free delivery.
        </p>

      </div>

      <div className="policy-section">

        <h2>Order Tracking</h2>

        <p>
          Once your order has been dispatched, tracking
          information may be provided through your
          account or order communication.
        </p>

        <p>
          You can also check your order status from
          the <strong>My Orders</strong> section of
          your account.
        </p>

      </div>

      <div className="policy-section">

        <h2>Delivery Address</h2>

        <p>
          Please make sure your name, phone number,
          address, city, state, and PIN code are
          correct before placing your order.
        </p>

        <p>
          We may not be responsible for delays or
          failed deliveries caused by incorrect or
          incomplete address information.
        </p>

      </div>

      <div className="policy-section">

        <h2>Need Help?</h2>

        <p>
          If you have any questions regarding your
          shipment or delivery, please contact us.
        </p>

        <a
          href="mailto:contact@nipunscraftjewellery.com"
          className="policy-contact"
        >
          contact@nipunscraftjewellery.com
        </a>

      </div>

    </section>

    <Link
      to="/"
      className="policy-back"
    >
      ← BACK TO HOME
    </Link>

  </main>
</>

);
}

export default ShippingPolicy;