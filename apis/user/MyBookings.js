const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function MyBookings(req, res) {
  try {
    const db = await connectDB();
    const bookings = await db.collection("bookings").aggregate([
      { $match: { user_id: new ObjectId(req.user._id) } },
      { $lookup: { from: "services", localField: "service_id", foreignField: "_id", as: "service" } },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "categories", localField: "service.category_id", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "feedbacks",
          localField: "_id",
          foreignField: "booking_id",
          as: "feedbacks",
        },
      },
      {
        $addFields: {
          hasFeedback: { $gt: [{ $size: "$feedbacks" }, 0] },
        },
      },
      { $project: { feedbacks: 0 } },
      { $sort: { created_at: -1 } },
    ]).toArray();

    return res.status(200).json({ success: true, message: "Bookings fetched successfully", data: bookings });
  } catch (error) {
    console.error("MyBookings.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { MyBookings };
