const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Offer = require("../models/Offer");
const adminAuth = require("../middleware/authMiddleware");
const customerAuth = require("../middleware/customerAuthMiddleware");
const Razorpay = require("razorpay");

const {
  createShipmentForOrder,
  assignShiprocketAWB,
  requestShiprocketPickup,
} = require("../services/shiprocketService");

const {
  sendOrderPlacedEmail,
  sendOrderConfirmedEmail,
  sendOrderShippedEmail,
} = require("../services/emailService");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// CREATE ORDER
// ======================================================

router.post("/", customerAuth, async (req, res) => {
  const MAX_TRANSACTION_RETRIES = 3;

  let lastError = null;

  for (
    let attempt = 1;
    attempt <= MAX_TRANSACTION_RETRIES;
    attempt++
  ) {
    const session = await mongoose.startSession();

    try {
      const invoiceNumber = `NCJ-${new Date()
        .getFullYear()}-${Date.now()
        .toString()
        .slice(-5)}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;

      console.log(
        `Creating order. Transaction attempt ${attempt}/${MAX_TRANSACTION_RETRIES}`
      );

      let createdOrder = null;

      await session.withTransaction(
        async () => {
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

          // ==================================================
          // REQUIRED ORDER DETAILS
          // ==================================================

          if (
            !items ||
            !Array.isArray(items) ||
            items.length === 0 ||
            !phone ||
            !address ||
            !city ||
            !pinCode ||
            !state ||
            !paymentMethod
          ) {
            throw new Error(
              "Please provide all required order details."
            );
          }

          // ==================================================
          // PREVENT DUPLICATE ONLINE PAYMENT
          // ==================================================

          if (
            paymentMethod === "online" &&
            razorpayPaymentId
          ) {
            const existingOrder = await Order.findOne({
              razorpayPaymentId,
            }).session(session);

            if (existingOrder) {
              throw new Error(
                "This payment has already been used."
              );
            }
          }

          // ==================================================
          // ONLINE PAYMENT DETAILS REQUIRED
          // ==================================================

          if (paymentMethod === "online") {
            if (
              !razorpayOrderId ||
              !razorpayPaymentId
            ) {
              throw new Error(
                "Verified payment details are required."
              );
            }
          }

          // ==================================================
          // VERIFY RAZORPAY PAYMENT
          // ==================================================

          if (paymentMethod === "online") {
            const razorpayOrder =
              await razorpay.orders.fetch(
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
              throw new Error(
                "Payment does not belong to this customer."
              );
            }

            if (
              razorpayPayment.order_id !==
                razorpayOrder.id ||
              razorpayPayment.status !== "captured" ||
              razorpayPayment.currency !== "INR" ||
              razorpayPayment.amount !==
                razorpayOrder.amount
            ) {
              throw new Error(
                "Payment verification failed."
              );
            }
          }

          // ==================================================
          // GET ACTUAL PRODUCTS FROM DATABASE
          // ==================================================

          const productIds = items.map(
            (item) => item.product
          );

          const products = await Product.find({
            _id: {
              $in: productIds,
            },
          }).session(session);

          if (
            products.length !==
            new Set(
              productIds.map((id) => id.toString())
            ).size
          ) {
            throw new Error(
              "One or more products are no longer available."
            );
          }

          const productMap = new Map(
            products.map((product) => [
              product._id.toString(),
              product,
            ])
          );

          let subtotal = 0;

          // ==================================================
          // PREPARE ORDER ITEMS
          // ==================================================

          const orderItems = items.map((item) => {
            const product = productMap.get(
              item.product.toString()
            );

            if (!product) {
              throw new Error(
                "Product not found."
              );
            }

            if (
              !Number.isInteger(item.quantity) ||
              item.quantity < 1
            ) {
              throw new Error(
                "Invalid product quantity."
              );
            }

            if (
              item.quantity > product.stock
            ) {
              throw new Error(
                `${product.name} has only ${product.stock} item(s) in stock.`
              );
            }

            const itemPrice = Number(
              product.price
            );

            subtotal +=
              itemPrice * item.quantity;

            return {
              product: product._id,
              name: product.name,
              price: itemPrice,
              quantity: item.quantity,
              productCode:
                product.productCode || "",
            };
          });

          // ==================================================
          // COUPON / OFFER
          // ==================================================

          let discountAmount = 0;
          let appliedCoupon = null;

          if (couponCode) {
            const normalizedCoupon =
              couponCode.trim().toUpperCase();

            const offer = await Offer.findOne({
              code: normalizedCoupon,
              isActive: true,
            }).session(session);

            if (!offer) {
              throw new Error(
                "Invalid or expired coupon."
              );
            }

            const now = new Date();

            if (
              offer.startDate &&
              now < offer.startDate
            ) {
              throw new Error(
                "This coupon is not active yet."
              );
            }

            if (
              offer.endDate &&
              now > offer.endDate
            ) {
              throw new Error(
                "This coupon has expired."
              );
            }

            if (
              offer.minOrderValue &&
              subtotal < offer.minOrderValue
            ) {
              throw new Error(
                `Minimum order value for this coupon is ₹${offer.minOrderValue}.`
              );
            }

            if (
              offer.usageLimit &&
              offer.usedCount >= offer.usageLimit
            ) {
              throw new Error(
                "This coupon has reached its usage limit."
              );
            }

            if (
              offer.discountType === "percentage"
            ) {
              discountAmount =
                (subtotal *
                  Number(offer.discountValue || 0)) /
                100;

              if (offer.maxDiscount) {
                discountAmount = Math.min(
                  discountAmount,
                  Number(offer.maxDiscount)
                );
              }
            } else {
              discountAmount = Number(
                offer.discountValue || 0
              );
            }

            discountAmount = Math.min(
              discountAmount,
              subtotal
            );

            appliedCoupon = normalizedCoupon;

            offer.usedCount =
              Number(offer.usedCount || 0) + 1;

            await offer.save({ session });
          }

          // ==================================================
          // SHIPPING
          // ==================================================

          const shippingAmount =
            subtotal - discountAmount >= 999
              ? 0
              : 49;

          const totalAmount =
            subtotal -
            discountAmount +
            shippingAmount;

          // ==================================================
          // REDUCE STOCK
          // ==================================================

          for (const item of orderItems) {
            const updatedProduct =
              await Product.findOneAndUpdate(
                {
                  _id: item.product,
                  stock: {
                    $gte: item.quantity,
                  },
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
                `${item.name} is no longer available in the requested quantity.`
              );
            }
          }

          // ==================================================
          // CREATE ORDER
          // ==================================================

          const order = new Order({
            customer: req.customer.id,

            items: orderItems,

            phone,
            address,
            city,
            pinCode,
            state,

            subtotal,
            discountAmount,
            shippingAmount,
            totalAmount,

            couponCode:
              appliedCoupon || "",

            paymentMethod,

            paymentStatus:
              paymentMethod === "online"
                ? "Paid"
                : "Pending",

            razorpayOrderId:
              paymentMethod === "online"
                ? razorpayOrderId
                : undefined,

            razorpayPaymentId:
              paymentMethod === "online"
                ? razorpayPaymentId
                : undefined,

            invoiceNumber,

            orderStatus: "Pending",
          });

          await order.save({
            session,
          });

          createdOrder = order;
        },
        {
          readPreference: "primary",
          readConcern: {
            level: "local",
          },
          writeConcern: {
            w: "majority",
          },
        }
      );

      // ==================================================
      // TRANSACTION SUCCESS
      // ==================================================

      if (!createdOrder) {
        throw new Error(
          "Order could not be created."
        );
      }

      console.log(
        "Order created successfully:",
        createdOrder.invoiceNumber
      );

      // ==================================================
      // SEND ORDER PLACED EMAIL
      // ==================================================

      try {
        await sendOrderPlacedEmail(
          req.customer,
          createdOrder
        );
      } catch (emailError) {
        console.error(
          "Order placed email failed:",
          emailError.message
        );
      }

      return res.status(201).json({
        success: true,
        message: "Order placed successfully.",
        order: createdOrder,
      });
    } catch (error) {
      lastError = error;

      const isWriteConflict =
        error?.code === 112 ||
        error?.codeName === "WriteConflict" ||
        error?.errorLabels?.includes(
          "TransientTransactionError"
        ) ||
        error?.message
          ?.toLowerCase()
          .includes("write conflict");

      console.error(
        `Create order attempt ${attempt} failed:`,
        error
      );

      if (
        isWriteConflict &&
        attempt < MAX_TRANSACTION_RETRIES
      ) {
        const waitTime = 150 * attempt;

        console.log(
          `MongoDB write conflict detected. Retrying in ${waitTime}ms...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, waitTime)
        );

        continue;
      }

      let statusCode = 500;

      if (
        error.message?.includes(
          "required order details"
        ) ||
        error.message?.includes(
          "Invalid product quantity"
        ) ||
        error.message?.includes(
          "Product not found"
        ) ||
        error.message?.includes(
          "no longer available"
        ) ||
        error.message?.includes(
          "only"
        ) ||
        error.message?.includes(
          "Invalid or expired coupon"
        ) ||
        error.message?.includes(
          "not active yet"
        ) ||
        error.message?.includes(
          "has expired"
        ) ||
        error.message?.includes(
          "Minimum order value"
        ) ||
        error.message?.includes(
          "usage limit"
        ) ||
        error.message?.includes(
          "already been used"
        ) ||
        error.message?.includes(
          "Verified payment"
        ) ||
        error.message?.includes(
          "Payment does not belong"
        ) ||
        error.message?.includes(
          "Payment verification failed"
        )
      ) {
        statusCode = 400;
      }

      return res.status(statusCode).json({
        success: false,
        message:
          error.message ||
          "Failed to create order.",
      });
    } finally {
      await session.endSession();
    }
  }

  return res.status(500).json({
    success: false,
    message:
      lastError?.message ||
      "Failed to create order after multiple attempts.",
  });
});


