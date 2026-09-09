const express = require("express");
const Offer = require("../models/Offer");
const adminAuth = require("../middleware/authMiddleware");

const router = express.Router();

// Admin - Get All Offers
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    console.error("Fetch offers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch offers.",
    });
  }
});

// Admin - Create Offer
router.post("/", adminAuth, async (req, res) => {
  try {
    const {
      title,
      code,
      discountType,
      discountValue,
      minimumOrderValue,
      maxDiscount,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (
      !title ||
      !code ||
      !discountType ||
      discountValue === undefined ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const existingOffer = await Offer.findOne({
      code: code.toUpperCase().trim(),
    });

    if (existingOffer) {
      return res.status(409).json({
        success: false,
        message: "Offer code already exists.",
      });
    }

    const offer = await Offer.create({
      title: title.trim(),
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minimumOrderValue: minimumOrderValue || 0,
      maxDiscount: maxDiscount || 0,
      startDate,
      endDate,
      isActive: isActive !== false,
    });

    res.status(201).json({
      success: true,
      message: "Offer created successfully.",
      offer,
    });
  } catch (error) {
    console.error("Create offer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create offer.",
    });
  }
});

// Admin - Delete Offer
router.delete("/:offerId", adminAuth, async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findByIdAndDelete(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found.",
      });
    }

    res.json({
      success: true,
      message: "Offer deleted successfully.",
    });
  } catch (error) {
    console.error("Delete offer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete offer.",
    });
  }
});

// Customer - Apply Offer
router.post("/apply", async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and order amount are required.",
      });
    }

    const offer = await Offer.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive coupon code.",
      });
    }

    const now = new Date();

    if (now < offer.startDate || now > offer.endDate) {
      return res.status(400).json({
        success: false,
        message: "This offer has expired or is not active yet.",
      });
    }

    if (orderAmount < offer.minimumOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is ₹${offer.minimumOrderValue}.`,
      });
    }

    let discount = 0;

    if (offer.discountType === "percentage") {
      discount = (orderAmount * offer.discountValue) / 100;

      if (
        offer.maxDiscount > 0 &&
        discount > offer.maxDiscount
      ) {
        discount = offer.maxDiscount;
      }
    } else {
      discount = offer.discountValue;
    }

    if (discount > orderAmount) {
      discount = orderAmount;
    }

    const finalAmount = orderAmount - discount;

    res.json({
      success: true,
      message: "Coupon applied successfully.",
      offer: {
        id: offer._id,
        title: offer.title,
        code: offer.code,
      },
      discount,
      finalAmount,
    });
  } catch (error) {
    console.error("Apply offer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to apply coupon.",
    });
  }
});

module.exports = router;
