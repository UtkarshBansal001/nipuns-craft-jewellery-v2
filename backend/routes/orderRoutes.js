const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Offer = require("../models/Offer");
const adminAuth = require("../middleware/authMiddleware");
const customerAuth = require("../middleware/customerAuthMiddleware");
const Razorpay = require("razorpay");

const router = express.Router();

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET, });

router.post("/", customerAuth, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      items,
      phone,
      address,
      city,
      pinCode,
      state,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      couponCode,
    } = req.body;

   if (paymentMethod === "online" && razorpayPaymentId) {
const existingOrder = await Order.findOne({
razorpayPaymentId,
});

if (existingOrder) {
await session.abortTransaction();
session.endSession();

return res.status(400).json({
  success: false,
  message: "This payment has already been used.",
});

}
}

if (paymentMethod === "online") {
if (!razorpayOrderId || !razorpayPaymentId) {
await session.abortTransaction();
session.endSession();

return res.status(400).json({
  success: false,
  message: "Verified payment details are required.",
});

}
}

if (paymentMethod === "online") {
const razorpayOrder = await razorpay.orders.fetch(
razorpayOrderId
);

const razorpayPayment =
await razorpay.payments.fetch(
razorpayPaymentId
);

if (
razorpayOrder.notes?.customerId !==
req.customer.id.toString()
) {
await session.abortTransaction();
session.endSession();

return res.status(403).json({
success: false,
message: "Payment does not belong to this customer.",
});
}

if (
razorpayPayment.order_id !== razorpayOrder.id ||
razorpayPayment.status !== "captured" ||
razorpayPayment.currency !== "INR" ||
razorpayPayment.amount !== razorpayOrder.amount
) {
await session.abortTransaction();
session.endSession();

return res.status(400).json({
  success: false,
  message: "Payment verification failed.",
});

}
}

    if (
      !items ||
      items.length === 0 ||
      !phone ||
      !address ||
      !city ||
      !pinCode ||
      !state ||
      !paymentMethod
    ) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Please provide all required order details.",
      });
    }

    // Get actual products from database
    const productIds = items.map((item) => item.product);

    const products = await Product.find({
      _id: { $in: productIds },
    }).session(session);

    if (products.length !== items.length) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "One or more products are no longer available.",
      });
    }

    const productMap = new Map(
      products.map((product) => [
        product._id.toString(),
        product,
      ])
    );

    let subtotal = 0;

    const orderItems = items.map((item) => {
      const product = productMap.get(
        item.product.toString()
      );

      if (!product) {
        throw new Error("Product not found.");
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        throw new Error("Invalid product quantity.");
      }

      if (item.quantity > product.stock) {
        throw new Error(
          `${product.name} has only ${product.stock} item(s) in stock.`
        );
      }

      const price =
        product.salePrice !== null &&
        product.salePrice !== undefined
          ? product.salePrice
          : product.price;

      subtotal += price * item.quantity;

      return {
        product: product._id,
        name: product.name,
        productCode: product.productCode || "",
        image: product.images?.[0] || "",
        price,
        quantity: item.quantity,
      };
    });

    // Shipping
    const shippingAmount =
      subtotal >= 999 ? 0 : 49;

    // Coupon
    let discountAmount = 0;
    let validCouponCode = "";

    if (couponCode && couponCode.trim()) {
      const offer = await Offer.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      }).session(session);

      if (!offer) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: "Invalid or inactive coupon code.",
        });
      }

      const now = new Date();

      if (
        now < offer.startDate ||
        now > offer.endDate
      ) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message:
            "This offer has expired or is not active yet.",
        });
      }

      if (
        subtotal < offer.minimumOrderValue
      ) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: `Minimum order value is ₹${offer.minimumOrderValue}.`,
        });
      }

      if (offer.discountType === "percentage") {
        discountAmount =
          (subtotal * offer.discountValue) / 100;

        if (
          offer.maxDiscount > 0 &&
          discountAmount > offer.maxDiscount
        ) {
          discountAmount = offer.maxDiscount;
        }
      } else {
        discountAmount = offer.discountValue;
      }

      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }

      validCouponCode = offer.code;
    }

    // Final amount
    const totalAmount =
      subtotal +
      shippingAmount -
      discountAmount;

      if (paymentMethod === "online") {
const razorpayOrder =
await razorpay.orders.fetch(razorpayOrderId);

if (
razorpayOrder.currency !== "INR" ||
razorpayOrder.amount !==
Math.round(totalAmount * 100)
) {
await session.abortTransaction();
session.endSession();

return res.status(400).json({
  success: false,
  message: "Payment amount does not match order total.",
});

}
}

    // Create order inside transaction
    const createdOrders = await Order.create(
      [
        {
          customer: req.customer.id,
          items: orderItems,
          phone,
          address,
          city,
          pinCode,
          state,
          paymentMethod,

paymentStatus:
  paymentMethod === "online"
    ? "Paid"
    : "Pending",

razorpayOrderId: razorpayOrderId || "",
razorpayPaymentId: razorpayPaymentId || "",

subtotal,
discountAmount,
          couponCode: validCouponCode,
          shippingAmount,
          totalAmount,
        },
      ],
      { session }
    );

    const createdOrder = createdOrders[0];

    // Atomically reduce stock
    for (const item of orderItems) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          {
            new: true,
            session,
          }
        );

      if (!updatedProduct) {
        throw new Error(
          `${item.name} is out of stock or insufficient stock.`
        );
      }
    }

    // Everything successful
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: createdOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    try {
      await session.abortTransaction();
    } catch (transactionError) {
      console.error(
        "Transaction rollback error:",
        transactionError
      );
    }

    session.endSession();

    const isClientError =
  error.message === "Product not found." ||
  error.message === "Invalid product quantity." ||
  error.message.includes("has only") ||
  error.message.includes("out of stock") ||
  error.message.includes("insufficient stock");

