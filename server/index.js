const express         = require("express");
const cookieParser    = require("cookie-parser");
const path            = require("path");
const app             = express();
const { MongoClient } = require("mongodb");
const { ObjectId }    = require("mongodb");
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));
let db;
require("./routes")(app);
module.exports = app;
