const mongoose = require("mongoose");
const { orderSchema } = require("./order");
const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
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
  { timestamps: { createdAt: true, updatedAt: true } }
);
const transactionSchema = new mongoose.Schema(
  {
    transactionNo: {
      type: String,
    },
    amountDebit: {
      type: Number,
    },
    amountCredit: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    balance: {
      type: Number,
    },
    screenshot: {
      type: String,
    },
    status: {
      type: String, // Pending || Approved || Rejected OR ORDER STATUS
    },
    payment_status: {
      type: String, // Pending || Done
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    order: {
      client: {
        type: clientSchema, // Embedding the client schema directly into the order schema
        
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
            required: true,
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

      totalPrice: {
        type: Number,
      },
    },
    t_type: {
      type: String, // payment_request // order_creation // wallet_update // order_update
    },
    remarks: {
      type: String,
    },
    marketPlaceOrderNumber: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
