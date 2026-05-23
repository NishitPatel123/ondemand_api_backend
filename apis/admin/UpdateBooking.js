const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function UpdateBooking(req, res) {
  try {
    const { id, status, start_datetime, complete_datetime } = req.body;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Valid booking ID is required" });
    }

    const validStatuses = ["Pending", "Ongoing", "Completed", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const db = await connectDB();
    const updateFields = { updated_at: new Date() };
    if (status) updateFields.status = status;
    if (start_datetime) updateFields.start_datetime = new Date(start_datetime);
    if (complete_datetime) updateFields.complete_datetime = new Date(complete_datetime);

    const result = await db.collection("bookings").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const booking = result;
    if (status) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(booking.user_id) });
      const service = await db.collection("services").findOne({ _id: new ObjectId(booking.service_id) });
      if (user && service) {
        const { sendBookingConfirmation, sendBookingUpdate, sendBookingCancellation, sendPaymentReceipt } = require("../../utils/emailService");
        if (status === "Cancelled") {
          sendBookingCancellation(user, service, booking).catch(console.error);
        } else if (status === "Ongoing") {
          sendBookingConfirmation(user, service, booking).catch(console.error);
        } else {
          sendBookingUpdate(user, service, booking).catch(console.error);
        }

        // If booking is confirmed/completed and payment is successful, send the payment receipt
        if ((status === "Ongoing" || status === "Completed") && booking.payment_status === "Success") {
          const payment = await db.collection("payments").findOne({
            booking_id: booking._id,
            status: "Success"
          });
          const paymentInfo = payment ? {
            transaction_id: payment.transaction_id,
            razorpay_order_id: payment.razorpay_order_id,
            payment_date: payment.payment_date,
            payment_type: payment.payment_type || "Razorpay",
            amount: payment.amount || booking.amount || service.price
          } : {
            transaction_id: "N/A (Prepaid)",
            razorpay_order_id: "N/A",
            payment_date: booking.updated_at || new Date(),
            payment_type: "Razorpay",
            amount: booking.amount || service.price
          };
          sendPaymentReceipt(user, service, booking, paymentInfo).catch(console.error);
        }
      }
    }

    return res.status(200).json({ success: true, message: "Booking updated successfully" });
  } catch (error) {
    console.error("UpdateBooking.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { UpdateBooking };
