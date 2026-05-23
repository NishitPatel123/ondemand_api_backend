const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function DeleteFeedback(req, res) {
  try {
    const { id } = req.params;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid feedback ID" });
    }

    const db = await connectDB();
    const result = await db.collection("feedbacks").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    return res.status(200).json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("DeleteFeedback.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { DeleteFeedback };
