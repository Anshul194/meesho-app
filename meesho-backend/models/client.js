const mongoose = require("mongoose");
const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true, // Assuming clientName is a required field
    },
    walletBalance: {
      type: Number,
      default: 0, // Assuming walletBalance starts with 0 by default
    },
    email: {
      type: String,
      required: true,
      unique: true, // Assuming email should be unique for each client
    },
    password: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      default: null, // Assuming endDate is optional and can be null
    },
    phone: {
      type: String, // Changed to String, considering international phone numbers
      required: true,
    },
    gstNo: {
      type: String,
    },
    googleAuth: {
      // Changed to googleAuth for clarity
      email: {
        type: String,
      },
      password: {
        type: String,
      },
    },
    meeshoAuth: {
      // Changed to meeshoAuth for clarity
      email: {
        type: String,
      },
      password: {
        type: String,
      },
    },
  },

  { timestamps: { createdAt: true, updatedAt: true } }
);
const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
