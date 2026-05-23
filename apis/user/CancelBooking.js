const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function CancelBooking(req, res) {
  try {
    const { booking_id } = req.body;

    if (!booking_id || !ObjectId.isValid(booking_id)) {
      return res.status(400).json({ success: false, message: "Valid booking ID is required" });
    }

    const db = await connectDB();
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(booking_id),
      user_id: new ObjectId(req.user._id),
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ success: false, message: "Completed bookings cannot be cancelled" });
    }

    await db.collection("bookings").updateOne(
      { _id: new ObjectId(booking_id) },
      { $set: { status: "Cancelled", updated_at: new Date() } }
    );

    const user = await db.collection("users").findOne({ _id: new ObjectId(req.user._id) });
    const service = await db.collection("services").findOne({ _id: new ObjectId(booking.service_id) });
    if (user && service) {
      const { sendBookingCancellation } = require("../../utils/emailService");
      sendBookingCancellation(user, service, booking).catch(console.error);
    }

    return res.status(200).json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("CancelBooking.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { CancelBooking };
