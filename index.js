// const express = require("express");
// require('dotenv').config();
// const cors = require("cors");
// const http = require("http");
// const multer = require('multer');
// const fs = require('fs');
// const app = express();
// const server = http.createServer(app);
// const bodyParser = require("body-parser");

// const port = process.env.PORT
// const masterRoute = require('./router')
// app.use(express.json());
// app.use("/", masterRoute);
// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });

const express = require("express");
require("dotenv").config();
const path = require("path");
const { makan } = require("./makanController");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/makan", makan);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Akses dari device lain: http://<IP_RASPI>:${port}`);
});
