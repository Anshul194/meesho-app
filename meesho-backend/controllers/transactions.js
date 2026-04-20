const { default: mongoose } = require("mongoose");
const Client = require("../models/client");
const { Order } = require("../models/order");
// const Order = require("../models/order");
const Transaction = require("../models/transaction");

const createPaymentRequest = async (req, res) => {
  try {
    let amount_debit, amount_credit, t_status, trans_type, order_id;

    const { transactionNumber, amount, clientId, t_type } = req.body;

    if (!transactionNumber || !amount || !clientId || !t_type) {
      return res
        .status(400)
        .json({ message: "Missing required fields", success: false });
    }

    const foundClient = await Client.findById(clientId);
    if (!foundClient) {
      return res
        .status(404)
        .json({ message: "Client not found", success: false });
    }

    if (t_type === "payment_request") {
      amount_debit = 0;
      amount_credit = 0;
      t_status = "Pending";
      trans_type = "payment_request";
      t_remarks = "";
      paymentStatus = "Pending";
      order_id = "";
    }

    // Create a new transaction instance
    const newTransaction = new Transaction({
      transactionNo: transactionNumber,
      amountDebit: amount_debit,
      amountCredit: amount_credit,
      amount: amount,
      screenshot: req.file.filename,
      status: t_status,
      client: clientId,
      order: order_id,
      t_type: trans_type,
      remarks: t_remarks,
      payment_status: paymentStatus,
      balance: foundClient.walletBalance,
    });

    // Save the transaction to the database
    await newTransaction.save();

    // Respond with success message
    res
      .status(201)
      .json({ message: "Transaction created successfully", success: true });
  } catch (error) {
    // Handle errors
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    let {
      clientId,
      t_type,
      page,
      limit,
      dateFrom,
      dateTo,
      searchKey,
      searchValue,
    } = req.query;

    // Pagination parameters
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 0;
    const skip = (page - 1) * limit;

    // Filter object
    let filter = {};

    // Apply filters based on query parameters
    if (t_type) {
      if (t_type === "payment_request") {
        filter.t_type = t_type;
        filter.payment_status = "Pending";
      }
    }

    if (dateFrom && dateTo) {
      // Convert 'from' and 'to' strings to Date objects
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      toDate.setDate(toDate.getDate() + 1);

      // Add date range filter
      filter.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    if (searchKey && searchValue) {
      if (searchKey === "Amount") {
        if (searchValue && isNaN(searchValue)) {
          return res.status(200).json({
            message: "Amount must be a number",
            success: false,
          });
        }

        filter["$or"] = [
          { amountCredit: searchValue },
          { amountDebit: searchValue },
        ];
      } else if (searchKey === "transactionNo") {
        {
          filter.transactionNo = new RegExp(searchValue, "i");
        }
      } else if (searchKey === "marketPlaceOrderNumber") {
        filter["$or"] = [
          { marketPlaceOrderNumber: new RegExp(searchValue) },
          { "order.marketPlaceOrderNumber": new RegExp(searchValue) },
        ];
      }
    }

    if (clientId) {
      if (clientId !== "all") {
        filter.client = clientId;
      }
    }

    // Fetch transactions with pagination and filters
    let transactionsQuery = Transaction.find(filter)
      .populate("client")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total number of transactions (for pagination)
    const totalTransactions = await Transaction.countDocuments(filter);

    const transactions = await transactionsQuery;

    // Filter transactions by clientId if provided
    if (transactions.length === 0) {
      return res.status(200).json({
        message: "No Transactions found.",
        success: true,
        transactions,
        totalTransactions,
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
      });
    }

    // Return the transactions as JSON response
    return res.status(200).json({
      message: "Transactions fetched successfully",
      success: true,
      transactions,
      totalTransactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limit),
    });
  } catch (error) {
    // If an error occurs, send an error response
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createWalletUpdateTransaction = async (req, res) => {
  try {
    // Extract transaction details from the request body
    const { client, amount, order, item, remarks, addOrLess } = req.body;

    if (!client || !amount || !order || !addOrLess) {
      return res
        .status(400)
        .json({ message: "Missing required fields", success: false });
    }

    const foundClient = await Client.findById(client);

    if (!foundClient) {
      return res
        .status(404)
        .json({ message: "Client not found", success: false });
    }

    let amountDebit;
    let amountCredit;
    let balance;
    let walletChange;

    if (addOrLess === "add") {
      amountCredit = amount;
      amountDebit = 0;
      walletChange = parseInt(amount);
      balance = foundClient.walletBalance + walletChange;
    } else {
      amountDebit = amount;
      amountCredit = 0;
      walletChange = -parseInt(amount);
      balance = foundClient.walletBalance + walletChange;
    }

    foundClient.walletBalance += walletChange;
    await foundClient.save();
    let orderDoc;
    orderDoc = await Order.findById(order);
    if (item) {
      orderDoc = orderDoc.orders.find(
        (order) => order._id.toString() === item.toString()
      );
    }

    const newTransaction = new Transaction({
      client,
      order: orderDoc,
      remarks,
      amountDebit,
      amountCredit,
      balance,
      t_type: "wallet_update",
      marketPlaceOrderNumber: orderDoc.marketPlaceOrderNumber,
    });

    // Save the transaction to the database
    await newTransaction.save();

    // Respond with success message`
    res
      .status(201)
      .json({ message: "Transaction created successfully", success: true });
  } catch (error) {
    // Handle errors
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
const updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId, status: txnStatus } = req.body;

    const transaction = await Transaction.findById(transactionId).populate(
      "client"
    );

    if (!transaction) {
      return res
        .status(404)
        .json({ message: "Transaction not found", success: false });
    }
    if (
      !txnStatus ||
      txnStatus === "" ||
      txnStatus === null ||
      txnStatus === undefined ||
      !transactionId
    ) {
      return res
        .status(404)
        .json({ message: "Something went wrong! Try again.", success: false });
    }
    const foundClient = await Client.findById(transaction.client._id);
    if (!foundClient) {
      return res
        .status(404)
        .json({ message: "Client not found", success: false });
    }

    if (txnStatus === "Approved") {
      foundClient.walletBalance += transaction.amount;
      await foundClient.save();

      transaction.payment_status = "Done";
      transaction.status = "Approved";
      transaction.balance = foundClient.walletBalance;
      transaction.amountCredit = transaction.amount;
      await transaction.save();

      return res.status(200).json({
        message: "Transaction status updated successfully",
        success: true,
      });
    } else if (txnStatus === "Rejected") {
      transaction.payment_status = "Done";
      transaction.status = "Rejected";
      transaction.balance = foundClient.walletBalance;
      transaction.amountCredit = 0;
      await transaction.save();

      return res.status(200).json({
        message: "Transaction status updated successfully",
        success: true,
      });
    }
    // Respond with success message
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

module.exports = {
  createPaymentRequest,
  createWalletUpdateTransaction,
  getAllTransactions,
  updateTransactionStatus,
};
