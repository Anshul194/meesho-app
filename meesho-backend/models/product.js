const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productSKU: {
      type: String,
      required: true,
      unique: true,
    },
    masterSKU: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterSKU",
      required: true,
    },

    fileName: {
      type: String,
    },
    filePath: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
