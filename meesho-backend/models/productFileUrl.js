const mongoose = require("mongoose");
const productFileUrlSchema = new mongoose.Schema(
  {
    productFileUrlId: {
      type: String,
      default: "NEX001",
    },
    fileName: {
      type: String,
    },
    filePath: {
      type: String,
    },
    googleDriveURL: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const ProductFileURL = mongoose.model("ProductFileURL", productFileUrlSchema);

module.exports = ProductFileURL;
