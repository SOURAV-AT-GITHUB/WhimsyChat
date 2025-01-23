const express = require("express");
const UserModel = require("../models/user.model");
const ContactsModel = require("../models/contacts.model")
const VerificationTokenModel = require("../models/verifyToken.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendVerificationMail = require("../config/nodemailer.config");

const userRouter = express.Router();
const JWT_SECRET_VERIFICATION_TOKEN = process.env.JWT_SECRET_VERIFICATION_TOKEN;
const JWT_SECRET_SIGN_IN = process.env.JWT_SECRET_SIGN_IN
userRouter.post("/find-user", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .json({ message: "Please provide valid email address." });
  try {
    const user = await UserModel.findOne({ email });
    if (!user)
      return res.json({
        message: "User does not exist",
        exist: false,
        verified: null,
      });
    else {
      if (!user.verified)
        return res.json({
          message: "User not verified",
          exist: true,
          verified: false,
        });
      else
        return res.json({ message: "User exist", exist: true, verified: true });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error, please try again." });
  }
});
userRouter.post("/find-username", async (req, res) => {
  const { username } = req.body || { username: null };
  if (!username)
    return res
      .status(400)
      .json({ message: "Please provide valid username address." });
  try {
    const user = await UserModel.findOne({ username });
    if (!user)
      return res.json({ message: "Username available", available: true });
    return res.json({ message: "Username already taken", available: false });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error, please try again." });
  }
});

userRouter.post("/signup", async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      
      findByEmail,
      first_name,
      last_name,
    } = req.body;
    if (!email || !username || !password )
      return res.status(400).json({ message: "Invalid request body" });
    const user = await UserModel.findOne({ email });
    if (user)
      return res.status(409).json({ message: "User already registered" });
    const hash = bcrypt.hashSync(password, 5);
    const newUser = new UserModel({
      email,
      username,
      findByEmail,
      password: hash,
      first_name,
      last_name,
      verified: false,
    });
    const userContacts = new ContactsModel({username,contacts:[]})
    await newUser.save();
    await userContacts.save()
    const token = jwt.sign(
      { email, username, id: newUser._id },
      JWT_SECRET_VERIFICATION_TOKEN,
      { expiresIn: "1d" }
    );
    const verificationToken = new VerificationTokenModel({ token, email });
    await verificationToken.save();
    const response = await sendVerificationMail(email, token);
    return res
      .status(201)
      .json({ message: "Sign up success, please verify your email." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});
userRouter.post("/verify-email/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const findToken = await VerificationTokenModel.findOne({ token });
    if (!findToken) {
      return res.json({ message: "Invalid Token", state: { isError: true } });
    } else {
      try {
        jwt.verify(
          findToken.token,
          JWT_SECRET_VERIFICATION_TOKEN,
          async (err, decoded) => {
            if (err) {
              if (err.name === "TokenExpiredError") {
                const decoded = jwt.decode(token);
                return res
                  .status(401)
                  .json({
                    message: "Token Expired",
                    data: decoded,
                    state: { isExpired: true },
                  });
              } else {
                return res
                  .status(401)
                  .json({ message: "Invalid Token", state: { isError: true } });
              }
            } else {
              try {
                await UserModel.findByIdAndUpdate(decoded.id, {
                  verified: true,
                });
                await VerificationTokenModel.findByIdAndDelete(findToken._id);
                return res.json({
                  message: "User verified",
                  state: { isVerified: true },
                });
              } catch (error) {
                return res
                  .status(500)
                  .json({ message: error.message, state: { isError: true } });
              }
            }
          }
        );
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
  } catch (error) {}
});
userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Invalid request body" });
  else {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      } else if (!user.verified) {
        return res.status(401).json({ message: "User is not verified" });
      } else {
        bcrypt.compare(password, user.password, async (err, match) => {
          if (err) return res.status(500).json({ message: err.message });
          else if (!match)
            return res.status(401).json({ message: "Incorrect password" });
          const token = jwt.sign({
            id: user._id,
            username: user.username,
            email,
          },JWT_SECRET_SIGN_IN,{expiresIn:"1d"});
          return res.json({
            message: "Login success",
            data: {
              email,
              token,
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name,
            },
          });
        });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
});
module.exports = userRouter;
