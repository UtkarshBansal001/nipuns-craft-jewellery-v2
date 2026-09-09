


import AdminSettings from "./admin/AdminSettings";
import ScrollToTop from "./ScrollToTop";
import Footer from "./customer/Footer";
import ContactUs from "./customer/ContactUs";
import TermsConditions from "./customer/TermsConditions";
import PrivacyPolicy from "./customer/PrivacyPolicy";
import ShippingPolicy from "./customer/ShippingPolicy";
import CustomerAccountEdit from "./customer/CustomerAccountEdit";
import AdminOffers from "./admin/AdminOffers";
import AdminCustomers from "./admin/AdminCustomers";
import AdminOrders from "./admin/AdminOrders";
import CustomerOrders from "./customer/CustomerOrders";
import OrderSuccess from "./customer/OrderSuccess";
import Checkout from "./customer/Checkout";
import CustomerAccount from "./customer/CustomerAccount";
import CustomerLogin from "./customer/CustomerLogin";
import CustomerSignup from "./customer/CustomerSignup";
import Wishlist from "./customer/Wishlist";
import Cart from "./customer/Cart";
import ProductDetails from "./customer/ProductDetails";
import CustomerHome from "./customer/CustomerHome";
import AdminDashboard from "./admin/AdminDashboard";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminLogin from "./admin/AdminLogin";
import AdminProducts from "./admin/AdminProducts";
import ReturnRefundPolicy from "./customer/ReturnRefundPolicy";

function ConditionalFooter() {
const location = useLocation();

if (location.pathname.startsWith("/admin")) {
return null;
}

return <Footer />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        <Route
  path="/"
  element={<CustomerHome />}
/>

<Route
  path="/product/:id"
  element={<ProductDetails />}
/>

<Route
  path="/cart"
  element={<Cart />}
/>

<Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />

<Route
  path="/checkout"
  element={<Checkout />}
/>

<Route path="/terms-conditions" element={<TermsConditions />} />

<Route path="/order-success" element={<OrderSuccess />} />

<Route path="/customer/orders" element={<CustomerOrders />} />

<Route path="/contact-us" element={<ContactUs />} />

<Route
  path="/wishlist"
  element={<Wishlist />}
/>

<Route
path="/admin/settings"
element={<AdminSettings />}
/>

<Route
  path="/customer/signup"
  element={<CustomerSignup />}
/>

<Route
  path="/customer/login"
  element={<CustomerLogin />}
/>

<Route path="/privacy-policy" element={<PrivacyPolicy />} />

<Route
  path="/customer/account/edit"
  element={<CustomerAccountEdit />}
/>

<Route
  path="/customer/account"
  element={<CustomerAccount />}
/>

<Route path="/shipping-policy" element={<ShippingPolicy />} />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
  path="/admin/products"
  element={<AdminProducts />}
/>

<Route path="/admin/orders" element={<AdminOrders />} />
<Route path="/admin/offers" element={<AdminOffers />} />
<Route path="/admin/customers" element={<AdminCustomers />} />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
      <ConditionalFooter />
    </BrowserRouter>
  );
}

export default App;