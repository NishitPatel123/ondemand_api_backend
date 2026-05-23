const connectDB = require("../../db/dbConnect");

async function GetBookings(req, res) {
  try {
    const db = await connectDB();
    const bookings = await db.collection("bookings").aggregate([
      { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "services", localField: "service_id", foreignField: "_id", as: "service" } },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "categories", localField: "service.category_id", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $project: { "user.password": 0 } },
      { $sort: { created_at: -1 } },
    ]).toArray();

    return res.status(200).json({ success: true, message: "Bookings fetched successfully", data: bookings });
  } catch (error) {
    console.error("GetBookings.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { GetBookings };
