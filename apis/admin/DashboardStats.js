const connectDB = require("../../db/dbConnect");

async function DashboardStats(req, res) {
  try {
    const db = await connectDB();

    const totalUsers = await db.collection("users").countDocuments({ role: "User" });
    const activeUsers = await db.collection("users").countDocuments({ role: "User", status: "Active" });
    const totalCategories = await db.collection("categories").countDocuments({});
    const totalServices = await db.collection("services").countDocuments({});
    const totalBookings = await db.collection("bookings").countDocuments({});
    const pendingBookings = await db.collection("bookings").countDocuments({ status: "Pending" });
    const ongoingBookings = await db.collection("bookings").countDocuments({ status: "Ongoing" });
    const completedBookings = await db.collection("bookings").countDocuments({ status: "Completed" });
    const cancelledBookings = await db.collection("bookings").countDocuments({ status: "Cancelled" });

    const revenueResult = await db.collection("payments").aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray();
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const ratingResult = await db.collection("feedbacks").aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]).toArray();
    const avgRating = ratingResult.length > 0 ? Math.round(ratingResult[0].avg * 10) / 10 : 0;

    const recentBookings = await db.collection("bookings").aggregate([
      { $sort: { created_at: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "services", localField: "service_id", foreignField: "_id", as: "service" } },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      { $project: { "user.password": 0 } },
    ]).toArray();

    const recentPayments = await db.collection("payments").aggregate([
      { $sort: { payment_date: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { "user.password": 0 } },
    ]).toArray();

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: { totalUsers, activeUsers, totalCategories, totalServices, totalBookings, pendingBookings, ongoingBookings, completedBookings, cancelledBookings, totalRevenue, avgRating, recentBookings, recentPayments },
    });
  } catch (error) {
    console.error("DashboardStats.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { DashboardStats };
