async function sendPhoneOTP(phone, otp) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authKey || !templateId) {
    throw new Error("MSG91 credentials are not configured.");
  }

  const response = await fetch(
    "https://control.msg91.com/api/v5/otp",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: phone,
        otp: otp,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || data.type === "error") {
    console.error("MSG91 error:", data);

    throw new Error(
      data.message || "Failed to send phone OTP."
    );
  }

  return data;
}

module.exports = {
  sendPhoneOTP,
};