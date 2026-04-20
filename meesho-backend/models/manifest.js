const mongoose = require("mongoose");
const manifestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    fileName: {
      type: String,
    },
    filePath: {
      type: String,
    },
    marketPlace: {
      type: String,
    },
    isDownloaded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Manifest = mongoose.model("Manifest", manifestSchema);

module.exports = Manifest;
