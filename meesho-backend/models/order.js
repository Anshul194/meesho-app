const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    gstNo: {
      type: String,
    },
    googleAuth: {
      email: {
        type: String,
      },
      password: {
        type: String,
      },
    },
    meeshoAuth: {
      email: {
        type: String,
      },
      password: {
        type: String,
      },
    },
  },
  { timestamps: true } // Moved timestamps option here
);

const orderItemSchema = new mongoose.Schema(
  {
    client: {
      type: clientSchema,
    },
    marketPlaceOrderNumber: {
      type: String,
    },
    productId: {
      type: String,
    },
    product: {
      type: {
        productName: {
          type: String,
        },
        productSKU: {
          type: String,
        },
        masterSKU: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MasterSKU",
        },
        fileName: {
          type: String,
        },
        filePath: {
          type: String,
        },
      },
    },
    productName: {
      type: String,
    },
    productSKU: {
      type: String,
    },
    masterSKU: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    status: {
      type: String,
      // Order Placed ||  Cancelled ||  Right RTO Return ||  Right Customer Return || Wrong RTO Return || Wrong Customer Return
    },
    productPrice: {
      type: Number,
    },
    packingCharge: {
      type: Number,
    },
    shippingMethod: {
      type: String,
    },
    shippingCharge: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },
    updateCount: {
      type: Number,
      default: 0,
    },
    orderPlacedAt: {
      type: Date,
    },
    marketId: {
      type: String,
    },
    trackingId: {
      type: String,
    },
    trackingUrl: {
      type: String,
    },
    trackingLabelPath: {
      type: String,
    },
    trackingLabelName: {
      type: String,
    },
    shippingPartnerName: {
      type: String,
    },
  },
  { timestamps: true } // Moved timestamps option here
);

const orderSchema = new mongoose.Schema(
  {
    marketPlace: {
      type: String,
    },
    clientId: {
      type: String,
    },
    client: {
      type: clientSchema,
    },
    orders: [orderItemSchema], // Moved the orderItemSchema here
    labelPath: {
      type: String,
    },
    labelName: {
      type: String,
    },
    shippingLabelPath: {
      type: String,
    },
    shippingLabelName: {
      type: String,
    },
    isLableDownloaded: {
      type: Boolean,
      default: false,
    },
    revisions: {
      type: Number,
    },
    status: {
      type: String,
      // Order Placed ||  Cancelled ||  Right RTO Return ||  Right Customer Return || Wrong RTO Return || Wrong Customer Return
    },
    packingCharge: {
      type: Number,
    },
    shippingMethod: {
      type: String,
    },
    shippingCharge: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },
    marketPlaceOrderNumber: {
      type: String,
    },
    updateCount: {
      type: Number,
      default: 0,
    },
    orderPlacedAt: {
      type: Date,
    },
    marketId: {
      type: String,
    },
    trackingId: {
      type: String,
    },
    trackingUrl: {
      type: String,
    },
    trackingLabelPath: {
      type: String,
    },
    trackingLabelName: {
      type: String,
    },
    shippingPartnerName: {
      type: String,
    },
  },
  { timestamps: true } // Moved timestamps option here
);

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order, orderSchema };
