const express = require("express");
const router = express.Router();
const authJWT = require("../middleware/authJWT");
const {
  createProduct,
  createProductFileUrl,
  updateProduct,
  removeProduct,
  getProductDetail,
  getProductsWithSearch,
  getAllProducts,
  createMasterSKU,
  getAllMasterSKUs,
  updateMasterSKU,
  bulkUploadProducts,
  exportProductsToExcel,
  bulkUploadMasterSKU,
  exportMasterSKUsToExcel,
} = require("../controllers/products");

router.route("/add").post(authJWT, createProduct);
router.route("/bulk-upload").post(authJWT, bulkUploadProducts);
router.route("/export-products").get(authJWT, exportProductsToExcel);
router.route("/bulk-upload-master-sku").post(authJWT, bulkUploadMasterSKU);
router.route("/export-master-sku").get(authJWT, exportMasterSKUsToExcel);
router.route("/upload/add").post(authJWT, createProductFileUrl);
router.route("/update").post(authJWT, updateProduct);
router.route("/remove/:id").delete(authJWT, removeProduct);
router.route("/detail/:productSKU? ").get(authJWT, getProductDetail);
router.route("/search/:searchStr").get(authJWT, getProductsWithSearch);
router.route("/selected/all").get(authJWT, getAllProducts);
router.route("/add/master-sku").post(authJWT, createMasterSKU);
router.route("/get/master-sku").get(authJWT, getAllMasterSKUs);
router.route("/update/master-sku").post(authJWT, updateMasterSKU);

module.exports = router;
