const crypto = require("crypto");

// Generate a 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

// Create SHA-256 hash of OTP
function hashOTP(otp) {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}

// OTP validity: 5 minutes
function getOTPExpiry() {
  return new Date(Date.now() + 5 * 60 * 1000);
}

module.exports = {
  generateOTP,
  hashOTP,
  getOTPExpiry,
};