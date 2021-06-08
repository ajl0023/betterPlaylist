const mongoUtil = require("./mongoUtil");
mongoUtil.connect().then((client) => {
  const app = require("./server.js");
  app.listen(process.env.PORT || 5000);
});
