const express = require("express");
const router = express.Router();
const authJWT = require("../middleware/authJWT");
const {
  createOrder,
  getAllOrders,
  uploadBulkOrder,
  getAllBulkOrders,
  getOrdersForDashboard,
  getClientDashboard,
  updateOrdersStatus,
  updateShippingInfo,
  downloadLabels,

  uploadSingleLabel,
  updateOrdersStatusFromExcel,
  updateShippingInfoFromExcel,
  sendToDownloadedLables,
} = require("../controllers/orders");
const upload = require("../middleware/upload");

router.route("/add").post(
  authJWT,
  upload.fields([
    { name: "label", maxCount: 1 },
    { name: "shippinglabel", maxCount: 1 },
  ]),
  createOrder
);
router
  .route("/upload-label")
  .post(authJWT, upload.single("label"), uploadSingleLabel);
router.route("/downloadLabels").post(authJWT, downloadLabels);
router.route("/sendToDownloadedLables").post(authJWT, sendToDownloadedLables);

router
  .route(
    "/selected/all/:clientId?/:orderNumber?/:status?/:page?/:limit?/:from?/:to?/:isLableDownloaded?"
  )
  .get(getAllOrders);
router
  .route("/uploadBulkOrder")
  .post(authJWT, upload.single("bulkOrder"), uploadBulkOrder);
router
  .route("/bulkOrder/all/:clientId?/:from?/:to?")
  .get(authJWT, getAllBulkOrders);

router.route("/dashboard").get(authJWT, getOrdersForDashboard);
router.route("/client-dashboard/:id").get(authJWT, getClientDashboard);
router.route("/update").post(authJWT, updateOrdersStatus);
router
  .route("/update/excel")
  .post(authJWT, upload.single("order-excel"), updateOrdersStatusFromExcel);
router.route("/update-shipping-info").post(authJWT, upload.single('trackingLabel'), updateShippingInfo);
router
  .route("/update-shipping-info/excel")
  .post(authJWT, upload.single("tracking-excel"), updateShippingInfoFromExcel);
module.exports = router;
