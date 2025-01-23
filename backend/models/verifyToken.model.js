const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  email:{ type: String, required: true },
  token: { type: String, required: true },
});
const VerificationTokenModel = mongoose.model("verification_token",tokenSchema);
module.exports = VerificationTokenModel;
