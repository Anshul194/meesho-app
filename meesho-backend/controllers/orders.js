// const Order = require("../models/order");
require("dotenv").config();
require("express");

const fs = require("fs");
const Client = require("../models/client");
const BulkOrder = require("../models/bulkOrder");
const Product = require("../models/product");
const ProductFileURL = require("../models/productFileUrl");
const Transaction = require("../models/transaction");
const xlsx = require("xlsx");
const PDFMerger = require("pdf-merger-js");
const MasterSKU = require("../models/masterSKU");
const { Order } = require("../models/order");

const path = require("path");

// const { ObjectId } = require("mongodb");
const { mongoose } = require("mongoose");

// const createOrder = async (req, res) => {
//   try {
//     const file = req.file;

//     const { clientId, marketPlace, products } = req.body;

//     let labelPath;
//     let labelName;
//     if (file) {
//       labelPath = file.path;
//       labelName = file.originalname;
//     }

//     const client = await Client.findById(clientId);
//     if ( !client) {
//       throw new Error(" client not found");
//     }
//     for (let index = 0; index < products.length; index++) {
//       const element = products[index];
//       const product = await Product.findById(element._id);
//       if ( !product) {
//         throw new Error("Product not found for id:" + element._id);
//       }
//     }

//     const masterSKUDoc = await MasterSKU.findById(product.masterSKU);
//     const masterSKU = masterSKUDoc.masterSKU;

//     const newMarketplaceOrderNumber = await findDuplicateOrder(
//       orderData.marketplaceOrderNumber
//     );

//     const newOrder = new Order({
//       marketPlace: orderData.marketplace,
//       labelPath,
//       labelName,
//       product: product,
//       client: client,
//       masterSKU,
//       marketPlaceOrderNumber: newMarketplaceOrderNumber,
//       productPrice: parseFloat(orderData.productPrice),
//       status: "Order Placed",
//       quantity: parseFloat(orderData.quantity),

//       packingCharge: parseFloat(orderData.packingCharge),
//       totalPrice: parseFloat(orderData.totalPrice),
//     });

//     // Save the order to the database
//     const orderDoc = await newOrder.save();

//     const newTransaction = new Transaction({
//       amountDebit: parseFloat(newOrder.totalPrice),
//       amountCredit: 0,
//       client: clientId,
//       order: orderDoc,
//       t_type: "order_creation",
//       balance: client.walletBalance - parseFloat(newOrder.totalPrice),
//       marketPlaceOrderNumber: newMarketplaceOrderNumber,
//     });

//     // Save the transaction to the database
//     await newTransaction.save();
//     // update client wallet balance
//     client.walletBalance -= parseFloat(newOrder.totalPrice);
//     await client.save();

//     // Send response back to the client
//     res
//       .status(200)
//       .json({ message: "Order created successfully", success: true });
//   } catch (error) {
//     console.log("error", error);
//     res.status(500).json({ message: error.message, success: false });
//   }
// };

