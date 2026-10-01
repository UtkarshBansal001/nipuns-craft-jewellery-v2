const SHIPROCKET_BASE_URL =
  "https://apiv2.shiprocket.in/v1/external";

let cachedToken = null;
let tokenCreatedAt = null;

const TOKEN_VALIDITY_MS = 9 * 24 * 60 * 60 * 1000;


// ======================================================
// SHIPROCKET API REQUEST
// ======================================================

async function shiprocketRequest(endpoint, options = {}) {
  const response = await fetch(
    `${SHIPROCKET_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        data?.error ||
        `Shiprocket API error: ${response.status}`
    );

    error.status = response.status;
    error.response = data;

    throw error;
  }

  return data;
}


// ======================================================
// GET SHIPROCKET TOKEN
// ======================================================

async function getShiprocketToken() {
  if (
    cachedToken &&
    tokenCreatedAt &&
    Date.now() - tokenCreatedAt < TOKEN_VALIDITY_MS
  ) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD is missing."
    );
  }

  const response = await shiprocketRequest(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (!response?.token) {
    throw new Error(
      "Shiprocket login succeeded but no token was returned."
    );
  }

  cachedToken = response.token;
  tokenCreatedAt = Date.now();

  return cachedToken;
}


// ======================================================
// AUTHENTICATED REQUEST
// ======================================================

async function authenticatedRequest(
  endpoint,
  options = {}
) {
  let token = await getShiprocketToken();

  try {
    return await shiprocketRequest(
      endpoint,
      {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {

    // Token expired/revoked
    // Clear token and retry once.
    if (
      error.status === 401 ||
      error.status === 403
    ) {
      cachedToken = null;
      tokenCreatedAt = null;

      token = await getShiprocketToken();

      return await shiprocketRequest(
        endpoint,
        {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    throw error;
  }
}


// ======================================================
// CREATE SHIPROCKET ORDER + SHIPMENT
// ======================================================

async function createShiprocketOrder({
  order,
  customer,
}) {
  if (!order) {
    throw new Error(
      "Order is required for Shiprocket."
    );
  }

  if (!customer) {
    throw new Error(
      "Customer is required for Shiprocket."
    );
  }

  const pickupLocation =
    process.env.SHIPROCKET_PICKUP_LOCATION;

  if (!pickupLocation) {
    throw new Error(
      "SHIPROCKET_PICKUP_LOCATION is missing."
    );
  }

  const defaultWeight =
    Number(
      process.env.SHIPROCKET_DEFAULT_WEIGHT
    ) || 0.20;

  const length =
    Number(process.env.SHIPROCKET_LENGTH) || 15;

  const breadth =
    Number(process.env.SHIPROCKET_BREADTH) || 10;

  const height =
    Number(process.env.SHIPROCKET_HEIGHT) || 5;


  // ====================================================
  // ORDER ITEMS
  // ====================================================

  const orderItems = order.items.map(
    (item) => ({
      name: item.name,

      sku:
        item.productCode ||
        (
          item.product
            ? item.product.toString()
            : ""
        ) ||
        `NCJ-${Date.now()}`,

      units: item.quantity,

      selling_price: item.price,

      discount: 0,

      tax: 0,

      hsn: "",
    })
  );


  // ====================================================
  // PAYMENT METHOD
  // ====================================================

  const paymentMethod =
    order.paymentMethod === "online"
      ? "Prepaid"
      : "COD";


  // ====================================================
  // CUSTOMER
  // ====================================================

  const customerName =
    customer.name?.trim() || "Customer";


  // ====================================================
  // SHIPROCKET PAYLOAD
  // ====================================================

  const payload = {
    order_id:
      order.invoiceNumber,

    order_date:
      new Date(order.createdAt)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),

    pickup_location:
      pickupLocation,

    channel_id: "",

    comment:
      `Nipun's Craft Jewellery - ${order.invoiceNumber}`,

    // --------------------------------------------------
    // BILLING
    // --------------------------------------------------

    billing_customer_name:
      customerName,

    billing_last_name:
      "",

    billing_address:
      order.address,

    billing_address_2:
      "",

    billing_city:
      order.city,

    billing_pincode:
      order.pinCode,

    billing_state:
      order.state,

    billing_country:
      "India",

    billing_email:
      customer.email || "",

    billing_phone:
      order.phone,


    // --------------------------------------------------
    // SHIPPING
    // --------------------------------------------------

    shipping_is_billing:
      true,

    shipping_customer_name:
      customerName,

    shipping_last_name:
      "",

    shipping_address:
      order.address,

    shipping_address_2:
      "",

    shipping_city:
      order.city,

    shipping_pincode:
      order.pinCode,

    shipping_state:
      order.state,

    shipping_country:
      "India",

    shipping_email:
      customer.email || "",

    shipping_phone:
      order.phone,


    // --------------------------------------------------
    // PRODUCTS
    // --------------------------------------------------

    order_items:
      orderItems,


    // --------------------------------------------------
    // PAYMENT
    // --------------------------------------------------

    payment_method:
      paymentMethod,


    // --------------------------------------------------
    // AMOUNTS
    // --------------------------------------------------

    shipping_charges:
      order.shippingAmount || 0,

    giftwrap_charges:
      0,

    transaction_charges:
      0,

    total_discount:
      order.discountAmount || 0,

    sub_total:
      order.subtotal,


    // --------------------------------------------------
    // PACKAGE
    // --------------------------------------------------

    length,

    breadth,

    height,

    weight:
      defaultWeight,
  };


  console.log(
    "Creating Shiprocket order:",
    order.invoiceNumber
  );


  const response =
    await authenticatedRequest(
      "/orders/create/adhoc",
      {
        method: "POST",

        body:
          JSON.stringify(payload),
      }
    );


  if (!response?.order_id) {
    throw new Error(
      "Shiprocket order was created but order_id was not returned."
    );
  }


  console.log(
    "Shiprocket order created:",
    response.order_id
  );


  return response;
}


