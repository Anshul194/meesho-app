const ShippingMethod = require("../models/shippingMethod");

// Create Shipping Method
exports.createShippingMethod = async (req, res) => {
  try {
    const { name, charge, description } = req.body;
    const method = new ShippingMethod({ name, charge, description });
    await method.save();
    res.status(201).json({ success: true, data: method });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All Shipping Methods
exports.getAllShippingMethods = async (req, res) => {
  try {
    const methods = await ShippingMethod.find();
    res.json({ success: true, data: methods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Shipping Method
exports.updateShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, charge, description } = req.body;
    const method = await ShippingMethod.findByIdAndUpdate(
      id,
      { name, charge, description },
      { new: true }
    );
    if (!method) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: method });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Shipping Method
exports.deleteShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const method = await ShippingMethod.findByIdAndDelete(id);
    if (!method) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
