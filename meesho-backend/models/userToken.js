const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String
    },
    userType: { 
      type: String,
      required: true,
      enum: ["Admin", "Client"] // Define possible reference models
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel" // Dynamically determine the reference model
    },
    userModel: {
      type: String,
      required: true,
      enum: ["Admin", "Client"] // Define possible reference models
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
)
const User = mongoose.model("User", userSchema);

module.exports = User;   