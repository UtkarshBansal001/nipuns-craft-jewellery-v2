const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// ==================================================
// SMTP VERIFICATION
// ==================================================

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_APP_PASSWORD loaded:",
  !!process.env.EMAIL_APP_PASSWORD
);
console.log(
  "EMAIL_APP_PASSWORD length:",
  process.env.EMAIL_APP_PASSWORD?.length
);

transporter
  .verify()
  .then(() => {
    console.log("SMTP READY");
  })
  .catch((error) => {
    console.error("SMTP VERIFY FAILED:", error.message);
  });

// ==================================================
// COMMON HELPERS
// ==================================================

function formatPrice(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

function getPaymentMethod(order) {
  return order.paymentMethod === "online"
    ? "Online Payment"
    : "Cash on Delivery";
}

// ==================================================
// ORDER PLACED EMAIL
// ==================================================

async function sendOrderPlacedEmail({
  customerEmail,
  customerName,
  order,
}) {
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="
            padding: 10px;
            border-bottom: 1px solid #eee;
          ">
            ${item.name}
          </td>

          <td style="
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-align: center;
          ">
            ${item.quantity}
          </td>

          <td style="
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-align: right;
          ">
            ${formatPrice(item.price)}
          </td>
        </tr>
      `
    )
    .join("");

  const paymentMethod = getPaymentMethod(order);

  const mailOptions = {
    from: `"Nipun's Craft Jewellery" <${process.env.EMAIL_USER}>`,

    to: customerEmail,

    subject: `Order Placed Successfully - ${order.invoiceNumber}`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 650px;
        margin: auto;
        padding: 20px;
        color: #333;
      ">

        <!-- HEADER -->

        <div style="
          text-align: center;
          padding: 20px;
          border-bottom: 2px solid #eee;
        ">

          <h1 style="
            margin: 0;
            color: #8b5e3c;
          ">
            Nipun's Craft Jewellery
          </h1>

          <p style="margin: 8px 0 0;">
            Jewellery & Handcrafted Collection
          </p>

        </div>

        <!-- CONTENT -->

        <div style="padding: 25px 10px;">

          <h2 style="margin-top: 0;">
            Order Placed Successfully 🎉
          </h2>

          <p>
            Hi <strong>${customerName}</strong>,
          </p>

          <p>
            Thank you for shopping with
            <strong>Nipun's Craft Jewellery</strong>.
            Your order has been successfully placed.
          </p>

          <!-- ORDER INFO -->

          <div style="
            background: #f8f8f8;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          ">

            <p style="margin: 5px 0;">
              <strong>Invoice Number:</strong>
              ${order.invoiceNumber}
            </p>

            <p style="margin: 5px 0;">
              <strong>Order Status:</strong>
              ${order.orderStatus || "Pending"}
            </p>

            <p style="margin: 5px 0;">
              <strong>Payment Method:</strong>
              ${paymentMethod}
            </p>

            <p style="margin: 5px 0;">
              <strong>Payment Status:</strong>
              ${order.paymentStatus}
            </p>

          </div>

          <!-- ITEMS -->

          <h3>Order Items</h3>

          <table style="
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          ">

            <thead>

              <tr style="background: #f5f5f5;">

                <th style="
                  padding: 10px;
                  text-align: left;
                ">
                  Product
                </th>

                <th style="
                  padding: 10px;
                  text-align: center;
                ">
                  Qty
                </th>

                <th style="
                  padding: 10px;
                  text-align: right;
                ">
                  Price
                </th>

              </tr>

            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>

          </table>

          <!-- PRICE -->

          <div style="
            margin-top: 25px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          ">

            <p>
              <strong>Subtotal:</strong>
              ${formatPrice(order.subtotal)}
            </p>

            <p>
              <strong>Discount:</strong>
              - ${formatPrice(order.discountAmount)}
            </p>

            <p>
              <strong>Shipping:</strong>
              ${formatPrice(order.shippingAmount)}
            </p>

            <p style="
              font-size: 20px;
              font-weight: bold;
              border-top: 2px solid #ddd;
              padding-top: 12px;
            ">

              <strong>Total:</strong>
              ${formatPrice(order.totalAmount)}

            </p>

          </div>

          <!-- MESSAGE -->

          <div style="
            margin-top: 30px;
            padding: 15px;
            background: #fff8f0;
            border-radius: 8px;
          ">

            <p style="margin: 0;">
              We will keep you updated about your order status.
              You will receive another email when your order is
              confirmed and shipped.
            </p>

          </div>

          <p style="
            margin-top: 30px;
            text-align: center;
          ">

            Thank you for shopping with
            <strong>Nipun's Craft Jewellery</strong> ❤️

          </p>

        </div>

        <!-- FOOTER -->

        <div style="
          text-align: center;
          border-top: 1px solid #eee;
          padding: 20px;
          font-size: 12px;
          color: #777;
        ">

          This is an automated email.
          Please do not reply directly to this email.

        </div>

      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// ==================================================
// ORDER CONFIRMED EMAIL
// ==================================================

async function sendOrderConfirmedEmail({
  customerEmail,
  customerName,
  order,
}) {
  const mailOptions = {
    from: `"Nipun's Craft Jewellery" <${process.env.EMAIL_USER}>`,

    to: customerEmail,

    subject: `Order Confirmed - ${order.invoiceNumber}`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 650px;
        margin: auto;
        padding: 20px;
        color: #333;
      ">

        <!-- HEADER -->

        <div style="
          text-align: center;
          padding: 20px;
          border-bottom: 2px solid #eee;
        ">

          <h1 style="
            margin: 0;
            color: #8b5e3c;
          ">
            Nipun's Craft Jewellery
          </h1>

          <p style="margin: 8px 0 0;">
            Jewellery & Handcrafted Collection
          </p>

        </div>

        <!-- CONTENT -->

        <div style="padding: 25px 10px;">

          <h2 style="margin-top: 0;">
            Order Confirmed 🎉
          </h2>

          <p>
            Hi <strong>${customerName}</strong>,
          </p>

          <p>
            Great news! Your order has been
            <strong>confirmed successfully</strong>.
          </p>

          <p>
            We are now preparing your jewellery for shipment.
          </p>

          <!-- ORDER INFO -->

          <div style="
            background: #f8f8f8;
            padding: 18px;
            border-radius: 8px;
            margin: 20px 0;
          ">

            <p style="margin: 8px 0;">
              <strong>Invoice Number:</strong>
              ${order.invoiceNumber}
            </p>

            <p style="margin: 8px 0;">
              <strong>Order Status:</strong>
              Confirmed
            </p>

            <p style="margin: 8px 0;">
              <strong>Total Amount:</strong>
              ${formatPrice(order.totalAmount)}
            </p>

          </div>

          <!-- MESSAGE -->

          <div style="
            background: #fff8f0;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
          ">

            <p style="margin: 0;">
              📦 We will send you another email when your order
              is shipped, along with courier and tracking details.
            </p>

          </div>

          <p style="
            margin-top: 30px;
            text-align: center;
          ">

            Thank you for shopping with
            <strong>Nipun's Craft Jewellery</strong> ❤️

          </p>

        </div>

        <!-- FOOTER -->

        <div style="
          text-align: center;
          border-top: 1px solid #eee;
          padding: 20px;
          font-size: 12px;
          color: #777;
        ">

          This is an automated email.
          Please do not reply directly to this email.

        </div>

      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// ==================================================
// ORDER SHIPPED EMAIL
// ==================================================

async function sendOrderShippedEmail({
  customerEmail,
  customerName,
  order,
}) {
  const trackingButton = order.trackingUrl
    ? `
      <div style="
        text-align: center;
        margin: 25px 0;
      ">

        <a
          href="${order.trackingUrl}"
          target="_blank"
          style="
            display: inline-block;
            background: #8b5e3c;
            color: white;
            text-decoration: none;
            padding: 13px 25px;
            border-radius: 6px;
            font-weight: bold;
          "
        >
          Track Your Order
        </a>

      </div>
    `
    : "";

  const mailOptions = {
    from: `"Nipun's Craft Jewellery" <${process.env.EMAIL_USER}>`,

    to: customerEmail,

    subject: `Your Order Has Been Shipped - ${order.invoiceNumber}`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 650px;
        margin: auto;
        padding: 20px;
        color: #333;
      ">

        <!-- HEADER -->

        <div style="
          text-align: center;
          padding: 20px;
          border-bottom: 2px solid #eee;
        ">

          <h1 style="
            margin: 0;
            color: #8b5e3c;
          ">
            Nipun's Craft Jewellery
          </h1>

          <p style="margin: 8px 0 0;">
            Jewellery & Handcrafted Collection
          </p>

        </div>

        <!-- CONTENT -->

        <div style="padding: 25px 10px;">

          <h2 style="margin-top: 0;">
            Your Order Has Been Shipped 📦
          </h2>

          <p>
            Hi <strong>${customerName}</strong>,
          </p>

          <p>
            Great news! Your order from
            <strong>Nipun's Craft Jewellery</strong>
            has been shipped.
          </p>

          <!-- SHIPPING INFO -->

          <div style="
            background: #f8f8f8;
            padding: 18px;
            border-radius: 8px;
            margin: 20px 0;
          ">

            <p style="margin: 8px 0;">
              <strong>Invoice Number:</strong>
              ${order.invoiceNumber}
            </p>

            <p style="margin: 8px 0;">
              <strong>Order Status:</strong>
              Shipped
            </p>

            <p style="margin: 8px 0;">
              <strong>Courier:</strong>
              ${order.courierName || "Courier Partner"}
            </p>

            <p style="margin: 8px 0;">
              <strong>Tracking Number:</strong>
              ${order.trackingNumber || "Not available"}
            </p>

            <p style="margin: 8px 0;">
              <strong>Total Amount:</strong>
              ${formatPrice(order.totalAmount)}
            </p>

          </div>

          ${trackingButton}

          <!-- MESSAGE -->

          <div style="
            background: #fff8f0;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
          ">

            <p style="margin: 0;">
              🚚 Your jewellery is now on its way.
              Please keep your phone available for delivery updates.
            </p>

          </div>

          <p style="
            margin-top: 30px;
            text-align: center;
          ">

            Thank you for shopping with
            <strong>Nipun's Craft Jewellery</strong> ❤️

          </p>

        </div>

        <!-- FOOTER -->

        <div style="
          text-align: center;
          border-top: 1px solid #eee;
          padding: 20px;
          font-size: 12px;
          color: #777;
        ">

          This is an automated email.
          Please do not reply directly to this email.

        </div>

      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  sendOrderPlacedEmail,
  sendOrderConfirmedEmail,
  sendOrderShippedEmail,
};