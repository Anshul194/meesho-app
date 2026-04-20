const express = require("express");
const router = express.Router();
const shippingCtrl = require("../controllers/shippingMethod");
const authJWT = require("../middleware/authJWT");

router.post("/", authJWT, shippingCtrl.createShippingMethod);
router.get("/", authJWT, shippingCtrl.getAllShippingMethods);
router.put("/:id", authJWT, shippingCtrl.updateShippingMethod);
router.delete("/:id", authJWT, shippingCtrl.deleteShippingMethod);

module.exports = router;
