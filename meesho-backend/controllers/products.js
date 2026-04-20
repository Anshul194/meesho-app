require("express");

const Product = require("../models/product");
const upload = require("../middleware/upload");
const multer = require("multer");
require("dotenv").config();
const fs = require("fs");
const ProductFileURL = require("../models/productFileUrl");
const MasterSKU = require("../models/masterSKU");
const xlsx = require("xlsx");
const uploadImageMiddleware = upload.single("image");
const uploadExcelMiddleware = upload.single("excelFile");
const uploadBulkExcelMiddleware = upload.single("excelFile");
const path = require("path");
const axios = require("axios");

const createProduct = async (req, res) => {
  try {
    uploadImageMiddleware(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res
          .status(400)
          .json({ message: "File upload error", success: false });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(500).json({ message: err.message, success: false });
      }

      const productName = req.body.productName;
      const productSKU = req.body.productSKU;

      const file = req.file;
      const masterSKU = req.body.masterSKU;

      if (!productName || !productSKU || !masterSKU) {
        if (file) {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
        return res.status(400).json({
          message: "Product Data Incomplete",
          data: null,
          success: false,
        });
      }
      // if (!file) {
      //   return res.status(400).json({
      //     message: "Image is required",
      //     success: false,
      //   });
      // }
      const masterSKUDoc = await MasterSKU.findOne({ masterSKU });
      let newProduct = {
        productName: productName,
        productSKU: productSKU,
        fileName: "",
        filePath: "",
        masterSKU: masterSKUDoc,
      };

      if (file) {
        newProduct.fileName = file.filename;
        newProduct.filePath = file.path;
      }

      try {
        // Check if productSKU already exists
        const existingProduct = await Product.findOne({
          productSKU: productSKU,
        });
        if (existingProduct) {
          if (file) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          }

          return res.status(400).json({
            message: "Product SKU already exists",
            data: null,
            success: false,
          });
        }

        const doc = await Product.create(newProduct);

        if (!doc) {
          return res.status(400).json({
            message: "Failed to create product",
            data: null,
            success: false,
          });
        } else {
          // push that productSKU to productSKUs array in masterSKU documents
          const masterSKU1 = await MasterSKU.findOne({ masterSKU });
          masterSKU1.productSKUs.push(doc._id);
          await masterSKU1.save();
          res.status(200).json({
            message: "Product Added Successfully",
            data: doc,
            success: true,
          });
        }
      } catch (error) {
        res.status(500).json({ message: error.message, success: false });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const updateProduct = async (req, res) => {
  try {
    // Use the middleware
    uploadImageMiddleware(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ message: "File upload error", success: false });
      } else if (err) {
        return res.status(500).json({ message: err.message, success: false });
      }

      const productId = req.body._id;
      const productName = req.body.productName;
      const masterSKU = JSON.parse(req.body.masterSKU).masterSKU;
      const productSKU = req.body.productSKU;
      const file = req.file;

      try {
        let updatedProduct = {
          productName: productName,
          productSKU: productSKU,
        };

        const existingProductData = await Product.findById(productId);
        if (!existingProductData) {
          return res.status(404).json({
            message: "Product not found",
            success: false,
          });
        }

        if (file) {
          if (existingProductData.fileName && existingProductData.filePath) {
            if (fs.existsSync(existingProductData.filePath))
              fs.unlinkSync(existingProductData.filePath);
          }

          updatedProduct.fileName = file.filename;
          updatedProduct.filePath = file.path;
        } else {
          updatedProduct.fileName = existingProductData.fileName;
          updatedProduct.filePath = existingProductData.filePath;
        }

        const existingMasterSKU = await MasterSKU.findById(
          existingProductData.masterSKU
        );

        const oldMasterSKU = existingProductData.masterSKU;
        const newMasterSKU = masterSKU;

        if (existingMasterSKU.masterSKU !== newMasterSKU) {
          // removing _id from mastersku
          await MasterSKU.findOneAndUpdate(
            { _id: oldMasterSKU },
            { $pull: { productSKUs: existingProductData._id } }
          );

          const updatedDoc = await Product.findById(productId);

          updatedDoc.productName = updatedProduct.productName;
          updatedDoc.productSKU = updatedProduct.productSKU;
          updatedDoc.fileName = updatedProduct.fileName;
          updatedDoc.filePath = updatedProduct.filePath;

          await updatedDoc.save();

          const newMasterSKUID = await MasterSKU.findOneAndUpdate(
            { masterSKU: newMasterSKU },
            { $push: { productSKUs: updatedDoc._id } }
          );

          updatedDoc.masterSKU = newMasterSKUID._id;
          await updatedDoc.save();
          if (!updatedDoc) {
            return res.status(400).json({
              message: "Failed to update product",
              data: null,
              success: false,
            });
          }

          res.status(200).json({
            message: "Product Updated Successfully",
            success: true,
          });
        } else {
          const updatedDoc = await Product.findById(productId);

          updatedDoc.productName = updatedProduct.productName;
          updatedDoc.productSKU = updatedProduct.productSKU;
          updatedDoc.fileName = updatedProduct.fileName;
          updatedDoc.filePath = updatedProduct.filePath;
          await updatedDoc.save();

          if (!updatedDoc) {
            return res.status(400).json({
              message: "Failed to update product",
              data: null,
              success: false,
            });
          }

          res.status(200).json({
            message: "Product Updated Successfully",
            success: true,
          });
        }
      } catch (error) {
        res.status(500).json({ message: error.message, success: false });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const removeProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the existing product data
    const existingProductData = await Product.findById(productId);

    if (!existingProductData) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    // Delete the product's image file if it exists
    if (existingProductData.fileName && existingProductData.filePath) {
      if (fs.existsSync(existingProductData.filePath))
        fs.unlinkSync(existingProductData.filePath);
    }

    // Remove the product from the database
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(400).json({
        message: "Failed to delete product",
        success: false,
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      data: deletedProduct,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const productSKU = req.query.productSKU; // Extract productSKU from query string
    // prettier-ignore
    if (!productSKU) return res.status(200).json({ message: 'Product SKU not provided', data: null, success: false });

    // Find products based on the productSKU
    const docs = await Product.find({ productSKU: productSKU });

    // prettier-ignore
    if (!docs || docs.length === 0) return res.status(200).json({ message: 'Product not found', data: null, success: false });

    res
      .status(200)
      .json({ message: "Product Information", data: docs, success: true });
  } catch (error) {
    // prettier-ignore
    res.status(500).json({ message: 'Internal Server Error', error: error.message, success: false });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // Retrieve all products from the database
    const products = await Product.find()
      .populate("masterSKU")
      .sort({ createdAt: -1 });

    // Check if there are no products
    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
        success: false,
      });
    }

    // Return the list of products
    res.status(200).json({
      message: "Products retrieved successfully",
      data: products,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const getProductsWithSearch = async (req, res) => {
  try {
    const searchStr = req.params.searchStr;

    // Create a regex pattern to search for the search string in productName and productSKU
    const regexPattern = new RegExp(searchStr, "i");

    // Search for products matching the search string in productName or productSKU
    const products = await Product.find({
      $or: [
        { productName: { $regex: regexPattern } },
        { productSKU: { $regex: regexPattern } },
      ],
    });

    // Check if there are no matching products
    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found matching the search criteria",
        success: false,
      });
    }

    // Return the list of matching products
    res.status(200).json({
      message: "Products retrieved successfully",
      data: products,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const createProductFileUrl = async (req, res) => {
  try {
    uploadExcelMiddleware(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ message: "File upload error", success: false });
      } else if (err) {
        return res.status(500).json({ message: err.message, success: false });
      }

      const file = req.file;

      let newProductFileUrl = {
        // googleDriveURL: req.body.googleDriveURL,
        // fileName: "",
        // filePath: "",
      };

      if (file) {
        newProductFileUrl.fileName = file.originalname;
        newProductFileUrl.filePath = file.path;
      }
      if (req.body.googleDriveURL) {
        newProductFileUrl.googleDriveURL = req.body.googleDriveURL;
      }

      try {
        // Check if productFileUrlId already exists
        const existingProduct = await ProductFileURL.findOne({
          productFileUrlId: "NEX001",
        });
        if (existingProduct) {
          if (file) {
            if (fs.existsSync(existingProduct.filePath)) {
              fs.unlinkSync(existingProduct.filePath);
            }
            existingProduct.fileName = newProductFileUrl.fileName;
            existingProduct.filePath = newProductFileUrl.filePath;
          }

          if (newProductFileUrl.googleDriveURL) {
            existingProduct.googleDriveURL = newProductFileUrl.googleDriveURL;
            existingProduct.fileName = existingProduct.fileName;
            existingProduct.filePath = existingProduct.filePath;
          }
          await existingProduct.save();

          // Delete the uploaded file if it exists

          return res.status(200).json({
            message: "Latest Product File Updated Successfully",
            data: existingProduct,
            success: true,
          });
        }

        const doc = await ProductFileURL.create(newProductFileUrl);

        if (!doc) {
          // Delete the uploaded file if product creation failed
          if (file) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          }
          return res.status(400).json({
            message: "Failed to create product file URL",
            data: null,
            success: false,
          });
        }

        res.status(200).json({
          message: "Product File Added Successfully",
          data: doc,
          success: true,
        });
      } catch (error) {
        res.status(500).json({ message: error.message, success: false });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const createMasterSKU = async (req, res) => {
  const { masterSKU, price } = req.body;
  try {
    // Check if the masterSKU already exists
    const existingMasterSKU = await MasterSKU.findOne({ masterSKU });

    if (existingMasterSKU) {
      return res.status(400).json({
        message: "Master SKU already exists",
        success: false,
      });
    }

    // Create a new master SKU document
    const newMasterSKU = await MasterSKU.create({ masterSKU, price });

    // Respond with success message and created data
    return res.status(200).json({
      message: "Master SKU Created Successfully",
      data: newMasterSKU,
      success: true,
    });
  } catch (error) {
    // Handle any errors during the creation process
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const updateMasterSKU = async (req, res) => {
  const { masterSKU, price, _id } = req.body;

  try {
    // Find the masterSKU document to update
    const existingMasterSKU = await MasterSKU.findById({ _id });

    if (!existingMasterSKU) {
      return res.status(404).json({
        message: "Master SKU not found",
        success: false,
      });
    }

    // Update the price if it's provided
    if (price !== undefined) {
      existingMasterSKU.price = price;
    }
    if (masterSKU !== undefined) {
      existingMasterSKU.masterSKU = masterSKU;
    }

    // Save the updated masterSKU document
    await existingMasterSKU.save();

    // Respond with success message and updated data
    return res.status(200).json({
      message: "Master SKU Updated Successfully",
      data: existingMasterSKU,
      success: true,
    });
  } catch (error) {
    // Handle any errors during the update process
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getAllMasterSKUs = async (req, res) => {
  try {
    // Fetch all master SKUs from the database
    const masterSKUs = await MasterSKU.find().sort({ createdAt: -1 });

    // Return the fetched master SKUs
    return res.status(200).json({
      message: "All Master SKUs fetched successfully",
      data: masterSKUs,
      success: true,
    });
  } catch (error) {
    // Handle any errors during the fetching process
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const downloadImage = async (url, filename) => {
  const filePath = path.join("uploads/", filename);
  const writer = fs.createWriteStream(filePath);
  const response = await axios({ url, method: "GET", responseType: "stream" });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve({ filePath, filename }));
    writer.on("error", reject);
  });
};

const bulkUploadProducts = async (req, res) => {
  try {
    uploadBulkExcelMiddleware(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ message: "File upload error", success: false });
      } else if (err) {
        return res.status(500).json({ message: err.message, success: false });
      }

      const file = req.file;
      if (!file) {
        return res
          .status(400)
          .json({ message: "No file uploaded", success: false });
      }

      try {
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (data.length === 0) {
          return res
            .status(400)
            .json({ message: "Uploaded file is empty", success: false });
        }

        const finalProducts = [];

        for (const item of data) {
          if (!item.productName || !item.productSKU || !item.masterSKU) {
            continue; // skip invalid rows
          }

          // 1. Handle masterSKU check or create
          let master = await MasterSKU.findOne({ masterSKU: item.masterSKU });

          if (!master) {
            master = await MasterSKU.create({
              masterSKU: item.masterSKU,
              price: item.price || 0,
              productSKUs: [item.productSKU],
            });
          } else {
            if (!master.productSKUs.includes(item.productSKU)) {
              master.productSKUs.push(item.productSKU);
              await master.save();
            }
          }

          // 2. Handle image download
          let imageDetails = { fileName: "", filePath: "" };
          if (item.image) {
            const imageExtension = path.extname(item.image).split("?")[0]; // remove URL params
            const imageName = `${Date.now()}-${
              item.productSKU
            }${imageExtension}`;
            try {
              imageDetails = await downloadImage(item.image, imageName);
            } catch (imgErr) {
              console.error(
                `Image download failed for SKU ${item.productSKU}`,
                imgErr.message
              );
            }
          }

          // 3. Build product object
          const productObj = {
            productName: item.productName,
            productSKU: item.productSKU,
            masterSKU: master._id,
            fileName: imageDetails.filePath.replace(/^uploads[\\/]/, ""),
            filePath: imageDetails.filePath,
          };

          finalProducts.push(productObj);
        }

        // 4. Insert into DB
        const inserted = await Product.insertMany(finalProducts);

        fs.unlinkSync(file.path); // Clean up uploaded Excel file

        return res.status(200).json({
          message: "Products uploaded successfully",
          data: inserted,
          success: true,
        });
      } catch (error) {
        fs.existsSync(file.path) && fs.unlinkSync(file.path);
        console.error(error);
        return res.status(500).json({ message: error.message, success: false });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const exportProductsToExcel = async (req, res) => {
  try {
    const products = await Product.find().populate("masterSKU"); // if you want masterSKU details

    const data = products.map((product) => ({
      productName: product.productName,
      productSKU: product.productSKU,
      masterSKU: product.masterSKU?.masterSKU || "", // adjust based on schema
      fileName: product.fileName,
      filePath: product.filePath,
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Products");

    const exportDir = path.join(__dirname, "../exports");

    // ✅ Create directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, "products.xlsx");

    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "products.xlsx");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

const bulkUploadMasterSKU = async (req, res) => {
  try {
    uploadBulkExcelMiddleware(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ message: "File upload error", success: false });
      } else if (err) {
        return res.status(500).json({ message: err.message, success: false });
      }

      const file = req.file;
      if (!file) {
        return res
          .status(400)
          .json({ message: "No file uploaded", success: false });
      }

      try {
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!data || data.length === 0) {
          return res
            .status(400)
            .json({ message: "Uploaded file is empty", success: false });
        }

        const insertedMasters = [];

        for (const row of data) {
          if (!row.masterSKU || !row.productSKU) continue;

          const masterSKU = String(row.masterSKU).trim();
          const skus = String(row.productSKU)
            .split(",")
            .map((sku) => sku.trim());

          const products = await Product.find({
            productSKU: { $in: skus.map((sku) => new RegExp(sku, "i")) },
          });

          const productIds = products.map((p) => p._id);

          let master = await MasterSKU.findOne({ masterSKU });

          if (!master) {
            master = await MasterSKU.create({
              masterSKU,
              price: row.price || 0,
              productSKUs: productIds,
            });
          } else {
            if (row.price) master.price = row.price;

            const uniqueIds = [
              ...new Set([
                ...master.productSKUs.map(String),
                ...productIds.map(String),
              ]),
            ];
            master.productSKUs = uniqueIds;

            await master.save();
          }

          insertedMasters.push(master);
        }

        fs.unlinkSync(file.path);

        return res.status(200).json({
          message: "MasterSKUs uploaded successfully",
          data: insertedMasters,
          success: true,
        });
      } catch (error) {
        fs.existsSync(file.path) && fs.unlinkSync(file.path);
        console.error(error);
        return res.status(500).json({ message: error.message, success: false });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const exportMasterSKUsToExcel = async (req, res) => {
  try {
    const masters = await MasterSKU.find();

    const data = masters.map((master) => ({
      masterSKU: master.masterSKU,
      price: master.price,
      productSKUs: master.productSKUs.join(", "),
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "MasterSKUs");

    const exportDir = path.join(__dirname, "../exports");

    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, "masterSKUs.xlsx");
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "masterSKUs.xlsx");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = {
  createProduct,
  createProductFileUrl,
  updateProduct,
  removeProduct,
  getProductDetail,
  getAllProducts,
  getProductsWithSearch,
  createMasterSKU,
  updateMasterSKU,
  getAllMasterSKUs,
  bulkUploadProducts,
  exportProductsToExcel,
  bulkUploadMasterSKU,
  exportMasterSKUsToExcel,
};
