const express = require("express");
const router = express.Router();
const authJWT = require("../middleware/authJWT");
const { loginUser } = require("../controllers/users");

router.route("/login").post(loginUser);

module.exports = router;
