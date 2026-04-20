const express = require("express");
const router = express.Router();
const authJWT = require("../middleware/authJWT");
const {
  createPaymentRequest,
  getAllTransactions,
  createWalletUpdateTransaction,
  updateTransactionStatus,
} = require("../controllers/transactions");
const upload = require("../middleware/upload");

router
  .route("/add")
  .post(authJWT, upload.single("screenshot"), createPaymentRequest);
router.route("/add-wallet-update").post(authJWT, createWalletUpdateTransaction);
router
  .route(
    "/all/:clientId?/:t_type?/:page?/:limit?/:dateFrom?/:dateTo?/:searchKey?/:searchValue?"
  )
  .get(authJWT, getAllTransactions);
router.route("/update").post(authJWT, updateTransactionStatus);
// router.route("/raid").get( raid);
module.exports = router;
