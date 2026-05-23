const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Ensure upload directories exist (prevents ENOENT operation errors) ────────
const uploadDirs = [
  "uploads/categories",
  "uploads/services",
  "uploads/profiles",
];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ── Storage for Category Images ───────────────────────────────────────────────
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/categories"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

// ── Storage for Service Images ────────────────────────────────────────────────
const serviceStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/services"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

// ── Storage for Profile Images ────────────────────────────────────────────────
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profiles"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

// ── File Filter (images only) ─────────────────────────────────────────────────
// const imageFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|webp/;
//   const isValid = allowedTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );
//   if (isValid) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"));
//   }
// };

const categoryUpload = multer({ storage: categoryStorage,  });
const serviceUpload = multer({ storage: serviceStorage });
const profileUpload = multer({ storage: profileStorage });

module.exports = { categoryUpload, serviceUpload, profileUpload };
