const Client = require("../models/client");
const Label = require("../models/labels");
const Manifest = require("../models/manifest");
const User = require("../models/user");
const PDFMerger = require("pdf-merger-js");
const fs = require("fs");
const { Order } = require("../models/order");
const { default: mongoose } = require("mongoose");
const createClient = async (req, res) => {
  try {
    const { clientData } = req.body;
    if (
      !clientData.clientName ||
      !clientData.email ||
      !clientData.password ||
      !clientData.phone
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Please provide client Name, email, password and phone.",
        success: false,
      });
    }

    if (
      clientData.walletBalance === undefined ||
      clientData.walletBalance === null ||
      clientData.walletBalance.trim() === ""
    ) {
      clientData.walletBalance = 0;
    } else if (typeof clientData.walletBalance === "string") {
      clientData.walletBalance = parseFloat(clientData.walletBalance);
      if (isNaN(clientData.walletBalance)) {
        return res.status(400).json({
          error: "Invalid wallet balance",
          message: "wallet balance must be a number.",
          success: false,
        });
      }
    }

    const newClient = new Client(clientData);
    const client_data = await newClient.save();
    // console.log("client_data", client_data);
    const userData = {
      email: client_data.email,
      password: client_data.password,
      userType: "client",
      name: client_data.clientName,
      phone: client_data.phone,
      client: client_data._id,
    };
    const newUser = new User(userData);
    await newUser.save();
    res.status(201).json({
      message: "Client created successfully",
      client: newClient,
      success: true,
    });
  } catch (error) {
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.email
    ) {
      // Handle duplicate key error for email field
      res.status(400).json({
        error: "Email already exists",
        message:
          "The provided email is already associated with an existing account.",
        success: false,
      });
    } else {
      // Handle other errors
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

const updateClient = async (req, res) => {
  try {
    const { clientData } = req.body;

    if (!clientData._id) {
      return res.status(400).json({
        error: "Missing _id field",
        message: "Please provide the _id of the client to update.",
      });
    }

    const updateFields = {};

    if (clientData.clientName) updateFields.clientName = clientData.clientName;
    if (clientData.password) updateFields.password = clientData.password;
    if (clientData.phone) updateFields.phone = clientData.phone;
    if (clientData.gstNo) updateFields.gstNo = clientData.gstNo;

    // Update googleAuth if provided
    if (clientData.googleAuth) {
      if (clientData.googleAuth.email)
        updateFields["googleAuth.email"] = clientData.googleAuth.email;
      if (clientData.googleAuth.password)
        updateFields["googleAuth.password"] = clientData.googleAuth.password;
    }

    // Update meeshoAuth if provided
    if (clientData.meeshoAuth) {
      if (clientData.meeshoAuth.email)
        updateFields["meeshoAuth.email"] = clientData.meeshoAuth.email;
      if (clientData.meeshoAuth.password)
        updateFields["meeshoAuth.password"] = clientData.meeshoAuth.password;
    }

    if (clientData.endDate) {
      const endDate = clientData.endDate;

      updateFields.endDate = endDate;
    }

    // Find the client by _id and update it
    const updatedClient = await Client.findByIdAndUpdate(
      clientData._id,
      updateFields
    );

    if (!updatedClient) {
      return res.status(404).json({
        error: "Client not found",
        message: "No client found with the provided _id.",
        success: true,
      });
    }

    res.status(200).json({
      message: "Client updated successfully",
      client: updatedClient,
      success: true,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    // Find the existing Client data
    const existingClientData = await Client.findById(clientId);

    if (!existingClientData) {
      return res.status(404).json({
        message: "Client not found",
        success: false,
      });
    }

    // Remove the Client from the database
    const deletedClient = await Client.findByIdAndDelete(clientId);

    if (!deletedClient) {
      return res.status(400).json({
        message: "Failed to delete Client",
        success: false,
      });
    }

    res.status(200).json({
      message: "Client deleted successfully",
      data: deletedClient,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const getClientDetail = async (req, res) => {
  try {
    const id = req.params.id;
    // prettier-ignore
    if (!id) return res.status(200).json({message: 'Client id not provided',data: null,success: false,})
    // prettier-ignore

    // prettier-ignore
    const doc = await Client.findById( id)
    // prettier-ignore
    if (!doc) return res.status(200).json({ message: error, data: null, success: false })
    // prettier-ignore
    res.status(200).json({ message: 'Client Information ', data: doc, success: true })
  } catch (error) {
    // prettier-ignore
    res.status(200).json({message: error,success: false,})
  }
};

const getAllClients = async (req, res) => {
  try {
    let query = {}; // Define an empty query object

    // Check if clientName query parameter exists
    if (req.query.clientName) {
      query.clientName = { $regex: req.query.clientName, $options: "i" };
    }

    // Check if email query parameter exists
    if (req.query.email) {
      query.email = { $regex: req.query.email, $options: "i" };
    }

    // Check if phone query parameter exists
    if (req.query.phone) {
      query.phone = { $regex: req.query.phone, $options: "i" };
    }

    // Retrieve clients from the database based on the query
    const clients = await Client.find(query).sort({ createdAt: -1 });

    // Check if there are no clients
    if (!clients || clients.length === 0) {
      return res.status(404).json({
        message: "No clients found",
        success: false,
      });
    }

    // Return the list of clients
    res.status(200).json({
      message: "Clients retrieved successfully",
      data: clients,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const getClientsWithSearch = async (req, res) => {
  try {
    const searchStr = req.params.searchStr;

    // Create a regex pattern to search for the search string in clientName or email, phone
    const regexPattern = new RegExp(searchStr, "i");

    // Search for clients matching the search string in clientName or email, phone
    const clients = await Client.find({
      $or: [
        { clientName: { $regex: regexPattern } },
        { email: { $regex: regexPattern } },
        { phone: { $regex: regexPattern } },
      ],
    });

    // Check if there are no matching clients
    if (!clients || clients.length === 0) {
      return res.status(404).json({
        message: "No clients found matching the search criteria",
        success: false,
      });
    }

    // Return the list of matching clients
    res.status(200).json({
      message: "clients retrieved successfully",
      data: clients,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const uploadManifest = async (req, res) => {
  try {
    const file = req.file;
    const client = req.body.clientId;

    const filePath = file.path;
    const fileName = file.originalname;

    const newManifest = new Manifest({
      client,
      filePath,
      fileName,
    });

    await newManifest.save();

    res
      .status(200)
      .json({ message: "Manifest created successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const getAllManifest = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { clientId, page, limit, from, to } = req.query;

    // Construct filter object
    const filter = {};

    const conditionArray = [];

    if (clientId) {
      conditionArray.push({ client: clientId });
    }

    if (from && to) {
      // Convert 'from' and 'to' strings to Date objects
      const fromDate = new Date(from);
      const toDate = new Date(to);

      toDate.setDate(toDate.getDate() + 1);

      // Add date range filter
      conditionArray.push({
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      });
    }

    // Combine conditions using $and operator
    if (conditionArray.length > 0) {
      filter.$and = conditionArray;
    }

    // Pagination parameters
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Fetch manifest with pagination and filters
    const manifest = await Manifest.find(filter)
      .sort({ createdAt: -1 })
      .populate("client")
      .skip(skip)
      .limit(pageSize);

    // Check if there are no manifest documents
    if (!manifest || manifest.length === 0) {
      return res.status(200).json({
        message: "No manifest found",
        success: true,
      });
    }

    // Count total number of manifest documents (for pagination)
    const totalManifests = await Manifest.countDocuments(filter);

    // Return the list of manifest documents
    res.status(200).json({
      message: "Manifest retrieved successfully",
      data: manifest,
      success: true,
      currentPage: pageNumber,
      totalManifests,
      totalPages: Math.ceil(totalManifests / pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const downloadManifest = async (req, res) => {
  try {
    const { ids } = req.body;
    let mergedPdfPath = [];
    var merger = new PDFMerger();

    for (const manifestId of ids) {
      const manifest = await Manifest.findById(manifestId);
      if (!manifest) {
        throw new Error(`Manifest with ID ${manifestId} not found`);
      }

      if (manifest.filePath && manifest.fileName) {
        const filePath = manifest.filePath;
        mergedPdfPath.push(filePath);
        // here update the isLableDownloaded to true in that manifest
        manifest.isDownloaded = true;
        await manifest.save();
      }
    }

    for (const path of mergedPdfPath) {
      await merger.add(path);
    }

    // Save the merged PDF to a temporary file
    const tempMergedPdfPath = "manifests.pdf";
    await merger.save(tempMergedPdfPath);

    // Set response headers for downloading
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=manifests.pdf`);

    // Send the merged PDF file to the client
    res.sendFile(tempMergedPdfPath, { root: "." });
  } catch (error) {
    console.error("Error downloading manifests:", error.message);
    res.status(500).json({ message: error.message, success: false });
  }
};

const uploadLabels = async (req, res) => {
  try {
    const file = req.file;
    const client = req.body.clientId;

    const filePath = file.path;
    const fileName = file.originalname;

    const newLabel = new Label({
      client,
      filePath,
      fileName,
    });

    await newLabel.save();

    res
      .status(200)
      .json({ message: "Label Uploaded successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const getAllLabels = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { clientId, page, limit, from, to } = req.query;

    // Construct filter object
    // Construct filter object
    const filter = {};

    const conditionArray = [];

    if (clientId) {
      conditionArray.push({ client: clientId });
    }

    if (from && to) {
      // Convert 'from' and 'to' strings to Date objects
      const fromDate = new Date(from);
      const toDate = new Date(to);

      toDate.setDate(toDate.getDate() + 1);

      // Add date range filter
      conditionArray.push({
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      });
    }

    // Combine conditions using $and operator
    if (conditionArray.length > 0) {
      filter.$and = conditionArray;
    }

    // Pagination parameters
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Fetch label with pagination and filters
    const labels = await Label.find(filter)
      .sort({ createdAt: -1 })
      .populate("client")
      .skip(skip)
      .limit(pageSize);

    // Check if there are no labels documents
    if (!labels || labels.length === 0) {
      return res.status(200).json({
        message: "No label found",
        success: true,
      });
    }

    // Count total number of label documents (for pagination)
    const totalLabels = await Label.countDocuments(filter);

    // Return the list of label documents
    res.status(200).json({
      message: "Labels retrieved successfully",
      data: labels,
      success: true,
      currentPage: pageNumber,
      totalLabels,
      totalPages: Math.ceil(totalLabels / pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const downloadLabels = async (req, res) => {
  try {
    const { ids, selectAll } = req.body;

    let mergedPdfPath = [];
    var merger = new PDFMerger();

    // Define the query object based on selectAll flag
    const query = selectAll ? { _id: { $nin: ids } } : { _id: { $in: ids } };

    const label1 = await Label.find(query)
      .sort({ createdAt: -1 })
      .populate("client");

    console.log(label1);

    const labels = label1.filter((o) => o.filePath && o.fileName);

    if (labels.length > 0) {
      for (const label of labels) {
        const labelPath = label.filePath;
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

          for (const label of labels) {
            if (label.isDownloaded === false) {
              const filter = {};
              label.isDownloaded = true;

              const client_id = label.client._id;

              if (client_id) {
                filter.$and = [
                  {
                    $or: [
                      { clientId: client_id },
                      { "client._id": client_id },
                      { client: client_id },
                    ],
                  },
                ];
              }
              const labelUploadedDate = label.createdAt;

              filter.$and.push({
                createdAt: {
                  $lte: labelUploadedDate,
                },
              });
              filter.$and.push({ isLableDownloaded: false });

              const pendingOrders = await Order.find(filter);
              console.log(pendingOrders.length);
              console.log(pendingOrders);

              if (pendingOrders.length > 0) {
                for (const order of pendingOrders) {
                  order.isLableDownloaded = true;
                  await order.save();
                }

                await label.save();
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
module.exports = {
  createClient,
  updateClient,
  removeClient,
  getClientDetail,
  getAllClients,
  getClientsWithSearch,
  uploadManifest,
  getAllManifest,
  downloadManifest,
  uploadLabels,
  getAllLabels,
  downloadLabels,
};
