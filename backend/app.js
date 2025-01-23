const express = require("express");

const cors = require("cors");
const userRouter = require("./routes/user.route");
const app = express();
app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.get("/", (req, res) => {
  res.send({ message: "Server running fine!!" });
});

module.exports = app