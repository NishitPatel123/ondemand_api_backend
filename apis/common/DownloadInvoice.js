const PDFDocument = require("pdfkit");
const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function DownloadInvoice(req, res) {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).send("Invalid Booking ID");

    const db = await connectDB();
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
    if (!booking) return res.status(404).send("Booking not found");

    const service = await db.collection("services").findOne({ _id: new ObjectId(booking.service_id) });
    const user = await db.collection("users").findOne({ _id: new ObjectId(booking.user_id) });

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Invoice-${booking._id}.pdf`;
    
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");
    
    doc.pipe(res);

    // Build PDF content
    doc.fontSize(25).fillColor("#4caf50").text("On-Demand Services", { align: "center" });
    doc.moveDown();
    doc.fontSize(20).fillColor("#333").text("Service Invoice", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(14).fillColor("#555").text(`Booking ID: ${booking._id}`);
    doc.text(`Date: ${new Date(booking.updated_at || booking.created_at).toLocaleDateString()}`);
    doc.moveDown();

    doc.text(`Customer Name: ${user ? user.name : "N/A"}`);
    doc.text(`Customer Email: ${user ? user.email : "N/A"}`);
    doc.moveDown();

    doc.rect(50, doc.y, 500, 2).fillColor("#eee").fill();
    doc.moveDown();

    doc.fontSize(16).fillColor("#333").text("Service Details");
    doc.moveDown(0.5);

    doc.fontSize(14).fillColor("#555");
    doc.text(`Service Name: ${service ? service.name : "N/A"}`);
    doc.text(`Status: ${booking.status}`);
    doc.text(`Scheduled Date: ${new Date(booking.booking_datetime).toLocaleString()}`);
    if (booking.start_datetime) {
      doc.text(`Arrival Time: ${new Date(booking.start_datetime).toLocaleString()}`);
    }
    doc.moveDown();

    doc.rect(50, doc.y, 500, 2).fillColor("#eee").fill();
    doc.moveDown();

    doc.fontSize(18).fillColor("#4caf50").text(`Total Amount: INR ${booking.amount || (service ? service.price : 0)}`, { align: "right" });

    doc.end();
  } catch (error) {
    console.error("PDF Download Error:", error);
    res.status(500).send("Internal Server Error generating PDF");
  }
}

module.exports = { DownloadInvoice };
