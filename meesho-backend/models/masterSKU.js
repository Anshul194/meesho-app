const mongoose = require("mongoose");

const masterSKUSchema = new mongoose.Schema(
  {
    masterSKU: {
      type: String,
    },
    price: {
      type: Number,
    },
    productSKUs: {
      type: Array,
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const MasterSKU = mongoose.model("MasterSKU", masterSKUSchema);

module.exports = MasterSKU;
