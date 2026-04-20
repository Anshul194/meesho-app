const express = require("express");
const router = express.Router();
const authJWT = require("../middleware/authJWT");
const {
  createClient,
  updateClient,
  removeClient,
  getClientDetail,
  getClientsWithSearch,
  getAllClients,
  uploadManifest,
  getAllManifest,
  downloadManifest,
  uploadLabels,
  getAllLabels,
  downloadLabels,
} = require("../controllers/clients");
const upload = require("../middleware/upload");

router.route("/add").post(authJWT, createClient);
router.route("/update").post(authJWT, updateClient);
router.route("/remove/:id").delete(authJWT, removeClient);
router.route("/:id").get(authJWT, getClientDetail);
router.route("/update/:id").post(authJWT, updateClient);
router.route("/search/:searchStr").get(authJWT, getClientsWithSearch);
router.route("/selected/all/:clientName?/:email?/:phone?").get(authJWT, getAllClients);
router
  .route("/uploadManifest")
  .post(authJWT, upload.single("manifest"), uploadManifest);
router
  .route("/manifest/all/:clientId?/:from?/:to?/:page?/:limit?")
  .get(authJWT, getAllManifest);
  router.route("/downloadManifest").post(authJWT, downloadManifest);

  router
  .route("/uploadLabels")
  .post(authJWT, upload.single("labels"), uploadLabels);
router
  .route("/labels/all/:clientId?/:from?/:to?/:page?/:limit?")
  .get(authJWT, getAllLabels);
  router.route("/downloadLabels").post(authJWT, downloadLabels);
module.exports = router;
