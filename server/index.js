const mongoUtil = require("./mongoUtil");
const express = require("express");

const path = require("path");
mongoUtil.connect().then((client) => {
  const app = require("./server.js");
  app.listen(process.env.PORT || 5000);
  app.use(express.static(path.join(__dirname, "./client")));
});
