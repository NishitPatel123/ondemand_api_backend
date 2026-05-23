const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function UpdateService(req, res) {
  try {
    const { id, category_id, name, description, price, status } = req.body;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Valid service ID is required" });
    }

    const db = await connectDB();
    const updateFields = { updated_at: new Date() };
    if (category_id && ObjectId.isValid(category_id)) updateFields.category_id = new ObjectId(category_id);
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (price) updateFields.price = parseFloat(price);
    if (status) updateFields.status = status;
    if (req.file) updateFields.image = `/uploads/services/${req.file.filename}`;

    const result = await db.collection("services").updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    return res.status(200).json({ success: true, message: "Service updated successfully" });
  } catch (error) {
    console.error("UpdateService.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { UpdateService };
