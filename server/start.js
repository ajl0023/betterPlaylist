const mongoUtil = require("./mongoUtil");
mongoUtil.connect().then((client) => {
  console.log(client, 50);
  const app = require("./index.js");
  app.listen(process.env.PORT || 5000);
});