// ======================================================
// ASSIGN AWB
// ======================================================

async function assignShiprocketAWB(
  shipmentId
) {
  if (!shipmentId) {
    throw new Error(
      "Shiprocket shipment ID is required for AWB."
    );
  }


  console.log(
    "Assigning Shiprocket AWB:",
    shipmentId
  );


  const response =
    await authenticatedRequest(
      "/courier/assign/awb",
      {
        method: "POST",

        body:
          JSON.stringify({
            shipment_id:
              Number(shipmentId),
          }),
      }
    );


  return response;
}


// ======================================================
// REQUEST PICKUP
// ======================================================

async function requestShiprocketPickup(
  shipmentId
) {
  if (!shipmentId) {
    throw new Error(
      "Shiprocket shipment ID is required for pickup."
    );
  }


  console.log(
    "Requesting Shiprocket pickup:",
    shipmentId
  );


  const response =
    await authenticatedRequest(
      "/courier/generate/pickup",
      {
        method: "POST",

        body:
          JSON.stringify({
            shipment_id: [
              Number(shipmentId),
            ],
          }),
      }
    );


  return response;
}


// ======================================================
// CREATE SHIPROCKET ORDER + ASSIGN AWB
// ======================================================
//
// IMPORTANT:
// Pickup is NOT requested here.
//
// Flow:
// Confirmed
//    ↓
// Create Shiprocket Order
//    ↓
// Get Shipment ID
//    ↓
// Assign AWB
//    ↓
// Admin marks Shipped
//    ↓
// Request Pickup
//
// ======================================================

async function createShipmentForOrder({
  order,
  customer,
}) {

  // ----------------------------------------------------
  // CREATE ORDER
  // ----------------------------------------------------

  const orderResponse =
    await createShiprocketOrder({
      order,
      customer,
    });


  const shiprocketOrderId =
    orderResponse.order_id;


  const shipmentId =
    orderResponse.shipment_id;


  if (!shipmentId) {
    throw new Error(
      "Shiprocket did not return a shipment ID."
    );
  }


  // ----------------------------------------------------
  // ASSIGN AWB
  // ----------------------------------------------------

  const awbResponse =
    await assignShiprocketAWB(
      shipmentId
    );


  // ----------------------------------------------------
  // EXTRACT AWB DETAILS
  // ----------------------------------------------------

  const awbDetails =
    awbResponse?.response?.data ||
    awbResponse?.data ||
    awbResponse;


  const awbCode =
    awbDetails?.awb_code ||
    awbResponse?.awb_code ||
    "";


  const courierName =
    awbDetails?.courier_name ||
    awbResponse?.courier_name ||
    "";


  console.log(
    "Shiprocket AWB:",
    awbCode
  );

  console.log(
    "Shiprocket Courier:",
    courierName
  );


  // ----------------------------------------------------
  // RETURN DETAILS
  // ----------------------------------------------------

  return {

    shiprocketOrderId,

    shiprocketShipmentId:
      shipmentId,

    awbCode,

    courierName,

    rawOrderResponse:
      orderResponse,

    rawAwbResponse:
      awbResponse,
  };
}


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

  getShiprocketToken,

  createShiprocketOrder,

  assignShiprocketAWB,

  requestShiprocketPickup,

  createShipmentForOrder,

};