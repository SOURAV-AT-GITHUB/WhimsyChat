const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_SIGN_IN = process.env.JWT_SECRET_SIGN_IN;
module.exports = async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1] || null;
    if (!token)
      return res.status(401).json({ message: "Please Login first!!" });
    jwt.verify(token, JWT_SECRET_SIGN_IN, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Invalid or expired token, please login again." });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
};
