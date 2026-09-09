const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const adminAuth = require("../middleware/authMiddleware");
const customerAuth = require("../middleware/customerAuthMiddleware");


const router = express.Router();

// Customer Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
  name: name.trim(),
  email: email.toLowerCase().trim(),
  password: hashedPassword,
  phone: phone ? phone.trim() : "",
});

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
      message: "Account created successfully",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      },
    });
  } catch (error) {
    console.error("Customer signup error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
});

// Customer Login
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
      },
    });
  } catch (error) {
    console.error("Customer login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// Customer - Update Profile
router.put("/profile", customerAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    const customer = await Customer.findById(req.customer.id);

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
    console.error("Customer profile update error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
});

// Admin - Get All Customers
router.get("/admin/all", adminAuth, async (req, res) => {
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
    console.error("Fetch customers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers.",
    });
  }
});

module.exports = router;