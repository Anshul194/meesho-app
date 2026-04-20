const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Assuming clientName is a required field
    },
    userType: {
      type: String, // Admin || Client
      required: true,
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
    phone: {
      type: String, // Changed to String, considering international phone numbers
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
    },
  },

  { timestamps: { createdAt: true, updatedAt: true } }
);
const User = mongoose.model("User", userSchema);

module.exports = User;
