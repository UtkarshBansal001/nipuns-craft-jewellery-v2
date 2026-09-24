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
    `Order Date: ${
      order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-IN")
        : "N/A"
    }`
  );

  doc.text(
    `Order Status: ${order.orderStatus || "N/A"}`
  );

  doc.text(
    `Payment Method: ${
      order.paymentMethod === "online"
        ? "Online Payment"
        : "Cash on Delivery"
    }`
  );

  doc.text(
    `Payment Status: ${order.paymentStatus || "N/A"}`
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
    `Address: ${order.address || "N/A"}, ${
      order.city || ""
    }, ${order.state || ""} - ${order.pinCode || ""}`
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

  const tableY = doc.y;

  doc.text("Product", 50, tableY, {
    width: 220,
  });

  doc.text("Qty", 270, tableY, {
    width: 50,
  });

  doc.text("Price", 320, tableY, {
    width: 100,
  });

  doc.text("Amount", 420, tableY, {
    width: 100,
  });

  doc.moveDown(0.8);

  doc.font("Helvetica");

  /* Products */

  order.items.forEach((item) => {
    const amount =
      Number(item.price || 0) *
      Number(item.quantity || 0);

    const itemY = doc.y;

    doc.text(
      item.name || "Product",
      50,
      itemY,
      {
        width: 220,
      }
    );

    doc.text(
      String(item.quantity || 0),
      270,
      itemY,
      {
        width: 50,
      }
    );

    doc.text(
      `Rs. ${Number(item.price || 0).toFixed(2)}`,
      320,
      itemY,
      {
        width: 100,
      }
    );

    doc.text(
      `Rs. ${amount.toFixed(2)}`,
      420,
      itemY,
      {
        width: 100,
      }
    );

    doc.moveDown(0.8);
  });

  doc.moveDown();

  /* ================= SUMMARY ================= */

  doc
    .fontSize(10)
    .font("Helvetica");

  doc.text(
    `Subtotal: Rs. ${Number(
      order.subtotal || 0
    ).toFixed(2)}`,
    {
      align: "right",
    }
  );

  doc.text(
    `Discount: - Rs. ${Number(
      order.discountAmount || 0
    ).toFixed(2)}`,
    {
      align: "right",
    }
  );

  doc.text(
    `Shipping: Rs. ${Number(
      order.shippingAmount || 0
    ).toFixed(2)}`,
    {
      align: "right",
    }
  );

  doc.moveDown(0.5);

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(
      `Total: Rs. ${Number(
        order.totalAmount || 0
      ).toFixed(2)}`,
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
   ADMIN - DOWNLOAD ANY ORDER INVOICE
   IMPORTANT: Keep this route BEFORE /:orderId
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


module.exports = router;