res.status(isClientError ? 400 : 500).json({
  success: false,
  message:
    error.message ||
    "Failed to create order.",
});

  }
});


router.get("/customer/:customerId", customerAuth, async (req, res) => {
  try {
    const { customerId } = req.params;
    if (req.customer.id !== customerId) {
  return res.status(403).json({
    success: false,
    message: "You can only access your own orders.",
  });
}
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const orders = await Order.find({
      customer: customerId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch customer orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
});
router.put("/admin/:orderId/status", adminAuth, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { orderId } = req.params;
    const { orderStatus } = req.body;
    

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    if (!allowedStatuses.includes(orderStatus)) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const allowedTransitions = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

if (
  !allowedTransitions[order.orderStatus]?.includes(
    orderStatus
  )
) {
  await session.abortTransaction();
  session.endSession();

  return res.status(400).json({
    success: false,
    message: `Order cannot be changed from ${order.orderStatus} to ${orderStatus}.`,
  });
}

    // Cancelled order cannot be activated again
    if (
      order.orderStatus === "Cancelled" &&
      orderStatus !== "Cancelled"
    ) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be reactivated.",
      });
    }

    // Already cancelled
    if (
      order.orderStatus === "Cancelled" &&
      orderStatus === "Cancelled"
    ) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Order is already cancelled.",
      });
    }

    // Restore stock when cancelling
    if (
      orderStatus === "Cancelled" &&
      order.orderStatus !== "Cancelled"
    ) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: item.quantity,
            },
          },
          {
            session,
          }
        );
      }
    }

    order.orderStatus = orderStatus;

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    try {
      await session.abortTransaction();
    } catch (transactionError) {
      console.error(
        "Transaction rollback error:",
        transactionError
      );
    }

    session.endSession();

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update order status.",
    });
  }
});


router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch all orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
});

module.exports = router;