const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const adminAuthMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
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
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});


router.put("/change-password", adminAuthMiddleware, async (req, res) => {
try {
const { currentPassword, newPassword } = req.body;

if (!currentPassword || !newPassword) {
  return res.status(400).json({
    success: false,
    message: "Current password and new password are required.",
  });
}

if (newPassword.length < 6) {
  return res.status(400).json({
    success: false,
    message: "New password must be at least 6 characters.",
  });
}

const admin = await Admin.findById(req.admin.id);

if (!admin) {
  return res.status(404).json({
    success: false,
    message: "Admin not found.",
  });
}

const isPasswordValid = await bcrypt.compare(
  currentPassword,
  admin.password
);

if (!isPasswordValid) {
  return res.status(401).json({
    success: false,
    message: "Current password is incorrect.",
  });
}

const isSamePassword = await bcrypt.compare(
  newPassword,
  admin.password
);

if (isSamePassword) {
  return res.status(400).json({
    success: false,
    message:
      "New password must be different from current password.",
  });
}

admin.password = await bcrypt.hash(newPassword, 10);

await admin.save();

res.json({
  success: true,
  message: "Password changed successfully.",
});

} catch (error) {
console.error(
"Change password error:",
error.message
);

res.status(500).json({
  success: false,
  message: "Server error while changing password.",
});

}
});

module.exports = router;