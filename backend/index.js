const http = require("http")
require("dotenv").config();
const databaseConnction = require("./config/mongodb.connection");
const app = require ("./app")
const setupSocket = require("./config/socket.config")

const PORT = process.env.PORT || 3000;

const server = http.createServer(app)
setupSocket(server)


server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await databaseConnction
    console.log(`Database connected`)
  } catch (error) {
    console.log(error.message);
  }
});


