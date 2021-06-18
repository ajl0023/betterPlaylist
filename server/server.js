const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();

const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
app.use(cookieParser());
app.use(express.json());
let db;
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
require("./routes")(app);

module.exports = app;
