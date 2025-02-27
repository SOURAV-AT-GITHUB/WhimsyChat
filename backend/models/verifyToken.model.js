const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  email:{ type: String, required: true },
  token: { type: String, required: true },
},{versionKey:false});
const VerificationTokenModel = mongoose.model("verification_token",tokenSchema);
module.exports = VerificationTokenModel;
