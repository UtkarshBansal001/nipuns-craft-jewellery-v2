import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./CustomerHome.css";

function ReturnRefundPolicy() {
return (
<>
<Navbar />

  <main className="policy-page">

    <section className="policy-header">

      <p>NIPUN'S CRAFT JEWELLERY</p>

      <h1>
        Returns &
        <span>Refunds</span>
      </h1>

      <div className="policy-line"></div>

      <p className="policy-intro">
        Our return and refund guidelines to help make
        your shopping experience simple and transparent.
      </p>

    </section>

    <section className="policy-content">

      <div className="policy-section">

        <h2>Return Eligibility</h2>

        <p>
          We want you to be happy with your jewellery.
          If you receive a damaged, defective, or
          incorrect item, please contact us as soon
          as possible.
        </p>

        <p>
          Return requests should generally be raised
          within 7 days of receiving the order.
        </p>

      </div>

      <div className="policy-section">

        <h2>Non-Returnable Items</h2>

        <p>
          Items that have been worn, altered, damaged
          after delivery, or used improperly may not
          be eligible for return.
        </p>

        <p>
          Items returned without their original
          packaging or with missing components may
          also be refused.
        </p>

      </div>

      <div className="policy-section">

        <h2>Damaged or Incorrect Orders</h2>

        <p>
          If your order arrives damaged or you receive
          a different product from the one you ordered,
          please contact us with your order details.
        </p>

        <p>
          Photographs or other information may be
          requested to help us review the issue.
        </p>

      </div>

      <div className="policy-section">

        <h2>Refunds</h2>

        <p>
          Once an eligible return is received and
          inspected, we will notify you regarding the
          status of your refund.
        </p>

        <p>
          Approved refunds will generally be processed
          to the original payment method. Processing
          time may vary depending on the payment
          provider or bank.
        </p>

      </div>

      <div className="policy-section">

        <h2>Exchange</h2>

        <p>
          Exchanges may be considered depending on
          product availability and the condition of
          the returned item.
        </p>

        <p>
          Please contact us before sending any item
          back so we can guide you through the process.
        </p>

      </div>

      <div className="policy-section">

        <h2>Need Help?</h2>

        <p>
          For return or refund assistance, please
          contact us with your order number and a
          description of the issue.
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

export default ReturnRefundPolicy;