const mongoUtil = require("./mongoUtil");
const express = require("express");

const path = require("path");

mongoUtil.connect().then((client) => {
  const app = require("./server.js");
  app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
  app.listen(process.env.PORT || 5000);
});
