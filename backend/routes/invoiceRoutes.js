const express = require("express");
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const customerAuth = require("../middleware/customerAuthMiddleware");
const adminAuth = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   GENERATE INVOICE PDF
========================================================= */

const generateInvoice = (order, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${order.invoiceNumber || "invoice"}.pdf"`
  );

  doc.pipe(res);

  /* ================= HEADER ================= */

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("Nipun's Craft Jewellery", {
      align: "center",
    });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Jewellery & Handcrafted Collection", {
      align: "center",
    });

  doc.moveDown(1.5);

  /* ================= INVOICE TITLE ================= */

  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("INVOICE", {
      align: "center",
    });

  doc.moveDown();

  /* ================= INVOICE DETAILS ================= */

  doc.fontSize(10).font("Helvetica");

  doc.text(
    `Invoice Number: ${order.invoiceNumber || "N/A"}`
  );

  doc.text(
    `Order Date: ${new Date(
      order.createdAt
    ).toLocaleDateString("en-IN")}`
  );

  doc.text(
    `Order Status: ${order.orderStatus}`
  );

  doc.text(
    `Payment Method: ${
      order.paymentMethod === "online"
        ? "Online Payment"
        : "Cash on Delivery"
    }`
  );

  doc.text(
    `Payment Status: ${order.paymentStatus}`
  );

  doc.moveDown();

  /* ================= CUSTOMER DETAILS ================= */

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Customer Details");

  doc.moveDown(0.5);

  doc.fontSize(10).font("Helvetica");

  doc.text(
    `Name: ${order.customer?.name || "Customer"}`
  );

  doc.text(
    `Email: ${order.customer?.email || "N/A"}`
  );

  doc.text(
    `Phone: ${order.phone || "N/A"}`
  );

  doc.text(
    `Address: ${order.address}, ${order.city}, ${order.state} - ${order.pinCode}`
  );

  doc.moveDown();

  /* ================= SHIPPING DETAILS ================= */

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Shipping & Tracking");

  doc.moveDown(0.5);

  doc.fontSize(10).font("Helvetica");

  doc.text(
    `Courier: ${order.courierName || "Not assigned"}`
  );

  doc.text(
    `Tracking Number: ${
      order.trackingNumber || "Not available"
    }`
  );

  if (order.trackingUrl) {
    doc.text(
      `Tracking URL: ${order.trackingUrl}`
    );
  }

  doc.text(
    `Shipped On: ${
      order.shippedAt
        ? new Date(order.shippedAt).toLocaleString("en-IN")
        : "Not shipped"
    }`
  );

  doc.text(
    `Delivered On: ${
      order.deliveredAt
        ? new Date(order.deliveredAt).toLocaleString("en-IN")
        : "Not delivered"
    }`
  );

  doc.moveDown();

  /* ================= ORDER ITEMS ================= */

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Order Items");

  doc.moveDown(0.5);

  /* Table Header */

  doc.fontSize(10).font("Helvetica-Bold");

  doc.text("Product", 50, doc.y, {
    width: 220,
  });

  doc.text("Qty", 270, doc.y, {
    width: 50,
  });

  doc.text("Price", 320, doc.y, {
    width: 100,
  });

  doc.text("Amount", 420, doc.y, {
    width: 100,
  });

  doc.moveDown(0.5);

  doc.font("Helvetica");

  /* Products */

  order.items.forEach((item) => {
    const amount =
      item.price * item.quantity;

    doc.text(
      item.name,
      50,
      doc.y,
      {
        width: 220,
      }
    );

    doc.text(
      String(item.quantity),
      270,
      doc.y,
      {
        width: 50,
      }
    );

    doc.text(
      `Rs. ${item.price.toFixed(2)}`,
      320,
      doc.y,
      {
        width: 100,
      }
    );

    doc.text(
      `Rs. ${amount.toFixed(2)}`,
      420,
      doc.y,
      {
        width: 100,
      }
    );

    doc.moveDown(0.5);
  });

  doc.moveDown();

  /* ================= SUMMARY ================= */

  doc
    .fontSize(10)
    .font("Helvetica");

  doc.text(
    `Subtotal: Rs. ${order.subtotal.toFixed(2)}`,
    {
      align: "right",
    }
  );

  doc.text(
    `Discount: - Rs. ${order.discountAmount.toFixed(2)}`,
    {
      align: "right",
    }
  );

  doc.text(
    `Shipping: Rs. ${order.shippingAmount.toFixed(2)}`,
    {
      align: "right",
    }
  );

  doc.moveDown(0.5);

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(
      `Total: Rs. ${order.totalAmount.toFixed(2)}`,
      {
        align: "right",
      }
    );

  doc.moveDown(2);

  /* ================= FOOTER ================= */

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      "Thank you for shopping with Nipun's Craft Jewellery!",
      {
        align: "center",
      }
    );

  doc.text(
    "This is a computer-generated invoice.",
    {
      align: "center",
    }
  );

  doc.end();
};


/* =========================================================
   CUSTOMER - DOWNLOAD OWN INVOICE
========================================================= */

router.get(
  "/:orderId",
  customerAuth,
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.orderId
        ).populate(
          "customer",
          "name email"
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      if (
        !order.customer ||
        order.customer._id.toString() !==
          req.customer.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only access your own invoice.",
        });
      }

      generateInvoice(order, res);
    } catch (error) {
      console.error(
        "Customer invoice generation error:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message:
            "Failed to generate invoice.",
        });
      }
    }
  }
);


/* =========================================================
   ADMIN - DOWNLOAD ANY ORDER INVOICE
========================================================= */

router.get(
  "/admin/:orderId",
  adminAuth,
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.orderId
        ).populate(
          "customer",
          "name email"
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      generateInvoice(order, res);
    } catch (error) {
      console.error(
        "Admin invoice generation error:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message:
            "Failed to generate invoice.",
        });
      }
    }
  }
);


module.exports = router;