import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./CustomerHome.css";

function PrivacyPolicy() {
return (
<>
<Navbar />

  <main className="policy-page">

    <section className="policy-header">

      <p>NIPUN'S CRAFT JEWELLERY</p>

      <h1>
        Privacy
        <span>Policy</span>
      </h1>

      <div className="policy-line"></div>

      <p className="policy-intro">
        Your privacy matters to us. This policy explains
        how we collect, use, and protect your information
        when you use our website.
      </p>

    </section>

    <section className="policy-content">

      <div className="policy-section">

        <h2>Information We Collect</h2>

        <p>
          When you create an account, place an order,
          or contact us, we may collect information such
          as your name, email address, phone number,
          delivery address, and order details.
        </p>

        <p>
          We may also collect basic information about
          how you use our website to help us improve
          your shopping experience.
        </p>

      </div>

      <div className="policy-section">

        <h2>How We Use Your Information</h2>

        <p>
          Your information may be used to process and
          deliver orders, manage your account, provide
          customer support, and communicate with you
          regarding your orders.
        </p>

        <p>
          We may also use information to improve our
          products, website, and customer experience.
        </p>

      </div>

      <div className="policy-section">

        <h2>Payment Information</h2>

        <p>
          Online payments are processed through our
          payment service provider. We do not intend
          to store your complete card or other sensitive
          payment credentials on our website.
        </p>

        <p>
          Payment information may be handled directly
          by the applicable payment provider according
          to its own privacy and security practices.
        </p>

      </div>

      <div className="policy-section">

        <h2>Cookies & Website Usage</h2>

        <p>
          Our website may use browser storage,
          cookies, or similar technologies to remember
          preferences and support features such as
          shopping carts, wishlists, and account
          sessions.
        </p>

        <p>
          These technologies help us provide a smoother
          and more useful browsing experience.
        </p>

      </div>

      <div className="policy-section">

        <h2>Information Security</h2>

        <p>
          We take reasonable measures to protect the
          information associated with your account and
          orders from unauthorized access, misuse, or
          disclosure.
        </p>

        <p>
          However, no method of transmission or
          electronic storage can be guaranteed to be
          completely secure.
        </p>

      </div>

      <div className="policy-section">

        <h2>Third-Party Services</h2>

        <p>
          Our website may use third-party services for
          payment processing, delivery, hosting, or
          other website functionality.
        </p>

        <p>
          These providers may process information as
          necessary to provide their respective services
          and may have their own privacy policies.
        </p>

      </div>

      <div className="policy-section">

        <h2>Your Information</h2>

        <p>
          If you have questions about the information
          associated with your account or would like
          assistance regarding your personal information,
          please contact us.
        </p>

      </div>

      <div className="policy-section">

        <h2>Need Help?</h2>

        <p>
          For privacy-related questions or concerns,
          please contact us.
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

export default PrivacyPolicy;