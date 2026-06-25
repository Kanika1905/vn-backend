// controllers/tracking.controller.js
import OrderTracking from "../models/orderTracking.model.js";
import Order from "../models/order.model.js";
import { broadcastTracking } from "../realtime/trackingHub.js";

const STATUSES = ["preparing", "out_for_delivery", "arriving", "delivered"];

// POST /api/orders/:orderId/location
// Driver/agent app pushes the latest location (+ optional status / destination).
export const updateLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { lat, lng, status, destLat, destLng } = req.body;

    if (lat == null && lng == null && !status && destLat == null && destLng == null) {
      return res.status(400).json({ message: "Nothing to update" });
    }
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Use one of: ${STATUSES.join(", ")}` });
    }

    const set = { updatedAt: new Date() };
    if (lat != null) set.driverLat = Number(lat);
    if (lng != null) set.driverLng = Number(lng);
    if (status) set.status = status;
    if (destLat != null) set.destLat = Number(destLat);
    if (destLng != null) set.destLng = Number(destLng);

    const doc = await OrderTracking.findOneAndUpdate(
      { orderId },
      { $set: set, $setOnInsert: { orderId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const payload = serialize(doc);
    // Push to any connected WebSocket clients in real time.
    broadcastTracking(orderId, payload);

    return res.json({ success: true, tracking: payload });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update location", error: err.message });
  }
};

// GET /api/orders/:orderId/track
// Latest driver location + destination + status. Used for the initial load and
// as the 5s polling fallback when WebSockets aren't available.
export const getTrack = async (req, res) => {
  try {
    const { orderId } = req.params;
    const doc = await OrderTracking.findOne({ orderId });

    let orderStatus = null;
    let deliveryAddress = null;
    try {
      const order = await Order.findById(orderId).select("status deliveryAddress");
      orderStatus = order?.status ?? null;
      deliveryAddress = order?.deliveryAddress ?? null;
    } catch {
      // invalid id / not found — tracking can still respond
    }

    return res.json({
      orderId,
      status: doc?.status || "preparing",
      orderStatus,
      deliveryAddress,
      driver: doc && doc.driverLat != null ? { lat: doc.driverLat, lng: doc.driverLng } : null,
      destination: doc && doc.destLat != null ? { lat: doc.destLat, lng: doc.destLng } : null,
      updatedAt: doc?.updatedAt || null,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch tracking", error: err.message });
  }
};

function serialize(doc) {
  return {
    orderId: String(doc.orderId),
    status: doc.status,
    driver: doc.driverLat != null ? { lat: doc.driverLat, lng: doc.driverLng } : null,
    destination: doc.destLat != null ? { lat: doc.destLat, lng: doc.destLng } : null,
    updatedAt: doc.updatedAt,
  };
}
