const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "insightos_super_secret_key_change_in_prod";

module.exports.signToken = (userId) =>
  jwt.sign({ id: userId }, SECRET, { expiresIn: "7d" });

module.exports.verifyToken = (token) =>
  jwt.verify(token, SECRET);
