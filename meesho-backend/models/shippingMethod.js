const mongoose = require("mongoose");

const shippingMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  charge: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

const ShippingMethod = mongoose.model("ShippingMethod", shippingMethodSchema);

module.exports = ShippingMethod;
