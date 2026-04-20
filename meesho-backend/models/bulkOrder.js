const mongoose = require("mongoose");
const bulkOrderSchema = new mongoose.Schema(
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
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const BulkOrder = mongoose.model("BulkOrder", bulkOrderSchema);

module.exports = BulkOrder;
