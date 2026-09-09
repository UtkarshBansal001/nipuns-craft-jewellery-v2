const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },
        productCode: {
  type: String,
  default: "",
},

        image: {
          type: String,
          default: "",
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    pinCode: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },

    paymentStatus: {
  type: String,
  enum: ["Pending", "Paid", "Failed"],
  default: "Pending",
},

razorpayOrderId: {
  type: String,
  default: "",
},

razorpayPaymentId: {
  type: String,
  default: "",
},

    totalAmount: {
      type: Number,
      required: true,
    },
    subtotal: {
  type: Number,
  required: true,
},

discountAmount: {
  type: Number,
  default: 0,
},

couponCode: {
  type: String,
  default: "",
},

shippingAmount: {
  type: Number,
  default: 0,
},

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);