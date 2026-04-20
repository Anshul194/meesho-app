const jwt = require("jsonwebtoken");

const authJWT = async (req, res, next) => {
  const bearerToken = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["authorization"];

  if (!bearerToken) return res.status(403).send({ success: false, message: "No token provided." });
  else {
    try {
      const token = bearerToken;
      // console.log("token", token);
      const verifiedToken = jwt.verify(token, process.env.SECRET);
      const decoded = jwt.decode(token, { complete: true });
      req.doc = decoded.payload;
      const newtoken = jwt.sign({ ...req.doc, create_time: new Date() }, process.env.SECRET);
      res.set("token", newtoken);
      next();
    } catch (error) {
      return res.status(403).json({ success: false, message: "Fail to authenticate token." });
    }
  }
};

module.exports = authJWT;