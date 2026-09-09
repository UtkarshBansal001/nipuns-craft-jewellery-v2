const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Product = require("../models/Product");
const Offer = require("../models/Offer");
const customerAuth = require("../middleware/customerAuthMiddleware");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", customerAuth, async (req, res) => {
  try {
    const { items, couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) { return res.status(400).json({ success: false, message: "Cart items are required.", }); }
    
    const productIds = items.map((item) => item.product);

const products = await Product.find({
_id: { $in: productIds },
isActive: true,
});

if (products.length !== items.length) { return res.status(400).json({ success: false, message: "One or more products are invalid.", }); }

let subtotal = 0;

for (const item of items) {
const product = products.find(
(p) => p._id.toString() === item.product.toString()
);

if (!product || !Number.isInteger(item.quantity) || item.quantity <= 0) {
return res.status(400).json({
success: false,
message: "Invalid product quantity.",
});
}

if (product.stock < item.quantity) {
return res.status(400).json({
success: false,
message: "Insufficient stock.",
});
}

const price = product.salePrice || product.price;

subtotal += price * item.quantity;
}

const shippingAmount = subtotal >= 999 ? 0 : 49;

let discountAmount = 0;

if (couponCode) {
const coupon = await Offer.findOne({
code: couponCode.trim().toUpperCase(),
});

if (!coupon) {
return res.status(400).json({
success: false,
message: "Invalid coupon code.",
});
}

const now = new Date();

if (
!coupon.isActive ||
now < coupon.startDate ||
now > coupon.endDate ||
subtotal < coupon.minOrderValue
) {
return res.status(400).json({
success: false,
message: "Coupon is not valid for this order.",
});
}

discountAmount =
coupon.discountType === "percentage"
? Math.min(
(subtotal * coupon.discountValue) / 100,
coupon.maxDiscount || Infinity
)
: Math.min(coupon.discountValue, subtotal);
}

const totalAmount =
subtotal + shippingAmount - discountAmount;

 const options = { amount: Math.round(totalAmount * 100), currency: "INR", receipt: `cust_${req.customer.id}_${Date.now()}`, notes: { customerId: req.customer.id.toString(), }, };
    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create payment order.",
    });
  }
});

router.post("/verify-payment", customerAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
      
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required.",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        razorpay_order_id + "|" + razorpay_payment_id
      )
      .digest("hex");

      const razorpayOrder = await razorpay.orders.fetch( razorpay_order_id );

      if ( razorpayOrder.notes?.customerId !== req.customer.id.toString() ) { return res.status(403).json({ success: false, message: "Payment does not belong to this customer.", }); }

      if (!razorpayOrder || razorpayOrder.currency !== "INR") { return res.status(400).json({ success: false, message: "Invalid Razorpay order.", }); }

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    const expectedAmount = razorpayOrder.amount;

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match order amount.",
      });
    }

    if ( generatedSignature.length !== razorpay_signature.length || !crypto.timingSafeEqual( Buffer.from(generatedSignature), Buffer.from(razorpay_signature) ) ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully.",
    });
  } catch (error) {
    console.error(
      "Razorpay payment verification error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Payment verification failed.",
    });
  }
});

module.exports = router;