const createOrder = async (req, res) => {
  try {
    // Separate handling for 'label' and 'shippinglabel' fields
    let labelPath = null, labelName = null, shippingLabelPath = null, shippingLabelName = null;
    if (req.files) {
      if (req.files['label'] && req.files['label'][0]) {
        labelPath = req.files['label'][0].path;
        labelName = req.files['label'][0].originalname;
      }
      if (req.files['shippinglabel'] && req.files['shippinglabel'][0]) {
        shippingLabelPath = req.files['shippinglabel'][0].path;
        shippingLabelName = req.files['shippinglabel'][0].originalname;
      }
    } else if (req.file) {
      // fallback for single file upload (legacy)
      labelPath = req.file.path;
      labelName = req.file.originalname;
    }

    const { clientId, marketPlace, products: api_products } = req.body;
    const products = JSON.parse(api_products);

    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    if (client.endDate) {
      const today = new Date();
      const endDate = new Date(client.endDate); // Assuming it's like "2023-08-04"

      // Normalize times to compare only dates
      today.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (endDate < today) {
        return res.status(400).json({
          message: "Client's time limit has expired",
          success: false,
        });
      }
    }
    const orderNumbers = new Set();

    for (const productData of products) {
      const product = await Product.findById(productData._id);
      if (!product) {
        throw new Error("Product not found for id: " + productData._id);
      }

      if (orderNumbers.has(productData.marketplaceOrderNumber)) {
        return res.status(400).json({
          message: "Duplicate Marketplace Order Number found",
          success: false,
        });
      }

      orderNumbers.add(productData.marketplaceOrderNumber);
    }

    const orderArr = [];

    for (const product of products) {
      const newMarketplaceOrderNumber = await findDuplicateOrder(
        product.marketplaceOrderNumber
      );
      const masterSKU = await MasterSKU.findById(product.masterSKU);
      const productDoc = await Product.findById(product._id);

      // Use shippingMethod and shippingCharge from product or from req.body (for single shipping method per order)
      const shippingMethod = product.shippingMethod || req.body.shippingMethod || null;
      const shippingCharge = product.shippingCharge !== undefined ? Number(product.shippingCharge) : (req.body.shippingCharge !== undefined ? Number(req.body.shippingCharge) : 0);

      // Calculate total price including shipping charge
      const totalPrice = parseFloat(product.price * product.quantity + 5 + shippingCharge);

      const myOrder = {
        product: productDoc,
        client: client,
        masterSKU: masterSKU.masterSKU,
        marketPlaceOrderNumber: newMarketplaceOrderNumber,
        productPrice: parseFloat(product.price),
        status: "Order Placed",
        quantity: parseFloat(product.quantity),
        packingCharge: 5,
        shippingMethod: shippingMethod,
        shippingCharge: shippingCharge,
        totalPrice: totalPrice,
      };

      // push order in orderArr
      orderArr.push(myOrder);

      const newTransaction = new Transaction({
        amountDebit: myOrder.totalPrice,
        amountCredit: 0,
        client: clientId,
        order: myOrder,
        t_type: "order_creation",
        balance: client.walletBalance - myOrder.totalPrice,
        marketPlaceOrderNumber: myOrder.marketPlaceOrderNumber,
      });

      await newTransaction.save();

      // Update client wallet balance
      client.walletBalance -= myOrder.totalPrice;
      await client.save();
    }
    const order = new Order({
      marketPlace: marketPlace,
      labelPath: labelPath,
      labelName: labelName,
      shippingLabelPath: shippingLabelPath,
      shippingLabelName: shippingLabelName,
      orders: orderArr,
      clientId: clientId,
      revisions: 1,
    });

    await order.save();

    // Send response back to the client
    res
      .status(200)
      .json({ message: "Orders created successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

const getAllOrders = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const {
      clientId,
      orderNumber,
      status,
      from,
      to,
      isLableDownloaded,
      page,
      limit,
    } = req.query;

    const filter = {};

    if (clientId) {
      filter.$and = [
        {
          $or: [
            { clientId: clientId },
            { "client._id": new mongoose.Types.ObjectId(clientId) },
            { client: new mongoose.Types.ObjectId(clientId) },
          ],
        },
      ];
    }


    if (orderNumber) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { marketPlaceOrderNumber: new RegExp(orderNumber) },
          { "orders.marketPlaceOrderNumber": new RegExp(orderNumber) },
        ],
      });
    }

    // Add marketPlace filter if present
    if (req.query.marketPlace) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { marketPlace: { $regex: new RegExp(req.query.marketPlace, "i") } },
          { "orders.marketPlace": { $regex: new RegExp(req.query.marketPlace, "i") } }
        ]
      });
    }

    if (status) {
      filter.$and = filter.$and || [];

      if (status === "pending") {
        filter.$and.push({ "orders.status": "Order Placed" });
      } else {
        filter.$and.push({ "orders.status": status });
      }
    }

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);

      filter.$and = filter.$and || [];
      filter.$and.push({
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      });
    }

    if (isLableDownloaded) {
      filter.$and = filter.$and || [];
      filter.$and.push({ isLableDownloaded: isLableDownloaded });
    }

    // Pagination parameters
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 0;
    const skip = (pageNumber - 1) * pageSize;

    console.log(filter);
    // Fetch orders with pagination and filters
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // console.log(orders);

    // Check if there are no orders
    if (!orders || orders.length === 0) {
      return res.status(200).json({
        message: "No orders found",
        success: true,
        data: [],
      });
    }

    // Count total number of orders (for pagination)
    const totalOrders = await Order.countDocuments(filter);

    // Return the list of orders
    res.status(200).json({
      message: "Orders retrieved successfully",
      data: orders,
      success: true,
      currentPage: pageNumber,
      totalOrders,
      totalPages: Math.ceil(totalOrders / pageSize),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const uploadBulkOrder = async (req, res) => {
  try {
    const file = req.file;
    const { clientId, marketPlace, marketplace } = req.body;
    const finalMarketPlace = marketPlace || marketplace;

    if (!clientId) {
      return res.status(400).json({
        message: "No client id provided",
        success: false,
      });
    }

    const client = await Client.findById(clientId);

    if (client.endDate) {
      const today = new Date();
      const endDate = new Date(client.endDate); // Assuming it's like "2023-08-04"

      // Normalize times to compare only dates
      today.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (endDate < today) {
        return res.status(400).json({
          message: "Client's time limit has expired",
          success: false,
        });
      }
    }
    if (!client) {
      return res.status(404).json({
        message: "Client not found",
        success: false,
      });
    }

    if (!file) {
      return res.status(400).json({
        message: "No file found",
        success: false,
      });
    }

    if (client.endDate) {
      const today = new Date();
      const endDate = new Date(client.endDate); // Assuming it's like "2023-08-04"

      // Normalize times to compare only dates
      today.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (endDate < today) {
        return res.status(400).json({
          message: "Client's time limit has expired",
          success: false,
        });
      }
    }

    const filePath = file.path;
    const fileName = file.originalname;
    // Make sure it is either Excel or CSV format otherwise return early
    const fileExtension = fileName.split(".").pop();
    if (fileExtension !== "xlsx") {
      return res.status(400).json({
        message: "Only xlsx files are supported",
        success: false,
      });
    }

    // Read the file and validate its contents
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON format
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // Extract headers (first row of the sheet)
    const headerColumns = Object.keys(jsonData[0]);

    // Construct array of objects with keys corresponding to headers
    const orders = jsonData.map((row) => {
      const obj = {};
      headerColumns.forEach((header) => {
        obj[header] = row[header];
      });
      return obj;
    });

    const expectedColumns = [
      "marketPlaceOrderNumber",
      "productSKU",
      "quantity",
    ];

    if (
      headerColumns.length !== expectedColumns.length ||
      !expectedColumns.every((col, index) => col === headerColumns[index])
    ) {
      return res.status(400).json({
        message: "Invalid columns or column names",
        success: false,
      });
    }

    // Validate each row for empty fields, negative quantity or productPrice
    const orderNumbers = new Set();
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];

      if (
        order.productSKU === undefined ||
        order.marketPlaceOrderNumber === undefined ||
        order.quantity === undefined ||
        order.quantity <= 0
      ) {
        return res.status(400).json({
          message:
            "Product SKU, Market Place Order Number, or Quantity is missing or invalid in row " +
            (i + 1),
          success: false,
        });
      }

      if (orderNumbers.has(order.marketPlaceOrderNumber)) {
        return res.status(400).json({
          message: "Duplicate Marketplace Order Number found in row " + (i + 1),
          success: false,
        });
      }

      orderNumbers.add(order.marketPlaceOrderNumber);
    }

    // Calculate total price for all orders
    let totalOrderPrice = 0;
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];

      const productSKU = order.productSKU;
      const product = await Product.findOne({ productSKU });
      if (!product) {
        return res.status(404).json({
          message: `Product with SKU ${productSKU} in row ${i + 1
            } not found in database.`,
          success: false,
        });
      }
      // get price from masterSKU
      const masterSKUDoc = await MasterSKU.findById(product.masterSKU);
      const product_price = masterSKUDoc.price;

      totalOrderPrice +=
        parseFloat(order.quantity) * parseFloat(product_price) + 5; // Assuming packing charge is 5 for each product
    }

    // Fetch client wallet balance

    // Check if client has sufficient balance

    if (totalOrderPrice > client.walletBalance) {
      const amountShort = totalOrderPrice - client.walletBalance;
      return res.status(400).json({
        message: `Insufficient balance. Short by  ₹${amountShort}/-`,
        success: false,
      });
    }

    // Process orders and create transactions
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const productSKU = order.productSKU;

      const product = await Product.findOne({ productSKU });
      const masterSKUDoc = await MasterSKU.findById(product.masterSKU);
      const product_price = masterSKUDoc.price;
      const masterSKU = masterSKUDoc.masterSKU;

      const quantity = parseInt(order.quantity);
      const packingCharge = 5;
      const totalPrice = parseFloat(product_price) * quantity + packingCharge;

      const newMarketPlaceOrderNumber = await findDuplicateOrder(
        String(order.marketPlaceOrderNumber)
      );

      const orderArr = [];

      const myOrder = {
        product: product,
        client: client,
        masterSKU,
        marketPlaceOrderNumber: newMarketPlaceOrderNumber,
        productPrice: parseFloat(product_price),
        status: "Order Placed",
        quantity: quantity,
        packingCharge: 5,
        totalPrice: parseFloat(totalPrice),
      };

      orderArr.push(myOrder);

      const orderDoc = new Order({
        marketPlace: finalMarketPlace,
        // labelPath: labelPath,
        // labelName: labelName,
        orders: orderArr,
        clientId: clientId,
        revisions: 1,
      });

      await orderDoc.save();

      // Create the transaction
      const newTransaction = new Transaction({
        amountDebit: totalPrice,
        amountCredit: 0,
        client: clientId,
        order: myOrder,
        t_type: "order_creation",
        balance: client.walletBalance - totalPrice,
        marketPlaceOrderNumber: newMarketPlaceOrderNumber,
      });

      await newTransaction.save();
      // Update client wallet balance
      client.walletBalance -= totalPrice;
      await client.save();
    }

    res.status(200).json({
      message: "Bulk Order from xlsx file created successfully",
      success: true,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: error.message, success: false });
  }
};

