const mongoose = require("mongoose");

const pendingSignupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    emailOtpHash: {
      type: String,
      required: true,
    },

    emailOtpExpires: {
      type: Date,
      required: true,
    },

    phoneOtpHash: {
      type: String,
      required: true,
    },

    phoneOtpExpires: {
      type: Date,
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    lastEmailOtpSentAt: {
      type: Date,
      default: null,
    },

    lastPhoneOtpSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete abandoned signup after 30 minutes
pendingSignupSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 1800 }
);

module.exports = mongoose.model(
  "PendingSignup",
  pendingSignupSchema
);