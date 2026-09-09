import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./CustomerHome.css";

function TermsConditions() {
return (
<>
<Navbar />

  <main className="policy-page">

    <section className="policy-header">

      <p>NIPUN'S CRAFT JEWELLERY</p>

      <h1>
        Terms &
        <span>Conditions</span>
      </h1>

      <div className="policy-line"></div>

      <p className="policy-intro">
        Please read these terms carefully before using
        our website or placing an order with us.
      </p>

    </section>

    <section className="policy-content">

      <div className="policy-section">

        <h2>Website Use</h2>

        <p>
          By using this website, you agree to use it
          responsibly and in accordance with these terms.
        </p>

        <p>
          You must not use the website for unlawful
          activities, unauthorized access, or any activity
          that may interfere with its normal operation.
        </p>

      </div>

      <div className="policy-section">

        <h2>Products & Availability</h2>

        <p>
          We make reasonable efforts to display our
          jewellery products, descriptions, images, and
          prices as accurately as possible.
        </p>

        <p>
          Product availability may change without prior
          notice. We reserve the right to limit quantities
          or discontinue products when necessary.
        </p>

      </div>

      <div className="policy-section">

        <h2>Pricing & Offers</h2>

        <p>
          Product prices and applicable offers are
          displayed on the website and may change from
          time to time.
        </p>

        <p>
          Discounts and promotional offers may have
          specific conditions, validity periods, or
          eligibility requirements.
        </p>

      </div>

      <div className="policy-section">

        <h2>Orders</h2>

        <p>
          Placing an order on our website constitutes
          a request to purchase the selected products.
        </p>

        <p>
          We reserve the right to cancel or decline an
          order in circumstances such as product
          unavailability, pricing errors, suspected
          fraudulent activity, or other operational issues.
        </p>

      </div>

      <div className="policy-section">

        <h2>Payments</h2>

        <p>
          We may offer payment methods such as online
          payment and Cash on Delivery, depending on
          availability and applicable conditions.
        </p>

        <p>
          Online payments are processed through the
          applicable payment service provider. Payment
          confirmation is required where applicable before
          an order can be processed.
        </p>

      </div>

      <div className="policy-section">

        <h2>Order Cancellation</h2>

        <p>
          Cancellation requests may be accepted before
          an order is dispatched, subject to the status
          of the order.
        </p>

        <p>
          Once an order has been dispatched, cancellation
          may no longer be possible and the applicable
          return policy may apply.
        </p>

      </div>

      <div className="policy-section">

        <h2>Returns & Refunds</h2>

        <p>
          Returns and refunds are handled according to
          our Return & Refund Policy.
        </p>

        <p>
          Please review that policy before placing an
          order so you understand the applicable
          eligibility and refund conditions.
        </p>

      </div>

      <div className="policy-section">

        <h2>Account Responsibility</h2>

        <p>
          If you create an account, you are responsible
          for providing accurate information and keeping
          your login credentials secure.
        </p>

        <p>
          Please notify us if you believe your account
          has been accessed without your authorization.
        </p>

      </div>

      <div className="policy-section">

        <h2>Intellectual Property</h2>

        <p>
          Website content including brand names, logos,
          product images, photographs, text, designs,
          and other materials may belong to Nipun's Craft
          Jewellery or their respective owners.
        </p>

        <p>
          Such content should not be copied, reproduced,
          modified, or commercially used without
          appropriate permission.
        </p>

      </div>

      <div className="policy-section">

        <h2>Changes to These Terms</h2>

        <p>
          We may update these terms from time to time
          to reflect changes in our website, services,
          or business practices.
        </p>

        <p>
          Updated terms will be published on this page.
        </p>

      </div>

      <div className="policy-section">

        <h2>Need Help?</h2>

        <p>
          If you have any questions regarding these
          terms and conditions, please contact us.
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

export default TermsConditions;