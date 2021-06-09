const mongoUtil = require("./mongoUtil");
mongoUtil.connect().then((client) => {
  const app = require("./server.js");
  app.listen(process.env.PORT || 5000);
  app.use(express.static(path.join(__dirname, "./client")));
});
