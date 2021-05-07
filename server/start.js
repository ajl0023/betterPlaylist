const mongoUtil = require("./mongoUtil");
mongoUtil.connect().then((client) => {
  const app = require("./index.js");
  app.listen(process.env.PORT || 5000, function () {});
});
