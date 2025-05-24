const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { connectSocket } = require("./socket");
require("./command/schedule");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
  const route = require(path.join(routesPath, file));
  app.use("/api", route);
});

connectSocket();

app.listen(PORT, () => {
  console.log(`📡 API berjalan di http://localhost:${PORT}`);
});
