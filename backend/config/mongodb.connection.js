const mongoose = require('mongoose')
require("dotenv").config()
const DATABASE_URL = process.env.DATABASE_URL
const databaseConnction = mongoose.connect(DATABASE_URL)
module.exports = databaseConnction