const connectDB = require("../../db/dbConnect");

async function GetCategories(req, res) {
  try {
    const db = await connectDB();
    const collection = db.collection("categories");

    const categories = await collection
      .find({ status: "Active" })
      .sort({ name: 1 })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("GetCategories.js: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { GetCategories };
