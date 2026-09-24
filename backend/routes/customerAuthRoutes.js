const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const PendingSignup = require("../models/PendingSignup");
const adminAuth = require("../middleware/authMiddleware");
const customerAuth = require("../middleware/customerAuthMiddleware");

const {
  generateOTP,
  hashOTP,
  getOTPExpiry,
} = require("../utils/otpUtils");

const { sendEmailOTP } = require("../services/emailService");
const { sendPhoneOTP } = require("../services/smsService");

const router = express.Router();


// =====================================================
// CUSTOMER SIGNUP - SEND OTP
// =====================================================

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Basic validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Check existing customer
    const existingCustomer = await Customer.findOne({
      email: cleanEmail,
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    // Generate ONE OTP for both email and phone
    const otp = generateOTP();

    const otpHash = hashOTP(otp);
    const otpExpires = getOTPExpiry();

    // Remove previous pending signup
    await PendingSignup.deleteMany({
      email: cleanEmail,
    });

    // Hash password before temporary storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create pending signup
    await PendingSignup.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,

      emailOtpHash: otpHash,
      emailOtpExpires: otpExpires,

      phoneOtpHash: otpHash,
      phoneOtpExpires: otpExpires,

      emailVerified: false,
      phoneVerified: false,

      lastEmailOtpSentAt: new Date(),
      lastPhoneOtpSentAt: new Date(),
    });

    // Send OTP to email
    await sendEmailOTP(cleanEmail, otp);

    // Send OTP to phone
    await sendPhoneOTP(cleanPhone, otp);

    res.status(201).json({
      success: true,
      message:
        "OTP sent successfully to your email and phone number.",
      requiresOTP: true,
      email: cleanEmail,
      phone: cleanPhone,
    });

  } catch (error) {
    console.error("Customer signup OTP error:", error);

    res.status(500).json({
      success: false,
      message:
        "Unable to send OTP. Please check your email and phone details and try again.",
    });
  }
});


// =====================================================
// VERIFY EMAIL + PHONE OTP
// =====================================================

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    // Find pending signup
    const pendingSignup = await PendingSignup.findOne({
      email: cleanEmail,
    });

    if (!pendingSignup) {
      return res.status(404).json({
        success: false,
        message:
          "Signup session not found or has expired. Please create your account again.",
      });
    }

    // Check OTP expiry
    const now = new Date();

    if (
      now > pendingSignup.emailOtpExpires ||
      now > pendingSignup.phoneOtpExpires
    ) {
      await PendingSignup.deleteOne({
        _id: pendingSignup._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Validate OTP
    const enteredOtpHash = hashOTP(cleanOtp);

    const emailOtpValid =
      enteredOtpHash === pendingSignup.emailOtpHash;

    const phoneOtpValid =
      enteredOtpHash === pendingSignup.phoneOtpHash;

    if (!emailOtpValid || !phoneOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please enter the correct OTP.",
      });
    }

    // Double-check email doesn't already exist
    const existingCustomer = await Customer.findOne({
      email: cleanEmail,
    });

    if (existingCustomer) {
      await PendingSignup.deleteOne({
        _id: pendingSignup._id,
      });

      return res.status(409).json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    // Create actual customer
    const customer = await Customer.create({
      name: pendingSignup.name,
      email: pendingSignup.email,
      password: pendingSignup.password,
      phone: pendingSignup.phone,

      emailVerified: true,
    });

    // Delete temporary signup
    await PendingSignup.deleteOne({
      _id: pendingSignup._id,
    });

    // Generate customer JWT
    const token = jwt.sign(
      {
        id: customer._id,
        role: "customer",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      success: true,
      message: "Account verified and created successfully.",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      },
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    res.status(500).json({
      success: false,
      message: "OTP verification failed. Please try again.",
    });
  }
});


// =====================================================
// RESEND OTP
// =====================================================

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const pendingSignup = await PendingSignup.findOne({
      email: cleanEmail,
    });

    if (!pendingSignup) {
      return res.status(404).json({
        success: false,
        message:
          "Signup session not found. Please create your account again.",
      });
    }

    // Prevent rapid resend
    if (pendingSignup.lastEmailOtpSentAt) {
      const secondsSinceLastOTP =
        (Date.now() -
          pendingSignup.lastEmailOtpSentAt.getTime()) /
        1000;

      if (secondsSinceLastOTP < 60) {
        const remainingSeconds = Math.ceil(
          60 - secondsSinceLastOTP
        );

        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
          retryAfter: remainingSeconds,
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const otpExpires = getOTPExpiry();

    // Update OTP
    pendingSignup.emailOtpHash = otpHash;
    pendingSignup.emailOtpExpires = otpExpires;

    pendingSignup.phoneOtpHash = otpHash;
    pendingSignup.phoneOtpExpires = otpExpires;

    pendingSignup.lastEmailOtpSentAt = new Date();
    pendingSignup.lastPhoneOtpSentAt = new Date();

    await pendingSignup.save();

    // Send new OTP
    await sendEmailOTP(
      pendingSignup.email,
      otp
    );

    await sendPhoneOTP(
      pendingSignup.phone,
      otp
    );

    res.json({
      success: true,
      message:
        "New OTP sent successfully to your email and phone.",
    });

  } catch (error) {
    console.error("Resend OTP error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to resend OTP. Please try again.",
    });
  }
});


// =====================================================
// CUSTOMER LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: customer._id,
        role: "customer",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      },
    });

  } catch (error) {
    console.error(
      "Customer login error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});


// =====================================================
// CUSTOMER - UPDATE PROFILE
// =====================================================

router.put(
  "/profile",
  customerAuth,
  async (req, res) => {
    try {
      const { name, phone } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required.",
        });
      }

      const customer = await Customer.findById(
        req.customer.id
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }

      customer.name = name.trim();

      if (phone !== undefined) {
        customer.phone = phone.trim();
      }

      await customer.save();

      res.json({
        success: true,
        message: "Profile updated successfully.",
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || "",
        },
      });

    } catch (error) {
      console.error(
        "Customer profile update error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to update profile.",
      });
    }
  }
);


// =====================================================
// ADMIN - GET ALL CUSTOMERS
// =====================================================

router.get(
  "/admin/all",
  adminAuth,
  async (req, res) => {
    try {
      const customers = await Customer.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: customers.length,
        customers,
      });

    } catch (error) {
      console.error(
        "Fetch customers error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch customers.",
      });
    }
  }
);


module.exports = router;