const getAllBulkOrders = async (req, res) => {
  try {
    let filter = {};

    // Extract query parameters for filtering
    const { clientId, from, to } = req.query;
    console.log(req.query);

    // Add filters based on query parameters
    if (clientId) {
      filter.client = clientId;
    }

    if (from && to) {
      // Convert 'from' and 'to' strings to Date objects
      const fromDate = new Date(from);
      const toDate = new Date(to);

      // Add date range filter
      filter.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const bulkOrders = await BulkOrder.find(filter).populate(
      "client",
      "clientName"
    );

    // Check if there are no orders
    if (!bulkOrders || bulkOrders.length === 0) {
      return res.status(404).json({
        message: "No orders found",
        success: false,
      });
    }

    // Return the list of orders
    res.status(200).json({
      message: "Orders retrieved successfully",
      data: bulkOrders,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const getOrdersForDashboard = async (req, res) => {
  try {
    const today = new Date();
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayOrders = await Order.countDocuments({
      updatedAt: {
        $gte: new Date(yesterday.setHours(0, 0, 0)),
        $lt: new Date(yesterday.setHours(23, 59, 59)),
      },
    });

    const todayOrders = await Order.countDocuments({
      // createdAt: {
      //   $gte: new Date(today.setHours(0, 0, 0)),
      //   $lt: new Date(today.setHours(23, 59, 59)),
      // },
      $or: [
        // Check if status is in the main order object
        {
          $and: [
            {
              createdAt: {
                $gte: new Date(today.setHours(0, 0, 0)),
                $lt: new Date(today.setHours(23, 59, 59)),
              },
            },
            { status: "Order Placed" },
          ],
        },
        // Check if status is in the orders array
        {
          orders: {
            $elemMatch: {
              status: "Order Placed",
              createdAt: {
                $gte: new Date(today.setHours(0, 0, 0)),
                $lt: new Date(today.setHours(23, 59, 59)),
              },
            },
          },
        },
      ],
    });

    const statusTypes = [
      "Cancelled",
      "Right RTO Return",
      "Right Customer Return",
      "Wrong RTO Return",
      "Wrong Customer Return",
    ];

    let yesterdayCounts = {};

    for (const status of statusTypes) {
      yesterdayCounts[status] = await Order.countDocuments({
        $or: [
          // Check if status is in the main order object
          {
            $and: [
              {
                updatedAt: {
                  $gte: new Date(yesterday.setHours(0, 0, 0)),
                  $lt: new Date(yesterday.setHours(23, 59, 59)),
                },
              },
              { status: status },
            ],
          },
          // Check if status is in the orders array
          {
            orders: {
              $elemMatch: {
                status: status,
                updatedAt: {
                  $gte: new Date(yesterday.setHours(0, 0, 0)),
                  $lt: new Date(yesterday.setHours(23, 59, 59)),
                },
              },
            },
          },
        ],
      });
    }

    // Construct the response object
    const response = {
      todayOrders: todayOrders,
      yesterdayOrders: yesterdayOrders,
      yesterdayCounts: yesterdayCounts,
    };

    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      data: response,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const getClientDashboard = async (req, res) => {
  try {
    const clientId = req.params.id;
    let walletBalance = 0;
    let productFile = {};

    const doc = await Client.findOne({ _id: clientId });

    if (doc) {
      walletBalance = doc.walletBalance;
    }

    const productFileData = await ProductFileURL.findOne({
      productFileUrlId: "NEX001",
    });
    if (productFileData) {
      productFile = productFileData;
    }

    // Combine the retrieved data
    const dashboardData = {
      walletBalance,
      productFile,
    };

    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      data: dashboardData,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const updateOrdersStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    // Loop through each order ID
    for (let i = 0; i < ids.length; i++) {
      const orderId = ids[i].orderId;
      const revisions = ids[i].revisions;

      const orderDoc = await Order.findById(orderId);

      if (revisions === 0) {
        let amount_debit = 0;
        let amount_credit = 0;
        let orderStatus = "";
        orderStatus = orderDoc.status;
        console.log("[updateOrdersStatus] Processing orderId:", orderId, "status:", orderStatus, "updateCount:", orderDoc.updateCount);
        if (orderStatus === "Order Placed" && orderDoc.updateCount !== 1) {
          const newOrder = new Order(orderDoc);
          newOrder.status = status;
          newOrder.createdAt = new Date();
          newOrder.updatedAt = new Date();
          console.log("[updateOrdersStatus] Creating new order revision:", newOrder);
          await newOrder.save();

          orderDoc.updateCount = 1;
          await orderDoc.save();

          const clientId = orderDoc.client._id;

          // Retrieve client's wallet balance
          const client = await Client.findById(clientId);
          console.log("[updateOrdersStatus] Client before update:", client);
          if (!client) {
            return res.status(404).json({
              message: "Client not found",
              success: false,
            });
          }

          const targetShippingMethodId = "69e60bb32e8678f757162c5c";
          const currentShippingMethod = orderDoc.shippingMethod;
          const currentShippingCharge = orderDoc.shippingCharge || 0;
          const currentPackingCharge = orderDoc.packingCharge || 0;
          const currentTotalPrice = orderDoc.totalPrice;

          console.log("[updateOrdersStatus] ShippingMethod:", currentShippingMethod, "ShippingCharge:", currentShippingCharge, "PackingCharge:", currentPackingCharge, "TotalPrice:", currentTotalPrice);

          if (status === "Cancelled") {
              // Always deduct packing charge on cancel
              amount_credit = currentTotalPrice - currentPackingCharge;
          } else if (status === "Right RTO Return" || status === "Right Customer Return") {
            if (currentShippingMethod === targetShippingMethodId) {
              amount_credit = currentTotalPrice - (currentPackingCharge + currentShippingCharge);
            } else {
              amount_credit = currentTotalPrice - currentPackingCharge;
            }
          } else {
            amount_credit = 0;
          }

          console.log("[updateOrdersStatus] Calculated amount_credit:", amount_credit);

          if (amount_credit > 0) {
            client.walletBalance += amount_credit;
            console.log("[updateOrdersStatus] Crediting wallet. New balance:", client.walletBalance);
          }
          amount_debit = 0;

          await client.save();

          const walletBalance = client.walletBalance;

          const newTransaction = new Transaction({
            amountDebit: amount_debit,
            amountCredit: amount_credit,
            client: clientId,
            order: orderDoc,
            t_type: "order_update",
            balance: walletBalance,
          });

          await newTransaction.save();
        } else {
          console.log("[updateOrdersStatus] No need to update");
        }
      } else if (revisions === 1) {
        const itemId = ids[i].itemId;

        for (let j = 0; j < orderDoc.orders.length; j++) {
          let amount_debit = 0;
          let amount_credit = 0;
          let orderStatus = "";

          const itemIdObjectId = new mongoose.Types.ObjectId(itemId);

          // Now you can compare them effectively
          if (orderDoc.orders[j]._id.equals(itemIdObjectId)) {
            orderStatus = orderDoc.orders[j].status;
            const uc = orderDoc.orders[j].updateCount;
            console.log("[updateOrdersStatus] Processing order item:", orderDoc.orders[j]._id, "status:", orderStatus, "updateCount:", uc);
            if (orderStatus === "Order Placed" && uc !== 1) {
              const clientId = orderDoc.orders[j].client._id;

              const client = await Client.findById(clientId);
              console.log("[updateOrdersStatus] Client before update:", client);

              if (!client) {
                return res.status(404).json({
                  message: "Client not found",
                  success: false,
                });
              }

              orderDoc.orders[j].updateCount = 1;

              await orderDoc.save();

              const old_order = orderDoc.orders[j];
              old_order.status = status;
              old_order.createdAt = new Date();
              old_order.updatedAt = new Date();

              const new_order = new Order({
                orders: old_order,
                clientId: clientId,
                revisions: 1,
                isLableDownloaded: orderDoc.isLableDownloaded,
              });

              console.log("[updateOrdersStatus] Creating new order revision for item:", new_order);
              await new_order.save();

              let walletBalance = 0;
              let amount_credit = 0;
              const targetShippingMethodId = "69e60bb32e8678f757162c5c";
              const currentShippingMethod = orderDoc.orders[j].shippingMethod;
              const currentShippingCharge = orderDoc.orders[j].shippingCharge || 0;
              const currentPackingCharge = orderDoc.orders[j].packingCharge || 0;
              const currentTotalPrice = orderDoc.orders[j].totalPrice;

              console.log("[updateOrdersStatus] ShippingMethod:", currentShippingMethod, "ShippingCharge:", currentShippingCharge, "PackingCharge:", currentPackingCharge, "TotalPrice:", currentTotalPrice);

              if (status === "Cancelled") {
                  // Always deduct packing charge on cancel
                  amount_credit = currentTotalPrice - currentPackingCharge;
              } else if (status === "Right RTO Return" || status === "Right Customer Return") {
                if (currentShippingMethod === targetShippingMethodId) {
                  amount_credit = currentTotalPrice - (currentPackingCharge + currentShippingCharge);
                } else {
                  amount_credit = currentTotalPrice - currentPackingCharge;
                }
              } else {
                amount_credit = 0;
              }

              console.log("[updateOrdersStatus] Calculated amount_credit:", amount_credit);

              if (amount_credit > 0) {
                client.walletBalance += amount_credit;
                await client.save();
                console.log("[updateOrdersStatus] Crediting wallet. New balance:", client.walletBalance);
              }
              amount_debit = 0;
              walletBalance = client.walletBalance;

              const newTransaction = new Transaction({
                amountDebit: amount_debit,
                amountCredit: amount_credit,
                client: clientId,
                order: orderDoc.orders[j],
                t_type: "order_update",
                balance: walletBalance,
              });

              await newTransaction.save();
            } else {
              console.log("[updateOrdersStatus] No need to update order item status");
            }
          }
        }
      }
    }
    res.status(200).json({
      message: "Orders updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

const findDuplicateOrder = async (marketPlaceOrderNumber) => {
  let newMarketPlaceOrderNumber = marketPlaceOrderNumber;

  const escapedMarketPlaceOrderNumber = marketPlaceOrderNumber.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  // Find orders with marketPlaceOrderNumber in the main document
  const existingOrdersMainDoc = await Order.find({
    marketPlaceOrderNumber: {
      $regex: new RegExp(
        "^" + escapedMarketPlaceOrderNumber + "(?:-S4S\\d{3})?$"
      ),
    },
    revisions: 0, // Only check documents without revisions
  });

  // Find orders with marketPlaceOrderNumber in the orders array
  const existingOrdersWithRevisions = await Order.find({
    revisions: 1, // Only check documents with revisions
    orders: {
      $elemMatch: {
        marketPlaceOrderNumber: {
          $regex: new RegExp(
            "^" + escapedMarketPlaceOrderNumber + "(?:-S4S\\d{3})?$"
          ),
        },
      },
    },
  });

  const existingOrders = [
    ...existingOrdersMainDoc,
    ...existingOrdersWithRevisions,
  ];

  if (existingOrders.length > 0) {
    // Find the highest suffix number
    let maxSuffixNumber = 0;
    existingOrders.forEach((order) => {
      if (order.revisions === 0) {
        const regex = /-S4S(\d{3})$/;
        const match = order.marketPlaceOrderNumber.match(regex);
        if (match) {
          const currentSuffixNumber = parseInt(match[1]);
          if (currentSuffixNumber > maxSuffixNumber) {
            maxSuffixNumber = currentSuffixNumber;
          }
        }
      } else if (order.revisions === 1) {
        order.orders.forEach((subOrder) => {
          const regex = /-S4S(\d{3})$/;
          const match = subOrder.marketPlaceOrderNumber.match(regex);
          if (match) {
            const currentSuffixNumber = parseInt(match[1]);
            if (currentSuffixNumber > maxSuffixNumber) {
              maxSuffixNumber = currentSuffixNumber;
            }
          }
        });
      }
    });

    // Increment the suffix number
    const newSuffixNumber = maxSuffixNumber + 1;
    const newSuffix = "-S4S" + newSuffixNumber.toString().padStart(3, "0");
    newMarketPlaceOrderNumber += newSuffix;
  }
  return newMarketPlaceOrderNumber;
};

const downloadLabels = async (req, res) => {
  try {
    const { ids, selectAll, isLableDownloaded } = req.body;

    let mergedPdfPath = [];
    var merger = new PDFMerger();

    // Define the query object based on selectAll flag
    const query = selectAll ? { _id: { $nin: ids } } : { _id: { $in: ids } };

    // Find orders based on the query
    const order1 = await Order.find(query).sort({ createdAt: -1 });

    const orders = order1.filter(
      (o) =>
        o.isLableDownloaded === isLableDownloaded && o.labelPath && o.labelName
    );

    if (orders.length > 0) {
      for (const order of orders) {
        const labelPath = order.labelPath;
        if (fs.existsSync(labelPath)) {
          mergedPdfPath.push(labelPath);
        } else {
          console.error(`File not found: ${labelPath}`);
        }
      }

      for (const path of mergedPdfPath) {
        // Check if the file has a PDF extension
        if (path.toLowerCase().endsWith(".pdf") && fs.existsSync(path)) {
          await merger.add(path);
        } else {
          console.error(`Invalid or non-existent PDF file: ${path}`);
        }
      }

      const tempMergedPdfPath = "labels.pdf";
      await merger.save(tempMergedPdfPath);

      // Check if the merged PDF file was created successfully
      if (fs.existsSync(tempMergedPdfPath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=labels.pdf`);

        res.sendFile(tempMergedPdfPath, { root: "." }, async (err) => {
          if (err) {
            console.error("Error sending file:", err);
            return res
              .status(500)
              .json({ message: "Error sending file", success: false });
          }

          // Delete the temporary merged PDF file after sending
          fs.unlinkSync(tempMergedPdfPath);
          if (!isLableDownloaded) {
            for (const order of orders) {
              if (order.isLableDownloaded === false) {
                order.isLableDownloaded = true;
                await order.save();
              }
            }
          }
        });
      } else {
        console.error("Merged PDF file was not created successfully");
        return res.status(500).json({
          message: "Merged PDF file was not created successfully",
          success: false,
        });
      }
    } else {
      return res
        .status(200)
        .json({ message: "No orders found", success: false });
    }
  } catch (error) {
    console.error("Error downloading labels:", error.message);
    res
      .status(500)
      .json({ message: "Error downloading labels", success: false });
  }
};

const uploadSingleLabel = async (req, res) => {
  try {
    const file = req.file;
    const orderId = req.body.orderId;

    let labelPath;
    let labelName;
    if (file) {
      labelPath = file.path;
      labelName = file.originalname;
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    // Update the existing order with the label information
    existingOrder.labelPath = labelPath;
    existingOrder.labelName = labelName;
    existingOrder.shippingLabelPath = labelPath;
    existingOrder.shippingLabelName = labelName;

    // Save the updated order to the database
    await existingOrder.save();

    // Send response back to the client
    res
      .status(200)
      .json({ message: "Label uploaded successfully", success: true });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: error.message, success: false });
  }
};

const updateOrdersStatusFromExcel = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "No file found",
        success: false,
      });
    }

    const filePath = file.path;
    const fileName = file.originalname;
    // Make sure it is either Excel or CSV format otherwise return early
    const fileExtension = fileName.split(".").pop();
    if (fileExtension !== "xlsx") {
      return res.status(400).json({
        message: "Only xlsx files are supported",
        success: false,
      });
    }

    // Read the file and validate its contents
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON format
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // Extract headers (first row of the sheet)
    const headerColumns = Object.keys(jsonData[0]);

    // Construct array of objects with keys corresponding to headers
    const orders = jsonData.map((row) => {
      const obj = {};
      headerColumns.forEach((header) => {
        obj[header] = row[header];
      });
      return obj;
    });

    const expectedColumns = ["marketPlaceOrderNumber", "status"];

    if (
      headerColumns.length !== expectedColumns.length ||
      !expectedColumns.every((col, index) => col === headerColumns[index])
    ) {
      return res.status(400).json({
        message: "Invalid columns or column names",
        success: false,
      });
    }

    // Validate each row for empty fields, negative quantity or productPrice
    let errorData = []; // Initialize with headers
    for (let i = 1; i < orders.length; i++) {
      const order = orders[i];

      if (
        order.status === undefined ||
        order.marketPlaceOrderNumber === undefined
      ) {
        return res.status(400).json({
          message:
            "empty Status or Market Place Order Number data in row " + (i + 1),
          success: false,
        });
      }
    }

    // *************************************************************************** //

    // Loop through each order ID
    for (let i = 0; i < orders.length; i++) {
      const market_place_order_number = orders[i].marketPlaceOrderNumber;
      const status_to_update = orders[i].status;
      console.log("market_place_order_number", market_place_order_number);
      console.log("status_to_update", status_to_update);

      const order = await Order.findOne({
        $or: [
          { marketPlaceOrderNumber: market_place_order_number },
          { "orders.marketPlaceOrderNumber": market_place_order_number },
        ],
      });
      if (!order) {
        console.log("Order not found for ", market_place_order_number);
        errorData.push({
          marketPlaceOrderNumber: market_place_order_number,
          status: status_to_update,
        });
        continue;
      }

      if (!order.revisions) {
        let amount_debit = 0;
        let amount_credit = 0;
        let orderStatus = "";
        orderStatus = order.status;
        if (orderStatus === "Order Placed") {
          order.status = status_to_update;
          await order.save();

          const clientId = order.client._id;

          // Retrieve client's wallet balance
          const client = await Client.findById(clientId);
          console.log("client", client);
          if (!client) {
            return res.status(404).json({
              message: "Client not found",
              success: false,
            });
          }

          const targetShippingMethodId = "69e60bb32e8678f757162c5c";
          const currentShippingMethod = order.shippingMethod;
          const currentShippingCharge = order.shippingCharge || 0;
          const currentPackingCharge = order.packingCharge || 0;
          const currentTotalPrice = order.totalPrice;

          if (status_to_update === "Cancelled") {
            if (currentShippingMethod === targetShippingMethodId) {
              amount_credit = currentTotalPrice;
            } else {
              amount_credit = currentTotalPrice - currentPackingCharge;
            }
          } else if (status_to_update === "Right RTO Return" || status_to_update === "Right Customer Return") {
            if (currentShippingMethod === targetShippingMethodId) {
              amount_credit = currentTotalPrice - (currentPackingCharge + currentShippingCharge);
            } else {
              amount_credit = currentTotalPrice - currentPackingCharge;
            }
          } else {
            amount_credit = 0;
          }

          if (amount_credit > 0) {
            client.walletBalance += amount_credit;
          }
          amount_debit = 0;

          await client.save();

          const walletBalance = client.walletBalance;

          const newTransaction = new Transaction({
            amountDebit: amount_debit,
            amountCredit: amount_credit,
            client: clientId,
            order,
            t_type: "order_update",
            balance: walletBalance,
          });

          await newTransaction.save();
        } else {
          console.log("no need to update");
        }
      } else if (order.revisions && order.revisions === 1) {
        for (let j = 0; j < order.orders.length; j++) {
          let itemId;
          if (
            order.orders[j].marketPlaceOrderNumber === market_place_order_number
          ) {
            itemId = order.orders[j]._id;

            for (let j = 0; j < order.orders.length; j++) {
              let amount_debit = 0;
              let amount_credit = 0;
              let orderStatus = "";

              const itemIdObjectId = new mongoose.Types.ObjectId(itemId);

              // Now you can compare them effectively
              if (order.orders[j]._id.equals(itemIdObjectId)) {
                orderStatus = order.orders[j].status;
                const uc = order.orders[j].updateCount;
                if (orderStatus === "Order Placed" && uc !== 1) {
                  const clientId = order.orders[j].client._id;

                  const client = await Client.findById(clientId);

                  if (!client) {
                    return res.status(404).json({
                      message: "Client not found",
                      success: false,
                    });
                  }

                  // order.orders[j].status = status_to_update;
                  // await order.save();
                  order.orders[j].updateCount = 1;
                  await order.save();

                  const old_order = order.orders[j];
                  old_order.status = status_to_update;
                  old_order.createdAt = new Date();
                  old_order.updatedAt = new Date();

                  const new_order = new Order({
                    orders: old_order,
                    clientId: clientId,
                    revisions: 1,
                    isLableDownloaded: order.isLableDownloaded,
                  });

                  await new_order.save();

                  let walletBalance = 0;
                  let amount_credit = 0;
                  const targetShippingMethodId = "69e60bb32e8678f757162c5c";
                  const currentShippingMethod = order.orders[j].shippingMethod;
                  const currentShippingCharge = order.orders[j].shippingCharge || 0;
                  const currentPackingCharge = order.orders[j].packingCharge || 0;
                  const currentTotalPrice = order.orders[j].totalPrice;

                  if (status_to_update === "Right RTO Return" || status_to_update === "Right Customer Return") {
                    if (currentShippingMethod === targetShippingMethodId) {
                      amount_credit = currentTotalPrice - (currentPackingCharge + currentShippingCharge);
                    } else {
                      amount_credit = currentTotalPrice - currentPackingCharge;
                    }
                  } else if (status_to_update === "Cancelled") {
                    if (currentShippingMethod === targetShippingMethodId) {
                      amount_credit = currentTotalPrice;
                    } else {
                      amount_credit = currentTotalPrice - currentPackingCharge;
                    }
                  } else {
                    amount_credit = 0;
                  }

                  if (amount_credit > 0) {
                    client.walletBalance += amount_credit;
                    await client.save();
                  }
                  amount_debit = 0;
                  walletBalance = client.walletBalance;

                  const newTransaction = new Transaction({
                    amountDebit: amount_debit,
                    amountCredit: amount_credit,
                    client: clientId,
                    order: order.orders[j],
                    t_type: "order_update",
                    balance: walletBalance,
                  });

                  await newTransaction.save();
                } else {
                  console.log("No need to update order item status");
                }
              }
            }
          }
        }
      }
    }

    if (errorData.length > 0) {
      res.status(200).json({
        message: "Orders updated successfully",
        success: true,
        errorData,
      });
    } else {
      res
        .status(200)
        .json({ message: "Orders updated successfully", success: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

const sendToDownloadedLables = async (req, res) => {
  try {
    const { ids, selectAll } = req.body;

    const query = selectAll ? { _id: { $nin: ids } } : { _id: { $in: ids } };

    // Find orders based on the query
    const orders = await Order.find(query).sort({ createdAt: -1 });

    for (const order of orders) {
      if (order.isLableDownloaded === false) {
        order.isLableDownloaded = true;
        await order.save();
      }
    }
    res.status(200).json({
      message: "Selected orders sent to downloaded orders successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error sending orders to downloaded orders:", error.message);
    res.status(500).json({
      message: "Error sending orders to downloaded orders:",
      success: false,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  uploadBulkOrder,
  getAllBulkOrders,
  getOrdersForDashboard,
  getClientDashboard,
  updateOrdersStatus,
  downloadLabels,
  uploadSingleLabel,
  updateOrdersStatusFromExcel,
  sendToDownloadedLables,
};