// ======================================================
// CUSTOMER ORDERS
// ======================================================

router.get(
  "/my-orders",
  customerAuth,
  async (req, res) => {
    try {
      const orders = await Order.find({
        customer: req.customer.id,
      })
        .sort({
          createdAt: -1,
        })
        .populate(
          "items.product",
          "name images price"
        );

      return res.json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "Customer orders error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch orders.",
      });
    }
  }
);


// ======================================================
// ADMIN - ALL ORDERS
// ======================================================

router.get(
  "/admin/all",
  adminAuth,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .sort({
          createdAt: -1,
        })
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "items.product",
          "name images price"
        );

      return res.json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "Admin orders error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch orders.",
      });
    }
  }
);


// ======================================================
// ADMIN - UPDATE ORDER STATUS
// ======================================================

router.put(
  "/:id/status",
  adminAuth,
  async (req, res) => {
    const {
      status,
      courierName,
      trackingNumber,
      trackingUrl,
    } = req.body;

    const validStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const session =
      await mongoose.startSession();

    try {
      let updatedOrder = null;
      let previousStatus = null;

      await session.withTransaction(
        async () => {
          const order =
            await Order.findById(
              req.params.id
            ).session(session);

          if (!order) {
            throw new Error(
              "Order not found."
            );
          }

          previousStatus =
            order.orderStatus;

          // ==================================================
          // PREVENT INVALID STATUS TRANSITIONS
          // ==================================================

          const allowedTransitions = {
            Pending: [
              "Confirmed",
              "Cancelled",
            ],
            Confirmed: [
              "Shipped",
              "Cancelled",
            ],
            Shipped: [
              "Delivered",
            ],
            Delivered: [],
            Cancelled: [],
          };

          if (
            status !== previousStatus &&
            !allowedTransitions[
              previousStatus
            ]?.includes(status)
          ) {
            throw new Error(
              `Cannot change order status from ${previousStatus} to ${status}.`
            );
          }

          // ==================================================
          // SHIPPED DETAILS
          // ==================================================

          if (status === "Shipped") {
            if (
              !courierName &&
              !order.courierName
            ) {
              throw new Error(
                "Courier name is required before shipping."
              );
            }

            if (
              !trackingNumber &&
              !order.trackingNumber &&
              !order.awbCode
            ) {
              throw new Error(
                "Tracking/AWB number is required before shipping."
              );
            }

            order.courierName =
              courierName ||
              order.courierName;

            order.trackingNumber =
              trackingNumber ||
              order.trackingNumber ||
              order.awbCode;

            order.trackingUrl =
              trackingUrl ||
              order.trackingUrl;

            order.shippedAt =
              order.shippedAt ||
              new Date();
          }

          // ==================================================
          // DELIVERED
          // ==================================================

          if (status === "Delivered") {
            order.deliveredAt =
              order.deliveredAt ||
              new Date();

            order.shiprocketStatus =
              "Delivered";
          }

          // ==================================================
          // CANCELLED - RESTORE STOCK
          // ==================================================

          if (
            status === "Cancelled" &&
            previousStatus !== "Cancelled"
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

          order.orderStatus = status;

          updatedOrder = await order.save({
            session,
          });
        },
        {
          readPreference: "primary",
          readConcern: {
            level: "local",
          },
          writeConcern: {
            w: "majority",
          },
        }
      );

      // ==================================================
      // PENDING -> CONFIRMED
      // CREATE SHIPROCKET ORDER + AWB
      // ==================================================

      if (
        previousStatus === "Pending" &&
        status === "Confirmed"
      ) {
        try {
          const customer =
            await require(
              "../models/Customer"
            ).findById(
              updatedOrder.customer
            );

          if (!customer) {
            throw new Error(
              "Customer not found for Shiprocket order."
            );
          }

          const shipment =
            await createShipmentForOrder({
              order: updatedOrder,
              customer,
            });

          updatedOrder =
            await Order.findByIdAndUpdate(
              updatedOrder._id,
              {
                courierName:
                  shipment.courierName || "",
                trackingNumber:
                  shipment.awbCode || "",
                awbCode:
                  shipment.awbCode || "",
                shiprocketOrderId:
                  shipment.shiprocketOrderId,
                shiprocketShipmentId:
                  shipment.shiprocketShipmentId,
                shiprocketStatus:
                  "AWB Assigned",
              },
              {
                new: true,
              }
            );

          console.log(
            "Shiprocket shipment created:",
            shipment
          );
        } catch (shiprocketError) {
          console.error(
            "Shiprocket shipment creation failed:",
            shiprocketError
          );

          return res.status(200).json({
            success: true,
            message:
              "Order confirmed, but Shiprocket shipment creation failed. Please retry Shiprocket processing.",
            order: updatedOrder,
            shiprocketError:
              shiprocketError.message,
          });
        }
      }

      // ==================================================
      // CONFIRMED -> SHIPPED
      // REQUEST PICKUP
      // ==================================================

      if (
        previousStatus === "Confirmed" &&
        status === "Shipped"
      ) {
        try {
          const freshOrder =
            await Order.findById(
              updatedOrder._id
            );

          if (
            freshOrder?.shiprocketShipmentId
          ) {
            await requestShiprocketPickup(
              freshOrder.shiprocketShipmentId
            );

            await Order.findByIdAndUpdate(
              updatedOrder._id,
              {
                shiprocketStatus:
                  "Pickup Requested",
              }
            );
          }
        } catch (shiprocketError) {
          console.error(
            "Shiprocket pickup request failed:",
            shiprocketError
          );
        }
      }

      // ==================================================
      // CONFIRMED EMAIL
      // ==================================================

      if (
        previousStatus === "Pending" &&
        status === "Confirmed"
      ) {
        try {
          const customer =
            await require(
              "../models/Customer"
            ).findById(
              updatedOrder.customer
            );

          if (customer) {
            await sendOrderConfirmedEmail(
              customer,
              updatedOrder
            );
          }
        } catch (emailError) {
          console.error(
            "Confirmed email failed:",
            emailError.message
          );
        }
      }

      // ==================================================
      // SHIPPED EMAIL
      // ==================================================

      if (
        previousStatus === "Confirmed" &&
        status === "Shipped"
      ) {
        try {
          const customer =
            await require(
              "../models/Customer"
            ).findById(
              updatedOrder.customer
            );

          if (customer) {
            const finalOrder =
              await Order.findById(
                updatedOrder._id
              );

            await sendOrderShippedEmail(
              customer,
              finalOrder || updatedOrder
            );
          }
        } catch (emailError) {
          console.error(
            "Shipped email failed:",
            emailError.message
          );
        }
      }

      const finalOrder =
        await Order.findById(
          updatedOrder._id
        )
          .populate(
            "customer",
            "name email phone"
          )
          .populate(
            "items.product",
            "name images price"
          );

      return res.json({
        success: true,
        message:
          `Order status updated to ${status}.`,
        order: finalOrder,
      });
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to update order status.",
      });
    } finally {
      await session.endSession();
    }
  }
);


module.exports = router;